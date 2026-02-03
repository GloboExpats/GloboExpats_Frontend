'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// Matomo URLs
const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL || 'https://matomo.globoexpats.com'
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID || '1'
const MATOMO_CONTAINER_URL = process.env.NEXT_PUBLIC_MATOMO_SCRIPT_URL || 'https://matomo.globoexpats.com/js/container_EKgRf38T.js'

// Initialize Matomo arrays immediately (before React renders)
if (typeof window !== 'undefined') {
  window._mtm = window._mtm || []
  window._paq = window._paq || []
  window._matomoInitialized = window._matomoInitialized || false
}

export function MatomoTagManager() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstRender = useRef(true)
  const isInitialized = useRef(false)

  // Initialize Matomo on first render
  useEffect(() => {
    // Prevent double initialization
    if (isInitialized.current) {
      console.log('[Matomo] Already initialized, skipping')
      return
    }
    
    isInitialized.current = true
    
    // Initialize Matomo Tag Manager data layer
    const _mtm = (window._mtm = window._mtm || [])
    _mtm.push({ 'mtm.startTime': new Date().getTime(), event: 'mtm.Start' })

    // Initialize Matomo Tracker (_paq) with tracker configuration
    // This ensures tracking works even if Tag Manager is slow to load
    const _paq = (window._paq = window._paq || [])
    
    // Only set tracker URL and site ID if not already set
    if (!window._matomoInitialized) {
      window._matomoInitialized = true
      
      // Required: Set tracker URL and site ID first
      _paq.push(['setTrackerUrl', `${MATOMO_URL}/matomo.php`])
      _paq.push(['setSiteId', MATOMO_SITE_ID])
      
      // Enable features
      _paq.push(['enableLinkTracking'])
      _paq.push(['enableHeartBeatTimer']) // Better time-on-page tracking
      
      // Track the initial page view
      _paq.push(['trackPageView'])

      // Load Tag Manager container (handles additional tags and triggers)
      const d = document
      const g = d.createElement('script')
      const s = d.getElementsByTagName('script')[0]

      g.async = true
      g.src = MATOMO_CONTAINER_URL

      if (s && s.parentNode) {
        s.parentNode.insertBefore(g, s)
      }

      // Also load the matomo.js tracker for direct _paq calls
      const tracker = d.createElement('script')
      tracker.async = true
      tracker.src = `${MATOMO_URL}/matomo.js`
      if (s && s.parentNode) {
        s.parentNode.insertBefore(tracker, s)
      }
      
      console.log('[Matomo] Initialized with:', { url: MATOMO_URL, siteId: MATOMO_SITE_ID })
    }
  }, [])

  // Track SPA navigation (page changes)
  useEffect(() => {
    // Skip the first render (already tracked in initialization)
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const _paq = (window._paq = window._paq || [])
    
    // Build full URL for SPA tracking
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    
    // Set the custom URL and track page view
    _paq.push(['setCustomUrl', url])
    _paq.push(['setDocumentTitle', document.title])
    _paq.push(['trackPageView'])
    
    console.log('[Matomo] SPA Page view tracked:', url)
  }, [pathname, searchParams])

  return null
}

/**
 * Set the user ID for Matomo tracking
 * IMPORTANT: Must be called BEFORE trackPageView to associate the page view with the user
 * This is required for the Users tab in analytics to work
 */
export function setMatomoUserId(userId: string | undefined): void {
  if (typeof window === 'undefined') return
  
  const _paq = (window._paq = window._paq || [])
  const _mtm = (window._mtm = window._mtm || [])
  
  if (userId) {
    // Set user ID - this will be associated with all subsequent tracking requests
    _paq.push(['setUserId', userId])
    // Track a page view to register the user ID immediately
    _paq.push(['trackPageView'])
    // Push to data layer for Tag Manager triggers
    _mtm.push({ event: 'user_login', userId })
    console.log('[Matomo] User ID set and page view tracked:', userId)
  } else {
    // Reset user ID on logout - per Matomo docs
    _paq.push(['resetUserId'])
    // Force a new visit for anonymous tracking
    _paq.push(['appendToTrackingUrl', 'new_visit=1'])
    _paq.push(['trackPageView'])
    // Reset the tracking URL for subsequent requests
    _paq.push(['appendToTrackingUrl', ''])
    _mtm.push({ event: 'user_logout' })
    console.log('[Matomo] User ID reset, new visit created')
  }
}

/**
 * Track a product view event
 * Uses Matomo's Ecommerce tracking for product views
 */
