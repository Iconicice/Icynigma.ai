import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AIChatBox } from "./AIChatBox";

const recognition = vi.hoisted(() => ({
  isSupported: true,
  isListening: false,
  startListening: vi.fn(),
  stopListening: vi.fn(),
}));

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

describe("AIChatBox Live Voice controls", () => {
  afterEach(cleanup);

  beforeEach(() => {
    recognition.isSupported = true;
    recognition.isListening = false;
    recognition.startListening.mockReset();
    recognition.stopListening.mockReset();
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
});
