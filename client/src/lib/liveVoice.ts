export type LiveVoicePhase = "idle" | "listening" | "thinking" | "speaking" | "error" | "unsupported";

export function canUseLiveVoice({
  enabled,
  recognitionSupported,
  synthesisSupported,
}: {
  enabled: boolean;
  recognitionSupported: boolean;
  synthesisSupported: boolean;
}) {
  return enabled && recognitionSupported && synthesisSupported;
}

export function getLiveVoiceStatus(phase: LiveVoicePhase) {
  const labels: Record<LiveVoicePhase, string> = {
    idle: "Live Voice is ready.",
    listening: "Live Voice is listening. Speak naturally, then pause.",
    thinking: "Icynigma is considering your words…",
    speaking: "Icynigma is speaking. Select Live Voice again to interrupt.",
    error: "Live Voice paused because speech services are unavailable. Try the manual microphone or typed chat.",
    unsupported: "Live Voice needs browser speech recognition and speech synthesis. You can still use the manual microphone or typed chat.",
  };
  return labels[phase];
}

export function nextLiveVoicePhase(
  current: LiveVoicePhase,
  event: "start" | "transcript" | "response" | "playback-ended" | "stop" | "error" | "unsupported",
): LiveVoicePhase {
  if (event === "unsupported") return "unsupported";
  if (event === "error") return "error";
  if (event === "stop") return "idle";
  if (event === "start") return "listening";
  if (event === "transcript") return current === "listening" ? "thinking" : current;
  if (event === "response") return current === "thinking" ? "speaking" : current;
  if (event === "playback-ended") return current === "speaking" ? "listening" : current;
  return current;
}
