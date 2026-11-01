import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, CheckCircle, XCircle, Download, Settings, Sparkles } from "lucide-react";
import { trpc } from "../lib/trpc";

interface ModelInfo {
  name: string;
  displayName?: string;
  description: string;
  provider: "ollama" | "local-gguf" | "manus" | "custom";
  format: string;
  requiresApiKey: boolean;
  recommended: boolean;
  loaded: boolean;
}

interface AIConfig {
  defaultProvider: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  useStreaming: boolean;
  ollamaUrl?: string;
  customApiUrl?: string;
}

interface AIModelSelectorProps {
  onModelSelect?: (model: string, provider: string) => void;
  onConfigChange?: (config: AIConfig) => void;
  currentModel?: string;
  currentProvider?: string;
}

export function AIModelSelector({
  onModelSelect,
  onConfigChange,
  currentModel,
  currentProvider,
}: AIModelSelectorProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>(
    currentProvider || "ollama"
  );
  const [selectedModel, setSelectedModel] = useState<string>(
    currentModel || ""
  );
  const [useLocalAI, setUseLocalAI] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(4096);
  const [ollamaUrl, setOllamaUrl] = useState<string>("http://localhost:11434");
  
  // Fetch available models
  const { data: modelsData, isLoading: modelsLoading, error: modelsError } = useQuery({
    queryKey: ["ai", "available-models"],
    queryFn: async () => {
      const result = await trpc.ai.getAvailableModels.query();
      return result;
    },
    staleTime: 60000, // 1 minute
  });

  // Fetch user config
  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ["ai", "user-config"],
    queryFn: async () => {
      const result = await trpc.ai.getUserConfig.query();
      return result;
    },
  });

  // Fetch Ollama availability
  const { data: availabilityData } = useQuery({
    queryKey: ["ai", "availability"],
    queryFn: async () => {
      return await trpc.ai.checkAvailability.query();
    },
    staleTime: 30000,
  });

  // Update user config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (config: {
      defaultProvider?: string;
      defaultModel?: string;
      temperature?: number;
      maxTokens?: number;
      useStreaming?: boolean;
      ollamaUrl?: string;
    }) => {
      return await trpc.ai.updateUserConfig.mutate(config);
    },
    onSuccess: (result) => {
      if (onConfigChange) {
        onConfigChange({
          defaultProvider: result.config.defaultProvider,
          defaultModel: result.config.defaultModel,
          temperature: result.config.temperature,
          maxTokens: result.config.maxTokens,
          useStreaming: result.config.useStreaming,
          ollamaUrl: result.config.ollamaUrl,
        });
      }
    },
  });

  // Pull model mutation
  const pullModelMutation = useMutation({
    mutationFn: async (modelName: string) => {
      return await trpc.ai.pullModel.mutate({ modelName });
    },
  });

  // Test model connection mutation
  const testModelMutation = useMutation({
    mutationFn: async (params: { modelName: string; provider?: string }) => {
      return await trpc.ai.testModel.mutate(params);
    },
  });

  useEffect(() => {
    if (configData?.config) {
      setSelectedProvider(configData.config.defaultProvider);
      setSelectedModel(configData.config.defaultModel);
      setTemperature(configData.config.temperature);
      setMaxTokens(configData.config.maxTokens);
      if (configData.config.ollamaUrl) {
        setOllamaUrl(configData.config.ollamaUrl);
      }
    }
  }, [configData]);

  useEffect(() => {
    if (selectedModel && onModelSelect) {
      onModelSelect(selectedModel, selectedProvider);
    }
  }, [selectedModel, selectedProvider, onModelSelect]);

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    updateConfigMutation.mutate({ defaultProvider: provider as any });
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    updateConfigMutation.mutate({ defaultModel: model });
  };

  const handlePullModel = async (modelName: string) => {
    if (pullModelMutation.isPending) return;
    pullModelMutation.mutate(modelName);
  };

  const handleTestModel = async (modelName: string) => {
    testModelMutation.mutate({ modelName, provider: selectedProvider as any });
  };

  const handleTemperatureChange = (value: number) => {
    setTemperature(value);
    updateConfigMutation.mutate({ temperature: value });
  };

  const handleMaxTokensChange = (value: number) => {
    setMaxTokens(value);
    updateConfigMutation.mutate({ maxTokens: value });
  };

  const handleOllamaUrlChange = (value: string) => {
    setOllamaUrl(value);
    updateConfigMutation.mutate({ ollamaUrl: value });
  };

  const handleUseLocalAIToggle = (checked: boolean) => {
    setUseLocalAI(checked);
  };

  // Filter models by selected provider
  const filteredModels = modelsData?.models.filter(
    (model) => model.provider === selectedProvider
  ) || [];

  // Group models by provider
  const modelsByProvider: Record<string, ModelInfo[]> = {};
  modelsData?.models.forEach((model) => {
    if (!modelsByProvider[model.provider]) {
      modelsByProvider[model.provider] = [];
    }
    modelsByProvider[model.provider].push(model);
  });

  const recommendedModels = modelsData?.models.filter((m) => m.recommended) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Local AI Agent</h2>
          <p className="text-muted-foreground">
            Configure your personal AI models for offline processing
          </p>
        </div>
        <Badge variant={availabilityData?.available ? "default" : "secondary"}>
          {availabilityData?.available ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Ollama Connected
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Ollama Not Available
            </>
          )}
        </Badge>
      </div>

      {modelsError && (
        <Alert variant="destructive">
          <XCircle className="w-4 h-4" />
          <AlertDescription>
            Failed to load models: {modelsError.message}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>AI Provider</CardTitle>
          <CardDescription>
            Choose your preferred AI provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.keys(modelsByProvider).map((provider) => (
              <Card
                key={provider}
                className={`cursor-pointer transition-all ${
                  selectedProvider === provider
                    ? "ring-2 ring-primary ring-offset-2"
                    : "hover:shadow-lg"
                }`}
                onClick={() => handleProviderChange(provider)}
              >
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold capitalize">
                      {provider}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {modelsByProvider[provider].length} models
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Model Selection</CardTitle>
          <CardDescription>
            {selectedProvider === "ollama" && (
              <>
                Select from available Ollama models. 
                {availabilityData?.available ? (
                  <Badge variant="outline" className="ml-2">
                    Ollama Running at {availabilityData.ollamaUrl}
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="ml-2">
                    Start Ollama to see models
                  </Badge>
                )}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {modelsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredModels.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredModels.map((model) => (
                  <Card
                    key={model.name}
                    className={`transition-all ${
                      selectedModel === model.name
                        ? "ring-2 ring-primary ring-offset-2"
                        : "hover:shadow-lg cursor-pointer"
                    }`}
                    onClick={() => handleModelChange(model.name)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold">{model.displayName || model.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {model.description}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                              {model.format}
                            </Badge>
                            {model.recommended && (
                              <Badge variant="secondary" className="text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Recommended
                              </Badge>
                            )}
                            {model.loaded && (
                              <Badge variant="success" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Loaded
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {!model.loaded && selectedProvider === "ollama" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePullModel(model.name);
                              }}
                              disabled={pullModelMutation.isPending}
                            >
                              {pullModelMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Download className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestModel(model.name);
                            }}
                            disabled={testModelMutation.isPending}
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No models available for {selectedProvider}</p>
              {selectedProvider === "ollama" && !availabilityData?.available && (
                <p className="mt-2">
                  Start Ollama and pull models to see them here
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Fine-tune your AI agent settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="use-local-ai">
              Use Local AI for Chat
              <Badge variant="outline" className="ml-2 text-xs">
                Beta
              </Badge>
            </Label>
            <Switch
              id="use-local-ai"
              checked={useLocalAI}
              onCheckedChange={handleUseLocalAIToggle}
            />
            <p className="text-sm text-muted-foreground">
              When enabled, new chats will use your configured local AI model
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature: {temperature}</Label>
              <input
                type="range"
                id="temperature"
                min={0}
                max={2}
                step={0.1}
                value={temperature}
                onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 (Deterministic)</span>
                <span>1 (Balanced)</span>
                <span>2 (Creative)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-tokens">Max Tokens: {maxTokens}</Label>
              <input
                type="range"
                id="max-tokens"
                min={256}
                max={32768}
                step={256}
                value={maxTokens}
                onChange={(e) => handleMaxTokensChange(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>256</span>
                <span>16K</span>
                <span>32K</span>
              </div>
            </div>
          </div>

          {selectedProvider === "ollama" && (
            <div className="space-y-2">
              <Label htmlFor="ollama-url">Ollama API URL</Label>
              <input
                type="url"
                id="ollama-url"
                value={ollamaUrl}
                onChange={(e) => handleOllamaUrlChange(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-sm text-muted-foreground">
                Change this if Ollama is running on a different address
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {pullModelMutation.error && (
        <Alert variant="destructive">
          <XCircle className="w-4 h-4" />
          <AlertDescription>
            Failed to pull model: {pullModelMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {testModelMutation.data && (
        <Alert variant={testModelMutation.data.connected ? "success" : "destructive"}>
          {testModelMutation.data.connected ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <AlertDescription>
            {testModelMutation.data.connected
              ? `Connection successful! Response: ${testModelMutation.data.response}`
              : `Connection failed: ${testModelMutation.data.error}`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default AIModelSelector;
