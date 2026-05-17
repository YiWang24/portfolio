# AI-Powered Interactive Portfolio

Yi Wang's portfolio site. A single Next.js application that combines a cinematic terminal UI with a multi-agent chat backend built on the Vercel AI SDK.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)](https://react.dev/)
[![Vercel AI SDK](https://img.shields.io/badge/AI%20SDK-v5-000000?style=flat)](https://sdk.vercel.ai/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)

## Overview

The site is a digital twin that can:

- Answer questions about resume, projects, and technical experience using RAG over a single `profile.json`
- Surface live GitHub repository statistics, language breakdowns, and recent commits
- Read and quote source files from public repositories
- Accept contact messages and forward them via email

The chat experience uses the Vercel AI SDK's `useChat` hook on the frontend and a multi-step `streamText` loop on the backend, all hosted as Next.js App Router route handlers.

## Architecture

```
Browser
  └─ useChat (Vercel AI SDK)
       └─ POST /api/chat   ── Next.js App Router route
            ├─ Rate limit  (Upstash Redis)
            ├─ streamText  (GLM-4.5 via OpenAI-compatible endpoint)
            │    ├─ Router agent      → transfer_to_{tech_lead|contact}
            │    ├─ Tech Lead agent   → GitHub tools, RAG tools, utility
            │    └─ Contact agent     → sendContactMessage
            └─ UIMessageStream response

Supporting routes
  ├─ GET  /api/health           Neon connectivity probe
  ├─ POST /api/contact          Resend + Neon insert
  ├─ GET  /api/github/stats     Octokit GraphQL aggregator
  └─ POST /api/rag/sync         Re-embed profile.json into vector_store

Data plane
  ├─ Neon Postgres + pgvector(2048) HNSW   — RAG corpus + contact log
  └─ Upstash Redis                          — sliding-window rate limit
```

### Agents

Three system prompts orchestrate the chat:

- **Router** — routes user intent, refuses out-of-scope, owns the safety preamble.
- **Tech Lead** — speaks as Yi Wang. Has access to ten GitHub tools, two RAG tools, and the contact card utility.
- **Contact** — collects messages from visitors and calls `sendContactMessage`.

Routing is implemented as virtual `transfer_to_*` tools. Each step's active tool set and system prompt are swapped via `prepareStep` based on a mutable `AgentState`. `stopWhen: stepCountIs(8)` bounds the multi-step loop, so one streaming response covers router → specialist → multi-tool-use → final answer.

### RAG

`profile.json` is the single source of truth. On demand via `/api/rag/sync` or `npm run rag:build`:

1. Convert each top-level section to markdown — `personal/profile-about.md`, `personal/education.md`, `personal/experience.md`, `personal/skills.md`, `projects/portfolio.md`.
2. Split into 1000-character chunks with 100-character overlap.
3. Embed each chunk via GLM `embedding-3` (2048 dims).
4. Upsert into `vector_store` with `(path, chunk_index)` as the unique key. Removed chunks are pruned.

Query path: `cosineSearch(pathPrefix, query, topK=5)` runs `embedding <=> $1::vector` against an HNSW index.

## Project layout

```
.
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts            # multi-agent streaming entrypoint
│   │   │   ├── contact/route.ts         # contact form
│   │   │   ├── github/stats/route.ts    # GitHub aggregator
│   │   │   ├── health/route.ts          # DB probe
│   │   │   └── rag/sync/route.ts        # re-embed profile.json
│   │   └── ...                          # pages, layouts, styles
│   ├── components/terminal/             # terminal UI (xterm, ThinkingChain, ...)
│   ├── data/profile.json                # source of truth
│   ├── server/
│   │   ├── ai/
│   │   │   ├── agents.ts                # 3 system prompts + transfer tools
│   │   │   ├── provider.ts              # OpenAI-compatible / GLM client
│   │   │   └── tools/                   # 13 AI SDK tool definitions
│   │   ├── db/                          # pg pool, schema, vector search
│   │   ├── rag/                         # chunk + embed + sync
│   │   ├── contact.ts                   # Resend + Neon insert
│   │   ├── github.ts                    # /api/github/stats aggregator
│   │   ├── rate-limit.ts                # Upstash sliding-window
│   │   ├── observability.ts             # Sentry helpers
│   │   └── env.ts                       # Zod-validated server env
│   └── utils/uiMessageToTerminal.ts     # UIMessage.parts → TerminalMessage
├── scripts/
│   ├── db-init.ts                       # apply schema.sql to Neon
│   └── rag-build.ts                     # CLI re-embed of profile.json
└── package.json
```

## Environment

Required server-side variables (validated by `src/server/env.ts`):

```
# LLM (OpenAI-compatible endpoint)
OPENAI_COMPAT_BASE_URL
OPENAI_COMPAT_API_KEY
GLM_CHAT_MODEL              # default: glm-4.5
GLM_EMBEDDING_MODEL         # default: embedding-3
GLM_EMBEDDING_DIM           # default: 2048

# Neon (auto-injected by Vercel integration)
POSTGRES_URL
POSTGRES_URL_NON_POOLING    # used by db-init script

# Upstash (auto-injected by Vercel integration)
KV_REST_API_URL
KV_REST_API_TOKEN

# GitHub
GITHUB_TOKEN
GITHUB_USERNAME

# Resend
RESEND_API_KEY
RESEND_FROM
CONTACT_EMAIL

# Optional
LINKEDIN_URL
CALENDLY_URL

# Admin
RAG_SYNC_KEY                # protects /api/rag/sync

# Rate limits (optional, defaults shown)
CHAT_RATE_LIMIT_HOURLY      # 60
CHAT_RATE_LIMIT_DAILY       # 300

# Existing
SENTRY_DSN
```

Development uses Doppler to inject variables. `doppler run -- npm run dev` is the standard entrypoint.

## Setup

```bash
npm install
doppler run -- npm run db:init       # apply schema.sql to Neon (HNSW + vector(2048))
doppler run -- npm run rag:build     # chunk + embed profile.json into vector_store
doppler run -- npm run dev           # start at http://localhost:3000
```

## Smoke checks

```bash
curl http://localhost:3000/api/health
curl -X POST -H "X-Sync-Key: $RAG_SYNC_KEY" http://localhost:3000/api/rag/sync
curl http://localhost:3000/api/github/stats | jq .totalStars
```

## License

MIT.
