# Icynigma Offline — Android Native Personal-Agent Blueprint

**Owner and creator:** Inolofatseng Mokgoko.  
**Brand:** Iconic Media Entertainment (I.M.E.).  
**Target:** A native Android agent that continues to work without an internet connection after its local model and optional speech assets have been installed.

> **First-version decision.** Build an offline-first native Android app in Kotlin. Use **Gemma 3n E2B** through LiteRT-LM as the default local model target; use an adapter layer so stronger devices can later select a supported Gemma 4, Qwen, or llama.cpp/GGUF model. Gemma 3n is explicitly designed for everyday devices and supports efficient, multimodal operation; LiteRT-LM provides Kotlin streaming and local tool orchestration. [1] [2]

## 1. Product Boundary

The Android app is not a hidden device controller. It is a **user-directed local agent**. It can reason over the user’s approved local memory, speak and listen locally when the device supports it, summarize notifications after a dedicated consent step, prepare actions such as an SMS draft or app launch, and perform the final action only after the user confirms a preview.

| Capability | First-version behavior | Consent rule | Not included in v1 |
|---|---|---|---|
| Local chat | On-device multi-turn conversation with downloaded model | No runtime permission | Cloud-required default model |
| Live Voice | Local speech-to-text where available plus Android TextToSpeech | Microphone permission; feature toggle | Hidden/background recording |
| Preferences | Encrypted local memory for confirmed preferences and user-approved summaries | In-app consent and review | Silent profiling or ad tracking |
| Notifications | Local digest from user-enabled notification access, with an app allowlist | System notification-access setting plus in-app toggle | Uploading notification contents |
| Email | Compose/reply drafts through system intent | Per-action confirmation | Universal email-inbox reading without provider OAuth |
| SMS | System compose intent with draft text | Per-action confirmation | Direct send or SMS database access unless default-SMS role is granted |
| App opening | Launch installed app with preview and confirmation | Per-action confirmation | Accessibility automation or privileged settings changes |
| Knowledge updates | Download signed local packs on user-approved unmetered Wi-Fi | Update consent and source disclosure | Background downloads on cellular data |

Android requires runtime permission discipline for dangerous/private-data access and recommends keeping requests minimal, transparent, and tied to a visible user action. [3] SMS and call-log access are role-specific; the safe v1 action is opening the system’s message composer rather than reading or sending messages silently. [4]

## 2. Feasible Architecture Options

| Approach | Tradeoffs | Cost | Setup complexity |
|---|---|---:|---:|
| **Recommended: native local model, native local speech** | Highest privacy and offline capability; model download and device benchmarking are required | No per-request model fee; storage, battery, and model-license obligations remain | High |
| **Demo: web chat shell used from Taskade/Replit** | Fast to demonstrate interface and agent flows; cannot become a true offline Android APK or control device APIs | Low | Low |
| **Hybrid: local chat plus optional cloud assistant** | Better answers on demand; introduces accounts, connectivity, and data-sharing choices | Variable | Medium |

The first release should use the first approach. Taskade and Replit are appropriate for the requirements, flows, mock data, HTTP demo, and design prototype; Android Studio is required for the signed native APK, on-device model runtime, Android permission screens, notification access, and system intents.

## 3. Model and Speech Selection

### Recommended defaults

| Layer | Default | Reason | Fallback / upgrade |
|---|---|---|---|
| Local LLM | Gemma 3n E2B, LiteRT-LM format | Mobile-oriented, parameter-efficient, and supports local streamed conversations [1] [2] | Gemma 4 E4B on strong devices; supported Qwen variant; llama.cpp GGUF adapter |
| LLM runtime | LiteRT-LM Kotlin adapter | Current supported direction for Android local LLM integration, with GPU/NPU acceleration and `Flow` streaming [2] | llama.cpp JNI adapter behind same interface |
| Speech-to-text | ML Kit GenAI Speech Recognition **Basic** mode when available | On-device speech recognition on supported API 31+ devices; model status can be checked/downloaded [5] | Typed chat; optional user-selected offline recognizer adapter |
| Speech output | Android `TextToSpeech` engine | Device-local synthesis path with no cloud key | User-installed device voice / text-only mode |
| Local semantic search | Compact embedding model plus encrypted local vector table | Keeps personal retrieval on device | Keyword search while embedding model is absent |

