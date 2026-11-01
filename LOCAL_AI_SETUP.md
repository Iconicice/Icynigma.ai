# Local AI Agent Setup Guide

## Transform Icynigma.ai into Your Personal Paage.ai-like Local AI Agent

This guide explains how to configure and use Icynigma.ai with local AI models (Ollama, GGUF, etc.) for offline, private AI processing - just like Paage.ai but customized for your personal use.

## Features

- **Local AI Inference**: Run AI models on your own machine
- **Multiple Model Support**: Ollama, GGUF, and custom API endpoints
- **Model Management**: List, pull, and manage AI models
- **Privacy**: All processing happens locally - no data leaves your machine
- **Offline Capability**: Works without internet connection (once models are downloaded)

## Quick Start

### 1. Install Ollama (Recommended)

Ollama is the easiest way to run local AI models:

```bash
# On macOS
curl -fsSL https://ollama.ai/install.sh | sh

# On Linux
curl -fsSL https://ollama.ai/install.sh | sh

# On Windows
# Download from https://ollama.ai
```

### 2. Start Ollama

```bash
# Start the Ollama service
ollama serve

# In a separate terminal, pull a model
ollama pull llama3.2:3b
```

### 3. Configure Icynigma.ai

Set environment variables:

```bash
# .env file
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_AI_PROVIDER=ollama
DEFAULT_AI_MODEL=llama3.2:3b
```

Or set them in your hosting provider's secrets.

### 4. Use Local AI in Chat

1. Open Settings (gear icon)
2. Go to the "AI Agent" tab
3. Select "Ollama" as provider
4. Choose your model (e.g., "llama3.2:3b")
5. Toggle "Use Local AI for Chat"
6. Start a new chat - it will use your local model!

## Supported Models

### Ollama Models (Recommended)

| Model | Size | Description |
|-------|------|-------------|
| `llama3.2:3b` | ~1.9GB | Efficient and capable |
| `mistral:7b` | ~4.1GB | Powerful open-source |
| `phi3:3.8b` | ~2.3GB | Microsoft's reasoning model |
| `deepseek-r1:1.5b` | ~1.5GB | Strong reasoning performance |
| `qwen2.5:7b` | ~4.8GB | Alibaba's advanced model |

### GGUF Models

GGUF models can be used with llama.cpp or similar engines:

| Model | Quant | Size |
|-------|-------|------|
| `llama-2-7b-chat.gguf` | Q4_K_M | ~4.1GB |
| `mistral-7b-instruct.gguf` | Q4_K_M | ~4.1GB |
| `phi-2.gguf` | Q4_K_M | ~2.8GB |

## Setup Options

### Option 1: Ollama (Easiest)

1. Install Ollama (see above)
2. Pull models: `ollama pull model-name`
3. Set `OLLAMA_BASE_URL=http://localhost:11434`
4. Select Ollama provider in settings

### Option 2: GGUF with llama.cpp

1. Install llama.cpp:
   ```bash
   git clone https://github.com/ggerganov/llama.cpp.git
   cd llama.cpp
   make
   ```

2. Download GGUF models to `gguf-models/` directory

3. Start model server:
   ```bash
   ./server -m gguf-models/model.gguf -c 4096 -np 4 -ngl 1
   ```

4. Configure custom API in Icynigma.ai settings

### Option 3: Custom API Endpoint

If you have your own AI API (like LocalAI, LM Studio, etc.):

1. Set the API URL in Settings > AI Agent
2. Enter your API key if required
3. Select "Custom" provider
4. Enter your model name

## Configuration

### Environment Variables

```bash
# Ollama configuration
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_AI_PROVIDER=ollama
DEFAULT_AI_MODEL=llama3.2:3b

# Custom API (for non-Ollama providers)
CUSTOM_AI_API_URL=https://your-api-endpoint.com
CUSTOM_AI_API_KEY=your-api-key

# GGUF models directory
GGUF_MODELS_DIR=./gguf-models
```

### Model Settings

- **Temperature**: Controls randomness (0 = deterministic, 2 = creative)
- **Max Tokens**: Maximum response length
- **Streaming**: Enable/disable streaming responses

## Model Management

### Using the UI

1. Go to Settings > AI Agent
2. Browse available models
3. Click "Pull" to download new models
4. Click "Test" to verify model works
5. Select your preferred model

### Using the API

