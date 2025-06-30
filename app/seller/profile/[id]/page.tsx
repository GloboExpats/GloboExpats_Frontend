'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Star,
  MapPin,
  Shield,
  MessageCircle,
  Share2,
  Flag,
  Calendar,
  Award,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Breadcrumb from '@/components/breadcrumb'
import { RouteGuard } from '@/components/route-guard'
import { getSellerProfile, getSellerVerificationStatus } from '@/lib/seller-data'
import { SellerProfile } from '@/lib/types'

const sellerProducts = [
  {
    id: 1,
    title: 'iPhone 15 Pro Max 256GB',
    price: '$1,199',
    originalPrice: '$1,299',
    image: '/images/iphone-15-pro.jpg',
    condition: 'Like New',
    views: 234,
    premium: true,
  },
  {
    id: 2,
    title: 'MacBook Air M2 13"',
    price: '$999',
    originalPrice: '$1,199',
    image: '/images/macbook-pro.jpg',
    condition: 'Excellent',
    views: 156,
    premium: false,
  },
  {
    id: 3,
    title: 'iPad Pro 12.9" 2024',
    price: '$899',
    originalPrice: '$1,099',
    image: '/images/iphone-15-pro.jpg',
    condition: 'Like New',
    views: 89,
    premium: true,
  },
  {
    id: 4,
    title: 'AirPods Pro 2nd Gen',
    price: '$199',
    originalPrice: '$249',
    image: '/images/iphone-15-pro.jpg',
    condition: 'New',
    views: 67,
    premium: false,
  },
]

const reviews = [
  {
    id: 1,
    buyer: 'Sarah M.',
    rating: 5,
    comment:
      'Excellent seller! Fast response, item exactly as described. Smooth transaction from start to finish.',
    date: '2 weeks ago',
    product: 'iPhone 15 Pro Max',
  },
  {
    id: 2,
    buyer: 'Ahmed K.',
    rating: 5,
    comment:
      'Very professional and trustworthy. The MacBook was in perfect condition. Highly recommended!',
    date: '1 month ago',
    product: 'MacBook Air M2',
  },
  {
    id: 3,
    buyer: 'Lisa W.',
    rating: 4,
    comment: 'Good communication and fair pricing. Item was as described. Would buy again.',
    date: '2 months ago',
    product: 'iPad Pro',
  },
]

export default function SellerProfilePage() {
  return (
    <RouteGuard requireAuth loadingMessage="Loading profile...">
      <SellerProfileContent />
    </RouteGuard>
  )
}

