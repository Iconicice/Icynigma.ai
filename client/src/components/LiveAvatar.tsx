import { Mic2, Radio, Sparkles } from "lucide-react";
import type { LiveVoicePhase } from "@/lib/liveVoice";
import React from "react";

type LiveAvatarProps = { phase: LiveVoicePhase; visible: boolean };

export function LiveAvatar({ phase, visible }: LiveAvatarProps) {
  if (!visible) return null;
  const label = phase === "listening" ? "Listening" : phase === "speaking" ? "Speaking" : phase === "thinking" ? "Thinking" : phase === "error" ? "Needs attention" : "Live";
  const Icon = phase === "listening" ? Mic2 : phase === "speaking" ? Radio : Sparkles;
  return <div className={`live-avatar live-avatar-${phase}`} role="status" aria-live="polite" aria-label={`Icynigma live avatar: ${label}`}>
    <div className="live-avatar-core"><Icon className="h-5 w-5" aria-hidden="true" /><span className="live-avatar-eye live-avatar-eye-left" /><span className="live-avatar-eye live-avatar-eye-right" /></div>
    <span className="live-avatar-label">{label}</span>
  </div>;
}
