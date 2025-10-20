# 🚨 Production Deployment Issue - Summary & Resolution

**Date:** 2025-10-20  
**Status:** Issues Identified & Fixes Applied  
**Action Required:** Rebuild and redeploy containers

---

## Executive Summary

The Globoexpat frontend deployments at both `https://globoexpats.com/` and `http://10.123.22.21:3000/` are currently non-functional due to configuration issues. The backend at `http://10.123.22.21:8081` is **working correctly**.

### Issues Identified

| Issue | Severity | Status |
|-------|----------|--------|
| API path doubling (`/api/backend/v1/api/v1/...`) | 🔴 Critical | ✅ Fixed |
| Incorrect environment variables in Dockerfile | 🔴 Critical | ✅ Fixed |
| Missing rewrite rules in next.config.mjs | 🟡 High | ✅ Fixed |
| Cloudflare 502 Bad Gateway error | 🔴 Critical | ⏳ Needs Investigation |

---

## Root Cause

### 1. API Path Doubling (http://10.123.22.21:3000)

**What Was Happening:**
```
Frontend Request: /api/backend/v1/api/v1/displayItem/newest
Expected Request:  /api/v1/displayItem/newest
Backend Endpoint:  http://10.123.22.21:8081/api/v1/displayItem/newest

Result: 404 Not Found
```

**Why:**
- Dockerfile had `NEXT_PUBLIC_API_URL=/api/backend/v1`
- API client adds `/api/v1/` prefix to all endpoints
- Combined path: `/api/backend/v1` + `/api/v1/...` = **double path**

**Fix:**
- Changed `NEXT_PUBLIC_API_URL` to `http://10.123.22.21:8081`
- Added rewrite rules for `/api/backend/*` pattern (backward compatibility)

### 2. Cloudflare 502 Error (https://globoexpats.com)

**What's Happening:**
- Cloudflare returns "502 Bad Gateway"
- Means: Origin server (Next.js) is not responding

**Possible Causes:**
1. Next.js container not running
2. Container crashed on startup
3. Cloudflare can't reach origin server
4. Origin server configured incorrectly

**Investigation Needed:**
```bash
# Check if container is running
ssh user@server
docker ps | grep frontend

# Check container logs
docker logs expat-frontend
```

---

## Fixes Applied

### File Changes

#### 1. `Dockerfile`
```diff
- ARG NEXT_PUBLIC_API_URL=/api/backend/v1
- ARG BACKEND_URL=https://dev.globoexpats.com
+ ARG NEXT_PUBLIC_API_URL=http://10.123.22.21:8081
+ ARG BACKEND_URL=http://10.123.22.21:8081
```

#### 2. `next.config.mjs`
```diff
- NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://dev.globoexpats.com',
+ NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://10.123.22.21:8081',
```

Added new rewrite rules:
```javascript
{
  source: '/api/backend/v1/:path*',
  destination: `${backendUrl}/api/v1/:path*`,
},
```

### New Files Created

1. **`Docs/deployment/PRODUCTION_DEPLOYMENT_FIX.md`**
   - Comprehensive fix guide
   - Step-by-step rebuild instructions
   - Cloudflare configuration
   - Troubleshooting section

2. **`scripts/rebuild-production.sh`**
   - Automated rebuild script
   - Stops old container
   - Builds new image with correct env vars
   - Starts new container
   - Verifies deployment

3. **`scripts/diagnose-deployment.sh`**
   - Diagnostic script
   - Checks backend status
   - Checks frontend container
   - Tests API connectivity
   - Provides recommendations

---

## Immediate Action Required

### Quick Fix (Run on Server)

```bash
# 1. SSH to server
ssh user@10.123.22.21

# 2. Navigate to project
cd /path/to/ExpatFrontend-main

# 3. Pull latest changes
git pull

# 4. Make scripts executable
chmod +x scripts/*.sh

# 5. Run rebuild script
./scripts/rebuild-production.sh

# 6. Verify deployment
./scripts/diagnose-deployment.sh
```

### Manual Fix (Alternative)

