import { useEffect, useRef, useState } from "react";
import { ChevronDown, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { TTSProviderOption } from "@/lib/settings";

interface TTSPlayerProps {
  text: string;
  onSynthesizing?: (synthesizing: boolean) => void;
  preferredProvider?: TTSProviderOption;
  preferredSpeed?: number;
  autoPlay?: boolean;
  stopSignal?: number;
  onPlaybackStateChange?: (state: "idle" | "speaking" | "error") => void;
}

const voices = [
  { id: "en_US-amy-medium", name: "Amy", category: "US Female", tone: "Warm" },
  { id: "en_US-libritts-high", name: "LibriTTS", category: "US Female", tone: "Clear" },
  { id: "en_GB-alba-medium", name: "Alba", category: "UK Female", tone: "Formal" },
  { id: "en_GB-alan-medium", name: "Alan", category: "UK Male", tone: "Deep" },
  { id: "en_US-ryan-medium", name: "Ryan", category: "US Male", tone: "Smooth" },
];

export function TTSPlayer({ text, onSynthesizing, preferredProvider = "elevenlabs", preferredSpeed = 1, autoPlay = false, stopSignal = 0, onPlaybackStateChange }: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [provider, setProvider] = useState<TTSProviderOption>(preferredProvider);
  const [speed, setSpeed] = useState(preferredSpeed);
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => { setProvider(preferredProvider); }, [preferredProvider]);
  useEffect(() => { setSpeed(preferredSpeed); }, [preferredSpeed]);
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  const browserSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const stopAll = () => {
    window.speechSynthesis?.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsPlaying(false);
    setIsSynthesizing(false);
    onSynthesizing?.(false);
    onPlaybackStateChange?.("idle");
  };

  const speakWithBrowser = () => {
    if (!browserSupported || !text) { setError("Browser speech is unavailable in this browser."); return; }
    setError(null);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    utterance.onend = () => { setIsPlaying(false); setIsSynthesizing(false); onSynthesizing?.(false); onPlaybackStateChange?.("idle"); };
    utterance.onerror = () => { setIsPlaying(false); setIsSynthesizing(false); onSynthesizing?.(false); onPlaybackStateChange?.("error"); setError("Browser speech could not play this response."); };
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    onPlaybackStateChange?.("speaking");
  };

  const synthesizeRemote = async () => {
    if (!text || isSynthesizing) return;
    setError(null);
    setIsSynthesizing(true);
    onSynthesizing?.(true);
    try {
      const response = await fetch("/api/speech/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text, provider, voice: provider === "piper" ? selectedVoice : undefined }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(payload.error || "Speech service is unavailable.");
      }
      const audio = new Blob([await response.arrayBuffer()], { type: response.headers.get("content-type") || "audio/mpeg" });
      const url = URL.createObjectURL(audio);
      if (!audioRef.current) return;
      audioRef.current.src = url;
      audioRef.current.playbackRate = speed;
      await audioRef.current.play();
      setIsPlaying(true);
      onPlaybackStateChange?.("speaking");
    } catch (remoteError) {
      setError(remoteError instanceof Error ? `${remoteError.message} Falling back to browser speech.` : "Cloud speech failed. Falling back to browser speech.");
      setProvider("web-speech");
      speakWithBrowser();
    } finally {
      setIsSynthesizing(false);
      onSynthesizing?.(false);
    }
  };

  const playPause = () => {
    if (isPlaying) {
      if (provider === "web-speech") window.speechSynthesis.pause();
      else audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    if (provider === "web-speech") {
      if (window.speechSynthesis.paused) { window.speechSynthesis.resume(); setIsPlaying(true); }
      else speakWithBrowser();
      return;
    }
    if (audioRef.current?.src) { audioRef.current.playbackRate = speed; void audioRef.current.play(); setIsPlaying(true); }
    else void synthesizeRemote();
  };

  useEffect(() => {
    if (!autoPlay || !text) return;
    if (provider === "web-speech") speakWithBrowser();
    else void synthesizeRemote();
    // This intentionally starts once per mounted response. Provider changes remain manual controls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, text]);

  useEffect(() => { if (stopSignal > 0) stopAll(); }, [stopSignal]);

  return (
    <div className="w-full space-y-3 rounded-lg border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-4 backdrop-blur-sm transition-all duration-300 hover:border-accent/40">
      <button type="button" onClick={() => setIsExpanded((current) => !current)} className="flex w-full items-center justify-between gap-3 transition-colors hover:text-accent">
        <div className="flex items-center gap-2"><Volume2 className="h-5 w-5 text-accent" /><span className="font-medium text-foreground">Listen to response</span></div><ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
      </button>
      {isExpanded && <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2"><Button size="sm" variant="default" onClick={playPause} disabled={isSynthesizing} className="h-9 w-9 p-0">{isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button><Button size="sm" variant="outline" onClick={stopAll} className="h-9 w-9 p-0"><RotateCcw className="h-4 w-4" /></Button><div className="flex-1 text-sm text-secondary-foreground">{isSynthesizing ? <span className="animate-pulse">Generating audio…</span> : isPlaying ? <span>Playing…</span> : <span className="text-xs">Ready to play</span>}</div></div>
        {error && <p className="rounded-md border border-amber-400/25 bg-amber-500/10 p-2 text-xs text-amber-100" role="status">{error}</p>}
        {provider === "piper" && <div className="space-y-2"><label className="text-xs font-medium text-secondary-foreground">Piper voice</label><Select value={selectedVoice} onValueChange={setSelectedVoice}><SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>{voices.map((voice) => <SelectItem key={voice.id} value={voice.id}>{voice.name} — {voice.tone}</SelectItem>)}</SelectContent></Select></div>}
        <div className="space-y-2"><div className="flex items-center justify-between"><label className="text-xs font-medium text-secondary-foreground">Playback speed</label><span className="text-sm font-medium text-accent">{speed.toFixed(1)}×</span></div><Slider value={[speed]} onValueChange={(value) => setSpeed(value[0])} min={0.5} max={2} step={0.1} className="w-full" /></div>
        <div className="space-y-2"><label className="text-xs font-medium text-secondary-foreground">Speech engine</label><Select value={provider} onValueChange={(value) => { stopAll(); setProvider(value as TTSProviderOption); setError(null); }}><SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="elevenlabs">ElevenLabs (cloud)</SelectItem><SelectItem value="piper">Piper neural</SelectItem><SelectItem value="web-speech">Browser speech</SelectItem></SelectContent></Select></div>
      </div>}
      <audio ref={audioRef} onEnded={() => { setIsPlaying(false); onPlaybackStateChange?.("idle"); }} onError={() => { onPlaybackStateChange?.("error"); setError("Audio playback failed. Try browser speech."); }} className="hidden" />
    </div>
  );
}