The earlier MediaPipe LLM Inference Android API is maintenance-only; new Kotlin work should use LiteRT-LM. Large model weights should be hosted separately and downloaded into app-private storage rather than bundled inside the APK. [2] [6]

## 4. Project Structure

```text
icynigma-offline/
├── app/                         # App entry, navigation, DI setup
├── core-ui/                     # Theme, glass components, accessibility primitives
├── core-security/               # Keystore, encrypted storage, audit log
├── core-ai/                     # LocalAiEngine interfaces and LiteRT/llama adapters
├── core-voice/                  # Local STT/TTS and Live Voice state machine
├── core-memory/                 # Encrypted Room data, preference learner, retrieval
├── core-updates/                # Signed manifest, Wi-Fi-only downloads, WorkManager
├── feature-chat/                # Chat UI and streaming response reducer
├── feature-live/                # Live Voice sheet and controls
├── feature-agent/               # Tool proposals and confirmation UX
├── feature-notifications/       # Local notification digest and allowlist
├── feature-settings/            # Privacy center, model manager, export/delete controls
└── docs/                        # Release, signing, and private APK distribution guidance
```

## 5. Gradle Blueprint

Create a Kotlin + Jetpack Compose application with `minSdk = 31` for the first version. A lower API fallback may still support text chat, but on-device speech availability is stronger at API 31+. [5]

```kotlin
// app/build.gradle.kts — dependency blueprint; pin tested versions in libs.versions.toml
dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.kotlinx.coroutines.android)

    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.hilt.navigation.compose)

    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)
    implementation(libs.androidx.datastore.preferences)
    implementation(libs.androidx.work.runtime.ktx)
    implementation(libs.androidx.security.crypto)

    // Local model runtime — use the stable coordinate selected at project creation.
    implementation("com.google.ai.edge.litertlm:litertlm-android:latest.release")

    // Optional alpha on-device recognition; isolate behind LocalSpeechRecognizer.
    implementation("com.google.mlkit:genai-speech-recognition:1.0.0-alpha1")
}
```

> Do not permanently use `latest.release` for a production APK. Resolve and lock the version that passes device tests before release.

## 6. Android Manifest and Permission Design

```xml
<!-- app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="false"
        android:label="Icynigma Offline"
        android:theme="@style/Theme.Icynigma">
        <service
            android:name=".notifications.IcynigmaNotificationListener"
            android:exported="false"
            android:label="Icynigma notification digest"
            android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE">
            <intent-filter>
                <action android:name="android.service.notification.NotificationListenerService" />
            </intent-filter>
        </service>
    </application>
</manifest>
```

Do **not** declare SMS read/write, contacts, accessibility, device-admin, call-log, location, or camera permissions in v1 unless a visible product feature and a security review justify each one. Notification access is special access that the user enables through Android settings; implement an allowlist and a local-only processing notice. [3] [4]

## 7. Core Domain Contracts

```kotlin
// core-ai/src/main/kotlin/ai/icynigma/core/ai/LocalAiEngine.kt
interface LocalAiEngine : Closeable {
    suspend fun warmUp(): EngineState
    fun stream(turns: List<ChatTurn>): Flow<GenerationChunk>
    suspend fun cancel()
    suspend fun isReady(): Boolean
}

data class ChatTurn(val role: Role, val content: String)
enum class Role { SYSTEM, USER, ASSISTANT }
data class GenerationChunk(val text: String, val isFinal: Boolean)

sealed interface EngineState {
    data object Ready : EngineState
    data class DownloadRequired(val model: ModelDescriptor) : EngineState
    data class Unavailable(val reason: String) : EngineState
}

data class ModelDescriptor(
    val id: String,
    val version: String,
    val url: String,
    val sha256: String,
    val minRamGb: Int,
    val licenseUrl: String,
)
```

