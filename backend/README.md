# Portfolio Backend

An intelligent portfolio backend service built with Google Agent Development Kit (ADK), featuring a multi-agent architecture with star topology.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Router Agent                                 │
│                    (Intent Recognition & Routing)                    │
└──────┬──────────────┬──────────────────┬──────────────┬────────────┘
       │              │                  │              │
┌──────▼─────────┐ ┌──▼──────────┐ ┌─────▼─────────┐ ┌─▼────────────┐
│  Digital Twin  │ │  Tech Lead  │ │   Knowledge   │ │   Contact    │
│  (Resume/Info) │ │ (GitHub/Code)│ │  (Search/Web) │ │  (Email)     │
│                │ │             │ │               │ │              │
│  Tools:        │ │  Tools:     │ │  Tools:       │ │  Tools:      │
│  - queryInfo   │ │  - getRepo  │ │  - semantic   │ │  - sendEmail │
│  - getContact  │ │  - readFile │ │  - webSearch  │ │              │
└────────────────┘ └─────────────┘ └───────────────┘ └──────────────┘
```

## Tech Stack

- **Java 21** - Modern Java with enhanced features
- **Spring Boot 3.2** - Application framework
- **Google ADK 0.5.0** - Agent Development Kit for AI agents
- **WebFlux** - Reactive programming support
- **PostgreSQL + pgvector** - Vector database for semantic search
- **Doppler** - Environment variable and secrets management
- **Sentry** - Error tracking and monitoring

## Prerequisites

- Java 21+
- Maven 3.8+
- Doppler CLI (for environment variables)
- PostgreSQL with pgvector extension

## Quick Start

### 1. Install Doppler CLI

```bash
brew install dopplerhq/cli/doppler
```

Or visit: https://cli.doppler.com

### 2. Configure Environment Variables

Environment variables are managed via Doppler. Ensure your `dev_personal` config includes:

```bash
# Google AI API Key (https://aistudio.google.com/app/apikey)
GOOGLE_API_KEY=your-google-api-key

# GitHub (https://github.com/settings/tokens)
GITHUB_TOKEN=your-github-token
GITHUB_USERNAME=your-github-username

# Tavily API (https://tavily.com - web search)
TAVILY_API_KEY=your-tavily-api-key

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=portfolio
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password

# Sentry (optional)
SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

### 3. Run the Application

```bash
# Using the startup script (recommended)
./run.sh

# Or with Doppler directly
doppler run --project portfolio-api --config dev_personal -- mvn spring-boot:run

# Skip Sentry upload during development
./run.sh --skip-sentry
```

### 4. Verify Health Check

```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "UP",
  "timestamp": "2026-01-18T08:56:07.824750Z",
  "service": "portfolio-backend"
}
```

## Database Initialization

The application automatically creates required tables on startup:

- **vector_store** - Stores document chunks with embeddings for RAG
- **contact_messages** - Stores contact form submissions

Tables are created via `schema.sql` using Spring Boot's initialization feature.

## API Endpoints

### POST /chat/message

Synchronous message processing

```bash
curl -X POST http://localhost:8080/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Introduce yourself"}'
```

### POST /chat/stream

Server-Sent Events (SSE) streaming response

```bash
curl -X POST http://localhost:8080/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "session-123", "message": "Show your GitHub projects"}'
```

**SSE Event Types:**

| Event Type | Description | Example |
|------------|-------------|---------|
| `function` | Tool call status | `{"type":"function","name":"semanticSearch","status":"calling"}` |
| `function` | Tool call complete | `{"type":"function","name":"semanticSearch","status":"complete"}` |
| `thinking_complete` | All tools done, starting response | `{"type":"thinking_complete"}` |
| `token` | Content streaming | `{"type":"token","content":"Hi, I'm..."}` |
| `complete` | Response complete | `{"type":"complete"}` |
| `error` | Error occurred | `{"type":"error","message":"error details"}` |

### DELETE /chat/session/{sessionId}

Clear session context

### POST /rag/sync

Sync documents to vector store (requires `RAG_SYNC_KEY` header)

### GET /rag/health

Get RAG service health status

## Agents

