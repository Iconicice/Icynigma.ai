import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import AGENT


class FakeProvider:
    name = "fake"
    model = "test-model"

    def complete(self, messages, system):
        return AGENT.Reply("portable reply", self.name, self.model)


class PortableAgentTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.store = AGENT.Store(Path(self.temp_dir.name) / "memory.db")
        self.agent = AGENT.PortableAgent(AGENT.Config(db_path=Path(self.temp_dir.name) / "memory.db"), self.store)
        self.agent.online = None
        self.agent.offline = FakeProvider()

    def tearDown(self):
        self.store.close()
        self.temp_dir.cleanup()

    def test_wal_and_memory_persistence(self):
        mode = self.store.db.execute("PRAGMA journal_mode").fetchone()[0]
        self.assertEqual(mode.lower(), "wal")
        self.store.remember("name", "Ice")
        self.assertEqual(self.store.memories()[0]["value"], "Ice")
        self.assertTrue(self.store.forget("name"))
        self.assertFalse(self.store.memories())

    def test_offline_provider_reply_is_logged(self):
        reply = self.agent.ask("hello", force_offline=True)
        self.assertEqual(reply.text, "portable reply")
        rows = self.store.recent_messages()
        self.assertEqual([row["role"] for row in rows], ["user", "assistant"])
        trace = self.store.db.execute("SELECT provider,model FROM thought_traces").fetchone()
        self.assertEqual(tuple(trace), ("fake", "test-model"))

    def test_commands_are_safe_and_useful(self):
        self.assertIn("Remembered", self.agent.command("/remember theme=midnight"))
        self.assertIn("theme = midnight", self.agent.command("/memories"))
        proposal = self.agent.command("/run_shell rm -rf /")
        self.assertIn("proposal-only", proposal)
        self.assertIn("rm -rf /", proposal)

    def test_no_termux_import_or_requirement(self):
        source = Path(AGENT.__file__).read_text(encoding="utf-8")
        self.assertNotIn("import termux", source.lower())
        self.assertNotIn("termux-api", source.lower())


if __name__ == "__main__":
    unittest.main()