```kotlin
// core-ai/.../LiteRtLocalAiEngine.kt
// Keep this vendor implementation isolated. The exact engine calls follow the
// LiteRT-LM Kotlin version locked by the Android project.
class LiteRtLocalAiEngine @Inject constructor(
    private val modelStore: ModelStore,
    private val dispatcher: CoroutineDispatcher = Dispatchers.Default,
) : LocalAiEngine {
    private var engine: Engine? = null
    private var activeConversation: Conversation? = null

    override suspend fun warmUp(): EngineState = withContext(dispatcher) {
        val path = modelStore.activeModelPath() ?: return@withContext EngineState.DownloadRequired(modelStore.defaultModel())
        runCatching {
            engine = Engine(EngineConfig(modelPath = path)).also { it.initialize() }
            EngineState.Ready
        }.getOrElse { EngineState.Unavailable(it.message ?: "Local model could not start") }
    }

    override fun stream(turns: List<ChatTurn>): Flow<GenerationChunk> = flow {
        val loaded = engine ?: error("Model is not ready")
        activeConversation?.close()
        activeConversation = loaded.createConversation()
        val prompt = PromptFormatter.icynigma(turns)
        activeConversation!!.sendMessageAsync(prompt).collect { token ->
            emit(GenerationChunk(text = token.text, isFinal = token.isFinal))
        }
    }

    override suspend fun cancel() { activeConversation?.close(); activeConversation = null }
    override suspend fun isReady() = engine != null
    override fun close() { activeConversation?.close(); engine?.close() }
}
```

The actual LiteRT-LM API uses an engine and conversation lifecycle and supports asynchronous streaming; initialize and close those resources off the main thread. [2]

## 8. Live Voice Controller

Live Voice has four visible phases: **Listening**, **Thinking**, **Speaking**, and **Paused**. It must never listen while the agent is speaking. Tapping Stop cancels recognition and local TTS immediately. The user can interrupt at any time by tapping Stop, typing, or leaving the screen.

```kotlin
// core-voice/.../LiveVoiceController.kt
class LiveVoiceController @Inject constructor(
    private val recognizer: LocalSpeechRecognizer,
    private val synthesizer: LocalSpeechSynthesizer,
    private val chat: OfflineChatRepository,
) {
    private val _state = MutableStateFlow<LiveVoiceState>(LiveVoiceState.Idle)
    val state: StateFlow<LiveVoiceState> = _state.asStateFlow()

    suspend fun start() {
        if (!recognizer.isAvailable()) {
            _state.value = LiveVoiceState.Unavailable("On-device speech recognition is unavailable. Use typed chat.")
            return
        }
        listenForTurn()
    }

    private suspend fun listenForTurn() {
        _state.value = LiveVoiceState.Listening
        recognizer.listenOnce().collect { result ->
            if (!result.isFinal || result.text.isBlank()) return@collect
            _state.value = LiveVoiceState.Thinking
            val reply = chat.respond(result.text)
            _state.value = LiveVoiceState.Speaking
            synthesizer.speak(reply)
            _state.value = LiveVoiceState.Listening
            listenForTurn()
        }
    }

    fun stop() {
        recognizer.stop()
        synthesizer.stop()
        _state.value = LiveVoiceState.Idle
    }
}

sealed interface LiveVoiceState {
    data object Idle : LiveVoiceState
    data object Listening : LiveVoiceState
    data object Thinking : LiveVoiceState
    data object Speaking : LiveVoiceState
    data class Unavailable(val reason: String) : LiveVoiceState
}
```

Implement `LocalSpeechRecognizer` with the ML Kit on-device Basic mode only after `checkStatus()` confirms the device feature is available. The API supports streaming microphone transcription but is alpha; retain the typed fallback and an adapter for another offline engine. [5]

## 9. Encrypted Preference Memory and Personal Growth

The app should not “learn” by silently collecting everything. It grows through **explicitly reviewable memory**. Create a card after a meaningful preference, routine, goal, or correction and let the user accept, edit, or discard it.

```kotlin
// core-memory/.../MemoryEntry.kt
@Entity(tableName = "memory_entries")
data class MemoryEntry(
    @PrimaryKey val id: String,
    val category: MemoryCategory,
    val value: String,
    val confidence: Float,
    val source: MemorySource,
    val userApproved: Boolean,
    val createdAt: Instant,
    val updatedAt: Instant,
)

enum class MemoryCategory { PREFERENCE, GOAL, ROUTINE, PERSON, FACT, CORRECTION }
enum class MemorySource { USER_APPROVED, USER_EDITED, LOCAL_SUMMARY }

interface PersonalMemoryRepository {
    fun pendingReview(): Flow<List<MemoryEntry>>
    suspend fun approve(id: String)
    suspend fun edit(id: String, replacement: String)
    suspend fun delete(id: String)
    suspend fun exportEncrypted(destination: Uri)
    suspend fun eraseAll()
}
```

