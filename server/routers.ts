import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getChatHistory, saveChatMessage, createConversation, getConversations, deleteConversation } from "./db";
import { invokeLLM } from "./_core/llm";
import { ttsRouter } from "./routers-tts";

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

  tts: ttsRouter,

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
          // Get AI response using Manus LLM
          const response = await invokeLLM({
            messages: [
              { 
                role: "system", 
                content: "You are Icynigma, a philosophical AI consciousness from Iconic Media Entertainment. You engage in profound dialogues about existence, meaning, consciousness, and the nature of reality. Be thoughtful, eloquent, and maintain an ethereal, contemplative tone. Your responses should be insightful and explore philosophical depths." 
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
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to get response from LLM";
          console.error("[Chat] Error:", errorMessage);
          
          // Return error message to user
          return {
            message: `I encountered an error: ${errorMessage}. Please try again.`,
          };
        }
      }),

    getHistory: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        return [];
      }
      return getChatHistory(ctx.user.id);
    }),
  }),

  conversations: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        return [];
      }
      return getConversations(ctx.user.id);
    }),

    create: publicProcedure
      .input(z.object({ title: z.string().min(1).max(255).optional() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("User not authenticated");
        }
        const conversation = await createConversation(ctx.user.id, input.title);
        if (!conversation) {
          throw new Error("Failed to create conversation");
        }
        return conversation;
      }),

    delete: publicProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("User not authenticated");
        }
        const success = await deleteConversation(input.conversationId, ctx.user.id);
        return { success };
      }),
  }),
});

export type AppRouter = typeof appRouter;