| Agent | Trigger Scenarios | Capabilities |
|-------|------------------|--------------|
| Router | All requests | Intent recognition, routing to specialist agents |
| Digital Twin | "Who are you", "experience", "contact" | RAG search on resume, return contact card |
| Tech Lead | "GitHub", "projects", "code" | GitHub API: stats, search projects, read code |
| Knowledge | "Search", "latest", tech questions | Vector semantic search + Tavily web search |
| Contact | "Contact", "send message", "inquiry" | Send email via Resend API |

## Tools

### GitHubTools

| Tool | Description |
|------|-------------|
| `getGitHubStats` | Comprehensive GitHub stats (stars, commits, streaks, languages, top projects) |
| `getDeveloperProfile` | Developer statistics (stars, languages, repos) |
| `listAllRepos` | List all repositories |
| `searchProjects` | Search projects by keyword |
| `getRepoDetails` | Repository details (stars, forks, topics) |
| `getRepoLanguages` | Language breakdown |
| `getRepoCommits` | Recent commit history |
| `listRepoContents` | Browse repository file structure |
| `readRepoFile` | Read code file content |
| `getContributionStats` | GitHub activity statistics |

### UnifiedRAGTools

| Tool | Description |
|------|-------------|
| `semanticSearch` | Vector similarity search on knowledge base |
| `searchByCategory` | Search by category (personal/projects/blog) |
| `listDocuments` | List all indexed documents |
| `getStats` | Vector store statistics |
| `webSearch` | Tavily API web search |

### ContactTools

| Tool | Description |
|------|-------------|
| `sendContactMessage` | Send contact email via Resend API |

## Security Measures

- **File whitelist**: `.md`, `.java`, `.ts`, `.tsx`, `.js`, `.json`, `.py`
- **File blacklist**: `.env`, files containing `secret`
- **Large file truncation**: Files over 200 lines are truncated
- **Anti-injection**: Router Agent includes anti-jailbreak rules

## Testing

```bash
# Run all tests
./mvnw test

# RAG integration tests
./mvnw test -Dtest=RagIntegrationTest

# Agent integration tests (requires GOOGLE_API_KEY)
./mvnw test -Dtest=AgentIntegrationTest
```

## Project Structure

```
src/main/java/com/portfolio/
├── PortfolioApplication.java      # Spring Boot entry point
├── config/
│   ├── EnvConfig.java             # Environment configuration
│   ├── RagConfig.java             # RAG initialization
│   ├── CorsConfig.java            # CORS configuration
│   └── CacheConfig.java           # Cache configuration
├── agent/
│   └── PortfolioAgents.java       # Router, DigitalTwin, TechLead agents
├── tools/
│   ├── GitHubTools.java           # GitHub API integration
│   ├── UnifiedRAGTools.java       # RAG tools
│   ├── ContactTools.java          # Contact form
│   └── UtilityTools.java          # Utility functions
├── service/
│   ├── AgentService.java          # ADK agent runner
│   ├── VectorQueryService.java    # Vector search queries
│   ├── RagSyncService.java        # Document synchronization
│   ├── RateLimitService.java      # Rate limiting
│   └── ContactService.java        # Contact form handling
└── controller/
    ├── ChatController.java        # Chat API endpoints
    ├── RagSyncController.java     # RAG sync endpoints
    ├── ContactController.java     # Contact form endpoint
    └── HealthController.java      # Health check endpoint
```

## Startup Script

The `run.sh` script provides convenient options:

```bash
# Show help
./run.sh --help

# Run with default config (dev_personal)
./run.sh

# Skip Sentry upload
./run.sh --skip-sentry

# Use different config
./run.sh --config prd

# Use different project
./run.sh --project share-api
```

## Deployment

```bash
# Build JAR
./mvnw package -DskipTests

# Build Docker image
docker build -t portfolio-backend .

# Run with Doppler
doppler run --project portfolio-api --config prd -- docker run -p 8080:8080 --env-file - portfolio-backend
```

## Troubleshooting

### Database connection fails

1. Verify Doppler config has correct PostgreSQL variables
2. Check database is accessible from your network
3. Ensure pgvector extension is installed

### Sentry upload fails

Add `--skip-sentry` flag to skip source bundle upload:
```bash
./run.sh --skip-sentry
```

### Port 8080 already in use

Change port via Doppler variable:
```bash
SERVER_PORT=8081 ./run.sh
```

## License

MIT
