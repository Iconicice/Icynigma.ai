import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CircleAlert, Mic, MicOff, Send, Sparkles, User } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { TTSPlayer } from "./TTSPlayer";
import { TypingIndicator } from "./TypingIndicator";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

const Streamdown = lazy(() => import("streamdown").then((module) => ({ default: module.Streamdown })));

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

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
};

export function AIChatBox({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message...",
  className,
  height = "600px",
  emptyStateMessage = "Start a conversation with Icynigma",
  suggestedPrompts,
  voiceInputEnabled = true,
}: AIChatBoxProps) {
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const displayMessages = messages.filter((message) => message.role !== "system");

  const appendTranscript = useCallback((transcript: string) => {
    setInput((current) => (current.trim() ? `${current.trim()} ${transcript}` : transcript));
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  const {
    error: voiceError,
    interimTranscript,
    isListening,
    isSupported: voiceSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({ onFinalTranscript: appendTranscript });

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]',
    ) as HTMLDivElement | null;
    if (!viewport) return;
    requestAnimationFrame(() => viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" }));
  }, [messages.length, isLoading]);

  const submitMessage = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput("");
    textareaRef.current?.focus();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submitMessage(input);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage(input);
    }
  };

  const canUseVoice = voiceInputEnabled && voiceSupported && !isLoading;
  const voiceStatus = isListening
    ? "Listening… speak naturally, then pause to add the transcript."
    : interimTranscript
      ? `Hearing: ${interimTranscript}`
      : voiceError;

  return (
    <section
      aria-label="Icynigma conversation"
      className={cn("flex flex-col overflow-hidden rounded-xl border border-purple-500/20 bg-card/80 text-card-foreground shadow-2xl", className)}
      style={{ height }}
    >
      <div ref={scrollAreaRef} className="flex-1 overflow-hidden">
        {displayMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
            <div className="space-y-3">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-purple-400/30 bg-purple-500/10 shadow-[0_0_28px_rgba(167,139,250,0.18)]">
                <Sparkles className="size-7 text-purple-300" aria-hidden="true" />
              </div>
              <p className="text-sm text-purple-200/80">{emptyStateMessage}</p>
            </div>
            {suggestedPrompts && suggestedPrompts.length > 0 && (
              <div className="flex max-w-2xl flex-wrap justify-center gap-2" aria-label="Suggested prompts">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => submitMessage(prompt)}
                    disabled={isLoading}
                    className="rounded-full border border-purple-400/25 bg-purple-500/5 px-3 py-2 text-left text-xs text-purple-100 transition hover:border-purple-300/50 hover:bg-purple-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="flex flex-col space-y-5 p-4 sm:p-6">
              {displayMessages.map((message, index) => (
                <article
                  key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
                  className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  {message.role === "assistant" && (
                    <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-purple-400/25 bg-purple-500/10">
                      <Sparkles className="size-4 text-purple-300" aria-hidden="true" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-[78%]",
                    message.role === "user"
                      ? "border border-cyan-300/20 bg-gradient-to-br from-blue-500/90 to-purple-600/90 text-white"
                      : "border border-purple-400/15 bg-slate-950/45 text-slate-100",
                  )}>
                    {message.role === "assistant" ? (
                      <div className="space-y-3">
                        <div className="prose prose-sm max-w-none text-slate-100 prose-headings:text-purple-200 prose-a:text-cyan-300 dark:prose-invert">
                          <Suspense fallback={<p className="text-sm text-purple-100/60">Rendering response…</p>}><Streamdown>{message.content}</Streamdown></Suspense>
                        </div>
                        <TTSPlayer text={message.content} />
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-500/10">
                      <User className="size-4 text-cyan-100" aria-hidden="true" />
                    </div>
                  )}
                </article>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3" aria-live="polite" aria-label="Icynigma is thinking">
                  <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-purple-400/25 bg-purple-500/10">
                    <Sparkles className="size-4 text-purple-300" aria-hidden="true" />
                  </div>
                  <div className="rounded-2xl border border-purple-400/15 bg-slate-950/45 px-3 py-2">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-purple-500/15 bg-slate-950/40 p-3 sm:p-4">
        {voiceStatus && (
          <div
            className={cn(
              "mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
              voiceError ? "border border-red-400/25 bg-red-500/10 text-red-200" : "border border-purple-400/20 bg-purple-500/10 text-purple-100",
            )}
            role={voiceError ? "alert" : "status"}
            aria-live="polite"
          >
            {voiceError ? <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" /> : <Mic className="size-3.5 shrink-0 animate-pulse" aria-hidden="true" />}
            <span>{voiceStatus}</span>
          </div>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-11 max-h-36 flex-1 resize-none border-purple-400/20 bg-slate-950/40 text-slate-100 placeholder:text-purple-200/45 focus-visible:ring-purple-300"
            rows={1}
            disabled={isLoading}
            aria-label="Message Icynigma"
          />
          {voiceInputEnabled && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!canUseVoice}
              onClick={isListening ? stopListening : startListening}
              className={cn(
                "size-11 shrink-0 border-purple-400/25 bg-purple-500/5 text-purple-100 hover:bg-purple-500/15",
                isListening && "border-red-300/50 bg-red-500/15 text-red-100 animate-pulse",
              )}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              title={!voiceSupported ? "Voice input is unavailable in this browser" : isListening ? "Stop listening" : "Speak your message"}
            >
              {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </Button>
          )}
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="size-11 shrink-0 bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-[0_0_18px_rgba(96,165,250,0.28)] hover:from-purple-400 hover:to-blue-500"
            aria-label="Send message"
            title="Send message"
          >
            <Send className="size-4" />
          </Button>
        </div>
        {voiceInputEnabled && !voiceSupported && (
          <p className="mt-2 text-xs text-purple-200/50">Voice input works in supported browsers such as Chrome, Edge, and Safari. You can always type your message.</p>
        )}
      </form>
    </section>
  );
}