export function trackProductView(productId: string | number, productName?: string, categoryName?: string, price?: number): void {
  if (typeof window === 'undefined') return
  
  const _paq = (window._paq = window._paq || [])
  const _mtm = (window._mtm = window._mtm || [])
  
  // Use Matomo's Ecommerce View tracking (proper method per docs)
  // setEcommerceView must be followed by trackPageView
  _paq.push(['setEcommerceView', 
    String(productId),           // Product SKU
    productName || '',           // Product Name
    categoryName || '',          // Category Name (can be array for multiple)
    price || 0                   // Price
  ])
  _paq.push(['trackPageView'])
  
  // Also track as Event for flexibility in reports
  // Format: trackEvent(category, action, name, value)
  _paq.push(['trackEvent', 'Product', 'View', productName || String(productId), price || 0])
  
  // Push to Tag Manager data layer
  _mtm.push({ 
    event: 'product_view', 
    ecommerce: {
      product_id: String(productId),
      product_name: productName || '',
      category: categoryName || '',
      price: price || 0
    }
  })
  
  console.log('[Matomo] Product view tracked:', { productId, productName, categoryName, price })
}

/**
 * Track add to cart event
 * Uses Matomo's Ecommerce tracking
 */
export function trackAddToCart(productId: string | number, productName?: string, categoryName?: string, price?: number, quantity?: number): void {
  if (typeof window === 'undefined') return
  
  const _paq = (window._paq = window._paq || [])
  const _mtm = (window._mtm = window._mtm || [])
  
  const qty = quantity || 1
  const itemPrice = price || 0
  
  // Add item to Matomo ecommerce cart
  // addEcommerceItem(productSKU, productName, productCategory, price, quantity)
  _paq.push(['addEcommerceItem', 
    String(productId),           // SKU
    productName || '',           // Name
    categoryName || '',          // Category
    itemPrice,                   // Unit price
    qty                          // Quantity
  ])
  
  // Track cart update with current cart total
  // In a real implementation, you'd sum all items in cart
  _paq.push(['trackEcommerceCartUpdate', itemPrice * qty])
  
  // Also track as Event for reports
  _paq.push(['trackEvent', 'Product', 'AddToCart', productName || String(productId), itemPrice])
  
  // Push to Tag Manager data layer
  _mtm.push({ 
    event: 'add_to_cart', 
    ecommerce: {
      product_id: String(productId),
      product_name: productName || '',
      category: categoryName || '',
      price: itemPrice,
      quantity: qty
    }
  })
  
  console.log('[Matomo] Add to cart tracked:', { productId, productName, price: itemPrice, quantity: qty })
}

/**
 * Track an ecommerce purchase/order
 */
export function trackPurchase(orderId: string, grandTotal: number, subTotal?: number, tax?: number, shipping?: number, discount?: number): void {
  if (typeof window === 'undefined') return
  
  const _paq = (window._paq = window._paq || [])
  const _mtm = (window._mtm = window._mtm || [])
  
  // Track ecommerce order
  // trackEcommerceOrder(orderId, grandTotal, subTotal, tax, shipping, discount)
  _paq.push(['trackEcommerceOrder',
    orderId,
    grandTotal,
    subTotal,
    tax,
    shipping,
    discount
  ])
  
  // Also track as Event
  _paq.push(['trackEvent', 'Ecommerce', 'Purchase', orderId, grandTotal])
  
  // Push to Tag Manager data layer
  _mtm.push({ 
    event: 'purchase',
    ecommerce: {
      transaction_id: orderId,
      value: grandTotal,
      subtotal: subTotal,
      tax: tax,
      shipping: shipping,
      discount: discount
    }
  })
  
  console.log('[Matomo] Purchase tracked:', { orderId, grandTotal })
}

/**
 * Track a custom event
 * Format: trackEvent(category, action, name, value)
 */
export function trackEvent(category: string, action: string, name?: string, value?: number): void {
  if (typeof window === 'undefined') return
  
  const _paq = (window._paq = window._paq || [])
  const _mtm = (window._mtm = window._mtm || [])
  
  // Track via Matomo tracker
  _paq.push(['trackEvent', category, action, name, value])
  
  // Push to Tag Manager data layer
  _mtm.push({ 
    event: action, 
    eventCategory: category,
    eventAction: action,
    eventName: name,
    eventValue: value 
  })
  
  console.log('[Matomo] Event tracked:', { category, action, name, value })
}

/**
 * Track a page view (for SPA navigation)
 */
export function trackPageView(customTitle?: string, customUrl?: string): void {
  if (typeof window === 'undefined') return
  
  const _paq = (window._paq = window._paq || [])
  
  if (customUrl) {
    _paq.push(['setCustomUrl', customUrl])
  }
  if (customTitle) {
    _paq.push(['setDocumentTitle', customTitle])
  }
  
  _paq.push(['trackPageView'])
  
  console.log('[Matomo] Page view tracked:', { title: customTitle, url: customUrl })
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _mtm?: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _paq?: any[]
  }
}
