'use client'

/**
 * =============================================================================
 * useSearch Hook - Advanced Search & Filtering
 * =============================================================================
 *
 * Comprehensive search hook for the marketplace with:
 * - Real-time filtering and sorting
 * - URL synchronization for shareable links
 * - Search suggestions and analytics
 * - Performance optimizations with memoization
 *
 * Backend Integration Points:
 * - GET /api/search - Main search endpoint
 * - GET /api/search/suggestions - Search autocomplete
 * - GET /api/search/analytics - Search metrics
 *
 * Usage:
 * ```tsx
 * const {
 *   results, isLoading, search, updateFilters
 * } = useSearch()
 *
 * // Search with query
 * search('iPhone 15')
 *
 * // Update filters
 * updateFilters({ category: 'Electronics' })
 * ```
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * =============================================================================
 * TYPE DEFINITIONS
 * =============================================================================
 */

export interface SearchFilters {
  category?: string
  condition?: string[]
  priceRange?: {
    min: number
    max: number
  }
  location?: string
  verified?: boolean
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'distance'
  currency?: string
}

export interface SearchProduct {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  condition: string
  category: string
  subcategory?: string
  sellerId: string
  sellerName: string
  sellerVerified: boolean
  sellerRating: number
  location: string
  distance?: number
  createdAt: string
  views: number
  likes: number
  isPromoted: boolean
  tags: string[]
}

interface SearchState {
  query: string
  filters: SearchFilters
  results: SearchProduct[]
  totalResults: number
  isLoading: boolean
  error: string | null
  hasMore: boolean
  page: number
}

interface SearchAnalytics {
  totalProducts: number
  categories: string[]
  priceRange: { min: number; max: number }
  locations: string[]
  verifiedSellers: number
}

/**
 * =============================================================================
 * MOCK DATA - Replace with API calls
 * =============================================================================
 */

const MOCK_PRODUCTS: SearchProduct[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
    description:
      'Excellent condition iPhone 15 Pro Max with all original accessories. Used for 3 months only.',
    price: 4200,
    originalPrice: 4999,
    images: ['/images/iphone-15-pro.jpg'],
    condition: 'Excellent',
    category: 'Electronics',
    subcategory: 'Mobile Phones',
    sellerId: 'seller1',
    sellerName: 'TechExpat',
    sellerVerified: true,
    sellerRating: 4.9,
    location: 'Dubai Marina',
    distance: 2.5,
    createdAt: '2024-01-15',
    views: 234,
    likes: 12,
    isPromoted: true,
    tags: ['apple', 'iphone', 'titanium', 'smartphone'],
  },
  {
    id: '2',
    title: 'MacBook Pro 14-inch M3 Pro - Space Black',
    description: 'Brand new MacBook Pro with M3 Pro chip. Still in sealed box with warranty.',
    price: 8999,
    originalPrice: 9999,
    images: ['/images/macbook-pro.jpg'],
    condition: 'New',
    category: 'Electronics',
    subcategory: 'Laptops',
    sellerId: 'seller2',
    sellerName: 'Dubai Tech Store',
    sellerVerified: true,
    sellerRating: 4.8,
    location: 'Business Bay',
    distance: 5.2,
    createdAt: '2024-01-10',
    views: 156,
    likes: 8,
    isPromoted: false,
    tags: ['apple', 'macbook', 'laptop', 'm3'],
  },
  {
    id: '3',
    title: 'Samsung 75-inch QLED 4K TV',
    description: 'Excellent condition Samsung QLED TV. Perfect for movie nights and gaming.',
    price: 2800,
    originalPrice: 3500,
    images: ['/images/samsung-tv.jpg'],
    condition: 'Very Good',
    category: 'Electronics',
    subcategory: 'TVs',
    sellerId: 'seller3',
    sellerName: 'Home Electronics',
    sellerVerified: false,
    sellerRating: 4.6,
    location: 'Jumeirah',
    distance: 8.1,
    createdAt: '2024-01-08',
    views: 89,
    likes: 5,
    isPromoted: false,
    tags: ['samsung', 'tv', 'qled', '4k'],
  },
]

