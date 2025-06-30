/**
 * Seller Data Management System
 *
 * Centralized system for managing seller profiles and connecting them with products.
 * Provides dynamic seller data for profile pages and product displays.
 */

import { SellerProfile, SellerInfo } from '@/lib/types'

/**
 * Generate URL-friendly slug from seller name
 */
export function generateSellerSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

/**
 * Mock seller profiles database
 * In a real app, this would come from your backend API
 */
export const SELLER_PROFILES: SellerProfile[] = [
  {
    id: 'sarah-mitchell',
    name: 'Dr. Sarah Mitchell',
    email: 'sarah.mitchell@un.org',
    avatar: '/images/seller-avatar-1.jpg',
    verified: true,
    rating: 4.9,
    reviewCount: 87,
    responseTime: '< 1 hour',
    location: 'Dar es Salaam, TZ',
    memberSince: '2022-03',
    totalListings: 23,
    completedSales: 89,
    bio: 'UN Development Officer with expertise in sustainable technology and quality electronics. Passionate about connecting expats with reliable, authentic products.',
    specialties: ['Electronics', 'Smart Home', 'Sustainability'],
    languages: ['English', 'Swahili', 'French'],
    verificationBadges: {
      identity: true,
      email: true,
      phone: true,
      address: true,
    },
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sarahmitchell',
    },
    businessInfo: {
      type: 'individual',
    },
  },
  {
    id: 'ahmed-hassan',
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@expatlife.com',
    avatar: '/images/seller-avatar-2.jpg',
    verified: true,
    rating: 4.8,
    reviewCount: 156,
    responseTime: '< 2 hours',
    location: 'Nairobi, KE',
    memberSince: '2021-11',
    totalListings: 45,
    completedSales: 123,
    bio: 'Tech entrepreneur and expat community leader. Specializing in premium electronics and automotive accessories for the expatriate community.',
    specialties: ['Electronics', 'Automotive', 'Mobile Devices'],
    languages: ['English', 'Arabic', 'Swahili'],
    verificationBadges: {
      identity: true,
      email: true,
      phone: true,
      address: true,
    },
    businessInfo: {
      type: 'individual',
    },
  },
  {
    id: 'techexpat-store',
    name: 'TechExpat Store',
    email: 'info@techexpatstore.com',
    avatar: '/images/seller-avatar-3.jpg',
    verified: true,
    rating: 4.9,
    reviewCount: 342,
    responseTime: '< 30 minutes',
    location: 'Dubai, UAE',
    memberSince: '2020-12',
    totalListings: 156,
    completedSales: 567,
    bio: 'Professional tech equipment seller specializing in quality Apple products and electronics. Serving the Dubai community with authentic, high-quality devices.',
    specialties: ['Apple Products', 'Professional Equipment', 'Cameras'],
    languages: ['English', 'Arabic'],
    verificationBadges: {
      identity: true,
      email: true,
      phone: true,
      address: true,
    },
    businessInfo: {
      type: 'company',
      companyName: 'TechExpat Trading LLC',
    },
  },
  {
    id: 'maria-rodriguez',
    name: 'Maria Rodriguez',
    email: 'maria.r@globalexpat.org',
    avatar: '/images/seller-avatar-4.jpg',
    verified: true,
    rating: 4.7,
    reviewCount: 98,
    responseTime: '< 1 hour',
    location: 'Kampala, UG',
    memberSince: '2023-01',
    totalListings: 12,
    completedSales: 34,
    bio: 'International development professional with a passion for home décor and quality furniture. Creating beautiful spaces for expat homes.',
    specialties: ['Furniture', 'Home Décor', 'Kitchenware'],
    languages: ['English', 'Spanish', 'Portuguese'],
    verificationBadges: {
      identity: true,
      email: true,
      phone: false,
      address: true,
    },
    businessInfo: {
      type: 'individual',
    },
  },
]

/**
 * Seller name to profile mapping for existing products
 */
export const SELLER_NAME_MAPPING: Record<string, string> = {
  'Dr. Sarah Mitchell': 'sarah-mitchell',
  'Ahmed Hassan': 'ahmed-hassan',
  'TechExpat Store': 'techexpat-store',
  'Maria Rodriguez': 'maria-rodriguez',
  'James Thompson': 'james-thompson',
  'David Chen': 'david-chen',
  'Sophie Laurent': 'sophie-laurent',
  "Michael O'Connor": 'michael-oconnor',
  'Fatima Al-Zahra': 'fatima-alzahra',
  'Roberto Silva': 'roberto-silva',
}

/**
 * Get seller profile by ID
 */
export function getSellerProfile(sellerId: string): SellerProfile | null {
  return SELLER_PROFILES.find((seller) => seller.id === sellerId) || null
}

/**
 * Get seller profile by name (for backward compatibility)
 */
export function getSellerProfileByName(sellerName: string): SellerProfile | null {
  const sellerId = SELLER_NAME_MAPPING[sellerName]
  if (!sellerId) return null
  return getSellerProfile(sellerId)
}

/**
 * Get seller info for product displays
 */
export function getSellerInfo(sellerName: string): SellerInfo | null {
  const profile = getSellerProfileByName(sellerName)
  if (!profile) return null

  return {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    verified: profile.verified,
    rating: profile.rating,
    reviewCount: profile.reviewCount,
    location: profile.location,
    responseTime: profile.responseTime,
    profileSlug: profile.id,
  }
}

/**
 * Get all seller profiles (for directory/browsing)
 */
export function getAllSellerProfiles(): SellerProfile[] {
  return SELLER_PROFILES
}

/**
 * Search sellers by location
 */
export function getSellersByLocation(location: string): SellerProfile[] {
  return SELLER_PROFILES.filter((seller) =>
    seller.location.toLowerCase().includes(location.toLowerCase())
  )
}

/**
 * Search sellers by specialty
 */
export function getSellersBySpecialty(specialty: string): SellerProfile[] {
  return SELLER_PROFILES.filter((seller) =>
    seller.specialties?.some((s) => s.toLowerCase().includes(specialty.toLowerCase()))
  )
}

/**
 * Get seller verification status
 */
export function getSellerVerificationStatus(sellerId: string) {
  const profile = getSellerProfile(sellerId)
  if (!profile) return null

  const verificationCount = Object.values(profile.verificationBadges).filter(Boolean).length
  const totalVerifications = Object.keys(profile.verificationBadges).length

  return {
    isFullyVerified: verificationCount === totalVerifications,
    verificationLevel: Math.round((verificationCount / totalVerifications) * 100),
    badges: profile.verificationBadges,
  }
}
