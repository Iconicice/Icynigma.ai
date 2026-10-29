export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  llmModel: process.env.ICYNIGMA_LLM_MODEL ?? "gemini-3.8-flash",
  llmFallbackModel: process.env.ICYNIGMA_LLM_FALLBACK_MODEL ?? "gemini-3.5-flash-lite",
  llmThinkingBudget: Number(process.env.ICYNIGMA_LLM_THINKING_BUDGET ?? "256"),
};
