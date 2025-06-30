'use client'

/**
 * =============================================================================
 * useAuth Hook - Authentication State Management
 * =============================================================================
 *
 * Custom hook for accessing authentication state and actions throughout the
 * Expat Marketplace application. This hook provides a type-safe interface to
 * the AuthProvider context and includes helpful utility functions.
 *
 * Key Features:
 * - Current user information access
 * - Authentication status checking
 * - Login/logout functions
 * - Verification status checking
 * - Type-safe authentication guards
 * - Permission checking utilities
 *
 * Connected to:
 * - providers/auth-provider.tsx - Main authentication context
 * - components/header.tsx - User navigation and status display
 * - components/verification-banner.tsx - Verification prompts
 * - pages requiring authentication - Login guards
 * - components requiring user data - Profile displays
 *
 * Usage Examples:
 * ```tsx
 * // Basic authentication check
 * const { user, isLoggedIn } = useAuth()
 * if (isLoggedIn) {
 *   console.log('Welcome', user.name)
 * }
 *
 * // Permission checking
 * const { canBuy, canSell, isVerifiedBuyer } = useAuth()
 * if (canBuy) {
 *   // Show purchase options
 * }
 *
 * // Authentication actions
 * const { login, logout } = useAuth()
 * await login({ email: 'user@example.com', name: 'User' })
 *
 * // Verification workflow
 * const { verificationStatus, currentVerificationStep } = useAuth()
 * if (currentVerificationStep === 'organization') {
 *   // Show organization email verification
 * }
 * ```
 */

import { useContext } from 'react'
import { AuthContext } from '@/providers/auth-provider'
import type { User, VerificationStatus } from '@/lib/types'

/**
 * =============================================================================
 * MAIN AUTHENTICATION HOOK
 * =============================================================================
 */

/**
 * Main authentication hook - provides access to auth context
 *
 * @returns Complete authentication context with state and actions
 * @throws Error if used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
        'Make sure your component is wrapped with <AuthProvider> in your app layout.'
    )
  }

  return context
}

/**
 * =============================================================================
 * TYPE GUARDS & UTILITY FUNCTIONS
 * =============================================================================
 */

/**
 * Type guard to check if user is authenticated
 * Ensures user object exists and has required fields
 *
 * @param user - User object to check
 * @returns True if user is properly authenticated
 */
export const isAuthenticatedUser = (user: any): user is User => {
  return (
    user &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.name === 'string' &&
    user.email.length > 0 &&
    user.name.length > 0
  )
}

/**
 * Type guard to check if user has basic verification (organization email)
 * This allows users to buy items and contact sellers
 *
 * @param user - User object to check
 * @returns True if user has organization email verified
 */
export const isVerifiedBuyer = (user: any): boolean => {
  if (!isAuthenticatedUser(user)) return false

  return (
    user.verificationStatus?.isOrganizationEmailVerified === true || Boolean(user.organizationEmail)
  ) // Fallback for legacy data
}

/**
 * Type guard to check if user has full verification
 * This allows users to sell items and access all features
 *
 * @param user - User object to check
 * @returns True if user has complete verification
 */
export const isFullyVerifiedUser = (user: any): boolean => {
  if (!isAuthenticatedUser(user)) return false

  return user.verificationStatus?.isFullyVerified === true
}

/**
 * Type guard to check if user is admin
 * Admins have access to admin dashboard and management features
 *
 * @param user - User object to check
 * @returns True if user has admin role
 */
export const isAdminUser = (user: any): boolean => {
  if (!isAuthenticatedUser(user)) return false

  return user.role === 'admin'
}

/**
 * =============================================================================
 * PERMISSION CHECKING UTILITIES
 * =============================================================================
 */

/**
 * Checks if user can perform purchase actions
 * Requires organization email verification at minimum
 *
 * @param user - User object to check
 * @param verificationStatus - Current verification status
 * @returns True if user can buy items
 */
export const canUserBuy = (user: any, verificationStatus?: VerificationStatus | null): boolean => {
  if (!isAuthenticatedUser(user)) return false

  return verificationStatus?.canBuy === true || isVerifiedBuyer(user)
}

/**
 * Checks if user can perform selling actions
 * Requires full verification (identity + organization email)
 *
 * @param user - User object to check
 * @param verificationStatus - Current verification status
 * @returns True if user can sell items
 */
