import { describe, expect, it } from "vitest";
import { canUseLiveVoice, getLiveVoiceStatus, nextLiveVoicePhase } from "../client/src/lib/liveVoice";

describe("Live Voice conversation state", () => {
  it("requires browser speech recognition, synthesis, and user consent", () => {
    expect(canUseLiveVoice({ enabled: true, recognitionSupported: true, synthesisSupported: true })).toBe(true);
    expect(canUseLiveVoice({ enabled: true, recognitionSupported: false, synthesisSupported: true })).toBe(false);
    expect(canUseLiveVoice({ enabled: false, recognitionSupported: true, synthesisSupported: true })).toBe(false);
  });

  it("moves through a hands-free turn and resumes listening after playback", () => {
    const thinking = nextLiveVoicePhase("listening", "transcript");
    const speaking = nextLiveVoicePhase(thinking, "response");
    expect(nextLiveVoicePhase(speaking, "playback-ended")).toBe("listening");
  });

  it("describes unsupported browsers and allows an explicit stop", () => {
    expect(getLiveVoiceStatus("unsupported")).toContain("speech recognition");
    expect(getLiveVoiceStatus("error")).toContain("manual microphone");
    expect(nextLiveVoicePhase("listening", "stop")).toBe("idle");
  });
});
