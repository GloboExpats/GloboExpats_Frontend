#!/bin/bash

# =============================================================================
# SETUP SCRIPT - EXPAT MARKETPLACE FRONTEND
# =============================================================================
# Prepares the environment for deployment
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo -e "${BLUE}"
echo "========================================================"
echo "        EXPAT MARKETPLACE - SETUP SCRIPT"
echo "========================================================"
echo -e "${NC}"

# Make scripts executable
log_info "Making scripts executable..."
chmod +x deploy.sh
chmod +x troubleshoot.sh
chmod +x setup.sh

# Check if we need to install dependencies
if [ ! -f "pnpm-lock.yaml" ] && [ ! -f "package-lock.json" ] && [ ! -f "yarn.lock" ]; then
    log_warn "No lock file found. Installing dependencies with pnpm..."
    
    if command -v pnpm &> /dev/null; then
        log_info "Installing dependencies with pnpm..."
        pnpm install
    elif command -v npm &> /dev/null; then
        log_info "pnpm not found. Installing dependencies with npm..."
        npm install
    else
        log_error "No package manager found. Please install Node.js and npm/pnpm first."
        exit 1
    fi
fi

# Set proper file permissions
log_info "Setting file permissions..."
find . -name "*.json" -type f -exec chmod 644 {} \;
find . -name "*.yaml" -type f -exec chmod 644 {} \;
find . -name "*.yml" -type f -exec chmod 644 {} \;
chmod 644 Dockerfile
chmod 644 .dockerignore

# Check Docker setup
log_info "Checking Docker setup..."
if command -v docker &> /dev/null; then
    if ! docker info &> /dev/null; then
        if sudo docker info &> /dev/null 2>&1; then
            log_warn "Docker requires sudo. Consider adding your user to the docker group:"
            echo "  sudo usermod -aG docker \$USER"
            echo "  newgrp docker"
            echo "  # Or logout and login again"
        else
            log_error "Docker is not running. Start it with:"
            echo "  sudo systemctl start docker"
        fi
    else
        log_info "Docker is ready!"
    fi
else
    log_error "Docker is not installed. Please install Docker first."
fi

# Create environment file if it doesn't exist
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    log_info "Creating .env file from .env.example..."
    cp .env.example .env
    log_warn "Please review and update .env file with your settings"
fi

echo ""
log_info "Setup complete! You can now:"
echo "  1. Run troubleshooting: ./troubleshoot.sh"
echo "  2. Deploy application: ./deploy.sh"
echo "  3. Deploy with cleanup: ./deploy.sh --cleanup --no-cache"
echo "  4. View deployment guide: cat DEPLOYMENT.md"
echo ""
