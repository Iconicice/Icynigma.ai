export type SpeechRecognitionConstructor = new () => SpeechRecognition;

export function getSpeechRecognitionConstructor(
  target: (Window & typeof globalThis) | undefined = typeof window === "undefined" ? undefined : window,
): SpeechRecognitionConstructor | null {
  if (!target) return null;
  return target.SpeechRecognition ?? target.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(
  target: (Window & typeof globalThis) | undefined = typeof window === "undefined" ? undefined : window,
): boolean {
  return Boolean(getSpeechRecognitionConstructor(target));
}
