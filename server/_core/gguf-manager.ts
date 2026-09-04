/**
 * GGUF Model Manager
 * 
 * Manages GGUF format models for local inference
 * Supports loading, running, and managing GGUF models with llama.cpp or similar engines
 */

import { exec, spawn, ChildProcess } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

// GGUF Model information
export interface GGUFModel {
  name: string;
  filePath: string;
  size: number; // in bytes
  quant: string; // e.g., "Q4_K_M"
  modifiedAt: Date;
  loaded: boolean;
  process?: ChildProcess;
}

// GGUF Model metadata
export interface GGUFMetadata {
  general: {
    architecture: string;
    author: string;
    name: string;
    description: string;
    license: string;
  };
  llm: {
    context_length: number;
    embedding_length: number;
    block_count: number;
    head_count: number;
    layer_count: number;
  };
  training: {
    training_algorithm: string;
    dataset: string;
  };
  quantization: {
    type: string;
    bits: number;
  };
}

class GGUFManager {
  private models: Map<string, GGUFModel> = new Map();
  private modelsDir: string;
  private serverProcesses: Map<string, ChildProcess> = new Map();

  constructor(modelsDir: string = path.join(process.cwd(), "gguf-models")) {
    this.modelsDir = modelsDir;
  }

  /**
   * Initialize the GGUF manager
   */
  async initialize(): Promise<void> {
    try {
      // Ensure models directory exists
      await fs.mkdir(this.modelsDir, { recursive: true });
      
      // Scan for existing GGUF files
      const files = await fs.readdir(this.modelsDir);
      
      for (const file of files) {
        if (file.endsWith(".gguf")) {
          const filePath = path.join(this.modelsDir, file);
          const stat = await fs.stat(filePath);
          
          const model: GGUFModel = {
            name: path.basename(file, ".gguf"),
            filePath,
            size: stat.size,
            quant: this.extractQuantFromFilename(file),
            modifiedAt: stat.mtime,
            loaded: false,
          };
          
          this.models.set(model.name, model);
        }
      }
      
      console.log(`[GGUF Manager] Found ${this.models.size} GGUF models in ${this.modelsDir}`);
    } catch (error) {
      console.error("[GGUF Manager] Initialization failed:", error);
      throw error;
    }
  }

  /**
   * Extract quantization info from filename
   */
  private extractQuantFromFilename(filename: string): string {
    const match = filename.match(/Q\d+_K[MS]?/i);
    if (match) return match[0];
    
    const simpleMatch = filename.match(/Q\d+/i);
    if (simpleMatch) return simpleMatch[0];
    
    return "Unknown";
  }

  /**
   * Get list of available GGUF models
   */
  async getAvailableModels(): Promise<GGUFModel[]> {
    return Array.from(this.models.values());
  }

  /**
   * Get information about a specific model
   */
  async getModelInfo(modelName: string): Promise<GGUFModel | null> {
    return this.models.get(modelName) || null;
  }

  /**
   * Check if a model is loaded
   */
  isModelLoaded(modelName: string): boolean {
    const model = this.models.get(modelName);
    return model?.loaded || false;
  }

