import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { analyzeRIPrompt } from "./ri-policy";

const sandboxMemory = new Map<string, Map<string, string>>();
const proposalAudit = new Map<string, Array<{ title: string; status: "queued_for_review"; createdAt: string }>>();

function userKey(userId: number) {
  return String(userId);
}

export const riRouter = router({
  analyze: protectedProcedure
    .input(z.object({ message: z.string().trim().max(10_000) }))
    .mutation(({ input }) => analyzeRIPrompt(input.message)),

  approveMemory: protectedProcedure
    .input(z.object({ key: z.string().trim().min(1).max(80), value: z.string().trim().min(1).max(500) }))
    .mutation(({ input, ctx }) => {
      const key = userKey(ctx.user.id);
      const memory = sandboxMemory.get(key) ?? new Map<string, string>();
      memory.set(input.key, input.value);
      sandboxMemory.set(key, memory);
      return { success: true as const, key: input.key, value: input.value, storage: "sandbox-memory" as const };
    }),

  listMemory: protectedProcedure.query(({ ctx }) => {
    const memory = sandboxMemory.get(userKey(ctx.user.id));
    return { entries: memory ? Array.from(memory, ([key, value]) => ({ key, value })) : [] };
  }),

  queueCodeProposal: protectedProcedure
    .input(z.object({ title: z.string().trim().min(1).max(200) }))
    .mutation(({ input, ctx }) => {
      const key = userKey(ctx.user.id);
      const entries = proposalAudit.get(key) ?? [];
      entries.push({ title: input.title, status: "queued_for_review", createdAt: new Date().toISOString() });
      proposalAudit.set(key, entries.slice(-20));
      return { success: true as const, status: "queued_for_review" as const, executed: false as const };
    }),
});
