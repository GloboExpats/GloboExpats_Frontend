'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  Megaphone,
  Settings,
  Monitor,
  DollarSign,
  PieChart,
  Activity,
  ChevronLeft,
  ChevronRight,
  Building2,
  Target,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface InsightsLayoutProps {
  children: React.ReactNode
}

const departments = [
  {
    id: 'overview',
    name: 'Executive Overview',
    icon: Building2,
    href: '/insights',
    description: 'High-level KPIs and company health',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: Megaphone,
    href: '/insights/marketing',
    description: 'Traffic, campaigns & acquisition',
    color: 'text-purple-600 bg-purple-50',
  },
  {
    id: 'sales',
    name: 'Sales & Revenue',
    icon: DollarSign,
    href: '/insights/sales',
    description: 'Revenue, orders & conversions',
    color: 'text-green-600 bg-green-50',
  },
  {
    id: 'product',
    name: 'Product & Tech',
    icon: Monitor,
    href: '/insights/product',
    description: 'Usage, engagement & performance',
    color: 'text-orange-600 bg-orange-50',
  },
  {
    id: 'customers',
    name: 'Customer Success',
    icon: Users,
    href: '/insights/customers',
    description: 'User behavior & retention',
    color: 'text-pink-600 bg-pink-50',
  },
  {
    id: 'growth',
    name: 'Growth & Strategy',
    icon: Target,
    href: '/insights/growth',
    description: 'Trends, forecasts & opportunities',
    color: 'text-indigo-600 bg-indigo-50',
  },
]

export default function InsightsLayout({ children }: InsightsLayoutProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) => {
    if (href === '/insights') {
      return pathname === '/insights'
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Business Insights</h1>
              <p className="text-sm text-slate-500">Data-driven decisions for growth</p>
            </div>
          </div>
          <Link 
            href="/statistics"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Activity className="h-4 w-4" />
            Raw Analytics
          </Link>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'sticky top-[73px] h-[calc(100vh-73px)] bg-white border-r border-slate-200 transition-all duration-300 flex flex-col',
            collapsed ? 'w-20' : 'w-72'
          )}
        >
          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-6 p-1.5 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-colors z-10"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-slate-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            )}
          </button>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {departments.map((dept) => {
              const Icon = dept.icon
              const active = isActive(dept.href)
              
              return (
                <Link
                  key={dept.id}
                  href={dept.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group',
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <div
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      active ? 'bg-white/20' : dept.color
                    )}
                  >
                    <Icon className={cn('h-5 w-5', active ? 'text-white' : '')} />
                  </div>
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'font-medium truncate',
                        active ? 'text-white' : 'text-slate-900'
                      )}>
                        {dept.name}
                      </p>
                      <p className={cn(
                        'text-xs truncate',
                        active ? 'text-white/70' : 'text-slate-500'
                      )}>
                        {dept.description}
                      </p>
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          {!collapsed && (
            <div className="p-4 border-t border-slate-200">
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-sm font-medium">Need Help?</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Contact the data team for custom reports and analysis.
                </p>
                <Link
                  href="/contact"
                  className="block text-center text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Request Custom Report →
                </Link>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
