'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useVerification } from '@/hooks/use-verification'
import Link from 'next/link'
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  MessageCircle,
  Star,
  TrendingUp,
  Package,
  DollarSign,
  BarChart3,
  Search,
  MoreHorizontal,
  Copy,
  Share2,
  Archive,
  RefreshCw,
  Calendar,
  MapPin,
  Shield,
  Crown,
  Settings,
  Download,
  Upload,
  ExternalLink,
  ChevronLeft,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import SellerLayout from '@/components/seller-layout'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const myProducts = [
  {
    id: 1,
    title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
    price: '$1,199',
    originalPrice: '$1,299',
    status: 'Active',
    views: 234,
    inquiries: 12,
    favorites: 18,
    image: '/images/iphone-15-pro.jpg',
    category: 'Electronics',
    condition: 'Like New',
    datePosted: '2024-01-15',
    expiresOn: '2024-02-14',
    premium: true,
    featured: true,
  },
  {
    id: 2,
    title: 'MacBook Air M2 13" - Space Gray',
    price: '$999',
    originalPrice: '$1,199',
    status: 'Sold',
    views: 156,
    inquiries: 8,
    favorites: 12,
    image: '/images/macbook-pro.jpg',
    category: 'Electronics',
    condition: 'Excellent',
    datePosted: '2024-01-10',
    soldOn: '2024-01-20',
    premium: false,
    featured: false,
  },
  {
    id: 3,
    title: 'iPad Pro 12.9" 2024 - Silver',
    price: '$899',
    originalPrice: '$1,099',
    status: 'Active',
    views: 89,
    inquiries: 5,
    favorites: 7,
    image: '/images/iphone-15-pro.jpg',
    category: 'Electronics',
    condition: 'Like New',
    datePosted: '2024-01-12',
    expiresOn: '2024-02-11',
    premium: true,
    featured: false,
  },
  {
    id: 4,
    title: 'BMW X5 2022 - Expat Owned',
    price: '$45,000',
    originalPrice: '$52,000',
    status: 'Active',
    views: 312,
    inquiries: 23,
    favorites: 45,
    image: '/images/bmw-x5.jpg',
    category: 'Automotive',
    condition: 'Excellent',
    datePosted: '2024-01-08',
    expiresOn: '2024-02-07',
    premium: true,
    featured: true,
  },
  {
    id: 5,
    title: 'Designer Italian Sofa Set',
    price: '$1,200',
    originalPrice: '$1,800',
    status: 'Pending',
    views: 67,
    inquiries: 4,
    favorites: 9,
    image: '/images/italian-sofa.jpg',
    category: 'Furniture',
    condition: 'Very Good',
    datePosted: '2024-01-14',
    expiresOn: '2024-02-13',
    premium: false,
    featured: false,
  },
  {
    id: 6,
    title: 'PlayStation 5 + Games Bundle',
    price: '$650',
    originalPrice: '$750',
    status: 'Draft',
    views: 0,
    inquiries: 0,
    favorites: 0,
    image: '/images/playstation-5.jpg',
    category: 'Gaming',
    condition: 'Like New',
    datePosted: '2024-01-16',
    premium: false,
    featured: false,
  },
]

const recentMessages = [
  {
    id: 1,
    buyer: 'Sarah Mitchell',
    avatar: '/images/seller-avatar-1.jpg',
    product: 'iPhone 15 Pro Max',
    message: 'Is this still available? Can we meet tomorrow?',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 2,
    buyer: 'Ahmed Hassan',
    avatar: '/images/seller-avatar-2.jpg',
    product: 'MacBook Air M2',
    message: 'Thanks for the quick delivery!',
    time: '1 day ago',
    unread: false,
  },
  {
    id: 3,
    buyer: 'Lisa Wang',
    avatar: '/images/seller-avatar-3.jpg',
    product: 'iPad Pro',
    message: "What's the battery health?",
    time: '2 days ago',
    unread: true,
  },
]

const recentOrders = [
  {
    id: 'ORD-001',
    buyer: 'John D.',
    product: 'MacBook Air M2',
    amount: '$999',
    status: 'Completed',
    date: '2024-01-15',
  },
  {
    id: 'ORD-002',
    buyer: 'Maria S.',
    product: 'iPhone 14 Pro',
    amount: '$799',
    status: 'In Progress',
    date: '2024-01-14',
  },
  {
    id: 'ORD-003',
    buyer: 'David L.',
    product: 'iPad Air',
    amount: '$549',
    status: 'Pending',
    date: '2024-01-13',
  },
]