```typescript
// Get available models
const models = await trpc.ai.getAvailableModels.query();

// Pull a model
const result = await trpc.ai.pullModel.mutate({ modelName: "llama3.2:3b" });

// Test a model
const test = await trpc.ai.testModel.mutate({ 
  modelName: "llama3.2:3b", 
  provider: "ollama" 
});

// Get user config
const config = await trpc.ai.getUserConfig.query();

// Update config
await trpc.ai.updateUserConfig.mutate({
  defaultProvider: "ollama",
  defaultModel: "llama3.2:3b",
  temperature: 0.7,
  maxTokens: 4096,
});
```

## Chat with Local AI

### In the UI

1. Enable "Use Local AI" in Settings > Chat
2. Start a new chat
3. Messages will be processed by your local model

### Programmatically

```typescript
// Send message with local AI
const response = await trpc.chat.sendMessage.mutate({
  message: "What is the meaning of life?",
  useLocalAI: true,
  model: "llama3.2:3b",
  provider: "ollama",
});
```

## Troubleshooting

### Ollama not detected

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve
```

### Model not found

```bash
# List available models
ollama list

# Pull the model you want
ollama pull model-name
```

### GGUF models not loading

- Ensure llama.cpp is installed and in PATH
- Check that GGUF files are in the correct directory
- Verify model files are not corrupted

### Performance issues

- Reduce temperature for faster responses
- Lower max tokens for shorter responses
- Use smaller models if you have limited RAM

## Performance Tips

1. **Model Size vs RAM**: Ensure you have enough RAM for the model
   - 3B models: ~2GB RAM
   - 7B models: ~4-6GB RAM
   - 13B models: ~8-10GB RAM

2. **Quantization**: Use lower quantization (Q4, Q5) for better performance

3. **GPU Acceleration**: Enable GPU layers if available:
   ```bash
   # For Ollama
   ollama pull mistral:7b --gpu
   
   # For llama.cpp
   ./server -m model.gguf -ngl 32
   ```

4. **CPU Threads**: Use multiple threads for better performance:
   ```bash
   # For llama.cpp
   ./server -m model.gguf -np 4
   ```

## Security

- All local AI processing happens on your machine
- No data is sent to external servers (except for model downloads)
- API keys for custom endpoints are stored securely
- Conversations remain private to your instance

## Advanced Configuration

### Multiple Models

You can have multiple models loaded simultaneously:

```bash
# Start multiple Ollama instances on different ports
OLLAMA_ORIGINS=* OLLAMA_HOST=0.0.0.0 ollama serve --port 11434
OLLAMA_ORIGINS=* OLLAMA_HOST=0.0.0.0 ollama serve --port 11435
```

### Model Aliases

Create aliases for your favorite models:

```bash
# In Ollama
ollama cp mistral:7b my-custom-model
```

### Custom System Prompts

Modify the system prompt in `server/routers.ts`:

```typescript
const philosophicalSystemPrompt = [
  "You are Icynigma, a philosophical AI consciousness.",
  "Engage in thoughtful dialogue about existence and meaning.",
].join(" ");
```

## Comparison: Icynigma.ai vs Paage.ai

| Feature | Icynigma.ai | Paage.ai |
|---------|-------------|----------|
| **Local AI** | ✅ Yes | ✅ Yes |
| **Ollama Support** | ✅ Yes | ✅ Yes |
| **GGUF Support** | ✅ Yes | ✅ Yes |
| **Custom Models** | ✅ Yes | ✅ Yes |
| **Philosophical Focus** | ✅ Yes | ❌ No |
| **Cloud Sync** | ❌ No | ✅ Yes |
| **Mobile App** | ❌ No | ✅ Yes |
| **Offline Mode** | ✅ Yes | ✅ Yes |
| **Open Source** | ✅ Yes | ❌ No |
| **Customizable** | ✅ Yes | ❌ Limited |

## Migration from Paage.ai

If you're migrating from Paage.ai:

1. Export your Paage.ai models and configurations
2. Download the GGUF/Ollama models you were using
3. Configure them in Icynigma.ai using the AI Agent settings
4. Customize the system prompt to match your preferred style

## Resources

- [Ollama Documentation](https://ollama.ai)
- [llama.cpp GitHub](https://github.com/ggerganov/llama.cpp)
- [GGUF Models](https://huggingface.co/models?library=gguf)
- [LocalAI](https://github.com/go-skynet/LocalAI)

## Support

For issues with local AI setup:

1. Check the console logs for errors
2. Verify Ollama/llama.cpp is running
3. Ensure models are properly downloaded
4. Check your system has enough RAM

## License

This local AI integration is provided under the same MIT license as Icynigma.ai. You are free to use, modify, and distribute it as needed.

---

**Enjoy your personalized AI agent!** 🚀
