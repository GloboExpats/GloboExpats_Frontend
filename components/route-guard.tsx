'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useVerification } from '@/hooks/use-verification'
import { Loader2, Shield, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
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
  const [accessGranted, setAccessGranted] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        if (!checkVerification(requireVerification)) {
          // checkVerification will handle showing popup or redirect
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mb-4">{error}</AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2">
            <Button asChild variant="outline">
              <Link href="/">Go Home</Link>
            </Button>
            {requireVerification && (
              <Button asChild>
                <Link href="/account/verification">
                  <Shield className="w-4 h-4 mr-2" />
                  Get Verified
                </Link>
              </Button>
            )}
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
