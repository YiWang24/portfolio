# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

An AI-powered interactive portfolio featuring a multi-agent "digital twin" system. The backend uses Google Agent Development Kit (ADK) with a star-topology multi-agent architecture (Router → Digital Twin, Tech Lead, Knowledge, Contact agents). The frontend provides a terminal-style interface with Server-Sent Events (SSE) streaming for real-time AI responses.

## Common Development Commands

### Full Stack Development

```bash
# Root-level commands (using Doppler for secrets management)
npm run dev              # Frontend + Docs (requires Doppler for portfolio-web/dev_personal)
npm run dev:all          # Frontend + Docs + Backend
npm run dev:backend      # Backend only (requires Doppler for portfolio-api/dev)
npm run build            # Build both frontend and docs
npm run install:all      # Install all dependencies across workspaces
```

### Backend (Spring Boot + Java 21)

```bash
cd backend

# Development
./run.sh                 # Start with Doppler (portfolio-api/dev_personal)
./run.sh --skip-sentry   # Skip Sentry upload (faster for development)
./mvnw spring-boot:run   # Direct Maven run (no Doppler)

# Testing
./mvnw test                                  # Run all tests
./mvnw test -Dtest=RagIntegrationTest        # RAG/vector store tests
./mvnw test -Dtest=AgentIntegrationTest      # Agent integration tests (requires GOOGLE_API_KEY)
./mvnw test -Dtest=ContactEmailIntegrationTest  # Contact form tests

# Building
./mvnw clean package     # Build JAR
./mvnw compile          # Compile only
```

### Frontend (Next.js 16 + React 19)

```bash
cd frontend

# Development
npm run dev              # Start dev server on localhost:3000

# Testing
npm run test             # Run Vitest tests once
npm run test:watch       # Run tests in watch mode
npm run test:node        # Run Node.js native tests

# Building & Linting
npm run build            # Production build
npm run lint             # Run ESLint
npm start                # Start production server
```

### Docs (Docusaurus)

```bash
cd docs

# Development
npm run start            # Start docs server on localhost:3001

# RAG Sync (syncs docs to backend vector store)
npm run rag-sync         # Manually sync markdown to RAG system

# Building
npm run build            # Production build (auto-runs rag-sync)
npm run build:no-sync    # Build without RAG sync
npm run serve            # Serve built docs
```

### Docker Deployment

```bash
# Using deploy.sh helper script
./deploy.sh build        # Build Docker image
./deploy.sh start        # Start services
./deploy.sh stop         # Stop services
./deploy.sh logs         # View logs
./deploy.sh health       # Check health endpoint
./deploy.sh rebuild      # Rebuild from scratch (no cache)
./deploy.sh shell        # Open shell in container

# Direct docker-compose
docker-compose up -d     # Start backend service
docker-compose down      # Stop services
docker-compose logs -f backend  # Follow logs
```

## High-Level Architecture

### Multi-Agent System (Backend)

**Star Topology** - Router Agent coordinates 4 specialist agents:

- **Router Agent** (gemini-2.5-flash)
  - Intent recognition and routing
  - Anti-jailbreak protection
  - Enforces English responses, first-person as Yi Wang

- **Digital Twin Agent** - Personal info, resume, experience
  - Tools: `queryPersonalInfo`, `queryProjects`, `queryBlogPosts`, `semanticSearch`, `getContactCard`
  - Uses RAG (Google AI embeddings + pgvector) for knowledge retrieval

- **Tech Lead Agent** - GitHub projects, code showcase
  - Tools: 10 GitHub API tools (stats, repos, commits, file reading, etc.) + `queryProjects`
  - Combines live GitHub data with documentation

- **Knowledge Agent** - Semantic search across all knowledge
  - Tools: Vector similarity search, category filtering, web search (Tavily)
  - Primary tool: `semanticSearch` for finding relevant documentation

- **Contact Agent** - Handle visitor messages
  - Tool: `sendContactMessage` via Resend API

### RAG Pipeline

