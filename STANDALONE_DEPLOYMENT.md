# Standalone Deployment Guide

## Overview
This guide explains how to build and run the Expat Marketplace Frontend as a standalone Next.js application, both locally and using Docker.

## Prerequisites
- Node.js >= 20.0.0
- npm >= 8.0.0
- Docker (for containerized deployment)

## Project Configuration
The project is already configured for standalone deployment in `next.config.mjs`:
```javascript
output: 'standalone',
compress: true,
reactStrictMode: true,
poweredByHeader: false,
```

## Local Standalone Deployment

### Step 1: Install Dependencies
```bash
cd /path/to/ExpatFrontend-main
npm install --legacy-peer-deps
```

### Step 2: Build for Production
```bash
npm run build
```
This creates a `.next/standalone` directory with:
- `server.js` - Main server file
- `package.json` - Minimal dependencies
- `node_modules/` - Only required dependencies
- `.next/` - Next.js build files

### Step 3: Run Standalone Server
```bash
cd .next/standalone
node server.js
```

**Server Details:**
- Local URL: http://localhost:3000
- Network URL: http://0.0.0.0:3000
- Startup time: ~261ms
- Self-contained with all dependencies

### Step 4: Environment Variables (Optional)
```bash
# Custom port
PORT=8080 node server.js

# Production mode
NODE_ENV=production node server.js

# Custom hostname
HOSTNAME=0.0.0.0 PORT=3000 node server.js
```

## Docker Deployment

### Quick Start
```bash
# Build and run with deployment script
sudo ./docker-deploy.sh deploy

# Or manually:
sudo docker build -t expat-frontend .
sudo docker run -d -p 3000:3000 --name expat-app expat-frontend
```

### Deployment Script Usage
The project includes a comprehensive deployment script (`docker-deploy.sh`) for easy management:

```bash
# Make executable (first time only)
chmod +x docker-deploy.sh

# Full deployment (build + run)
sudo ./docker-deploy.sh deploy

# Individual commands
sudo ./docker-deploy.sh build         # Build image
sudo ./docker-deploy.sh run           # Run container
sudo ./docker-deploy.sh stop          # Stop container
sudo ./docker-deploy.sh restart       # Restart container
sudo ./docker-deploy.sh logs          # View logs
sudo ./docker-deploy.sh status        # Check status
sudo ./docker-deploy.sh health        # Health check
sudo ./docker-deploy.sh clean         # Remove container and image

# Custom port
sudo ./docker-deploy.sh run -p 8080
```

### Docker Compose (Alternative)
```bash
# Start with Docker Compose
sudo docker-compose up -d

# Stop
sudo docker-compose down

# View logs
sudo docker-compose logs -f frontend
```

### Build Process
1. **Multi-stage build** for optimal image size
2. **Dependencies installation** with legacy peer deps
3. **Production build** with standalone output
4. **Runtime optimization** with minimal Node.js image
5. **Security** with non-root user execution
6. **Health checks** for monitoring

### Key Features
- **Image size**: ~220MB optimized with multi-stage build
- **Security**: Non-root user execution (nextjs:nodejs)
- **Performance**: Production-ready with compression
- **Monitoring**: Built-in health checks every 30s
- **Flexibility**: Configurable via environment variables
- **Signal handling**: Proper shutdown with dumb-init

### Container Status Example
```
NAMES       STATUS                    PORTS                     IMAGE
expat-app   Up 16 minutes (healthy)   0.0.0.0:3001->3000/tcp   expat-frontend

Resource Usage:
CONTAINER   CPU %     MEM USAGE / LIMIT     NET I/O
expat-app   0.00%     220.2MiB / 11.68GiB   123kB / 1.13MB
```

### Manual Docker Commands
```bash
# Build Docker image
sudo docker build -t expat-frontend .

# Run container (detached)
sudo docker run -d -p 3000:3000 --name expat-app expat-frontend

# Run with custom port
sudo docker run -d -p 8080:3000 -e PORT=3000 --name expat-app expat-frontend

# View running containers
sudo docker ps

# View logs
sudo docker logs expat-app

# Follow logs
sudo docker logs -f expat-app

# Stop container
sudo docker stop expat-app

# Remove container
sudo docker rm expat-app

# Remove image
sudo docker rmi expat-frontend

# Access container shell
sudo docker exec -it expat-app /bin/sh
```

## Production Considerations

### Performance
- **Standalone output**: Minimal runtime dependencies
- **Compression**: Enabled for static assets
- **Code splitting**: Automatic with Next.js
- **Static optimization**: Pre-rendered pages where possible

### Security
- **Non-root execution**: Container runs as node user
- **Minimal image**: Only production dependencies
- **Header security**: X-Powered-By header disabled
- **React strict mode**: Enabled for better error handling

### Monitoring
- **Health check**: Available at `/api/health`
- **Build analysis**: Use `npm run build:analyze`
- **Performance**: Monitor with Next.js built-in analytics

## File Structure
```
ExpatFrontend-main/
├── Dockerfile                 # Docker configuration
├── .dockerignore             # Docker ignore patterns
├── next.config.mjs           # Next.js configuration
├── package.json              # Dependencies and scripts
├── STANDALONE_DEPLOYMENT.md  # This documentation
└── .next/standalone/         # Built standalone application
    ├── server.js             # Main server file
    ├── package.json          # Runtime dependencies
    ├── node_modules/         # Required modules only
    └── .next/                # Next.js build output
```

## Troubleshooting

### Common Issues
1. **Port conflicts**: Change PORT environment variable
2. **Permission issues**: Ensure proper file permissions
3. **Memory issues**: Increase Docker memory allocation
4. **Image loading**: Verify static asset paths

### Debugging
```bash
# Enable debug logging
DEBUG=* node server.js

# Check build output
npm run build 2>&1 | tee build.log

# Inspect Docker image
docker inspect expat-frontend
```

## Environment Variables
- `PORT`: Server port (default: 3000)
- `HOSTNAME`: Server hostname (default: 0.0.0.0)
- `NODE_ENV`: Environment mode (default: production)
- `NEXT_BASE_PATH`: Base path for routing
- `ASSET_PREFIX`: CDN prefix for assets

## Build Information
- **Next.js Version**: 15.2.4
- **React Version**: 19
- **TypeScript**: Enabled
- **Tailwind CSS**: Configured
- **Bundle Size**: ~290KB first load
- **Pages**: 32 static/dynamic routes