```bash
# Rebuild with correct env vars
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://10.123.22.21:8081 \
  --build-arg BACKEND_URL=http://10.123.22.21:8081 \
  -t expat-frontend:latest .

# Stop old container
docker stop expat-frontend
docker rm expat-frontend

# Start new container
docker run -d \
  --name expat-frontend \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://10.123.22.21:8081 \
  -e BACKEND_URL=http://10.123.22.21:8081 \
  expat-frontend:latest

# Check logs
docker logs -f expat-frontend
```

---

## Verification Steps

After rebuilding, verify:

### 1. Container Status
```bash
docker ps | grep expat-frontend
# Should show: RUNNING status
```

### 2. Frontend Access
```bash
curl http://localhost:3000
# Should return HTML page
```

### 3. API Calls
```bash
curl http://localhost:3000/api/v1/displayItem/newest?page=0&size=5
# Should return JSON with products
```

### 4. Backend Connectivity
```bash
docker exec expat-frontend wget -O- http://10.123.22.21:8081/api/v1/displayItem/newest
# Should return JSON
```

### 5. Browser Test
- Local: `http://10.123.22.21:3000/`
- Domain: `https://globoexpats.com/`

Both should show the homepage with products loading.

---

## Cloudflare Configuration

### Required DNS Settings

```
Type: A
Name: @
Content: <your-server-ip>
Proxy: Enabled (🟠)
```

### SSL/TLS Mode

```
SSL/TLS encryption mode: Full
Always Use HTTPS: On
```

### Origin Server

If using Cloudflare Tunnel or direct connection:
```
Protocol: HTTP
Address:  <your-server-ip>
Port:     3000
```

---

## Technical Details

### Environment Variables (Production)

```env
NEXT_PUBLIC_API_URL=http://10.123.22.21:8081
BACKEND_URL=http://10.123.22.21:8081
NEXT_PUBLIC_WS_URL=ws://10.123.22.21:8081/ws
NEXT_PUBLIC_BACKEND_URL=http://10.123.22.21:8081
NEXT_PUBLIC_ENVIRONMENT=production
NODE_ENV=production
```

### API Request Flow (After Fix)

```
Browser → Frontend (http://10.123.22.21:3000)
Frontend → Direct Backend Call (http://10.123.22.21:8081/api/v1/...)
Backend → Response → Frontend → Browser
```

### Alternative: With nginx Reverse Proxy

If you add nginx in front:

```nginx
location /api/v1 {
    proxy_pass http://localhost:8081/api/v1;
}

location / {
    proxy_pass http://localhost:3000;
}
```

Then use:
```env
NEXT_PUBLIC_API_URL=/api/v1
BACKEND_URL=http://localhost:8081
```

---

## Testing Checklist

- [ ] Backend responding: `curl http://10.123.22.21:8081/api/v1/displayItem/newest`
- [ ] Container running: `docker ps | grep frontend`
- [ ] Port listening: `netstat -tlnp | grep 3000`
- [ ] Frontend responding: `curl http://localhost:3000`
- [ ] API proxy working: `curl http://localhost:3000/api/v1/displayItem/newest`
- [ ] Browser test (IP): `http://10.123.22.21:3000/`
- [ ] Browser test (domain): `https://globoexpats.com/`
- [ ] Products loading on homepage
- [ ] Login/Register working
- [ ] No console errors in browser DevTools

---

## Next Steps

1. ✅ Code fixes applied
2. ⏳ **Deploy to server** (rebuild container)
3. ⏳ **Verify deployment** (run diagnostics)
4. ⏳ **Fix Cloudflare** (if 502 persists)
5. ⏳ **Monitor logs** (check for errors)
6. ⏳ **Test all features** (end-to-end testing)

---

## Support Resources

- **Deployment Guide:** `Docs/deployment/PRODUCTION_DEPLOYMENT_FIX.md`
- **Rebuild Script:** `scripts/rebuild-production.sh`
- **Diagnostics:** `scripts/diagnose-deployment.sh`
- **Backend Swagger:** `http://10.123.22.21:8081/swagger-ui/index.html`

---

## Contact

If issues persist after rebuild:

1. Check container logs: `docker logs expat-frontend --tail 100`
2. Run diagnostics: `./scripts/diagnose-deployment.sh`
3. Review detailed guide: `Docs/deployment/PRODUCTION_DEPLOYMENT_FIX.md`

---

**Status:** ✅ Configuration fixed, ⏳ awaiting deployment
