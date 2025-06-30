/**
 * Application Constants & Configuration - SIMPLIFIED
 *
 * Centralized constants for the GlobalExpat platform including UI configuration,
 * category definitions, currency settings, and mock data for development.
 */

import {
  Car,
  Home,
  Smartphone,
  Gamepad2,
  Shirt,
  Dumbbell,
  Book,
  Palette,
  Camera,
  Star,
  DollarSign,
  Package,
} from 'lucide-react'
import type {
  CategoryWithRequirements,
  ItemCondition,
  SellingTip,
  Language,
  Location,
} from './types'

// ============================================================================
// CURRENCY & LOCALIZATION
// ============================================================================

/**
 * Supported currencies for the platform
 * Includes regional currencies for East Africa and international options
 */
export const CURRENCIES = [
  { code: 'TZS', name: 'Tanzanian Shilling', flag: '🇹🇿' },
  { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪' },
  { code: 'UGX', name: 'Ugandan Shilling', flag: '🇺🇬' },
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
] as const

/**
 * Supported languages with native names
 * Covers major expat communities in East Africa
 */
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'zh', name: 'Mandarin', nativeName: '中文' },
] as const

/**
 * Top expat locations and markets
 * Primary cities where the platform operates - focused on East Africa region
 */
export const EXPAT_LOCATIONS: Location[] = [
  { value: 'dar-es-salaam', label: '🇹🇿 Dar es Salaam, TZ', country: 'Tanzania' },
  { value: 'nairobi', label: '🇰🇪 Nairobi, KE', country: 'Kenya' },
  { value: 'arusha', label: '🇹🇿 Arusha, TZ', country: 'Tanzania' },
  { value: 'kampala', label: '🇺🇬 Kampala, UG', country: 'Uganda' },
  { value: 'zanzibar', label: '🇹🇿 Zanzibar, TZ', country: 'Tanzania' },
  { value: 'mombasa', label: '🇰🇪 Mombasa, KE', country: 'Kenya' },
  { value: 'kigali', label: '🇷🇼 Kigali, RW', country: 'Rwanda' },
  { value: 'dodoma', label: '🇹🇿 Dodoma, TZ', country: 'Tanzania' },
  { value: 'entebbe', label: '🇺🇬 Entebbe, UG', country: 'Uganda' },
  { value: 'stone-town', label: '🇹🇿 Stone Town, TZ', country: 'Tanzania' },
] as const

// ============================================================================
// HOMEPAGE & HERO CONTENT
// ============================================================================

/**
 * Hero carousel items for homepage
 * Featured content showcasing major categories
 */
export const CAROUSEL_ITEMS = [
  {
    id: 1,
    category: 'Vehicles',
    image: '/images/hero-automotive.jpg',
    title: 'Top Vehicles for Expats',
  },
  {
    id: 2,
    category: 'Furniture',
    image: '/images/hero-furniture.jpg',
    title: 'Luxury Home Furniture',
  },
  {
    id: 3,
    category: 'Electronics',
    image: '/images/hero-electronics.jpg',
    title: 'Latest Tech & Electronics',
  },
  {
    id: 4,
    category: 'Games & Toys',
    image: '/images/hero-gaming.jpg',
    title: 'Games & Entertainment',
  },
] as const

/**
 * Trust indicators displayed on homepage
 * Build confidence in the platform's reliability
 */
export const TRUST_INDICATORS = [
  { text: 'Verified Sellers', color: 'bg-green-400' },
  { text: 'Secure Payments', color: 'bg-green-400' },
  { text: 'Regional Shipping', color: 'bg-green-400' },
  { text: 'Community Trusted', color: 'bg-green-400' },
] as const

// ============================================================================
// CATEGORY SYSTEM - SIMPLIFIED
// ============================================================================

/**
 * Main product categories with metadata
 * Used for navigation, filtering, and organization
 */
