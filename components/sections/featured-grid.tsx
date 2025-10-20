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
        // Limit to 12 items (3 columns x 4 rows)
        setItems(
          content.slice(0, 12).map((it) => transformBackendProduct(it as Record<string, unknown>))
        )
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load featured products')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <section className="py-6 sm:py-12 lg:py-16">
      <div className="mx-4 sm:mx-6 lg:mx-0 lg:pr-8">
        <SectionHeader title="Featured Collection" subtitle="Handpicked items for you" />
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6 p-1">
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
