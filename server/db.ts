import { and, count, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  chatMessages,
  chatMessagesV2,
  conversations,
  type Conversation,
  type InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a database.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    if (user[field] === undefined) return;
    const value = user[field] ?? null;
    values[field] = value;
    updateSet[field] = value;
  });
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;

  try {
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// Legacy history helpers are retained for backwards compatibility with existing data and tests.
export async function getChatHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(chatMessages).where(eq(chatMessages.userId, userId)).orderBy(chatMessages.createdAt);
  } catch (error) {
    console.error("[Database] Failed to get chat history:", error);
    return [];
  }
}

export async function saveChatMessage(userId: number, role: "user" | "assistant" | "system", content: string) {
  const db = await getDb();
  if (!db) return null;
  try {
    return await db.insert(chatMessages).values({ userId, role, content });
  } catch (error) {
    console.error("[Database] Failed to save legacy chat message:", error);
    return null;
  }
}

export type ConversationSummary = Conversation & { messageCount: number };

export async function createConversation(userId: number, title = "New Chat"): Promise<Conversation | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(conversations).values({ userId, title: title.trim() || "New Chat" });
    const header = Array.isArray(result) ? result[0] : result;
    const id = Number((header as { insertId?: number | bigint }).insertId);
    if (!Number.isInteger(id) || id < 1) {
      throw new Error("Database did not return an inserted conversation ID");
    }
    const created = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
    return created[0] ?? null;
  } catch (error) {
    console.error("[Database] Failed to create conversation:", error);
    return null;
  }
}

export async function getConversations(userId: number): Promise<ConversationSummary[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    const rows = await db
      .select({
        id: conversations.id,
        userId: conversations.userId,
        title: conversations.title,
        description: conversations.description,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
        messageCount: count(chatMessagesV2.id),
      })
      .from(conversations)
      .leftJoin(chatMessagesV2, eq(chatMessagesV2.conversationId, conversations.id))
      .where(eq(conversations.userId, userId))
      .groupBy(
        conversations.id,
        conversations.userId,
        conversations.title,
        conversations.description,
        conversations.createdAt,
        conversations.updatedAt,
      )
      .orderBy(desc(conversations.updatedAt));

    return rows.map((row) => ({ ...row, messageCount: Number(row.messageCount) }));
  } catch (error) {
    console.error("[Database] Failed to get conversations:", error);
    return [];
  }
}

export async function getOwnedConversation(userId: number, conversationId: number): Promise<Conversation | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(conversations).where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId))).limit(1);
    return result[0] ?? null;
  } catch (error) {
    console.error("[Database] Failed to verify conversation ownership:", error);
    return null;
  }
}

export async function getConversationHistory(userId: number, conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(chatMessagesV2)
      .where(and(eq(chatMessagesV2.userId, userId), eq(chatMessagesV2.conversationId, conversationId)))
      .orderBy(chatMessagesV2.createdAt);
  } catch (error) {
    console.error("[Database] Failed to get conversation history:", error);
    return [];
  }
}

export async function saveConversationMessage(
  userId: number,
  conversationId: number,
  role: "user" | "assistant" | "system",
  content: string,
) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(chatMessagesV2).values({ userId, conversationId, role, content });
    await db.update(conversations).set({ updatedAt: new Date() }).where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)));
    return result;
  } catch (error) {
    console.error("[Database] Failed to save conversation message:", error);
    return null;
  }
}

export async function clearConversationMessages(conversationId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.delete(chatMessagesV2).where(and(eq(chatMessagesV2.conversationId, conversationId), eq(chatMessagesV2.userId, userId)));
    await db.update(conversations).set({ updatedAt: new Date() }).where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)));
    return true;
  } catch (error) {
    console.error("[Database] Failed to clear conversation messages:", error);
    return false;
  }
}

export async function deleteConversation(conversationId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    const conversation = await db.select().from(conversations).where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId))).limit(1);
    if (!conversation[0]) return false;
    await db.delete(chatMessagesV2).where(eq(chatMessagesV2.conversationId, conversationId));
    await db.delete(conversations).where(eq(conversations.id, conversationId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete conversation:", error);
    return false;
  }
}
