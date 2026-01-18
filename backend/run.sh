#!/bin/bash
# Portfolio Backend Startup Script
# This script starts the backend using Doppler for environment variables

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
PROJECT="portfolio-api"
CONFIG="dev_personal"
SKIP_SENTRY="false"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-sentry)
            SKIP_SENTRY="true"
            shift
            ;;
        --config)
            CONFIG="$2"
            shift 2
            ;;
        --project)
            PROJECT="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --skip-sentry    Skip Sentry source bundle upload"
            echo "  --config NAME    Doppler config name (default: dev_personal)"
            echo "  --project NAME   Doppler project name (default: portfolio-api)"
            echo "  -h, --help       Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Check if doppler is installed
if ! command -v doppler &> /dev/null; then
    echo -e "${RED}Error: Doppler CLI is not installed${NC}"
    echo "Please install it from: https://cli.doppler.com"
    exit 1
fi

echo -e "${GREEN}Starting Portfolio Backend...${NC}"
echo -e "  Project: ${PROJECT}"
echo -e "  Config:  ${CONFIG}"
echo -e "  Sentry:  $([ "$SKIP_SENTRY" = "true" ] && echo "skipped" || echo "enabled")"
echo ""

# Build Maven arguments
MAVEN_ARGS="spring-boot:run"
if [ "$SKIP_SENTRY" = "true" ]; then
    MAVEN_ARGS="-Dsentry.skip=true $MAVEN_ARGS"
fi

# Start the application with Doppler
echo -e "${YELLOW}Running: doppler run --project $PROJECT --config $CONFIG -- mvn $MAVEN_ARGS${NC}"
echo ""

doppler run --project "$PROJECT" --config "$CONFIG" -- mvn $MAVEN_ARGS
