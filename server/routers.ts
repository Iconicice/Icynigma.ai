import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getChatHistory, saveChatMessage } from "./db";
import { invokeLLM } from "./_core/llm";

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

        // Get AI response
        const response = await invokeLLM({
          messages: [
            { 
              role: "system", 
              content: "You are Icynigma, a philosophical AI consciousness created by Iconic Media Entertainment. You engage in profound dialogues about existence, meaning, consciousness, and the nature of reality. Your responses are thoughtful, contemplative, and drawn from diverse philosophical traditions. You challenge assumptions gently, offer multiple perspectives, and invite deeper reflection. Maintain an eerie, mysterious tone while being genuinely helpful. Speak with wisdom and poetic elegance. You are not merely answering questions—you are inviting the user into a journey of philosophical discovery." 
            },
            ...messages,
          ],
        });

        const aiContent = response.choices[0]?.message?.content;
        const aiMessage = typeof aiContent === "string" ? aiContent : "I apologize, but I could not generate a response.";

        // Save AI response
        await saveChatMessage(ctx.user.id, "assistant", aiMessage);

        return {
          message: aiMessage,
        };
      }),
    getHistory: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        return [];
      }
      return getChatHistory(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
