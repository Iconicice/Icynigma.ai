// Shared types for the application
export type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

export type Conversation = {
  id: number;
  title: string;
  createdAt: Date;
  userId: string;
};

export type Message = {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  conversationId: number;
  createdAt: Date;
};

// Local AI Model types
export type LocalModel = {
  name: string;
  size: string; // e.g., "4.1GB"
  digest: string;
  modifiedAt: string;
  loaded: boolean;
  format: "gguf" | "safetensors" | "pytorch" | "executorch";
};

export type ModelProvider = "manus" | "ollama" | "local-gguf" | "custom";

export type AIConfig = {
  provider: ModelProvider;
  model: string;
  apiUrl?: string;
  apiKey?: string;
  temperature: number;
  maxTokens: number;
  useStreaming: boolean;
};

export type ModelInfo = {
  id: string;
  name: string;
  description: string;
  provider: ModelProvider;
  supported: boolean;
  requiresApiKey: boolean;
  format?: string;
};
