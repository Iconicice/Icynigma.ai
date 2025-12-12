/**
 * Advanced Features Service for Icynigma.ai
 * 
 * Provides:
 * - Web Search (Perplexity-style)
 * - Image Analysis (Multi-modal)
 * - Deep Thinking Mode
 * - Conversation Memory Management
 * - Response Streaming
 */

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface ImageAnalysisRequest {
  imageUrl: string;
  question: string;
}

export interface ImageAnalysisResponse {
  analysis: string;
  confidence: number;
  details: Record<string, string>;
}

export interface DeepThinkingRequest {
  question: string;
  context: string[];
  maxThinkingTokens?: number;
}

export interface DeepThinkingResponse {
  thinking: string;
  answer: string;
  reasoning: string[];
}

class AdvancedFeaturesService {
  /**
   * Perform web search (Perplexity-style)
   * Uses a search API to find relevant information
   */
  async webSearch(query: string): Promise<WebSearchResult[]> {
    try {
      // Using a free search API (could be replaced with Perplexity API)
      const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
        {
          headers: {
            Accept: "application/json",
            "X-Subscription-Token": process.env.BRAVE_SEARCH_API_KEY || "",
          },
        }
      );

      if (!response.ok) {
        console.warn("Web search API not available, returning empty results");
        return [];
      }

      const data = await response.json();
      return (data.web || []).map((result: any) => ({
        title: result.title,
        url: result.url,
        snippet: result.description,
        source: new URL(result.url).hostname,
      }));
    } catch (error) {
      console.error("Web search error:", error);
      return [];
    }
  }

  /**
   * Analyze images using Claude's vision capabilities
   */
  async analyzeImage(
    imageUrl: string,
    question: string,
    claudeKey: string
  ): Promise<ImageAnalysisResponse> {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": claudeKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "url",
                    url: imageUrl,
                  },
                },
                {
                  type: "text",
                  text: question,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      const analysis = data.content?.[0]?.text || "Unable to analyze image";

      return {
        analysis,
        confidence: 0.85,
        details: {
          model: "claude-3-5-sonnet",
          imageUrl,
          question,
        },
      };
    } catch (error) {
      console.error("Image analysis error:", error);
      throw new Error("Failed to analyze image");
    }
  }

  /**
   * Deep thinking mode with extended reasoning
   * Uses DeepSeek's reasoning model for thorough analysis
   */
  async deepThinking(
    question: string,
    context: string[],
    deepseekKey: string
  ): Promise<DeepThinkingResponse> {
    try {
      const contextText = context.join("\n\n");
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-reasoner",
          messages: [
            {
              role: "user",
              content: `Context:\n${contextText}\n\nQuestion: ${question}\n\nProvide thorough reasoning and analysis.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 8000,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      // Parse thinking and answer from response
      const thinkingMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/);
      const thinking = thinkingMatch ? thinkingMatch[1].trim() : "";
      const answer = content.replace(/<thinking>[\s\S]*?<\/thinking>/, "").trim();

      return {
        thinking,
        answer,
        reasoning: context,
      };
    } catch (error) {
      console.error("Deep thinking error:", error);
      throw new Error("Failed to perform deep thinking");
    }
  }

  /**
   * Generate conversation summary for memory management
   */
  async generateSummary(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      // Use OpenAI to summarize conversation
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Summarize the following conversation in 2-3 sentences, capturing key topics and decisions.",
            },
            ...messages.slice(-10), // Last 10 messages for context
          ],
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "Conversation summary unavailable";
    } catch (error) {
      console.error("Summary generation error:", error);
      return "Unable to generate summary";
    }
  }

  /**
   * Format response with metadata
   */
  formatResponse(
    content: string,
    metadata: {
      model: string;
      mode: string;
      searchResults?: WebSearchResult[];
      thinkingProcess?: string;
    }
  ): string {
    let formatted = content;

    // Add search results if available
    if (metadata.searchResults && metadata.searchResults.length > 0) {
      formatted += "\n\n**Sources:**\n";
      metadata.searchResults.forEach((result) => {
        formatted += `- [${result.title}](${result.url})\n`;
      });
    }

    // Add thinking process if available
    if (metadata.thinkingProcess) {
      formatted += "\n\n**Reasoning Process:**\n";
      formatted += `\`\`\`\n${metadata.thinkingProcess}\n\`\`\`\n`;
    }

    return formatted;
  }
}

// Singleton instance
let advancedFeaturesInstance: AdvancedFeaturesService | null = null;

export function getAdvancedFeaturesService(): AdvancedFeaturesService {
  if (!advancedFeaturesInstance) {
    advancedFeaturesInstance = new AdvancedFeaturesService();
  }
  return advancedFeaturesInstance;
}

export default AdvancedFeaturesService;
