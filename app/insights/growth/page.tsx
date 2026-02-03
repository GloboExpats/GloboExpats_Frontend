'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  Target,
  Rocket,
  Calendar,
  RefreshCw,
  Zap,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Users,
  ShoppingBag,
  Eye,
  MousePointer,
  Star,
  Percent,
  Activity,
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
  LineChart,
  Line,
  Legend,
  ComposedChart,
} from 'recharts'

const dateRanges = [
  { label: 'Last 7 Days', value: 'last7', period: 'day' },
  { label: 'Last 30 Days', value: 'last30', period: 'day' },
  { label: 'This Month', value: 'month', period: 'month' },
]

export default function GrowthStrategyPage() {
  const [dateRange, setDateRange] = useState('last30')
  const [refreshKey, setRefreshKey] = useState(0)
  const pathname = usePathname()

  // Force refresh when pathname changes (route navigation)
  useEffect(() => {
    setRefreshKey(prev => prev + 1)
  }, [pathname])

  const selectedRange = dateRanges.find(r => r.value === dateRange) || dateRanges[0]

  // Fetch current period data
  const { data: currentData, loading: loadingCurrent } = useMatomo({
    method: 'VisitsSummary.get',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    _key: refreshKey,
  })

  // Fetch trend data for growth chart
  const { data: trendData, loading: loadingTrend } = useMatomo({
    method: 'VisitsSummary.get',
    period: 'day',
    date: dateRange === 'last30' ? 'last30' : 'last7',
    _key: refreshKey,
  })

  // Fetch visitor frequency
  const { data: visitorFrequency, loading: loadingFreq } = useMatomo({
    method: 'VisitFrequency.get',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    _key: refreshKey,
  })

  // Fetch entry pages
  const { data: entryPages, loading: loadingEntry } = useMatomo({
    method: 'Actions.getEntryPageUrls',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    filter_limit: '10',
    flat: '1',
    _key: refreshKey,
  })

  // Fetch exit pages
  const { data: exitPages, loading: loadingExit } = useMatomo({
    method: 'Actions.getExitPageUrls',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    filter_limit: '10',
    flat: '1',
    _key: refreshKey,
  })

  // Fetch referrers
  const { data: referrers, loading: loadingReferrers } = useMatomo({
    method: 'Referrers.getAll',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    _key: refreshKey,
  })

  // Fetch goals
  const { data: goalsData, loading: loadingGoals } = useMatomo({
    method: 'Goals.get',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    _key: refreshKey,
  })

  // Fetch previous period for comparison
  const { data: previousData, loading: loadingPrevious } = useMatomo({
    method: 'VisitsSummary.get',
    period: 'range',
    date: dateRange === 'last7' ? 'previous7' : dateRange === 'last30' ? 'previous30' : 'previousMonth',
    _key: refreshKey,
  })

  const loading = loadingCurrent || loadingTrend || loadingReferrers

  // Calculate growth metrics
  const growthMetrics = useMemo(() => {
    const current = currentData as any
    const previous = previousData as any
    
    if (!current) return null

    const calculateGrowth = (currentVal: number, prevVal: number) => {
      if (!prevVal || prevVal === 0) return currentVal > 0 ? 100 : 0
      return ((currentVal - prevVal) / prevVal * 100)
    }

    const currentVisits = current.nb_visits || 0
    const prevVisits = previous?.nb_visits || 0
    const currentPageviews = current.nb_actions || 0 // Use nb_actions as pageviews
    const prevPageviews = previous?.nb_actions || 0
    const currentActions = current.nb_actions || 0
    const prevActions = previous?.nb_actions || 0
    
    // Calculate unique visitors from trend data
    let currentUnique = 0
    if (trendData && typeof trendData === 'object' && !Array.isArray(trendData)) {
      const entries = Object.entries(trendData)
      if (entries.length > 0 && typeof entries[0][1] === 'object') {
        currentUnique = entries.reduce((sum, [_, dayData]: [string, any]) => {
          return sum + (dayData?.nb_uniq_visitors || 0)
        }, 0)
      }
    }
    const prevUnique = previous?.nb_visits || 0 // Fallback

    return {
      visits: currentVisits,
      visitGrowth: calculateGrowth(currentVisits, prevVisits),
      pageviews: currentPageviews,
      pageviewGrowth: calculateGrowth(currentPageviews, prevPageviews),
      actions: currentActions,
      actionGrowth: calculateGrowth(currentActions, prevActions),
      uniqueVisitors: currentUnique || currentVisits,
      uniqueGrowth: calculateGrowth(currentUnique || currentVisits, prevUnique),
      avgTime: Math.round((current.avg_time_on_site || 0) / 60),
      bounceRate: parseFloat(current.bounce_rate || '0'),
      actionsPerVisit: parseFloat(current.nb_actions_per_visit || '0').toFixed(1),
    }
  }, [currentData, previousData, trendData])

  // Process growth trend data
  const growthTrend = useMemo(() => {
    if (!trendData || typeof trendData !== 'object') return []
    
    const entries = Object.entries(trendData)
    if (entries.length > 0 && typeof entries[0][1] === 'object') {
      let cumulativeVisits = 0
      return entries.map(([date, data]: [string, any]) => {
        cumulativeVisits += data?.nb_visits || 0
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          visits: data?.nb_visits || 0,
          pageviews: data?.nb_actions || 0, // Use nb_actions as pageviews
          cumulative: cumulativeVisits,
        }
      })
    }
    return []
  }, [trendData])

  // Calculate moving average
  const growthTrendWithMA = useMemo(() => {
    if (growthTrend.length < 3) return growthTrend
    
    return growthTrend.map((item, index) => {
      if (index < 2) return { ...item, movingAvg: item.visits }
      const sum = growthTrend.slice(index - 2, index + 1).reduce((acc, d) => acc + d.visits, 0)
      return { ...item, movingAvg: Math.round(sum / 3) }
    })
  }, [growthTrend])

  // Process entry pages
  const topEntryPages = useMemo(() => {
    if (!entryPages || !Array.isArray(entryPages)) return []
    return entryPages.slice(0, 5).map((page: any) => ({
      name: page.label?.split('/').slice(-1)[0] || page.label || 'Unknown',
      visits: page.entry_nb_visits || 0,
      bounceRate: parseFloat(page.entry_bounce_rate || '0'),
    }))
  }, [entryPages])

  // Process exit pages
  const topExitPages = useMemo(() => {
    if (!exitPages || !Array.isArray(exitPages)) return []
    return exitPages.slice(0, 5).map((page: any) => ({
      name: page.label?.split('/').slice(-1)[0] || page.label || 'Unknown',
      exits: page.exit_nb_visits || 0,
      exitRate: parseFloat(page.exit_rate || '0'),
    }))
  }, [exitPages])

  // Process referrer data for channel distribution
  const channelData = useMemo(() => {
    if (!referrers || !Array.isArray(referrers)) return []
    
    const channels: { [key: string]: number } = {}
    referrers.forEach((ref: any) => {
      const type = ref.referrer_type || 'Unknown'
      channels[type] = (channels[type] || 0) + (ref.nb_visits || 0)
    })
    
    return Object.entries(channels).map(([name, visits]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      visits,
    })).sort((a, b) => b.visits - a.visits)
  }, [referrers])

  // Calculate opportunity score
  const opportunityScore = useMemo(() => {
    const freq = visitorFrequency as any
    if (!freq || !growthMetrics) return 50

    const returningRatio = freq.nb_visits_returning / (freq.nb_visits_returning + freq.nb_visits_new + 1)
    const growthFactor = Math.min(100, Math.max(0, growthMetrics.visitGrowth + 50))
    const engagementFactor = Math.min(100, parseFloat(growthMetrics.actionsPerVisit) * 15)
    const retentionFactor = Math.min(100, returningRatio * 200)

    return Math.round((growthFactor * 0.3 + engagementFactor * 0.4 + retentionFactor * 0.3))
  }, [visitorFrequency, growthMetrics])

  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Growth & Strategy</h2>
          <p className="text-slate-500 mt-1">
            Growth trends, opportunities, and strategic performance indicators
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

      {/* Growth KPIs with Comparison */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GrowthCard
          title="Total Visits"
          value={growthMetrics?.visits || 0}
          growth={growthMetrics?.visitGrowth || 0}
          icon={Users}
          loading={loading}
        />
        <GrowthCard
          title="Unique Visitors"
          value={growthMetrics?.uniqueVisitors || 0}
          growth={growthMetrics?.uniqueGrowth || 0}
          icon={Eye}
          loading={loading}
        />
        <GrowthCard
          title="Page Views"
          value={growthMetrics?.pageviews || 0}
          growth={growthMetrics?.pageviewGrowth || 0}
          icon={MousePointer}
          loading={loading}
        />
        <GrowthCard
          title="Total Actions"
          value={growthMetrics?.actions || 0}
          growth={growthMetrics?.actionGrowth || 0}
          icon={Activity}
          loading={loading}
        />
      </div>

      {/* Opportunity Score */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-6 w-6" />
              <h3 className="text-xl font-bold">Growth Opportunity Score</h3>
            </div>
            <p className="text-violet-100 text-sm">
              Based on traffic growth, user engagement, and retention metrics
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold">{opportunityScore}</div>
              <div className="text-violet-200 text-sm">out of 100</div>
            </div>
            <div className="hidden md:block h-16 w-px bg-white/20" />
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${opportunityScore >= 70 ? 'bg-green-400' : opportunityScore >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`} />
                <span className="text-violet-100">
                  {opportunityScore >= 70 ? 'High growth potential' : opportunityScore >= 40 ? 'Moderate opportunity' : 'Needs attention'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Trend Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-1">Growth Trend</h3>
        <p className="text-sm text-slate-500 mb-4">Daily visits with 3-day moving average</p>
        
        {loading ? (
          <div className="h-72 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" />
          </div>
        ) : growthTrendWithMA.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={growthTrendWithMA}>
              <defs>
                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="visits"
                stroke="#8b5cf6"
                fill="url(#colorVisits)"
                strokeWidth={2}
                name="Daily Visits"
              />
              <Line
                type="monotone"
                dataKey="movingAvg"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="3-Day Avg"
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-72 flex items-center justify-center text-slate-400">
            <p>No trend data available</p>
          </div>
        )}
      </div>

      {/* Traffic Channels & Entry/Exit Points */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Traffic Channels</h3>
          </div>
          
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : channelData.length > 0 ? (
            <div className="space-y-3">
              {channelData.map((channel, index) => {
                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500']
                const total = channelData.reduce((sum, c) => sum + c.visits, 0)
                const percentage = total > 0 ? ((channel.visits / total) * 100).toFixed(1) : 0
                return (
                  <div key={channel.name} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">{channel.name}</span>
                        <span className="text-sm text-slate-500">{percentage}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <p className="text-sm">No channel data</p>
            </div>
          )}
        </div>

        {/* Top Entry Points */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpRight className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-900">Entry Points</h3>
          </div>
          
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : topEntryPages.length > 0 ? (
            <div className="space-y-3">
              {topEntryPages.map((page) => (
                <div key={page.name} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 truncate max-w-32">{page.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium text-slate-900">{page.visits}</span>
                    <span className={`text-xs ml-2 ${page.bounceRate > 50 ? 'text-red-500' : 'text-green-500'}`}>
                      {page.bounceRate.toFixed(0)}% bounce
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <p className="text-sm">No entry data</p>
            </div>
          )}
        </div>

        {/* Top Exit Points */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowDownRight className="h-5 w-5 text-rose-600" />
            <h3 className="font-semibold text-slate-900">Exit Points</h3>
          </div>
          
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : topExitPages.length > 0 ? (
            <div className="space-y-3">
              {topExitPages.map((page) => (
                <div key={page.name} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 truncate max-w-32">{page.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium text-slate-900">{page.exits}</span>
                    <span className="text-xs text-rose-500 ml-2">{page.exitRate.toFixed(0)}% exit</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <p className="text-sm">No exit data</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              parseFloat(growthMetrics?.actionsPerVisit || '0') >= 3 
                ? 'bg-green-100 text-green-600' 
                : 'bg-yellow-100 text-yellow-600'
            }`}>
              {parseFloat(growthMetrics?.actionsPerVisit || '0') >= 3 ? 'Good' : 'Average'}
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{growthMetrics?.actionsPerVisit}</p>
          <p className="text-sm text-slate-500">Actions per Visit</p>
          <p className="text-xs text-slate-400 mt-2">
            {parseFloat(growthMetrics?.actionsPerVisit || '0') >= 3 
              ? 'Users are highly engaged'
              : 'Try improving content quality'
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Percent className="h-5 w-5" />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              (growthMetrics?.bounceRate || 0) < 50 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {(growthMetrics?.bounceRate || 0) < 50 ? 'Good' : 'High'}
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{growthMetrics?.bounceRate?.toFixed(1)}%</p>
          <p className="text-sm text-slate-500">Bounce Rate</p>
          <p className="text-xs text-slate-400 mt-2">
            {(growthMetrics?.bounceRate || 0) < 50 
              ? 'Landing pages are effective'
              : 'Improve landing page relevance'
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Target className="h-5 w-5" />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              (growthMetrics?.avgTime || 0) >= 2 
                ? 'bg-green-100 text-green-600' 
                : 'bg-yellow-100 text-yellow-600'
            }`}>
              {(growthMetrics?.avgTime || 0) >= 2 ? 'Good' : 'Low'}
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{growthMetrics?.avgTime}m</p>
          <p className="text-sm text-slate-500">Avg. Session Duration</p>
          <p className="text-xs text-slate-400 mt-2">
            {(growthMetrics?.avgTime || 0) >= 2 
              ? 'Content keeps users engaged'
              : 'Consider adding richer content'
            }
          </p>
        </div>
      </div>

      {/* Strategic Insights */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5" />
          <h3 className="font-semibold">Strategic Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white/90 mb-2">Growth Momentum</h4>
            <p className="text-sm text-white/70">
              {(growthMetrics?.visitGrowth || 0) > 10
                ? `Strong growth of ${(growthMetrics?.visitGrowth || 0).toFixed(1)}% - keep your current strategy!`
                : (growthMetrics?.visitGrowth || 0) > 0
                  ? `Moderate growth of ${(growthMetrics?.visitGrowth || 0).toFixed(1)}% - look for optimization opportunities`
                  : `Traffic declined ${Math.abs(growthMetrics?.visitGrowth || 0).toFixed(1)}% - review acquisition channels`
              }
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white/90 mb-2">Channel Focus</h4>
            <p className="text-sm text-white/70">
              {channelData.length > 0
                ? `${channelData[0]?.name} drives most traffic - consider diversifying channels`
                : 'Set up channel tracking to optimize acquisition'
              }
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white/90 mb-2">Conversion Path</h4>
            <p className="text-sm text-white/70">
              {topExitPages.length > 0 && topExitPages[0]?.exitRate > 50
                ? `High exits from "${topExitPages[0]?.name}" - optimize this page`
                : 'User flow looks healthy - monitor for changes'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Growth Card Component
function GrowthCard({
  title,
  value,
  growth,
  icon: Icon,
  loading,
}: {
  title: string
  value: number
  growth: number
  icon: any
  loading: boolean
}) {
  const isPositive = growth >= 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
          <Icon className="h-5 w-5" />
        </div>
        {!loading && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{Math.abs(growth).toFixed(1)}%</span>
          </div>
        )}
      </div>
      {loading ? (
        <>
          <div className="h-8 bg-slate-100 rounded animate-pulse mb-1" />
          <div className="h-4 bg-slate-50 rounded animate-pulse w-2/3" />
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-slate-900 mb-1">{value.toLocaleString()}</p>
          <p className="text-sm text-slate-500">{title}</p>
        </>
      )}
    </div>
  )
}
