# Icynigma.ai - Complete Technical & Architecture Documentation

> **Manus AI** • **Version 1.0.0** • **MIT License**

---

## Executive Summary

Icynigma.ai is a full-stack, philosophical artificial intelligence chat application built for Iconic Media Entertainment [1]. It merges a dark midnight-purple aesthetic, 3D glass-morphism visual elements, and contemplative AI dialogue into a cohesive digital experience [1]. Designed with an emphasis on emotional resonance and intellectual depth, the platform supports persistent multi-turn conversations, secure user authentication, multi-provider text-to-speech (TTS), and progressive web app (PWA) installation.

This document serves as the comprehensive project blueprint and cross-LLM import file, enabling developers and AI assistants (such as ChatGPT, DeepSeek, and Gemini) to understand, maintain, and extend the codebase [2].

---

## 1. System Architecture & Tech Stack

Icynigma.ai utilizes a modern, type-safe full-stack architecture designed for seamless scalability, rapid deployment, and high reliability across client and server environments.

| Layer | Technology | Purpose & Capabilities |
| :--- | :--- | :--- |
| **Frontend** | React 19, Tailwind CSS 4, shadcn/ui | Responsive user interface, glass-morphism styling, client-side routing via Wouter [3] |
| **Backend** | Express 4, tRPC 11, Node.js 22+ | Type-safe RPC API router, session management, middleware orchestration [3] |
| **Database** | Drizzle ORM, MySQL / TiDB / SQLite | Relational schema management, type-safe queries, conversation persistence [3] |
| **Authentication** | Manus OAuth, JWT, HTTP-only cookies | Secure user sessions, role-based access control, cryptographic token signing [3] |
| **AI Integration** | Manus LLM API, Custom System Prompts | Philosophical reasoning engine, context-aware dialogue generation |
| **Voice / TTS** | Piper TTS (Neural) & Web Speech API | Multi-voice neural speech synthesis with speed control and fallback mechanisms [4] |
| **Build & Tooling** | Vite, esbuild, Vitest | Lightning-fast HMR, production bundling, comprehensive test coverage (48 passing tests) [2] |

---

## 2. Directory Structure

The project repository is structured for clarity and separation of concerns:

```text
icynigma/
├── client/                 # React 19 Single Page Application
│   ├── public/             # Static assets, PWA manifest.json, service worker (sw.js)
│   └── src/
│       ├── components/     # Reusable UI components (AIChatBox, ChatLayout, EnhancedSettingsModal, etc.)
│       ├── contexts/       # React contexts (ThemeContext, NotificationContext)
│       ├── hooks/          # Custom hooks (useAuth)
│       ├── lib/            # tRPC client binding
│       ├── pages/          # Page components (HomeRedesigned, ChatRedesigned, NotFound)
│       ├── App.tsx         # Main routing and provider hierarchy
│       ├── main.tsx        # React root and tRPC query client provider
│       └── index.css       # Global styles, Tailwind 4 directives, glass-morphism utilities
├── server/                 # Express 4 Backend API
│   ├── _core/              # Framework infrastructure (auth, LLM client, cookies, trpc setup)
│   ├── routers.ts          # tRPC procedures for auth, chat, conversations, and TTS
│   ├── db.ts               # Database query helpers for Drizzle ORM
│   └── *.test.ts           # Vitest unit test suite (auth, chat, tts, ollama)
├── drizzle/                # Database Schema & Migrations
│   ├── schema.ts           # Drizzle table definitions (users, conversations, chatMessages)
│   └── migrations/         # SQL migration history
├── shared/                 # Shared Constants & Types
│   ├── const.ts            # Global constants (cookies, error messages)
│   └── types.ts            # Shared TypeScript type definitions
├── README.md               # Quick start and deployment guide
├── PROJECT_DOCUMENTATION.md# This architectural reference file
├── REPLIT_QUICK_START.md   # Replit deployment guide
├── package.json            # Project dependencies and npm scripts
└── tsconfig.json           # TypeScript configuration
```

---

## 3. Database Schema & Data Models

The relational database schema is managed via Drizzle ORM, providing compile-time type safety and smooth migration workflows.

### Users Table (`users`)
Stores authenticated user profiles originating from Manus OAuth or local sessions.
- `id` (Serial, Primary Key)
- `openId` (Text, Unique) - External OAuth identifier
- `name` (Text) - User display name
- `email` (Text) - User email address
- `role` (Enum: `user`, `admin`) - Access control role
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Conversations Table (`conversations`)
Groups chat messages into dedicated threads for Manus-style multi-conversation management.
- `id` (Serial, Primary Key)
- `userId` (Integer, Foreign Key to `users.id`) - Owner of the conversation
- `title` (Text) - Conversation display title
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Chat Messages Table (`chatMessages`)
Persists individual chat turns associated with users and conversations.
- `id` (Serial, Primary Key)
- `userId` (Integer, Foreign Key to `users.id`)
- `conversationId` (Integer, Foreign Key to `conversations.id`, Optional)
- `role` (Enum: `user`, `assistant`, `system`) - Message sender role
- `content` (Text) - Message markdown text
- `createdAt` (Timestamp)

---

## 4. API Endpoints & tRPC Procedures

All client-server communication is handled through tRPC under the `/api/trpc` endpoint, ensuring complete type safety without manual REST contracts [3].

### Authentication Router (`auth`)
- `auth.me`: Retrieves current authenticated user session or throws unauthenticated error.
- `auth.logout`: Clears session cookies and terminates user session [5].

### Chat Router (`chat`)
- `chat.sendMessage`: Submits user prompt to Manus LLM with philosophical system persona, appends messages to database, and returns generated response.
- `chat.getHistory`: Fetches historical chat turns for the active user.