export const CATEGORIES = [
  {
    id: 1,
    name: 'Automotive',
    icon: Car,
    count: '2,847 items',
    slug: 'automotive',
  },
  {
    id: 2,
    name: 'Home & Furniture',
    icon: Home,
    count: '5,234 items',
    slug: 'home-furniture',
  },
  {
    id: 3,
    name: 'Electronics & Tech',
    icon: Smartphone,
    count: '8,921 items',
    slug: 'electronics-tech',
  },
  {
    id: 4,
    name: 'Games & Toys',
    icon: Gamepad2,
    count: '1,456 items',
    slug: 'games-toys',
  },
  {
    id: 5,
    name: 'Fashion & Style',
    icon: Shirt,
    count: '3,678 items',
    slug: 'fashion-style',
  },
  {
    id: 6,
    name: 'Fitness & Sports',
    icon: Dumbbell,
    count: '987 items',
    slug: 'fitness-sports',
  },
  {
    id: 7,
    name: 'Books & Media',
    icon: Book,
    count: '2,134 items',
    slug: 'books-media',
  },
  {
    id: 8,
    name: 'Arts & Crafts',
    icon: Palette,
    count: '756 items',
    slug: 'arts-crafts',
  },
] as const

/**
 * Categories for selling with photo requirements
 * Defines mandatory image types for each category
 */
export const SELLING_CATEGORIES: CategoryWithRequirements[] = [
  {
    value: 'automotive',
    label: 'Automotive',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'electronics',
    label: 'Electronics & Tech',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'furniture',
    label: 'Home & Furniture',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'appliances',
    label: 'Appliances',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'books',
    label: 'Books & Media',
    imageRequirements: ['main'],
  },
  {
    value: 'clothing',
    label: 'Clothing & Accessories',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'sports',
    label: 'Sports & Fitness',
    imageRequirements: ['main', 'detail'],
  },
  {
    value: 'other',
    label: 'Other',
    imageRequirements: ['main'],
  },
] as const

// ============================================================================
// PRODUCT CONDITIONS & SELLING GUIDANCE - SIMPLIFIED
// ============================================================================

/**
 * Available item conditions with descriptions
 * Helps sellers accurately describe product state
 */
export const ITEM_CONDITIONS: ItemCondition[] = [
  { value: 'new', label: 'New', description: 'Brand new, never used' },
  { value: 'like-new', label: 'Like New', description: 'Used once or twice, excellent condition' },
  { value: 'excellent', label: 'Excellent', description: 'Lightly used, very good condition' },
  { value: 'very-good', label: 'Very Good', description: 'Used with minor signs of wear' },
  { value: 'good', label: 'Good', description: 'Used with normal signs of wear' },
  { value: 'fair', label: 'Fair', description: 'Heavily used but functional' },
] as const

/**
 * Selling tips for new users
 * Guidance to help create better listings
 */
export const SELLING_TIPS: SellingTip[] = [
  {
    icon: Camera,
    title: 'Take Great Photos',
    description: 'Use natural lighting and multiple angles. High-quality photos get 3x more views.',
  },
  {
    icon: Star,
    title: 'Write Detailed Descriptions',
    description: 'Include brand, model, condition, and reason for selling. Be honest and thorough.',
  },
  {
    icon: DollarSign,
    title: 'Price Competitively',
    description:
      'Research similar items and price fairly. Consider the condition and market demand.',
  },
  {
    icon: Package,
    title: 'Fast Response',
    description: 'Reply to inquiries quickly. Responsive sellers are more likely to make sales.',
  },
] as const

// ============================================================================
// UI CONFIGURATION - SIMPLIFIED
// ============================================================================

/**
 * Sorting options for product listings
 * Available filter and sort methods
 */
export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
] as const

/**
 * Status colors for listings and orders
 * Consistent color scheme across the platform
 */
export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  sold: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-gray-100 text-gray-800',
  expired: 'bg-red-100 text-red-800',
} as const

// ============================================================================
// USER & AUTHENTICATION - SIMPLIFIED
// ============================================================================

/**
 * Default user information for development
 * Used when no real user data is available
 */
export const DEFAULT_USER = {
  name: 'Dr. Sarah M.',
  email: 'sarah.mitchell@un.org',
  avatar: '/images/seller-avatar-1.jpg',
} as const

// ============================================================================
// MOCK DATA FOR DEVELOPMENT - SIMPLIFIED
// ============================================================================

