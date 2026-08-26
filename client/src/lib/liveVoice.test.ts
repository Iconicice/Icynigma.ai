import { describe, expect, it } from "vitest";
import { canUseLiveVoice, getLiveVoiceStatus, nextLiveVoicePhase } from "./liveVoice";

describe("Live Voice utilities", () => {
  it("requires both browser speech capabilities and the user preference", () => {
    expect(canUseLiveVoice({ enabled: true, recognitionSupported: true, synthesisSupported: true })).toBe(true);
    expect(canUseLiveVoice({ enabled: true, recognitionSupported: false, synthesisSupported: true })).toBe(false);
    expect(canUseLiveVoice({ enabled: false, recognitionSupported: true, synthesisSupported: true })).toBe(false);
  });

  it("models a live conversation turn from listening through the next listening state", () => {
    const thinking = nextLiveVoicePhase("listening", "transcript");
    const speaking = nextLiveVoicePhase(thinking, "response");
    expect(nextLiveVoicePhase(speaking, "playback-ended")).toBe("listening");
  });

  it("provides an understandable inaccessible-browser fallback", () => {
    expect(getLiveVoiceStatus("unsupported")).toContain("speech recognition");
    expect(nextLiveVoicePhase("listening", "stop")).toBe("idle");
  });
});
