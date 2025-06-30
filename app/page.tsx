/**
 * =============================================================================
 * HOMEPAGE - MAIN LANDING PAGE
 * =============================================================================
 *
 * The main landing page for the GlobalExpat Marketplace. This page serves as the
 * primary entry point for users and showcases the platform's key features and
 * offerings in a visually appealing and user-friendly layout.
 *
 * Page Architecture:
 * The homepage follows a strategic layout hierarchy prioritizing user engagement
 * and conversion, with listings as the main focus while providing supporting
 * elements that build trust and encourage exploration.
 *
 * Layout Priority (Top to Bottom):
 * 1. Featured Listings - Primary focus showcasing quality products
 * 2. Community Highlights - Engaging expat community introduction
 * 3. Hero Carousel - Visual category showcase and inspiration
 *
 * Connected Components:
 * - components/hero-carousel.tsx - Category showcase with rotating images
 * - components/featured-listings.tsx - Primary product display grid
 * - components/category-sidebar.tsx - Product category navigation
 * - components/mobile-sidebar-toggle.tsx - Mobile navigation toggle
 *
 * State Management:
 * - No direct state management - relies on child components
 * - Category filtering handled by CategorySidebar
 * - Product data fetched by FeaturedListings component
 *
 * Backend Integration Points:
 * - GET /api/products/featured - Featured products for listings
 * - GET /api/categories - Product categories for sidebar
 * - GET /api/stats - Platform statistics for trust indicators
 *
 * SEO and Performance:
 * - Server-side rendered for optimal SEO
 * - Optimized images with Next.js Image component
 * - Strategic component lazy loading
 * - Semantic HTML structure for accessibility
 *
 * User Experience Features:
 * - Responsive design adapts to all screen sizes
 * - Progressive enhancement for JavaScript-disabled users
 * - Clear visual hierarchy guides user attention
 * - Multiple engagement points encourage exploration
 * - Trust-building elements reduce conversion friction
 */

import HeroCarousel from '@/components/hero-carousel'
import FeaturedListings from '@/components/featured-listings'
import CategorySidebar from '@/components/category-sidebar'
import MobileSidebarToggle from '@/components/mobile-sidebar-toggle'
import { Shield, Users, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * =============================================================================
 * HOMEPAGE COMPONENT
 * =============================================================================
 *
 * Main homepage component that orchestrates the layout and content flow.
 * Uses a mobile-first responsive design with strategic content placement
 * to maximize user engagement and platform adoption.
 *
 * Design Philosophy:
 * - Mobile-first responsive design
 * - Content hierarchy optimized for conversion
 * - Trust-building elements strategically placed
 * - Clear calls-to-action at decision points
 * - Engaging visuals without overwhelming content
 *
 * Performance Considerations:
 * - Server-side rendering for fast initial load
 * - Component-level code splitting
 * - Optimized image loading with proper sizing
 * - Minimal JavaScript for core functionality
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 
        =======================================================================
        MOBILE NAVIGATION TOGGLE
        =======================================================================
        Provides quick access to category navigation on mobile devices.
        Positioned at the top for immediate visibility and accessibility.
        
        Connected Component: components/mobile-sidebar-toggle.tsx
        Functionality: Toggles CategorySidebar visibility on mobile/tablet
      */}
      <MobileSidebarToggle />

      <div className="flex">
        {/* 
          =====================================================================
          DESKTOP CATEGORY SIDEBAR
          =====================================================================
          Desktop-only category navigation sidebar. Provides persistent access
          to product categories and filtering options for large screens.
          
          Connected Component: components/category-sidebar.tsx
          Data Source: lib/constants.ts - CATEGORIES
          Functionality: Category filtering and navigation
          Responsive: Hidden on mobile (lg:block)
        */}
        <div className="hidden lg:block">
          <CategorySidebar />
        </div>

        {/* 
          =====================================================================
          MAIN CONTENT AREA
          =====================================================================
          Primary content container housing all main homepage sections.
          Uses flexbox layout for responsive design and proper content flow.
        */}
        <main className="flex-1 relative">
          {/* 
            =================================================================
            FEATURED LISTINGS SECTION - PRIMARY CONVERSION POINT
            =================================================================
            Showcasing quality products from verified sellers. This is the
            main conversion point where users discover and engage with
            marketplace offerings.
            
            Connected Component: components/featured-listings.tsx
            Data Source: Backend API /api/products/featured
            Features: Product cards, seller verification, pricing, images
            User Actions: View details, add to cart, contact seller
          */}
          <FeaturedListings />

          {/* 
            =================================================================
            COMMUNITY ENGAGEMENT SECTION
            =================================================================
            Strategic community introduction designed to build trust and
            explain the platform's unique value proposition to expat users.
            Positioned after users have seen products and visual content.
            
            Content Strategy:
            - Emphasize global community aspect
            - Highlight verification and trust
            - Show professional network benefits
            - Provide clear next actions
          */}
          <section className="py-12 bg-white/80 backdrop-blur-sm">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* 
                ===========================================================
                COMMUNITY INTRODUCTION BANNER
                ===========================================================
                Eye-catching gradient banner introducing the global expat
                community concept with engaging visual elements.
              */}
              <div className="bg-gradient-to-r from-brand-primary to-blue-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
                {/* Subtle pattern overlay for visual interest */}
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full bg-white/5 bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
                </div>

                <div className="relative z-10">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">🌍 Global Expat Community</h3>
                    <p className="text-blue-100 text-lg">
                      Connecting professionals worldwide through trusted marketplace
                    </p>
                    <p className="text-blue-200 text-sm mt-2">
                      Join our growing community of verified expat professionals
                    </p>
                  </div>
                </div>
              </div>

              {/* 
                ===========================================================
                VALUE PROPOSITION CARDS
                ===========================================================
                Three-column grid highlighting key platform benefits.
                Focuses on verification, networking, and global reach.
                
                Design: Card-based layout with icons and descriptions
                Responsive: Stacks on mobile, grid on desktop
                Purpose: Build trust and explain unique value
              */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Verification Trust Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-neutral-800">Verified Only</h4>
                  </div>
                  <p className="text-sm text-neutral-600">
                    Every seller is identity and organization verified for your safety.
                  </p>
                </div>

                {/* Professional Network Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-neutral-800">Professional Network</h4>
                  </div>
                  <p className="text-sm text-neutral-600">
                    Connect with fellow expat professionals in your field and location.
                  </p>
                </div>

                {/* Global Reach Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200/50 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-neutral-800">Global Reach</h4>
                  </div>
                  <p className="text-sm text-neutral-600">
                    Buy and sell with trusted expat community members worldwide.
                  </p>
                </div>
              </div>

              {/* 
                ===========================================================
                CALL-TO-ACTION SECTION
                ===========================================================
                Subtle but effective CTA section encouraging user engagement.
                Positioned at the end of community section for natural flow.
                
                Design: Rounded button group with primary and secondary actions
                Actions: Start selling (primary), Browse items (secondary)
                Strategy: Multiple engagement paths based on user intent
              */}
            </div>
          </section>

          {/* 
            =================================================================
            HERO CAROUSEL SECTION - MOVED BACK TO BOTTOM
            =================================================================
            Visual category showcase with rotating images. Positioned at
            the bottom to provide inspiration and category exploration
            after users have seen products and trust indicators.
            
            Connected Component: components/hero-carousel.tsx
            Data Source: lib/constants.ts - CAROUSEL_ITEMS
            Features: Auto-rotation, category navigation, responsive images
            Purpose: Visual inspiration and category discovery
          */}
          <HeroCarousel />
        </main>
      </div>
    </div>
  )
}
