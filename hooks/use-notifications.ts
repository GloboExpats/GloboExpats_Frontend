/**
 * Notifications State Management Hook
 *
 * Provides centralized management for notifications and message counts.
 * Integrates with both notifications and messages systems for consistent state.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'

export interface NotificationCounts {
  total: number
  unread: number
  messages: number
  admin: number
  updates: number
}

export interface MessageCounts {
  total: number
  unread: number
}

interface UseNotificationsReturn {
  notificationCounts: NotificationCounts
  messageCounts: MessageCounts
  markNotificationAsRead: (notificationId: number) => void
  markMessageAsRead: (conversationId: number) => void
  markAllNotificationsAsRead: () => void
  refreshCounts: () => void
  isLoading: boolean
}

export function useNotifications(): UseNotificationsReturn {
  const { isLoggedIn, user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  const [notificationCounts, setNotificationCounts] = useState<NotificationCounts>({
    total: 0,
    unread: 0,
    messages: 0,
    admin: 0,
    updates: 0,
  })

  const [messageCounts, setMessageCounts] = useState<MessageCounts>({
    total: 0,
    unread: 0,
  })

  /**
   * Fetch notification and message counts from API
   * In a real app, this would make actual API calls
   */
  const fetchCounts = useCallback(async () => {
    if (!isLoggedIn) {
      // Reset counts when not logged in
      setNotificationCounts({
        total: 0,
        unread: 0,
        messages: 0,
        admin: 0,
        updates: 0,
      })
      setMessageCounts({
        total: 0,
        unread: 0,
      })
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      // Simulate API calls - replace with actual API endpoints
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock data based on current user state
      const mockNotificationCounts = {
        total: 7,
        unread: 3,
        messages: 2,
        admin: 1,
        updates: 2,
      }

      const mockMessageCounts = {
        total: 4,
        unread: 2,
      }

      setNotificationCounts(mockNotificationCounts)
      setMessageCounts(mockMessageCounts)
    } catch (error) {
      console.error('Failed to fetch notification counts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn])

  /**
   * Mark a specific notification as read
   */
  const markNotificationAsRead = useCallback((notificationId: number) => {
    setNotificationCounts((prev) => ({
      ...prev,
      unread: Math.max(0, prev.unread - 1),
    }))
  }, [])

  /**
   * Mark a conversation/message as read
   */
  const markMessageAsRead = useCallback((conversationId: number) => {
    setMessageCounts((prev) => ({
      ...prev,
      unread: Math.max(0, prev.unread - 1),
    }))

    // Also reduce message notification count if it was a message notification
    setNotificationCounts((prev) => ({
      ...prev,
      unread: Math.max(0, prev.unread - 1),
      messages: Math.max(0, prev.messages - 1),
    }))
  }, [])

  /**
   * Mark all notifications as read
   */
  const markAllNotificationsAsRead = useCallback(() => {
    setNotificationCounts((prev) => ({
      ...prev,
      unread: 0,
    }))
  }, [])

  /**
   * Refresh counts from server
   */
  const refreshCounts = useCallback(() => {
    fetchCounts()
  }, [fetchCounts])

  // Initial load and refresh on auth state change
  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  // Refresh counts periodically for real-time updates
  useEffect(() => {
    if (!isLoggedIn) return

    const interval = setInterval(() => {
      fetchCounts()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [isLoggedIn, fetchCounts])

  return {
    notificationCounts,
    messageCounts,
    markNotificationAsRead,
    markMessageAsRead,
    markAllNotificationsAsRead,
    refreshCounts,
    isLoading,
  }
}
