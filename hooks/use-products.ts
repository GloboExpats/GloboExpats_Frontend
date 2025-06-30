/**
 * Product Data Management Hooks
 *
 * Provides hooks for fetching and managing product data with proper error handling,
 * loading states, and automatic refetching capabilities.
 *
 * @example Basic usage:
 * ```tsx
 * const { products, loading, error, refetch } = useProducts({
 *   category: 'electronics',
 *   page: 1,
 *   limit: 20
 * })
 * ```
 *
 * @example Single product:
 * ```tsx
 * const { product, loading, error } = useProduct('product-id')
 * ```
 */

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { ListingItem } from '@/lib/types'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Configuration options for the products list hook
 */
interface UseProductsOptions {
  /** Filter products by category slug */
  category?: string
  /** Page number for pagination (1-based) */
  page?: number
  /** Number of items per page */
  limit?: number
  /** Search query string */
  search?: string
}

/**
 * Return type for the products list hook
 */
interface UseProductsReturn {
  /** Array of product listings */
  products: ListingItem[]
  /** Loading state indicator */
  loading: boolean
  /** Error message if request failed */
  error: string | null
  /** Function to manually refetch products */
  refetch: () => Promise<void>
}

/**
 * Return type for the single product hook
 */
interface UseProductReturn {
  /** Single product data */
  product: ListingItem | null
  /** Loading state indicator */
  loading: boolean
  /** Error message if request failed */
  error: string | null
}

// ============================================================================
// PRODUCTS LIST HOOK
// ============================================================================

/**
 * Hook for fetching and managing a list of products
 *
 * Automatically refetches when options change and provides error handling
 * and loading states. Suitable for product listings, search results, and
 * category pages.
 *
 * @param options - Configuration for filtering and pagination
 * @returns Product list state and refetch function
 *
 * @example
 * ```tsx
 * function ProductGrid() {
 *   const { products, loading, error } = useProducts({
 *     category: 'electronics',
 *     limit: 12
 *   })
 *
 *   if (loading) return <ProductSkeleton />
 *   if (error) return <ErrorMessage message={error} />
 *
 *   return (
 *     <div className="grid grid-cols-3 gap-4">
 *       {products.map(product => (
 *         <ProductCard key={product.id} product={product} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<ListingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetches products from the API with current options
   * Handles loading states and error management
   */
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.products.list(options)
      setProducts((response.data as ListingItem[]) || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products'
      setError(errorMessage)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Auto-refetch when options change
  useEffect(() => {
    fetchProducts()
  }, [options.category, options.page, options.limit, options.search])

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  }
}

// ============================================================================
// SINGLE PRODUCT HOOK
// ============================================================================

/**
 * Hook for fetching a single product by ID
 *
 * Automatically fetches when the ID changes and provides loading states
 * and error handling. Suitable for product detail pages.
 *
 * @param id - Product ID to fetch
 * @returns Single product state
 *
 * @example
 * ```tsx
 * function ProductDetails({ productId }: { productId: string }) {
 *   const { product, loading, error } = useProduct(productId)
 *
 *   if (loading) return <ProductDetailSkeleton />
 *   if (error) return <ErrorMessage message={error} />
 *   if (!product) return <NotFound />
 *
 *   return <ProductDetailView product={product} />
 * }
 * ```
 */
export function useProduct(id: string): UseProductReturn {
  const [product, setProduct] = useState<ListingItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    /**
     * Fetches a single product from the API
     * Handles loading states and error management
     */
    async function fetchProduct() {
      // Skip fetch if no ID provided
      if (!id) return

      try {
        setLoading(true)
        setError(null)
        const response = await api.products.get(id)
        setProduct(response.data as ListingItem)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product'
        setError(errorMessage)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  return { product, loading, error }
}
