'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import SectionHeader from '@/components/sections/section-header'
import { apiClient } from '@/lib/api'
import { extractContentFromResponse, transformBackendProduct } from '@/lib/image-utils'
import type { FeaturedItem } from '@/lib/types'
import { ProductCard } from '@/components/ui/product-card'
import { trackProductClick } from '@/lib/analytics'

export default function NewListingsSlider() {
  const [items, setItems] = useState<FeaturedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await apiClient.getNewestListings(0, 20)
        const content = extractContentFromResponse(res)

        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[NewListings] Fetched ${content.length} products, getting real click counts...`
          )
        }

        // Get real view counts for new listings
        const productsWithRealViews = await Promise.all(
          content.slice(0, 8).map(async (it) => {
            const product = it as Record<string, unknown>
            const productId = product.productId as number

            try {
              // Get real click count data
              const clickData = await apiClient.getProductClickCount(productId)
              const realViews = clickData.clicks || 0

              if (process.env.NODE_ENV === 'development') {
                console.log(`[NewListings] Product ${productId}: REAL clickCount=${realViews}`)
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
                  `[NewListings] Product ${productId}: Failed to get real click count, using fallback=${fallbackViews}`
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
        setError(e instanceof Error ? e.message : 'Failed to load new listings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const scrollByAmount = (dir: 'left' | 'right') => {
    const el = scrollerRef.current
    if (!el) return
    const amount = el.clientWidth * 0.9
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section className="py-3 sm:py-4 lg:py-5">
      <div className="mx-4 sm:mx-6 lg:mx-0 lg:pr-8">
        <SectionHeader title="New Arrivals" subtitle="Latest items from the expat community" />

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="relative">
            <button
              aria-label="Scroll left"
              onClick={() => scrollByAmount('left')}
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-card hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={scrollerRef}
              className="flex gap-2 sm:gap-4 lg:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth px-2 sm:px-3 lg:px-1 py-2 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {items.map((item) => (
                <div
                  key={`new-${item.id}`}
                  className="snap-start shrink-0 w-[calc(50%-0.5rem)] sm:w-[45%] md:w-[32%] lg:w-[23%]"
                >
                  <ProductCard
                    product={item}
                    onViewDetails={(id) => trackProductClick(id, 'new')}
                    compact
                  />
                </div>
              ))}
            </div>

            <button
              aria-label="Scroll right"
              onClick={() => scrollByAmount('right')}
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-card hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
