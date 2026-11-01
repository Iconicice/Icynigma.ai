export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",

  // Cloud model routing: verified Gemini route with compatibility fallback.
  llmModel: process.env.ICYNIGMA_LLM_MODEL ?? "gemini-3.8-flash",
  llmFallbackModel: process.env.ICYNIGMA_LLM_FALLBACK_MODEL ?? "gemini-3.5-flash-lite",
  llmThinkingBudget: Number(process.env.ICYNIGMA_LLM_THINKING_BUDGET ?? "256"),

  // Offline/local AI configuration. The model is opt-in and requires a local Ollama service.
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
  defaultAiProvider: process.env.DEFAULT_AI_PROVIDER ?? "ollama",
  defaultAiModel: process.env.DEFAULT_AI_MODEL ?? "liquid/lfm3-omni",
  customAiApiUrl: process.env.CUSTOM_AI_API_URL ?? "",
  customAiApiKey: process.env.CUSTOM_AI_API_KEY ?? "",

  // ElevenLabs credentials remain server-side only.
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY ?? "",
};
