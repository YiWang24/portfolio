# AI-Powered Interactive Portfolio

A "digital twin" portfolio featuring terminal-based AI interaction, GitHub integration, and knowledge base management.

## 🎯 Current Status

✅ **Task 1 Complete**: Project foundation and database setup  
✅ **Task 2 Complete**: Core terminal interface with xterm.js  
🔄 **Task 3 In Progress**: Spring Boot backend with Google ADK integration

### What's Working
- Next.js 14 frontend with terminal interface
- Spring Boot backend with basic API endpoints
- PostgreSQL database with pgvector extension
- Docker containerization
- Terminal UI with command handling and SSE streaming
- Professional glassmorphism design

### Current Implementation
- **Frontend**: Full terminal emulation with xterm.js, SSE integration, command system
- **Backend**: Spring Boot with Google ADK dependencies, basic chat controller
- **Database**: PostgreSQL with vector storage capabilities
- **AI Integration**: Google ADK framework configured (simplified for now)

## 🚀 Quick Start

1. **Prerequisites**:
   ```bash
   # Ensure you have installed:
   - Java 17+
   - Node.js 18+
   - Docker & Docker Compose
   ```

2. **Run the demo**:
   ```bash
   chmod +x demo.sh
   ./demo.sh
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

## 🏗️ Architecture

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Java Spring Boot + Google Agent Development Kit (ADK)
- **Database**: PostgreSQL with pgvector extension
- **AI**: Google Vertex AI (Gemini Pro) - *Integration in progress*
- **Deployment**: Docker containers

## 📁 Project Structure

```
portfolio/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/# React components (Terminal, etc.)
│   │   └── services/  # API services (SSE, etc.)
├── backend/           # Spring Boot application
│   ├── src/main/java/com/portfolio/
│   │   ├── controller/# REST controllers
│   │   ├── service/   # Business logic
│   │   ├── agent/     # ADK agent configuration
│   │   └── entity/    # JPA entities
├── content/           # Markdown knowledge base
├── docker-compose.yml # Database services
└── init.sql          # Database initialization
```

## 🔧 Environment Setup

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Backend (.env)
```
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
```

## 🎮 Terminal Commands

- `/help` - Show available commands
- `/clear` - Clear terminal screen
- `/contact` - Show contact information
- `/github` - Show GitHub repositories
- Any other text - Chat with AI assistant

## 🔄 Next Steps

1. **Complete ADK Integration**: Implement proper agent invocation with session management
2. **Add RAG Capabilities**: Integrate vector database for knowledge retrieval
3. **Enhance AI Responses**: Add streaming responses and context awareness
4. **Deploy to Cloud**: Set up production deployment with Google Cloud

## 🛠️ Development

### Backend Development
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database Management
```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down
```

## 📚 Key Technologies

- **Google ADK**: Agent Development Kit for building AI agents
- **xterm.js**: Terminal emulation in the browser
- **Server-Sent Events**: Real-time streaming communication
- **pgvector**: Vector similarity search in PostgreSQL
- **Spring Boot**: Java backend framework
- **Next.js 14**: React framework with App Router

## 🎨 Features

- **Terminal Interface**: Full terminal emulation with command history
- **Real-time Streaming**: SSE-based communication for live responses
- **Responsive Design**: Works on desktop and mobile devices
- **Glassmorphism UI**: Modern, professional design aesthetic
- **Vector Search**: Semantic search capabilities for knowledge base
- **Session Management**: Persistent conversation history

---

*This is a demonstration of modern AI-powered web applications using cutting-edge technologies.*
