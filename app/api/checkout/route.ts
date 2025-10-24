import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'https://dev.globoexpats.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization')

    console.log('🔒 [Checkout Proxy] Processing checkout request')

    const response = await fetch(`${BACKEND_URL}/api/v1/checkout/zenoPayCheckOut`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    console.log('✅ [Checkout Proxy] Backend response status:', response.status)

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('❌ [Checkout Proxy] Error:', error)
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 })
  }
}
