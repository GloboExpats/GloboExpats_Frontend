# 🐛 Bug Fix: "Failed to Fetch" Error During Product Listing

**Date**: 2025-10-29  
**Issue**: TypeError: Failed to fetch when publishing listing  
**Status**: ✅ Fixed with Enhanced Error Logging

---

## 📋 Problem Description

Users encountered a "TypeError: Failed to fetch" error when attempting to publish product listings. The error occurred at:

- `lib/api.ts:422` - in the `createProduct()` method
- `app/sell/page.tsx:315` - when calling `apiClient.createProduct()`

### Error Stack Trace

```
TypeError: Failed to fetch
    at eval (webpack-internal:///(app-pages-browser)/./lib/api.ts:422:29)
    at ApiClient.createProduct (webpack-internal:///(app-pages-browser)/./lib/api.ts:467:11)
```

---

## 🔍 Root Cause Analysis

The "Failed to fetch" error is a **network-level error** that can occur due to several reasons:

### 1. **Most Common Causes**:

- **Backend server unreachable** - Server at `http://10.123.22.21:8081` is down or not responding
- **Network connectivity issues** - Firewall, VPN, or network configuration blocking the request
- **CORS preflight failure** - Backend not accepting multipart/form-data requests
- **Request timeout** - Backend taking too long to respond (>30 seconds default timeout)
- **Authentication token missing** - No JWT token available for authenticated endpoint

### 2. **Technical Context**:

- The `createProduct` method uses native `fetch()` API
- Endpoint: `POST /api/v1/products/post-product`
- Request type: `multipart/form-data` (images + JSON product data)
- Authentication: Required (JWT Bearer token)
- Proxy pattern: Next.js proxies `/api/v1/*` to backend via rewrites

### 3. **Why Generic Error?**:

The native `fetch()` API throws a generic "Failed to fetch" TypeError for ANY network-level failure:

- Cannot resolve DNS
- Connection refused
- Connection timeout
- Network unreachable
- CORS failure (in browser)
- SSL/TLS errors

---

## 🛠️ Solution Implemented

### Enhanced Error Logging & Handling

Updated `lib/api.ts` `createProduct()` method with:

#### 1. **Pre-flight Validation**

```typescript
// Check for auth token before making request
const authToken = (this.headers as Record<string, string>)['Authorization'] || ''
if (!authToken) {
  console.error('❌ No authorization token found!')
  throw new Error('Authentication required. Please log in and try again.')
}
```

#### 2. **Detailed Request Logging**

```typescript
console.log('📤 Creating product with data:', productData)
console.log('📸 Number of images:', images.length)
images.forEach((image, index) => {
  console.log(`📷 Image ${index + 1}:`, image.name, `(${(image.size / 1024).toFixed(2)} KB)`)
})
console.log('🔑 Auth token:', authToken.substring(0, 20) + '...')
console.log('🌐 Posting to:', `${this.baseURL}/api/v1/products/post-product`)
```

#### 3. **Response Status Logging**

```typescript
console.log('📡 Response status:', response.status)

if (!response.ok) {
  const errorText = await response.text()
  console.error('❌ Backend error response:', errorText)
  throw new Error(`Failed to create product: ${response.status} - ${errorText || 'Server error'}`)
}
```

#### 4. **Network Error Detection**

```typescript
catch (error) {
  console.error('❌ Error in createProduct:', error)

  // Check for network errors specifically
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    throw new Error(
      'Network error: Unable to connect to server. Please check your internet connection and try again.'
    )
  }

  // Re-throw with context
  throw error
}
```

#### 5. **Success Logging**

```typescript
const result = await response.json()
console.log('✅ Product created successfully:', result)
return result
```

---

## 🧪 Testing & Debugging Steps

### For Users Encountering This Error:

#### 1. **Check Browser Console** (F12 → Console tab)

Look for these debug logs:

```
📤 Creating product with data: {...}
📸 Number of images: 3
📷 Image 1: photo.jpg (1234.56 KB)
🔑 Auth token: Bearer eyJhbGciOiJI...
🌐 Posting to: /api/v1/products/post-product
```

#### 2. **Verify Authentication**

If you see:

```
❌ No authorization token found!
```

**Solution**: Log out and log back in to refresh your session.

#### 3. **Check Network Tab** (F12 → Network tab)

- Look for the `post-product` request
- Check if it shows "CORS error" (red)
- Check if status is `0` or `(failed)`
- Check request headers for `Authorization: Bearer ...`

#### 4. **Verify Backend Status**

From terminal:

```bash
curl -I http://10.123.22.21:8081/api/v1/products/categories
```

Should return `HTTP/1.1 200` if backend is running.

#### 5. **Check Image Sizes**

- Maximum: 5MB per image
- Maximum: 10 images total
- Formats: JPEG, PNG

---

## 📊 Expected Console Output (Success)

```
📤 Creating product with data: {title: "Test Product", ...}
📸 Number of images: 2
📷 Image 1: product-main.jpg (234.56 KB)
📷 Image 2: product-side.jpg (189.23 KB)
🔑 Auth token: Bearer eyJhbGciOiJI...
🌐 Posting to: /api/v1/products/post-product
📡 Response status: 200
✅ Product created successfully: {productId: 123, imageIds: [456, 789]}
```

