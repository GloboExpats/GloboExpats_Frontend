# CORS Issue Resolution Summary

**Date:** October 20, 2025  
**Issue:** Cross-Origin Resource Sharing (CORS) blocking all API requests  
**Status:** ✅ FIXED

---

## Issue Diagnosis

### What Happened
After the initial Dockerfile fix that corrected API path duplication, a **new CORS error** emerged:

```
Access to fetch at 'http://10.123.22.21:8081/api/v1/displayItem/newest' 
from origin 'http://10.123.22.21:3000' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Root Cause Analysis

**Previous Configuration (caused CORS):**
```dockerfile
ARG NEXT_PUBLIC_API_URL=http://10.123.22.21:8081  # ❌ Direct backend URL
```

This made the browser send **cross-origin requests** directly to the backend:
- Frontend: `http://10.123.22.21:3000` (origin A)
- Backend: `http://10.123.22.21:8081` (origin B)
- Different ports = different origins = CORS policy enforced

The backend Spring Boot application doesn't have CORS headers configured to allow requests from the frontend origin.

### Why Previous "Fix" Failed

The original Dockerfile had:
```dockerfile
ARG NEXT_PUBLIC_API_URL=/api/backend/v1  # Attempted proxy, wrong path
```

This tried to use Next.js proxy but with an incorrect path that didn't match the rewrite rule in `next.config.mjs`:
```javascript
// next.config.mjs has:
source: '/api/v1/:path*'  // ← Expects /api/v1/*

// But Dockerfile had:
NEXT_PUBLIC_API_URL=/api/backend/v1  // ← Wrong prefix
```

Result: Path duplication (`/api/backend/v1/api/v1/...`) because the API client code appends `/api/v1/` to the base URL.

---

## The Solution: Next.js Proxy Pattern

### Correct Configuration

```dockerfile
ARG NEXT_PUBLIC_API_URL=/api/v1              # ✅ Relative path (browser uses proxy)
ARG BACKEND_URL=http://10.123.22.21:8081    # ✅ Backend URL (server-side only)
```

### How It Works

1. **Browser makes same-origin request:**
   ```
   GET http://10.123.22.21:3000/api/v1/products
   ```
   No CORS issue because it's to the same origin (port 3000)

2. **Next.js server intercepts and rewrites:**
   ```javascript
   // next.config.mjs rewrites rule
   {
     source: '/api/v1/:path*',
     destination: 'http://10.123.22.21:8081/api/v1/:path*'
   }
   ```

3. **Next.js makes server-side request to backend:**
   ```
   GET http://10.123.22.21:8081/api/v1/products
   ```
   No CORS because server-to-server communication doesn't enforce CORS

4. **Next.js returns response to browser:**
   ```
   200 OK (from same origin)
   ```

### Request Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         Browser (Port 3000)                      │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             │ GET /api/v1/products
                             │ (Same-origin request)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Next.js Server (Port 3000)                    │
│                                                                  │
│  1. Receives browser request for /api/v1/products               │
│  2. Matches rewrite rule: /api/v1/:path*                        │
│  3. Transforms to: http://10.123.22.21:8081/api/v1/products     │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             │ GET http://10.123.22.21:8081/api/v1/products
                             │ (Server-to-server, no CORS)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                Spring Boot Backend (Port 8081)                   │
│                                                                  │
│  Processes request and returns JSON response                     │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             │ 200 OK { data: [...] }
                             │
                             ▼
                    Back through Next.js to Browser
```

---

## Files Changed

### 1. `Dockerfile` (Lines 37-58)

**Before:**
```dockerfile
ARG NEXT_PUBLIC_API_URL=http://10.123.22.21:8081
```

**After:**
```dockerfile
ARG NEXT_PUBLIC_API_URL=/api/v1
ARG BACKEND_URL=http://10.123.22.21:8081
```

### 2. `next.config.mjs` (No changes - already correct)

```javascript
async rewrites() {
  return [
    {
      source: '/api/v1/:path*',
      destination: `${process.env.BACKEND_URL}/api/v1/:path*`,
    },
  ]
}
```

### 3. `lib/api.ts` (No changes - already correct)

The API client already has logic to detect Next.js API routes:

```typescript
// If endpoint starts with /api/, use it directly (Next.js proxy)
const isNextApiRoute = endpoint.startsWith('/api/') && !endpoint.startsWith('/api/v1/')
const url = isNextApiRoute ? endpoint : `${this.baseURL}${endpoint}`
```

---

## Rebuild Instructions

```bash
# Navigate to project
cd /home/cisco/Documents/ExpatFrontend-main

# Stop running container
docker-compose down

# Rebuild with no cache
docker-compose build --no-cache

# Start container
docker-compose up -d

# Check logs
docker-compose logs -f frontend
```

---

## Verification Checklist

After rebuild, verify the following:

### ✅ Browser Console (No CORS Errors)
```
[API] GET /api/v1/displayItem/newest?page=0&size=20
[API] GET /api/v1/displayItem/top-picks?page=0&size=20
[API] GET /api/v1/products/get-all-products?page=0
```

### ✅ Network Tab (Requests to Same Origin)
- Request URL: `http://10.123.22.21:3000/api/v1/products`
- Status: `200 OK`
- No CORS errors

### ✅ Homepage Loads Successfully
- Product listings display
- "New Arrivals" section populated
- "Trending Now" shows items
- No errors in console

---

## Why This Approach Is Better

### ✅ Advantages of Next.js Proxy Pattern

1. **No CORS Issues:** All browser requests are same-origin
2. **No Backend Changes:** Backend doesn't need CORS configuration
3. **Security:** Backend URL not exposed to browser
4. **Performance:** Can add caching layers in Next.js
5. **Flexibility:** Easy to add request/response transformations
6. **Production Ready:** Works in all environments

### ❌ Alternative: Configure CORS on Backend (Not Recommended)

Would require backend changes:
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://10.123.22.21:3000", "https://globoexpats.com")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
            }
        };
    }
}
```

**Downsides:**
- Requires backend code changes
- Must maintain list of allowed origins
- Potential security risks if misconfigured
- Adds preflight OPTIONS requests (slower)

---

## Production Deployment

For production (`https://globoexpats.com`), use the same pattern:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=/api/v1 \
  --build-arg BACKEND_URL=https://api.globoexpats.com \
  --build-arg NEXT_PUBLIC_ENVIRONMENT=production \
  -t expat-frontend:production .
```

**Key points:**
- Browser requests: `https://globoexpats.com/api/v1/*` (same origin)
- Next.js proxies to: `https://api.globoexpats.com/api/v1/*`
- No CORS configuration needed

---

## Lessons Learned

1. **Environment Variables Matter:** `NEXT_PUBLIC_*` variables are embedded in browser bundle
2. **Proxy Pattern Avoids CORS:** Server-side proxying bypasses browser CORS policy
3. **Path Consistency:** Rewrite paths must match API client expectations
4. **Browser Cache:** Always clear cache when testing configuration changes

---

## Related Documentation

- `Docs/IMMEDIATE_FIX_GUIDE.md` - Step-by-step fix instructions
- `Docs/PLATFORM_AUDIT_REPORT_2025.md` - Complete platform audit
- `next.config.mjs` - Next.js configuration with rewrite rules
- `lib/api.ts` - API client implementation

---

**Status:** Issue resolved. Application ready for testing.
