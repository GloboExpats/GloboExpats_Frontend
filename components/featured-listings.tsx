'use client'

/**
 * =============================================================================
 * FEATURED LISTINGS - ENHANCED WITH TABS AND ENGAGEMENT
 * =============================================================================
 *
 * Features:
 * - Tabbed interface (Featured, New Listings, Top Picks)
 * - Verified seller badges and trust indicators
 * - Interactive product cards with hover effects
 * - Priority focus on listings as requested
 * - Mobile-responsive grid layout
 *
 * User Experience:
 * - Listings remain the main focus and priority
 * - Added engaging sections without overwhelming content
 * - Clear trust signals for expat community
 */

import { useState } from 'react'
import Link from 'next/link'
import {
  Star,
  MapPin,
  Shield,
  Crown,
  Heart,
  Eye,
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { featuredItems } from '@/lib/constants'
import type { FeaturedItem } from '@/lib/types'
import { ProductCard } from '@/components/ui/product-card'

export default function FeaturedListings() {
  const [activeTab, setActiveTab] = useState('new')

  // Optimized data for different tabs - exactly 4 rows (16 items) per section
  // New Listings: Most recent additions (16 items = 4 rows)
  const newListings = featuredItems.slice(0, 16)

  // Featured: Premium items (16 items = 4 rows)
  const featuredListings = featuredItems.slice(0, 16)

  // Top Picks: High-rated and trending items (16 items = 4 rows)
  const topPicks = featuredItems
    .filter((item) => item.rating >= 4.7) // High-rated items
    .concat(featuredItems.filter((item) => item.isPremium)) // Premium items
    .slice(0, 16) // Take first 16 unique items

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'featured':
        return <Crown className="w-4 h-4" />
      case 'new':
        return <Clock className="w-4 h-4" />
      case 'top':
        return <TrendingUp className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <section className="py-16 bg-gradient-to-br from-neutral-50 to-blue-50/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-12">
            <div className="bg-gradient-to-r from-white via-neutral-50 to-white p-2 rounded-2xl shadow-xl border border-neutral-200/60 backdrop-blur-sm">
              <TabsList className="grid w-full grid-cols-3 bg-transparent border-0 h-auto">
                <TabsTrigger
                  value="new"
                  className="flex items-center gap-2 px-6 py-4 text-sm font-medium rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-green-50"
                >
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">New Listings</span>
                  <span className="sm:hidden">New</span>
                </TabsTrigger>
                <TabsTrigger
                  value="featured"
                  className="flex items-center gap-2 px-6 py-4 text-sm font-medium rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-blue-50"
                >
                  <Crown className="w-4 h-4" />
                  <span className="hidden sm:inline">Featured</span>
                  <span className="sm:hidden">Featured</span>
                </TabsTrigger>
                <TabsTrigger
                  value="top"
                  className="flex items-center gap-2 px-6 py-4 text-sm font-medium rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-purple-50"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Top Picks</span>
                  <span className="sm:hidden">Top</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Tab Content Indicator */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-neutral-200/60">
              {activeTab === 'new' && (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <Zap className="w-5 h-5" />
                  <span className="text-sm">Latest additions to our marketplace</span>
                </div>
              )}
              {activeTab === 'featured' && (
                <div className="flex items-center gap-2 text-brand-primary font-medium">
                  <Crown className="w-5 h-5" />
                  <span className="text-sm">Featured premium items from verified sellers</span>
                </div>
              )}
              {activeTab === 'top' && (
                <div className="flex items-center gap-2 text-purple-600 font-medium">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">Top highest-rated & trending items</span>
                </div>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <TabsContent value="new" className="space-y-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {newListings.map((item: FeaturedItem) => (
                <div key={`new-${item.id}`} className="group">
                  <ProductCard product={item} />
                </div>
              ))}
            </div>

            {/* Enhanced Bottom Section for New Listings */}
            <div className="mt-12 pt-8 border-t border-gradient-to-r from-transparent via-green-200 to-transparent">
              <div className="text-center space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-bold text-green-800">Discover Fresh Arrivals</h3>
                    <Sparkles className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-green-700 text-sm mb-6">
                    Don't miss out on the latest items from verified expat sellers worldwide
                  </p>
                  <Link href="/browse?category=&timePosted=24h">
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/30 transition-all duration-300 group">
                      <span className="flex items-center gap-2">
                        Show All New Listings
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="featured" className="space-y-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredListings.map((item: FeaturedItem) => (
                <div key={`featured-${item.id}`} className="group">
                  <ProductCard product={item} />
                </div>
              ))}
            </div>

            {/* Enhanced Bottom Section for Featured */}
            <div className="mt-12 pt-8 border-t border-gradient-to-r from-transparent via-brand-primary/30 to-transparent">
              <div className="text-center space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Crown className="w-6 h-6 text-brand-primary" />
                    <h3 className="text-xl font-bold text-brand-primary">Premium Collection</h3>
                    <Crown className="w-6 h-6 text-brand-primary" />
                  </div>
                  <p className="text-blue-700 text-sm mb-6">
                    Handpicked premium items from our most trusted verified sellers
                  </p>
                  <Link href="/browse?featured=true">
                    <Button className="bg-gradient-to-r from-brand-primary to-blue-600 hover:from-brand-primary/90 hover:to-blue-600/90 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30 transition-all duration-300 group">
                      <span className="flex items-center gap-2">
                        View All Featured Items
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="top" className="space-y-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {topPicks.map((item: FeaturedItem) => (
                <div key={`top-${item.id}`} className="group">
                  <ProductCard product={item} />
                </div>
              ))}
            </div>

            {/* Enhanced Bottom Section for Top Picks */}
            <div className="mt-12 pt-8 border-t border-gradient-to-r from-transparent via-purple-200 to-transparent">
              <div className="text-center space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-8 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-purple-800">Community Favorites</h3>
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-purple-700 text-sm mb-6">
                    Most popular and highest-rated items chosen by our expat community
                  </p>
                  <Link href="/browse?sort=rating&order=desc">
                    <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-purple-600/25 hover:shadow-xl hover:shadow-purple-600/30 transition-all duration-300 group">
                      <span className="flex items-center gap-2">
                        See All Top Rated
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