/**
 * Featured listings for homepage and testing
 * Mock data representing various product types and sellers
 */
export const featuredItems = [
  {
    id: 1,
    title: 'MacBook Pro 14" M2',
    price: '3,500,000 TZS',
    originalPrice: '4,200,000 TZS',
    image: '/images/macbook-pro.jpg',
    seller: 'TechExpat Dar',
    rating: 4.9,
    reviews: 88,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'electronics-tech',
  },
  {
    id: 2,
    title: 'Toyota Rav4 2021 - Expat Owned',
    price: '85,000,000 TZS',
    originalPrice: '95,000,000 TZS',
    image: '/images/bmw-x5.jpg',
    seller: 'AutoExpat TZ',
    rating: 4.8,
    reviews: 45,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'automotive',
  },
  {
    id: 3,
    title: 'Designer Sofa Set - Imported',
    price: '2,800,000 TZS',
    originalPrice: '3,500,000 TZS',
    image: '/images/italian-sofa.jpg',
    seller: 'HomeDecor TZ',
    rating: 4.7,
    reviews: 56,
    location: 'Arusha, TZ',
    isVerified: true,
    isPremium: false,
    categorySlug: 'home-furniture',
  },
  {
    id: 4,
    title: 'PlayStation 5 + Games Bundle',
    price: '1,800,000 TZS',
    originalPrice: '2,200,000 TZS',
    image: '/images/playstation-5.jpg',
    seller: 'GameHub TZ',
    rating: 4.9,
    reviews: 150,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: false,
    categorySlug: 'games-toys',
  },
  {
    id: 5,
    title: 'Samsung 65" 4K TV',
    price: '2,500,000 TZS',
    originalPrice: '3,000,000 TZS',
    image: '/images/rolex-watch.jpg',
    seller: 'Electronics TZ',
    rating: 4.9,
    reviews: 78,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'electronics-tech',
  },
  {
    id: 6,
    title: 'Toyota Land Cruiser Prado 2018',
    price: '150,000,000 TZS',
    originalPrice: '165,000,000 TZS',
    image: '/images/mercedes-c-class.jpg',
    seller: 'Safari Motors',
    rating: 4.8,
    reviews: 32,
    location: 'Arusha, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'automotive',
  },
  {
    id: 7,
    title: 'Herman Miller Aeron Chair',
    price: '1,500,000 TZS',
    originalPrice: '2,000,000 TZS',
    image: '/images/herman-miller-chair.jpg',
    seller: 'OfficeSolutions KE',
    rating: 4.6,
    reviews: 92,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: false,
    categorySlug: 'home-furniture',
  },
  {
    id: 8,
    title: 'Canon EOS R5 + Lens Kit',
    price: '7,000,000 TZS',
    originalPrice: '8,500,000 TZS',
    image: '/images/canon-camera.jpg',
    seller: 'PhotoPro Expat',
    rating: 4.9,
    reviews: 156,
    location: 'Kampala, UG',
    isVerified: true,
    isPremium: false,
    categorySlug: 'electronics-tech',
  },
  {
    id: 9,
    title: 'iPad Pro 11" M2 + Accessories',
    price: '2,800,000 TZS',
    originalPrice: '3,400,000 TZS',
    image: '/images/ipad-pro.jpg',
    seller: 'TechHub KE',
    rating: 4.8,
    reviews: 203,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: true,
    categorySlug: 'electronics-tech',
  },
  {
    id: 10,
    title: 'Vintage Zanzibar Chest',
    price: '1,200,000 TZS',
    originalPrice: '1,500,000 TZS',
    image: '/images/harley-davidson.jpg',
    seller: 'Antiques TZ',
    rating: 4.7,
    reviews: 34,
    location: 'Zanzibar, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'home-furniture',
  },
  {
    id: 11,
    title: 'KitchenAid Stand Mixer Pro',
    price: '800,000 TZS',
    originalPrice: '1,000,000 TZS',
    image: '/images/kitchenaid-mixer.jpg',
    seller: 'CulinaryWorld',
    rating: 4.6,
    reviews: 128,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: false,
    categorySlug: 'appliances',
  },
  {
    id: 12,
    title: 'Mountain Bike - Full Suspension',
    price: '950,000 TZS',
    originalPrice: '1,200,000 TZS',
    image: '/images/nintendo-switch.jpg',
    seller: 'AdventureBikes UG',
    rating: 4.9,
    reviews: 187,
    location: 'Kampala, UG',
    isVerified: true,
    isPremium: false,
    categorySlug: 'sports',
  },
  {
    id: 13,
    title: 'Luxury Apartment Furniture Set',
    price: '4,500,000 TZS',
    originalPrice: '5,200,000 TZS',
    image: '/images/optimized/luxury-living-room-furniture-medium.jpg',
    seller: 'LuxuryHomes TZ',
    rating: 4.8,
    reviews: 67,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'home-furniture',
  },
  {
    id: 14,
    title: 'Professional Camera Equipment',
    price: '3,200,000 TZS',
    originalPrice: '3,800,000 TZS',
    image: '/images/optimized/professional-camera-equipment-medium.jpg',
    seller: 'PhotoGear Expat',
    rating: 4.9,
    reviews: 134,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: false,
    categorySlug: 'electronics-tech',
  },
  {
    id: 15,
    title: 'Vintage Wooden Coffee Table',
    price: '850,000 TZS',
    originalPrice: '1,100,000 TZS',
    image: '/images/optimized/vintage-wooden-coffee-table-medium.jpg',
    seller: 'WoodCraft UG',
    rating: 4.7,
    reviews: 89,
    location: 'Kampala, UG',
    isVerified: true,
    isPremium: false,
    categorySlug: 'home-furniture',
  },
  {
    id: 16,
    title: 'Premium Kitchen Appliance Set',
    price: '2,100,000 TZS',
    originalPrice: '2,500,000 TZS',
    image: '/images/optimized/premium-kitchen-appliances-medium.jpg',
    seller: 'KitchenExperts KE',
    rating: 4.8,
    reviews: 156,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: true,
    categorySlug: 'appliances',
  },
  {
    id: 17,
    title: 'Modern Office Desk Setup',
    price: '1,650,000 TZS',
    originalPrice: '2,000,000 TZS',
    image: '/images/optimized/modern-office-desk-setup-medium.jpg',
    seller: 'OfficeDesign TZ',
    rating: 4.6,
    reviews: 91,
    location: 'Arusha, TZ',
    isVerified: true,
    isPremium: false,
    categorySlug: 'home-furniture',
  },
  {
    id: 18,
    title: 'Artisan Pottery Collection',
    price: '450,000 TZS',
    originalPrice: '600,000 TZS',
    image: '/images/optimized/artisan-pottery-collection-medium.jpg',
    seller: 'Local Artisans',
    rating: 4.9,
    reviews: 78,
    location: 'Zanzibar, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'arts-crafts',
  },
  {
    id: 19,
    title: 'Designer Fashion Collection',
    price: '890,000 TZS',
    originalPrice: '1,200,000 TZS',
    image: '/images/optimized/designer-fashion-collection-medium.jpg',
    seller: 'Fashion Forward KE',
    rating: 4.7,
    reviews: 203,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: false,
    categorySlug: 'fashion-style',
  },
  {
    id: 20,
    title: 'High-End Audio System',
    price: '3,800,000 TZS',
    originalPrice: '4,500,000 TZS',
    image: '/images/optimized/high-end-audio-system-medium.jpg',
    seller: 'AudioPhile TZ',
    rating: 4.9,
    reviews: 112,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'electronics-tech',
  },
  {
    id: 21,
    title: 'Fitness Equipment Bundle',
    price: '1,200,000 TZS',
    originalPrice: '1,500,000 TZS',
    image: '/images/optimized/fitness-equipment-bundle-medium.jpg',
    seller: 'FitLife UG',
    rating: 4.8,
    reviews: 145,
    location: 'Kampala, UG',
    isVerified: true,
    isPremium: false,
    categorySlug: 'sports',
  },
  {
    id: 22,
    title: 'Luxury Watch Collection',
    price: '12,500,000 TZS',
    originalPrice: '15,000,000 TZS',
    image: '/images/optimized/luxury-watch-collection-medium.jpg',
    seller: 'TimeKeepers Expat',
    rating: 4.9,
    reviews: 67,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'home-furniture',
  },
  {
    id: 23,
    title: 'Smart Home Technology Kit',
    price: '2,300,000 TZS',
    originalPrice: '2,800,000 TZS',
    image: '/images/optimized/smart-home-technology-kit-medium.jpg',
    seller: 'SmartLiving KE',
    rating: 4.8,
    reviews: 198,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: true,
    categorySlug: 'electronics-tech',
  },
  {
    id: 24,
    title: 'Outdoor Adventure Gear',
    price: '1,850,000 TZS',
    originalPrice: '2,200,000 TZS',
    image: '/images/optimized/outdoor-adventure-gear-medium.jpg',
    seller: 'Adventure Outfitters',
    rating: 4.7,
    reviews: 176,
    location: 'Arusha, TZ',
    isVerified: true,
    isPremium: false,
    categorySlug: 'sports',
  },
  {
    id: 25,
    title: 'Premium Skincare Products',
    price: '680,000 TZS',
    originalPrice: '850,000 TZS',
    image: '/images/optimized/premium-skincare-products-medium.jpg',
    seller: 'Beauty Expat',
    rating: 4.9,
    reviews: 234,
    location: 'Zanzibar, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'home-furniture',
  },
  {
    id: 26,
    title: 'Professional DJ Equipment',
    price: '4,200,000 TZS',
    originalPrice: '5,000,000 TZS',
    image: '/images/optimized/professional-dj-equipment-medium.jpg',
    seller: 'MusicPro UG',
    rating: 4.8,
    reviews: 89,
    location: 'Kampala, UG',
    isVerified: true,
    isPremium: false,
    categorySlug: 'electronics-tech',
  },
  {
    id: 27,
    title: 'Sustainable Living Products',
    price: '920,000 TZS',
    originalPrice: '1,200,000 TZS',
    image: '/images/optimized/sustainable-living-products-medium.jpg',
    seller: 'EcoLiving TZ',
    rating: 4.7,
    reviews: 156,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'home-furniture',
  },
  {
    id: 28,
    title: 'Books & Educational Materials',
    price: '380,000 TZS',
    originalPrice: '500,000 TZS',
    image: '/images/optimized/books-educational-materials-medium.jpg',
    seller: 'BookLovers Expat',
    rating: 4.9,
    reviews: 267,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: false,
    categorySlug: 'books-media',
  },
  {
    id: 29,
    title: 'Imported Furniture Set',
    price: '3,400,000 TZS',
    originalPrice: '4,100,000 TZS',
    image: '/images/optimized/imported-furniture-set-medium.jpg',
    seller: 'Imports & More',
    rating: 4.8,
    reviews: 78,
    location: 'Arusha, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'home-furniture',
  },
  {
    id: 30,
    title: 'Gaming Setup Complete',
    price: '2,650,000 TZS',
    originalPrice: '3,200,000 TZS',
    image: '/images/optimized/gaming-setup-complete-medium.jpg',
    seller: 'GameZone UG',
    rating: 4.9,
    reviews: 189,
    location: 'Kampala, UG',
    isVerified: true,
    isPremium: false,
    categorySlug: 'games-toys',
  },
  {
    id: 31,
    title: 'Handmade Crafts Collection',
    price: '560,000 TZS',
    originalPrice: '750,000 TZS',
    image: '/images/optimized/handmade-crafts-collection-medium.jpg',
    seller: 'Local Crafters',
    rating: 4.8,
    reviews: 145,
    location: 'Zanzibar, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'arts-crafts',
  },
  {
    id: 32,
    title: 'Professional Kitchen Tools',
    price: '1,450,000 TZS',
    originalPrice: '1,800,000 TZS',
    image: '/images/optimized/professional-kitchen-tools-medium.jpg',
    seller: 'ChefSupplies TZ',
    rating: 4.7,
    reviews: 123,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: false,
    categorySlug: 'appliances',
  },
  {
    id: 33,
    title: 'Electronics Bundle Deal',
    price: '2,980,000 TZS',
    originalPrice: '3,500,000 TZS',
    image: '/images/optimized/electronics-bundle-deal-medium.jpg',
    seller: 'TechBundle KE',
    rating: 4.8,
    reviews: 167,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: true,
    categorySlug: 'electronics-tech',
  },
  {
    id: 34,
    title: 'Outdoor Furniture Set',
    price: '1,780,000 TZS',
    originalPrice: '2,200,000 TZS',
    image: '/images/optimized/outdoor-furniture-set-medium.jpg',
    seller: 'OutdoorLiving UG',
    rating: 4.6,
    reviews: 98,
    location: 'Kampala, UG',
    isVerified: true,
    isPremium: false,
    categorySlug: 'home-furniture',
  },
  {
    id: 35,
    title: 'Vintage Camera Collection',
    price: '2,150,000 TZS',
    originalPrice: '2,600,000 TZS',
    image: '/images/optimized/vintage-camera-collection-medium.jpg',
    seller: 'VintagePhoto TZ',
    rating: 4.9,
    reviews: 89,
    location: 'Arusha, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'electronics-tech',
  },
  {
    id: 36,
    title: 'Baby & Kids Furniture',
    price: '1,320,000 TZS',
    originalPrice: '1,650,000 TZS',
    image: '/images/optimized/baby-kids-furniture-medium.jpg',
    seller: 'KidsCorner Expat',
    rating: 4.8,
    reviews: 178,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: false,
    categorySlug: 'home-furniture',
  },
  {
    id: 37,
    title: 'Sports Equipment Bundle',
    price: '890,000 TZS',
    originalPrice: '1,150,000 TZS',
    image: '/images/optimized/sports-equipment-bundle-medium.jpg',
    seller: 'SportsCentral KE',
    rating: 4.7,
    reviews: 156,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: false,
    categorySlug: 'sports',
  },
  {
    id: 38,
    title: 'Art & Decor Collection',
    price: '1,680,000 TZS',
    originalPrice: '2,100,000 TZS',
    image: '/images/optimized/art-decor-collection-medium.jpg',
    seller: 'ArtGallery UG',
    rating: 4.9,
    reviews: 134,
    location: 'Kampala, UG',
    isVerified: true,
    isPremium: true,
    categorySlug: 'arts-crafts',
  },
  {
    id: 39,
    title: 'Home Security System',
    price: '1,450,000 TZS',
    originalPrice: '1,800,000 TZS',
    image: '/images/optimized/home-security-system-medium.jpg',
    seller: 'SecureHome TZ',
    rating: 4.8,
    reviews: 167,
    location: 'Dar es Salaam, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'home-furniture',
  },
  {
    id: 40,
    title: 'Library & Study Materials',
    price: '650,000 TZS',
    originalPrice: '850,000 TZS',
    image: '/images/optimized/library-study-materials-medium.jpg',
    seller: 'StudyExpat KE',
    rating: 4.7,
    reviews: 198,
    location: 'Nairobi, KE',
    isVerified: true,
    isPremium: false,
    categorySlug: 'books-media',
  },
  {
    id: 41,
    title: 'Luxury Bedding Set',
    price: '1,250,000 TZS',
    originalPrice: '1,600,000 TZS',
    image: '/images/optimized/luxury-bedding-set-medium.jpg',
    seller: 'LuxurySleep UG',
    rating: 4.9,
    reviews: 123,
    location: 'Kampala, UG',
    isVerified: true,
    isPremium: true,
    categorySlug: 'home-furniture',
  },
  {
    id: 42,
    title: 'Electric Vehicles & Accessories',
    price: '45,000,000 TZS',
    originalPrice: '52,000,000 TZS',
    image: '/images/optimized/electric-vehicle-accessories-medium.jpg',
    seller: 'EcoMotors TZ',
    rating: 4.8,
    reviews: 45,
    location: 'Arusha, TZ',
    isVerified: true,
    isPremium: true,
    categorySlug: 'automotive',
  },
]
