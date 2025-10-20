import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.123.22.21:8081'

/**
 * Proxy endpoint for updating products
 * This avoids CORS issues when making PATCH requests directly from browser
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Await the params in Next.js 15
    const params = await context.params
    const productId = params.id

    // Get auth token from cookies or header
    const cookieStore = await cookies()
    const tokenFromCookie = cookieStore.get('authToken')?.value
    const tokenFromHeader = req.headers.get('authorization')
    const token = tokenFromHeader || (tokenFromCookie ? `Bearer ${tokenFromCookie}` : '')

    if (!token) {
      console.error('[Proxy] No auth token found')
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authentication token provided' },
        { status: 401 }
      )
    }

    console.log(`[Proxy] PATCH /api/products/${productId}`)
    console.log('[Proxy] Token:', token.substring(0, 20) + '...')

    // Check content type to determine if it's JSON or multipart
    const contentType = req.headers.get('content-type') || ''
    const isMultipart = contentType.includes('multipart/form-data')

    let backendFormData: FormData

    if (isMultipart) {
      // Request already has FormData with images
      console.log('[Proxy] Received multipart/form-data request')
      const formData = await req.formData()

      // Forward the form data as-is to backend
      backendFormData = new FormData()

      // Copy all form fields
      for (const [key, value] of formData.entries()) {
        backendFormData.append(key, value)
        if (key === 'product') {
          console.log('[Proxy] Product data:', value)
        } else if (key === 'images') {
          console.log('[Proxy] Image file:', value instanceof File ? value.name : 'unknown')
        }
      }
    } else {
      // JSON request - convert to multipart
      const body = await req.json()
      console.log('[Proxy] Request body:', JSON.stringify(body, null, 2))

      backendFormData = new FormData()
      backendFormData.append('product', JSON.stringify(body))
    }

    // Build backend URL with query params (for image removal)
    const url = new URL(`${BACKEND_URL}/api/v1/products/update/${productId}`)
    const searchParams = req.nextUrl.searchParams
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })

    console.log('[Proxy] Calling backend:', url.toString())
    console.log('[Proxy] Sending as multipart/form-data')

    const backendResponse = await fetch(url.toString(), {
      method: 'PATCH',
      headers: {
        // Don't set Content-Type - let fetch set it with boundary
        Authorization: token,
      },
      body: backendFormData,
    })

    console.log(`[Proxy] Backend response status: ${backendResponse.status}`)

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('[Proxy] Backend error response:', errorText)

      // Try to parse as JSON, fallback to text
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || 'Failed to update product' }
      }

      return NextResponse.json(
        {
          error: errorData.message || 'Backend error',
          details: errorData,
          status: backendResponse.status,
        },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    console.log('[Proxy] Success response:', data)

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[Proxy] Exception occurred:', error)
    console.error('[Proxy] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500 }
    )
  }
}
