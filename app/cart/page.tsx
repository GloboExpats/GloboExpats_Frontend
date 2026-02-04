'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingCart,
  Trash2,
  Shield,
  ArrowRight,
  ShoppingBag,
  Star,
  MapPin,
  Minus,
  Plus,
  Info,
  ChevronRight,
  Heart,
  Truck,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useCart } from '@/hooks/use-cart'
import { cleanLocationString, transformBackendProduct } from '@/lib/image-utils'
import PriceDisplay from '@/components/price-display'
import { useState, useEffect, useMemo } from 'react'
import { apiClient } from '@/lib/api'
import { ProductCard } from '@/components/ui/product-card'
import { FeaturedItem } from '@/lib/types'

export default function CartPage() {
  const {
    items,
    itemCount,
    isEmpty,
    removeFromCart,
    clearCart,
    selectedItems,
    selectedSubtotal,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    updateQuantity,
  } = useCart()

  const [stockLimits, setStockLimits] = useState<Record<string, number>>({})
  const [recommendations, setRecommendations] = useState<FeaturedItem[]>([])
  const [loadingRecs, setLoadingRecs] = useState(true)

  // Group items by seller
  const groupedItems = useMemo(() => {
    return items.reduce((acc, item) => {
      const sellerId = item.expatId || item.expatName || 'unknown'
      if (!acc[sellerId]) {
        acc[sellerId] = {
          sellerName: item.expatName || 'Seller',
          sellerId: item.expatId,
          verified: item.verified,
          items: [],
        }
      }
      acc[sellerId].items.push(item)
      return acc
    }, {} as Record<string, { sellerName: string; sellerId: string; verified: boolean; items: typeof items }>)
  }, [items])

  // Fetch recommendations
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        setLoadingRecs(true)
        const response = await apiClient.getAllProductsComplete(1)
        const products = (response as any).content || []
        const transformed = products
          .slice(0, 5)
          .map((p: any) => transformBackendProduct(p))
        setRecommendations(transformed)
      } catch (err) {
        console.error('Failed to fetch recommendations:', err)
      } finally {
        setLoadingRecs(false)
      }
    }
    fetchRecs()
  }, [])

  // Fetch real-time stock limits for items in cart
  useEffect(() => {
    const fetchStockLimits = async () => {
      const limits: Record<string, number> = {}

      await Promise.all(
        items.map(async (item) => {
          try {
            const rawId = typeof item.productId === 'number' ? item.productId : Number(item.productId)
            // Fallback for older cart items that might simple have id
            const fallbackId = Number(item.id)
            const productIdValue = Number.isFinite(rawId) ? rawId : fallbackId

            if (!Number.isFinite(productIdValue)) return

            // Using apiClient to fetch details which includes current productQuantity
            const details = await apiClient.getProductDetails(productIdValue) as any

            if (details && (typeof details.productQuantity === 'number' || typeof details.quantity === 'number')) {
              // Prefer productQuantity, fallback to quantity
              const available = details.productQuantity ?? details.quantity
              limits[item.id] = available
            }
          } catch (err) {
            console.error(`Failed to fetch stock for item ${item.title}:`, err)
          }
        })
      )

      setStockLimits(prev => ({ ...prev, ...limits }))
    }

    if (items.length > 0) {
      fetchStockLimits()
    }
  }, [items])

  // Final total is simply the selected subtotal (using asking price only)
  const finalTotal = selectedSubtotal

  // Handle item selection for bulk operations
  const handleItemSelection = (itemId: string, _checked: boolean) => {
    toggleItemSelection(itemId)
  }

  // Select/deselect all items
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      selectAllItems()
    } else {
      deselectAllItems()
    }
  }

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-white shadow-sm border border-neutral-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-neutral-300" />
          </div>

          <h1 className="text-3xl font-bold text-neutral-900 mb-3">Your Cart is Empty</h1>
          <p className="text-neutral-500 mb-10 max-w-md mx-auto">
            Ready to find some amazing local expat deals? Start exploring what's available today!
          </p>

          <Link href="/browse">
            <Button
              size="lg"
              className="bg-[#3665f3] hover:bg-[#3665f3]/90 text-white px-10 py-6 rounded-full text-lg font-semibold shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95"
            >
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] pt-24 pb-24">
      <div className="container mx-auto px-4 max-w-[1240px]">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#191919]">Cart</h1>
            <p className="text-sm text-neutral-500 mt-1">
              You have {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <button
            onClick={() => clearCart()}
            className="text-sm font-medium text-red-600 hover:underline flex items-center gap-1.5 self-start"
          >
            <Trash2 className="w-4 h-4" />
            Clear all items
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {Object.entries(groupedItems).map(([sellerId, group]) => (
              <div key={sellerId} className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] overflow-hidden">
                {/* Seller Header */}
                <div className="px-6 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 border border-neutral-100">
                      <AvatarFallback className="bg-blue-50 text-blue-600 text-xs font-bold">
                        {group.sellerName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Link
                      href={`/seller/${group.sellerId || group.sellerName}`}
                      className="text-base font-bold text-[#191919] hover:underline flex items-center gap-1.5"
                    >
                      {group.sellerName}
                      {group.verified && (
                        <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                      )}
                    </Link>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-medium">
                    <Truck className="w-3.5 h-3.5" />
                    Ships from {cleanLocationString(group.items[0].location)}
                  </div>
                </div>

                <div className="divide-y divide-[#f0f0f0]">
                  {group.items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex gap-6">
                        {/* Selector and Image */}
                        <div className="flex flex-shrink-0 gap-4">
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => toggleItemSelection(item.id)}
                            className="mt-1 border-[#707070] data-[state=checked]:bg-[#3665f3] data-[state=checked]:border-[#3665f3]"
                          />
                          <div className="relative w-28 h-28 sm:w-36 sm:h-36 bg-[#f7f7f7] rounded-lg overflow-hidden border border-[#eee]">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover transition-transform hover:scale-105"
                            />
                          </div>
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge variant="secondary" className="bg-[#f0f0f0] text-[#191919] border-none px-2 py-0 text-[10px] font-medium">
                                {item.condition.toUpperCase()}
                              </Badge>
                            </div>

                            <h3 className="text-lg font-medium text-[#191919] leading-snug mb-2 hover:text-[#3665f3] transition-colors line-clamp-2">
                              <Link href={`/product/${item.productId || item.id}`}>{item.title}</Link>
                            </h3>

                            <div className="flex flex-col gap-1.5 mb-4">
                              <div className="text-2xl font-bold text-[#191919]">
                                <PriceDisplay price={item.price * item.quantity} weight="bold" />
                              </div>
                              {item.quantity > 1 && (
                                <div className="text-xs text-neutral-500">
                                  TZS {item.price.toLocaleString()} each
                                </div>
                              )}
                              <div className="text-sm font-medium text-[#191919] mt-1 flex items-center gap-1">
                                <span>+ TZS 0.00</span>
                                <span className="text-neutral-500 font-normal">shipping</span>
                              </div>
                              <div className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                                <Truck className="w-3.5 h-3.5" />
                                Standard Shipping Process.
                              </div>
                            </div>

                            {/* Actions Grouped */}
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-auto">
                              {/* Quantity Selector Style like eBay */}
                              <div className="flex items-center">
                                <span className="text-sm text-neutral-500 mr-2">Qty</span>
                                <div className="flex items-center border border-[#e5e5e5] rounded-lg bg-white overflow-hidden shadow-sm">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="p-1.5 hover:bg-[#f7f7f7] text-[#707070] transition-colors"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <input
                                    type="text"
                                    value={item.quantity}
                                    readOnly
                                    className="w-10 text-center text-sm font-bold text-[#191919] border-x border-[#e5e5e5]"
                                  />
                                  <button
                                    onClick={() => updateQuantity(item.id, Math.min(stockLimits[item.id] ?? 99, item.quantity + 1))}
                                    className="p-1.5 hover:bg-[#f7f7f7] text-[#707070] transition-colors"
                                    disabled={item.quantity >= (stockLimits[item.id] ?? 99)}
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <button className="text-sm font-medium text-[#3665f3] hover:underline flex items-center gap-1.5">
                                <Heart className="w-4 h-4" />
                                Save for later
                              </button>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-sm font-medium text-red-600 hover:underline flex items-center gap-1.5"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Column */}
          <div className="lg:w-[360px]">
            <Card className="sticky top-24 bg-white rounded-2xl shadow-sm border border-[#e5e5e5] overflow-hidden">
              <div className="p-6 space-y-6">
                <h2 className="text-2xl font-bold text-[#191919]">Order summary</h2>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm text-[#191919]">
                    <span>Item ({selectedItems.length})</span>
                    <PriceDisplay price={selectedSubtotal} size="sm" />
                  </div>
                  <div className="flex justify-between items-center text-sm text-[#191919]">
                    <div className="flex items-center gap-1">
                      <span>Shipping to 00000</span>
                      <Info className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <span>TZS 0.00</span>
                  </div>
                </div>

                <Separator className="bg-[#f0f0f0]" />

                <div className="flex justify-between items-end">
                  <span className="text-xl font-bold text-[#191919]">Subtotal</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#191919]">
                      <PriceDisplay price={selectedSubtotal} />
                    </div>
                  </div>
                </div>

                <Link href="/checkout">
                  <Button
                    size="lg"
                    className="w-full bg-[#3665f3] hover:bg-[#3665f3]/90 text-white font-bold py-7 rounded-full text-lg shadow-lg shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    disabled={selectedItems.length === 0}
                  >
                    Go to checkout
                  </Button>
                </Link>

                <div className="pt-2 text-center">
                  <p className="text-[10px] text-neutral-400">
                    Items are held for a limited time based on availability
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#191919]">These are for you</h2>
              <p className="text-sm text-neutral-500 font-medium tracking-wide">Featured</p>
            </div>
            <Link href="/browse" className="text-sm font-bold text-[#3665f3] hover:underline flex items-center gap-1">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {loadingRecs ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="aspect-square bg-neutral-200 rounded-xl" />
                  <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  <div className="h-4 bg-neutral-200 rounded w-1/2" />
                </div>
              ))
            ) : (
              recommendations.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className="bg-white border border-[#e5e5e5] shadow-sm hover:shadow-md transition-shadow"
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
