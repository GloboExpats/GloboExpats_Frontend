/**
 * =============================================================================
 * LoadingSkeleton - Reusable Loading State Components
 * =============================================================================
 *
 * Centralized loading skeleton components to maintain consistency across
 * the application and reduce code duplication.
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Common product card skeleton for grid layouts
 */
export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-5 w-20" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-10 w-full mt-4" />
      </CardContent>
    </Card>
  )
}

/**
 * Product grid skeleton with configurable number of items
 */
interface ProductGridSkeletonProps {
  count?: number
  columns?:
    | 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    | 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
}

export function ProductGridSkeleton({
  count = 12,
  columns = 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}: ProductGridSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 ${columns} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Conversation list item skeleton for messages
 */
export function ConversationSkeleton() {
  return (
    <div className="p-4 border-b">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

/**
 * Chat interface skeleton
 */
export function ChatSkeleton() {
  return (
    <Card className="lg:col-span-2">
      <CardContent className="p-0 h-full flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <Skeleton className={`h-12 ${i % 2 === 0 ? 'w-48' : 'w-32'} rounded-lg`} />
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Sidebar filter skeleton
 */
export function FilterSidebarSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Header search and controls skeleton
 */
export function HeaderControlsSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4">
      <Skeleton className="h-11 flex-1 max-w-md" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

/**
 * Dashboard stats skeleton
 */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Table skeleton for data tables
 */
interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="p-4">
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, i) => (
                <tr key={i} className="border-b">
                  {Array.from({ length: columns }).map((_, j) => (
                    <td key={j} className="p-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Full page loading layout skeleton
 */
interface PageSkeletonProps {
  title?: boolean
  sidebar?: boolean
  children?: React.ReactNode
}

export function PageSkeleton({ title = true, sidebar = false, children }: PageSkeletonProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {title && (
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <HeaderControlsSkeleton />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {sidebar && (
            <aside className="hidden md:block w-80 flex-shrink-0">
              <FilterSidebarSkeleton />
            </aside>
          )}

          <div className="flex-1">
            {children || (
              <>
                <div className="mb-6">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-72" />
                </div>
                <ProductGridSkeleton />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
