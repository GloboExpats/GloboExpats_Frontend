'use client'

import React from 'react'
import { AlertCircle, RefreshCw, ServerCrash, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  /** Error type to determine the display style */
  type?: 'gateway' | 'network' | 'server' | 'generic'
  /** Custom error message */
  message?: string
  /** Custom title */
  title?: string
  /** Callback when retry button is clicked */
  onRetry?: () => void
  /** Show retry button */
  showRetry?: boolean
  /** Compact mode for smaller displays */
  compact?: boolean
}

/**
 * ErrorState Component
 *
 * A reusable error display component for handling different types of errors
 * with user-friendly messaging and optional retry functionality.
 *
 * @example
 * ```tsx
 * <ErrorState
 *   type="gateway"
 *   onRetry={() => fetchData()}
 * />
 * ```
 */
export function ErrorState({
  type = 'generic',
  message,
  title,
  onRetry,
  showRetry = true,
  compact = false,
}: ErrorStateProps) {
  // Determine icon based on error type
  const Icon =
    type === 'gateway' || type === 'server' ? ServerCrash : type === 'network' ? Wifi : AlertCircle

  // Default messages based on error type
  const defaultMessages = {
    gateway: {
      title: 'Service Temporarily Unavailable',
      message:
        'Our servers are experiencing high traffic or undergoing maintenance. Please try again in a few moments.',
    },
    network: {
      title: 'Connection Issue',
      message: 'Unable to reach our servers. Please check your internet connection and try again.',
    },
    server: {
      title: 'Server Error',
      message:
        "We're experiencing technical difficulties. Our team has been notified and is working on a fix.",
    },
    generic: {
      title: 'Something Went Wrong',
      message:
        'An unexpected error occurred. Please try again or contact support if the issue persists.',
    },
  }

  const displayTitle = title || defaultMessages[type].title
  const displayMessage = message || defaultMessages[type].message

  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="flex items-center gap-3 text-neutral-600">
          <Icon className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">{displayTitle}</p>
            <p className="mt-1 text-xs text-neutral-500">{displayMessage}</p>
          </div>
        </div>
        {showRetry && onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Icon */}
      <div className="mb-6">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
          <Icon className="h-10 w-10 text-neutral-600" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md space-y-3 text-center">
        <h3 className="text-xl font-semibold text-neutral-900">{displayTitle}</h3>
        <p className="leading-relaxed text-neutral-600">{displayMessage}</p>
      </div>

      {/* Actions */}
      {showRetry && onRetry && (
        <div className="mt-8 flex gap-3">
          <Button onClick={onRetry} className="bg-brand-primary hover:bg-brand-primary/90">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-8 text-center">
        <p className="text-xs text-neutral-500">
          If this problem persists, please{' '}
          <a href="/contact" className="text-brand-primary hover:underline">
            contact our support team
          </a>
        </p>
      </div>
    </div>
  )
}
