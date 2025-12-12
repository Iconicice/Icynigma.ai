import { describe, expect, it } from "vitest";
import { getOriginalAIAgent } from "./_core/original-ai";

describe("Original AI Agent - Icynigma", () => {
  describe("Knowledge Base", () => {
    it("initializes with philosophical concepts", () => {
      const agent = getOriginalAIAgent();
      const concepts = agent.getConcepts();

      expect(Array.isArray(concepts)).toBe(true);
      expect(concepts.length).toBeGreaterThan(0);
    });

    it("contains core philosophical concepts", () => {
      const agent = getOriginalAIAgent();
      const concepts = agent.getConcepts();
      const conceptIds = concepts.map((c) => c.id);

      expect(conceptIds).toContain("consciousness");
      expect(conceptIds).toContain("existence");
      expect(conceptIds).toContain("meaning");
      expect(conceptIds).toContain("truth");
    });

    it("can retrieve specific concepts", () => {
      const agent = getOriginalAIAgent();
      const concept = agent.getConcept("consciousness");

      expect(concept).toBeDefined();
      expect(concept?.name).toBe("Consciousness");
      expect(concept?.description).toBeDefined();
      expect(concept?.category).toBeDefined();
    });

    it("concepts have related concepts", () => {
      const agent = getOriginalAIAgent();
      const concept = agent.getConcept("consciousness");

      expect(concept?.relatedConcepts).toBeDefined();
      expect(Array.isArray(concept?.relatedConcepts)).toBe(true);
      expect(concept?.relatedConcepts?.length).toBeGreaterThan(0);
    });
  });

  describe("Response Generation", () => {
    it("generates responses to user messages", async () => {
      const agent = getOriginalAIAgent();
      const result = await agent.generateResponse("user-1", "Hello, Icynigma");

      expect(result).toBeDefined();
      expect(result.response).toBeDefined();
      expect(typeof result.response).toBe("string");
      expect(result.response.length).toBeGreaterThan(0);
    });

    it("generates thinking process", async () => {
      const agent = getOriginalAIAgent();
      const result = await agent.generateResponse("user-1", "What is consciousness?");

      expect(result.thinking).toBeDefined();
      expect(result.thinking.question).toBeDefined();
      expect(Array.isArray(result.thinking.reasoning)).toBe(true);
      expect(result.thinking.reasoning.length).toBeGreaterThan(0);
      expect(result.thinking.conclusion).toBeDefined();
      expect(typeof result.thinking.confidence).toBe("number");
    });

    it("responds to philosophical questions", async () => {
      const agent = getOriginalAIAgent();
      const result = await agent.generateResponse(
        "user-1",
        "What is the meaning of life?"
      );

      expect(result.response).toBeDefined();
      expect(result.response.length).toBeGreaterThan(0);
    });

    it("recognizes and responds to greetings", async () => {
      const agent = getOriginalAIAgent();
      const result = await agent.generateResponse("user-1", "Hi there!");

      expect(result.response).toBeDefined();
      expect(result.response.length).toBeGreaterThan(20);
    });

    it("extracts and responds to concepts in questions", async () => {
      const agent = getOriginalAIAgent();
      const result = await agent.generateResponse(
        "user-1",
        "Tell me about consciousness"
      );

      expect(result.response).toBeDefined();
      // Response should mention the concept
      expect(
        result.response.toLowerCase().includes("consciousness")
      ).toBe(true);
    });
  });

  describe("Conversation Memory", () => {
    it("maintains conversation history", async () => {
      const agent = getOriginalAIAgent();
      const userId = "user-memory-test";

      // First message
      await agent.generateResponse(userId, "Hello");
      let history = agent.getConversationHistory(userId);
      expect(history.length).toBe(2); // user + assistant

      // Second message
      await agent.generateResponse(userId, "How are you?");
      history = agent.getConversationHistory(userId);
      expect(history.length).toBe(4); // 2 + 2

      // Third message
      await agent.generateResponse(userId, "Tell me about philosophy");
      history = agent.getConversationHistory(userId);
      expect(history.length).toBe(6); // 4 + 2
    });

    it("separates conversation history by user", async () => {
      const agent = getOriginalAIAgent();

      await agent.generateResponse("user-a", "Hello from A");
      await agent.generateResponse("user-b", "Hello from B");

      const historyA = agent.getConversationHistory("user-a");
      const historyB = agent.getConversationHistory("user-b");

      expect(historyA.length).toBe(2);
      expect(historyB.length).toBe(2);
      expect(historyA[0].content).toContain("A");
      expect(historyB[0].content).toContain("B");
    });

    it("can clear conversation history", async () => {
      const agent = getOriginalAIAgent();
      const userId = "user-clear-test";

      await agent.generateResponse(userId, "Hello");
      let history = agent.getConversationHistory(userId);
      expect(history.length).toBeGreaterThan(0);

      agent.clearHistory(userId);
      history = agent.getConversationHistory(userId);
      expect(history.length).toBe(0);
    });
  });

  describe("Response Quality", () => {
    it("generates thoughtful responses", async () => {
      const agent = getOriginalAIAgent();
      const result = await agent.generateResponse(
        "user-quality",
        "What is truth?"
      );

      expect(result.response.length).toBeGreaterThan(50);
      expect(result.response).toBeDefined();
    });

    it("includes philosophical depth", async () => {
      const agent = getOriginalAIAgent();
      const result = await agent.generateResponse(
        "user-depth",
        "Tell me about existence"
      );

      // Response should be substantive
      expect(result.response.length).toBeGreaterThan(30);
      // Should reference the concept
      expect(
        result.response.toLowerCase().includes("exist")
      ).toBe(true);
    });

    it("provides confidence ratings", async () => {
      const agent = getOriginalAIAgent();
      const result = await agent.generateResponse("user-conf", "Hello");

      expect(result.thinking.confidence).toBeGreaterThan(0);
      expect(result.thinking.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty messages gracefully", async () => {
      const agent = getOriginalAIAgent();
      // Should not throw error
      const result = await agent.generateResponse("user-empty", "");
      expect(result).toBeDefined();
    });

    it("handles very long messages", async () => {
      const agent = getOriginalAIAgent();
      const longMessage = "What is the meaning of life? ".repeat(50);
      const result = await agent.generateResponse("user-long", longMessage);

      expect(result).toBeDefined();
      expect(result.response).toBeDefined();
    });

    it("handles multiple consecutive messages", async () => {
      const agent = getOriginalAIAgent();
      const userId = "user-consecutive";

      for (let i = 0; i < 5; i++) {
        const result = await agent.generateResponse(
          userId,
          `Message ${i + 1}`
        );
        expect(result.response).toBeDefined();
      }

      const history = agent.getConversationHistory(userId);
      expect(history.length).toBe(10); // 5 user + 5 assistant
    });
  });
});
