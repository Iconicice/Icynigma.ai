/**
 * Local AI Agent Manager
 * 
 * Manages local AI models (Ollama, GGUF, etc.) for offline/private AI processing
 * This transforms Icynigma.ai into a Paage.ai-like local AI agent system
 */

import axios, { AxiosInstance } from "axios";
import { OllamaClient, getOllamaClient } from "./ollama-client";

// Supported model formats
export type ModelFormat = "gguf" | "safetensors" | "pytorch" | "executorch" | "unknown";

// Model information
export interface LocalModelInfo {
  name: string;
  size: string;
  digest: string;
  modifiedAt: string;
  loaded: boolean;
  format: ModelFormat;
}

// AI Provider types
export type AIProvider = "ollama" | "local-gguf" | "manus" | "custom";

export interface ModelConfig {
  provider: AIProvider;
  modelName: string;
  apiUrl?: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  useStreaming?: boolean;
}

// Supported models catalog
export const SUPPORTED_MODELS: Record<string, {
  name: string;
  description: string;
  provider: AIProvider;
  format: ModelFormat;
  requiresApiKey: boolean;
  recommended: boolean;
}> = {
  // Ollama models
  "deepseek-r1:1.5b": {
    name: "DeepSeek R1 1.5B",
    description: "Reasoning model with strong performance",
    provider: "ollama",
    format: "safetensors",
    requiresApiKey: false,
    recommended: true,
  },
  "llama3.2:3b": {
    name: "Llama 3.2 3B",
    description: "Efficient and capable model",
    provider: "ollama",
    format: "safetensors",
    requiresApiKey: false,
    recommended: true,
  },
  "mistral:7b": {
    name: "Mistral 7B",
    description: "Powerful open-source model",
    provider: "ollama",
    format: "safetensors",
    requiresApiKey: false,
    recommended: true,
  },
  "phi3:3.8b": {
    name: "Phi-3 3.8B",
    description: "Microsoft's efficient reasoning model",
    provider: "ollama",
    format: "safetensors",
    requiresApiKey: false,
    recommended: true,
  },
  "qwen2.5:7b": {
    name: "Qwen 2.5 7B",
    description: "Alibaba's advanced language model",
    provider: "ollama",
    format: "safetensors",
    requiresApiKey: false,
    recommended: false,
  },
  // GGUF models (for future local inference)
  "llama-2-7b-chat.gguf": {
    name: "Llama 2 7B Chat (GGUF)",
    description: "Llama 2 in GGUF format for local inference",
    provider: "local-gguf",
    format: "gguf",
    requiresApiKey: false,
    recommended: false,
  },
  "mistral-7b-instruct.gguf": {
    name: "Mistral 7B Instruct (GGUF)",
    description: "Mistral in GGUF format",
    provider: "local-gguf",
    format: "gguf",
    requiresApiKey: false,
    recommended: false,
  },
};

// User AI configuration
export interface UserAIConfig {
  id: number;
  userId: string;
  defaultProvider: AIProvider;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  useStreaming: boolean;
  ollamaUrl?: string;
  customApiUrl?: string;
  customApiKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

class LocalAIAgent {
  private ollamaClient: OllamaClient;
  private customClients: Map<string, AxiosInstance>;

  constructor() {
    this.ollamaClient = getOllamaClient();
    this.customClients = new Map();
  }

  /**
   * Get list of available models from Ollama
   */
  async getOllamaModels(): Promise<LocalModelInfo[]> {
    try {
      const models = await this.ollamaClient.getAvailableModels();
      return models.map((name) => ({
        name,
        size: "Unknown",
        digest: "",
        modifiedAt: new Date().toISOString(),
        loaded: true,
        format: this.detectFormat(name),
      }));
    } catch (error) {
      console.error("[LocalAI] Failed to get Ollama models:", error);
      return [];
    }
  }

  /**
   * Get list of all available local models
   */
  async getAvailableModels(): Promise<LocalModelInfo[]> {
    const ollamaModels = await this.getOllamaModels();
    
    // Add manually configured GGUF models (placeholder for future implementation)
    const ggufModels: LocalModelInfo[] = [];
    
    return [...ollamaModels, ...ggufModels];
  }

  /**
   * Get information about a specific model
   */
  getModelInfo(modelName: string): {
    name: string;
    description: string;
    provider: AIProvider;
    format: ModelFormat;
    requiresApiKey: boolean;
    recommended: boolean;
  } | null {
    const model = SUPPORTED_MODELS[modelName];
    if (model) return model;
    
    // Check if it's an Ollama model
    if (modelName.includes(":")) {
      return {
        name: modelName,
        description: `Ollama model: ${modelName}`,
        provider: "ollama",
        format: this.detectFormat(modelName),
        requiresApiKey: false,
        recommended: false,
      };
    }
    
    return null;
  }

  /**
   * Detect model format from name
   */
  private detectFormat(modelName: string): ModelFormat {
    if (modelName.endsWith(".gguf")) return "gguf";
    if (modelName.endsWith(".safetensors")) return "safetensors";
    if (modelName.endsWith(".pt") || modelName.endsWith(".pth")) return "pytorch";
    if (modelName.endsWith(".pte")) return "executorch";
    return "unknown";
  }

