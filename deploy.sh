#!/bin/bash
# Portfolio Backend Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    log_error ".env file not found in backend directory!"
    exit 1
fi

# Load environment variables
source backend/.env 2>/dev/null || true

# Parse arguments
COMMAND=${1:-"help"}

case $COMMAND in
    build)
        log_info "Building Docker image..."
        docker-compose build
        ;;
    up|start)
        log_info "Starting services..."
        docker-compose up -d
        log_info "Services started. Backend available at http://localhost:${SERVER_PORT:-8080}"
        ;;
    down|stop)
        log_info "Stopping services..."
        docker-compose down
        ;;
    restart)
        log_info "Restarting services..."
        docker-compose restart
        ;;
    logs)
        log_info "Showing logs (Ctrl+C to exit)..."
        docker-compose logs -f backend
        ;;
    ps|status)
        log_info "Container status:"
        docker-compose ps
        ;;
    health)
        log_info "Checking health endpoint..."
        curl -s http://localhost:${SERVER_PORT:-8080}/api/v1/health | jq . || echo "Health check failed"
        ;;
    clean)
        log_warn "This will remove all containers, images, and volumes. Continue? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            log_info "Cleaning up..."
            docker-compose down -v --rmi all
            docker system prune -f
        fi
        ;;
    shell|sh)
        log_info "Opening shell in container..."
        docker-compose exec backend /bin/sh
        ;;
    rebuild)
        log_info "Rebuilding from scratch..."
        docker-compose build --no-cache
        docker-compose up -d
        ;;
    test)
        log_info "Running health test..."
        response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${SERVER_PORT:-8080}/api/v1/health)
        if [ "$response" = "200" ]; then
            log_info "Health check passed (HTTP $response)"
        else
            log_error "Health check failed (HTTP $response)"
            exit 1
        fi
        ;;
    *)
        echo "Portfolio Backend Deployment Script"
        echo ""
        echo "Usage: ./deploy.sh [command]"
        echo ""
        echo "Commands:"
        echo "  build       Build Docker image"
        echo "  up, start   Start services"
        echo "  down, stop  Stop services"
        echo "  restart     Restart services"
        echo "  logs        Show logs (follow mode)"
        echo "  ps, status  Show container status"
        echo "  health      Check health endpoint"
        echo "  clean       Remove all containers, images, and volumes"
        echo "  shell       Open shell in container"
        echo "  rebuild     Rebuild from scratch (no cache)"
        echo "  test        Run health test"
        echo "  help        Show this help message"
        ;;
esac
