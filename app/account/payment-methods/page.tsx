'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useToast } from '@/components/ui/use-toast'

interface PaymentMethod {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: '',
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await fetch('/api/payment-methods', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch payment methods')
        const data = (await res.json()) as PaymentMethod[]
        setMethods(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMethods()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({ cardNumber: '', expMonth: '', expYear: '', cvc: '' })
  }

  const handleAddMethod = async () => {
    try {
      const res = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed to add payment method')
      const newMethod: PaymentMethod = await res.json()
      setMethods((prev) => [...prev, newMethod])
      toast({ title: 'Payment method added' })
      setIsDialogOpen(false)
      resetForm()
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove payment method')
      setMethods((prev) => prev.filter((m) => m.id !== id))
      toast({ title: 'Payment method removed' })
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    }
  }

  if (isLoading) {
    return <p className="p-6 text-center">Loading payment methods...</p>
  }

  if (error) {
    return <p className="p-6 text-center text-destructive">{error}</p>
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-neutral-800">Payment Methods</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Card
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add new card</DialogTitle>
                <DialogDescription>
                  Enter your card details. All payments are processed securely.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card number</Label>
                  <Input
                    id="cardNumber"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expMonth">MM</Label>
                    <Input
                      id="expMonth"
                      value={formData.expMonth}
                      onChange={(e) => handleInputChange('expMonth', e.target.value)}
                      placeholder="08"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expYear">YY</Label>
                    <Input
                      id="expYear"
                      value={formData.expYear}
                      onChange={(e) => handleInputChange('expYear', e.target.value)}
                      placeholder="27"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      value={formData.cvc}
                      onChange={(e) => handleInputChange('cvc', e.target.value)}
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddMethod}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {methods.length === 0 ? (
          <p className="text-neutral-600">No payment methods saved yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {methods.map((method) => (
              <Card key={method.id} className="bg-white shadow-sm">
                <CardHeader className="flex-row items-center gap-3">
                  <CreditCard className="w-5 h-5 text-brand-primary" />
                  <CardTitle className="text-base font-medium">
                    {method.brand} •••• {method.last4}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between p-4 pt-0">
                  <div className="text-sm text-neutral-600">
                    Expires {method.expMonth}/{method.expYear}
                  </div>
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove card?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone and you will need to add this card again to
                            use it for future purchases.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(method.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
