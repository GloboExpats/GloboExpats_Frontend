# View Tracking Implementation Guide

## Overview

This document outlines the view tracking system for product listings. Currently, the frontend tracks product clicks via analytics events, but the backend doesn't store or expose view counts.

## Current Status

### ✅ Frontend Implementation
- Analytics events are triggered when products are clicked
- Events are sent to `/api/analytics/event` with payload:
  ```json
  {
    "type": "product_click",
    "productId": 6,
    "source": "new",
    "ts": 1760951982682
  }
  ```
- Frontend analytics route now forwards these events to backend

### ❌ Backend Implementation (MISSING)
- Database has `view_count INT DEFAULT 0` field in products table
- Backend API doesn't expose this field in `ProductResponseDTO`
- Backend doesn't have endpoint to increment view counts
- Backend doesn't automatically track views when product details are accessed

## Required Backend Changes

### 1. Create View Tracking Endpoint

**Required Endpoint:**
```http
POST /api/v1/products/{productId}/view
```

**Purpose:** Increment the view count for a specific product

**Request Body:**
```json
{
  "timestamp": 1760951982682  // Optional: for analytics
}
```

**Response:**
```json
{
  "success": true,
  "viewCount": 42  // Optional: return updated count
}
```

**Implementation Notes:**
- Should increment `view_count` field in database
- Should be non-authenticated (public endpoint)
- Should handle concurrent requests safely (atomic increment)
- Should be idempotent within a reasonable time window (e.g., same IP can't increment twice within 5 minutes)
- Should return quickly (don't block on other operations)

**Example SQL:**
```sql
UPDATE products 
SET view_count = view_count + 1 
WHERE product_id = ?
```

### 2. Add Views Field to ProductResponseDTO

**Current Schema:**
```java
public class ProductResponseDTO {
    private Long productId;
    private String productName;
    private String productDescription;
    // ... other fields
    private List<ProductImageDTO> productImages;
}
```

**Required Addition:**
```java
public class ProductResponseDTO {
    // ... existing fields
    private Integer viewCount;  // ADD THIS FIELD
    
    // Getter and setter
    public Integer getViewCount() {
        return viewCount;
    }
    
    public void setViewCount(Integer viewCount) {
        this.viewCount = viewCount;
    }
}
```

### 3. Update Product Details Endpoint

**Endpoint:** `GET /api/v1/displayItem/itemDetails/{productId}`

**Changes Needed:**
1. Include `viewCount` in response
2. Map from database `view_count` field to DTO

### 4. Update Product Listing Endpoints

**Endpoints to Update:**
- `GET /api/v1/products/get-all-products`
- `GET /api/v1/displayItem/top-picks`
- `GET /api/v1/displayItem/newest`

**Changes:** Include `viewCount` in all product response objects

## Frontend Integration

### Current Flow

1. User clicks product card → Analytics event triggered
2. Frontend sends to `/api/analytics/event`
3. Next.js API route forwards to backend: `POST /api/v1/products/{productId}/view`
4. Backend increments view count (once endpoint is implemented)
5. Dashboard fetches products and displays view counts

### Code References

**Analytics Tracking:**
```typescript
// lib/analytics.ts
export function trackProductClick(productId: number, source: 'new' | 'top' | 'featured') {
  const payload = { type: 'product_click', productId, source, ts: Date.now() }
  navigator.sendBeacon('/api/analytics/event', JSON.stringify(payload))
}
```

**Frontend API Route:**
```typescript
// app/api/analytics/event/route.ts
const backendResponse = await fetch(
  `${BACKEND_URL}/api/v1/products/${payload.productId}/view`,
  { method: 'POST', body: JSON.stringify({ timestamp: payload.ts }) }
)
```

**Dashboard Display:**
```typescript
// app/expat/dashboard/page.tsx
const totalViewsCount = userListings.reduce((sum, item) => {
  const views = (p.views as number) || (p.viewCount as number) || 0
  return sum + views
}, 0)
```

## Testing

### Backend Testing Checklist

- [ ] Create view tracking endpoint: `POST /api/v1/products/{productId}/view`
- [ ] Test endpoint increments `view_count` in database
- [ ] Test concurrent requests are handled safely
- [ ] Add `viewCount` field to `ProductResponseDTO`
- [ ] Verify field is returned in product details endpoint
- [ ] Verify field is returned in product listing endpoints
- [ ] Test with actual product IDs from database

### Frontend Testing Checklist

- [ ] Click product card and verify analytics event is sent
- [ ] Check browser console for `[analytics:event]` log
- [ ] Verify backend receives POST to `/api/v1/products/{productId}/view`
- [ ] Refresh dashboard and verify view counts display correctly
- [ ] Test view count increments on repeated clicks
- [ ] Verify "Total Views" stat in dashboard overview

### End-to-End Testing

1. **Create Test Product**
   - Create a product listing via `/sell` page
   - Note the product ID

2. **Track Views**
   - Click the product from home page (source: 'top' or 'new')
   - Check console for analytics event
   - Repeat 5 times from different pages

3. **Verify Dashboard**
   - Navigate to `/expat/dashboard`
   - Check "Total Views" card shows count
   - Check individual product card shows view count
   - Check "Analytics" tab shows breakdown

## Alternative Implementation (If Backend Changes Not Possible)

If backend team cannot implement the required changes immediately, consider:

### Option 1: Client-Side Only Tracking
- Store view counts in localStorage
- Sync across user's devices using backend profile
- **Pros:** Quick to implement
- **Cons:** Not reliable, can be cleared, device-specific

### Option 2: Use Existing Analytics Service
- Send events to Google Analytics, Mixpanel, or similar
- Query analytics API to get view counts
- **Pros:** Mature analytics infrastructure
- **Cons:** Additional service dependency, cost

### Option 3: Database Direct Access
- Create a separate views table
- Frontend API route writes directly to database
- **Pros:** Works without backend API changes
- **Cons:** Bypasses backend logic, security concerns

## Migration Path

Once backend endpoints are ready:

1. Deploy backend changes to staging
2. Test with frontend staging environment
3. Monitor error logs for 24 hours
4. Deploy to production
5. Monitor dashboard for view count updates
6. Verify no performance degradation

## Performance Considerations

- View tracking should be async and non-blocking
- Consider batching view updates (e.g., buffer for 5 seconds)
- Add database index on `product_id` for view tracking table
- Consider Redis cache for real-time view counts
- Rate limit view increments per IP/session

## Security Considerations

- Validate `productId` exists before incrementing
- Rate limit to prevent view count manipulation
- Consider IP-based throttling (max 1 view per product per 5 minutes per IP)
- Log suspicious patterns (e.g., 100 views from same IP in 1 minute)

## Monitoring

Add metrics for:
- View tracking API response times
- Failed view tracking attempts
- View count distribution across products
- Most viewed products (top 10)

---

**Status:** 🔴 Backend Implementation Required  
**Priority:** High  
**Estimated Backend Work:** 2-4 hours  
**Last Updated:** 2025-10-20
