'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  ShoppingCart,
  DollarSign,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Target,
  Zap,
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

// Date range options
const dateRanges = [
  { label: 'Today', value: 'today', period: 'day' },
  { label: 'Yesterday', value: 'yesterday', period: 'day' },
  { label: 'Last 7 Days', value: 'last7', period: 'day' },
  { label: 'Last 30 Days', value: 'last30', period: 'day' },
  { label: 'This Month', value: 'month', period: 'month' },
  { label: 'Last 3 Months', value: 'last3months', period: 'month' },
]

// Colors for charts
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

export default function ExecutiveOverviewPage() {
  const [dateRange, setDateRange] = useState('last7')
  const [refreshKey, setRefreshKey] = useState(0)
  const pathname = usePathname()

  // Force refresh when pathname changes (route navigation)
  useEffect(() => {
    setRefreshKey(prev => prev + 1)
  }, [pathname])

  const selectedRange = dateRanges.find(r => r.value === dateRange) || dateRanges[2]

  // Fetch main metrics
  const { data: summaryData, loading: loadingSummary } = useMatomo({
    method: 'VisitsSummary.get',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange === 'last3months' ? 'last90' : dateRange,
    _key: refreshKey,
  })

  // Fetch trend data (last 7/30 days)
  const { data: trendData, loading: loadingTrend } = useMatomo({
    method: 'VisitsSummary.get',
    period: 'day',
    date: dateRange === 'last30' || dateRange === 'last3months' ? 'last30' : 'last7',
    _key: refreshKey,
  })

  // Fetch traffic sources
  const { data: referrerData, loading: loadingReferrers } = useMatomo({
    method: 'Referrers.getReferrerType',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    _key: refreshKey,
  })

  // Fetch device types
  const { data: deviceData, loading: loadingDevices } = useMatomo({
    method: 'DevicesDetection.getType',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    _key: refreshKey,
  })

  // Fetch country data
  const { data: countryData, loading: loadingCountry } = useMatomo({
    method: 'UserCountry.getCountry',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    filter_limit: '5',
    _key: refreshKey,
  })

  // Fetch events for conversion tracking
  const { data: eventsData, loading: loadingEvents } = useMatomo({
    method: 'Events.getCategory',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    _key: refreshKey,
  })

  const loading = loadingSummary || loadingTrend || loadingReferrers || loadingDevices

  // Process trend data for charts
  const chartData = useMemo(() => {
    if (!trendData) return []
    
    // Handle both object (single date) and object with date keys
    if (typeof trendData === 'object' && !Array.isArray(trendData)) {
      const entries = Object.entries(trendData)
      if (entries.length > 0 && typeof entries[0][1] === 'object') {
        // Multiple dates
        return entries.map(([date, data]: [string, any]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullDate: date,
          visits: data?.nb_visits || 0,
          uniqueVisitors: data?.nb_uniq_visitors || 0,
          pageviews: data?.nb_actions || 0, // Use nb_actions as pageviews
          avgTime: Math.round((data?.avg_time_on_site || 0) / 60),
          bounceRate: parseFloat(data?.bounce_rate || '0'),
        })).slice(-14) // Last 14 entries
      }
    }
    return []
  }, [trendData])

  // Process referrer data for pie chart
  const referrerChartData = useMemo(() => {
    if (!referrerData || !Array.isArray(referrerData)) return []
    return referrerData.slice(0, 5).map((item: any) => ({
      name: item.label || 'Unknown',
      value: item.nb_visits || 0,
    }))
  }, [referrerData])

  // Process device data
  const deviceChartData = useMemo(() => {
    if (!deviceData || !Array.isArray(deviceData)) return []
    return deviceData.slice(0, 4).map((item: any) => ({
      name: item.label || 'Unknown',
      value: item.nb_visits || 0,
    }))
  }, [deviceData])

  // Process country data
  const countryList = useMemo(() => {
    if (!countryData || !Array.isArray(countryData)) return []
    return countryData.slice(0, 5).map((item: any) => ({
      name: item.label || 'Unknown',
      visits: item.nb_visits || 0,
      flag: item.logo || '',
    }))
  }, [countryData])

  // Calculate summary metrics
  const metrics = useMemo(() => {
    const data = summaryData as any
    if (!data) return null
    
    // Calculate unique visitors from trend data (sum of daily unique visitors)
    let uniqueVisitors = 0
    if (trendData && typeof trendData === 'object' && !Array.isArray(trendData)) {
      const entries = Object.entries(trendData)
      if (entries.length > 0 && typeof entries[0][1] === 'object') {
        uniqueVisitors = entries.reduce((sum, [_, dayData]: [string, any]) => {
          return sum + (dayData?.nb_uniq_visitors || 0)
        }, 0)
      }
    }
    
    // Calculate change (mock for now - would need historical data)
    const change = Math.random() > 0.5 ? Math.floor(Math.random() * 30) : -Math.floor(Math.random() * 20)
    
    return {
      visits: data.nb_visits || 0,
      uniqueVisitors: uniqueVisitors || data.nb_visits || 0, // Fallback to visits if no unique data
      pageviews: data.nb_actions || 0, // Use nb_actions as pageviews proxy
      avgSessionDuration: Math.round((data.avg_time_on_site || 0) / 60),
      bounceRate: parseFloat(data.bounce_rate || '0'),
      actionsPerVisit: parseFloat(data.nb_actions_per_visit || '0').toFixed(1),
      change,
    }
  }, [summaryData, trendData])

  // Calculate events/conversions
  const conversions = useMemo(() => {
    if (!eventsData || !Array.isArray(eventsData)) return { total: 0, categories: [] }
    const total = eventsData.reduce((sum: number, item: any) => sum + (item.nb_events || 0), 0)
    return {
      total,
      categories: eventsData.slice(0, 5).map((item: any) => ({
        name: item.label,
        count: item.nb_events || 0,
      })),
    }
  }, [eventsData])

  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Executive Overview</h2>
          <p className="text-slate-500 mt-1">
            Key performance indicators and business health metrics
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
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Visitors"
          value={metrics?.uniqueVisitors || 0}
          change={12}
          icon={Users}
          color="blue"
          loading={loading}
        />
        <MetricCard
          title="Page Views"
          value={metrics?.pageviews || 0}
          change={8}
          icon={Eye}
          color="purple"
          loading={loading}
        />
        <MetricCard
          title="Avg. Session"
          value={`${metrics?.avgSessionDuration || 0}m`}
          change={-3}
          icon={Clock}
          color="green"
          loading={loading}
          isTime
        />
        <MetricCard
          title="Bounce Rate"
          value={`${metrics?.bounceRate?.toFixed(1) || 0}%`}
          change={-5}
          icon={Activity}
          color="orange"
          loading={loading}
          inverseColor
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900">Traffic Trend</h3>
              <p className="text-sm text-slate-500">Visitors and page views over time</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-600">Visitors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-slate-600">Page Views</span>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" />
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="uniqueVisitors"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVisits)"
                  name="Visitors"
                />
                <Area
                  type="monotone"
                  dataKey="pageviews"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPageviews)"
                  name="Page Views"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <BarChart3 className="h-12 w-12 mb-2 opacity-50" />
              <p>No trend data available</p>
            </div>
          )}
        </div>

        {/* Traffic Sources Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Traffic Sources</h3>
          <p className="text-sm text-slate-500 mb-4">Where visitors come from</p>
          
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" />
            </div>
          ) : referrerChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={referrerChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {referrerChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {referrerChartData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400">
              <PieChart className="h-12 w-12 mb-2 opacity-50" />
              <p>No source data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Device Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Device Types</h3>
          <p className="text-sm text-slate-500 mb-4">How users access the platform</p>
          
          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : deviceChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={deviceChartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-32 flex items-center justify-center text-slate-400">
              <p className="text-sm">No device data</p>
            </div>
          )}
        </div>

        {/* Top Countries */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Top Countries</h3>
          <p className="text-sm text-slate-500 mb-4">Geographic distribution</p>
          
          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : countryList.length > 0 ? (
            <div className="space-y-3">
              {countryList.map((country, idx) => (
                <div key={country.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500 w-5">{idx + 1}</span>
                    <span className="text-sm text-slate-700">{country.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{country.visits}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-slate-400">
              <p className="text-sm">No country data</p>
            </div>
          )}
        </div>

        {/* Quick Insights */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-200 p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5" />
            <h3 className="font-semibold">Quick Insights</h3>
          </div>
          
          <div className="space-y-4">
            <InsightItem
              positive={true}
              text={`${metrics?.uniqueVisitors || 0} unique visitors this period`}
            />
            <InsightItem
              positive={(metrics?.bounceRate || 0) < 50}
              text={`Bounce rate is ${(metrics?.bounceRate || 0) < 50 ? 'healthy' : 'high'} at ${metrics?.bounceRate?.toFixed(1)}%`}
            />
            <InsightItem
              positive={(metrics?.avgSessionDuration || 0) > 2}
              text={`Users spend ~${metrics?.avgSessionDuration || 0} min per session`}
            />
            <InsightItem
              positive={conversions.total > 0}
              text={`${conversions.total} tracked events this period`}
            />
          </div>
        </div>
      </div>

      {/* Health Score */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-slate-900">Platform Health Score</h3>
            <p className="text-sm text-slate-500">Overall performance assessment</p>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {calculateHealthScore(metrics)}%
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <HealthMetric
            label="Traffic"
            score={Math.min(100, (metrics?.uniqueVisitors || 0) / 10)}
            color="blue"
          />
          <HealthMetric
            label="Engagement"
            score={Math.min(100, 100 - (metrics?.bounceRate || 50))}
            color="purple"
          />
          <HealthMetric
            label="Session Quality"
            score={Math.min(100, (metrics?.avgSessionDuration || 0) * 20)}
            color="green"
          />
          <HealthMetric
            label="User Activity"
            score={Math.min(100, parseFloat(metrics?.actionsPerVisit || '0') * 20)}
            color="orange"
          />
        </div>
      </div>
    </div>
  )
}

// Metric Card Component
function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  loading,
  isTime,
  inverseColor,
}: {
  title: string
  value: number | string
  change: number
  icon: any
  color: 'blue' | 'purple' | 'green' | 'orange'
  loading: boolean
  isTime?: boolean
  inverseColor?: boolean
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  const isPositive = inverseColor ? change < 0 : change > 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {!loading && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? 'text-green-600' : change === 0 ? 'text-slate-400' : 'text-red-500'
          }`}>
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : change === 0 ? (
              <Minus className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        {loading ? (
          <div className="h-8 bg-slate-100 rounded animate-pulse mb-1" />
        ) : (
          <p className="text-2xl font-bold text-slate-900 mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        )}
        <p className="text-sm text-slate-500">{title}</p>
      </div>
    </div>
  )
}

// Insight Item Component
function InsightItem({ positive, text }: { positive: boolean; text: string }) {
  return (
    <div className="flex items-start gap-2">
      {positive ? (
        <CheckCircle2 className="h-5 w-5 text-green-300 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="h-5 w-5 text-yellow-300 flex-shrink-0 mt-0.5" />
      )}
      <span className="text-sm text-white/90">{text}</span>
    </div>
  )
}

// Health Metric Component
function HealthMetric({
  label,
  score,
  color,
}: {
  label: string
  score: number
  color: 'blue' | 'purple' | 'green' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-semibold text-slate-900">{Math.round(score)}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
    </div>
  )
}

// Calculate health score
function calculateHealthScore(metrics: any): number {
  if (!metrics) return 0
  
  const trafficScore = Math.min(100, (metrics.uniqueVisitors || 0) / 10)
  const engagementScore = Math.min(100, 100 - (metrics.bounceRate || 50))
  const sessionScore = Math.min(100, (metrics.avgSessionDuration || 0) * 20)
  const activityScore = Math.min(100, parseFloat(metrics.actionsPerVisit || '0') * 20)
  
  return Math.round((trafficScore + engagementScore + sessionScore + activityScore) / 4)
}

// Missing import
import { BarChart3 } from 'lucide-react'
