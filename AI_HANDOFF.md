# Icynigma.ai — AI Assistant Handoff

This file is the compact operating brief for any AI coding assistant importing the repository.

## Project Identity

Icynigma.ai is a philosophical AI chatbot for Iconic Media Entertainment. Its visual identity is a dark midnight-purple environment with 3D glass-morphism surfaces, ethereal gradients, luminous violet and cyan accents, and futuristic Orbitron headings paired with readable Outfit or Poppins body text. The core tagline is **“from the plethora he came.”**

## Current Product Capabilities

The application contains a React 19 frontend, Express 4 backend, tRPC 11 API layer, Drizzle ORM database integration, Manus OAuth authentication, persistent chat history, multi-conversation threads, Manus LLM responses, Piper/Web Speech TTS, custom notifications, an enhanced settings modal, PWA manifest and service worker, responsive layouts, and WCAG-oriented focus and keyboard behavior.

The primary pages are `client/src/pages/HomeRedesigned.tsx` and `client/src/pages/ChatRedesigned.tsx`. Reusable chat components include `AIChatBox.tsx`, `ChatLayout.tsx`, `EnhancedSettingsModal.tsx`, `TTSPlayer.tsx`, and notification components. The tRPC procedures are defined in `server/routers.ts`, database helpers are in `server/db.ts`, and the schema is in `drizzle/schema.ts`.

## Non-Negotiable Design Rules

Preserve the midnight-purple palette, glass transparency, blur, luminous borders, responsive spacing, and futuristic-but-readable type hierarchy. Avoid generic dashboard styling, flat white cards, visual clutter, and inaccessible low-contrast controls. Any new interactive control must have an accessible name, visible keyboard focus, a disabled/loading state, and a clear success or error response.

## Development Workflow

Use pnpm. The expected commands are:

```bash
pnpm install
pnpm check
pnpm test
pnpm build
pnpm dev
```

The database is schema-first. Review `drizzle/schema.ts` before changing database behavior and use the project database migration workflow. Do not commit `.env`, credentials, tokens, generated database files, `node_modules`, or build output. Configure secrets through the hosting environment or Manus project settings.

## Safe Change Protocol

Before changing an existing feature, inspect its current component, router procedure, schema relationship, and tests. For new features, add a TODO item first. Preserve the current stable checkpoint so the design can be restored if the new work is not accepted. After implementation, run the relevant tests and then the complete test suite plus production build.

## AI Coding Instructions

When asked to modify the project, first summarize the affected files and data flow. Prefer existing shadcn/ui components and project utilities rather than introducing duplicate patterns. Keep server and client contracts type-safe through tRPC. Never fabricate testimonials, ratings, user reviews, or customer data. Never expose secrets in source code. If a requirement is ambiguous, ask whether it applies to the public landing page, authenticated chat, settings, or deployment package.

## Suggested Future Extensions

The planned product direction includes browser voice input, a smart adaptive sidebar, conversation search and grouping, prompt suggestions, Markdown/PDF export, message bookmarking, and optional conversation sharing. Each extension should be implemented incrementally and tested before the next one.

## Handoff Prompt

> You are extending Icynigma.ai. Read `README.md`, `PROJECT_DOCUMENTATION.md`, `AI_HANDOFF.md`, `todo.md`, and the relevant source files before editing. Preserve the midnight-purple 3D glass-morphism design, use existing components, keep tRPC types aligned, protect secrets, add tests for behavior changes, run `pnpm check`, `pnpm test`, and `pnpm build`, and report exactly which files changed and which validations passed.
