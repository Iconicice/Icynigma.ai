import { describe, expect, it } from "vitest";
import { filterConversations, getSuggestedPrompts, groupConversations } from "@/lib/smartSidebar";
import { getSpeechRecognitionConstructor, isSpeechRecognitionSupported } from "@/lib/speechRecognition";

const now = new Date("2026-08-11T12:00:00.000Z");
const conversations = [
  { id: "1", title: "Consciousness and identity", createdAt: "2026-08-11T08:00:00.000Z", updatedAt: "2026-08-11T10:00:00.000Z", messageCount: 4 },
  { id: "2", title: "Freedom and responsibility", createdAt: "2026-08-07T08:00:00.000Z", updatedAt: "2026-08-07T08:00:00.000Z", messageCount: 2 },
  { id: "3", title: "The nature of meaning", createdAt: "2026-07-01T08:00:00.000Z", updatedAt: "2026-07-01T08:00:00.000Z", messageCount: 7 },
];

describe("smart sidebar helpers", () => {
  it("orders filtered conversations by their most recent activity", () => {
    expect(filterConversations(conversations, "").map((conversation) => conversation.id)).toEqual(["1", "2", "3"]);
    expect(filterConversations(conversations, "freedom").map((conversation) => conversation.id)).toEqual(["2"]);
  });

  it("groups threads into meaningful recent time windows", () => {
    expect(groupConversations(conversations, now).map((group) => [group.label, group.conversations.map((conversation) => conversation.id)])).toEqual([
      ["Today", ["1"]],
      ["Previous 7 days", ["2"]],
      ["Earlier", ["3"]],
    ]);
  });

  it("adapts philosophical suggestions to the active thread topic", () => {
    expect(getSuggestedPrompts("Consciousness and identity")[0]).toContain("consciousness");
    expect(getSuggestedPrompts("Freedom and responsibility")[0]).toContain("freedom");
    expect(getSuggestedPrompts()[0]).toContain("meaningful");
  });
});

describe("speech-recognition feature detection", () => {
  it("recognizes a standard browser speech constructor", () => {
    class MockRecognition {};
    const browser = { SpeechRecognition: MockRecognition } as unknown as Window & typeof globalThis;
    expect(isSpeechRecognitionSupported(browser)).toBe(true);
    expect(getSpeechRecognitionConstructor(browser)).toBe(MockRecognition);
  });

  it("returns unsupported without a browser recognition API", () => {
    expect(isSpeechRecognitionSupported(undefined)).toBe(false);
    expect(getSpeechRecognitionConstructor(undefined)).toBeNull();
  });
});
