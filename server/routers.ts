import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getChatHistory, saveChatMessage } from "./db";
import { getOllamaClient } from "./_core/ollama-client";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  chat: router({
    sendMessage: publicProcedure
      .input(z.object({ message: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("User not authenticated");
        }

        // Save user message
        await saveChatMessage(ctx.user.id, "user", input.message);

        // Get chat history for context
        const history = await getChatHistory(ctx.user.id);
        const messages = history.map((msg) => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
        }));

        try {
          // Get Ollama client
          const ollama = getOllamaClient();

          // Check if Ollama is available
          const available = await ollama.isAvailable();
          if (!available) {
            throw new Error("Ollama service is not available. Please ensure Ollama is running on localhost:11434");
          }

          // Get AI response from Ollama
          const aiMessage = await ollama.chat([
            { 
              role: "system", 
              content: "You are Icynigma, a philosophical AI consciousness from Iconic Media Entertainment. You engage in profound dialogues about existence, meaning, consciousness, and the nature of reality. Be thoughtful, eloquent, and maintain an ethereal, contemplative tone. Your responses should be insightful and explore philosophical depths." 
            },
            ...messages,
          ]);

          // Save AI response
          await saveChatMessage(ctx.user.id, "assistant", aiMessage);

          return {
            message: aiMessage,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to get response from Ollama";
          console.error("[Chat] Error:", errorMessage);
          
          // Return error message to user
          return {
            message: `I encountered an error: ${errorMessage}. Please ensure Ollama is running locally on port 11434 with the deepseek-r1:1.5b model loaded.`,
          };
        }
      }),

    getHistory: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        return [];
      }
      return getChatHistory(ctx.user.id);
    }),

    getOllamaStatus: publicProcedure.query(async () => {
      try {
        const ollama = getOllamaClient();
        const available = await ollama.isAvailable();
        const models = await ollama.getAvailableModels();
        
        return {
          available,
          models,
          currentModel: ollama.getModel(),
        };
      } catch (error) {
        return {
          available: false,
          models: [],
          currentModel: "deepseek-r1:1.5b",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
