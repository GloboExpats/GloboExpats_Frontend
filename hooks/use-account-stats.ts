/**
 * Account Statistics Hook
 *
 * Fetches and manages user account statistics from backend
 * Provides data for dashboard display
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'

export interface AccountStats {
  totalOrders: number
  wishlistItems: number
  reviewsWritten: number
  activeListings?: number
}

export interface UseAccountStatsReturn {
  stats: AccountStats | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useAccountStats(): UseAccountStatsReturn {
  const { isLoggedIn } = useAuth()
  const [stats, setStats] = useState<AccountStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!isLoggedIn) {
      setStats(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Note: Orders endpoint not yet available in backend
      // Using placeholder data until endpoint is implemented
      // TODO: Uncomment when backend adds GET /api/v1/orders endpoint

      // const [ordersResponse] = await Promise.allSettled([
      //   api.orders.list(),
      // ])

      // Extract orders count
      // let totalOrders = 0
      // if (ordersResponse.status === 'fulfilled') {
      //   const ordersData = ordersResponse.value as any
      //   // Handle different response formats
      //   if (Array.isArray(ordersData)) {
      //     totalOrders = ordersData.length
      //   } else if (ordersData.data && Array.isArray(ordersData.data)) {
      //     totalOrders = ordersData.data.length
      //   } else if (ordersData.totalElements !== undefined) {
      //     totalOrders = ordersData.totalElements
      //   }
      // }

      // Use placeholder values until backend endpoints are available
      const accountStats: AccountStats = {
        totalOrders: 0, // TODO: Replace with actual orders count when endpoint available
        wishlistItems: 0, // TODO: Replace with actual wishlist count
        reviewsWritten: 0, // TODO: Replace with actual reviews count
      }

      setStats(accountStats)
    } catch (err) {
      console.error('Failed to fetch account stats:', err)
      setError('Failed to load account statistics')
      // Set default values on error
      setStats({
        totalOrders: 0,
        wishlistItems: 0,
        reviewsWritten: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn])

  // Fetch stats on mount and when user logs in
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  }
}
