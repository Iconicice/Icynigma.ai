# Android Agent Research Notes

## On-device model execution

Google's Android LLM Inference documentation states that models can run entirely on-device, but also notes that the legacy MediaPipe LLM Inference API is maintenance-only and recommends LiteRT-LM for new Kotlin Android integrations. It identifies high-end hardware as the practical initial target, recommends downloading large model files at runtime rather than bundling them into the APK, and shows asynchronous token generation for streamed output. Source: <https://developers.google.com/edge/mediapipe/solutions/genai/llm_inference/android>.

## Android permission boundaries

Android's permission documentation distinguishes private-data and restricted-action access, requires runtime permissions for dangerous capabilities, and emphasizes minimal, action-associated, transparent permission requests. The Android design therefore treats notification access, microphone recording, messages, and app actions as optional, user-visible capabilities rather than ambient background privileges. Source: <https://developer.android.com/guide/topics/permissions/overview>.

The official default-handler guidance identifies SMS and call-log access as a role-specific capability. The blueprint therefore treats direct message-store access as out of scope for the initial agent unless the user explicitly grants the Android default SMS role; ordinary first-version messaging uses a prefilled system compose intent with a final user confirmation instead. Source: <https://developer.android.com/guide/topics/permissions/default-handlers>.

## Current local runtime recommendation

The current LiteRT-LM Kotlin API provides Android local inference with GPU/NPU acceleration, multimodality, tool integration, and streamed token output through a Kotlin `Flow`. It requires deliberate engine/conversation lifecycle management and can take several seconds to initialize a model. The first Android implementation should therefore run inference through a foreground-aware `LocalAiEngine` abstraction with lazy initialization, a cancellable coroutine, explicit resource release, and manual tool execution. Source: <https://developers.google.com/edge/litert-lm/android>.

## Default model choice

For a conservative first offline Android release, **Gemma 3n E2B** is the recommended default over Llama 3.2, DeepSeek distills, or larger Gemma 4 variants. Google's official documentation describes Gemma 3n as optimized for phones, laptops, and tablets, with parameter-efficient processing, optional multimodal capability, and memory-saving conditional parameter loading. The app should retain a model-adapter interface so qualified devices can later offer Gemma 4 E4B or a supported Qwen variant after device benchmarking. Source: <https://ai.google.dev/gemma/docs/gemma-3n>.

## Offline speech recommendation

For the initial Android Live Voice implementation, use Android's local `TextToSpeech` engine for output and provide ML Kit GenAI Speech Recognition Basic mode as the preferred on-device speech-to-text path on supported Android 12L/API 31+ devices. The official ML Kit guide describes Basic mode as on-device and broadly available on API 31+, with streaming mic transcription; its advanced mode remains limited to select devices and the API is alpha. The app must therefore check feature availability, ask before downloading speech assets over approved Wi-Fi, and fall back to typed interaction when the on-device recognizer is unavailable. Source: <https://developers.google.com/ml-kit/genai/speech-recognition/android>.

## Blueprint implications

The first Android version should use a local model runtime abstraction with a LiteRT-LM primary option and a llama.cpp-compatible fallback adapter; ship no model weight inside the APK; use an in-app model-download manager restricted to user-approved unmetered Wi-Fi; keep personal memory encrypted locally; expose feature-by-feature permission cards; and require a visible confirmation step for irreversible actions such as sending messages or opening external links/apps.
