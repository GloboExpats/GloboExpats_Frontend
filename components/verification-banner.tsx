'use client'

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { ShieldAlert, Mail } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { getUserCapabilities, getVerificationStatusMessage } from '@/lib/verification-utils'

/**
 * Displays a dismiss-able banner prompting unverified users to verify their account.
 * Uses centralized verification logic for consistent messaging across the app.
 */
export const VerificationBanner = () => {
  const { isLoggedIn, user } = useAuth()

  if (!isLoggedIn || !user) return null

  const capabilities = getUserCapabilities(user)

  // Don't show banner if user is fully verified
  if (capabilities.isFullyVerified) return null

  // Determine appropriate message and icon based on verification status
  let title = 'Account verification required'
  let description = getVerificationStatusMessage(user)
  let IconComponent = ShieldAlert
  let linkText = 'Start verification'
  let linkHref = '/account/verification'

  // Customize based on what the user needs to do next
  if (capabilities.nextStep === 'organization-email') {
    title = 'Organization email verification required'
    description =
      'Verify your organization email to unlock buying, selling, and messaging features.'
    IconComponent = Mail
    linkText = 'Verify organization email'
  } else if (capabilities.nextStep === 'identity') {
    title = 'Complete identity verification'
    description = 'Upload documents to unlock seller features and full platform access.'
    linkText = 'Complete verification'
  }

  return (
    <Alert className="rounded-none border-0 bg-yellow-50 dark:bg-yellow-900/20">
      <IconComponent className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-100">{title}</AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-200">
        {description}&nbsp;
        <Link
          href={linkHref}
          className="underline underline-offset-4 font-medium hover:text-yellow-900 dark:hover:text-yellow-50"
        >
          {linkText}
        </Link>
      </AlertDescription>
    </Alert>
  )
}
