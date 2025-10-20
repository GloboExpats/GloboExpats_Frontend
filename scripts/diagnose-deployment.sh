#!/bin/bash

###############################################################################
# Deployment Diagnostics Script
# 
# This script checks the current state of both frontend and backend
# deployments and identifies issues.
#
# Usage: ./scripts/diagnose-deployment.sh
###############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKEND_URL="http://10.123.22.21:8081"
FRONTEND_PORT=3000

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Expat Platform Deployment Diagnostics                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check backend
echo -e "${YELLOW}═══ Backend Status ═══${NC}"
echo -e "URL: ${BACKEND_URL}"
if curl -s --max-time 5 "${BACKEND_URL}/api/v1/displayItem/newest?page=0&size=1" > /dev/null 2>&1; then
    echo -e "Status: ${GREEN}✓ ONLINE${NC}"
    echo -e "Swagger: ${BACKEND_URL}/swagger-ui/index.html"
else
    echo -e "Status: ${RED}✗ OFFLINE or UNREACHABLE${NC}"
fi
echo ""

# Check frontend container
echo -e "${YELLOW}═══ Frontend Container Status ═══${NC}"
if docker ps -q -f name="expat-frontend" | grep -q .; then
    echo -e "Status: ${GREEN}✓ RUNNING${NC}"
    echo ""
    echo "Container Info:"
    docker ps -f name="expat-frontend" --format "  Name:    {{.Names}}\n  Status:  {{.Status}}\n  Ports:   {{.Ports}}\n  Image:   {{.Image}}"
    echo ""
    
    echo "Environment Variables:"
    docker exec expat-frontend env 2>/dev/null | grep -E "NEXT_PUBLIC|BACKEND" | sed 's/^/  /' || echo "  Unable to read env vars"
    echo ""
else
    echo -e "Status: ${RED}✗ NOT RUNNING${NC}"
    
    # Check if container exists but stopped
    if docker ps -aq -f name="expat-frontend" | grep -q .; then
        echo -e "Note: Container exists but is stopped"
        echo ""
        echo "Last logs:"
        docker logs --tail 20 expat-frontend 2>&1 | sed 's/^/  /'
    else
        echo -e "Note: No container found with name 'expat-frontend'"
    fi
fi
echo ""

# Check port
echo -e "${YELLOW}═══ Port ${FRONTEND_PORT} Status ═══${NC}"
if netstat -tlnp 2>/dev/null | grep -q ":${FRONTEND_PORT} "; then
    echo -e "Status: ${GREEN}✓ LISTENING${NC}"
    netstat -tlnp 2>/dev/null | grep ":${FRONTEND_PORT} " | sed 's/^/  /'
elif ss -tlnp 2>/dev/null | grep -q ":${FRONTEND_PORT} "; then
    echo -e "Status: ${GREEN}✓ LISTENING${NC}"
    ss -tlnp 2>/dev/null | grep ":${FRONTEND_PORT} " | sed 's/^/  /'
else
    echo -e "Status: ${RED}✗ NOT LISTENING${NC}"
fi
echo ""

# Test frontend HTTP
echo -e "${YELLOW}═══ Frontend HTTP Test ═══${NC}"
if curl -s --max-time 5 "http://localhost:${FRONTEND_PORT}" > /dev/null 2>&1; then
    echo -e "Status: ${GREEN}✓ RESPONDING${NC}"
    echo -e "URL: http://localhost:${FRONTEND_PORT}"
    echo -e "     http://10.123.22.21:${FRONTEND_PORT}"
else
    echo -e "Status: ${RED}✗ NOT RESPONDING${NC}"
fi
echo ""

# Test API proxy
echo -e "${YELLOW}═══ API Proxy Test ═══${NC}"
echo "Testing: http://localhost:${FRONTEND_PORT}/api/v1/displayItem/newest"
if response=$(curl -s --max-time 5 "http://localhost:${FRONTEND_PORT}/api/v1/displayItem/newest?page=0&size=1" 2>&1); then
    if echo "$response" | grep -q "content"; then
        echo -e "Status: ${GREEN}✓ WORKING${NC}"
        echo "Response preview:"
        echo "$response" | head -c 200 | sed 's/^/  /'
        echo "..."
    else
        echo -e "Status: ${RED}✗ INVALID RESPONSE${NC}"
        echo "Response:"
        echo "$response" | head -c 500 | sed 's/^/  /'
    fi
else
    echo -e "Status: ${RED}✗ FAILED${NC}"
    echo "Error: $response"
fi
echo ""

# Docker images
echo -e "${YELLOW}═══ Docker Images ═══${NC}"
docker images | grep -E "REPOSITORY|expat-frontend" | sed 's/^/  /'
echo ""

# System resources
echo -e "${YELLOW}═══ System Resources ═══${NC}"
if docker stats --no-stream expat-frontend 2>/dev/null | grep -q .; then
    docker stats --no-stream expat-frontend | sed 's/^/  /'
else
    echo "  Container not running"
fi
echo ""

# Recommendations
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                      Recommendations                           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if ! docker ps -q -f name="expat-frontend" | grep -q .; then
    echo -e "${YELLOW}→${NC} Frontend container is not running. Run:"
    echo -e "  ${BLUE}./scripts/rebuild-production.sh${NC}"
    echo ""
fi

if ! curl -s --max-time 5 "${BACKEND_URL}/api/v1/displayItem/newest" > /dev/null 2>&1; then
    echo -e "${YELLOW}→${NC} Backend is not accessible. Check:"
    echo -e "  ${BLUE}systemctl status <backend-service>${NC}"
    echo -e "  ${BLUE}docker ps | grep backend${NC}"
    echo ""
fi

if docker exec expat-frontend env 2>/dev/null | grep -q "NEXT_PUBLIC_API_URL=/api/backend"; then
    echo -e "${YELLOW}→${NC} Frontend has incorrect API URL. Rebuild with:"
    echo -e "  ${BLUE}./scripts/rebuild-production.sh${NC}"
    echo ""
fi

echo -e "${GREEN}For detailed troubleshooting, see:${NC}"
echo -e "  Docs/deployment/PRODUCTION_DEPLOYMENT_FIX.md"
echo ""
