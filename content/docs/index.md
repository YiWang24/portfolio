# Getting Started

Welcome to the AI-Powered Interactive Portfolio! This knowledge base contains documentation about the system architecture, features, and usage.

## Overview

This portfolio is a "digital twin" that combines:

- **Interactive Terminal**: Real-time AI conversations with xterm.js
- **GitHub Integration**: Live repository exploration and code analysis  
- **Knowledge Base**: File-based markdown documentation with embedded AI assistance
- **RAG Technology**: Vector-powered search for accurate, hallucination-free responses

## Architecture

The system uses a microservices architecture:

- **Frontend**: Next.js 14 with App Router and TypeScript
- **Backend**: Java Spring Boot with Google Agent Development Kit (ADK)
- **Database**: PostgreSQL with pgvector extension for vector storage
- **AI**: Google Vertex AI (Gemini Pro) for natural language processing

## Quick Navigation

- [Installation Guide](./installation.md)
- [API Documentation](./api.md)
- [Terminal Commands](./terminal.md)
- [GitHub Integration](./github.md)