/**
 * =============================================================================
 * UTILITY FUNCTIONS
 * =============================================================================
 */

/**
 * Checks if a product matches the search query
 */
const matchesSearchQuery = (product: SearchProduct, query: string): boolean => {
  if (!query) return true

  const searchLower = query.toLowerCase()
  return [product.title, product.description, product.category, ...product.tags].some((field) =>
    field.toLowerCase().includes(searchLower)
  )
}

/**
 * Applies all filters to a product
 */
const passesFilters = (product: SearchProduct, filters: SearchFilters): boolean => {
  // Category filter
  if (filters.category && product.category !== filters.category) {
    return false
  }

  // Condition filter
  if (filters.condition?.length && !filters.condition.includes(product.condition)) {
    return false
  }

  // Price range filter
  if (filters.priceRange) {
    const { min, max } = filters.priceRange
    if (product.price < min || product.price > max) {
      return false
    }
  }

  // Location filter (tolerant to missing product.location)
  if (filters.location) {
    const pLoc = (product.location || '').toLowerCase()
    if (!pLoc.includes(filters.location.toLowerCase())) {
      return false
    }
  }

  // Verified seller filter
  if (filters.verified && !product.sellerVerified) {
    return false
  }

  return true
}

/**
 * Sorts products based on the selected sort option
 */
const sortProducts = (
  products: SearchProduct[],
  sortBy: SearchFilters['sortBy']
): SearchProduct[] => {
  const sorted = [...products]

  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price)

    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price)

    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

    case 'oldest':
      return sorted.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )

    case 'distance':
      return sorted.sort((a, b) => (a.distance || 999) - (b.distance || 999))

    case 'relevance':
    default:
      // Promoted items first, then by engagement (views + weighted likes)
      return sorted.sort((a, b) => {
        if (a.isPromoted && !b.isPromoted) return -1
        if (!a.isPromoted && b.isPromoted) return 1

        const engagementA = a.views + a.likes * 10
        const engagementB = b.views + b.likes * 10
        return engagementB - engagementA
      })
  }
}

/**
 * =============================================================================
 * MAIN HOOK
 * =============================================================================
 */

