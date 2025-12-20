import { NextRequest } from 'next/server'

// Store active connections
const connections = new Map<string, ReadableStreamDefaultController>()

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId')

  if (!orderId) {
    return new Response('Missing orderId', { status: 400 })
  }

  console.log(`[SSE] Client connected for order: ${orderId}`)

  const stream = new ReadableStream({
    start(controller) {
      // Store this connection
      connections.set(orderId, controller)
      console.log(`[SSE] Stored connection for order: ${orderId}`)
      console.log(`[SSE] Total active connections: ${connections.size}`)

      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: 'connected', orderId })}\n\n`
      controller.enqueue(new TextEncoder().encode(data))

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          const ping = `data: ${JSON.stringify({ type: 'ping' })}\n\n`
          controller.enqueue(new TextEncoder().encode(ping))
        } catch (error) {
          console.log(`[SSE] Keep-alive failed for order: ${orderId}, cleaning up`)
          clearInterval(keepAlive)
          connections.delete(orderId)
        }
      }, 30000)

      // Cleanup on close
      req.signal.addEventListener('abort', () => {
        console.log(`[SSE] Client disconnected for order: ${orderId}`)
        clearInterval(keepAlive)
        connections.delete(orderId)
        try {
          controller.close()
        } catch (e) {
          // Already closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

// Helper function to send notification to specific order
export function notifyOrder(orderId: string, data: unknown) {
  const controller = connections.get(orderId)
  if (controller) {
    try {
      const message = `data: ${JSON.stringify(data)}\n\n`
      controller.enqueue(new TextEncoder().encode(message))
      console.log(`[SSE] Sent notification for order: ${orderId}`, data)
      return true
    } catch (error) {
      console.error(`[SSE] Failed to send notification for order: ${orderId}`, error)
      connections.delete(orderId)
      return false
    }
  } else {
    console.log(`[SSE] No active connection for order: ${orderId}`)
    return false
  }
}
