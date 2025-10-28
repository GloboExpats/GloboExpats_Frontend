export const runtime = 'nodejs'

// Server-side backend URL (NOT the public one - this runs server-side in Next.js)
// Use process.env.BACKEND_URL for server-side calls to avoid CORS
// Prefixed with _ since it's only used in commented code (until backend implements endpoint)
const _BACKEND_URL = process.env.BACKEND_URL || 'http://10.123.22.21:8081'

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => null)
    if (process.env.NODE_ENV === 'development') {
      console.log('[analytics:event]', payload)
    }

    // BACKEND ISSUE: Endpoint POST /api/v1/products/{productId}/view does NOT exist
    // Verified via Swagger UI at https://dev.globoexpats.com/swagger-ui/index.html#/
    // Backend team needs to implement this endpoint to track product views
    //
    // When backend implements this endpoint, uncomment the code below:
    /*
    if (payload?.type === 'product_click' && payload?.productId) {
      try {
        const backendResponse = await fetch(
          `${_BACKEND_URL}/api/v1/products/${payload.productId}/view`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timestamp: payload.ts }),
          }
        )
        if (!backendResponse.ok && process.env.NODE_ENV === 'development') {
          console.warn('[analytics:event] Backend view tracking failed')
        }
      } catch (backendError) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[analytics:event] Backend call failed:', backendError)
        }
      }
    }
    */

    return new Response(null, { status: 204 })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e) {
    return new Response(null, { status: 204 })
  }
}
