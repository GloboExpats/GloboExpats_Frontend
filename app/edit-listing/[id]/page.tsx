'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RouteGuard } from '@/components/route-guard'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { ITEM_CONDITIONS, EXPAT_LOCATIONS, CURRENCIES } from '@/lib/constants'
import { CURRENCIES as CURRENCY_CONFIG } from '@/lib/currency-converter'
import { getFullImageUrl } from '@/lib/image-utils'
import { ArrowLeft, AlertCircle, Loader2, Upload, X, Star, Trash2 } from 'lucide-react'

interface FormData {
  productName: string
  categoryId: number
  condition: string
  location: string
  productDescription: string
  currency: string
  askingPrice: string
  originalPrice: string
  productWarranty: string
}

interface ProductImage {
  imageId: number
  imageUrl: string
  isMain: boolean
}

export default function EditListingPage() {
  return (
    <RouteGuard requireAuth requireVerification="sell" loadingMessage="Loading listing editor...">
      <EditListingContent />
    </RouteGuard>
  )
}

function EditListingContent() {
  useAuth() // Auth context available if needed
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [product, setProduct] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([])
  const [currentImages, setCurrentImages] = useState<ProductImage[]>([])
  const [imagesToRemove, setImagesToRemove] = useState<number[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

  const [formData, setFormData] = useState<FormData>({
    productName: '',
    categoryId: 0,
    condition: '',
    location: '',
    productDescription: '',
    currency: 'TZS',
    askingPrice: '',
    originalPrice: '',
    productWarranty: '',
  })

  // Fetch product data and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch product details and categories in parallel
        const [productResponse, categoriesResponse] = await Promise.all([
          apiClient.getProductForEdit(productId),
          apiClient.getCategories(),
        ])

        console.log('Product data:', productResponse)
        setProduct(productResponse)
        setCategories(categoriesResponse)

        // Pre-populate form with existing data
        const product = productResponse as Record<string, unknown>

        // Set current images
        if (product.productImages && Array.isArray(product.productImages)) {
          setCurrentImages(product.productImages as ProductImage[])
        }

        // Handle location: convert backend location to proper value
        let locationValue = String(product.productLocation || '').trim()
        console.log('📍 Original location from backend:', locationValue)

        // Try exact match first (value or label)
        let locationMatch = EXPAT_LOCATIONS.find(
          (loc) => loc.label === locationValue || loc.value === locationValue
        )

        // If no exact match, try partial match (for corrupted data like "Dar es Salaam" without emoji)
        if (!locationMatch && locationValue) {
          locationMatch = EXPAT_LOCATIONS.find((loc) => {
            // Remove emojis and special chars for comparison
            const cleanLabel = loc.label
              .replace(/[^\w\s,]/g, '')
              .trim()
              .toLowerCase()
            const cleanValue = locationValue
              .replace(/[^\w\s,]/g, '')
              .trim()
              .toLowerCase()
            return (
              cleanLabel.includes(cleanValue) ||
              cleanValue.includes(cleanLabel) ||
              (loc.country && loc.country.toLowerCase().includes(cleanValue)) ||
              cleanValue.includes(loc.value)
            )
          })
        }

        if (locationMatch) {
          locationValue = locationMatch.value
          console.log('✅ Matched location to:', locationMatch.value, '-', locationMatch.label)
        } else if (locationValue) {
          // If we have a value but no match, default to first location and warn
          console.warn(
            '⚠️ Could not match location:',
            locationValue,
            '- Defaulting to dar-es-salaam'
          )
          locationValue = 'dar-es-salaam'
        } else {
          // No location at all, default to first
          console.warn('⚠️ No location found - Defaulting to dar-es-salaam')
          locationValue = 'dar-es-salaam'
        }

        setFormData({
          productName: String(product.productName || ''),
          categoryId: Number(product.categoryId || 0),
          condition: String(product.productCondition || ''),
          location: locationValue,
          productDescription: String(product.productDescription || ''),
          currency: String(product.productCurrency || 'TZS'),
          askingPrice: String(product.productAskingPrice || ''),
          originalPrice: String(product.productOriginalPrice || ''),
          productWarranty: String(product.productWarranty || '1 year manufacturer warranty'),
        })

        console.log('📋 Form data loaded:', {
          productName: String(product.productName || ''),
          location: locationValue,
          condition: String(product.productCondition || ''),
        })
      } catch (error) {
        console.error('Failed to load product:', error)
        setErrors(['Failed to load product data. Please try again.'])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productId])

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate file size (5MB max)
    const validFiles: File[] = []
    const invalidFiles: string[] = []

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} exceeds 5MB`)
      } else if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} is not an image`)
      } else {
        validFiles.push(file)
      }
    })

    if (invalidFiles.length > 0) {
      setErrors(invalidFiles)
      return
    }

    // Limit total images (current + new) to 10
    const totalImages =
      currentImages.length - imagesToRemove.length + newImages.length + validFiles.length
    if (totalImages > 10) {
      setErrors([`Maximum 10 images allowed. You would have ${totalImages} images.`])
      return
    }

    // Create preview URLs
    const previews = validFiles.map((file) => URL.createObjectURL(file))
    setNewImages([...newImages, ...validFiles])
    setNewImagePreviews([...newImagePreviews, ...previews])
    setErrors([])
  }

  // Remove a new image (not yet uploaded)
  const removeNewImage = (index: number) => {
    const newImagesArray = [...newImages]
    const newPreviewsArray = [...newImagePreviews]

    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(newPreviewsArray[index])

    newImagesArray.splice(index, 1)
    newPreviewsArray.splice(index, 1)

    setNewImages(newImagesArray)
    setNewImagePreviews(newPreviewsArray)
  }

  // Mark an existing image for removal
  const markImageForRemoval = (imageId: number) => {
    if (imagesToRemove.includes(imageId)) {
      // Unmark for removal
      setImagesToRemove(imagesToRemove.filter((id) => id !== imageId))
    } else {
      // Check if at least one image will remain
      const remainingImages = currentImages.length - imagesToRemove.length - 1 + newImages.length
      if (remainingImages < 1) {
        setErrors(['Product must have at least one image'])
        return
      }
      setImagesToRemove([...imagesToRemove, imageId])
      setErrors([])
    }
  }

  // Move image to first position (make it main)
  const setAsMainImage = (index: number) => {
    const newOrder = [...currentImages]
    const [imageToMove] = newOrder.splice(index, 1)
    newOrder.unshift(imageToMove)
    setCurrentImages(newOrder)
    setErrors([])

    // Show success feedback
    toast({
      title: '✅ Main photo updated',
      description: 'This image will be set as the main photo when you save your changes.',
      variant: 'default',
      duration: 3000,
    })
  }

  // Helper function to download image as File
  const downloadImageAsFile = async (imageUrl: string, filename: string): Promise<File> => {
    const fullUrl = getFullImageUrl(imageUrl)
    const response = await fetch(fullUrl)
    const blob = await response.blob()
    return new File([blob], filename, { type: blob.type })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    // Validation
    const newErrors = []
    if (!formData.productName.trim()) newErrors.push('Product name is required')
    if (!formData.categoryId) newErrors.push('Category is required')
    if (!formData.condition) newErrors.push('Condition is required')
    if (!formData.location) newErrors.push('Location is required')
    if (!formData.productDescription.trim()) newErrors.push('Description is required')
    if (!formData.askingPrice || isNaN(Number(formData.askingPrice))) {
      newErrors.push('Valid asking price is required')
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setSaving(true)

      // Convert prices from selected currency to TZS (base currency)
      const enteredCurrency = formData.currency as 'TZS' | 'USD' | 'KES' | 'UGX'
      const conversionRate = CURRENCY_CONFIG[enteredCurrency].exchangeRate

      // If user entered in USD/KES/UGX, divide by exchange rate to get TZS
      // If already in TZS, no conversion needed (rate = 1)
      const askingPriceInTZS = parseFloat(formData.askingPrice) / conversionRate
      const originalPriceInTZS = formData.originalPrice
        ? parseFloat(formData.originalPrice) / conversionRate
        : 0

      console.log('💱 Currency Conversion:', {
        enteredCurrency,
        conversionRate,
        enteredAskingPrice: formData.askingPrice,
        convertedAskingPrice: askingPriceInTZS,
        enteredOriginalPrice: formData.originalPrice,
        convertedOriginalPrice: originalPriceInTZS,
      })

      // Validate field lengths before sending (database limits)
      const MAX_LENGTHS = {
        productName: 255,
        location: 100, // Reduced to avoid emoji issues
        condition: 50,
        currency: 10,
        productWarranty: 255,
      }

      const updateData = {
        productName: formData.productName.trim().substring(0, MAX_LENGTHS.productName),
        categoryId: formData.categoryId,
        condition: formData.condition.substring(0, MAX_LENGTHS.condition),
        location: formData.location.substring(0, MAX_LENGTHS.location),
        productDescription: formData.productDescription.trim(),
        currency: 'TZS',
        askingPrice: Math.round(askingPriceInTZS),
        originalPrice: Math.round(originalPriceInTZS),
        productWarranty: formData.productWarranty.substring(0, MAX_LENGTHS.productWarranty),
      }

      // Check if image order has changed (main image selection)
      const originalOrder = (product.productImages as ProductImage[]) || []
      const orderChanged =
        originalOrder.length > 0 &&
        currentImages.length > 0 &&
        originalOrder[0].imageId !== currentImages[0].imageId

      let imagesToUpload = newImages
      let imageIdsToDelete = imagesToRemove

      // If order changed, we need to re-upload all images in new order
      if (orderChanged && currentImages.length > 0) {
        console.log('🔄 Image order changed - re-uploading in new order...')
        try {
          // Download all current images (excluding marked for removal)
          const activeImages = currentImages.filter((img) => !imagesToRemove.includes(img.imageId))
          const reorderedFiles = await Promise.all(
            activeImages.map((img, index) =>
              downloadImageAsFile(img.imageUrl, `image-${index}.jpg`)
            )
          )

          // Add new images at the end
          imagesToUpload = [...reorderedFiles, ...newImages]

          // Delete ALL current images (they'll be replaced)
          imageIdsToDelete = currentImages.map((img) => img.imageId)

          console.log(
            `📸 Re-uploading ${reorderedFiles.length} existing + ${newImages.length} new images in correct order`
          )
        } catch (downloadError) {
          console.error('❌ Failed to download images for reordering:', downloadError)
          throw new Error('Failed to reorder images. Please try again.')
        }
      }

      console.log('📦 Updating product with data:', updateData)
      console.log('🖼️ Images to remove:', imageIdsToDelete)
      console.log('📸 Images to upload:', imagesToUpload.length)

      const result = await apiClient.updateProduct(
        productId,
        updateData,
        imagesToUpload.length > 0 ? imagesToUpload : undefined,
        imageIdsToDelete.length > 0 ? imageIdsToDelete : undefined
      )

      console.log('✅ Product updated successfully!', result)

      // Show success toast
      toast({
        title: 'Success!',
        description: 'Your listing has been updated successfully.',
        variant: 'default',
      })

      // Redirect back to dashboard after a brief delay
      setTimeout(() => {
        router.push('/expat/dashboard?tab=listings')
      }, 1000)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('❌ Failed to update product:', error)
      const errorMessage = error?.message || 'Failed to update listing. Please try again.'
      setErrors([errorMessage])

      // Show error toast
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive',
      })

      // Show more details in console for debugging
      if (error?.response) {
        console.error('Error response:', error.response)
      }
      if (error?.status) {
        console.error('Error status:', error.status)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
            <span className="ml-2 text-[#64748B]">Loading listing...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Alert variant="destructive" className="mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Product not found or you don&apos;t have permission to edit it.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Edit Listing</h1>
            <p className="text-[#64748B]">Update your product information</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Product Images Management */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <p className="text-sm text-[#64748B] mt-1">
                Manage your product photos (maximum 10 images, 5MB each)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Images */}
              {currentImages.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Current Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {currentImages.map((image, index) => {
                      const isMarkedForRemoval = imagesToRemove.includes(image.imageId)
                      return (
                        <div
                          key={image.imageId}
                          className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden group ${
                            isMarkedForRemoval ? 'opacity-50 ring-2 ring-red-500' : ''
                          }`}
                        >
                          <Image
                            src={getFullImageUrl(image.imageUrl)}
                            alt={`Product image ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                          {/* Main image badge */}
                          {index === 0 && !isMarkedForRemoval && (
                            <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg flex items-center gap-1">
                              <Star className="w-3 h-3 fill-white" />
                              Main Photo
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="absolute top-2 right-2 flex gap-2">
                            {/* Set as Main button - only show on non-main images */}
                            {index !== 0 && !isMarkedForRemoval && (
                              <button
                                type="button"
                                onClick={() => setAsMainImage(index)}
                                className="group/btn flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-lg text-xs font-medium"
                                title="Set as main photo"
                              >
                                <Star className="w-3 h-3" />
                                <span>Make Main</span>
                              </button>
                            )}

                            {/* Remove/Restore button */}
                            <button
                              type="button"
                              onClick={() => markImageForRemoval(image.imageId)}
                              className={`group/btn flex items-center gap-1 px-2 py-1 rounded-md transition-all shadow-lg text-xs font-medium ${
                                isMarkedForRemoval
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-red-600 hover:bg-red-700 text-white opacity-0 group-hover:opacity-100'
                              }`}
                              title={isMarkedForRemoval ? 'Keep this image' : 'Remove image'}
                            >
                              {isMarkedForRemoval ? (
                                <>
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  <span>Keep</span>
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-3 h-3" />
                                  <span>Remove</span>
                                </>
                              )}
                            </button>
                          </div>
                          {isMarkedForRemoval && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                              <span className="text-white text-sm font-medium">
                                Will be removed
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* New Images Preview */}
              {newImages.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">New Images to Add</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {newImagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
                      >
                        <Image
                          src={preview}
                          alt={`New image ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                          New
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove new image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div>
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1E3A8A] hover:bg-blue-50 transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-1">Click to add more images</p>
                    <p className="text-xs text-gray-400">
                      {currentImages.length - imagesToRemove.length + newImages.length}/10 images
                    </p>
                  </div>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </Label>
              </div>

              {/* Image Guidelines */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-[#1E3A8A] font-medium mb-1">Image Guidelines:</p>
                <ul className="text-xs text-[#64748B] space-y-1">
                  <li>• Maximum 10 images per product</li>
                  <li>• Each image must be under 5MB</li>
                  <li>• Supported formats: JPG, PNG, WebP</li>
                  <li>
                    • <strong className="text-blue-600">First image = Main photo</strong> (shown on
                    product cards)
                  </li>
                  <li>
                    • <strong className="text-green-600">💡 To change main photo:</strong> Click
                    &quot;Make Main&quot; button on any image, then save
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, productName: e.target.value }))
                  }
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, categoryId: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                        {category.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, condition: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_CONDITIONS.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPAT_LOCATIONS.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.productDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, productDescription: e.target.value }))
                  }
                  placeholder="Describe your product..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="askingPrice">Asking Price ({formData.currency})</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-500">
                    {formData.currency === 'TZS'
                      ? 'TSh'
                      : formData.currency === 'USD'
                        ? '$'
                        : formData.currency === 'KES'
                          ? 'KSh'
                          : 'USh'}
                  </span>
                  <Input
                    id="askingPrice"
                    type="number"
                    value={formData.askingPrice}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, askingPrice: e.target.value }))
                    }
                    placeholder={
                      formData.currency === 'TZS'
                        ? '2,500,000'
                        : formData.currency === 'USD'
                          ? '1,000'
                          : formData.currency === 'KES'
                            ? '131,250'
                            : '3,700,000'
                    }
                    className="pl-14"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="originalPrice">
                  Original Price{' '}
                  <span className="text-sm font-normal text-neutral-500">
                    (Optional - can be left blank)
                  </span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-500">
                    {formData.currency === 'TZS'
                      ? 'TSh'
                      : formData.currency === 'USD'
                        ? '$'
                        : formData.currency === 'KES'
                          ? 'KSh'
                          : 'USh'}
                  </span>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, originalPrice: e.target.value }))
                    }
                    placeholder={
                      formData.currency === 'TZS'
                        ? '3,000,000'
                        : formData.currency === 'USD'
                          ? '1,200'
                          : formData.currency === 'KES'
                            ? '157,500'
                            : '4,440,000'
                    }
                    className="pl-14"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="warranty">Warranty</Label>
                <Input
                  id="warranty"
                  value={formData.productWarranty}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, productWarranty: e.target.value }))
                  }
                  placeholder="e.g., 1 year manufacturer warranty"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Listing'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