  /**
   * Check if a model is available and loaded
   */
  async isModelAvailable(modelName: string, provider: AIProvider = "ollama"): Promise<boolean> {
    if (provider === "ollama") {
      try {
        const models = await this.getOllamaModels();
        return models.some((m) => m.name === modelName);
      } catch {
        return false;
      }
    }
    
    // For other providers, we'd check their respective APIs
    return false;
  }

  /**
   * Pull/download a model (Ollama)
   */
  async pullModel(modelName: string): Promise<boolean> {
    try {
      await this.ollamaClient.pullModel(modelName);
      return true;
    } catch (error) {
      console.error(`[LocalAI] Failed to pull model ${modelName}:`, error);
      return false;
    }
  }

  /**
   * Load a model (for GGUF/local inference)
   */
  async loadModel(modelPath: string): Promise<boolean> {
    // Placeholder for GGUF/local model loading
    // This would integrate with a local inference engine
    console.log(`[LocalAI] Loading GGUF model: ${modelPath}`);
    // TODO: Implement GGUF model loading with libraries like llama.cpp
    return false;
  }

  /**
   * Send a chat message to the selected AI model
   */
  async chat(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    config: ModelConfig
  ): Promise<string> {
    switch (config.provider) {
      case "ollama":
        return this.ollamaClient.chat(messages);
      
      case "manus":
        // Fallback to Manus API (handled by existing llm.ts)
        throw new Error("Manus provider should use the main LLM integration");
      
      case "local-gguf":
        // TODO: Implement GGUF inference
        throw new Error("GGUF inference not yet implemented");
      
      case "custom":
        return this.chatCustom(messages, config);
      
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }

  /**
   * Stream chat response
   */
  async *chatStream(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    config: ModelConfig
  ): AsyncGenerator<string, void, unknown> {
    switch (config.provider) {
      case "ollama":
        yield* this.ollamaClient.chatStream(messages);
        break;
      
      case "manus":
        throw new Error("Manus provider should use the main LLM integration");
      
      case "local-gguf":
        // TODO: Implement GGUF streaming
        throw new Error("GGUF streaming not yet implemented");
      
      case "custom":
        yield* this.chatCustomStream(messages, config);
        break;
      
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }

  /**
   * Chat with custom API endpoint
   */
  private async chatCustom(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    config: ModelConfig
  ): Promise<string> {
    if (!config.apiUrl) {
      throw new Error("Custom API URL is required");
    }

    const client = this.getCustomClient(config.apiUrl, config.apiKey);
    
    const response = await client.post("/api/chat", {
      model: config.modelName,
      messages,
      stream: false,
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 4096,
    });

    return response.data.message?.content || response.data.choices?.[0]?.message?.content || "";
  }

  /**
   * Stream chat with custom API endpoint
   */
  private async *chatCustomStream(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    config: ModelConfig
  ): AsyncGenerator<string, void, unknown> {
    if (!config.apiUrl) {
      throw new Error("Custom API URL is required");
    }

    const client = this.getCustomClient(config.apiUrl, config.apiKey);
    
    const response = await client.post("/api/chat", {
      model: config.modelName,
      messages,
      stream: true,
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 4096,
    }, {
      responseType: "stream",
    });

    const stream = response.data;
    
    for await (const chunk of stream) {
      const lines = chunk.toString().split("\n");
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              yield data.message.content;
            } else if (data.choices?.[0]?.delta?.content) {
              yield data.choices[0].delta.content;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  /**
   * Get or create custom HTTP client
   */
  private getCustomClient(apiUrl: string, apiKey?: string): AxiosInstance {
    const key = `${apiUrl}:${apiKey || "no-key"}`;
    
    if (!this.customClients.has(key)) {
      const client = axios.create({
        baseURL: apiUrl,
        timeout: 300000,
        headers: {
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          "Content-Type": "application/json",
        },
      });
      this.customClients.set(key, client);
    }
    
    return this.customClients.get(key)!;
  }

  /**
   * Check if local AI is available (Ollama running)
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await this.ollamaClient.isAvailable();
    } catch {
      return false;
    }
  }

  /**
   * Get system prompt for local AI agent
   */
  getSystemPrompt(modelName: string, customPrompt?: string): string {
    const modelInfo = this.getModelInfo(modelName);
    const modelDesc = modelInfo?.description || modelName;
    
    if (customPrompt) {
      return customPrompt;
    }

    return `You are a local AI assistant running ${modelDesc}. You are intelligent, helpful, and provide accurate information. You can reason about complex topics and provide thoughtful responses. Your knowledge cutoff is recent and you have access to a wide range of information.`;
  }

  /**
   * Get default configuration for a model
   */
  getDefaultConfig(modelName: string): ModelConfig {
    const modelInfo = this.getModelInfo(modelName);
    
    return {
      provider: modelInfo?.provider || "ollama",
      modelName,
      temperature: 0.7,
      maxTokens: 4096,
      useStreaming: true,
    };
  }
}

// Singleton instance
export const localAIAgent = new LocalAIAgent();

export default LocalAIAgent;
