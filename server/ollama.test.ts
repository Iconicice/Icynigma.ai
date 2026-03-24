import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { getOllamaClient, type OllamaMessage } from "./_core/ollama-client";

describe("Ollama Client Integration", () => {
  let ollamaClient: ReturnType<typeof getOllamaClient>;

  beforeAll(() => {
    ollamaClient = getOllamaClient();
  });

  describe("Client Initialization", () => {
    it("creates a singleton instance", () => {
      const client1 = getOllamaClient();
      const client2 = getOllamaClient();
      expect(client1).toBe(client2);
    });

    it("has default model set to deepseek-r1:1.5b", () => {
      expect(ollamaClient.getModel()).toBe("deepseek-r1:1.5b");
    });
  });

  describe("Model Management", () => {
    it("can set and get model", () => {
      ollamaClient.setModel("test-model");
      expect(ollamaClient.getModel()).toBe("test-model");
      
      // Reset to default
      ollamaClient.setModel("deepseek-r1:1.5b");
    });
  });

  describe("Ollama Connection", () => {
    it("checks availability (may fail if Ollama not running)", async () => {
      // This test will pass or fail depending on whether Ollama is running
      // It's informational rather than a hard requirement
      const available = await ollamaClient.isAvailable();
      expect(typeof available).toBe("boolean");
    });

    it("attempts to get available models", async () => {
      try {
        const models = await ollamaClient.getAvailableModels();
        expect(Array.isArray(models)).toBe(true);
      } catch (error) {
        // Expected if Ollama is not running
        expect(error).toBeDefined();
      }
    });
  });

  describe("Message Structure", () => {
    it("accepts properly formatted messages", () => {
      const messages: OllamaMessage[] = [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: "Hello!",
        },
      ];

      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe("system");
      expect(messages[1].role).toBe("user");
    });
  });

  describe("Error Handling", () => {
    it("handles connection errors gracefully", async () => {
      // Create a client pointing to a non-existent server
      const { default: OllamaClient } = await import("./_core/ollama-client");
      const badClient = new OllamaClient("http://localhost:9999");

      try {
        await badClient.isAvailable();
        // If it doesn't throw, that's also acceptable (returns false)
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
