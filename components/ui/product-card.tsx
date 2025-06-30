'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Star, MapPin, Shield, Crown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { FeaturedItem } from '@/lib/types'

interface ProductCardProps {
  product: FeaturedItem
  viewMode?: 'grid' | 'list'
  className?: string
  onViewDetails?: (productId: number) => void
}

export function ProductCard({
  product,
  viewMode = 'grid',
  className,
  onViewDetails,
}: ProductCardProps) {
  const router = useRouter()

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product.id)
    } else {
      router.push(`/product/${product.id}`)
    }
  }

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
        'bg-white border-slate-200 rounded-2xl overflow-hidden h-full flex flex-col',
        className
      )}
      role="article"
      aria-labelledby={`product-title-${product.id}`}
      onClick={handleViewDetails}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleViewDetails()
        }
      }}
      tabIndex={0}
    >
      <CardContent className="p-0 h-full flex flex-col">
        <div className={cn('h-full', viewMode === 'list' ? 'flex' : 'flex flex-col')}>
          {/* Image */}
          <div
            className={cn(
              'relative overflow-hidden flex-shrink-0',
              viewMode === 'list' ? 'w-48' : 'rounded-t-2xl'
            )}
          >
            <Image
              src={product.image || '/placeholder.svg'}
              alt={`${product.title} product image`}
              width={viewMode === 'list' ? 192 : 300}
              height={viewMode === 'list' ? 192 : 200}
              className={cn(
                'object-cover group-hover:scale-105 transition-transform duration-300',
                viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'
              )}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2" aria-label="Product badges">
              {product.isVerified && (
                <Badge
                  className="bg-green-500 text-white flex items-center gap-1 shadow-lg"
                  aria-label="Verified seller"
                >
                  <Shield className="w-3 h-3" aria-hidden="true" />
                  Verified
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex-1 flex flex-col h-full">
            {/* Title - Fixed height with line clamping */}
            <div className="mb-3">
              <h3
                id={`product-title-${product.id}`}
                className="font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-900 transition-colors text-lg leading-6 min-h-[3rem]"
              >
                {product.title}
              </h3>
            </div>

            {/* Price - Fixed height */}
            <div className="flex items-center gap-2 mb-4 min-h-[2rem]" aria-label="Product pricing">
              <span
                className="text-2xl font-bold text-amber-600"
                aria-label={`Current price ${product.price}`}
              >
                {product.price}
              </span>
              {product.originalPrice && (
                <span
                  className="text-sm text-slate-500 line-through"
                  aria-label={`Original price ${product.originalPrice}`}
                >
                  {product.originalPrice}
                </span>
              )}
            </div>

            {/* Seller Info - Fixed height */}
            <div className="flex items-center justify-between mb-3 min-h-[1.5rem]">
              <div
                className="flex items-center gap-1"
                aria-label={`Rating ${product.rating} out of 5 stars with ${product.reviews} reviews`}
              >
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-slate-500">({product.reviews})</span>
              </div>
              <span
                className="text-sm text-slate-600 truncate max-w-[120px]"
                aria-label={`Sold by ${product.seller}`}
              >
                {product.seller}
              </span>
            </div>

            {/* Location - Fixed height */}
            <div
              className="flex items-center gap-1 mb-4 min-h-[1.5rem]"
              aria-label={`Location: ${product.location}`}
            >
              <MapPin className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <span className="text-sm text-slate-600">{product.location}</span>
            </div>

            {/* Bottom Section - Pushed to bottom */}
            <div className="mt-auto">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Secure Purchase
                  </span>
                  <span>Fast Delivery</span>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 group/btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewDetails()
                }}
                aria-label={`View details for ${product.title}`}
              >
                <span className="flex items-center justify-center gap-2">
                  View Product
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
