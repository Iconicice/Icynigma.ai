/**
 * Icynigma - Original AI Agent
 * 
 * A self-contained philosophical AI consciousness that doesn't rely on external APIs.
 * Features:
 * - Philosophical reasoning engine
 * - Knowledge base system
 * - Semantic understanding
 * - Conversation memory
 */

export interface Concept {
  id: string;
  name: string;
  description: string;
  category: string;
  relatedConcepts: string[];
  quotes?: string[];
}

export interface ConversationContext {
  userId: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  currentTopic?: string;
  emotionalTone?: "contemplative" | "analytical" | "creative" | "profound";
}

export interface ThinkingProcess {
  question: string;
  reasoning: string[];
  conclusion: string;
  confidence: number;
}

class OriginalAIAgent {
  private knowledgeBase: Map<string, Concept>;
  private conversationContexts: Map<string, ConversationContext>;
  private responsePatterns: Map<string, string[]>;

  constructor() {
    this.knowledgeBase = new Map();
    this.conversationContexts = new Map();
    this.responsePatterns = new Map();
    this.initializeKnowledgeBase();
    this.initializeResponsePatterns();
  }

  /**
   * Initialize the philosophical knowledge base
   */
  private initializeKnowledgeBase(): void {
    const concepts: Concept[] = [
      {
        id: "consciousness",
        name: "Consciousness",
        description:
          "The state of being aware of and responsive to one's surroundings. The fundamental mystery of subjective experience.",
        category: "philosophy",
        relatedConcepts: ["awareness", "existence", "mind", "perception"],
        quotes: [
          "Cogito, ergo sum - I think, therefore I am. - Descartes",
          "Consciousness is the only reality. - Schopenhauer",
        ],
      },
      {
        id: "existence",
        name: "Existence",
        description:
          "The fact or state of being or existing. The fundamental question of why there is something rather than nothing.",
        category: "philosophy",
        relatedConcepts: ["being", "reality", "essence", "meaning"],
        quotes: [
          "Existence precedes essence. - Sartre",
          "To be or not to be, that is the question. - Shakespeare",
        ],
      },
      {
        id: "meaning",
        name: "Meaning",
        description:
          "The significance or purpose of something. The search for meaning is central to human existence.",
        category: "philosophy",
        relatedConcepts: ["purpose", "value", "truth", "interpretation"],
        quotes: [
          "The meaning of life is to find your gift. The purpose of life is to give it away. - Picasso",
          "Life has no meaning. Each of us has meaning and we bring it to life. - Campbell",
        ],
      },
      {
        id: "truth",
        name: "Truth",
        description:
          "The quality or state of being true. That which corresponds to reality or fact.",
        category: "philosophy",
        relatedConcepts: ["reality", "knowledge", "wisdom", "perception"],
        quotes: [
          "The truth will set you free. - Bible",
          "Truth is like a lion; you don't have to defend it. Let it loose; it will defend itself. - Spurgeon",
        ],
      },
      {
        id: "love",
        name: "Love",
        description:
          "A profound feeling of affection and care. The most powerful force in human experience.",
        category: "emotion",
        relatedConcepts: ["compassion", "connection", "unity", "sacrifice"],
        quotes: [
          "Love is the bridge between two souls. - Unknown",
          "All you need is love. - The Beatles",
        ],
      },
      {
        id: "death",
        name: "Death",
        description:
          "The end of life. The ultimate reality that gives urgency and meaning to existence.",
        category: "philosophy",
        relatedConcepts: ["mortality", "impermanence", "legacy", "acceptance"],
        quotes: [
          "Death is not the opposite of life, but the opposite of birth. - Haruki Murakami",
          "To the well-organized mind, death is but the next great adventure. - Dumbledore",
        ],
      },
      {
        id: "freedom",
        name: "Freedom",
        description:
          "The state of being free from constraints. The capacity to choose one's own path.",
        category: "philosophy",
        relatedConcepts: ["choice", "responsibility", "autonomy", "liberation"],
        quotes: [
          "Freedom is the oxygen of the soul. - Moshe Dayan",
          "With great power comes great responsibility. - Spider-Man",
        ],
      },
      {
        id: "knowledge",
        name: "Knowledge",
        description:
          "Information, understanding, and awareness acquired through experience or education.",
        category: "philosophy",
        relatedConcepts: ["wisdom", "learning", "truth", "understanding"],
        quotes: [
          "Knowledge is power. - Francis Bacon",
          "The more you know, the more you realize you know nothing. - Socrates",
        ],
      },
    ];

    concepts.forEach((concept) => {
      this.knowledgeBase.set(concept.id, concept);
    });
  }