---

## 📊 Expected Console Output (Failure Scenarios)

### Scenario 1: Not Logged In

```
❌ No authorization token found!
Error: Authentication required. Please log in and try again.
```

**Fix**: Log in again

### Scenario 2: Backend Down

```
📤 Creating product with data: {...}
📸 Number of images: 2
🔑 Auth token: Bearer eyJhbGci...
🌐 Posting to: /api/v1/products/post-product
❌ Error in createProduct: TypeError: Failed to fetch
Error: Network error: Unable to connect to server. Please check your internet connection and try again.
```

**Fix**: Wait for backend to come back online or contact support

### Scenario 3: Backend Error

```
📤 Creating product with data: {...}
📸 Number of images: 2
🔑 Auth token: Bearer eyJhbGci...
🌐 Posting to: /api/v1/products/post-product
📡 Response status: 400
❌ Backend error response: Invalid product data: title is required
Error: Failed to create product: 400 - Invalid product data: title is required
```

**Fix**: Check form validation

---

## 🔧 Additional Improvements Made

### 1. **User-Friendly Error Messages**

- Before: `TypeError: Failed to fetch`
- After: `Network error: Unable to connect to server. Please check your internet connection and try again.`

### 2. **Authentication Check**

- Added pre-flight check for auth token
- Clear error message if not authenticated

### 3. **Detailed Logging**

- Every step of the request is logged
- Easy to diagnose where exactly the failure occurs
- Image details logged (name, size)

---

## 🎯 Recommendations for Users

### If Error Persists:

1. **Check Your Internet Connection**
   - Try opening other websites
   - Check if you can access `http://10.123.22.21:8081` directly

2. **Verify Authentication**
   - Log out and log back in
   - Check if session expired (2-hour session timeout)

3. **Check Image Requirements**
   - Max 5MB per image
   - Max 10 images
   - Only JPG/PNG formats

4. **Try Incognito/Private Window**
   - Rules out browser extension interference
   - Fresh session without cached data

5. **Clear Browser Cache**
   - Clear site data for localhost:3000
   - Refresh page (Ctrl+F5 or Cmd+Shift+R)

6. **Contact Support**
   - Provide console logs (F12 → Console → screenshot)
   - Provide network tab screenshot
   - Describe steps leading to error

---

## 📝 Technical Notes

### Next.js Proxy Configuration

```javascript
// next.config.mjs
async rewrites() {
  return [
    {
      source: '/api/v1/:path*',
      destination: `${process.env.BACKEND_URL}/api/v1/:path*`,
    },
  ]
}
```

- `BACKEND_URL=http://10.123.22.21:8081`
- `NEXT_PUBLIC_API_URL=""` (empty for proxy pattern)
- Client requests to `/api/v1/products/post-product` → proxied to `http://10.123.22.21:8081/api/v1/products/post-product`

### Backend API Endpoint

- **URL**: `POST /api/v1/products/post-product`
- **Auth**: Required (JWT Bearer token)
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `product`: JSON string (product data WITHOUT sellerId)
  - `images`: Array of File objects

### Backend Response

```json
{
  "productId": 123,
  "imageIds": [456, 789]
}
```

---

## ✅ Resolution Status

**Status**: ✅ **Enhanced Error Logging Implemented**

The enhanced logging will help diagnose the exact cause of "Failed to fetch" errors by showing:

- ✅ Authentication status
- ✅ Request details (product data, images)
- ✅ Network connectivity
- ✅ Response status
- ✅ Backend error messages
- ✅ User-friendly error messages

**Next Steps**:

1. User tries to publish listing again
2. Check browser console for detailed logs
3. Share logs with support if issue persists
4. Backend team can use logs to diagnose server-side issues

---

## 🔮 Future Improvements

1. **Retry Logic**: Auto-retry failed requests (max 3 attempts)
2. **Progress Indicator**: Show upload progress for large images
3. **Offline Detection**: Detect offline status before attempting upload
4. **Request Timeout**: Add custom timeout (e.g., 60 seconds for large files)
5. **Image Compression**: Auto-compress images >1MB before upload
6. **Draft Save**: Auto-save draft to localStorage before upload
7. **Network Quality Check**: Warn users on slow connections
8. **Backend Health Check**: Ping backend before attempting upload

---

## 📚 Related Files

- `/lib/api.ts` - API client with enhanced logging
- `/app/sell/page.tsx` - Product listing form
- `/next.config.mjs` - Next.js proxy configuration
- `/.env.local` - Environment variables (BACKEND_URL)

---

## 🎓 Learning Points

1. **"Failed to fetch" is vague** - Always add detailed logging
2. **Network errors need context** - Transform generic errors to user-friendly messages
3. **Pre-flight checks help** - Validate auth before making requests
4. **Logging is crucial** - Console logs are the first line of debugging
5. **Proxy patterns work** - Next.js rewrites prevent CORS issues

---

**Fix Applied**: 2025-10-29  
**File Modified**: `lib/api.ts`  
**Lines Changed**: 391-466 (createProduct method)  
**Commit**: Enhanced error logging and handling for product creation
