#!/bin/bash

# =============================================================================
# TROUBLESHOOTING SCRIPT - EXPAT MARKETPLACE FRONTEND
# =============================================================================
# Quick diagnostic script to check deployment prerequisites
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
echo "    EXPAT MARKETPLACE - TROUBLESHOOTING SCRIPT"
echo "========================================================"
echo -e "${NC}"

# Check current directory
log_info "Current directory: $(pwd)"

# Check if we're in the right place
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Please run from project root."
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    log_error "Dockerfile not found. Please run from project root."
    exit 1
fi

# Check project structure
log_info "Checking project structure..."
REQUIRED_DIRS=("app" "components" "lib" "hooks")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log_info "✓ Directory '$dir' exists"
    else
        log_warn "✗ Directory '$dir' missing"
    fi
done

# Check important files
log_info "Checking important files..."
IMPORTANT_FILES=("package.json" "next.config.mjs" "tailwind.config.ts" "tsconfig.json")
for file in "${IMPORTANT_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_info "✓ File '$file' exists"
    else
        log_warn "✗ File '$file' missing"
    fi
done

# Check lock files
log_info "Checking package manager lock files..."
if [ -f "pnpm-lock.yaml" ]; then
    log_info "✓ pnpm-lock.yaml found"
    if grep -q "lockfileVersion" pnpm-lock.yaml; then
        log_info "✓ pnpm-lock.yaml appears valid"
    else
        log_warn "✗ pnpm-lock.yaml may be corrupted"
    fi
elif [ -f "package-lock.json" ]; then
    log_info "✓ package-lock.json found"
elif [ -f "yarn.lock" ]; then
    log_info "✓ yarn.lock found"
else
    log_warn "✗ No lock file found (pnpm-lock.yaml, package-lock.json, or yarn.lock)"
    log_warn "  Consider running: pnpm install"
fi

# Check Docker
log_info "Checking Docker..."
if command -v docker &> /dev/null; then
    log_info "✓ Docker is installed"
    
    if docker info &> /dev/null; then
        log_info "✓ Docker is running"
        
        # Check Docker version
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        log_info "✓ Docker version: $DOCKER_VERSION"
        
        # Check available space
        AVAILABLE_SPACE=$(df . | tail -1 | awk '{print $4}')
        AVAILABLE_GB=$((AVAILABLE_SPACE / 1024 / 1024))
        if [ "$AVAILABLE_GB" -ge 2 ]; then
            log_info "✓ Available disk space: ${AVAILABLE_GB}GB"
        else
            log_warn "✗ Low disk space: ${AVAILABLE_GB}GB (recommended: 2GB+)"
        fi
        
    elif sudo docker info &> /dev/null 2>&1; then
        log_warn "⚠ Docker requires sudo privileges"
        log_warn "  Consider adding user to docker group:"
        log_warn "  sudo usermod -aG docker \$USER && newgrp docker"
    else
        log_error "✗ Docker is not running"
        log_error "  Try: sudo systemctl start docker"
    fi
else
    log_error "✗ Docker is not installed"
fi

# Check file permissions
log_info "Checking file permissions..."
for file in "package.json" "Dockerfile"; do
    if [ -f "$file" ]; then
        PERMS=$(stat -c "%a" "$file" 2>/dev/null || stat -f "%A" "$file" 2>/dev/null || echo "unknown")
        if [[ "$PERMS" =~ ^[67][0-9][0-9]$ ]]; then
            log_info "✓ $file permissions: $PERMS"
        else
            log_warn "⚠ $file permissions: $PERMS (consider chmod 644 $file)"
        fi
    fi
done

# Check for common issues
log_info "Checking for common issues..."

# Check .dockerignore
if [ -f ".dockerignore" ]; then
    log_info "✓ .dockerignore exists"
else
    log_warn "⚠ .dockerignore missing (optional but recommended)"
fi

# Check for node_modules
if [ -d "node_modules" ]; then
    log_warn "⚠ node_modules directory exists"
    log_warn "  This will be excluded by .dockerignore but increases build context"
fi

# Check environment
log_info "Environment information:"
echo "  User: $(whoami)"
echo "  Shell: $SHELL"
echo "  PATH: $PATH"

echo ""
echo -e "${GREEN}Troubleshooting complete!${NC}"
echo ""
echo "If issues persist:"
echo "1. Try cleaning Docker cache: docker system prune -f"
echo "2. Rebuild without cache: ./deploy.sh --no-cache --cleanup"
echo "3. Check the full deployment guide: cat DEPLOYMENT.md"
echo ""
