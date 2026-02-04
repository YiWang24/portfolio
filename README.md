# AI-Powered Interactive Portfolio

> An intelligent portfolio powered by **Google Agent Development Kit (ADK)** featuring a multi-agent "digital twin" system. The backend implements a star-topology agent architecture with RAG capabilities, while the frontend provides a cinematic terminal interface with real-time AI chat streaming.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen?style=flat&logo=spring)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange?style=flat&logo=openjdk)](https://openjdk.org/)
[![Google ADK](https://img.shields.io/badge/Google%20ADK-0.5.0-4285F4?style=flat&logo=google)](https://github.com/googleapis/agent-developer-toolkit)

## 🎯 Overview

This portfolio showcases Yi Wang's professional experience through an AI-powered digital twin that can:
- Answer questions about resume, projects, and technical expertise using **RAG (Retrieval-Augmented Generation)**
- Provide live GitHub repository statistics and code exploration via **GitHub API integration**
- Deliver semantic search across technical documentation and blog posts
- Handle contact form submissions via email
- Stream real-time responses using **Server-Sent Events (SSE)**

## 🏗️ Architecture

### Multi-Agent System (Backend)

**Star Topology** - Router Agent coordinates 4 specialist agents:

```
                       ┌─────────────────────────────────────┐
                       │       Router Agent (Gemini)         │
                       │   Intent Recognition & Routing      │
                       └──────┬──────────┬──────────┬────────┘
                              │          │          │
            ┌─────────────────┼──────────┼──────────┼─────────────────┐
            │                 │          │          │                 │
    ┌───────▼────────┐ ┌──────▼─────┐ ┌▼─────────┐ ┌─────────▼─────┐
    │ Digital Twin   │ │ Tech Lead  │ │Knowledge │ │   Contact     │
    │  Agent (RAG)   │ │   Agent    │ │  Agent   │ │    Agent      │
    └───────┬────────┘ └──────┬─────┘ └┬─────────┘ └─────────┬─────┘
            │                 │         │                     │
    ┌───────▼────────┐ ┌──────▼─────┐ ┌▼─────────┐ ┌─────────▼─────┐
    │UnifiedRAGTools │ │GitHubTools │ │RAGTools  │ │ ContactTools  │
    │  (6 methods)   │ │(11 methods)│ │(8 methods)│ │  (1 method)   │
    └────────────────┘ └────────────┘ └──────────┘ └───────────────┘
            │                 │         │                     │
    ┌───────▼────────┐ ┌──────▼─────┐ ┌▼─────────┐ ┌─────────▼─────┐
    │  PostgreSQL    │ │ GitHub API │ │PostgreSQL│ │  Resend API   │
    │  + pgvector    │ │            │ │+ pgvector│ │               │
    └────────────────┘ └────────────┘ └──────────┘ └───────────────┘
```

### Agent Responsibilities

| Agent | Purpose | Tools | Model |
|-------|---------|-------|-------|
| **Router** | Routes requests to specialist agents | None (routing only) | gemini-2.5-flash |
| **Digital Twin** | Personal info, resume, experience | 6 RAG tools + contact card | gemini-2.5-flash |
| **Tech Lead** | GitHub projects, code showcase | 11 GitHub tools + 1 RAG tool | gemini-2.5-flash |
| **Knowledge** | Semantic search, technical Q&A | 8 RAG tools | gemini-2.5-flash |
| **Contact** | Handle contact form submissions | 1 email tool | gemini-2.5-flash |

## 🛠️ Technology Stack

### Backend
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Spring Boot | 3.2.1 |
| Language | Java | 21 |
| Agent Framework | Google ADK | 0.5.0 |
| LLM | Gemini 2.5 Flash | Latest |
| Vector DB | PostgreSQL + pgvector | 16 + 0.1.5 |
| Embeddings | Google AI embedding-001 | 768-dimensional |
| Email Service | Resend API | Latest |
| GitHub Integration | GitHub REST API v3 | - |
| Streaming | RxJava3 + SSE | - |
| Secrets Management | Doppler | - |
| Monitoring | Sentry | 7.14.0 |

### Frontend
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js | 16.1.1 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.0 |
| Animations | Framer Motion | 12.26 |
| State Management | Zustand | 5.0 |
| Terminal | xterm.js | 6.0 |
| Components | shadcn/ui (Radix UI) | Latest |
| Testing | Vitest + React Testing Library | 4.0 |
| Deployment | Vercel | - |

## 🚀 Quick Start

### Prerequisites

- **Java 21+**
- **Node.js 18+**
- **Doppler CLI** (for environment management)
- **PostgreSQL** with pgvector extension (or use Docker)

### 1. Install Doppler CLI

```bash
brew install dopplerhq/cli/doppler
```

Or visit: https://cli.doppler.com

### 2. Set Up Environment Variables

Configure Doppler with required secrets (or use `.env` files):

**Backend variables:**
```bash
GOOGLE_API_KEY=your-google-api-key
GITHUB_TOKEN=your-github-token
GITHUB_USERNAME=your-github-username
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=portfolio
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
RESEND_API_KEY=your-resend-api-key
CONTACT_EMAIL=your.email@example.com
```

**Frontend variables:**
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080
```

### 3. Start the Application

**Option A: Using Docker (Recommended)**

```bash
# Start backend service
docker-compose up -d

# The backend will be available at http://localhost:8080
```

**Option B: Manual Development Setup**

```bash
# Terminal 1: Start Backend
cd backend
./run.sh

# Terminal 2: Start Frontend
cd frontend
npm install
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/api/v1/health

## 📁 Project Structure

```
portfolio/
├── frontend/                   # Next.js 16 application
│   ├── src/
│   │   ├── app/                # App Router pages + API routes
│   │   │   ├── api/            # Proxy endpoints for backend
│   │   │   │   ├── contact/    # Contact form proxy
│   │   │   │   ├── chat/       # Chat stream proxy
│   │   │   │   └── github/     # GitHub stats proxy
│   │   │   ├── layout.tsx      # Root layout
│   │   │   └── page.tsx        # Home page
│   │   ├── components/         # React Components
│   │   │   ├── effects/        # Visual effects (MatrixRain)
│   │   │   ├── portfolio/      # Portfolio sections
│   │   │   ├── terminal/       # Terminal/chat components
│   │   │   └── ui/             # shadcn/ui components
│   │   ├── data/               # Static data
│   │   │   └── profile.json    # Profile, experience, projects
│   │   ├── hooks/              # React Hooks
│   │   ├── lib/                # Utilities
│   │   ├── services/           # API Services (SSE)
│   │   ├── stores/             # Zustand stores
│   │   └── types/              # TypeScript types
│   └── package.json
│
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/portfolio/
│   │   ├── PortfolioApplication.java    # Entry point
│   │   ├── agent/
│   │   │   └── PortfolioAgents.java     # All 5 agents
│   │   ├── tools/
│   │   │   ├── UnifiedRAGTools.java     # 8 RAG methods
│   │   │   ├── GitHubTools.java         # 11 GitHub methods
│   │   │   ├── ContactTools.java        # 1 email method
│   │   │   └── UtilityTools.java        # Utility methods
│   │   ├── service/
│   │   │   ├── AgentService.java        # ADK runner + sessions
│   │   │   ├── VectorQueryService.java  # Vector search
│   │   │   ├── RagSyncService.java      # Document indexing
│   │   │   ├── ContactService.java      # Email sending
│   │   │   └── RateLimitService.java    # Rate limiting
│   │   ├── controller/
│   │   │   ├── ChatController.java      # Chat endpoints
│   │   │   ├── RagSyncController.java   # RAG management
│   │   │   └── HealthController.java    # Health check
│   │   └── config/                      # Configuration
│   └── pom.xml
│
├── docker-compose.yml          # Docker services
├── WARP.md                     # Development guide
└── README.md                   # This file
```

## � API Endpoints

### Chat API

#### POST `/api/v1/chat/stream` (SSE Streaming)

Real-time streaming responses using Server-Sent Events.

```bash
curl -N -X POST http://localhost:8080/api/v1/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "user-session-123",
    "message": "Tell me about your AI projects"
  }'
```

**SSE Event Types:**
- `function`: Tool call initiated/completed
- `thinking_complete`: Tools finished, starting response
- `token`: Response content streaming
- `complete`: Response finished
- `error`: Error occurred

#### DELETE `/api/v1/chat/session/{sessionId}`

Clear session context to start fresh conversation.

### RAG Management

#### POST `/api/v1/rag/sync`

Sync documents to vector store.

#### GET `/api/v1/rag/health`

Check RAG service health and vector store status.

### Contact API

#### POST `/api/v1/contact`

Submit contact form (proxied through Next.js API route).

## 🎮 Features

### Terminal Interface
- Full terminal emulation with xterm.js
- Command history and autocomplete
- Real-time streaming responses
- Thinking chain visualization showing tool executions

### AI Capabilities
- **RAG-powered responses**: Semantic search across documentation
- **GitHub integration**: Live repository statistics and code exploration
- **Multi-language support**: Accept input in any language, respond in English
- **Session persistence**: Maintain conversation context
- **Anti-hallucination**: Admits when information isn't documented

### UI/UX
- **Responsive design**: Works on desktop and mobile
- **Dark mode support**: Seamless theme switching
- **Glassmorphism aesthetics**: Modern, professional design
- **Animated components**: Smooth transitions and micro-animations
- **Matrix rain effect**: Cyberpunk-inspired background

## 🔒 Security Features

- **Prompt injection protection**: Multi-layer defenses against jailbreaking
- **File access whitelist**: Only safe file extensions allowed
- **Rate limiting**: Built-in API rate limiter
- **Secrets management**: All credentials via Doppler
- **CORS configuration**: Configurable allowed origins
- **Input validation**: Message length limits and sanitization

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
./mvnw test

# RAG integration tests
./mvnw test -Dtest=RagIntegrationTest

# Agent integration tests
./mvnw test -Dtest=AgentIntegrationTest

# Contact email tests
./mvnw test -Dtest=ContactEmailIntegrationTest
```

### Frontend Tests

```bash
cd frontend

# Run tests once
npm run test

# Watch mode
npm run test:watch

# Node.js native tests
npm run test:node
```

## 🚢 Deployment

### Docker Deployment

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Vercel (Frontend)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `CF_CLIENT_ID` (Cloudflare Zero Trust)
   - `CF_CLIENT_SECRET`
   - `BACKEND_URL`
4. Deploy

## 📚 Development Commands

### Full Stack

```bash
# Root-level commands (requires Doppler)
npm run dev              # Frontend only
npm run dev:all          # Frontend + Backend
npm run dev:backend      # Backend only
npm run build            # Build frontend
npm run install:all      # Install all dependencies
```

### Backend

```bash
cd backend

# Development
./run.sh                 # Start with Doppler
./run.sh --skip-sentry   # Skip Sentry upload

# Building
./mvnw clean package     # Build JAR
```

### Frontend

```bash
cd frontend

# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Run ESLint
npm start                # Start production server
```

## 🛠️ Customization

### Update Profile Data

Edit `frontend/src/data/profile.json` to customize:
- Personal information
- Work experience
- Projects
- Skills and certifications
- Social links

### Modify Agent Behavior

Edit `backend/src/main/java/com/portfolio/agent/PortfolioAgents.java` to:
- Adjust agent prompts
- Add new tools
- Change routing logic
- Modify safety rules

### Add Custom Tools

Create new tool classes in `backend/src/main/java/com/portfolio/tools/` and register them in the agent configuration.

## 📊 Performance Considerations

- **Vector Search**: HNSW index provides O(log n) similarity search
- **Session Caching**: In-memory storage with ConcurrentHashMap
- **Streaming**: SSE reduces time-to-first-token
- **Connection Pooling**: HikariCP for database connections
- **Rate Limiting**: Protects against API abuse

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details.

## 📞 Contact

**Yi Wang**
- GitHub: [@YiWang24](https://github.com/YiWang24)
- LinkedIn: [yiwang2025](https://www.linkedin.com/in/yiwang2025/)
- Email: yiwang2457@gmail.com

---

**Documentation:**
- [Backend Architecture](backend/README.md)
- [Frontend Documentation](frontend/README.md)
- [Development Guide](WARP.md)

**Built with** [Google ADK](https://github.com/googleapis/agent-developer-toolkit), [Next.js](https://nextjs.org/), and [Spring Boot](https://spring.io/projects/spring-boot).
