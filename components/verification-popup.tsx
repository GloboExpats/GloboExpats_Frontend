'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface VerificationPopupProps {
  isOpen: boolean
  onClose: () => void
  action: 'buy' | 'sell' | 'contact'
}

export function VerificationPopup({ isOpen, onClose, action }: VerificationPopupProps) {
  const router = useRouter()

  const actionMessages = {
    buy: 'make purchases',
    sell: 'list items for sale',
    contact: 'contact sellers',
  }

  const handleVerification = () => {
    router.push('/account/verification')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Verification Required</DialogTitle>
          <DialogDescription className="text-base">
            Please verify your account to {actionMessages[action]}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 text-sm">
              Account verification is required to access this feature.
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
            <Button className="bg-brand-primary hover:bg-blue-700" onClick={handleVerification}>
              Start Verification
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