const chartData = [
  { name: 'Jan', earnings: 1200, views: 2400 },
  { name: 'Feb', earnings: 2100, views: 1398 },
  { name: 'Mar', earnings: 980, views: 5800 },
  { name: 'Apr', earnings: 1500, views: 3908 },
  { name: 'May', earnings: 1890, views: 4800 },
  { name: 'Jun', earnings: 2390, views: 3800 },
]

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  changeType: 'increase' | 'decrease'
  period: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, changeType, period }) => (
  <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-neutral-600">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-neutral-800">{value}</div>
      <p className="text-xs text-neutral-500 mt-1">
        <span
          className={`font-semibold ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}
        >
          {change}
        </span>
        {period}
      </p>
    </CardContent>
  </Card>
)

export default function SellerDashboardPage() {
  const router = useRouter()
  const { isLoggedIn, isLoading: authLoading, user } = useAuth()
  const { checkVerification } = useVerification()
  const [accessChecked, setAccessChecked] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Check authentication and seller verification
  useEffect(() => {
    if (!authLoading) {
      // Check if user is logged in
      if (!isLoggedIn) {
        router.push('/login?redirect=/seller/dashboard')
        return
      }

      // Check if user is verified to sell
      if (!checkVerification('sell')) {
        // checkVerification will handle showing verification popup or redirect
        return
      }

      setAccessChecked(true)
    }
  }, [authLoading, isLoggedIn, router, checkVerification])

  // Show loading state while checking access
  if (authLoading || !accessChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Verifying seller access...</p>
        </div>
      </div>
    )
  }

  // Don't render if user doesn't have access
  if (!isLoggedIn) {
    return null
  }

  const filteredProducts = myProducts.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || product.status.toLowerCase() === statusFilter
    const matchesCategory =
      categoryFilter === 'all' || product.category.toLowerCase() === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const selectAllProducts = () => {
    setSelectedProducts(filteredProducts.map((p) => p.id))
  }

  const clearSelection = () => {
    setSelectedProducts([])
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'sold':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleProductAction = async (action: string, productId?: number, productIds?: number[]) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const ids = productId ? [productId] : productIds || []
      const productTitles = myProducts
        .filter((p) => ids.includes(p.id))
        .map((p) => p.title)
        .join(', ')

      switch (action) {
        case 'delete':
          toast({
            title: 'Products deleted',
            description: `${ids.length} product(s) have been deleted successfully.`,
          })
          break
        case 'archive':
          toast({
            title: 'Products archived',
            description: `${ids.length} product(s) have been archived.`,
          })
          break
        case 'publish':
          toast({
            title: 'Products published',
            description: `${ids.length} draft product(s) have been published.`,
          })
          break
        case 'feature':
          toast({
            title: 'Products featured',
            description: `${ids.length} product(s) are now featured listings.`,
          })
          break
        default:
          toast({
            title: 'Action completed',
            description: `Action "${action}" completed successfully.`,
          })
      }

      if (productIds) {
        setSelectedProducts([])
      }
    } catch (error) {
      toast({
        title: 'Action failed',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    setIsLoading(true)
    try {
      // Simulate export
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: 'Export completed',
        description: 'Your data has been exported successfully.',
      })
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Earnings (30d)"
          value="$3,590"
          change="+12.5%"
          changeType="increase"
          period="vs last month"
          icon={<DollarSign className="h-4 w-4 text-neutral-500" />}
        />
        <StatCard
          title="Active Listings"
          value="12"
          change="-2"
          changeType="decrease"
          period="vs last month"
          icon={<Package className="h-4 w-4 text-neutral-500" />}
        />
        <StatCard
          title="Total Views (30d)"
          value="12,890"
          change="+8.2%"
          changeType="increase"
          period="vs last month"
          icon={<TrendingUp className="h-4 w-4 text-neutral-500" />}
        />
        <StatCard
          title="New Messages (30d)"
          value="42"
          change="+25%"
          changeType="increase"
          period="vs last month"
          icon={<MessageCircle className="h-4 w-4 text-neutral-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Earnings & Views Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid #ccc',
                    borderRadius: '0.5rem',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorEarnings)"
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Messages</CardTitle>
              <Link href="/messages">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMessages.map((msg) => (
              <Link
                key={msg.id}
                href={`/messages?seller=${encodeURIComponent(msg.buyer)}&product=${encodeURIComponent(msg.product)}`}
              >
                <div className="flex gap-3 p-2 hover:bg-neutral-50 rounded-lg cursor-pointer">
                  <Avatar>
                    <AvatarImage src={msg.avatar} alt={msg.buyer} />
                    <AvatarFallback>{msg.buyer.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{msg.buyer}</p>
                        <p className="text-xs text-neutral-500 truncate">{msg.product}</p>
                      </div>
                      {msg.unread && <Badge className="bg-blue-500 h-2 w-2 p-0 ml-2" />}
                    </div>
                    <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{msg.message}</p>
                    <p className="text-xs text-neutral-400 mt-1">{msg.time}</p>
                  </div>
                </div>
              </Link>
            ))}
            <Link href="/messages">
              <Button variant="outline" className="w-full mt-4" size="sm">
                View All Messages
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderMyListings = () => (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>My Listings</CardTitle>
            <p className="text-sm text-neutral-500 mt-1">Manage your active and past listings.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="automotive">Automotive</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-neutral-100 border rounded-lg mb-6">
            <span className="text-sm font-medium">
              {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleProductAction('feature', undefined, selectedProducts)}
                disabled={isLoading}
              >
                <Star className="w-4 h-4 mr-1" />
                Feature
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleProductAction('archive', undefined, selectedProducts)}
                disabled={isLoading}
              >
                <Archive className="w-4 h-4 mr-1" />
                Archive
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive" disabled={isLoading}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete selected products?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedProducts.length} products? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleProductAction('delete', undefined, selectedProducts)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Products
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearSelection}
              className="ml-auto"
              disabled={isLoading}
            >
              Clear
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[48px]">
                  <Checkbox
                    checked={
                      selectedProducts.length > 0 &&
                      selectedProducts.length === filteredProducts.length
                    }
                    onCheckedChange={(checked) =>
                      checked ? selectAllProducts() : clearSelection()
                    }
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead className="hidden lg:table-cell">Views</TableHead>
                <TableHead className="hidden lg:table-cell">Date Posted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="w-[48px]">
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-16 h-16 rounded-md object-cover hidden sm:block"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-neutral-800 truncate">{product.title}</div>
                        <div className="flex gap-1 mt-1">
                          {product.featured && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {product.premium && (
                            <Badge variant="secondary" className="text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(product.status)}>
                      {product.status}
                    </Badge>
                    {product.status === 'Active' &&
                      new Date(product.expiresOn) <
                        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-amber-600">Expires soon</span>
                        </div>
                      )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div>
                      <span className="font-semibold">{product.price}</span>
                      {product.originalPrice && (
                        <div className="text-sm text-neutral-500 line-through">
                          {product.originalPrice}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-sm">
                      <div>{product.views} views</div>
                      <div className="text-neutral-500">{product.inquiries} inquiries</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{product.datePosted}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isLoading}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/product/${product.id}`}>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" /> View Listing
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`/sell/edit/${product.id}`}>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          onClick={() =>
                            navigator.clipboard.writeText(
                              `${window.location.origin}/product/${product.id}`
                            )
                          }
                        >
                          <Copy className="mr-2 h-4 w-4" /> Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="mr-2 h-4 w-4" /> Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {product.status === 'Draft' && (
                          <DropdownMenuItem
                            onClick={() => handleProductAction('publish', product.id)}
                          >
                            <Upload className="mr-2 h-4 w-4" /> Publish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleProductAction('archive', product.id)}
                        >
                          <Archive className="mr-2 h-4 w-4" /> Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                              <span className="text-red-600">Delete</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete product?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{product.title}"? This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleProductAction('delete', product.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Product
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">No products found</h3>
            <p className="text-neutral-600 mb-4">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first listing'}
            </p>
            <Link href="/sell">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Listing
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderOrders = () => (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <p className="text-sm text-neutral-500 mt-1">Track your sales and order status.</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.buyer}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell className="font-semibold text-green-600">{order.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageCircle className="mr-2 h-4 w-4" /> Contact Buyer
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" /> Download Invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {recentOrders.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">No orders yet</h3>
            <p className="text-neutral-600 mb-4">
              Orders will appear here once customers purchase your items
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Link href="/account" className="hover:text-brand-primary">
            Account
          </Link>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-neutral-800">Seller Dashboard</span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800">Seller Dashboard</h1>
            <p className="text-neutral-600 mt-2">
              Welcome back, {user?.name}! Manage your listings and track your sales.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportData} disabled={isLoading}>
              <Download className="mr-2 h-4 w-4" />
              {isLoading ? 'Exporting...' : 'Export Data'}
            </Button>
            <Link href="/sell">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="listings">My Listings</SelectItem>
              <SelectItem value="orders">Orders</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden md:block">
          <TabsList className="grid grid-cols-3 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
        </Tabs>

        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'listings' && renderMyListings()}
          {activeTab === 'orders' && renderOrders()}
        </div>
      </div>
    </SellerLayout>
  )
}