export const canUserSell = (user: any, verificationStatus?: VerificationStatus | null): boolean => {
  if (!isAuthenticatedUser(user)) return false

  return verificationStatus?.canSell === true || isFullyVerifiedUser(user)
}

/**
 * Checks if user can contact other users
 * Requires organization email verification at minimum
 *
 * @param user - User object to check
 * @param verificationStatus - Current verification status
 * @returns True if user can contact sellers
 */
export const canUserContact = (
  user: any,
  verificationStatus?: VerificationStatus | null
): boolean => {
  if (!isAuthenticatedUser(user)) return false

  return verificationStatus?.canContact === true || isVerifiedBuyer(user)
}

/**
 * =============================================================================
 * VERIFICATION WORKFLOW UTILITIES
 * =============================================================================
 */

/**
 * Gets the next verification step for the user
 * Helps guide users through the verification process
 *
 * @param verificationStatus - Current verification status
 * @returns Next step user should complete, or null if fully verified
 */
export const getNextVerificationStep = (
  verificationStatus?: VerificationStatus | null
): string | null => {
  if (!verificationStatus) return 'organization'

  if (verificationStatus.isFullyVerified) return null

  return verificationStatus.currentStep || 'organization'
}

/**
 * Gets verification progress percentage
 * Useful for displaying progress bars or completion status
 *
 * @param verificationStatus - Current verification status
 * @returns Progress percentage (0-100)
 */
export const getVerificationProgress = (verificationStatus?: VerificationStatus | null): number => {
  if (!verificationStatus) return 0

  if (verificationStatus.isFullyVerified) return 100

  let progress = 0

  // Organization email verification (50% of progress)
  if (verificationStatus.isOrganizationEmailVerified) {
    progress += 50
  }

  // Identity verification (50% of progress)
  if (verificationStatus.isIdentityVerified) {
    progress += 50
  }

  return progress
}

/**
 * Gets user-friendly verification status message
 * Provides clear messaging about what the user needs to do next
 *
 * @param verificationStatus - Current verification status
 * @returns User-friendly status message
 */
export const getVerificationStatusMessage = (
  verificationStatus?: VerificationStatus | null
): string => {
  if (!verificationStatus) {
    return 'Verification required to access all features'
  }

  if (verificationStatus.isFullyVerified) {
    return 'Account fully verified - access to all features'
  }

  if (!verificationStatus.isOrganizationEmailVerified) {
    return 'Verify your organization email to start buying items'
  }

  if (!verificationStatus.isIdentityVerified) {
    return 'Complete identity verification to start selling items'
  }

  return 'Verification in progress'
}

/**
 * =============================================================================
 * CUSTOM HOOKS FOR SPECIFIC USE CASES
 * =============================================================================
 */

/**
 * Hook for components that require authentication
 * Throws error if user is not authenticated
 *
 * @returns Authenticated user data
 * @throws Error if user is not authenticated
 */
export const useRequireAuth = () => {
  const { user, isLoggedIn } = useAuth()

  if (!isLoggedIn || !isAuthenticatedUser(user)) {
    throw new Error('This component requires user authentication')
  }

  return user
}

/**
 * Hook for components that require verified users
 * Returns verification status and utilities
 *
 * @returns Verification status and utility functions
 */
export const useVerificationStatus = () => {
  const { user, verificationStatus } = useAuth()

  return {
    verificationStatus,
    canBuy: canUserBuy(user, verificationStatus),
    canSell: canUserSell(user, verificationStatus),
    canContact: canUserContact(user, verificationStatus),
    nextStep: getNextVerificationStep(verificationStatus),
    progress: getVerificationProgress(verificationStatus),
    statusMessage: getVerificationStatusMessage(verificationStatus),
    isVerifiedBuyer: isVerifiedBuyer(user),
    isFullyVerified: isFullyVerifiedUser(user),
  }
}

/**
 * Hook for admin-only components
 * Returns admin status and utilities
 *
 * @returns Admin status and user data (if admin)
 */
export const useAdminAuth = () => {
  const { user, isLoggedIn } = useAuth()

  const isAdmin = isAdminUser(user)

  if (isLoggedIn && !isAdmin) {
    console.warn('useAdminAuth: User is not an admin')
  }

  return {
    isAdmin,
    user: isAdmin ? user : null,
    canAccessAdmin: isLoggedIn && isAdmin,
  }
}
