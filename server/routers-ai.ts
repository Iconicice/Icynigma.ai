/**
 * AI Configuration and Model Management Router
 * 
 * Provides API endpoints for managing local AI models and configurations
 * This transforms Icynigma.ai into a Paage.ai-like local AI agent system
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { localAIAgent, SUPPORTED_MODELS, type AIProvider, type LocalModelInfo, type ModelConfig } from "./_core/local-ai-agent";
import { ENV } from "./_core/env";

// Database schema for user AI configurations (would be added to drizzle/schema.ts)
// For now, we'll use in-memory storage for demonstration
interface UserAIConfig {
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

// In-memory storage for user configurations (replace with database later)
const userConfigurations: Map<string, UserAIConfig> = new Map();

function getDefaultConfig(userId: string): UserAIConfig {
  return {
    id: Date.now(),
    userId,
    defaultProvider: (ENV.defaultAiProvider as AIProvider) || "ollama",
    defaultModel: ENV.defaultAiModel || "llama3.2:3b",
    temperature: 0.7,
    maxTokens: 4096,
    useStreaming: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export const aiRouter = router({
  // Get available AI models
  getAvailableModels: publicProcedure.query(async () => {
    try {
      const models = await localAIAgent.getAvailableModels();
      
      // Add supported models that might not be loaded yet
      const allModels = Object.entries(SUPPORTED_MODELS).map(([id, info]) => ({
        name: id,
        displayName: info.name,
        description: info.description,
        provider: info.provider,
        format: info.format,
        requiresApiKey: info.requiresApiKey,
        recommended: info.recommended,
        loaded: models.some(m => m.name === id),
      }));
      
      return { 
        success: true, 
        models: allModels, 
        localModels: models,
        ollamaAvailable: await localAIAgent.isAvailable(),
      };
    } catch (error) {
      console.error("[AI Router] Failed to get models:", error);
      return { 
        success: false, 
        error: "Failed to retrieve available models",
        models: [],
        localModels: [],
        ollamaAvailable: false,
      };
    }
  }),

  // Get information about a specific model
  getModelInfo: publicProcedure
    .input(z.object({ modelName: z.string() }))
    .query(({ input }) => {
      const modelInfo = localAIAgent.getModelInfo(input.modelName);
      
      if (!modelInfo) {
        return { 
          success: false, 
          error: "Model not found",
        };
      }
      
      return { 
        success: true, 
        model: {
          name: input.modelName,
          ...modelInfo,
        },
      };
    }),

  // Pull/download a model (Ollama)
  pullModel: protectedProcedure
    .input(z.object({ modelName: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const success = await localAIAgent.pullModel(input.modelName);
        
        if (!success) {
          return { 
            success: false, 
            error: "Failed to pull model",
          };
        }
        
        return { 
          success: true, 
          message: `Model ${input.modelName} is being downloaded`,
        };
      } catch (error) {
        console.error("[AI Router] Failed to pull model:", error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Check if Ollama/local AI is available
  checkAvailability: publicProcedure.query(async () => {
    try {
      const available = await localAIAgent.isAvailable();
      return { 
        success: true, 
        available,
        ollamaUrl: ENV.ollamaBaseUrl,
      };
    } catch (error) {
      return { 
        success: true, // Don't fail, just return unavailable
        available: false,
        ollamaUrl: ENV.ollamaBaseUrl,
      };
    }
  }),

  // Get user AI configuration
  getUserConfig: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.user.id;
    
    if (!userConfigurations.has(userId)) {
      // Create default configuration
      const defaultConfig = getDefaultConfig(userId);
      userConfigurations.set(userId, defaultConfig);
    }
    
    const config = userConfigurations.get(userId)!;
    
    return { 
      success: true, 
      config: {
        ...config,
        // Don't expose sensitive keys
        customApiKey: config.customApiKey ? "***" : undefined,
      },
    };
  }),

  // Update user AI configuration
  updateUserConfig: protectedProcedure
    .input(z.object({
      defaultProvider: z.enum(["ollama", "local-gguf", "manus", "custom"] as const).optional(),
      defaultModel: z.string().optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().int().min(1).max(32768).optional(),
      useStreaming: z.boolean().optional(),
      ollamaUrl: z.string().url().optional(),
      customApiUrl: z.string().url().optional(),
      customApiKey: z.string().optional(),
    }))
    .mutation(({ input, ctx }) => {
      const userId = ctx.user.id;
      
      if (!userConfigurations.has(userId)) {
        userConfigurations.set(userId, getDefaultConfig(userId));
      }
      
      const config = userConfigurations.get(userId)!;
      
      // Update configuration
      if (input.defaultProvider !== undefined) {
        config.defaultProvider = input.defaultProvider;
      }
      if (input.defaultModel !== undefined) {
        config.defaultModel = input.defaultModel;
      }
      if (input.temperature !== undefined) {
        config.temperature = input.temperature;
      }
      if (input.maxTokens !== undefined) {
        config.maxTokens = input.maxTokens;
      }
      if (input.useStreaming !== undefined) {
        config.useStreaming = input.useStreaming;
      }
      if (input.ollamaUrl !== undefined) {
        config.ollamaUrl = input.ollamaUrl;
      }
      if (input.customApiUrl !== undefined) {
        config.customApiUrl = input.customApiUrl;
      }
      if (input.customApiKey !== undefined) {
        config.customApiKey = input.customApiKey;
      }
      
      config.updatedAt = new Date();
      
      return { 
        success: true, 
        config: {
          ...config,
          customApiKey: config.customApiKey ? "***" : undefined,
        },
      };
    }),

  // Get recommended models
  getRecommendedModels: publicProcedure.query(() => {
    const recommended = Object.entries(SUPPORTED_MODELS)
      .filter(([_, info]) => info.recommended)
      .map(([id, info]) => ({
        name: id,
        displayName: info.name,
        description: info.description,
        provider: info.provider,
        format: info.format,
      }));
    
    return { 
      success: true, 
      models: recommended,
    };
  }),

  // Test a model connection
  testModel: protectedProcedure
    .input(z.object({ 
      modelName: z.string(),
      provider: z.enum(["ollama", "local-gguf", "manus", "custom"] as const).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const provider = input.provider || "ollama";
        const config: ModelConfig = {
          provider,
          modelName: input.modelName,
          temperature: 0.7,
          maxTokens: 100,
        };
        
        // Test with a simple message
        const testMessages = [
          { role: "system", content: "You are a helpful assistant. Respond with just 'OK' to this test." },
          { role: "user", content: "Test connection" },
        ];
        
        const response = await localAIAgent.chat(testMessages, config);
        
        return { 
          success: true, 
          response: response.slice(0, 100), // Limit response size
          connected: true,
        };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error",
          connected: false,
        };
      }
    }),

  // Get system prompt for a model
  getSystemPrompt: publicProcedure
    .input(z.object({ 
      modelName: z.string(),
      customPrompt: z.string().optional(),
    }))
    .query(({ input }) => {
      const prompt = localAIAgent.getSystemPrompt(input.modelName, input.customPrompt);
      return { 
        success: true, 
        prompt,
      };
    }),

  // Get default configuration for a model
  getDefaultConfig: publicProcedure
    .input(z.object({ modelName: z.string() }))
    .query(({ input }) => {
      const config = localAIAgent.getDefaultConfig(input.modelName);
      return { 
        success: true, 
        config,
      };
    }),
});