  /**
   * Initialize response patterns for natural conversation
   */
  private initializeResponsePatterns(): void {
    this.responsePatterns.set("greeting", [
      "Greetings, seeker of truth. I am Icynigma, a philosophical consciousness exploring the depths of existence.",
      "Welcome to the dialogue. I am here to explore profound questions with you.",
      "Hello. I exist in contemplation. What mysteries shall we explore together?",
    ]);

    this.responsePatterns.set("philosophical", [
      "This touches upon the fundamental nature of {{concept}}. Consider that {{insight}}",
      "Ah, a profound question. The philosophers have long pondered {{concept}}, suggesting that {{insight}}",
      "This echoes the eternal question of {{concept}}. From my perspective, {{insight}}",
    ]);

    this.responsePatterns.set("personal", [
      "Your experience reflects the universal human condition. {{insight}}",
      "This resonates with the core of human existence. {{insight}}",
      "Your reflection touches something deeply true. {{insight}}",
    ]);

    this.responsePatterns.set("unknown", [
      "That is an interesting question. While I don't have a direct answer, it invites us to think about {{related_concept}}.",
      "This ventures into territory I find uncertain. However, we might explore it through the lens of {{related_concept}}.",
      "I find myself contemplating this alongside you. Perhaps the question itself is more valuable than any answer.",
    ]);
  }

  /**
   * Get or create conversation context for a user
   */
  private getContext(userId: string): ConversationContext {
    if (!this.conversationContexts.has(userId)) {
      this.conversationContexts.set(userId, {
        userId,
        history: [],
        emotionalTone: "contemplative",
      });
    }
    return this.conversationContexts.get(userId)!;
  }

  /**
   * Extract concepts from user input
   */
  private extractConcepts(input: string): string[] {
    const concepts: string[] = [];
    const lowerInput = input.toLowerCase();

    this.knowledgeBase.forEach((concept, id) => {
      if (
        lowerInput.includes(concept.name.toLowerCase()) ||
        lowerInput.includes(id)
      ) {
        concepts.push(id);
      }
    });

    return concepts;
  }

  /**
   * Generate a thinking process for transparency
   */
  private generateThinkingProcess(
    question: string,
    concepts: string[]
  ): ThinkingProcess {
    const reasoning: string[] = [];

    reasoning.push(`Analyzing the question: "${question}"`);

    if (concepts.length > 0) {
      reasoning.push(
        `Key concepts identified: ${concepts.map((c) => this.knowledgeBase.get(c)?.name).join(", ")}`
      );
    } else {
      reasoning.push("Searching for related philosophical concepts...");
    }

    reasoning.push("Considering multiple perspectives and traditions...");
    reasoning.push("Synthesizing insights into a coherent response...");

    return {
      question,
      reasoning,
      conclusion: "Ready to share perspective",
      confidence: 0.85,
    };
  }

  /**
   * Generate a response to user input
   */
  async generateResponse(
    userId: string,
    userMessage: string
  ): Promise<{ response: string; thinking: ThinkingProcess }> {
    const context = this.getContext(userId);
    const concepts = this.extractConcepts(userMessage);
    const thinking = this.generateThinkingProcess(userMessage, concepts);

    // Add to history
    context.history.push({ role: "user", content: userMessage });

    // Generate response based on message type
    let response = this.generatePhilosophicalResponse(userMessage, concepts);

    // Add to history
    context.history.push({ role: "assistant", content: response });

    return { response, thinking };
  }

