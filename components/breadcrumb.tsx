'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

export default function Breadcrumb() {
  const pathname = usePathname()
  const pathSegments = pathname.split('/').filter((segment) => segment)

  // Don't show breadcrumb on auth pages and product pages
  const hiddenPages = ['/login', '/register', '/reset-password']
  const isProductPage = pathSegments[0] === 'product'

  if (pathSegments.length === 0 || hiddenPages.includes(pathname) || isProductPage) {
    return null
  }

  // Remove 'seller' and 'expat' from breadcrumb navigation since these are just URL namespaces
  // This changes "Home > Seller > Dashboard" or "Home > Expat > Dashboard" to "Home > Dashboard"
  const filteredSegments = pathSegments.filter(
    (segment) => segment !== 'seller' && segment !== 'expat'
  )

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        <li>
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
        </li>
        {filteredSegments.map((segment, index) => {
          // Build href using original path segments up to current filtered index
          const originalIndex = pathSegments.findIndex(
            (seg, i) =>
              pathSegments
                .slice(0, i + 1)
                .filter((s) => s !== 'seller' && s !== 'expat')
                .join('/') === filteredSegments.slice(0, index + 1).join('/')
          )
          const href = `/${pathSegments.slice(0, originalIndex + 1).join('/')}`
          const isLast = index === filteredSegments.length - 1
          const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

          return (
            <li key={href} className="flex items-center space-x-2">
              <ChevronRight className="h-4 w-4 text-gray-400" />
              {isLast ? (
                <span className="font-medium text-gray-900">{name}</span>
              ) : (
                <Link href={href} className="hover:text-blue-600 transition-colors">
                  {name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
