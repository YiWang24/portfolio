# Backend Deployment Guide

This guide covers deploying the Portfolio Backend using Docker and GitHub Actions.

## Table of Contents

- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Monitoring & Health Checks](#monitoring--health-checks)

---

## Local Development

### Prerequisites

- Docker 24.0+
- Docker Compose 2.20+

### Quick Start

```bash
# Clone and navigate to project
git clone https://github.com/YiWang24/portfolio.git
cd portfolio

# Copy and configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Start services
./deploy.sh up

# Check health
./deploy.sh health
```

### Available Commands

```bash
./deploy.sh build     # Build Docker image
./deploy.sh up        # Start services
./deploy.sh down      # Stop services
./deploy.sh logs      # View logs
./deploy.sh health    # Check health endpoint
./deploy.sh shell     # Open shell in container
./deploy.sh clean     # Remove all containers and images
```

---

## Production Deployment

### Option 1: Docker Compose (Recommended for VPS)

```bash
# On your production server
git clone https://github.com/YiWang24/portfolio.git
cd portfolio

# Configure production environment
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Deploy
docker compose up -d
```

### Option 2: Docker Run

```bash
docker run -d \
  --name portfolio-backend \
  --restart unless-stopped \
  -p 8080:8080 \
  --env-file .env \
  -v ./content:/app/content:ro \
  ghcr.io/yiwang24/portfolio-backend:latest
```

### Option 3: Kubernetes

See `k8s/` directory for Kubernetes manifests (if available).

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_API_KEY` | Yes | - | Google AI API key |
| `GOOGLE_CLOUD_PROJECT_ID` | Yes | - | GCP project ID |
| `GOOGLE_CLOUD_LOCATION` | Yes | - | GCP region |
| `GITHUB_TOKEN` | Yes | - | GitHub personal access token |
| `GITHUB_USERNAME` | Yes | - | GitHub username |
| `TAVILY_API_KEY` | Yes | - | Tavily search API key |
| `CONTACT_EMAIL` | Yes | - | Contact email for form submissions |
| `LINKEDIN_URL` | No | - | LinkedIn profile URL |
| `CALENDLY_URL` | No | - | Calendly booking URL |
| `RESEND_API_KEY` | Yes | - | Resend email API key |
| `RESEND_FROM` | Yes | - | Sender email for Resend |
| `SERVER_PORT` | No | 8080 | Server port |
| `CORS_ALLOWED_ORIGINS` | No | * | CORS allowed origins |
| `RATE_LIMIT_ENABLED` | No | true | Enable rate limiting |
| `RATE_LIMIT_GLOBAL_HOURLY` | No | 100 | Global hourly limit |
| `RATE_LIMIT_GLOBAL_DAILY` | No | 1000 | Global daily limit |
| `RATE_LIMIT_IP_HOURLY` | No | 10 | Per-IP hourly limit |
| `RATE_LIMIT_IP_DAILY` | No | 50 | Per-IP daily limit |

---

## GitHub Actions CI/CD

### Workflow Triggers

The CI/CD pipeline (`.github/workflows/backend.yml`) runs on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Release publication
- Manual workflow dispatch

### Jobs

| Job | Description |
|-----|-------------|
| `build` | Compile, test, and package application |
| `security` | Run Trivy vulnerability scanner |
| `docker` | Build and push Docker image to GHCR |
| `deploy` | Deploy to production (on release only) |

### Required Secrets

For deployment, configure these repository secrets:

| Secret | Description |
|--------|-------------|
| `DEPLOY_HOST` | Production server hostname |
| `DEPLOY_USER` | SSH username |
| `DEPLOY_SSH_KEY` | SSH private key |
| `DEPLOY_PORT` | SSH port (optional, default: 22) |

### Manual Deployment

```bash
# Create a new release on GitHub
# Or manually trigger the workflow:
# Go to Actions → Backend CI/CD → Run workflow
```

---

## Monitoring & Health Checks

### Health Endpoint

```bash
curl https://api.yiw.me/api/v1/health
```

Response:
```json
{
  "status": "UP",
  "timestamp": "2025-01-16T10:30:00Z",
  "service": "portfolio-backend"
}
```

### Stats Endpoint

```bash
curl https://api.yiw.me/api/v1/chat/stats
```

### Logs

```bash
# Docker Compose
docker compose logs -f backend

# Docker
docker logs -f portfolio-backend

# Follow with tail
docker exec portfolio-backend tail -f /app/logs/app.log
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs portfolio-backend

# Verify environment variables
docker exec portfolio-backend env | grep RATE_LIMIT

# Check health status
docker inspect portfolio-backend | jq '.[0].State.Health'
```

### Rate limiting issues

```bash
# Check current stats
curl http://localhost:8080/api/v1/chat/stats

# Reset rate limit (restart container)
docker restart portfolio-backend
```

### Out of memory

Adjust JVM options in `docker-compose.yml`:

```yaml
environment:
  - JAVA_OPTS=-Xmx1g -Xms512m
```

---

## Security Best Practices

1. **Never commit `.env` file** - Use environment variables in production
2. **Use non-root user** - The Dockerfile runs as `appuser`
3. **Enable rate limiting** - Prevents abuse and DDoS attacks
4. **Keep images updated** - Run `docker-compose pull` regularly
5. **Scan for vulnerabilities** - GitHub Actions runs Trivy on every build
6. **Use HTTPS** - Configure reverse proxy (nginx/caddy) in front
