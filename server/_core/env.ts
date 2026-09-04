export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  
  // Local AI configuration
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
  defaultAiProvider: process.env.DEFAULT_AI_PROVIDER ?? "ollama",
  defaultAiModel: process.env.DEFAULT_AI_MODEL ?? "llama3.2:3b",
  
  // Custom API for local AI
  customAiApiUrl: process.env.CUSTOM_AI_API_URL ?? "",
  customAiApiKey: process.env.CUSTOM_AI_API_KEY ?? "",
  
  // ElevenLabs for TTS
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY ?? "",
};
