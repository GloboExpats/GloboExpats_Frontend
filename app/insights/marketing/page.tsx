'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Globe,
  Search,
  Link2,
  Share2,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Target,
  Megaphone,
  BarChart3,
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
  Legend,
  Treemap,
} from 'recharts'

const dateRanges = [
  { label: 'Last 7 Days', value: 'last7', period: 'day' },
  { label: 'Last 30 Days', value: 'last30', period: 'day' },
  { label: 'This Month', value: 'month', period: 'month' },
  { label: 'Last 3 Months', value: 'last3months', period: 'month' },
]

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4']

export default function MarketingInsightsPage() {
  const [dateRange, setDateRange] = useState('last7')
  const [refreshKey, setRefreshKey] = useState(0)
  const pathname = usePathname()

  // Force refresh when pathname changes (route navigation)
  useEffect(() => {
    setRefreshKey(prev => prev + 1)
  }, [pathname])

  const selectedRange = dateRanges.find(r => r.value === dateRange) || dateRanges[0]

  // Fetch referrer types
  const { data: referrerTypes, loading: loadingReferrers } = useMatomo({
    method: 'Referrers.getReferrerType',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange === 'last3months' ? 'last90' : dateRange,
    _key: refreshKey,
  })

  // Fetch search engines
  const { data: searchEngines, loading: loadingSearch } = useMatomo({
    method: 'Referrers.getSearchEngines',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    filter_limit: '10',
    _key: refreshKey,
  })

  // Fetch social networks
  const { data: socialNetworks, loading: loadingSocial } = useMatomo({
    method: 'Referrers.getSocials',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    filter_limit: '10',
    _key: refreshKey,
  })

  // Fetch websites (external referrers)
  const { data: websites, loading: loadingWebsites } = useMatomo({
    method: 'Referrers.getWebsites',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    filter_limit: '10',
    _key: refreshKey,
  })

  // Fetch keywords
  const { data: keywords, loading: loadingKeywords } = useMatomo({
    method: 'Referrers.getKeywords',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    filter_limit: '20',
    _key: refreshKey,
  })

  // Fetch campaigns
  const { data: campaigns, loading: loadingCampaigns } = useMatomo({
    method: 'Referrers.getCampaigns',
    period: 'range',
    date: dateRange === 'last7' ? 'last7' : dateRange === 'last30' ? 'last30' : dateRange,
    _key: refreshKey,
  })

  // Fetch trend data
  const { data: trendData, loading: loadingTrend } = useMatomo({
    method: 'Referrers.getReferrerType',
    period: 'day',
    date: dateRange === 'last30' || dateRange === 'last3months' ? 'last30' : 'last7',
    _key: refreshKey,
  })

  const loading = loadingReferrers || loadingSearch || loadingSocial || loadingTrend

  // Process referrer data
  const referrerData = useMemo(() => {
    if (!referrerTypes || !Array.isArray(referrerTypes)) return []
    return referrerTypes.map((item: any) => ({
      name: item.label || 'Unknown',
      visits: item.nb_visits || 0,
      actions: item.nb_actions || 0,
      bounceRate: parseFloat(item.bounce_rate || '0'),
    }))
  }, [referrerTypes])

  // Calculate totals
  const totals = useMemo(() => {
    const total = referrerData.reduce((sum, item) => sum + item.visits, 0)
    const organic = referrerData.find(r => r.name.toLowerCase().includes('search'))?.visits || 0
    const direct = referrerData.find(r => r.name.toLowerCase().includes('direct'))?.visits || 0
    const social = referrerData.find(r => r.name.toLowerCase().includes('social'))?.visits || 0
    const referral = referrerData.find(r => r.name.toLowerCase().includes('website'))?.visits || 0
    
    return { total, organic, direct, social, referral }
  }, [referrerData])

  // Search engines data
  const searchData = useMemo(() => {
    if (!searchEngines || !Array.isArray(searchEngines)) return []
    return searchEngines.slice(0, 5).map((item: any) => ({
      name: item.label || 'Unknown',
      visits: item.nb_visits || 0,
      logo: item.logo || '',
    }))
  }, [searchEngines])

  // Social networks data
  const socialData = useMemo(() => {
    if (!socialNetworks || !Array.isArray(socialNetworks)) return []
    return socialNetworks.slice(0, 5).map((item: any) => ({
      name: item.label || 'Unknown',
      visits: item.nb_visits || 0,
      logo: item.logo || '',
    }))
  }, [socialNetworks])

  // External websites data
  const websiteData = useMemo(() => {
    if (!websites || !Array.isArray(websites)) return []
    return websites.slice(0, 8).map((item: any) => ({
      name: item.label || 'Unknown',
      visits: item.nb_visits || 0,
    }))
  }, [websites])

  // Keywords data
  const keywordData = useMemo(() => {
    if (!keywords || !Array.isArray(keywords)) return []
    return keywords.slice(0, 10).map((item: any) => ({
      name: item.label || 'Unknown',
      visits: item.nb_visits || 0,
    }))
  }, [keywords])

  // Campaign data
  const campaignData = useMemo(() => {
    if (!campaigns || !Array.isArray(campaigns)) return []
    return campaigns.map((item: any) => ({
      name: item.label || 'Unknown',
      visits: item.nb_visits || 0,
      actions: item.nb_actions || 0,
      conversions: item.nb_conversions || 0,
    }))
  }, [campaigns])

  // Pie chart data for traffic sources
  const pieData = useMemo(() => {
    return referrerData.map(item => ({
      name: item.name,
      value: item.visits,
    }))
  }, [referrerData])

  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Marketing Insights</h2>
          <p className="text-slate-500 mt-1">
            Traffic acquisition, campaigns, and channel performance
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

      {/* Channel Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ChannelCard
          title="Organic Search"
          value={totals.organic}
          total={totals.total}
          icon={Search}
          color="green"
          loading={loading}
        />
        <ChannelCard
          title="Direct Traffic"
          value={totals.direct}
          total={totals.total}
          icon={Globe}
          color="blue"
          loading={loading}
        />
        <ChannelCard
          title="Social Media"
          value={totals.social}
          total={totals.total}
          icon={Share2}
          color="purple"
          loading={loading}
        />
        <ChannelCard
          title="Referral Links"
          value={totals.referral}
          total={totals.total}
          icon={Link2}
          color="orange"
          loading={loading}
        />
      </div>

      {/* Traffic Sources & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources Pie */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Traffic Distribution</h3>
          <p className="text-sm text-slate-500 mb-4">How visitors find your platform</p>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" />
            </div>
          ) : pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {pieData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-slate-600">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                      <span className="text-xs text-slate-400 ml-1">
                        ({totals.total > 0 ? ((item.value / totals.total) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <p>No traffic data available</p>
            </div>
          )}
        </div>

        {/* Channel Performance Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Channel Performance</h3>
          <p className="text-sm text-slate-500 mb-4">Visits by traffic source</p>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" />
            </div>
          ) : referrerData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={referrerData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis type="category" dataKey="name" width={100} stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="visits" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Visits" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <p>No channel data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Search Engines & Social Networks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search Engines */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-slate-900">Search Engines</h3>
          </div>
          
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : searchData.length > 0 ? (
            <div className="space-y-3">
              {searchData.map((engine, idx) => (
                <div key={engine.name} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-400 w-5">{idx + 1}</span>
                    <span className="text-sm font-medium text-slate-700">{engine.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(engine.visits / (searchData[0]?.visits || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 w-12 text-right">{engine.visits}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400">
              <p className="text-sm">No search engine data</p>
            </div>
          )}
        </div>

        {/* Social Networks */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-slate-900">Social Networks</h3>
          </div>
          
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : socialData.length > 0 ? (
            <div className="space-y-3">
              {socialData.map((network, idx) => (
                <div key={network.name} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-400 w-5">{idx + 1}</span>
                    <span className="text-sm font-medium text-slate-700">{network.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(network.visits / (socialData[0]?.visits || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 w-12 text-right">{network.visits}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400">
              <p className="text-sm">No social network data</p>
            </div>
          )}
        </div>
      </div>

      {/* Keywords & Referring Sites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keywords */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Top Search Keywords</h3>
          <p className="text-sm text-slate-500 mb-4">What people search to find you</p>
          
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : keywordData.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {keywordData.map((keyword) => (
                <span
                  key={keyword.name}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm"
                >
                  {keyword.name}
                  <span className="text-xs text-slate-400">({keyword.visits})</span>
                </span>
              ))}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400">
              <Search className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">No keyword data available</p>
              <p className="text-xs">Most search engines don't share keywords anymore</p>
            </div>
          )}
        </div>

        {/* Referring Websites */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Top Referring Sites</h3>
          <p className="text-sm text-slate-500 mb-4">External sites sending traffic</p>
          
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : websiteData.length > 0 ? (
            <div className="space-y-2">
              {websiteData.map((site, idx) => (
                <div key={site.name} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <ExternalLink className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-700 truncate">{site.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 ml-2">{site.visits}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <p className="text-sm">No referring site data</p>
            </div>
          )}
        </div>
      </div>

      {/* Campaigns */}
      {campaignData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-slate-900">Marketing Campaigns</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Campaign</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-500">Visits</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-500">Conversions</th>
                </tr>
              </thead>
              <tbody>
                {campaignData.map((campaign) => (
                  <tr key={campaign.name} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{campaign.name}</td>
                    <td className="py-3 px-4 text-right text-slate-700">{campaign.visits}</td>
                    <td className="py-3 px-4 text-right text-slate-700">{campaign.actions}</td>
                    <td className="py-3 px-4 text-right text-slate-700">{campaign.conversions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Marketing Insights Card */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="h-5 w-5" />
          <h3 className="font-semibold">Marketing Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InsightBox
            title="Traffic Mix"
            description={
              totals.organic > totals.direct
                ? "Organic traffic leads - great SEO performance!"
                : "Direct traffic dominates - focus on SEO to grow organic reach"
            }
            positive={totals.organic > totals.direct}
          />
          <InsightBox
            title="Social Presence"
            description={
              totals.social > 0
                ? `Social drives ${totals.total > 0 ? ((totals.social / totals.total) * 100).toFixed(0) : 0}% of traffic`
                : "Consider increasing social media activity"
            }
            positive={totals.social > 0}
          />
          <InsightBox
            title="Referral Network"
            description={
              websiteData.length > 5
                ? "Strong referral network from multiple sources"
                : "Opportunity to build more referral partnerships"
            }
            positive={websiteData.length > 5}
          />
        </div>
      </div>
    </div>
  )
}

// Channel Card Component
function ChannelCard({
  title,
  value,
  total,
  icon: Icon,
  color,
  loading,
}: {
  title: string
  value: number
  total: number
  icon: any
  color: 'green' | 'blue' | 'purple' | 'orange'
  loading: boolean
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
  }

  const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : 0

  return (
    <div className={`rounded-2xl border p-5 ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium opacity-80">{title}</span>
      </div>
      {loading ? (
        <div className="h-8 bg-white/50 rounded animate-pulse" />
      ) : (
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold">{value.toLocaleString()}</span>
          <span className="text-sm opacity-70 mb-1">({percentage}%)</span>
        </div>
      )}
    </div>
  )
}

// Insight Box Component
function InsightBox({
  title,
  description,
  positive,
}: {
  title: string
  description: string
  positive: boolean
}) {
  return (
    <div className="bg-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {positive ? (
          <TrendingUp className="h-4 w-4 text-green-300" />
        ) : (
          <Target className="h-4 w-4 text-yellow-300" />
        )}
        <h4 className="font-medium text-white/90">{title}</h4>
      </div>
      <p className="text-sm text-white/70">{description}</p>
    </div>
  )
}