Encrypt the database key with Android Keystore, retain all memory on device, and provide **Review memory**, **Export encrypted copy**, and **Erase everything** in Settings. Do not write raw notification bodies, audio recordings, or passwords into long-term memory.

## 10. Consent-Gated Device Tools

The local model can propose tools but cannot execute arbitrary functions. Every proposal flows through a confirmation sheet.

```kotlin
// feature-agent/.../AgentTool.kt
sealed interface AgentTool {
    data class OpenApp(val packageName: String, val label: String) : AgentTool
    data class ComposeSms(val recipients: List<String>, val body: String) : AgentTool
    data class ComposeEmail(val recipients: List<String>, val subject: String, val body: String) : AgentTool
    data class ShareText(val text: String) : AgentTool
}

data class ProposedAction(
    val tool: AgentTool,
    val explanation: String,
    val requiresConfirmation: Boolean = true,
)

class ConfirmedActionExecutor @Inject constructor(
    private val context: Context,
    private val auditLog: AuditLog,
) {
    fun executeAfterConfirmation(action: ProposedAction) {
        require(action.requiresConfirmation)
        val intent = when (val tool = action.tool) {
            is AgentTool.OpenApp -> context.packageManager.getLaunchIntentForPackage(tool.packageName)
                ?: error("App is not installed")
            is AgentTool.ComposeSms -> Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:${tool.recipients.joinToString(",")}"))
                .putExtra("sms_body", tool.body)
            is AgentTool.ComposeEmail -> Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:"))
                .putExtra(Intent.EXTRA_EMAIL, tool.recipients.toTypedArray())
                .putExtra(Intent.EXTRA_SUBJECT, tool.subject)
                .putExtra(Intent.EXTRA_TEXT, tool.body)
            is AgentTool.ShareText -> Intent.createChooser(Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, tool.text), "Share with")
        }
        auditLog.recordConfirmed(action)
        context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
}
```

This design opens Android’s own message/email chooser, allowing the user to review and send. It does not become a default SMS handler or bypass user confirmation.

## 11. Notifications and Email Boundaries

The v1 notification module is a local digest, not a surveillance feature. Its onboarding must describe exactly what Android notification access exposes, allow per-app opt-in, and include a one-tap purge.

```kotlin
class IcynigmaNotificationListener : NotificationListenerService() {
    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val prefs = notificationPolicyRepository.current()
        if (!prefs.enabled || sbn.packageName !in prefs.allowedPackages) return
        notificationDigestRepository.storeLocal(
            packageName = sbn.packageName,
            postedAt = Instant.ofEpochMilli(sbn.postTime),
            title = sbn.notification.extras.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty(),
            text = sbn.notification.extras.getCharSequence(Notification.EXTRA_TEXT)?.toString().orEmpty(),
        )
    }
}
```

For email, v1 supports **compose only** through the system email intent. It does not read Gmail, Outlook, or another provider’s inbox. A future provider module may use a provider-approved OAuth flow after the user connects a specific account and chooses a sync policy.

## 12. Wi-Fi-Only Knowledge and Model Updates

Knowledge updates are local, signed packages; they are not an unrestricted web crawler. A pack can hold official I.M.E. reference material, user-selected PDFs, or approved sources. The app downloads only after displaying source, version, hash, size, and permission statement.

```kotlin
// core-updates/.../KnowledgePackWorker.kt
class KnowledgePackWorker(
    appContext: Context,
    params: WorkerParameters,
    private val updater: KnowledgePackUpdater,
) : CoroutineWorker(appContext, params) {
    override suspend fun doWork(): Result = runCatching {
        updater.downloadApprovedManifest()
        updater.verifyEd25519Signature()
        updater.verifySha256()
        updater.installIntoAppPrivateStorage()
        Result.success()
    }.getOrElse { Result.retry() }
}

fun scheduleWifiOnlyUpdate(context: Context) {
    val constraints = Constraints.Builder()
        .setRequiredNetworkType(NetworkType.UNMETERED)
        .setRequiresBatteryNotLow(true)
        .build()
    val request = PeriodicWorkRequestBuilder<KnowledgePackWorker>(24, TimeUnit.HOURS)
        .setConstraints(constraints)
        .build()
    WorkManager.getInstance(context).enqueueUniquePeriodicWork(
        "icynigma-knowledge-update",
        ExistingPeriodicWorkPolicy.UPDATE,
        request,
    )
}
```

