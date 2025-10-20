'use client'

/** Lightweight analytics helpers using sendBeacon to avoid blocking UI */
export type AnalyticsEvent = {
  type: 'product_click'
  productId: number
  source: 'new' | 'top' | 'featured'
  ts: number
}

const ANALYTICS_ENDPOINT = '/api/analytics/event'

export function trackProductClick(productId: number, source: AnalyticsEvent['source']) {
  const payload: AnalyticsEvent = { type: 'product_click', productId, source, ts: Date.now() }
  try {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ANALYTICS_ENDPOINT, blob)
    } else {
      // Fallback (non-blocking)
      fetch(ANALYTICS_ENDPOINT, { method: 'POST', body: JSON.stringify(payload), keepalive: true })
    }
  } catch (e) {
    // Swallow errors to avoid impacting UX
    if (process.env.NODE_ENV === 'development') console.debug('[analytics] failed', e)
  }
}
