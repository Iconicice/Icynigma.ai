import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AIChatBox } from "./AIChatBox";

const recognition = vi.hoisted(() => ({
  isSupported: true,
  isListening: false,
  startListening: vi.fn(),
  stopListening: vi.fn(),
}));
const playback = vi.hoisted(() => ({ props: null as null | { autoPlay?: boolean; stopSignal?: number; onPlaybackStateChange?: (state: "idle" | "speaking" | "error") => void } }));

vi.mock("@/hooks/useSpeechRecognition", () => ({
  useSpeechRecognition: () => ({
    error: null,
    interimTranscript: "",
    isListening: recognition.isListening,
    isSupported: recognition.isSupported,
    startListening: recognition.startListening,
    stopListening: recognition.stopListening,
  }),
}));

vi.mock("./TTSPlayer", () => ({
  TTSPlayer: (props: typeof playback.props & { text: string }) => {
    playback.props = props;
    return <button type="button" onClick={() => props.onPlaybackStateChange?.("idle")}>Finish live playback</button>;
  },
}));

vi.mock("streamdown", () => ({
  Streamdown: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("AIChatBox Live Voice controls", () => {
  afterEach(cleanup);

  beforeEach(() => {
    recognition.isSupported = true;
    recognition.isListening = false;
    recognition.startListening.mockReset();
    recognition.stopListening.mockReset();
    playback.props = null;
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: { cancel: vi.fn() } });
  });

  it("shows an explicit typed-chat fallback when browser speech recognition is unavailable", () => {
    recognition.isSupported = false;
    render(<AIChatBox messages={[]} onSendMessage={vi.fn()} isLoading={false} />);
    expect(screen.getByText(/Live Voice needs browser speech recognition/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /start Live Voice/i })).toHaveProperty("disabled", true);
  });

  it("starts and stops the hands-free session through visible controls", () => {
    render(<AIChatBox messages={[]} onSendMessage={vi.fn()} isLoading={false} />);
    fireEvent.click(screen.getByRole("button", { name: /start Live Voice/i }));
    expect(recognition.startListening).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Live Voice is listening/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /stop Live Voice/i }));
    expect(recognition.stopListening).toHaveBeenCalledTimes(1);
  });

  it("autoplays a new assistant response, resumes listening on completion, and interrupts safely", async () => {
    const { rerender } = render(<AIChatBox messages={[]} onSendMessage={vi.fn()} isLoading={false} />);
    fireEvent.click(screen.getByRole("button", { name: /start Live Voice/i }));

    rerender(<AIChatBox messages={[{ role: "user", content: "Hello" }, { role: "assistant", content: "Welcome." }]} onSendMessage={vi.fn()} isLoading={false} />);
    await waitFor(() => expect(playback.props?.autoPlay).toBe(true));
    fireEvent.click(screen.getByRole("button", { name: "Finish live playback" }));
    await waitFor(() => expect(recognition.startListening).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByRole("button", { name: /stop Live Voice/i }));
    expect(recognition.stopListening).toHaveBeenCalledTimes(1);
    expect(playback.props?.stopSignal).toBeGreaterThan(0);
  });
});
