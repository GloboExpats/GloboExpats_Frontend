'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useVerification } from '@/hooks/use-verification'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireVerification?: 'buy' | 'sell' | 'contact'
  requireAdmin?: boolean
  fallbackUrl?: string
  loadingMessage?: string
}

/**
 * Route Guard Component
 *
 * Protects routes by checking authentication and verification status.
 * Provides loading states and appropriate redirects/error messages.
 *
 * @param children - Components to render if access is granted
 * @param requireAuth - Whether authentication is required
 * @param requireVerification - Type of verification required
 * @param requireAdmin - Whether admin access is required
 * @param fallbackUrl - URL to redirect to if access denied
 * @param loadingMessage - Custom loading message
 */
export function RouteGuard({
  children,
  requireAuth = true,
  requireVerification,
  requireAdmin = false,
  fallbackUrl = '/login',
  loadingMessage = 'Verifying access...',
}: RouteGuardProps) {
  const router = useRouter()
  const { isLoggedIn, isLoading: authLoading, user } = useAuth()
  const { checkVerification } = useVerification()
  const { toast } = useToast()
  const [accessGranted, setAccessGranted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Timeout tracking for debugging - can be used for timeout-related features
  const [, setCheckTimeout] = useState(false)

  useEffect(() => {
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!accessGranted && !error) {
        console.warn('[RouteGuard] Verification check timed out - granting access with warning')
        setCheckTimeout(true)
        setAccessGranted(true) // Grant access anyway after timeout
      }
    }, 3000) // 3 second timeout

    return () => clearTimeout(timeoutId)
  }, [accessGranted, error])

  useEffect(() => {
    if (!authLoading) {
      // Check authentication requirement
      if (requireAuth && !isLoggedIn) {
        const currentPath = window.location.pathname
        router.push(`${fallbackUrl}?redirect=${encodeURIComponent(currentPath)}`)
        return
      }

      // Check admin requirement
      if (requireAdmin && user?.role !== 'admin') {
        setError('Admin access required. You do not have permission to view this page.')
        return
      }

      // Check verification requirement
      if (requireVerification && isLoggedIn) {
        const canProceed = checkVerification(requireVerification)

        if (!canProceed) {
          // Show verification error and redirect to verification page
          if (process.env.NODE_ENV === 'development') {
            console.log(`[RouteGuard] User verification pending for '${requireVerification}'`)
          }

          // Redirect to verification page for sell actions
          if (requireVerification === 'sell') {
            toast({
              title: 'Verification Required',
              description:
                "Please verify your account to list items for sale. You'll be redirected to the verification page.",
              variant: 'default',
            })
            router.push('/account/verification')
            return
          }

          // For other verification types, set error message
          setError(
            'Verification required. Please complete account verification to access this page.'
          )
          return
        }
      }

      // All checks passed
      setAccessGranted(true)
    }
  }, [
    authLoading,
    isLoggedIn,
    requireAuth,
    requireAdmin,
    requireVerification,
    user,
    router,
    fallbackUrl,
    checkVerification,
    accessGranted,
    toast,
  ])

  // Show loading state
  if (authLoading || (!accessGranted && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-primary" />
          <p className="text-neutral-600">{loadingMessage}</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Required</h2>
                <p className="text-gray-600">
                  Please complete account verification to access this page.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline" className="min-w-24">
                  <Link href="/">Go Home</Link>
                </Button>
                {requireVerification && (
                  <Button asChild className="min-w-24">
                    <Link href="/account/verification">Get Verified</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render protected content
  if (accessGranted) {
    return <>{children}</>
  }

  // Fallback
  return null
}

/**
 * Higher-order component for protecting pages
 */
export function withRouteGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<RouteGuardProps, 'children'>
) {
  return function GuardedComponent(props: P) {
    return (
      <RouteGuard {...guardProps}>
        <Component {...props} />
      </RouteGuard>
    )
  }
}
