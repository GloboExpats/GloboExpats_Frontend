import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

interface ZenoWebhookPayload {
  paymentStatus?: string
  orderId?: string
  transactionId?: string
  reference?: string
  amount?: number
  currency?: string
  metadata?: Record<string, unknown>
}

function isPayloadValid(
  payload: ZenoWebhookPayload
): payload is ZenoWebhookPayload & Required<Pick<ZenoWebhookPayload, 'paymentStatus'>> {
  return Boolean(payload.paymentStatus)
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as ZenoWebhookPayload

    // Log the full payload for debugging
    logger.info('[Webhook:Zeno] Received payload', {
      payload,
      paymentStatus: payload.paymentStatus,
      hasPaymentStatus: Boolean(payload.paymentStatus),
    })

    if (!isPayloadValid(payload)) {
      logger.error('[Webhook:Zeno] Invalid payload - missing paymentStatus', payload)
      return NextResponse.json(
        { success: false, message: 'paymentStatus is required' },
        { status: 400 }
      )
    }

    logger.info('[Webhook:Zeno] Payment update validated', {
      orderId: payload.orderId,
      paymentStatus: payload.paymentStatus,
      reference: payload.reference,
      currency: payload.currency,
    })

    // TODO: Persist payment update to database, notify the user, and advance checkout to the next stage

    return NextResponse.json({
      success: true,
      message: 'Payment notification received successfully',
      orderId: payload.orderId,
    })
  } catch (error) {
    logger.error('[Webhook:Zeno] Handler error', error)
    return NextResponse.json(
      { success: false, message: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