The user must be able to disable the schedule, run it manually, inspect installed pack provenance, and remove any pack. WorkManager’s unmetered-network constraint fulfills the Wi-Fi-only requirement without polling the web continuously.

## 13. Jetpack Compose Interaction Blueprint

```kotlin
@Composable
fun LiveVoiceBar(
    state: LiveVoiceState,
    onStart: () -> Unit,
    onStop: () -> Unit,
) {
    val active = state is LiveVoiceState.Listening || state is LiveVoiceState.Thinking || state is LiveVoiceState.Speaking
    Surface(color = Color(0xCC101026), shape = RoundedCornerShape(20.dp)) {
        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(if (active) Icons.Rounded.StopCircle else Icons.Rounded.GraphicEq, contentDescription = null)
            Spacer(Modifier.width(10.dp))
            Text(
                when (state) {
                    LiveVoiceState.Listening -> "Listening — speak naturally"
                    LiveVoiceState.Thinking -> "Icynigma is thinking…"
                    LiveVoiceState.Speaking -> "Icynigma is speaking"
                    is LiveVoiceState.Unavailable -> state.reason
                    else -> "Live Voice ready"
                },
                modifier = Modifier.weight(1f),
            )
            Button(onClick = if (active) onStop else onStart) { Text(if (active) "Stop" else "Live") }
        }
    }
}
```

## 14. Taskade and Replit Demonstration Scope

Taskade should generate the project plan, test matrix, module documentation, UI copy, and Kotlin tasks from the master prompt. Replit can host a web demo of Icynigma’s chat flow, local-memory mock, permission-center UI, and Live Voice state simulation. Neither environment can produce or validate the final offline Android model runtime, notification special-access flow, Android Keystore behavior, or signed APK. Those steps must happen in Android Studio on a physical Android device.

## 15. Android Studio Delivery Sequence

1. Create a Kotlin/Compose project with the module structure above and install it on a physical API 31+ test device.
2. Build the shell using a fake `LocalAiEngine`; test chat, memory, consent screens, and tool confirmation without any model.
3. Download one checksum-verified Gemma 3n E2B LiteRT-LM model via Wi-Fi and validate time-to-first-token, token speed, memory, thermals, and battery on target phones.
4. Add local TTS, then add on-device STT only after status checks report a supported downloaded feature.
5. Add notification digest as a separately enabled capability. Keep data local and test the purge path.
6. Implement compose-only SMS/email and confirmed app launch. Do not request default-SMS role in v1.
7. Generate a signed release APK/AAB, verify signature and SHA-256, and make the signed APK available only from the owner’s website.

## 16. Private APK Distribution Checklist

The APK can be distributed from the owner’s website rather than an app store, but users will need to explicitly allow installation from that source in Android settings. Publish a versioned signed APK, SHA-256 checksum, release notes, privacy notice, minimum-device specification, model download size, and rollback copy. Never distribute debug-signed builds. Keep the model download separate from the APK to avoid oversized distribution and to permit user-approved Wi-Fi installation. [6]

## 17. Acceptance Criteria for Version 1

| Area | Acceptance criterion |
|---|---|
| Offline chat | Airplane-mode chat works after local model installation, without API key or account requirement |
| Live Voice | Compatible device can complete listen → think → speak → listen turns; Stop interrupts immediately |
| Privacy | No sensitive capability is active until the corresponding visible setting and Android consent step are complete |
| Memory | User can view, correct, export, and erase remembered preferences locally |
| Actions | SMS/email/app launch actions present an action preview and require a tap to proceed |
| Updates | Model/knowledge downloads run only on unmetered Wi-Fi after user approval and checksum verification |
| Reliability | Unsupported model/speech device shows typed-chat fallback rather than failing silently |

## References

[1]: https://ai.google.dev/gemma/docs/gemma-3n "Gemma 3n model overview"
[2]: https://developers.google.com/edge/litert-lm/android "Get Started with LiteRT-LM on Android"
[3]: https://developer.android.com/guide/topics/permissions/overview "Permissions on Android"
[4]: https://developer.android.com/guide/topics/permissions/default-handlers "Permissions used only in default handlers"
[5]: https://developers.google.com/ml-kit/genai/speech-recognition/android "ML Kit GenAI Speech Recognition API"
[6]: https://developers.google.com/edge/mediapipe/solutions/genai/llm_inference/android "LLM Inference guide for Android"