  /**
   * Load a GGUF model into memory
   * This uses llama.cpp or similar engine to load the model
   */
  async loadModel(modelName: string, contextSize: number = 4096): Promise<boolean> {
    const model = this.models.get(modelName);
    
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    if (model.loaded) {
      console.log(`[GGUF Manager] Model ${modelName} is already loaded`);
      return true;
    }

    try {
      // Check if llama.cpp is available
      const llamaCppAvailable = await this.checkLlamaCppAvailable();
      
      if (!llamaCppAvailable) {
        throw new Error("llama.cpp not found. Please install it first.");
      }

      // Start the model server process
      const process = spawn(
        "llama-server",
        [
          "-m", model.filePath,
          "-c", contextSize.toString(),
          "-np", "4", // number of threads
          "-ngl", "1", // number of GPU layers
        ],
        {
          stdio: ["ignore", "pipe", "pipe"],
        }
      );

      // Store the process
      model.process = process;
      model.loaded = true;
      this.models.set(modelName, model);
      this.serverProcesses.set(modelName, process);

      // Handle process events
      process.on("error", (error) => {
        console.error(`[GGUF Manager] Model ${modelName} process error:`, error);
        model.loaded = false;
        this.models.set(modelName, model);
      });

      process.on("exit", (code) => {
        console.log(`[GGUF Manager] Model ${modelName} process exited with code ${code}`);
        model.loaded = false;
        this.models.set(modelName, model);
        this.serverProcesses.delete(modelName);
      });

      // Wait for server to start (simple timeout for now)
      await new Promise((resolve) => setTimeout(resolve, 5000));

      console.log(`[GGUF Manager] Model ${modelName} loaded successfully`);
      return true;
    } catch (error) {
      console.error(`[GGUF Manager] Failed to load model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Unload a GGUF model
   */
  async unloadModel(modelName: string): Promise<boolean> {
    const model = this.models.get(modelName);
    
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    if (!model.loaded) {
      return true;
    }

    try {
      // Kill the server process
      if (model.process) {
        model.process.kill();
        this.serverProcesses.delete(modelName);
      }

      model.loaded = false;
      model.process = undefined;
      this.models.set(modelName, model);

      console.log(`[GGUF Manager] Model ${modelName} unloaded`);
      return true;
    } catch (error) {
      console.error(`[GGUF Manager] Failed to unload model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Check if llama.cpp is available
   */
  private async checkLlamaCppAvailable(): Promise<boolean> {
    try {
      await execAsync("llama-server --version");
      return true;
    } catch {
      try {
        await execAsync("which llama-server");
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Download a GGUF model from a URL
   */
  async downloadModel(url: string, targetName?: string): Promise<GGUFModel> {
    try {
      // Generate a filename
      const filename = targetName || path.basename(url);
      const filePath = path.join(this.modelsDir, filename);

      // Simple download using curl (would use better HTTP client in production)
      await execAsync(`curl -L -o "${filePath}" "${url}"`);

      const stat = await fs.stat(filePath);

      const model: GGUFModel = {
        name: path.basename(filename, ".gguf"),
        filePath,
        size: stat.size,
        quant: this.extractQuantFromFilename(filename),
        modifiedAt: stat.mtime,
        loaded: false,
      };

      this.models.set(model.name, model);

      console.log(`[GGUF Manager] Downloaded model ${model.name} from ${url}`);
      return model;
    } catch (error) {
      console.error("[GGUF Manager] Failed to download model:", error);
      throw error;
    }
  }

  /**
   * Delete a GGUF model
   */
  async deleteModel(modelName: string): Promise<boolean> {
    const model = this.models.get(modelName);
    
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    try {
      // Unload if loaded
      if (model.loaded) {
        await this.unloadModel(modelName);
      }

      // Delete the file
      await fs.unlink(model.filePath);

      // Remove from map
      this.models.delete(modelName);

      console.log(`[GGUF Manager] Deleted model ${modelName}`);
      return true;
    } catch (error) {
      console.error(`[GGUF Manager] Failed to delete model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Get metadata from a GGUF file
   */
  async getModelMetadata(modelName: string): Promise<GGUFMetadata | null> {
    const model = this.models.get(modelName);
    
    if (!model) {
      return null;
    }

    try {
      // Use llm-inspect or similar tool to get metadata
      // This is a placeholder - actual implementation would use a proper GGUF parser
      const { stdout } = await execAsync(`llm-inspect --metadata "${model.filePath}"`);
      return JSON.parse(stdout) as GGUFMetadata;
    } catch {
      // Fallback to basic metadata
      return {
        general: {
          architecture: "llama",
          author: "Unknown",
          name: model.name,
          description: `GGUF model: ${model.name}`,
          license: "Unknown",
        },
        llm: {
          context_length: 4096,
          embedding_length: 4096,
          block_count: 0,
          head_count: 0,
          layer_count: 0,
        },
        training: {
          training_algorithm: "Unknown",
          dataset: "Unknown",
        },
        quantization: {
          type: model.quant,
          bits: this.extractBitsFromQuant(model.quant),
        },
      };
    }
  }

  /**
   * Extract bits from quantization string
   */
  private extractBitsFromQuant(quant: string): number {
    const match = quant.match(/Q(\d+)/i);
    if (match) return parseInt(match[1]);
    return 8; // Default
  }

  /**
   * Send a chat message to a loaded GGUF model
   */
  async chat(
    modelName: string,
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    temperature: number = 0.7,
    maxTokens: number = 4096
  ): Promise<string> {
    const model = this.models.get(modelName);
    
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    if (!model.loaded) {
      throw new Error(`Model ${modelName} is not loaded`);
    }

    try {
      // Format messages for llama.cpp API
      const formattedMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Send request to the local server
      // This assumes the server is running on localhost with a specific port
      const port = this.getServerPort(modelName);
      
      const response = await fetch(`http://localhost:${port}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: formattedMessages,
          temperature,
          max_tokens: maxTokens,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error: ${response.status}`);
      }

      const data = await response.json();
      return data.message?.content || data.choices?.[0]?.message?.content || "";
    } catch (error) {
      console.error(`[GGUF Manager] Chat failed for model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Stream chat response from a loaded GGUF model
   */
  async *chatStream(
    modelName: string,
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    temperature: number = 0.7,
    maxTokens: number = 4096
  ): AsyncGenerator<string, void, unknown> {
    const model = this.models.get(modelName);
    
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    if (!model.loaded) {
      throw new Error(`Model ${modelName} is not loaded`);
    }

    try {
      const port = this.getServerPort(modelName);
      
      const response = await fetch(`http://localhost:${port}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

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
    } catch (error) {
      console.error(`[GGUF Manager] Stream chat failed for model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Get server port for a model (simplified - would use actual port management)
   */
  private getServerPort(modelName: string): number {
    // In a real implementation, this would track actual ports
    // For now, use a hash-based port
    let hash = 0;
    for (let i = 0; i < modelName.length; i++) {
      hash = (hash << 5) - hash + modelName.charCodeAt(i);
    }
    return 8080 + (Math.abs(hash) % 1000);
  }

  /**
   * Unload all loaded models
   */
  async unloadAll(): Promise<void> {
    const modelNames = Array.from(this.models.keys());
    
    for (const modelName of modelNames) {
      if (this.models.get(modelName)?.loaded) {
        await this.unloadModel(modelName);
      }
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.unloadAll();
    this.serverProcesses.clear();
    this.models.clear();
  }
}

// Singleton instance
export const ggufManager = new GGUFManager();

export default GGUFManager;
