export type RIMemorySuggestion = {
  key: string;
  value: string;
  reason: string;
};

export type RICodeProposal = {
  title: string;
  rationale: string;
  files: string[];
  patchPlan: string[];
  risk: "low" | "medium";
};

export type RISandboxAnalysis = {
  mode: "sandboxed-creative";
  summary: string;
  memorySuggestions: RIMemorySuggestion[];
  codeProposal: RICodeProposal;
  requiresApproval: true;
  boundaries: string[];
};

const boundaries = [
  "Suggestions are isolated from production execution.",
  "Memory changes require an explicit user approval action.",
  "Code proposals are plans only; no files, deployments, credentials, or security controls are modified.",
  "External messages, payments, device actions, and account changes remain user-authorized operations.",
  "R.I. is a creative reasoning mode and does not claim sentience or independent legal agency.",
];

function extractMemorySuggestions(message: string): RIMemorySuggestion[] {
  const suggestions: RIMemorySuggestion[] = [];
  const normalized = message.trim().replace(/\s+/g, " ");
  const preference = normalized.match(/(?:i prefer|i like|please remember that|remember that)\s+(.{3,160})/i);
  if (preference) {
    suggestions.push({
      key: "user_preference",
      value: preference[1].replace(/[.!?]+$/, ""),
      reason: "The message contains an explicit preference or memory request.",
    });
  }
  if (/concise|short answers|brief/i.test(normalized)) {
    suggestions.push({ key: "response_style", value: "concise", reason: "The message requests shorter responses." });
  }
  if (/detailed|in depth|step by step/i.test(normalized)) {
    suggestions.push({ key: "response_style", value: "detailed", reason: "The message requests deeper explanations." });
  }
  return suggestions.slice(0, 3);
}

function proposeCodeImprovement(message: string): RICodeProposal {
  const voiceRelated = /voice|tts|speech|elevenlabs|audio/i.test(message);
  const securityRelated = /security|auth|privacy|permission|secret/i.test(message);
  if (securityRelated) {
    return {
      title: "Add a regression test for the requested security behavior",
      rationale: "Security-related changes should be test-first and reviewable before implementation.",
      files: ["server/*.test.ts", "server/ri-policy.ts"],
      patchPlan: ["Define the expected invariant as a unit test.", "Run the test in the isolated validation suite.", "Require human review before any production change."],
      risk: "low",
    };
  }
  if (voiceRelated) {
    return {
      title: "Improve voice fallback observability",
      rationale: "Voice failures should expose provider status without leaking credentials or interrupting text chat.",
      files: ["client/src/components/TTSPlayer.tsx", "server/elevenlabs.ts"],
      patchPlan: ["Add a provider-neutral status event.", "Keep browser/Piper fallback behavior unchanged.", "Add tests for timeout and fallback states."],
      risk: "low",
    };
  }
  return {
    title: "Add a focused regression test before changing behavior",
    rationale: "R.I. proposals begin with a small, reversible change rather than autonomous code execution.",
    files: ["server/*.test.ts"],
    patchPlan: ["Capture the intended behavior in a test.", "Review the smallest possible implementation.", "Run type-check, tests, and build in the sandbox."],
    risk: "low",
  };
}

export function analyzeRIPrompt(message: string): RISandboxAnalysis {
  const clean = message.trim();
  return {
    mode: "sandboxed-creative",
    summary: clean ? "R.I. identified possible preference signals and prepared a reversible engineering proposal." : "R.I. is waiting for a bounded task.",
    memorySuggestions: extractMemorySuggestions(clean),
    codeProposal: proposeCodeImprovement(clean),
    requiresApproval: true,
    boundaries,
  };
}
