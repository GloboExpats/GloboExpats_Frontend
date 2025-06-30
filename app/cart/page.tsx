'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  Shield,
  ArrowRight,
  ShoppingBag,
  Heart,
  Star,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/utils'
import Breadcrumb from '@/components/breadcrumb'
import { useVerification } from '@/hooks/use-verification'
import { useAuth } from '@/hooks/use-auth'
import { VerificationPopup } from '@/components/verification-popup'

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    originalTotal,
    savings,
    isEmpty,
    hasVerifiedSellers,
    updateQuantity,
    removeFromCart,
    clearCart,
    contactSeller,
    selectedItems,
    selectedItemsData,
    selectedSubtotal,
    selectedOriginalTotal,
    selectedSavings,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
  } = useCart()

  const { isVerifiedBuyer, isLoading } = useAuth()
  const { checkVerification, isVerificationPopupOpen, closeVerificationPopup } = useVerification()

  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false)

  // Handle checkout click for unverified users
  const handleCheckoutClick = (e: React.MouseEvent) => {
    if (!isVerifiedBuyer) {
      e.preventDefault()
      setShowVerificationPrompt(true)
      checkVerification('buy')
    }
  }

  // Handle item selection for bulk operations
  const handleItemSelection = (itemId: string, checked: boolean) => {
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

  // Apply promo code (mock functionality)
  const applyPromoCode = () => {
    const validPromoCodes: Record<string, number> = {
      expat10: 0.1,
      welcome5: 0.05,
      eastafrica15: 0.15,
      kenya20: 0.2,
    }

    const discount = validPromoCodes[promoCode.toLowerCase()]
    if (discount) {
      setPromoDiscount(selectedSubtotal * discount)
    } else {
      setPromoDiscount(0)
    }
  }

  const finalTotal = selectedSubtotal - promoDiscount

  // Determine primary currency based on user's items or default to KES
  const primaryCurrency = 'KES' // Default to Kenyan Shillings

  // Currency formatter for East African currencies
  const formatCurrency = (amount: number, currency: string = primaryCurrency) => {
    return `${currency} ${amount.toLocaleString()}`
  }

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="bg-white shadow-lg border-b-4 border-blue-100">
          <div className="container mx-auto px-4 py-4">
            <Breadcrumb />
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-200 to-green-200 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
              <ShoppingBag className="w-16 h-16 text-blue-600" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-6">
              Your Cart is Empty
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              🛍️ Start shopping to find amazing deals from verified sellers across East Africa! 🌍
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-brand-primary hover:bg-blue-700">
                <Link href="/browse">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Browse Items
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/category/electronics">Explore Electronics</Link>
              </Button>
            </div>

            {/* Trust indicators for empty state */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-2">Verified Sellers</h3>
                <p className="text-sm text-neutral-600">
                  Buy with confidence from verified expat community
                </p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium mb-2">Direct Communication</h3>
                <p className="text-sm text-neutral-600">
                  Chat directly with sellers before purchasing
                </p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium mb-2">Local Delivery</h3>
                <p className="text-sm text-neutral-600">
                  Fast delivery across Kenya, Tanzania, Uganda & Rwanda
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="bg-white shadow-lg border-b-4 border-blue-100">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
                  Shopping Cart
                </h1>
                <p className="text-xl text-gray-600">
                  🛒 {itemCount} {itemCount === 1 ? 'item' : 'items'} • Ready for checkout
                </p>
              </div>
              {items.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearCart()}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            {hasVerifiedSellers && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your cart contains items from verified sellers with buyer protection.
                </AlertDescription>
              </Alert>
            )}

            {/* Select All */}
            <div className="bg-white rounded-lg p-4 mb-4 border">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedItems.length === items.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="font-medium">
                  Select All ({selectedItems.length} of {items.length} selected)
                </span>
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Selection Checkbox */}
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) =>
                          handleItemSelection(item.id, checked as boolean)
                        }
                        className="mt-1"
                      />

                      {/* Product Image */}
                      <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-neutral-800 line-clamp-2 mb-2">
                              {item.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Badge variant="outline" className="text-xs">
                                {item.condition}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-neutral-500">
                                <MapPin className="w-3 h-3" />
                                {item.location}
                              </div>
                            </div>

                            {/* Seller Info */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm text-neutral-600">Sold by:</span>
                              <span className="font-medium text-sm">{item.sellerName}</span>
                              {item.verified && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-3">
                              <span className="text-xl font-bold text-neutral-800">
                                {formatCurrency(item.price)}
                              </span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <span className="text-sm text-neutral-500 line-through">
                                  {formatCurrency(item.originalPrice)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-3">
                            {/* Quantity Control */}
                            <div className="flex items-center gap-2 bg-neutral-50 rounded-lg p-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="min-w-[3rem] text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => contactSeller(item.id)}
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="sticky top-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Promo Code */}
                  <div className="space-y-2">
                    <label htmlFor="promoCode" className="text-sm font-medium">
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="promoCode"
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="h-9"
                      />
                      <Button variant="outline" size="sm" onClick={applyPromoCode}>
                        Apply
                      </Button>
                    </div>
                    {promoDiscount > 0 && (
                      <p className="text-xs text-green-600">Promo code applied successfully!</p>
                    )}
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({selectedItems.length} items)</span>
                      <span>{formatCurrency(selectedSubtotal)}</span>
                    </div>

                    {selectedSavings > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Savings</span>
                        <span>-{formatCurrency(selectedSavings)}</span>
                      </div>
                    )}

                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Promo Discount</span>
                        <span>-{formatCurrency(promoDiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm text-neutral-500">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>

                  {/* Checkout Button */}
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-brand-primary hover:bg-blue-700"
                      size="lg"
                      disabled={selectedItems.length === 0}
                      onClick={handleCheckoutClick}
                    >
                      {isVerifiedBuyer ? (
                        <Link href="/checkout" className="flex items-center justify-center w-full">
                          Proceed to Checkout
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                      ) : (
                        <>
                          Proceed to Checkout
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>

                    {!isVerifiedBuyer && (
                      <p className="text-xs text-center text-amber-600">
                        Verification required to checkout
                      </p>
                    )}
                  </div>

                  {/* Continue Shopping */}
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/browse">Continue Shopping</Link>
                  </Button>

                  {/* Trust Indicators */}
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>Secure checkout process</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>Verified seller protection</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                      <span>Direct seller communication</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
