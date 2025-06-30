/**
 * Verification Utilities
 *
 * Centralized logic for handling user verification states and requirements.
 * Provides consistent verification checking across the application.
 */

/**
 * Check if a user can perform buy actions
 * Requires organization email verification at minimum
 */
export function canUserBuy(user: any): boolean {
  if (!user) return false

  // Check new verification system first
  if (user.verificationStatus) {
    return user.verificationStatus.canBuy === true
  }

  // Fallback for legacy data
  return user.isOrganizationEmailVerified === true
}

/**
 * Check if a user can perform sell actions
 * Requires full verification (identity + organization email)
 */
export function canUserSell(user: any): boolean {
  if (!user) return false

  // Check new verification system first
  if (user.verificationStatus) {
    return user.verificationStatus.canSell === true
  }

  // Fallback for legacy data
  return user.isVerified === true && user.isOrganizationEmailVerified === true
}

/**
 * Check if a user can contact sellers
 * Requires organization email verification
 */
export function canUserContact(user: any): boolean {
  if (!user) return false

  // Check new verification system first
  if (user.verificationStatus) {
    return user.verificationStatus.canContact === true
  }

  // Fallback for legacy data
  return user.isOrganizationEmailVerified === true
}

/**
 * Check if user has admin privileges
 */
export function isUserAdmin(user: any): boolean {
  if (!user) return false
  return user.isAdmin === true || user.role === 'admin'
}

/**
 * Get verification status display message
 */
export function getVerificationStatusMessage(user: any): string {
  if (!user) return 'Please log in to access this feature'

  // Use new verification system
  if (user.verificationStatus) {
    const status = user.verificationStatus

    if (status.isFullyVerified) {
      return 'Account fully verified - access to all features'
    }

    if (!status.isOrganizationEmailVerified) {
      return 'Please verify your organization email to access this feature'
    }

    if (!status.isIdentityVerified) {
      return 'Please complete identity verification to access seller features'
    }

    return 'Verification in progress'
  }

  // Fallback for legacy data
  if (!user.isOrganizationEmailVerified) {
    return 'Please verify your organization email to access this feature'
  }

  if (!user.isVerified) {
    return 'Please complete identity verification to access seller features'
  }

  return 'Account verified'
}

/**
 * Get next verification step for user
 */
export function getNextVerificationStep(
  user: any
): 'login' | 'organization-email' | 'identity' | 'complete' {
  if (!user) return 'login'

  // Use new verification system
  if (user.verificationStatus) {
    const status = user.verificationStatus

    if (status.isFullyVerified) return 'complete'
    if (!status.isOrganizationEmailVerified) return 'organization-email'
    if (!status.isIdentityVerified) return 'identity'
    return 'complete'
  }

  // Fallback for legacy data
  if (!user.isOrganizationEmailVerified) {
    return 'organization-email'
  }

  if (!user.isVerified) {
    return 'identity'
  }

  return 'complete'
}

/**
 * Check what actions a user can perform
 */
export function getUserCapabilities(user: any) {
  const canBuyUser = canUserBuy(user)
  const canSellUser = canUserSell(user)
  const canContactUser = canUserContact(user)
  const isAdmin = isUserAdmin(user)

  // Check if user is fully verified
  let isFullyVerified = false
  if (user?.verificationStatus) {
    isFullyVerified = user.verificationStatus.isFullyVerified === true
  } else {
    // Fallback for legacy data
    isFullyVerified = user?.isVerified === true && user?.isOrganizationEmailVerified === true
  }

  return {
    canBuy: canBuyUser,
    canSell: canSellUser,
    canContact: canContactUser,
    isAdmin,
    isFullyVerified,
    nextStep: getNextVerificationStep(user),
    statusMessage: getVerificationStatusMessage(user),
  }
}
