import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getChatHistory, saveChatMessage } from "./db";
import { getOriginalAIAgent } from "./_core/original-ai";

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
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("User not authenticated");
        }

        const aiAgent = getOriginalAIAgent();

        // Save user message
        await saveChatMessage(ctx.user.id, "user", input.message);

        // Generate AI response using original agent
        const { response, thinking } = await aiAgent.generateResponse(
          String(ctx.user.id).toString(),
          input.message
        );

        // Save AI response
        await saveChatMessage(ctx.user.id, "assistant", response);

        return {
          message: response,
          thinking: {
            question: thinking.question,
            reasoning: thinking.reasoning,
            conclusion: thinking.conclusion,
            confidence: thinking.confidence,
          },
        };
      }),

    getHistory: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        return [];
      }
      return getChatHistory(ctx.user.id);
    }),

    getConcepts: publicProcedure.query(() => {
      const aiAgent = getOriginalAIAgent();
      const concepts = aiAgent.getConcepts();
      return concepts.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        category: c.category,
      }));
    }),

    clearHistory: publicProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) {
        throw new Error("User not authenticated");
      }
      const aiAgent = getOriginalAIAgent();
      aiAgent.clearHistory(String(ctx.user.id));
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
