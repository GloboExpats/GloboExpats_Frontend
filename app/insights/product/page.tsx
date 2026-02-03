'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  Zap,
  RefreshCw,
  Calendar,
  Chrome,
  Activity,
  BarChart3,
  Gauge,
  Server,
  Code,
  Layers,
  MousePointer,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts'

const dateRanges = [
  { label: 'Last 7 Days', value: 'last7', period: 'day' },
  { label: 'Last 30 Days', value: 'last30', period: 'day' },
  { label: 'This Month', value: 'month', period: 'month' },
]

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

export default function ProductTechInsightsPage() {
  const [dateRange, setDateRange] = useState('last7')
  const [refreshKey, setRefreshKey] = useState(0)
  const pathname = usePathname()

  // Force refresh when pathname changes (route navigation)
  useEffect(() => {
    setRefreshKey(prev => prev + 1)
  }, [pathname])

  const selectedRange = dateRanges.find(r => r.value === dateRange) || dateRanges[0]

  // Fetch device types
  const { data: deviceTypes, loading: loadingDevices } = useMatomo({
    method: 'DevicesDetection.getType',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : 'last30',
    _key: refreshKey,
  })

  // Fetch browsers
  const { data: browsers, loading: loadingBrowsers } = useMatomo({
    method: 'DevicesDetection.getBrowsers',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : 'last30',
    filter_limit: '10',
    _key: refreshKey,
  })

  // Fetch operating systems
  const { data: operatingSystems, loading: loadingOS } = useMatomo({
    method: 'DevicesDetection.getOsVersions',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : 'last30',
    filter_limit: '10',
    _key: refreshKey,
  })

  // Fetch screen resolutions
  const { data: resolutions, loading: loadingRes } = useMatomo({
    method: 'Resolution.getResolution',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : 'last30',
    filter_limit: '10',
    _key: refreshKey,
  })

  // Fetch page performance
  const { data: pageData, loading: loadingPages } = useMatomo({
    method: 'Actions.getPageUrls',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : 'last30',
    flat: '1',
    filter_limit: '15',
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

  const loading = loadingDevices || loadingBrowsers || loadingOS || loadingPages

  // Process device data
  const deviceData = useMemo(() => {
    if (!deviceTypes || !Array.isArray(deviceTypes)) return []
    return deviceTypes.map((item: any) => ({
      name: item.label || 'Unknown',
      visits: item.nb_visits || 0,
      percentage: 0,
      icon: item.label?.toLowerCase().includes('desktop') ? Monitor :
            item.label?.toLowerCase().includes('smartphone') ? Smartphone :
            item.label?.toLowerCase().includes('tablet') ? Tablet : Globe,
    }))
  }, [deviceTypes])

  // Calculate device percentages
  const deviceDataWithPercentage = useMemo(() => {
    const total = deviceData.reduce((sum, d) => sum + d.visits, 0)
    return deviceData.map(d => ({
      ...d,
      percentage: total > 0 ? ((d.visits / total) * 100).toFixed(1) : 0,
    }))
  }, [deviceData])

  // Process browser data
  const browserData = useMemo(() => {
    if (!browsers || !Array.isArray(browsers)) return []
    return browsers.slice(0, 6).map((item: any) => ({
      name: item.label || 'Unknown',
      visits: item.nb_visits || 0,
      logo: item.logo || '',
    }))
  }, [browsers])

  // Process OS data
  const osData = useMemo(() => {
    if (!operatingSystems || !Array.isArray(operatingSystems)) return []
    return operatingSystems.slice(0, 6).map((item: any) => ({
      name: item.label || 'Unknown',
      visits: item.nb_visits || 0,
      logo: item.logo || '',
    }))
  }, [operatingSystems])

  // Process resolution data
  const resolutionData = useMemo(() => {
    if (!resolutions || !Array.isArray(resolutions)) return []
    return resolutions.slice(0, 8).map((item: any) => ({
      name: item.label || 'Unknown',
      visits: item.nb_visits || 0,
    }))
  }, [resolutions])

  // Process page data for performance
  const pagePerformance = useMemo(() => {
    if (!pageData || !Array.isArray(pageData)) return []
    return pageData
      .filter((page: any) => page.avg_time_on_page > 0)
      .slice(0, 10)
      .map((page: any) => ({
        name: page.label?.split('/').slice(-1)[0] || page.label || 'Unknown',
        fullPath: page.label,
        avgTime: Math.round(page.avg_time_on_page || 0),
        bounceRate: parseFloat(page.bounce_rate || '0'),
        exitRate: parseFloat(page.exit_rate || '0'),
        pageviews: page.nb_hits || 0,
      }))
  }, [pageData])

  // Calculate engagement metrics
  const engagementMetrics = useMemo(() => {
    const data = visitsData as any
    if (!data) return null
    
    return {
      avgSessionDuration: Math.round((data.avg_time_on_site || 0) / 60),
      avgSessionDurationSec: data.avg_time_on_site || 0,
      bounceRate: parseFloat(data.bounce_rate || '0'),
      actionsPerVisit: parseFloat(data.nb_actions_per_visit || '0').toFixed(1),
      pageviews: data.nb_pageviews || 0,
      totalVisits: data.nb_visits || 0,
    }
  }, [visitsData])

  // Process trend data for engagement chart
  const engagementTrend = useMemo(() => {
    if (!trendData || typeof trendData !== 'object') return []
    
    const entries = Object.entries(trendData)
    if (entries.length > 0 && typeof entries[0][1] === 'object') {
      return entries.map(([date, data]: [string, any]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bounceRate: parseFloat(data?.bounce_rate || '0'),
        avgTime: Math.round((data?.avg_time_on_site || 0) / 60),
        actionsPerVisit: parseFloat(data?.nb_actions_per_visit || '0'),
      })).slice(-14)
    }
    return []
  }, [trendData])

  // Radar chart data for tech stack health
  const techHealthData = useMemo(() => {
    const mobileShare = deviceDataWithPercentage.find(d => 
      d.name.toLowerCase().includes('smartphone') || d.name.toLowerCase().includes('mobile')
    )?.percentage || 0
    
    return [
      { metric: 'Mobile Ready', value: parseFloat(String(mobileShare)), max: 100 },
      { metric: 'Engagement', value: Math.min(100, (engagementMetrics?.avgSessionDuration || 0) * 10), max: 100 },
      { metric: 'Low Bounce', value: Math.min(100, 100 - (engagementMetrics?.bounceRate || 50)), max: 100 },
      { metric: 'Page Depth', value: Math.min(100, parseFloat(engagementMetrics?.actionsPerVisit || '0') * 20), max: 100 },
      { metric: 'Browser Support', value: Math.min(100, browserData.length * 15), max: 100 },
    ]
  }, [deviceDataWithPercentage, engagementMetrics, browserData])

  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Product & Tech</h2>
          <p className="text-slate-500 mt-1">
            Platform performance, device analytics, and user engagement
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

      {/* Engagement Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Avg. Session"
          value={`${engagementMetrics?.avgSessionDuration || 0}m`}
          subtitle={`${engagementMetrics?.avgSessionDurationSec || 0}s total`}
          icon={Clock}
          color="blue"
          loading={loading}
        />
        <MetricCard
          title="Bounce Rate"
          value={`${engagementMetrics?.bounceRate?.toFixed(1) || 0}%`}
          subtitle={parseFloat(String(engagementMetrics?.bounceRate || 0)) < 50 ? 'Healthy' : 'Needs attention'}
          icon={Activity}
          color={parseFloat(String(engagementMetrics?.bounceRate || 0)) < 50 ? 'green' : 'orange'}
          loading={loading}
        />
        <MetricCard
          title="Pages/Session"
          value={engagementMetrics?.actionsPerVisit || '0'}
          subtitle="Actions per visit"
          icon={Layers}
          color="purple"
          loading={loading}
        />
        <MetricCard
          title="Total Pageviews"
          value={engagementMetrics?.pageviews || 0}
          subtitle={`${engagementMetrics?.totalVisits || 0} sessions`}
          icon={MousePointer}
          color="green"
          loading={loading}
        />
      </div>

      {/* Device Breakdown & Tech Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Device Breakdown</h3>
          <p className="text-sm text-slate-500 mb-4">How users access your platform</p>
          
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" />
            </div>
          ) : deviceDataWithPercentage.length > 0 ? (
            <div className="space-y-4">
              {deviceDataWithPercentage.map((device) => {
                const Icon = device.icon
                return (
                  <div key={device.name} className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Icon className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{device.name}</span>
                        <span className="text-sm text-slate-500">{device.visits} ({device.percentage}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${device.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <p>No device data available</p>
            </div>
          )}
        </div>

        {/* Tech Health Radar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Platform Health</h3>
          <p className="text-sm text-slate-500 mb-4">Technical performance indicators</p>
          
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={techHealthData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Health"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Engagement Trend */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-1">Engagement Trend</h3>
        <p className="text-sm text-slate-500 mb-4">User engagement metrics over time</p>
        
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" />
          </div>
        ) : engagementTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={engagementTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="bounceRate"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="Bounce Rate %"
              />
              <Line
                type="monotone"
                dataKey="avgTime"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Avg Time (min)"
              />
              <Line
                type="monotone"
                dataKey="actionsPerVisit"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="Actions/Visit"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-400">
            <p>No trend data available</p>
          </div>
        )}
      </div>

      {/* Browser & OS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Browsers */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Chrome className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Browsers</h3>
          </div>
          
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : browserData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={browserData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="visits" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <p className="text-sm">No browser data</p>
            </div>
          )}
        </div>

        {/* Operating Systems */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-slate-900">Operating Systems</h3>
          </div>
          
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : osData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={osData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="visits" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <p className="text-sm">No OS data</p>
            </div>
          )}
        </div>
      </div>

      {/* Page Performance */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-1">Page Performance</h3>
        <p className="text-sm text-slate-500 mb-4">Engagement metrics by page</p>
        
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
          </div>
        ) : pagePerformance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Page</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-500">Views</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-500">Avg. Time</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-500">Bounce</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-500">Exit</th>
                </tr>
              </thead>
              <tbody>
                {pagePerformance.map((page) => (
                  <tr key={page.fullPath} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-900 truncate block max-w-xs">{page.name}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">{page.pageviews}</td>
                    <td className="py-3 px-4 text-right text-slate-700">{page.avgTime}s</td>
                    <td className="py-3 px-4 text-right">
                      <span className={page.bounceRate > 50 ? 'text-red-500' : 'text-green-600'}>
                        {page.bounceRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">{page.exitRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-400">
            <p className="text-sm">No page performance data</p>
          </div>
        )}
      </div>

      {/* Tech Insights */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5" />
          <h3 className="font-semibold">Tech Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white/90 mb-2">Mobile Experience</h4>
            <p className="text-sm text-white/70">
              {(() => {
                const mobileShare = parseFloat(String(deviceDataWithPercentage.find(d => 
                  d.name.toLowerCase().includes('smartphone')
                )?.percentage || 0))
                return mobileShare > 50
                  ? `${mobileShare}% mobile users - ensure mobile-first design`
                  : `${mobileShare}% mobile traffic - optimize for growing mobile users`
              })()}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white/90 mb-2">Browser Support</h4>
            <p className="text-sm text-white/70">
              {browserData.length > 0
                ? `${browserData[0]?.name} is the top browser (${browserData[0]?.visits} visits)`
                : 'Track browser data to ensure compatibility'
              }
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white/90 mb-2">User Engagement</h4>
            <p className="text-sm text-white/70">
              {(engagementMetrics?.avgSessionDuration || 0) > 2
                ? `Great engagement - users spend ${engagementMetrics?.avgSessionDuration}min average`
                : 'Focus on improving content to increase session duration'
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
  subtitle: string
  icon: any
  color: 'blue' | 'purple' | 'green' | 'orange'
  loading: boolean
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
        <>
          <div className="h-8 bg-slate-100 rounded animate-pulse mb-1" />
          <div className="h-4 bg-slate-50 rounded animate-pulse w-2/3" />
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-slate-900 mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </>
      )}
      <p className="text-sm text-slate-500 mt-1">{title}</p>
    </div>
  )
}
