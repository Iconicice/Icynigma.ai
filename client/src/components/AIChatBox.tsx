import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CircleAlert, Mic, MicOff, Radio, Send, Sparkles, User } from "lucide-react";
import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { TTSPlayer } from "./TTSPlayer";
import { TypingIndicator } from "./TypingIndicator";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import type { TTSProviderOption, VoiceInputProviderOption } from "@/lib/settings";
import { canUseLiveVoice, getLiveVoiceStatus, type LiveVoicePhase } from "@/lib/liveVoice";

const Streamdown = lazy(() => import("streamdown").then((module) => ({ default: module.Streamdown })));

export type Message = { role: "system" | "user" | "assistant"; content: string };

export type AIChatBoxProps = {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  height?: string | number;
  emptyStateMessage?: string;
  suggestedPrompts?: string[];
  voiceInputEnabled?: boolean;
  liveVoiceEnabled?: boolean;
  voiceInputProvider?: VoiceInputProviderOption;
  ttsProvider?: TTSProviderOption;
  ttsSpeed?: number;
};

function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    for (let offset = 0; offset < chunk.length; offset += 1) binary += String.fromCharCode(chunk[offset]);
  }
  return btoa(binary);
}

export function AIChatBox({
  messages, onSendMessage, isLoading = false, placeholder = "Type your message...", className, height = "600px",
  emptyStateMessage = "Start a conversation with Icynigma", suggestedPrompts, voiceInputEnabled = true, liveVoiceEnabled = true,
  voiceInputProvider = "elevenlabs", ttsProvider = "elevenlabs", ttsSpeed = 1,
}: AIChatBoxProps) {
  const [input, setInput] = useState("");
  const [cloudStatus, setCloudStatus] = useState<"idle" | "listening" | "transcribing" | "error">("idle");
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [liveActive, setLiveActive] = useState(false);
  const [livePhase, setLivePhase] = useState<LiveVoicePhase>("idle");
  const [liveResponseIndex, setLiveResponseIndex] = useState<number | null>(null);
  const [liveStopSignal, setLiveStopSignal] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const liveActiveRef = useRef(false);
  const latestAssistantIndexRef = useRef(-1);
  const displayMessages = messages.filter((message) => message.role !== "system");

  const appendTranscript = useCallback((transcript: string) => {
    setInput((current) => (current.trim() ? `${current.trim()} ${transcript}` : transcript));
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  const { error: browserError, interimTranscript, isListening: browserListening, isSupported: browserSupported, startListening, stopListening } = useSpeechRecognition({ onFinalTranscript: appendTranscript });
  const handleLiveTranscript = useCallback(async (transcript: string) => {
    if (!liveActiveRef.current || !transcript.trim()) return;
    setLivePhase("thinking");
    try {
      await Promise.resolve(onSendMessage(transcript.trim()));
    } catch {
      setLivePhase("error");
    }
  }, [onSendMessage]);
  const { isListening: liveListening, isSupported: liveRecognitionSupported, startListening: startLiveListening, stopListening: stopLiveListening } = useSpeechRecognition({ onFinalTranscript: handleLiveTranscript, stopAfterFinal: true });
  const cloudSupported = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined";
  const liveSynthesisSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const liveVoiceSupported = canUseLiveVoice({ enabled: liveVoiceEnabled, recognitionSupported: liveRecognitionSupported, synthesisSupported: liveSynthesisSupported });

  const stopCloudListening = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    else streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const transcribeCloudAudio = useCallback(async (audio: Blob) => {
    if (!audio.size) { setCloudStatus("idle"); return; }
    setCloudStatus("transcribing");
    try {
      const response = await fetch("/api/speech/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ audioBase64: toBase64(await audio.arrayBuffer()), mimeType: audio.type || "audio/webm", language: navigator.language }),
      });
      const payload = await response.json() as { text?: string; error?: string };
      if (!response.ok || !payload.text) throw new Error(payload.error || "No speech was recognised.");
      appendTranscript(payload.text);
      setCloudStatus("idle");
    } catch (error) {
      setCloudError(error instanceof Error ? error.message : "Cloud transcription could not finish. Try browser recognition or type your message.");
      setCloudStatus("error");
    }
  }, [appendTranscript]);

  const startCloudListening = useCallback(async () => {
    if (!cloudSupported) {
      setCloudError("Cloud transcription needs microphone recording support. Switching to browser recognition when available.");
      startListening();
      return;
    }
    setCloudError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, MediaRecorder.isTypeSupported("audio/webm") ? { mimeType: "audio/webm" } : undefined);
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        recorderRef.current = null;
        streamRef.current = null;
        await transcribeCloudAudio(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }));
      };
      recorder.start();
      recorderRef.current = recorder;
      setCloudStatus("listening");
    } catch (error) {
      setCloudError(error instanceof Error ? error.message : "Microphone permission is required for cloud transcription.");
      setCloudStatus("error");
    }
  }, [cloudSupported, startListening, transcribeCloudAudio]);

  useEffect(() => () => {
    recorderRef.current?.state !== "inactive" && recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => { liveActiveRef.current = liveActive; }, [liveActive]);

  const latestAssistantIndex = messages.reduce((latest, message, index) => message.role === "assistant" ? index : latest, -1);
  useEffect(() => {
    if (!liveActive || isLoading || latestAssistantIndex < 0 || latestAssistantIndex <= latestAssistantIndexRef.current) return;
    latestAssistantIndexRef.current = latestAssistantIndex;
    setLiveResponseIndex(latestAssistantIndex);
    setLivePhase("speaking");
  }, [isLoading, latestAssistantIndex, liveActive]);

  const startLiveVoice = () => {
    if (!liveVoiceSupported || isLoading) {
      setLivePhase(liveVoiceSupported ? "error" : "unsupported");
      return;
    }
    window.speechSynthesis?.cancel();
    setLiveStopSignal((current) => current + 1);
    latestAssistantIndexRef.current = latestAssistantIndex;
    setLiveResponseIndex(null);
    setLiveActive(true);
    setLivePhase("listening");
    startLiveListening();
  };

  const stopLiveVoice = () => {
    setLiveActive(false);
    stopLiveListening();
    window.speechSynthesis?.cancel();
    setLiveStopSignal((current) => current + 1);
    setLiveResponseIndex(null);
    setLivePhase("idle");
  };

  useEffect(() => {
    if (!liveVoiceEnabled && liveActive) stopLiveVoice();
  }, [liveActive, liveVoiceEnabled]);

  const handleLivePlaybackState = useCallback((state: "idle" | "speaking" | "error") => {
    if (!liveActiveRef.current) return;
    if (state === "speaking") { setLivePhase("speaking"); return; }
    if (state === "error") { setLivePhase("error"); return; }
    setLivePhase("listening");
    window.setTimeout(() => { if (liveActiveRef.current) startLiveListening(); }, 180);
  }, [startLiveListening]);

  useEffect(() => () => { stopLiveListening(); window.speechSynthesis?.cancel(); }, [stopLiveListening]);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLDivElement | null;
    if (!viewport) return;
    requestAnimationFrame(() => {
      if (typeof viewport.scrollTo === "function") viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      else viewport.scrollTop = viewport.scrollHeight;
    });
  }, [messages.length, isLoading]);

  const submitMessage = (content: string) => { const trimmed = content.trim(); if (!trimmed || isLoading) return; onSendMessage(trimmed); setInput(""); textareaRef.current?.focus(); };
  const handleSubmit = (event: React.FormEvent) => { event.preventDefault(); submitMessage(input); };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submitMessage(input); } };
  const cloudListening = cloudStatus === "listening";
  const usingCloud = voiceInputProvider === "elevenlabs";
  const voiceSupported = usingCloud ? cloudSupported || browserSupported : browserSupported;
  const isVoiceActive = usingCloud ? cloudListening : browserListening;
  const canUseVoice = voiceInputEnabled && voiceSupported && !isLoading && cloudStatus !== "transcribing";
  const startVoice = () => usingCloud ? void startCloudListening() : startListening();
  const stopVoice = () => usingCloud ? stopCloudListening() : stopListening();
  const voiceError = cloudError ?? browserError;
  const voiceStatus = cloudListening ? "Recording securely for ElevenLabs transcription… select the microphone again when you finish." : cloudStatus === "transcribing" ? "Transcribing your voice with ElevenLabs…" : browserListening ? "Listening with browser recognition… speak naturally, then pause to add the transcript." : interimTranscript ? `Hearing: ${interimTranscript}` : voiceError;
  const liveBannerPhase: LiveVoicePhase = !liveVoiceSupported && livePhase === "idle" ? "unsupported" : livePhase;
  const liveStatus = liveBannerPhase === "listening" && liveListening ? getLiveVoiceStatus("listening") : getLiveVoiceStatus(liveBannerPhase);

  return (
    <section aria-label="Icynigma conversation" className={cn("flex flex-col overflow-hidden rounded-xl border border-purple-500/20 bg-card/80 text-card-foreground shadow-2xl", className)} style={{ height }}>
      <div ref={scrollAreaRef} className="flex-1 overflow-hidden">
        {displayMessages.length === 0 ? <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center"><div className="space-y-3"><div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-purple-400/30 bg-purple-500/10 shadow-[0_0_28px_rgba(167,139,250,0.18)]"><Sparkles className="size-7 text-purple-300" aria-hidden="true" /></div><p className="text-sm text-purple-200/80">{emptyStateMessage}</p></div>{suggestedPrompts && suggestedPrompts.length > 0 && <div className="flex max-w-2xl flex-wrap justify-center gap-2" aria-label="Suggested prompts">{suggestedPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => submitMessage(prompt)} disabled={isLoading} className="rounded-full border border-purple-400/25 bg-purple-500/5 px-3 py-2 text-left text-xs text-purple-100 transition hover:border-purple-300/50 hover:bg-purple-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 disabled:cursor-not-allowed disabled:opacity-50">{prompt}</button>)}</div>}</div> : <ScrollArea className="h-full"><div className="flex flex-col space-y-5 p-4 sm:p-6">{displayMessages.map((message, index) => <article key={`${message.role}-${index}-${message.content.slice(0, 12)}`} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>{message.role === "assistant" && <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-purple-400/25 bg-purple-500/10"><Sparkles className="size-4 text-purple-300" aria-hidden="true" /></div>}<div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-[78%]", message.role === "user" ? "border border-cyan-300/20 bg-gradient-to-br from-blue-500/90 to-purple-600/90 text-white" : "border border-purple-400/15 bg-slate-950/45 text-slate-100")}>{message.role === "assistant" ? <div className="space-y-3"><div className="prose prose-sm max-w-none text-slate-100 prose-headings:text-purple-200 prose-a:text-cyan-300 dark:prose-invert"><Suspense fallback={<p className="text-sm text-purple-100/60">Rendering response…</p>}><Streamdown>{message.content}</Streamdown></Suspense></div><TTSPlayer text={message.content} preferredProvider={ttsProvider} preferredSpeed={ttsSpeed} autoPlay={liveActive && index === liveResponseIndex} stopSignal={liveStopSignal} onPlaybackStateChange={liveActive && index === liveResponseIndex ? handleLivePlaybackState : undefined} /></div> : <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>}</div>{message.role === "user" && <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-500/10"><User className="size-4 text-cyan-100" aria-hidden="true" /></div>}</article>)}{isLoading && <div className="flex items-start gap-3" aria-live="polite" aria-label="Icynigma is thinking"><div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-purple-400/25 bg-purple-500/10"><Sparkles className="size-4 text-purple-300" aria-hidden="true" /></div><div className="rounded-2xl border border-purple-400/15 bg-slate-950/45 px-3 py-2"><TypingIndicator /></div></div>}</div></ScrollArea>}
      </div>
      <form onSubmit={handleSubmit} className="border-t border-purple-500/15 bg-slate-950/40 p-3 sm:p-4">
        {(liveActive || liveBannerPhase === "error" || liveBannerPhase === "unsupported") && <div className={cn("mb-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs", liveBannerPhase === "error" || liveBannerPhase === "unsupported" ? "border-red-400/25 bg-red-500/10 text-red-200" : "border-cyan-300/25 bg-cyan-500/10 text-cyan-50")} role={liveBannerPhase === "error" || liveBannerPhase === "unsupported" ? "alert" : "status"} aria-live="polite"><Radio className={cn("size-3.5 shrink-0", liveBannerPhase === "listening" && "animate-pulse")} aria-hidden="true" /><span>{liveStatus}</span></div>}
        {voiceStatus && !liveActive && <div className={cn("mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs", voiceError ? "border border-red-400/25 bg-red-500/10 text-red-200" : "border border-purple-400/20 bg-purple-500/10 text-purple-100")} role={voiceError ? "alert" : "status"} aria-live="polite">{voiceError ? <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" /> : <Mic className="size-3.5 shrink-0 animate-pulse" aria-hidden="true" />}<span>{voiceStatus}</span></div>}
        <div className="flex items-end gap-2"><Textarea ref={textareaRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} placeholder={liveActive ? "Live Voice is active — you can still type or interrupt." : placeholder} className="min-h-11 max-h-36 flex-1 resize-none border-purple-400/20 bg-slate-950/40 text-slate-100 placeholder:text-purple-200/45 focus-visible:ring-purple-300" rows={1} disabled={isLoading} aria-label="Message Icynigma" />{liveVoiceEnabled && <Button type="button" variant="outline" disabled={!liveActive && (!liveVoiceSupported || isLoading)} onClick={liveActive ? stopLiveVoice : startLiveVoice} className={cn("h-11 shrink-0 gap-2 border-cyan-300/30 bg-cyan-500/10 px-3 text-cyan-50 hover:bg-cyan-500/20", liveActive && "border-red-300/50 bg-red-500/15 text-red-50 animate-pulse")} aria-pressed={liveActive} aria-label={liveActive ? "Stop Live Voice" : "Start Live Voice"} title={liveVoiceSupported ? liveActive ? "Stop and interrupt Live Voice" : "Start hands-free Live Voice" : "Live Voice needs browser speech recognition and synthesis"}>{liveActive ? <MicOff className="size-4" /> : <Radio className="size-4" />}<span className="hidden sm:inline">{liveActive ? "Stop" : "Live"}</span></Button>}{voiceInputEnabled && <Button type="button" variant="outline" size="icon" disabled={!canUseVoice || liveActive} onClick={isVoiceActive ? stopVoice : startVoice} className={cn("size-11 shrink-0 border-purple-400/25 bg-purple-500/5 text-purple-100 hover:bg-purple-500/15", isVoiceActive && "border-red-300/50 bg-red-500/15 text-red-100 animate-pulse")} aria-label={isVoiceActive ? "Stop voice input" : "Start voice input"} title={!voiceSupported ? "Voice input is unavailable in this browser" : isVoiceActive ? "Stop and transcribe voice input" : usingCloud ? "Record with ElevenLabs transcription" : "Speak your message"}>{isVoiceActive ? <MicOff className="size-4" /> : <Mic className="size-4" />}</Button>}<Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="size-11 shrink-0 bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-[0_0_18px_rgba(96,165,250,0.28)] hover:from-purple-400 hover:to-blue-500" aria-label="Send message" title="Send message"><Send className="size-4" /></Button></div>
        {voiceInputEnabled && !voiceSupported && <p className="mt-2 text-xs text-purple-200/50">Voice input is unavailable in this browser. You can always type your message.</p>}
      </form>
    </section>
  );
}
