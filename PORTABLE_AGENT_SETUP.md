# Portable Icynigma.ai Agent

`AGENT.py` is a standalone, dependency-free Python agent for **Icynigma.ai Systems [Rogue Intelligence]**. It runs on ordinary Python 3.10+ environments: Linux, macOS, Windows, Android Python runtimes, servers, and Termux. Termux is optional and is not imported, detected, or required by the core agent.

## What is included

- SQLite persistence at `~/icynigma_memory.db` by default.
- WAL mode for safer and faster mobile-storage writes.
- `memories`, `messages`, and `thought_traces` tables.
- Online OpenRouter routing when `OPENROUTER_API_KEY` is available.
- Offline Ollama routing when the local Ollama REST endpoint is available.
- Provider fallback: online first, then Ollama; `--offline` forces local routing.
- OpenRouter attribution headers using the Icynigma.ai identity.
- Safe commands for memories, health, optional camera/TTS adapters, and shell proposals.
- No external Python packages are required.

## Quick start

```bash
python3 AGENT.py
```

One-shot mode:

```bash
python3 AGENT.py --once "What makes an idea worth pursuing?"
```

Use a separate database:

```bash
python3 AGENT.py --db ./icynigma_memory.db
```

Force offline mode:

```bash
python3 AGENT.py --offline --once "Explain this from local memory."
```

## Configuration

The core agent reads environment variables and does not require a `.env` file:

| Variable | Purpose | Default |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Enables online routing | unset |
| `ICYNIGMA_ONLINE_MODEL` | OpenRouter model | `google/gemini-2.5-flash-thinking-exp:free` |
| `ICYNIGMA_OFFLINE_MODEL` | Ollama model | `lfm3-omni` |
| `OLLAMA_URL` | Ollama chat endpoint | `http://127.0.0.1:11434/api/chat` |
| `ICYNIGMA_DB` | SQLite database path | `~/icynigma_memory.db` |
| `ICYNIGMA_TTS_COMMAND` | Optional local TTS command prefix | unset |
| `ICYNIGMA_CAMERA_COMMAND` | Optional local camera command prefix | unset |

Example online setup:

```bash
export OPENROUTER_API_KEY='your-key'
python3 AGENT.py
```

Example offline setup with Ollama:

```bash
ollama serve
ollama pull lfm3-omni
python3 AGENT.py --offline
```

The portable agent does not install, invoke, or depend on `termux-*` commands. On a device with another TTS or camera system, set an explicit adapter command. If no adapter is configured, the agent reports that the capability is unavailable rather than failing or pretending it worked.

## Commands

- `/remember key=value` stores or updates a preference.
- `/memories` lists stored preferences.
- `/forget key` removes one preference.
- `/voice text` uses the optional configured TTS adapter, otherwise returns a text fallback.
- `/look` uses the optional configured camera adapter, otherwise reports unavailable.
- `/run_shell command` only proposes a command. It never executes shell commands automatically.
- `/health` prints provider and database status.
- `/offline text` sends one turn to Ollama regardless of online availability.
- `/quit` exits.

## Security boundaries

The portable implementation intentionally does not self-modify source code, execute generated shell commands, send email/SMS/WhatsApp messages, or access the camera/microphone without an explicitly configured adapter. Those capabilities can be added as separate, auditable adapters with their own permission and confirmation policy.

Provider reasoning metadata is stored only when returned by a provider. It is not exposed as a user-facing hidden chain of thought; applications should treat the `thought_traces` table as optional provider metadata and restrict access to the local database.

## Relationship to the original documents

This guide and `AGENT.py` are additive. The original files remain preserved:

- `ANDROID_OFFLINE_AGENT_MASTER_BLUEPRINT.md`
- `TASKADE_ANDROID_AGENT_MASTER_PROMPT.md`
- `ICYNIGMA_MAKE_STANDALONE_MASTER_BLUEPRINT.md`
- `ICYNIGMA_MAKE_COM_BUILD_PROMPT.md`
- `LOCAL_AI_SETUP.md`
- `ANDROID_AGENT_RESEARCH_NOTES.md`
- `PROJECT_DOCUMENTATION.md`

Use this portable agent as the implementation baseline when a full Android Studio app, Taskade prototype, Make.com orchestration layer, or web client is not yet available.
