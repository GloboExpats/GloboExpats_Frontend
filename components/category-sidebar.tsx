'use client'

import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function CategorySidebar() {
  const { isLoggedIn } = useAuth()

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen sticky top-16 lg:block overflow-hidden">
      <div className="h-screen">
        {/* Fixed Selling CTA Section */}
        <div className="p-4 border-b border-slate-100">
          <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-blue-200 shadow-sm">
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Start Selling</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Turn your items into cash with verified expat buyers
                  </p>
                </div>
                {isLoggedIn ? (
                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Link href="/sell">
                      <Plus className="w-4 h-4 mr-1" />
                      List Item
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Link href="/register">Join & Sell</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Section with Custom Scroll */}
        <div className="p-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Categories</h2>
          <div className="overflow-y-auto max-h-[calc(100vh-25rem)] pr-2">
            <div className="space-y-2">
              {CATEGORIES.map((category) => {
                const IconComponent = category.icon
                return (
                  <Link
                    key={category.id}
                    href={`/browse?category=${category.slug}`}
                    className="block"
                  >
                    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-slate-50 border-slate-100">
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-slate-900 group-hover:text-blue-900 transition-colors">
                              {category.name}
                            </h3>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
