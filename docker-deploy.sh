#!/bin/bash

# =============================================================================
# DOCKER DEPLOYMENT SCRIPT - EXPAT MARKETPLACE FRONTEND
# =============================================================================
# Comprehensive script for building and deploying the frontend application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="expat-frontend"
CONTAINER_NAME="expat-app"
PORT="${PORT:-3000}"
HOST_PORT="${HOST_PORT:-3000}"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Help function
show_help() {
    echo "Docker Deployment Script for Expat Marketplace Frontend"
    echo ""
    echo "Usage: $0 [OPTIONS] COMMAND"
    echo ""
    echo "Commands:"
    echo "  build         Build the Docker image"
    echo "  run           Run the container"
    echo "  stop          Stop the container"
    echo "  restart       Restart the container"
    echo "  logs          Show container logs"
    echo "  shell         Access container shell"
    echo "  clean         Remove container and image"
    echo "  deploy        Full deployment (build + run)"
    echo "  status        Show container status"
    echo "  health        Check application health"
    echo ""
    echo "Options:"
    echo "  -p, --port PORT       Host port (default: 3000)"
    echo "  -d, --detach         Run in detached mode"
    echo "       --env-file FILE   Use a specific env file (default: auto-detect .env)"
    echo "  -h, --help           Show this help"
    echo ""
    echo "Environment Variables:"
    echo "  PORT          Container port (default: 3000)"
    echo "  HOST_PORT     Host port mapping (default: 3000)"
    echo "  NODE_ENV      Environment mode (default: production)"
    echo ""
    echo "Examples:"
    echo "  $0 deploy                    # Full deployment"
    echo "  $0 run -p 8080              # Run on port 8080"
    echo "  $0 logs                      # Show logs"
    echo "  $0 health                    # Check health"
}

# Check Docker installation
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not in PATH"
    fi
    
    if ! docker info &> /dev/null; then
        error "Cannot connect to Docker daemon. Is Docker running?"
    fi
}

# Build Docker image
build_image() {
    log "Building Docker image: $IMAGE_NAME"
    
    # Check if Dockerfile exists
    if [ ! -f "Dockerfile" ]; then
        error "Dockerfile not found in current directory"
    fi
    
    # Build the image
    docker build -t "$IMAGE_NAME" . || error "Failed to build Docker image"
    
    log "Docker image built successfully: $IMAGE_NAME"
    
    # Show image info
    docker images "$IMAGE_NAME" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
}

# Run container
run_container() {
    log "Starting container: $CONTAINER_NAME"
    
    # Stop existing container if running
    if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        warn "Container $CONTAINER_NAME is already running. Stopping it first."
        docker stop "$CONTAINER_NAME" || warn "Failed to stop existing container"
    fi
    
    # Remove existing container if exists
    if docker ps -aq -f name="$CONTAINER_NAME" | grep -q .; then
        docker rm "$CONTAINER_NAME" || warn "Failed to remove existing container"
    fi
    
    # Run new container
    local run_opts=()
    local env_file_to_use=".env"

    # If user specified --env-file FILE, it's already stored in ENV_FILE variable
    if [ -n "$ENV_FILE" ]; then
        if [ -f "$ENV_FILE" ]; then
            env_file_to_use="$ENV_FILE"
        else
            warn "Specified env file '$ENV_FILE' not found. Ignoring."
        fi
    elif [ -f .env ]; then
        # Auto-detect .env in project root
        env_file_to_use=".env"
    fi

    if [ -n "$env_file_to_use" ]; then
        log "Including environment variables from $env_file_to_use"
        run_opts+=(--env-file "$env_file_to_use")
    else
        warn "No env file provided or found (.env). Continuing without external runtime env file."
    fi
    
    if [ "$DETACHED" = "true" ]; then
        run_opts+=("-d")
    fi
    
    docker run "${run_opts[@]}" \
        -p "$HOST_PORT:$PORT" \
        --name "$CONTAINER_NAME" \
        -e NODE_ENV=production \
        -e PORT="$PORT" \
        -e HOSTNAME=0.0.0.0 \
        "$IMAGE_NAME" || error "Failed to start container"
    
    log "Container started successfully"
    
    if [ "$DETACHED" = "true" ]; then
        info "Container is running in detached mode"
        info "Access the application at: http://localhost:$HOST_PORT"
        info "Use '$0 logs' to view logs"
        info "Use '$0 status' to check status"
    fi
}

