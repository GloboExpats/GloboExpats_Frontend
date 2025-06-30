'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, LifeBuoy, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useVerification } from '@/hooks/use-verification'
import { VerificationPopup } from '@/components/verification-popup'

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isVerifiedBuyer, isLoading } = useAuth()
  const { checkVerification, isVerificationPopupOpen, currentAction, closeVerificationPopup } =
    useVerification()

  // Trigger popup on mount when not verified
  useEffect(() => {
    if (!isLoading && !isVerifiedBuyer) {
      checkVerification('sell')
    }
  }, [isLoading, isVerifiedBuyer, checkVerification])

  if (!isVerifiedBuyer) {
    return (
      <VerificationPopup
        isOpen={isVerificationPopupOpen}
        onClose={closeVerificationPopup}
        action="sell"
      />
    )
  }

  const navItems = [
    { href: '/seller/dashboard', label: 'Dashboard', icon: Home },
    { href: '/sell', label: 'List Item', icon: Plus },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 p-4">
          <h2 className="text-lg font-bold text-neutral-800">Seller Hub</h2>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 bg-white border-r border-neutral-200 shadow-sm">
          <div className="flex flex-col h-full p-6">
            {/* Logo/Brand Area */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-neutral-800">Seller Hub</h2>
              <p className="text-sm text-neutral-600">Manage your marketplace</p>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  <Button
                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-base h-12 px-4 font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Help Section */}
            <div className="mt-auto">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 text-blue-900">Need Help?</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Our support team is here to assist you with selling.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <LifeBuoy className="mr-2 h-4 w-4" /> Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 md:pt-8 pt-20">{children}</main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 p-2">
          <div className="flex justify-around">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href}>
                <Button
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  size="sm"
                  className="flex-col h-14 w-16 p-1"
                >
                  <item.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
