'use client'

import React, { useState, useMemo } from 'react'
import {
  Package,
  Search,
  Eye,
  ShoppingCart,
  TrendingUp,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  DollarSign,
  BarChart3,
  Tag,
  Clock,
  MousePointer,
} from 'lucide-react'
import { useMatomo } from '@/hooks/use-matomo'

interface ProductAnalyticsTabProps {
  period: string
  date: string
}

interface ProductData {
  label: string
  nb_visits?: number
  nb_actions?: number
  nb_events?: number
  nb_hits?: number
  sum_event_value?: number
  avg_event_value?: number
  [key: string]: unknown
}

interface EventData {
  label: string
  nb_visits?: number
  nb_events?: number
  sum_event_value?: number
  nb_events_with_value?: number
  avg_event_value?: number
  subtable?: EventData[]
  [key: string]: unknown
}

export default function ProductAnalyticsTab({ period, date }: ProductAnalyticsTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  // Use 'range' for better aggregated data when using date ranges like 'last7', 'last30'
  const effectivePeriod = date.includes('last') || date.includes('Month') || date.includes('Year') ? 'range' : period

  // Fetch event categories (to find product-related events)
  const { data: eventCategories, loading: loadingCategories } = useMatomo({
    method: 'Events.getCategory',
    period: effectivePeriod,
    date,
    filter_limit: '100',
    _key: refreshKey,
  })

  // Fetch event actions (product actions like view, add_to_cart, purchase)
  const { data: eventActions, loading: loadingActions } = useMatomo({
    method: 'Events.getAction',
    period: effectivePeriod,
    date,
    filter_limit: '100',
    _key: refreshKey,
  })

  // Fetch event names (specific product IDs/names)
  const { data: eventNames, loading: loadingNames } = useMatomo({
    method: 'Events.getName',
    period: effectivePeriod,
    date,
    filter_limit: '100',
    _key: refreshKey,
  })

  // Fetch page URLs filtered by /product/ path
  const { data: productPages, loading: loadingPages } = useMatomo({
    method: 'Actions.getPageUrls',
    period: effectivePeriod,
    date,
    filter_limit: '100',
    flat: '1',
    _key: refreshKey,
  })

  const loading = loadingCategories || loadingActions || loadingNames || loadingPages

  // Process categories
  const categories = useMemo(() => {
    if (!eventCategories) return []
    return Array.isArray(eventCategories) ? (eventCategories as EventData[]) : []
  }, [eventCategories])

  // Process actions (view, add_to_cart, purchase)
  const actions = useMemo(() => {
    if (!eventActions) return []
    return Array.isArray(eventActions) ? (eventActions as EventData[]) : []
  }, [eventActions])

  // Process product names/IDs
  const products = useMemo(() => {
    if (!eventNames) return []
    return Array.isArray(eventNames) ? (eventNames as ProductData[]) : []
  }, [eventNames])

  // Process product pages - filter URLs that contain 'product'
  const productPageViews = useMemo((): ProductData[] => {
    if (!productPages) return []
    const pages = Array.isArray(productPages) ? productPages : []
    // Filter to only include product pages and cast to ProductData
    return (pages as ProductData[]).filter((page) => 
      page.label?.toLowerCase().includes('product') || 
      page.label?.includes('/product/')
    )
  }, [productPages])

  // Filter products by search term
  const filteredProducts = useMemo(() => {
    const allProducts = [...products]
    if (!searchTerm) return allProducts
    const term = searchTerm.toLowerCase()
    return allProducts.filter((product) => 
      product.label?.toLowerCase().includes(term)
    )
  }, [products, searchTerm])

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const viewAction = actions.find((a) => 
      a.label?.toLowerCase().includes('view') || 
      a.label?.toLowerCase().includes('product_view')
    )
    const cartAction = actions.find((a) => 
      a.label?.toLowerCase().includes('cart') || 
      a.label?.toLowerCase().includes('add_to_cart')
    )
    const purchaseAction = actions.find((a) => 
      a.label?.toLowerCase().includes('purchase') || 
      a.label?.toLowerCase().includes('order') ||
      a.label?.toLowerCase().includes('buy')
    )
    const clickAction = actions.find((a) => 
      a.label?.toLowerCase().includes('click') || 
      a.label?.toLowerCase().includes('product_click')
    )

    return {
      totalViews: viewAction?.nb_events || productPageViews.reduce((sum, p) => sum + (p.nb_hits || 0), 0) || 0,
      addToCart: cartAction?.nb_events || 0,
      purchases: purchaseAction?.nb_events || 0,
      clicks: clickAction?.nb_events || 0,
      totalProducts: filteredProducts.length,
      avgValue: purchaseAction?.avg_event_value || 0,
    }
  }, [actions, productPageViews, filteredProducts])

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Product Analytics</h2>
          <p className="text-sm text-slate-500">
            Track product views, clicks, and conversions
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Eye className="h-4 w-4" />
            <span className="text-xs font-medium">Views</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{summaryStats.totalViews.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <MousePointer className="h-4 w-4" />
            <span className="text-xs font-medium">Clicks</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{summaryStats.clicks.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="text-xs font-medium">Add to Cart</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{summaryStats.addToCart.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium">Purchases</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{summaryStats.purchases.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600 mb-2">
            <Package className="h-4 w-4" />
            <span className="text-xs font-medium">Products</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{summaryStats.totalProducts.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-rose-600 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">Conversion</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {summaryStats.totalViews > 0 
              ? `${((summaryStats.purchases / summaryStats.totalViews) * 100).toFixed(1)}%`
              : '0%'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search products by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
      </div>

      {/* Event Actions (Product Actions) */}
      {actions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Product Actions
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {actions.slice(0, 10).map((action, index) => (
              <div key={action.label || index} className="flex items-center justify-between p-4 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{action.label || 'Unknown Action'}</p>
                    <p className="text-xs text-slate-500">{action.nb_visits || 0} visitors</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{(action.nb_events || 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-500">events</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Pages */}
      {productPageViews.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              Top Product Pages
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {productPageViews.slice(0, 15).map((page: ProductData, index: number) => (
              <div key={page.label || index} className="flex items-center justify-between p-4 hover:bg-slate-50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex-shrink-0">
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{page.label || 'Unknown Page'}</p>
                    <p className="text-xs text-slate-500">{page.nb_visits || 0} unique visitors</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-semibold text-slate-900">{(page.nb_hits || page.nb_actions || 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-500">views</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Package className="h-4 w-4 text-emerald-500" />
            Tracked Products
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
              <RefreshCw className="h-6 w-6 text-slate-400 animate-spin" />
            </div>
            <p className="text-sm text-slate-500">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
              <Package className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900">No products tracked yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {searchTerm
                ? 'Try a different search term'
                : 'Product tracking data will appear here once users interact with products. Make sure event tracking is configured in Matomo.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredProducts.slice(0, 20).map((product, index) => (
              <div key={product.label || index} className="flex items-center justify-between p-4 hover:bg-slate-50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-semibold text-sm shadow-sm flex-shrink-0">
                    {product.label?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{product.label || 'Unknown Product'}</p>
                    <p className="text-xs text-slate-500">
                      {product.nb_visits || 0} visitors • {product.nb_actions || product.nb_events || 0} interactions
                    </p>
                  </div>
                </div>
                {product.sum_event_value && (
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-semibold text-emerald-600">${product.sum_event_value.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">value</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Categories */}
      {categories.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Tag className="h-4 w-4 text-amber-500" />
              Event Categories
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {categories.slice(0, 10).map((category, index) => (
              <div key={category.label || index} className="flex items-center justify-between p-4 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600">
                    <Tag className="h-4 w-4" />
                  </div>
                  <p className="font-medium text-slate-900">{category.label || 'Unknown'}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{(category.nb_events || 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-500">events</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <Package className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900">Product Tracking Setup</h4>
            <p className="text-sm text-blue-700 mt-1">
              For detailed product analytics, configure Event Tracking in Matomo with categories like 
              &quot;product_view&quot;, &quot;add_to_cart&quot;, and &quot;purchase&quot;. You can also use Custom Dimensions 
              to track product IDs and names across all user interactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
