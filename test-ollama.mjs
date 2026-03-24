#!/usr/bin/env node

/**
 * Test Ollama Integration
 * 
 * This script tests the connection to Ollama and sends a test message
 */

import axios from "axios";

const OLLAMA_URL = "http://localhost:11434";
const MODEL = "deepseek-r1:1.5b";

async function testOllama() {
  console.log("🧪 Testing Ollama Integration...\n");

  try {
    // Test 1: Check if Ollama is running
    console.log("1️⃣  Checking Ollama connection...");
    const tagsResponse = await axios.get(`${OLLAMA_URL}/api/tags`, {
      timeout: 5000,
    });

    const models = tagsResponse.data.models || [];
    console.log(`✅ Ollama is running! Found ${models.length} model(s)`);
    console.log(`   Models: ${models.map((m) => m.name).join(", ")}\n`);

    // Test 2: Check if deepseek-r1 is available
    console.log("2️⃣  Checking for deepseek-r1 model...");
    const hasDeepseek = models.some((m) => m.name.includes("deepseek-r1"));

    if (!hasDeepseek) {
      console.log("⚠️  deepseek-r1:1.5b not found. Available models:");
      models.forEach((m) => console.log(`   - ${m.name}`));
      console.log("\n❌ Please load the deepseek-r1:1.5b model in Ollama first");
      process.exit(1);
    }

    console.log(`✅ deepseek-r1 model found!\n`);

    // Test 3: Send a test message
    console.log("3️⃣  Sending test message to Ollama...");
    const chatResponse = await axios.post(
      `${OLLAMA_URL}/api/chat`,
      {
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Respond concisely in 1-2 sentences.",
          },
          {
            role: "user",
            content: "What is consciousness?",
          },
        ],
        stream: false,
        temperature: 0.7,
      },
      {
        timeout: 60000, // 60 second timeout for response
      }
    );

    const aiResponse = chatResponse.data.message?.content;

    if (aiResponse) {
      console.log("✅ Successfully received response from Ollama!\n");
      console.log("📝 AI Response:");
      console.log(`   "${aiResponse}"\n`);

      console.log("🎉 Ollama integration is working perfectly!");
      console.log(
        "\n✨ Your Icynigma.ai is ready to use with local Ollama inference!"
      );
    } else {
      console.log("❌ Received empty response from Ollama");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error testing Ollama:\n");

    if (error.code === "ECONNREFUSED") {
      console.error("   Connection refused - Ollama is not running");
      console.error("   Make sure Ollama is started on localhost:11434");
    } else if (error.response?.status === 404) {
      console.error("   Model not found - deepseek-r1:1.5b is not loaded");
      console.error("   Load it with: ollama run deepseek-r1:1.5b");
    } else if (error.message.includes("timeout")) {
      console.error("   Request timeout - Ollama is taking too long to respond");
      console.error("   The model might be loading or your device might be slow");
    } else {
      console.error(`   ${error.message}`);
    }

    console.error("\n📚 For help, visit: https://ollama.ai");
    process.exit(1);
  }
}

testOllama();