export function useSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize state from URL parameters
  const [searchState, setSearchState] = useState<SearchState>(() => ({
    query: searchParams.get('q') || '',
    filters: {
      category: searchParams.get('category') || undefined,
      condition: searchParams.get('condition')?.split(',') || [],
      priceRange: {
        min: parseInt(searchParams.get('min_price') || '0'),
        max: parseInt(searchParams.get('max_price') || '999999'),
      },
      location: searchParams.get('location') || undefined,
      verified: searchParams.get('verified') === 'true',
      sortBy: (searchParams.get('sort') as SearchFilters['sortBy']) || 'relevance',
      currency: searchParams.get('currency') || 'AED',
    },
    results: [],
    totalResults: 0,
    isLoading: false,
    error: null,
    hasMore: true,
    page: 1,
  }))

  /**
   * =============================================================================
   * MEMOIZED COMPUTATIONS
   * =============================================================================
   */

  // Process and filter results
  const processedResults = useMemo(() => {
    const filtered = MOCK_PRODUCTS.filter(
      (product) =>
        matchesSearchQuery(product, searchState.query) &&
        passesFilters(product, searchState.filters)
    )

    return sortProducts(filtered, searchState.filters.sortBy)
  }, [searchState.query, searchState.filters])

  // Search analytics
  const searchAnalytics = useMemo(
    (): SearchAnalytics => ({
      totalProducts: MOCK_PRODUCTS.length,
      categories: Array.from(new Set(MOCK_PRODUCTS.map((p) => p.category))),
      priceRange: {
        min: Math.min(...MOCK_PRODUCTS.map((p) => p.price)),
        max: Math.max(...MOCK_PRODUCTS.map((p) => p.price)),
      },
      locations: Array.from(new Set(MOCK_PRODUCTS.map((p) => p.location))),
      verifiedSellers: MOCK_PRODUCTS.filter((p) => p.sellerVerified).length,
    }),
    []
  )

  /**
   * =============================================================================
   * EFFECTS
   * =============================================================================
   */

  // Update search results when processed results change
  useEffect(() => {
    setSearchState((prev) => ({
      ...prev,
      results: processedResults,
      totalResults: processedResults.length,
      isLoading: false,
    }))
  }, [processedResults])

  /**
   * =============================================================================
   * ACTION FUNCTIONS
   * =============================================================================
   */

  /**
   * Updates the URL with current search and filter parameters
   */
  const updateURL = useCallback(
    (query: string, filters: SearchFilters) => {
      const params = new URLSearchParams()

      // Add parameters only if they have meaningful values
      if (query) params.set('q', query)
      if (filters.category) params.set('category', filters.category)
      if (filters.condition?.length) params.set('condition', filters.condition.join(','))

      if (filters.priceRange) {
        if (filters.priceRange.min > 0) {
          params.set('min_price', filters.priceRange.min.toString())
        }
        if (filters.priceRange.max < 999999) {
          params.set('max_price', filters.priceRange.max.toString())
        }
      }

      if (filters.location) params.set('location', filters.location)
      if (filters.verified) params.set('verified', 'true')
      if (filters.sortBy && filters.sortBy !== 'relevance') params.set('sort', filters.sortBy)
      if (filters.currency && filters.currency !== 'AED') params.set('currency', filters.currency)

      const url = params.toString() ? `/search?${params.toString()}` : '/search'
      router.push(url, { scroll: false })
    },
    [router]
  )

  /**
   * Performs a search with optional filter updates
   */
  const search = useCallback(
    (query: string, newFilters: Partial<SearchFilters> = {}) => {
      const updatedFilters = { ...searchState.filters, ...newFilters }

      setSearchState((prev) => ({
        ...prev,
        query,
        filters: updatedFilters,
        isLoading: true,
        error: null,
        page: 1,
      }))

      updateURL(query, updatedFilters)
    },
    [searchState.filters, updateURL]
  )

  /**
   * Updates only the filters without changing the search query
   */
  const updateFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      search(searchState.query, newFilters)
    },
    [search, searchState.query]
  )

  /**
   * Clears all filters while keeping the search query
   */
  const clearFilters = useCallback(() => {
    const clearedFilters: SearchFilters = {
      sortBy: 'relevance',
      currency: 'AED',
    }
    search(searchState.query, clearedFilters)
  }, [search, searchState.query])

  /**
   * Clears both search query and filters
   */
  const clearSearch = useCallback(() => {
    search('', {})
  }, [search])

  /**
   * Generates search suggestions based on current query
   */
  const getSuggestions = useCallback((query: string): string[] => {
    if (!query || query.length < 2) return []

    const suggestions = new Set<string>()
    const queryLower = query.toLowerCase()

    MOCK_PRODUCTS.forEach((product) => {
      // Add matching product titles
      if (product.title.toLowerCase().includes(queryLower)) {
        suggestions.add(product.title)
      }

      // Add matching tags
      product.tags.forEach((tag) => {
        if (tag.toLowerCase().includes(queryLower)) {
          suggestions.add(tag)
        }
      })

      // Add matching categories
      if (product.category.toLowerCase().includes(queryLower)) {
        suggestions.add(product.category)
      }
    })

    return Array.from(suggestions).slice(0, 8)
  }, [])

  /**
   * =============================================================================
   * RETURN INTERFACE
   * =============================================================================
   */

  return {
    // Current State
    query: searchState.query,
    filters: searchState.filters,
    results: searchState.results,
    totalResults: searchState.totalResults,
    isLoading: searchState.isLoading,
    error: searchState.error,
    hasMore: searchState.hasMore,
    page: searchState.page,

    // Actions
    search,
    updateFilters,
    clearFilters,
    clearSearch,
    getSuggestions,

    // Analytics & Metadata
    getSearchAnalytics: () => searchAnalytics,
  }
}
