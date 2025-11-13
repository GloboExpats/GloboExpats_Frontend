'use client'

import React, { useEffect, useState } from 'react'
import SectionHeader from '@/components/sections/section-header'
import { apiClient } from '@/lib/api'
import { extractContentFromResponse, transformBackendProduct } from '@/lib/image-utils'
import type { FeaturedItem } from '@/lib/types'
import { ProductCard } from '@/components/ui/product-card'
import { trackProductClick } from '@/lib/analytics'
import { Loader2 } from 'lucide-react'

export default function FeaturedGrid() {
  const [items, setItems] = useState<FeaturedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await apiClient.getAllProducts(0)
        const content = extractContentFromResponse(res)

        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[FeaturedGrid] Fetched ${content.length} products, getting real click counts...`
          )
        }

        // Get real view counts for featured products
        const productsWithRealViews = await Promise.all(
          content.slice(0, 25).map(async (it) => {
            const product = it as Record<string, unknown>
            const productId = product.productId as number

            try {
              // Get real click count data
              const clickData = await apiClient.getProductClickCount(productId)
              const realViews = clickData.clicks || 0

              if (process.env.NODE_ENV === 'development') {
                console.log(`[FeaturedGrid] Product ${productId}: REAL clickCount=${realViews}`)
              }

              const transformed = transformBackendProduct(product)
              return {
                ...transformed,
                views: realViews,
              }
            } catch {
              // Fallback to hardcoded value if API call fails
              const fallbackViews = (product.clickCount as number) || 0

              if (process.env.NODE_ENV === 'development') {
                console.warn(
                  `[FeaturedGrid] Product ${productId}: Failed to get real click count, using fallback=${fallbackViews}`
                )
              }

              const transformed = transformBackendProduct(product)
              return {
                ...transformed,
                views: fallbackViews,
              }
            }
          })
        )

        setItems(productsWithRealViews)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load featured products')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <section className="py-4 sm:py-6 lg:py-8">
      <div className="mx-4 sm:mx-6 lg:mx-0 lg:pr-8">
        <SectionHeader title="Featured Collection" subtitle="Handpicked items for you" />
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 p-1">
            {items.map((item) => (
              <div key={`featured-${item.id}`}>
                <ProductCard
                  product={item}
                  onViewDetails={(id) => trackProductClick(id, 'featured')}
                  compact
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
