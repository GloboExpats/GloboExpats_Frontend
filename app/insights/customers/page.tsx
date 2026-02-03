'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Users,
  UserPlus,
  UserCheck,
  Heart,
  Calendar,
  RefreshCw,
  Clock,
  MapPin,
  Globe,
  TrendingUp,
  Star,
  Repeat,
  ArrowUp,
  ArrowDown,
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
]

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899']

export default function CustomerInsightsPage() {
  const [dateRange, setDateRange] = useState('last7')
  const [refreshKey, setRefreshKey] = useState(0)
  const pathname = usePathname()

  // Force refresh when pathname changes (route navigation)
  useEffect(() => {
    setRefreshKey(prev => prev + 1)
  }, [pathname])

  const selectedRange = dateRanges.find(r => r.value === dateRange) || dateRanges[0]

  // Fetch visit frequency
  const { data: visitFrequency, loading: loadingFreq } = useMatomo({
    method: 'VisitorInterest.getNumberOfVisitsPerVisitDuration',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : 'last30',
    _key: refreshKey,
  })

  // Fetch returning visitors
  const { data: visitorType, loading: loadingType } = useMatomo({
    method: 'VisitFrequency.get',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : 'last30',
    _key: refreshKey,
  })

  // Fetch visits by day of week
  const { data: visitsByDay, loading: loadingDays } = useMatomo({
    method: 'VisitTime.getByDayOfWeek',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : 'last30',
    _key: refreshKey,
  })

  // Fetch visits by local time
  const { data: visitsByHour, loading: loadingHours } = useMatomo({
    method: 'VisitTime.getVisitInformationPerLocalTime',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : 'last30',
    _key: refreshKey,
  })

  // Fetch countries
  const { data: countries, loading: loadingCountries } = useMatomo({
    method: 'UserCountry.getCountry',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : 'last30',
    filter_limit: '10',
    _key: refreshKey,
  })

  // Fetch cities
  const { data: cities, loading: loadingCities } = useMatomo({
    method: 'UserCountry.getCity',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : 'last30',
    filter_limit: '10',
    _key: refreshKey,
  })

  // Fetch visits summary
  const { data: visitsData, loading: loadingVisits } = useMatomo({
    method: 'VisitsSummary.get',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : 'last30',
    _key: refreshKey,
  })

  // Fetch trend data
  const { data: trendData, loading: loadingTrend } = useMatomo({
    method: 'VisitsSummary.get',
    period: 'day',
    date: dateRange === 'last30' ? 'last30' : 'last7',
    _key: refreshKey,
  })

  // Fetch visitor counts per period
  const { data: visitorGrowth, loading: loadingGrowth } = useMatomo({
    method: 'VisitFrequency.get',
    period: 'day',
    date: dateRange === 'last30' ? 'last30' : 'last7',
    _key: refreshKey,
  })

  const loading = loadingFreq || loadingType || loadingCountries || loadingVisits

  // Process visitor type data
  const visitorStats = useMemo(() => {
    const data = visitorType as any
    if (!data) {
      return null
    }
    
    const returningVisits = data.nb_visits_returning || 0
    const newVisits = data.nb_visits_new || 0
    const total = returningVisits + newVisits

    const stats = {
      returning: returningVisits,
      new: newVisits,
      total,
      returningPercent: total > 0 ? ((returningVisits / total) * 100).toFixed(1) : 0,
      newPercent: total > 0 ? ((newVisits / total) * 100).toFixed(1) : 0,
      avgActionsReturning: parseFloat(data.nb_actions_per_visit_returning || '0').toFixed(1),
      avgActionsNew: parseFloat(data.nb_actions_per_visit_new || '0').toFixed(1),
      bounceReturning: parseFloat(data.bounce_rate_returning || '0').toFixed(1),
      bounceNew: parseFloat(data.bounce_rate_new || '0').toFixed(1),
    }
    
    return stats
  }, [visitorType, loadingType])

  // Process visit frequency data
  const frequencyData = useMemo(() => {
    if (!visitFrequency || !Array.isArray(visitFrequency)) return []
    return visitFrequency.slice(0, 8).map((item: any) => ({
      duration: item.label || 'Unknown',
      visits: item.nb_visits || 0,
    }))
  }, [visitFrequency])

  // Process day of week data
  const dayData = useMemo(() => {
    if (!visitsByDay || !Array.isArray(visitsByDay)) return []
    return visitsByDay.map((item: any, index: number) => ({
      day: item.label || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
      visits: item.nb_visits || 0,
    }))
  }, [visitsByDay])

  // Process hour data
  const hourData = useMemo(() => {
    if (!visitsByHour || !Array.isArray(visitsByHour)) return []
    return visitsByHour.map((item: any) => ({
      hour: `${item.label || '0'}:00`,
      visits: item.nb_visits || 0,
    }))
  }, [visitsByHour])

  // Process country data
  const countryData = useMemo(() => {
    if (!countries || !Array.isArray(countries)) return []
    return countries.slice(0, 8).map((item: any) => ({
      country: item.label || 'Unknown',
      visits: item.nb_visits || 0,
      code: item.code || '',
    }))
  }, [countries])

  // Process city data
  const cityData = useMemo(() => {
    if (!cities || !Array.isArray(cities)) return []
    return cities.slice(0, 8).map((item: any) => ({
      city: item.label || 'Unknown',
      visits: item.nb_visits || 0,
    }))
  }, [cities])

  // Visitor trend data
  const visitorTrend = useMemo(() => {
    if (!visitorGrowth || typeof visitorGrowth !== 'object') return []
    
    const entries = Object.entries(visitorGrowth)
    if (entries.length > 0 && typeof entries[0][1] === 'object') {
      return entries.map(([date, data]: [string, any]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        returning: data?.nb_visits_returning || 0,
        new: data?.nb_visits_new || 0,
      })).slice(-14)
    }
    return []
  }, [visitorGrowth])

  // Customer satisfaction proxy (lower bounce = higher satisfaction)
  const customerHealth = useMemo(() => {
    const data = visitsData as any
    if (!data) return 50
    
    const bounceRate = parseFloat(data.bounce_rate || '50')
    const actionsPerVisit = parseFloat(data.nb_actions_per_visit || '1')
    const avgTime = (data.avg_time_on_site || 0) / 60
    
    // Score based on engagement metrics
    const bounceScore = Math.max(0, 100 - bounceRate) * 0.4
    const actionScore = Math.min(100, actionsPerVisit * 20) * 0.3
    const timeScore = Math.min(100, avgTime * 20) * 0.3
    
    return Math.round(bounceScore + actionScore + timeScore)
  }, [visitsData])

  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Customer Success</h2>
          <p className="text-slate-500 mt-1">
            User behavior, retention, and customer engagement analytics
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

      {/* Customer Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Visitors"
          value={visitorStats?.total || 0}
          icon={Users}
          color="blue"
          loading={loading}
        />
        <MetricCard
          title="Returning"
          value={`${visitorStats?.returningPercent || 0}%`}
          subtitle={`${visitorStats?.returning || 0} visitors`}
          icon={UserCheck}
          color="green"
          loading={loading}
        />
        <MetricCard
          title="New Visitors"
          value={`${visitorStats?.newPercent || 0}%`}
          subtitle={`${visitorStats?.new || 0} visitors`}
          icon={UserPlus}
          color="purple"
          loading={loading}
        />
        <MetricCard
          title="Customer Health"
          value={`${customerHealth}%`}
          subtitle="Engagement score"
          icon={Heart}
          color={customerHealth >= 60 ? 'green' : customerHealth >= 40 ? 'yellow' : 'red'}
          loading={loading}
        />
      </div>

      {/* Visitor Type Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Visitor Breakdown</h3>
          <p className="text-sm text-slate-500 mb-4">New vs returning visitors</p>
          
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" />
            </div>
          ) : visitorStats ? (
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Returning', value: visitorStats.returning },
                        { name: 'New', value: visitorStats.new },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#8b5cf6" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Returning</span>
                      <span className="text-sm text-slate-500">{visitorStats.returning}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {visitorStats.avgActionsReturning} actions/visit • {visitorStats.bounceReturning}% bounce
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">New</span>
                      <span className="text-sm text-slate-500">{visitorStats.new}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {visitorStats.avgActionsNew} actions/visit • {visitorStats.bounceNew}% bounce
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <p>No visitor data available</p>
            </div>
          )}
        </div>

        {/* Visitor Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Visitor Trend</h3>
          <p className="text-sm text-slate-500 mb-4">New vs returning over time</p>
          
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" />
            </div>
          ) : visitorTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={visitorTrend}>
                <defs>
                  <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="returning" stroke="#10b981" fill="url(#colorReturning)" strokeWidth={2} />
                <Area type="monotone" dataKey="new" stroke="#8b5cf6" fill="url(#colorNew)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <p>No trend data available</p>
            </div>
          )}
        </div>
      </div>

      {/* When Users Visit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Day of Week */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Visits by Day</h3>
          </div>
          
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : dayData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="visits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <p className="text-sm">No data for days of week</p>
            </div>
          )}
        </div>

        {/* By Hour */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-slate-900">Visits by Hour</h3>
          </div>
          
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : hourData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={hourData}>
                <defs>
                  <linearGradient id="colorHour" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} interval={2} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="visits" stroke="#8b5cf6" fill="url(#colorHour)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <p className="text-sm">No hourly data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Geographic Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Countries */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-900">Top Countries</h3>
          </div>
          
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : countryData.length > 0 ? (
            <div className="space-y-3">
              {countryData.map((item, index) => {
                const maxVisits = countryData[0]?.visits || 1
                const percentage = (item.visits / maxVisits) * 100
                return (
                  <div key={item.country} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-400 w-5">{index + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{item.country}</span>
                        <span className="text-sm text-slate-500">{item.visits}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <p className="text-sm">No country data available</p>
            </div>
          )}
        </div>

        {/* Cities */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-rose-600" />
            <h3 className="font-semibold text-slate-900">Top Cities</h3>
          </div>
          
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : cityData.length > 0 ? (
            <div className="space-y-3">
              {cityData.map((item, index) => {
                const maxVisits = cityData[0]?.visits || 1
                const percentage = (item.visits / maxVisits) * 100
                return (
                  <div key={item.city} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-400 w-5">{index + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{item.city}</span>
                        <span className="text-sm text-slate-500">{item.visits}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <p className="text-sm">No city data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Insights */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5" />
          <h3 className="font-semibold">Customer Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white/90 mb-2">Retention Rate</h4>
            <p className="text-sm text-white/70">
              {parseFloat(String(visitorStats?.returningPercent || 0)) > 40
                ? `Strong retention at ${visitorStats?.returningPercent}% - your users love coming back!`
                : `${visitorStats?.returningPercent}% returning - focus on engagement to improve retention`
              }
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white/90 mb-2">Peak Activity</h4>
            <p className="text-sm text-white/70">
              {dayData.length > 0
                ? `${dayData.reduce((max, d) => d.visits > max.visits ? d : max, dayData[0])?.day} is your busiest day`
                : 'Track activity patterns to optimize campaigns'
              }
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white/90 mb-2">Geographic Focus</h4>
            <p className="text-sm text-white/70">
              {countryData.length > 0
                ? `${countryData[0]?.country} leads with ${countryData[0]?.visits} visitors`
                : 'Start tracking geographic data for targeted marketing'
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
  subtitle,
  icon: Icon,
  color,
  loading,
}: {
  title: string
  value: number | string
  subtitle?: string
  icon: any
  color: 'blue' | 'purple' | 'green' | 'yellow' | 'red'
  loading: boolean
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {loading ? (
        <>
          <div className="h-8 bg-slate-100 rounded animate-pulse mb-1" />
          <div className="h-4 bg-slate-50 rounded animate-pulse w-2/3" />
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-slate-900 mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </>
      )}
      <p className="text-sm text-slate-500 mt-1">{title}</p>
    </div>
  )
}
