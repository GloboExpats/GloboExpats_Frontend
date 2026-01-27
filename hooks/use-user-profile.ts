/**
 * User Profile Management Hook
 *
 * Manages the current user's profile data, integrating with the seller profile system.
 * Provides consistent profile data for account settings and seller profile views.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { User } from '@/lib/types'
import { api } from '@/lib/api'

export interface UserProfileMethods {
  userProfile: User | null
  isLoading: boolean
  error: string | null

  // Profile management methods
  updateProfile: (updates: Partial<User>, profileImage?: File) => Promise<void>
  updateBasicInfo: (basicInfo: {
    name: string
    email: string
    organizationEmail?: string
  }) => Promise<void>

  // Utility methods
  getDisplayName: () => string
  getProfileSlug: () => string
  canEditProfile: () => boolean
  isSeller: () => boolean
}

export function useUserProfile(): UserProfileMethods {
  const { user, isLoggedIn, updateUser } = useAuth()
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize profile data
  useEffect(() => {
    const initializeProfile = async () => {
      if (!isLoggedIn || !user) {
        setUserProfile(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // TODO: Fetch additional profile data from backend if needed
        // GET /api/v1/users/{userId}/profile
        setUserProfile(user)
      } catch (err) {
        console.error('Failed to initialize user profile:', err)
        setError('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }

    initializeProfile()
  }, [isLoggedIn, user])

  // Update profile data
  const updateProfile = useCallback(
    async (updates: Partial<User>, profileImage?: File) => {
      if (!userProfile) {
        throw new Error('No profile to update')
      }

      try {
        setError(null)

        // Prepare backend update payload
        const updatePayload: {
          firstName?: string
          lastName?: string
          email?: string
          phoneNumber?: string
          location?: string
          country?: string
          region?: string
          aboutMe?: string
          organization?: string
          position?: string
        } = {}

        if (updates.firstName) updatePayload.firstName = updates.firstName
        if (updates.lastName) updatePayload.lastName = updates.lastName
        if (updates.email) updatePayload.email = updates.email
        if (updates.phoneNumber) updatePayload.phoneNumber = updates.phoneNumber

        if (updates.location) {
          updatePayload.location = updates.location

          // Parse location string to send structured country/region to backend
          if (updates.location.includes(',')) {
            const parts = updates.location.split(',').map((p) => p.trim())
            updatePayload.region = parts[0] // City

            const countryPart = parts.slice(1).join(', ')
            // Map common codes to full names
            const countryMap: Record<string, string> = {
              'TZ': 'Tanzania',
              'KE': 'Kenya',
              'UG': 'Uganda',
              'RW': 'Rwanda',
              'BI': 'Burundi',
            }
            updatePayload.country = countryMap[countryPart] || countryPart
          } else {
            // Check if it's a known country
            const countryMapLower: Record<string, string> = {
              'tanzania': 'Tanzania',
              'kenya': 'Kenya',
              'uganda': 'Uganda',
              'rwanda': 'Rwanda',
              'burundi': 'Burundi',
              'tz': 'Tanzania',
              'ke': 'Kenya',
              'ug': 'Uganda',
              'rw': 'Rwanda',
              'bi': 'Burundi'
            }
            const matched = countryMapLower[updates.location.toLowerCase()]
            if (matched) {
              updatePayload.country = matched
            } else {
              // Assume it might be just a city/region or custom text
              updatePayload.region = updates.location
            }
          }
        }

        if (updates.aboutMe) updatePayload.aboutMe = updates.aboutMe
        if (updates.organization) updatePayload.organization = updates.organization
        if (updates.position) updatePayload.position = updates.position

        // Call backend API to update profile with optional image
        await api.profile.update(updatePayload, profileImage)

        // Refetch user details to get updated profileImageUrl from backend
        const updatedUserDetails = await api.profile.get()

        // Keep relative URLs as-is for Next.js proxy (avoids CORS on production)
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || ''
        let imageUrl = updatedUserDetails.profileImageUrl

        // If the backend returns a relative path, keep it relative for proxy
        if (imageUrl && !imageUrl.startsWith('http')) {
          // Ensure leading slash for proper routing
          imageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
          imageUrl = `${BACKEND_URL}${imageUrl}`
        }

        // Extract backend verification status to avoid overwriting the frontend object
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { verificationStatus: backendStatus, ...restDetails } = updatedUserDetails

        // Update local state with fresh data from backend
        const freshProfile = {
          ...userProfile,
          ...updates,
          ...restDetails, // Merge fresh backend data (e.g. country, region) without conflicts
          backendVerificationStatus: backendStatus,
          avatar: imageUrl || userProfile.avatar,
          profileImageUrl: imageUrl,
        }

        setUserProfile(freshProfile)

        // Update auth user data so navigation bar reflects changes
        updateUser(freshProfile)
      } catch (err) {
        console.error('Failed to update profile:', err)
        setError('Failed to update profile')
        throw err
      }
    },
    [userProfile, updateUser]
  )

  // Update basic information
  const updateBasicInfo = useCallback(
    async (basicInfo: { name: string; email: string; organizationEmail?: string }) => {
      const updates: Partial<User> = {
        name: basicInfo.name,
        email: basicInfo.email,
        organizationEmail: basicInfo.organizationEmail,
      }

      await updateProfile(updates)
    },
    [updateProfile]
  )

  // Utility methods
  const getDisplayName = useCallback(() => {
    return userProfile?.name || user?.name || 'Unknown User'
  }, [userProfile, user])

  const getProfileSlug = useCallback(() => {
    // Generate slug from user name
    return (
      userProfile?.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() || 'user'
    )
  }, [userProfile])

  const canEditProfile = useCallback(() => {
    return isLoggedIn && !!userProfile
  }, [isLoggedIn, userProfile])

  const isSeller = useCallback(() => {
    // Check if user has SELLER role from backend
    return user?.roles?.some((role) => role.roleName === 'SELLER') || false
  }, [user])

  return {
    userProfile,
    isLoading,
    error,
    updateProfile,
    updateBasicInfo,
    getDisplayName,
    getProfileSlug,
    canEditProfile,
    isSeller,
  }
}
