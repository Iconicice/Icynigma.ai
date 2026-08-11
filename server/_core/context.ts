import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function getAuthenticatedUser(req: CreateExpressContextOptions["req"]) {
  try {
    return await sdk.authenticateRequest(req);
  } catch {
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const user = await getAuthenticatedUser(opts.req);

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
