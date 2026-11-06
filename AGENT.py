#!/usr/bin/env python3
"""Portable Icynigma.ai Systems [R.I] agent.

Runs with Python 3.10+ on Linux, macOS, Windows, Android Python environments,
and Termux when available. Termux is never required. The standard library is
used for persistence, HTTP, routing, and the interactive CLI.
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import shlex
import sqlite3
import subprocess
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional, Protocol

IDENTITY = "Icynigma.ai Systems [Rogue Intelligence]"
CREATOR = 'Inolofatseng "Ice" Mokgoko / Iconic Media Entertainment'
DEFAULT_DB = Path.home() / "icynigma_memory.db"


@dataclass
class Config:
    db_path: Path = DEFAULT_DB
    online_model: str = "google/gemini-2.5-flash-thinking-exp:free"
    offline_model: str = "lfm3-omni"
    openrouter_url: str = "https://openrouter.ai/api/v1/chat/completions"
    ollama_url: str = "http://127.0.0.1:11434/api/chat"
    http_referer: str = "https://icynigma.ai"
    request_timeout: float = 45.0

    @classmethod
    def from_env(cls, db_path: Optional[Path] = None) -> "Config":
        return cls(
            db_path=db_path or Path(os.getenv("ICYNIGMA_DB", DEFAULT_DB)),
            online_model=os.getenv("ICYNIGMA_ONLINE_MODEL", cls.online_model),
            offline_model=os.getenv("ICYNIGMA_OFFLINE_MODEL", cls.offline_model),
            openrouter_url=os.getenv("OPENROUTER_URL", cls.openrouter_url),
            ollama_url=os.getenv("OLLAMA_URL", cls.ollama_url),
            http_referer=os.getenv("OPENROUTER_HTTP_REFERER", cls.http_referer),
            request_timeout=float(os.getenv("ICYNIGMA_HTTP_TIMEOUT", cls.request_timeout)),
        )


class Store:
    def __init__(self, path: Path):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(path)
        self.db.row_factory = sqlite3.Row
        self.db.execute("PRAGMA journal_mode=WAL")
        self.db.execute("PRAGMA foreign_keys=ON")
        self.db.executescript(
            """
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL UNIQUE,
                value TEXT NOT NULL,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL
            );
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                provider TEXT,
                created_at REAL NOT NULL
            );
            CREATE TABLE IF NOT EXISTS thought_traces (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                provider TEXT NOT NULL,
                model TEXT,
                reasoning TEXT,
                reasoning_details TEXT,
                created_at REAL NOT NULL
            );
            """
        )
        self.db.commit()

    def remember(self, key: str, value: str) -> None:
        now = time.time()
        self.db.execute(
            "INSERT INTO memories(key,value,created_at,updated_at) VALUES(?,?,?,?) "
            "ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
            (key.strip(), value.strip(), now, now),
        )
        self.db.commit()

    def forget(self, key: str) -> bool:
        cur = self.db.execute("DELETE FROM memories WHERE key=?", (key.strip(),))
        self.db.commit()
        return cur.rowcount > 0

    def memories(self) -> list[sqlite3.Row]:
        return list(self.db.execute("SELECT key,value FROM memories ORDER BY key"))

    def add_message(self, role: str, content: str, provider: str = "") -> None:
        self.db.execute("INSERT INTO messages(role,content,provider,created_at) VALUES(?,?,?,?)", (role, content, provider, time.time()))
        self.db.commit()

    def recent_messages(self, limit: int = 20) -> list[dict[str, str]]:
        rows = list(self.db.execute("SELECT role,content FROM messages ORDER BY id DESC LIMIT ?", (limit,)))
        return [{"role": row["role"], "content": row["content"]} for row in reversed(rows)]

    def add_trace(self, provider: str, model: str, reasoning: Any = None, details: Any = None) -> None:
        self.db.execute(
            "INSERT INTO thought_traces(provider,model,reasoning,reasoning_details,created_at) VALUES(?,?,?,?,?)",
            (provider, model, _json_text(reasoning), _json_text(details), time.time()),
        )
        self.db.commit()

    def close(self) -> None:
        self.db.close()


def _json_text(value: Any) -> str:
    if value is None:
        return ""
    return value if isinstance(value, str) else json.dumps(value, ensure_ascii=False)


@dataclass
class Reply:
    text: str
    provider: str
    model: str
    reasoning: Any = None
    reasoning_details: Any = None


class Provider(Protocol):
    name: str
    model: str

    def complete(self, messages: list[dict[str, str]], system: str) -> Reply: ...


class OpenRouterProvider:
    name = "openrouter"

    def __init__(self, config: Config, api_key: str):
        self.config, self.api_key, self.model = config, api_key, config.online_model

    def complete(self, messages: list[dict[str, str]], system: str) -> Reply:
        payload = {"model": self.model, "messages": [{"role": "system", "content": system}, *messages]}
        request = urllib.request.Request(
            self.config.openrouter_url,
            data=json.dumps(payload).encode(),
            headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json", "HTTP-Referer": self.config.http_referer, "X-OpenRouter-Title": IDENTITY},
            method="POST",
        )
        data = _request_json(request, self.config.request_timeout)
        choice = (data.get("choices") or [{}])[0]
        message = choice.get("message") or {}
        text = message.get("content") or data.get("output") or "I received no text response."
        return Reply(str(text), self.name, self.model, message.get("reasoning"), message.get("reasoning_details"))


class OllamaProvider:
    name = "ollama"

    def __init__(self, config: Config):
        self.config, self.model = config, config.offline_model

    def complete(self, messages: list[dict[str, str]], system: str) -> Reply:
        payload = {"model": self.model, "stream": False, "messages": [{"role": "system", "content": system}, *messages]}
        request = urllib.request.Request(self.config.ollama_url, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"}, method="POST")
        data = _request_json(request, self.config.request_timeout)
        message = data.get("message") or {}
        return Reply(str(message.get("content") or data.get("response") or "I received no text response."), self.name, self.model)


def _request_json(request: urllib.request.Request, timeout: float) -> dict[str, Any]:
    with urllib.request.urlopen(request, timeout=timeout) as response:
        raw = response.read().decode("utf-8")
    data = json.loads(raw)
    if not isinstance(data, dict):
        raise RuntimeError("Provider returned a non-object response")
    return data


class PortableAgent:
    def __init__(self, config: Config, store: Store):
        self.config, self.store = config, store
        self.online: Optional[Provider] = None
        key = os.getenv("OPENROUTER_API_KEY", "").strip()
        if key:
            self.online = OpenRouterProvider(config, key)
        self.offline: Provider = OllamaProvider(config)

    def system_prompt(self) -> str:
        memory_text = "\n".join(f"- {row['key']}: {row['value']}" for row in self.store.memories()) or "(none)"
        return (
            f"You are {IDENTITY}. You were created by {CREATOR}. Keep this identity accurate; "
            "do not claim to be another company or model. Be useful, grounded, concise, and transparent. "
            "You may adapt preferences through explicit memory commands, but never modify source code, execute shell commands, "
            "send messages, or access devices without a clearly defined user-approved adapter.\n"
            f"Known user memory:\n{memory_text}"
        )

    def ask(self, text: str, force_offline: bool = False) -> Reply:
        history = self.store.recent_messages()
        self.store.add_message("user", text)
        providers: list[Provider] = []
        if not force_offline and self.online:
            providers.append(self.online)
        providers.append(self.offline)
        last_error: Optional[Exception] = None
        for provider in providers:
            try:
                reply = provider.complete([*history, {"role": "user", "content": text}], self.system_prompt())
                self.store.add_message("assistant", reply.text, reply.provider)
                self.store.add_trace(reply.provider, reply.model, reply.reasoning, reply.reasoning_details)
                return reply
            except (OSError, urllib.error.URLError, urllib.error.HTTPError, json.JSONDecodeError, RuntimeError) as exc:
                last_error = exc
        raise RuntimeError(f"No AI provider is available. Start Ollama for offline mode or configure OPENROUTER_API_KEY. Details: {last_error}")

    def command(self, line: str) -> Optional[str]:
        command, _, argument = line.partition(" ")
        argument = argument.strip()
        if command == "/remember":
            key, separator, value = argument.partition("=")
            if not separator or not key.strip() or not value.strip():
                return "Usage: /remember key=value"
            self.store.remember(key, value)
            return f"Remembered: {key.strip()}"
        if command == "/memories":
            rows = self.store.memories()
            return "\n".join(f"{row['key']} = {row['value']}" for row in rows) if rows else "No memories stored."
        if command == "/forget":
            return "Forgotten." if self.store.forget(argument) else "No memory matched that key."
        if command == "/voice":
            return self.voice(argument) if argument else "Usage: /voice text"
        if command == "/look":
            return self.look()
        if command == "/run_shell":
            return self.propose_shell(argument)
        if command == "/health":
            return self.health()
        if command == "/help":
            return "Commands: /remember key=value, /memories, /forget key, /voice text, /look, /run_shell command, /health, /offline text, /quit"
        return None

    def voice(self, text: str) -> str:
        command = os.getenv("ICYNIGMA_TTS_COMMAND", "").strip()
        if not command:
            return "Portable voice fallback: " + text + "\nSet ICYNIGMA_TTS_COMMAND to an approved local TTS command to enable audio."
        try:
            subprocess.run(shlex.split(command) + [text], check=True, timeout=30)
            return "Voice output completed."
        except (OSError, subprocess.SubprocessError) as exc:
            return f"Voice adapter failed safely: {exc}"

    def look(self) -> str:
        command = os.getenv("ICYNIGMA_CAMERA_COMMAND", "").strip()
        if not command:
            return "Camera unavailable: set ICYNIGMA_CAMERA_COMMAND to an approved camera command."
        output = Path(os.getenv("ICYNIGMA_CAMERA_OUTPUT", "icynigma-camera.jpg"))
        try:
            subprocess.run(shlex.split(command) + [str(output)], check=True, timeout=30)
            encoded = base64.b64encode(output.read_bytes()).decode()
            return f"Captured {output} ({len(encoded)} base64 characters). Image transmission is not automatic."
        except (OSError, subprocess.SubprocessError) as exc:
            return f"Camera adapter failed safely: {exc}"

    def propose_shell(self, command: str) -> str:
        if not command:
            return "Usage: /run_shell command"
        return "Shell execution is proposal-only in the portable agent. Review and run this command yourself:\n" + command

    def health(self) -> str:
        return json.dumps({"identity": IDENTITY, "db": str(self.config.db_path), "online_configured": bool(self.online), "offline_provider": "ollama", "offline_model": self.config.offline_model}, indent=2)


def main() -> int:
    parser = argparse.ArgumentParser(description=IDENTITY)
    parser.add_argument("--db", type=Path, default=None, help="SQLite database path")
    parser.add_argument("--offline", action="store_true", help="Force Ollama/offline routing")
    parser.add_argument("--once", help="Process one prompt and exit")
    args = parser.parse_args()
    config = Config.from_env(args.db)
    store = Store(config.db_path)
    agent = PortableAgent(config, store)
    try:
        if args.once:
            text = args.once
            reply = agent.ask(text, force_offline=args.offline)
            print(reply.text)
            return 0
        print(f"{IDENTITY}\nPortable mode — Termux is optional. Type /help or /quit.\n")
        while True:
            try:
                line = input("You> ").strip()
            except (EOFError, KeyboardInterrupt):
                print()
                break
            if not line:
                continue
            if line in {"/quit", "/exit"}:
                break
            if line.startswith("/offline "):
                line = line[len("/offline "):].strip()
                try:
                    print(f"Icynigma.ai> {agent.ask(line, force_offline=True).text}\n")
                except RuntimeError as exc:
                    print(f"Icynigma.ai> {exc}\n")
                continue
            result = agent.command(line) if line.startswith("/") else None
            if result is not None:
                print(f"Icynigma.ai> {result}\n")
                continue
            try:
                print(f"Icynigma.ai> {agent.ask(line, force_offline=args.offline).text}\n")
            except RuntimeError as exc:
                print(f"Icynigma.ai> {exc}\n")
    finally:
        store.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
