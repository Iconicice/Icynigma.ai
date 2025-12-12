import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getChatHistory, saveChatMessage } from "./db";
import { getAIService, type AIModel, type ConversationMode } from "./_core/ai-service";

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
      .input(z.object({ 
        message: z.string().min(1),
        model: z.enum(["openai", "gemini", "deepseek", "claude"]).default("openai"),
        mode: z.enum(["quick", "deep-thinking", "creative", "analytical"]).default("quick"),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("User not authenticated");
        }

        const aiService = getAIService();

        // Save user message
        await saveChatMessage(ctx.user.id, "user", input.message);

        // Get chat history for context
        const history = await getChatHistory(ctx.user.id);
        const messages = history.map((msg) => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
        }));

        // Get system prompt based on mode
        const systemPrompt = aiService.getSystemPrompt(input.mode);

        // Get AI response from selected model
        const response = await aiService.sendMessage(
          input.model as AIModel,
          [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          input.mode as ConversationMode
        );

        const aiMessage = response.content;

        // Save AI response
        await saveChatMessage(ctx.user.id, "assistant", aiMessage);

        return {
          message: aiMessage,
          model: response.model,
          usage: response.usage,
        };
      }),

    getHistory: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        return [];
      }
      return getChatHistory(ctx.user.id);
    }),

    getAvailableModels: publicProcedure.query(() => {
      return [
        {
          id: "openai",
          name: "ChatGPT (OpenAI)",
          description: "Advanced conversational AI with GPT-4 capabilities",
          icon: "🤖",
          capabilities: ["quick-chat", "deep-thinking", "creative"],
        },
        {
          id: "gemini",
          name: "Gemini (Google)",
          description: "Multi-modal AI with advanced reasoning",
          icon: "✨",
          capabilities: ["quick-chat", "deep-thinking", "analytical"],
        },
        {
          id: "deepseek",
          name: "DeepSeek",
          description: "Extended reasoning and deep thinking capabilities",
          icon: "🧠",
          capabilities: ["deep-thinking", "analytical"],
        },
        {
          id: "claude",
          name: "Claude (Anthropic)",
          description: "Thoughtful AI with nuanced understanding",
          icon: "🎭",
          capabilities: ["quick-chat", "creative", "analytical"],
        },
      ];
    }),

    getConversationModes: publicProcedure.query(() => {
      return [
        {
          id: "quick",
          name: "Quick Chat",
          description: "Fast, focused responses for immediate answers",
          icon: "⚡",
        },
        {
          id: "deep-thinking",
          name: "Deep Thinking",
          description: "Extended reasoning with thorough analysis",
          icon: "🧠",
        },
        {
          id: "creative",
          name: "Creative",
          description: "Imaginative and poetic responses",
          icon: "🎨",
        },
        {
          id: "analytical",
          name: "Analytical",
          description: "Rigorous logic and evidence-based reasoning",
          icon: "📊",
        },
      ];
    }),

    webSearch: publicProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ input }) => {
        const { getAdvancedFeaturesService } = await import("./_core/advanced-features");
        const features = getAdvancedFeaturesService();
        return features.webSearch(input.query);
      }),

    analyzeImage: publicProcedure
      .input(z.object({ imageUrl: z.string().url(), question: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("User not authenticated");
        }
        const { getAdvancedFeaturesService } = await import("./_core/advanced-features");
        const features = getAdvancedFeaturesService();
        return features.analyzeImage(input.imageUrl, input.question, process.env.CLAUDE_API_KEY || "");
      }),

    deepThinking: publicProcedure
      .input(z.object({ question: z.string().min(1), context: z.array(z.string()).default([]) }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("User not authenticated");
        }
        const { getAdvancedFeaturesService } = await import("./_core/advanced-features");
        const features = getAdvancedFeaturesService();
        return features.deepThinking(input.question, input.context, process.env.DEEPSEEK_API_KEY || "");
      }),
  }),
});

export type AppRouter = typeof appRouter;
