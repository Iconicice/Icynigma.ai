import { useCallback, useEffect, useRef, useState } from "react";
import { getSpeechRecognitionConstructor, isSpeechRecognitionSupported } from "@/lib/speechRecognition";

export type VoiceInputStatus = "idle" | "listening" | "error" | "unsupported";

type UseSpeechRecognitionOptions = {
  onFinalTranscript: (text: string) => void;
  language?: string;
  stopAfterFinal?: boolean;
};

const errorMessages: Record<string, string> = {
  "not-allowed": "Microphone permission was denied. Allow microphone access in your browser settings to use voice input.",
  "service-not-allowed": "Speech recognition is not available for this browser session.",
  "no-speech": "No speech was detected. Try speaking a little closer to your microphone.",
  "audio-capture": "No microphone was found. Check that a microphone is connected and available.",
  network: "Speech recognition needs a network connection. Check your connection and try again.",
};

export function useSpeechRecognition({ onFinalTranscript, language, stopAfterFinal = false }: UseSpeechRecognitionOptions) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const stopAfterFinalRef = useRef(stopAfterFinal);
  const [status, setStatus] = useState<VoiceInputStatus>(() =>
    isSpeechRecognitionSupported() ? "idle" : "unsupported",
  );
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { stopAfterFinalRef.current = stopAfterFinal; }, [stopAfterFinal]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const startListening = useCallback(() => {
    const Constructor = getSpeechRecognitionConstructor();
    if (!Constructor) {
      setStatus("unsupported");
      setError("Voice input is not supported in this browser. Try a current version of Chrome, Edge, or Safari.");
      return;
    }

    setError(null);
    setInterimTranscript("");
    const recognition = new Constructor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language ?? navigator.language ?? "en-US";

    recognition.onstart = () => setStatus("listening");
    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript ?? "";
        if (event.results[index].isFinal) finalText += transcript;
        else interim += transcript;
      }
      setInterimTranscript(interim.trim());
      if (finalText.trim()) {
        onFinalTranscript(finalText.trim());
        if (stopAfterFinalRef.current) recognition.stop();
      }
    };
    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      setError(errorMessages[event.error] ?? "Voice input could not start. Please try again.");
      setStatus(event.error === "service-not-allowed" ? "unsupported" : "error");
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setInterimTranscript("");
      setStatus((current) => (current === "unsupported" || current === "error" ? current : "idle"));
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setError("Voice input is already active. Please wait a moment and try again.");
      setStatus("error");
    }
  }, [language, onFinalTranscript]);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return {
    error,
    interimTranscript,
    isSupported: status !== "unsupported",
    isListening: status === "listening",
    startListening,
    status,
    stopListening,
  };
}