function SellerProfileContent() {
  const params = useParams()
  const router = useRouter()
  const sellerId = params?.id as string

  const [activeTab, setActiveTab] = useState('products')
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Load seller profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = getSellerProfile(sellerId)
        if (profile) {
          setSellerProfile(profile)
        } else {
          setNotFound(true)
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        setNotFound(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (sellerId) {
      loadProfile()
    }
  }, [sellerId])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Show not found state
  if (notFound || !sellerProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">Profile Not Found</h1>
          <p className="text-neutral-600 mb-4">
            The seller profile you're looking for doesn't exist.
          </p>
          <Link href="/browse">
            <button className="bg-brand-primary text-white px-6 py-2 rounded-lg hover:bg-brand-primary/90">
              Browse Products
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const verificationStatus = getSellerVerificationStatus(sellerId)

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb />
        </div>
      </div>
      {/* Seller Header */}
      <div className="bg-brand-primary text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={sellerProfile.avatar} alt={sellerProfile.name} />
              <AvatarFallback className="bg-brand-secondary text-brand-primary text-3xl font-bold">
                {sellerProfile.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-2">
                <h1 className="text-3xl font-bold font-display">{sellerProfile.name}</h1>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  {sellerProfile.verified && (
                    <Badge className="bg-status-success text-white">
                      <Shield className="w-3 h-3 mr-1.5" />
                      Verified Seller
                    </Badge>
                  )}
                  {sellerProfile.rating >= 4.8 && (
                    <Badge className="bg-brand-secondary text-brand-primary">
                      <Award className="w-3 h-3 mr-1.5" />
                      Top Rated
                    </Badge>
                  )}
                  {sellerProfile.businessInfo?.type === 'company' && (
                    <Badge className="bg-blue-100 text-blue-800">Business</Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-200 mb-4">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-semibold">{sellerProfile.rating}</span>
                  <span>({sellerProfile.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{sellerProfile.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {sellerProfile.memberSince}</span>
                </div>
              </div>

              <p className="text-neutral-200 mb-4 max-w-2xl text-base">{sellerProfile.bio}</p>
            </div>

            <div className="flex justify-center md:justify-start">
              <Button
                size="lg"
                className="bg-brand-secondary hover:bg-amber-500 text-brand-primary font-bold px-8"
                asChild
              >
                <Link href={`/messages?seller=${encodeURIComponent(sellerProfile.name)}`}>
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact Seller
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 text-center">
            <div className="py-4 md:border-r">
              <div className="text-2xl font-bold text-brand-primary">
                {sellerProfile.completedSales}
              </div>
              <div className="text-sm text-neutral-600">Items Sold</div>
            </div>
            <div className="py-4 md:border-r">
              <div className="text-2xl font-bold text-status-success">
                {Math.round((sellerProfile.rating / 5) * 100)}%
              </div>
              <div className="text-sm text-neutral-600">Positive Feedback</div>
            </div>
            <div className="py-4 md:border-r">
              <div className="text-2xl font-bold text-amber-600">{sellerProfile.responseTime}</div>
              <div className="text-sm text-neutral-600">Avg. Response</div>
            </div>
            <div className="py-4">
              <div className="text-2xl font-bold text-cyan-600">{sellerProfile.totalListings}</div>
              <div className="text-sm text-neutral-600">Active Listings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="md:hidden mb-6">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="products">Products ({sellerProducts.length})</SelectItem>
              <SelectItem value="reviews">Reviews ({reviews.length})</SelectItem>
              <SelectItem value="about">About Store</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden md:block">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="products">Products ({sellerProducts.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="about">About Store</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-6">
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sellerProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="group overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
                  >
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.premium && (
                          <Badge className="absolute top-3 left-3 bg-brand-secondary text-brand-primary">
                            Featured
                          </Badge>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-neutral-800 mb-2 line-clamp-2 h-12">
                          {product.title}
                        </h3>
                        <div className="text-sm text-neutral-600 mb-3">
                          Condition: {product.condition}
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xl font-bold text-brand-primary">
                            {product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-neutral-500 line-through">
                              {product.originalPrice}
                            </span>
                          )}
                        </div>
                        <Button className="w-full" asChild>
                          <Link href={`/product/${product.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id} className="shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Avatar className="h-12 w-12 hidden sm:block">
                        <AvatarImage src={`/placeholder-user.jpg`} alt={review.buyer} />
                        <AvatarFallback>{review.buyer.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                          <div>
                            <span className="font-semibold text-neutral-800">{review.buyer}</span>
                            <p className="text-sm text-neutral-500">on: {review.product}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <div className="flex items-center">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                              ))}
                              {[...Array(5 - review.rating)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 text-neutral-300" />
                              ))}
                            </div>
                            <span className="text-sm text-neutral-500">{review.date}</span>
                          </div>
                        </div>
                        <p className="text-neutral-700">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'about' && (
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">About TechExpat Store</h3>
                <div className="prose max-w-none text-neutral-700">
                  <p>
                    Welcome to my store! I'm an IT professional based in Dubai with a passion for
                    the latest technology. I believe in providing high-quality, authentic products
                    to the expat community at fair prices.
                  </p>
                  <p>
                    All my items are carefully inspected, cleaned, and tested to ensure they are in
                    excellent working condition. I pride myself on transparent communication and
                    fast, reliable service.
                  </p>
                  <ul>
                    <li>
                      <strong>Verified Seller:</strong> My identity has been verified by the
                      platform for your security.
                    </li>
                    <li>
                      <strong>Top Rated:</strong> I maintain a high rating based on feedback from
                      happy customers.
                    </li>
                    <li>
                      <strong>Quick Response:</strong> I aim to respond to all inquiries within a
                      few hours.
                    </li>
                  </ul>
                  <p>Feel free to reach out if you have any questions about my listings!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
