/**
 * Ollama API Client
 * 
 * Communicates with local Ollama instance running deepseek-r1:1.5b
 * Provides streaming and non-streaming chat completions
 */

import axios, { AxiosInstance } from "axios";

export interface OllamaMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  top_k?: number;
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: OllamaMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaStreamChunk {
  model: string;
  created_at: string;
  message: OllamaMessage;
  done: boolean;
}

class OllamaClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private model: string = "deepseek-r1:1.5b";

  constructor(baseUrl: string = "http://localhost:11434") {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 300000, // 5 minute timeout for long responses
    });
  }

  /**
   * Check if Ollama is available and the model is loaded
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.client.get("/api/tags");
      const models = response.data.models || [];
      return models.some((m: any) => m.name.includes("deepseek-r1"));
    } catch (error) {
      console.error("[Ollama] Connection failed:", error);
      return false;
    }
  }

  /**
   * Get list of available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await this.client.get("/api/tags");
      return (response.data.models || []).map((m: any) => m.name);
    } catch (error) {
      console.error("[Ollama] Failed to get models:", error);
      return [];
    }
  }

  /**
   * Send a chat message and get a response (non-streaming)
   */
  async chat(messages: OllamaMessage[]): Promise<string> {
    try {
      const request: OllamaChatRequest = {
        model: this.model,
        messages,
        stream: false,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
      };

      const response = await this.client.post<OllamaChatResponse>(
        "/api/chat",
        request
      );

      if (response.data.message && response.data.message.content) {
        return response.data.message.content;
      }

      throw new Error("Invalid response from Ollama");
    } catch (error) {
      console.error("[Ollama] Chat request failed:", error);
      throw new Error(
        `Failed to get response from Ollama: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Send a chat message and stream the response
   */
  async *chatStream(
    messages: OllamaMessage[]
  ): AsyncGenerator<string, void, unknown> {
    try {
      const request: OllamaChatRequest = {
        model: this.model,
        messages,
        stream: true,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
      };

      const response = await this.client.post("/api/chat", request, {
        responseType: "stream",
      });

      const stream = response.data;

      for await (const chunk of stream) {
        const lines = chunk.toString().split("\n");

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data: OllamaStreamChunk = JSON.parse(line);
              if (data.message && data.message.content) {
                yield data.message.content;
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      console.error("[Ollama] Stream request failed:", error);
      throw new Error(
        `Failed to stream from Ollama: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Generate a simple completion (not chat-based)
   */
  async generate(prompt: string): Promise<string> {
    try {
      const response = await this.client.post("/api/generate", {
        model: this.model,
        prompt,
        stream: false,
        temperature: 0.7,
      });

      return response.data.response || "";
    } catch (error) {
      console.error("[Ollama] Generate request failed:", error);
      throw new Error(
        `Failed to generate from Ollama: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Pull/download a model from Ollama registry
   */
  async pullModel(modelName: string): Promise<void> {
    try {
      await this.client.post("/api/pull", {
        name: modelName,
        stream: false,
      });
    } catch (error) {
      console.error("[Ollama] Pull model failed:", error);
      throw new Error(
        `Failed to pull model: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Set the active model
   */
  setModel(modelName: string): void {
    this.model = modelName;
  }

  /**
   * Get the current model
   */
  getModel(): string {
    return this.model;
  }
}

// Singleton instance
let ollamaClientInstance: OllamaClient | null = null;

export function getOllamaClient(): OllamaClient {
  if (!ollamaClientInstance) {
    const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    ollamaClientInstance = new OllamaClient(baseUrl);
  }
  return ollamaClientInstance;
}

export default OllamaClient;
