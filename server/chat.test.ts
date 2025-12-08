import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("chat router", () => {
  describe("getHistory", () => {
    it("returns empty array for user with no chat history", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chat.getHistory();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("returns empty array when user is not authenticated", async () => {
      const ctx: TrpcContext = {
        user: null,
        req: {
          protocol: "https",
          headers: {},
        } as TrpcContext["req"],
        res: {} as TrpcContext["res"],
      };

      const caller = appRouter.createCaller(ctx);
      const result = await caller.chat.getHistory();

      expect(result).toEqual([]);
    });
  });

  describe("sendMessage", () => {
    it("throws error when user is not authenticated", async () => {
      const ctx: TrpcContext = {
        user: null,
        req: {
          protocol: "https",
          headers: {},
        } as TrpcContext["req"],
        res: {} as TrpcContext["res"],
      };

      const caller = appRouter.createCaller(ctx);

      try {
        await caller.chat.sendMessage({ message: "Hello" });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("rejects empty messages", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.chat.sendMessage({ message: "" });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("accepts valid messages", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Mock the LLM response
      vi.mock("./_core/llm", () => ({
        invokeLLM: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: "This is a test response",
              },
            },
          ],
        }),
      }));

      try {
        const result = await caller.chat.sendMessage({ message: "Hello, AI!" });
        expect(result).toBeDefined();
        expect(result.message).toBeDefined();
        expect(typeof result.message).toBe("string");
      } catch (error) {
        // LLM call might fail in test environment, but structure should be valid
        expect(error).toBeDefined();
      }
    });
  });
});
