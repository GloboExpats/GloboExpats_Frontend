'use client'

import { useEffect } from 'react'

// Initialize Matomo data layer immediately (before React renders)
if (typeof window !== 'undefined') {
  window._mtm = window._mtm || []
}

export function MatomoTagManager() {
  useEffect(() => {
    // Initialize Matomo Tag Manager
    const _mtm = (window._mtm = window._mtm || [])
    _mtm.push({ 'mtm.startTime': new Date().getTime(), event: 'mtm.Start' })

    const d = document
    const g = d.createElement('script')
    const s = d.getElementsByTagName('script')[0]

    g.async = true
    g.src = process.env.NEXT_PUBLIC_MATOMO_SCRIPT_URL || 'https://matomo.globoexpats.com/js/container_EKgRf38T.js'

    if (s && s.parentNode) {
      s.parentNode.insertBefore(g, s)
    }
  }, [])

  return null
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _mtm?: any[]
  }
}
