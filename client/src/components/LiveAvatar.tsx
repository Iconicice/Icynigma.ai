import type { LiveVoicePhase } from "@/lib/liveVoice";
import React from "react";

type LiveAvatarProps = { phase: LiveVoicePhase; visible: boolean };

export function LiveAvatar({ phase, visible }: LiveAvatarProps) {
  if (!visible) return null;
  const label = phase === "listening" ? "Listening" : phase === "speaking" ? "Speaking" : phase === "thinking" ? "Thinking" : phase === "error" ? "Needs attention" : "Live";
  return <div className={`live-avatar live-avatar-${phase}`} role="status" aria-live="polite" aria-label={`Icynigma live avatar: ${label}`}>
    <div className="live-avatar-core"><img src="/icynigma-live-avatar-v3.png" alt="" className="live-avatar-image" /><span className="live-avatar-scan" aria-hidden="true" /></div>
    <span className="live-avatar-label">{label}</span>
  </div>;
}
