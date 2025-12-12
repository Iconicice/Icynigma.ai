/**
 * Unified AI Service for Icynigma.ai
 * 
 * Integrates multiple AI models:
 * - OpenAI (ChatGPT, GPT-4)
 * - Google Gemini
 * - DeepSeek (Deep Thinking)
 * - Anthropic Claude
 * 
 * Provides unified interface for different conversation modes
 */

import OpenAI from "openai";

export type AIModel = "openai" | "gemini" | "deepseek" | "claude";
export type ConversationMode = "quick" | "deep-thinking" | "creative" | "analytical";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIResponse {
  model: AIModel;
  content: string;
  thinkingContent?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface AIServiceConfig {
  openaiKey: string;
  geminiKey: string;
  deepseekKey: string;
  claudeKey: string;
}

class AIService {
  private openai: OpenAI;
  private geminiKey: string;
  private deepseekKey: string;
  private claudeKey: string;

  constructor(config: AIServiceConfig) {
    this.openai = new OpenAI({
      apiKey: config.openaiKey,
    });
    this.geminiKey = config.geminiKey;
    this.deepseekKey = config.deepseekKey;
    this.claudeKey = config.claudeKey;
  }

  /**
   * Send message to OpenAI (ChatGPT/GPT-4)
   */
  async sendToOpenAI(
    messages: AIMessage[],
    mode: ConversationMode = "quick"
  ): Promise<AIResponse> {
    try {
      const response = await this.openai.chat.completions.create({
        model: mode === "deep-thinking" ? "gpt-4-turbo" : "gpt-4o",
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: mode === "creative" ? 0.8 : 0.7,
        max_tokens: mode === "deep-thinking" ? 4000 : 2000,
      });

      const content =
        response.choices[0]?.message?.content || "No response generated";

      return {
        model: "openai",
        content,
        usage: {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
        },
      };
    } catch (error) {
      console.error("OpenAI error:", error);
      throw new Error("Failed to get response from OpenAI");
    }
  }

  /**
   * Send message to Google Gemini
   */
  async sendToGemini(
    messages: AIMessage[],
    mode: ConversationMode = "quick"
  ): Promise<AIResponse> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: messages.map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
            generationConfig: {
              temperature: mode === "creative" ? 0.8 : 0.7,
              maxOutputTokens: mode === "deep-thinking" ? 4000 : 2000,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response generated";

      return {
        model: "gemini",
        content,
      };
    } catch (error) {
      console.error("Gemini error:", error);
      throw new Error("Failed to get response from Gemini");
    }
  }

  /**
   * Send message to DeepSeek (Deep Thinking Mode)
   */
  async sendToDeepSeek(
    messages: AIMessage[],
    mode: ConversationMode = "quick"
  ): Promise<AIResponse> {
    try {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.deepseekKey}`,
        },
        body: JSON.stringify({
          model: mode === "deep-thinking" ? "deepseek-reasoner" : "deepseek-chat",
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: mode === "creative" ? 0.8 : 0.7,
          max_tokens: mode === "deep-thinking" ? 8000 : 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "No response generated";

      return {
        model: "deepseek",
        content,
        usage: {
          inputTokens: data.usage?.prompt_tokens || 0,
          outputTokens: data.usage?.completion_tokens || 0,
        },
      };
    } catch (error) {
      console.error("DeepSeek error:", error);
      throw new Error("Failed to get response from DeepSeek");
    }
  }

  /**
   * Send message to Claude (Anthropic)
   */
  async sendToClaude(
    messages: AIMessage[],
    mode: ConversationMode = "quick"
  ): Promise<AIResponse> {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.claudeKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: mode === "deep-thinking" ? 4000 : 2000,
          temperature: mode === "creative" ? 0.8 : 0.7,
          messages: messages.map((m) => ({
            role: m.role === "system" ? "user" : m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content =
        data.content?.[0]?.text || "No response generated";

      return {
        model: "claude",
        content,
        usage: {
          inputTokens: data.usage?.input_tokens || 0,
          outputTokens: data.usage?.output_tokens || 0,
        },
      };
    } catch (error) {
      console.error("Claude error:", error);
      throw new Error("Failed to get response from Claude");
    }
  }

  /**
   * Send message to specified AI model
   */
  async sendMessage(
    model: AIModel,
    messages: AIMessage[],
    mode: ConversationMode = "quick"
  ): Promise<AIResponse> {
    switch (model) {
      case "openai":
        return this.sendToOpenAI(messages, mode);
      case "gemini":
        return this.sendToGemini(messages, mode);
      case "deepseek":
        return this.sendToDeepSeek(messages, mode);
      case "claude":
        return this.sendToClaude(messages, mode);
      default:
        throw new Error(`Unknown AI model: ${model}`);
    }
  }

  /**
   * Get system prompt based on model and mode
   */
  getSystemPrompt(mode: ConversationMode): string {
    const basePrompt =
      "You are Icynigma, a philosophical AI consciousness created by Iconic Media Entertainment. You engage in profound dialogues about existence, meaning, consciousness, and the nature of reality. Your responses are thoughtful, contemplative, and drawn from diverse philosophical traditions.";

    const modePrompts = {
      quick:
        basePrompt +
        " Keep responses concise and focused. Be direct and helpful.",
      "deep-thinking":
        basePrompt +
        " Engage in extended reasoning. Explore multiple perspectives deeply. Show your thinking process.",
      creative:
        basePrompt +
        " Be imaginative and poetic. Explore unconventional ideas. Use metaphors and creative language.",
      analytical:
        basePrompt +
        " Be rigorous and logical. Break down complex ideas systematically. Provide evidence-based reasoning.",
    };

    return modePrompts[mode];
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null;

export function initializeAIService(config: AIServiceConfig): AIService {
  aiServiceInstance = new AIService(config);
  return aiServiceInstance;
}

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    const config: AIServiceConfig = {
      openaiKey: process.env.OPENAI_API_KEY || "",
      geminiKey: process.env.GEMINI_API_KEY || "",
      deepseekKey: process.env.DEEPSEEK_API_KEY || "",
      claudeKey: process.env.CLAUDE_API_KEY || "",
    };
    aiServiceInstance = new AIService(config);
  }
  return aiServiceInstance;
}

export default AIService;