### Conversations Router (`conversations`)
- `conversations.list`: Lists all conversation threads belonging to the authenticated user.
- `conversations.create`: Initializes a new conversation thread with an automatic title.
- `conversations.delete`: Removes a conversation thread and its associated message history.

### Text-to-Speech Router (`tts`)
- `tts.synthesize`: Converts assistant text responses into neural audio streams utilizing Piper TTS or Web Speech API fallback.

---

## 5. User Experience & Visual Design System

Icynigma.ai adheres to a rigorous UX/UI design philosophy combining ethereal minimalism, dark midnight-purple atmosphere, and 3D glass-morphism [1].

### Design Tokens & Aesthetics
- **Color Palette**: Deep slate background (`#0b0f19`), midnight purple gradients (`#1e1b4b`, `#312e81`), ethereal violet accents (`#a78bfa`), and glowing cyan highlights (`#38bdf8`).
- **Typography**: `Orbitron` [6] for futuristic headings and branding; `Outfit` and `Poppins` for readable, clean body text.
- **Glass-Morphism**: Backdrop blur (`backdrop-blur-md`), translucent white/dark overlays (`rgba(15, 23, 42, 0.7)`), and subtle glowing borders (`border border-purple-500/20`) [1].
- **Accessibility**: WCAG 2.1 AA compliant keyboard navigation, visible focus indicators, high contrast support, and screen reader labels.

---

## 6. Testing & Quality Assurance

The application maintains robust automated test coverage via Vitest. The test suite includes 48 passing tests verifying authentication logout [5], chat completions, database queries, TTS fallback mechanisms, and Ollama integration [7].

To execute the test suite locally:
```bash
pnpm test
```

---

## References

[1] Iconic Media Entertainment. *Icynigma.ai Philosophical AI Platform Architecture*. Internal Design Spec, 2026.  
[2] Manus AI. *Full-Stack Web Development Playbook and Testing Standards*. Technical Guidelines, 2026.  
[3] tRPC Association. *tRPC 11 Documentation: End-to-end typesafe APIs*. Available online: https://trpc.io [Accessed 2026].  
[4] W3C. *Web Speech API Specification*. W3C Working Draft, Available online: https://www.w3.org/TR/speech-api/ [Accessed 2026].  
[5] Icynigma Project Team. *Server Authentication and Session Logout Tests (`server/auth.logout.test.ts`)*. Source Code Repository, 2026.  
[6] Google Fonts. *Orbitron Typeface Documentation*. Available online: https://fonts.google.com/specimen/Orbitron [Accessed 2026].  
[7] Icynigma Project Team. *Ollama and Local AI Client Integration Tests (`server/ollama.test.ts`)*. Source Code Repository, 2026.

---

**Icynigma.ai is fully documented and ready for multi-LLM import, collaborative editing, and production deployment.**

## Creator Attribution

**Creator:** Inolofatseng Mokgoko  
Icynigma.ai was conceived and created by Inolofatseng Mokgoko for Iconic Media Entertainment.

## Current Interaction Model

The chat shell uses authenticated, conversation-scoped messaging. The smart sidebar sorts threads by recent activity, groups them as **Today**, **Previous 7 days**, or **Earlier**, and lets users search titles, start a fresh thread, remove an owned thread, and explore prompts connected to the active topic. The browser voice-input feature uses the native Web Speech recognition API when it is available and preserves a complete typed-input fallback.

The installed-app experience is driven by `client/public/manifest.json`, `client/public/sw.js`, and `client/src/components/InstallAppButton.tsx`. The PWA icon is a hosted derivative of the user-supplied Icynigma logo. The service worker must not be changed to cache authenticated API responses without a privacy review.

## Latest Refresh: Applied Settings, Voice Services, and Public Entry Points

Icynigma now uses a staged **Apply changes** workflow in its settings panel. Visitors can prepare theme, background, typography, accent color, smart or compact sidebar behavior, voice-input provider, TTS engine, and playback speed preferences before committing them locally. Light, dark, and automatic themes have visibly distinct chat-shell treatments, and older local settings are normalized safely.

The application now supports authenticated server-side **ElevenLabs** synthesis and transcription. Audio for requested transcription is handled only for that request and the service key remains on the server. Piper neural speech and browser speech capabilities continue as fallbacks when a cloud speech request or recording capability is unavailable. The associated integration and fallback logic is covered by the expanded test suite.

The public repository now includes a `docs/` GitHub Pages entry point at `https://iconicice.github.io/Icynigma.ai/`. It is deliberately a static project page that sends visitors to the full secure application. GitHub Pages does not execute the Express server, database, OAuth, AI model calls, or server-side voice APIs; those services remain available at `https://icynigma-xkxmkqhz.manus.space`.

IME TrustPass was assessed as a potential shared login service. Its current public surface exposes its own sign-in options, but no public third-party OAuth/OpenID Connect issuer metadata or client-registration contract. A future shared sign-in rollout should use server-side OpenID Connect Authorization Code Flow with PKCE, registered redirect URIs, state and nonce validation, JWKS signature checks, audience validation, and expiry checks. Icynigma retains its existing authentication until this contract is supplied.

## Official I.M.E. Information Reference

Icynigma recognizes questions about Ice/Iconic Media Entertainment, I.M.E., Iconic.ice, and Inolofatseng Mokgoko. For these topics it supplies the model with bounded, published facts from the user-designated official source, `https://icemediaent-kbysc8ud.manus.space/`. The assistant is instructed to include that source URL, avoid inventing information, and identify details not confirmed by the source. Standard philosophical requests are not given the official business-reference context.