1. **Ingestion**: Docusaurus markdown → Node.js script (`docs/scripts/sync-rag.mjs`) → POST `/api/rag/sync` → Backend
2. **Processing**: Text chunking → Google AI embeddings (embedding-001, 768 dimensions) → PostgreSQL pgvector
3. **Retrieval**: Agent tool call → Vector similarity search (cosine distance) → Top-K chunks returned
4. **Response**: LLM synthesizes chunks into natural answer

### Frontend-Backend Communication

**SSE Streaming Flow**:
```
User Input → TerminalInput → streamChat() → /api/chat/stream (Next.js API Route)
→ CF-Access headers added → Backend /api/v1/chat/stream → Google ADK agents
→ SSE events: function → thinking_complete → token → complete
→ ProxyEventSource → Terminal UI updates
```

**Event Types**:
- `function`: Tool execution (status: calling/complete)
- `thinking_complete`: All tools done, starting response generation
- `token`: Streaming response text chunks
- `complete`: Response finished
- `error`: Error occurred

### Key Components

**Backend** (`backend/src/main/java/com/portfolio/`):
- `agent/PortfolioAgents.java`: All 5 agent definitions with instructions and tools
- `service/AgentService.java`: ADK InMemoryRunner, session management
- `tools/`: GitHubTools, UnifiedRAGTools, ContactTools
- `controller/ChatController.java`: SSE streaming endpoint
- `service/VectorQueryService.java`: pgvector similarity search

**Frontend** (`frontend/src/`):
- `services/sse.ts`: Custom SSE client with ProxyEventSource, payload parsing
- `components/terminal/TerminalConversation.tsx`: Main chat UI
- `components/terminal/ThinkingChain.tsx`: Tool execution visualization
- `stores/chatStore.ts`: Zustand state for messages, thinking phase
- `app/api/chat/stream/route.ts`: Next.js proxy adding CF headers

**Docs** (`docs/`):
- `scripts/sync-rag.mjs`: RAG sync script that sends markdown to backend
- `docs/`: Markdown content synced to vector store

## Environment & Secrets

**Secrets Management**: Doppler CLI is used for environment variables

**Backend** requires:
- `GOOGLE_API_KEY`: Google AI API for embeddings and Gemini models
- `GITHUB_TOKEN`, `GITHUB_USERNAME`: GitHub API access
- `POSTGRES_*`: PostgreSQL connection (pgvector extension required)
- `RESEND_API_KEY`: Contact form email delivery
- `RAG_SYNC_KEY`: Secret key for `/api/rag/sync` endpoint protection
- `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`: Error tracking (optional)

**Frontend** requires:
- `CF_CLIENT_ID`, `CF_CLIENT_SECRET`: Cloudflare Zero Trust (production)
- `BACKEND_URL`: Backend API base URL
- `NEXT_PUBLIC_API_BASE_URL`: Public-facing API URL

See `backend/.env.example` and `frontend/.env.example` for full configuration.

## Testing Strategy

**Backend**:
- `AgentIntegrationTest.java`: Full agent workflow tests (Chinese prompts → English responses)
- `RagIntegrationTest.java`: Vector store, embeddings, semantic search
- `ContactEmailIntegrationTest.java`: Resend API integration
- All tests use JUnit 5, require actual API keys in environment

**Frontend**:
- Vitest with jsdom for component testing
- React Testing Library for UI tests
- Property-based testing with fast-check

## Important Notes

- **Doppler Integration**: Development workflows expect Doppler CLI. Backend run script defaults to `portfolio-api/dev_personal` config.
- **Java Version**: Backend requires Java 21 (uses modern language features)
- **Rate Limiting**: Backend has built-in rate limiting (configurable via env vars)
- **Session Management**: Agents maintain conversation context via session IDs (in-memory, per backend instance)
- **Anti-Hallucination**: Agents instructed to say "I haven't documented that yet" if knowledge base lacks info
- **Security Whitelist**: GitHub file reading limited to safe extensions (.md, .java, .ts, etc.), blocks .env files
- **Monorepo Structure**: Uses npm workspaces with root package.json coordinating frontend + docs
