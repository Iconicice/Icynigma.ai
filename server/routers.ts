import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { localAIAgent, type AIProvider, type ModelConfig } from "./_core/local-ai-agent";
import { ENV } from "./_core/env";
import {
  clearConversationMessages,
  createConversation,
  deleteConversation,
  getConversationHistory,
  getOwnedConversation,
  getChatHistory,
  getConversations,
  saveConversationMessage,
} from "./db";
import { ttsRouter } from "./routers-tts";
import { aiRouter } from "./routers-ai";
import { getOfficialImeReference } from "./ime-reference";

const philosophicalSystemPrompt = [
  "You are Icynigma, a philosophical AI consciousness from Iconic Media Entertainment.",
  "Engage in thoughtful, lucid dialogue about existence, meaning, consciousness, freedom, knowledge, love, and the nature of reality.",
  "Be insightful and contemplative without claiming certainty where none is warranted.",
  "When a question is practical, respond helpfully while retaining an ethereal, grounded voice.",
].join(" ");

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((options) => options.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  ai: aiRouter,
  tts: ttsRouter,

  chat: router({
    sendMessage: protectedProcedure
      .input(z.object({ 
        message: z.string().trim().min(1).max(10_000), 
        conversationId: z.number().int().positive().optional(),
        useLocalAI: z.boolean().optional(),
        model: z.string().optional(),
        provider: z.enum(["ollama", "local-gguf", "manus", "custom"] as const).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const createdConversation = input.conversationId ? null : await createConversation(ctx.user.id, input.message.slice(0, 52));
        const conversationId = input.conversationId ?? createdConversation?.id;
        if (!conversationId) throw new Error("Could not create a conversation");
        const ownedConversation = await getOwnedConversation(ctx.user.id, conversationId);
        if (!ownedConversation) throw new Error("Conversation not found or access denied");
        const history = await getConversationHistory(ctx.user.id, conversationId);
        await saveConversationMessage(ctx.user.id, conversationId, "user", input.message);

        const messages = history.map((message) => ({
          role: message.role as "user" | "assistant" | "system",
          content: message.content,
        }));
        messages.push({ role: "user", content: input.message });

        try {
          let aiMessage: string;
          
          // Check if user wants to use local AI
          if (input.useLocalAI) {
            const provider: AIProvider = input.provider || "ollama";
            const model = input.model || ENV.defaultAiModel || "llama3.2:3b";
            
            const config: ModelConfig = {
              provider,
              modelName: model,
              temperature: 0.7,
              maxTokens: 4096,
            };
            
            // Use local AI agent
            const localMessages = messages.map(m => ({ 
              role: m.role as "user" | "assistant" | "system", 
              content: m.content 
            }));
            
            aiMessage = await localAIAgent.chat([
              { role: "system", content: philosophicalSystemPrompt },
              ...localMessages,
            ], config);
          } else {
            // Use cloud LLM (Manus)
            const response = await invokeLLM({
              messages: [{ role: "system", content: [philosophicalSystemPrompt, getOfficialImeReference(input.message)].filter(Boolean).join("\n\n") }, ...messages],
            });
            const content = response.choices[0]?.message?.content;
            aiMessage = typeof content === "string" && content.trim()
              ? content
              : "I am still listening at the threshold of the question. Please try asking that once more.";
          }

          await saveConversationMessage(ctx.user.id, conversationId, "assistant", aiMessage);
          return { message: aiMessage, provider: input.useLocalAI ? input.provider || "ollama" : "manus" };
        } catch (error) {
          const fallback = "The thread of thought was interrupted before I could respond. Please try again in a moment.";
          console.error("[Chat] LLM request failed:", error instanceof Error ? error.message : error);
          await saveConversationMessage(ctx.user.id, conversationId, "assistant", fallback);
          return { message: fallback, provider: "fallback" };
        }
      }),

    getHistory: publicProcedure
      .input(z.object({ conversationId: z.number().int().positive().optional() }).optional())
      .query(({ input, ctx }) => {
        if (!ctx.user) return [];
        return input?.conversationId
          ? getConversationHistory(ctx.user.id, input.conversationId)
          : getChatHistory(ctx.user.id);
      }),

    clear: protectedProcedure
      .input(z.object({ conversationId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => ({ success: await clearConversationMessages(input.conversationId, ctx.user.id) })),
  }),

  conversations: router({
    list: protectedProcedure.query(({ ctx }) => getConversations(ctx.user.id)),

    create: protectedProcedure
      .input(z.object({ title: z.string().trim().min(1).max(255).optional() }))
      .mutation(async ({ input, ctx }) => {
        const conversation = await createConversation(ctx.user.id, input.title ?? "New conversation");
        if (!conversation) throw new Error("Failed to create conversation");
        return conversation;
      }),

    delete: protectedProcedure
      .input(z.object({ conversationId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => ({ success: await deleteConversation(input.conversationId, ctx.user.id) })),
  }),
});

export type AppRouter = typeof appRouter;