# Stop container
stop_container() {
    log "Stopping container: $CONTAINER_NAME"
    
    if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        docker stop "$CONTAINER_NAME" || error "Failed to stop container"
        log "Container stopped successfully"
    else
        warn "Container $CONTAINER_NAME is not running"
    fi
}

# Show logs
show_logs() {
    log "Showing logs for container: $CONTAINER_NAME"
    
    if docker ps -aq -f name="$CONTAINER_NAME" | grep -q .; then
        docker logs -f "$CONTAINER_NAME"
    else
        error "Container $CONTAINER_NAME does not exist"
    fi
}

# Access shell
access_shell() {
    log "Accessing shell for container: $CONTAINER_NAME"
    
    if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        docker exec -it "$CONTAINER_NAME" /bin/sh
    else
        error "Container $CONTAINER_NAME is not running"
    fi
}

# Clean up
clean_up() {
    log "Cleaning up container and image"
    
    # Stop and remove container
    if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        docker stop "$CONTAINER_NAME"
    fi
    
    if docker ps -aq -f name="$CONTAINER_NAME" | grep -q .; then
        docker rm "$CONTAINER_NAME"
    fi
    
    # Remove image
    if docker images -q "$IMAGE_NAME" | grep -q .; then
        docker rmi "$IMAGE_NAME"
        log "Cleanup completed"
    else
        warn "Image $IMAGE_NAME not found"
    fi
}

# Show status
show_status() {
    log "Container status for: $CONTAINER_NAME"
    
    if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        docker ps -f name="$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"
        
        # Show resource usage
        echo ""
        info "Resource usage:"
        docker stats "$CONTAINER_NAME" --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
    else
        warn "Container $CONTAINER_NAME is not running"
        
        # Check if container exists but is stopped
        if docker ps -aq -f name="$CONTAINER_NAME" | grep -q .; then
            info "Container exists but is stopped"
            docker ps -a -f name="$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
        else
            info "Container does not exist"
        fi
    fi
}

# Health check
check_health() {
    log "Checking application health"
    
    if ! docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        error "Container $CONTAINER_NAME is not running"
    fi
    
    local health_url="http://localhost:$HOST_PORT/api/health"
    
    if command -v curl &> /dev/null; then
        log "Testing health endpoint: $health_url"
        if curl -f -s "$health_url" > /dev/null; then
            log "✅ Application is healthy"
            curl -s "$health_url" | python3 -m json.tool 2>/dev/null || curl -s "$health_url"
        else
            error "❌ Health check failed"
        fi
    else
        warn "curl not found. Cannot test health endpoint directly."
        info "Manually test: $health_url"
    fi
}

# Parse command line arguments
DETACHED="true"
COMMAND=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--port)
            HOST_PORT="$2"
            shift 2
            ;;
        -d|--detach)
            DETACHED="true"
            shift
            ;;
        --env-file)
            ENV_FILE="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        build|run|stop|restart|logs|shell|clean|deploy|status|health)
            COMMAND="$1"
            shift
            ;;
        *)
            error "Unknown option: $1. Use -h for help."
            ;;
    esac
done

# Main execution
main() {
    # Check Docker
    check_docker
    
    # Execute command
    case $COMMAND in
        build)
            build_image
            ;;
        run)
            run_container
            ;;
        stop)
            stop_container
            ;;
        restart)
            stop_container
            run_container
            ;;
        logs)
            show_logs
            ;;
        shell)
            access_shell
            ;;
        clean)
            clean_up
            ;;
        deploy)
            build_image
            run_container
            info "Deployment completed successfully!"
            info "Application URL: http://localhost:$HOST_PORT"
            info "Health check: http://localhost:$HOST_PORT/api/health"
            ;;
        status)
            show_status
            ;;
        health)
            check_health
            ;;
        "")
            error "No command specified. Use -h for help."
            ;;
        *)
            error "Unknown command: $COMMAND. Use -h for help."
            ;;
    esac
}

# Run main function
main "$@"
