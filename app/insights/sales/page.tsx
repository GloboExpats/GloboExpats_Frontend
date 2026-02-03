'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  Target,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react'
import { useMatomo } from '@/hooks/use-matomo'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'

const dateRanges = [
  { label: 'Last 7 Days', value: 'last7', period: 'day' },
  { label: 'Last 30 Days', value: 'last30', period: 'day' },
  { label: 'This Month', value: 'month', period: 'month' },
  { label: 'Last 3 Months', value: 'last3months', period: 'month' },
]

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899']

export default function SalesInsightsPage() {
  const [dateRange, setDateRange] = useState('last7')
  const [refreshKey, setRefreshKey] = useState(0)
  const pathname = usePathname()

  // Force refresh when pathname changes (route navigation)
  useEffect(() => {
    setRefreshKey(prev => prev + 1)
  }, [pathname])

  const selectedRange = dateRanges.find(r => r.value === dateRange) || dateRanges[0]

  // Fetch events (product interactions)
  const { data: eventsData, loading: loadingEvents } = useMatomo({
    method: 'Events.getCategory',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange === 'last3months' ? 'last90' : dateRange,
    _key: refreshKey,
  })

  // Fetch event actions
  const { data: eventActions, loading: loadingActions } = useMatomo({
    method: 'Events.getAction',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    _key: refreshKey,
  })

  // Fetch product pages
  const { data: productPages, loading: loadingPages } = useMatomo({
    method: 'Actions.getPageUrls',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    flat: '1',
    filter_limit: '50',
    _key: refreshKey,
  })

  // Fetch goals/conversions
  const { data: goalsData, loading: loadingGoals } = useMatomo({
    method: 'Goals.get',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    _key: refreshKey,
  })

  // Fetch visits summary for conversion rate calculation
  const { data: visitsData, loading: loadingVisits } = useMatomo({
    method: 'VisitsSummary.get',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    _key: refreshKey,
  })

  // Fetch trend data
  const { data: trendData, loading: loadingTrend } = useMatomo({
    method: 'Events.getAction',
    period: 'day',
    date: dateRange === 'last30' || dateRange === 'last3months' ? 'last30' : 'last7',
    _key: refreshKey,
  })

  const loading = loadingEvents || loadingActions || loadingPages || loadingVisits

  // Process events data
  const productEvents = useMemo(() => {
    if (!eventsData || !Array.isArray(eventsData)) return []
    return eventsData
      .filter((item: any) => item.label?.toLowerCase().includes('product') || item.label?.toLowerCase().includes('ecommerce'))
      .map((item: any) => ({
        name: item.label,
        events: item.nb_events || 0,
        visits: item.nb_visits || 0,
      }))
  }, [eventsData])

  // Process actions (views, add to cart, purchases)
  const salesActions = useMemo(() => {
    if (!eventActions || !Array.isArray(eventActions)) return { views: 0, addToCart: 0, purchases: 0, clicks: 0 }
    
    const views = eventActions.find((a: any) => 
      a.label?.toLowerCase().includes('view') || a.label?.toLowerCase().includes('product_view')
    )?.nb_events || 0
    
    const addToCart = eventActions.find((a: any) => 
      a.label?.toLowerCase().includes('cart') || a.label?.toLowerCase().includes('add')
    )?.nb_events || 0
    
    const purchases = eventActions.find((a: any) => 
      a.label?.toLowerCase().includes('purchase') || a.label?.toLowerCase().includes('order') || a.label?.toLowerCase().includes('buy')
    )?.nb_events || 0
    
    const clicks = eventActions.find((a: any) => 
      a.label?.toLowerCase().includes('click')
    )?.nb_events || 0
    
    return { views, addToCart, purchases, clicks }
  }, [eventActions])

  // Process product pages
  const topProducts = useMemo(() => {
    if (!productPages || !Array.isArray(productPages)) return []
    return productPages
      .filter((page: any) => page.label?.includes('/product/'))
      .slice(0, 10)
      .map((page: any) => ({
        name: page.label?.split('/product/')[1]?.split('/')[0] || page.label,
        pageviews: page.nb_hits || 0,
        visitors: page.nb_visits || 0,
        avgTime: page.avg_time_on_page || 0,
      }))
  }, [productPages])

  // Calculate conversion funnel
  const conversionFunnel = useMemo(() => {
    const visits = (visitsData as any)?.nb_visits || 0
    const views = salesActions.views || topProducts.reduce((sum, p) => sum + p.pageviews, 0)
    const carts = salesActions.addToCart
    const purchases = salesActions.purchases
    
    return [
      { stage: 'Visitors', value: visits, percentage: 100 },
      { stage: 'Product Views', value: views, percentage: visits > 0 ? (views / visits * 100) : 0 },
      { stage: 'Add to Cart', value: carts, percentage: visits > 0 ? (carts / visits * 100) : 0 },
      { stage: 'Purchase', value: purchases, percentage: visits > 0 ? (purchases / visits * 100) : 0 },
    ]
  }, [visitsData, salesActions, topProducts])

  // Calculate metrics
  const metrics = useMemo(() => {
    const visits = (visitsData as any)?.nb_visits || 0
    const conversionRate = visits > 0 && salesActions.purchases > 0 
      ? ((salesActions.purchases / visits) * 100).toFixed(2) 
      : '0.00'
    const cartAbandonmentRate = salesActions.addToCart > 0 
      ? (((salesActions.addToCart - salesActions.purchases) / salesActions.addToCart) * 100).toFixed(1)
      : '0'
    
    return {
      totalViews: salesActions.views || topProducts.reduce((sum, p) => sum + p.pageviews, 0),
      addToCart: salesActions.addToCart,
      purchases: salesActions.purchases,
      conversionRate,
      cartAbandonmentRate,
      totalVisits: visits,
    }
  }, [salesActions, topProducts, visitsData])

  // Process goals data
  const goals = useMemo(() => {
    if (!goalsData || typeof goalsData !== 'object') return []
    // Goals API returns object with goal IDs as keys
    const goalEntries = Object.entries(goalsData)
    return goalEntries
      .filter(([key, value]) => typeof value === 'object' && value !== null)
      .map(([key, value]: [string, any]) => ({
        id: key,
        name: value.name || `Goal ${key}`,
        conversions: value.nb_conversions || 0,
        revenue: value.revenue || 0,
      }))
  }, [goalsData])

  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sales & Revenue</h2>
          <p className="text-slate-500 mt-1">
            Product performance, conversions, and sales funnel
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <Calendar className="h-4 w-4 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm font-medium text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Product Views"
          value={metrics.totalViews}
          icon={Eye}
          color="blue"
          loading={loading}
        />
        <MetricCard
          title="Add to Cart"
          value={metrics.addToCart}
          icon={ShoppingCart}
          color="purple"
          loading={loading}
        />
        <MetricCard
          title="Purchases"
          value={metrics.purchases}
          icon={Package}
          color="green"
          loading={loading}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          icon={Target}
          color="orange"
          loading={loading}
          isPercentage
        />
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-1">Sales Funnel</h3>
        <p className="text-sm text-slate-500 mb-6">Track your customer journey from visit to purchase</p>
        
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" />
          </div>
        ) : (
          <div className="flex items-end justify-between gap-4">
            {conversionFunnel.map((stage, idx) => (
              <div key={stage.stage} className="flex-1 relative">
                {/* Bar */}
                <div className="relative">
                  <div
                    className={`rounded-t-lg transition-all duration-500 ${
                      idx === 0 ? 'bg-blue-500' :
                      idx === 1 ? 'bg-purple-500' :
                      idx === 2 ? 'bg-orange-500' :
                      'bg-green-500'
                    }`}
                    style={{ 
                      height: `${Math.max(20, stage.percentage * 1.5)}px`,
                      minHeight: '20px'
                    }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center">
                    <span className="text-lg font-bold text-slate-900">{stage.value.toLocaleString()}</span>
                  </div>
                </div>
                {/* Label */}
                <div className="text-center mt-3">
                  <p className="text-sm font-medium text-slate-700">{stage.stage}</p>
                  <p className="text-xs text-slate-400">{stage.percentage.toFixed(1)}%</p>
                </div>
                {/* Arrow between stages */}
                {idx < conversionFunnel.length - 1 && (
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 z-10">
                    <ArrowUpRight className="h-4 w-4 text-slate-300 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Funnel Insights */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">View → Cart Rate</p>
            <p className="text-lg font-bold text-purple-600">
              {metrics.totalViews > 0 ? ((metrics.addToCart / metrics.totalViews) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Cart → Purchase Rate</p>
            <p className="text-lg font-bold text-green-600">
              {metrics.addToCart > 0 ? ((metrics.purchases / metrics.addToCart) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Cart Abandonment</p>
            <p className="text-lg font-bold text-red-500">
              {metrics.cartAbandonmentRate}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Overall Conversion</p>
            <p className="text-lg font-bold text-blue-600">
              {metrics.conversionRate}%
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Top Products</h3>
              <p className="text-sm text-slate-500">Most viewed product pages</p>
            </div>
            <Award className="h-5 w-5 text-yellow-500" />
          </div>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.slice(0, 8).map((product, idx) => (
                <div key={product.name} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                      idx === 1 ? 'bg-slate-200 text-slate-600' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-sm text-slate-700 truncate">{product.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-500">{product.visitors} visitors</span>
                    <span className="font-semibold text-slate-900">{product.pageviews} views</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <Package className="h-12 w-12 mb-2 opacity-50" />
              <p>No product view data yet</p>
              <p className="text-xs mt-1">Product views will appear here</p>
            </div>
          )}
        </div>

        {/* Product Actions Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Product Interactions</h3>
          <p className="text-sm text-slate-500 mb-4">Breakdown of user actions</p>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={[
                { name: 'Views', value: salesActions.views || 0, fill: '#3b82f6' },
                { name: 'Clicks', value: salesActions.clicks || 0, fill: '#8b5cf6' },
                { name: 'Add to Cart', value: salesActions.addToCart || 0, fill: '#f59e0b' },
                { name: 'Purchases', value: salesActions.purchases || 0, fill: '#10b981' },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {[
                    { fill: '#3b82f6' },
                    { fill: '#8b5cf6' },
                    { fill: '#f59e0b' },
                    { fill: '#10b981' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Goals/Conversions */}
      {goals.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-slate-900">Goals & Conversions</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500 mb-1">{goal.name}</p>
                <p className="text-2xl font-bold text-slate-900">{goal.conversions}</p>
                {goal.revenue > 0 && (
                  <p className="text-sm text-green-600 mt-1">${goal.revenue.toLocaleString()} revenue</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales Insights */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5" />
          <h3 className="font-semibold">Sales Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white/90 mb-2">Conversion Opportunity</h4>
            <p className="text-sm text-white/70">
              {parseFloat(metrics.cartAbandonmentRate) > 50
                ? `High cart abandonment (${metrics.cartAbandonmentRate}%) - consider adding checkout incentives`
                : `Cart abandonment is ${metrics.cartAbandonmentRate}% - optimize to improve further`
              }
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white/90 mb-2">Product Interest</h4>
            <p className="text-sm text-white/70">
              {metrics.totalViews > 100
                ? `Strong product interest with ${metrics.totalViews} views this period`
                : `${metrics.totalViews} product views - drive more traffic to product pages`
              }
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white/90 mb-2">Sales Performance</h4>
            <p className="text-sm text-white/70">
              {metrics.purchases > 0
                ? `${metrics.purchases} purchases completed with ${metrics.conversionRate}% conversion rate`
                : 'Track purchases to measure sales performance'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Metric Card Component
function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  loading,
  isPercentage,
}: {
  title: string
  value: number | string
  icon: any
  color: 'blue' | 'purple' | 'green' | 'orange'
  loading: boolean
  isPercentage?: boolean
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {loading ? (
        <div className="h-8 bg-slate-100 rounded animate-pulse mb-1" />
      ) : (
        <p className="text-2xl font-bold text-slate-900 mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      )}
      <p className="text-sm text-slate-500">{title}</p>
    </div>
  )
}
