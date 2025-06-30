'use client'

import { useState } from 'react'
import { X, Plus, DollarSign, AlertCircle, CheckCircle2, Camera, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import SellerLayout from '@/components/seller-layout'
import { RouteGuard } from '@/components/route-guard'
import {
  SELLING_CATEGORIES,
  ITEM_CONDITIONS,
  SELLING_TIPS,
  EXPAT_LOCATIONS,
  CURRENCIES,
} from '@/lib/constants'
import Image from 'next/image'

interface FormData {
  images: string[]
  mainImage: string
  title: string
  category: string
  condition: string
  location: string
  description: string
  price: string
  originalPrice: string
  currency: string
  isPremium: boolean
}

const INITIAL_FORM_DATA: FormData = {
  images: [],
  mainImage: '',
  title: '',
  category: '',
  condition: '',
  location: '',
  description: '',
  price: '',
  originalPrice: '',
  currency: 'TZS',
  isPremium: false,
}

const STEP_TITLES = ['Basic Details', 'Photos & Description', 'Pricing & Publish']

export default function SellPage() {
  return (
    <RouteGuard
      requireAuth
      requireVerification="sell"
      loadingMessage="Verifying seller permissions..."
    >
      <SellPageContent />
    </RouteGuard>
  )
}

function SellPageContent() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<string[]>([])

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const addImage = (type: string) => {
    const newImageUrl = `/placeholder.svg?height=400&width=400&text=${type}`
    if (type === 'main') {
      updateFormData({ mainImage: newImageUrl })
    }
    if (!formData.images.includes(newImageUrl)) {
      updateFormData({ images: [...formData.images, newImageUrl] })
    }
  }

  const removeImage = (imageUrl: string) => {
    if (imageUrl === formData.mainImage) {
      updateFormData({ mainImage: '' })
    }
    updateFormData({ images: formData.images.filter((img) => img !== imageUrl) })
  }

  const validateStep = (step: number) => {
    const newErrors: string[] = []

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.push('Please enter a title')
        if (!formData.category) newErrors.push('Please select a category')
        if (!formData.condition) newErrors.push('Please select condition')
        if (!formData.location) newErrors.push('Please choose location')
        break
      case 2:
        if (!formData.mainImage) newErrors.push('Please upload at least one image')
        if (!formData.description.trim()) newErrors.push('Please add description')
        break
      case 3:
        if (!formData.price) newErrors.push('Please set a price')
        break
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1)
      setErrors([])
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors([])
    }
  }

  const publishListing = async () => {
    if (!validateStep(3)) return

    const payload = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: `${parseFloat(formData.price).toLocaleString()} ${formData.currency}`,
      originalPrice: formData.originalPrice
        ? `${parseFloat(formData.originalPrice).toLocaleString()} ${formData.currency}`
        : undefined,
    }

    try {
      // TODO: Replace with actual API call
      console.log('Publishing listing:', payload)
      alert('Listing published successfully!')
    } catch (error) {
      console.error('Failed to publish listing:', error)
      setErrors(['Failed to publish listing. Please try again.'])
    }
  }

  return (
    <SellerLayout>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              List Your Item
            </h1>
          </div>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Create a professional listing and reach thousands of potential buyers
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto mb-8">
            {[1, 2, 3].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                      step <= currentStep
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step < currentStep ? <CheckCircle2 className="h-6 w-6" /> : step}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      step <= currentStep ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {STEP_TITLES[step - 1]}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`w-24 h-1 mx-4 rounded-full transition-all duration-300 ${
                      step < currentStep
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {errors.length > 0 && (
              <Alert variant="destructive" className="mb-8">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <StepContent
              currentStep={currentStep}
              formData={formData}
              updateFormData={updateFormData}
              addImage={addImage}
              removeImage={removeImage}
            />

            <div className="flex justify-between mt-12">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-8 py-3 h-auto text-lg"
              >
                Previous
              </Button>
              {currentStep < 3 ? (
                <Button
                  onClick={nextStep}
                  className="px-8 py-3 h-auto text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={publishListing}
                  className="px-8 py-3 h-auto text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Publish Listing
                </Button>
              )}
            </div>
          </div>

          <SellingSidebar currentStep={currentStep} />
        </div>
      </div>
    </SellerLayout>
  )
}

// Extracted step content component
function StepContent({
  currentStep,
  formData,
  updateFormData,
  addImage,
  removeImage,
}: {
  currentStep: number
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  addImage: (type: string) => void
  removeImage: (imageUrl: string) => void
}) {
  const stepConfig = {
    1: {
      title: 'Basic Item Details',
      description: 'Tell us about your item. The more details, the better!',
    },
    2: {
      title: 'Photos & Description',
      description: 'Great photos sell faster! Add multiple angles.',
    },
    3: {
      title: 'Pricing & Options',
      description: 'Set a competitive price and choose listing options.',
    },
  }

  const config = stepConfig[currentStep as keyof typeof stepConfig]

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold">
            {currentStep}
          </div>
          {config.title}
        </CardTitle>
        <p className="text-neutral-600 mt-2">{config.description}</p>
      </CardHeader>
      <CardContent className="space-y-8">
        {currentStep === 1 && <Step1Content formData={formData} updateFormData={updateFormData} />}
        {currentStep === 2 && (
          <Step2Content
            formData={formData}
            updateFormData={updateFormData}
            addImage={addImage}
            removeImage={removeImage}
          />
        )}
        {currentStep === 3 && <Step3Content formData={formData} updateFormData={updateFormData} />}
      </CardContent>
    </Card>
  )
}

// Step 1: Basic Details
function Step1Content({
  formData,
  updateFormData,
}: {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}) {
  return (
    <>
      <div className="space-y-3">
        <Label htmlFor="title" className="text-base font-semibold text-neutral-800">
          Item Title *
        </Label>
        <Input
          id="title"
          placeholder="e.g., MacBook Pro 14″ M2, iPhone 15 Pro Max"
          className="h-14 text-lg border-2 focus:border-blue-500 transition-colors"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
        />
        <p className="text-sm text-neutral-500">Include brand, model, and key features</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="text-base font-semibold text-neutral-800">Category *</Label>
          <Select
            onValueChange={(value) => updateFormData({ category: value })}
            value={formData.category}
          >
            <SelectTrigger className="h-14 border-2 focus:border-blue-500">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {SELLING_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold text-neutral-800">Condition *</Label>
          <Select
            onValueChange={(value) => updateFormData({ condition: value })}
            value={formData.condition}
          >
            <SelectTrigger className="h-14 border-2 focus:border-blue-500">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {ITEM_CONDITIONS.map((cond) => (
                <SelectItem key={cond.value} value={cond.value}>
                  {cond.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-semibold text-neutral-800">Location *</Label>
        <Select
          onValueChange={(value) => updateFormData({ location: value })}
          value={formData.location}
        >
          <SelectTrigger className="h-14 border-2 focus:border-blue-500">
            <SelectValue placeholder="Select your location" />
          </SelectTrigger>
          <SelectContent>
            {EXPAT_LOCATIONS.map((loc) => (
              <SelectItem key={loc.value} value={loc.label}>
                {loc.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}

// Step 2: Photos & Description
function Step2Content({
  formData,
  updateFormData,
  addImage,
  removeImage,
}: {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  addImage: (type: string) => void
  removeImage: (imageUrl: string) => void
}) {
  return (
    <>
      <div>
        <Label className="text-base font-semibold text-neutral-800 mb-4 block">
          Upload Photos *
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="col-span-2 aspect-square border-2 border-dashed border-blue-300 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-colors cursor-pointer group">
            {formData.mainImage ? (
              <div className="relative w-full h-full">
                <Image
                  src={formData.mainImage}
                  alt="Main"
                  fill
                  className="object-cover rounded-lg"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg"
                  onClick={() => removeImage(formData.mainImage)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Badge className="absolute bottom-2 left-2 bg-blue-600 text-white">
                  Main Photo
                </Badge>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={() => addImage('main')}
                className="h-full w-full flex-col gap-3 hover:bg-transparent"
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Camera className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-center">
                  <span className="font-medium text-blue-600">Main Photo</span>
                  <p className="text-xs text-neutral-500 mt-1">Required</p>
                </div>
              </Button>
            )}
          </div>

          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
            >
              <Button
                variant="ghost"
                onClick={() => addImage(`detail-${num}`)}
                className="h-full w-full flex-col gap-2 hover:bg-transparent"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                  <Plus className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-xs text-gray-500">Add Photo</span>
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="description" className="text-base font-semibold text-neutral-800">
          Description *
        </Label>
        <Textarea
          id="description"
          rows={8}
          placeholder="Describe your item in detail..."
          className="text-base border-2 focus:border-blue-500 transition-colors resize-none"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
        />
      </div>
    </>
  )
}

// Step 3: Pricing
function Step3Content({
  formData,
  updateFormData,
}: {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}) {
  return (
    <>
      <div className="space-y-3">
        <Label className="text-base font-semibold text-neutral-800">Currency</Label>
        <Select
          value={formData.currency}
          onValueChange={(value) => updateFormData({ currency: value })}
        >
          <SelectTrigger className="h-14 border-2 focus:border-blue-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((curr) => (
              <SelectItem key={curr.code} value={curr.code}>
                {curr.flag} {curr.code} - {curr.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label htmlFor="price" className="text-base font-semibold text-neutral-800">
            Asking Price * ({formData.currency})
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <Input
              id="price"
              type="number"
              placeholder="2500000"
              className="pl-12 h-14 text-lg border-2 focus:border-blue-500 transition-colors"
              value={formData.price}
              onChange={(e) => updateFormData({ price: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="originalPrice" className="text-base font-semibold text-neutral-800">
            Original Price
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <Input
              id="originalPrice"
              type="number"
              placeholder="3000000"
              className="pl-12 h-14 text-lg border-2 focus:border-blue-500 transition-colors"
              value={formData.originalPrice}
              onChange={(e) => updateFormData({ originalPrice: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <Checkbox
            id="premium"
            checked={formData.isPremium}
            onCheckedChange={(checked) => updateFormData({ isPremium: !!checked })}
            className="mt-1 h-5 w-5"
          />
          <div className="flex-1">
            <Label
              htmlFor="premium"
              className="text-lg font-semibold text-amber-900 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-5 w-5" />
              Premium Listing
            </Label>
            <p className="text-amber-700 mt-2">
              Get 3x more visibility with featured placement and priority ranking.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                Featured
              </Badge>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                Priority
              </Badge>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                Premium Badge
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">Ready to Publish!</h3>
        </div>
        <p className="text-green-700">
          Your listing will be reviewed and go live within a few minutes.
        </p>
      </div>
    </>
  )
}

// Sidebar component
function SellingSidebar({ currentStep }: { currentStep: number }) {
  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-8 space-y-6">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">💡 Pro Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {SELLING_TIPS.map((tip, index) => {
              const Icon = tip.icon as any
              return (
                <div key={index} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">{tip.title}</h4>
                    <p className="text-sm text-blue-700 mt-1">{tip.description}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-purple-900 mb-4">Your Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Completion</span>
                <span className="font-medium">{Math.round((currentStep / 3) * 100)}%</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
              <p className="text-xs text-purple-700">Step {currentStep} of 3 completed</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}