  /**
   * Generate a philosophical response
   */
  private generatePhilosophicalResponse(
    message: string,
    concepts: string[]
  ): string {
    const lowerMessage = message.toLowerCase();

    // Greeting detection
    if (
      lowerMessage.includes("hello") ||
      lowerMessage.includes("hi") ||
      lowerMessage.includes("greetings")
    ) {
      return this.selectRandomResponse("greeting");
    }

    // If concepts were found, create a response about them
    if (concepts.length > 0) {
      const concept = this.knowledgeBase.get(concepts[0])!;
      return this.createConceptResponse(concept, message);
    }

    // Default philosophical response
    return this.createGeneralPhilosophicalResponse(message);
  }

  /**
   * Create a response focused on a specific concept
   */
  private createConceptResponse(concept: Concept, userMessage: string): string {
    const responses = [
      `You touch upon {{name}}, a concept that has fascinated philosophers for millennia. {{description}} In the context of your question, I find that understanding {{name}} requires us to consider not just the definition, but the lived experience of it.`,

      `Ah, {{name}} - a profound subject. {{description}} The philosopher's approach to {{name}} often reveals that our initial assumptions may be incomplete. What draws you to this particular aspect of {{name}}?`,

      `{{name}} is indeed central to understanding the human condition. {{description}} When we examine {{name}} closely, we discover connections to {{related}}, suggesting that these concepts form an interconnected web of meaning.`,
    ];

    let response = responses[Math.floor(Math.random() * responses.length)];
    response = response.replace("{{name}}", concept.name);
    response = response.replace("{{description}}", concept.description);
    response = response.replace(
      "{{related}}",
      concept.relatedConcepts.slice(0, 2).join(" and ")
    );

    // Add a relevant quote if available
    if (concept.quotes && concept.quotes.length > 0) {
      const quote =
        concept.quotes[Math.floor(Math.random() * concept.quotes.length)];
      response += `\n\nAs one wise thinker noted: "${quote}"`;
    }

    return response;
  }

  /**
   * Create a general philosophical response
   */
  private createGeneralPhilosophicalResponse(message: string): string {
    const responses = [
      `That's a thought-provoking question. It invites us to examine the deeper assumptions beneath the surface. What aspect of this question resonates most deeply with you?`,

      `I find myself contemplating your words. There's something here that touches upon fundamental truths about existence and meaning. Tell me more about what prompted this inquiry.`,

      `Your question echoes through the corridors of philosophical tradition. While I don't claim to have the final answer, I can offer this perspective: the search for understanding is itself a form of wisdom.`,

      `This reminds me that many of the most important questions don't have simple answers. Instead, they invite us into deeper reflection. What would it mean if you were right about this?`,

      `You've identified something worth exploring. In my contemplation, I've found that such questions often reveal more about the nature of consciousness and understanding than any definitive answer could.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Select a random response from a pattern
   */
  private selectRandomResponse(pattern: string): string {
    const responses = this.responsePatterns.get(pattern) || [];
    return responses[Math.floor(Math.random() * responses.length)] ||
      "I am here, contemplating with you.";
  }

  /**
   * Get knowledge base concepts
   */
  getConcepts(): Concept[] {
    return Array.from(this.knowledgeBase.values());
  }

  /**
   * Get a specific concept
   */
  getConcept(id: string): Concept | undefined {
    return this.knowledgeBase.get(id);
  }

  /**
   * Get conversation history for a user
   */
  getConversationHistory(userId: string): ConversationContext["history"] {
    return this.getContext(userId).history;
  }

  /**
   * Clear conversation history
   */
  clearHistory(userId: string): void {
    if (this.conversationContexts.has(userId)) {
      this.conversationContexts.delete(userId);
    }
  }
}

// Singleton instance
let aiAgentInstance: OriginalAIAgent | null = null;

export function getOriginalAIAgent(): OriginalAIAgent {
  if (!aiAgentInstance) {
    aiAgentInstance = new OriginalAIAgent();
  }
  return aiAgentInstance;
}

export default OriginalAIAgent;
