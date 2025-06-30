/**
 * =============================================================================
 * NOTIFICATION BADGE COMPONENT
 * =============================================================================
 *
 * A reusable notification badge component used in the header to display
 * real-time counts for various user actions like cart items, notifications,
 * and messages. This component provides a consistent UI pattern for all
 * notification types while maintaining accessibility and responsive design.
 *
 * Key Features:
 * - Real-time count display with badge overlay
 * - Responsive visibility (can be hidden on mobile)
 * - Accessibility support with ARIA labels
 * - Consistent styling across all notification types
 * - Optimized performance with React.memo
 * - Support for high counts (99+ display)
 *
 * Connected Components:
 * - components/header.tsx - Uses for cart, notifications, messages
 * - hooks/use-notifications.ts - Provides real-time count data
 * - hooks/use-cart.ts - Provides cart item count
 * - providers/auth-provider.tsx - User authentication context
 *
 * Backend Integration:
 * - Counts are fetched via notification hooks
 * - Real-time updates through WebSocket connections
 * - Badge updates automatically when counts change
 *
 * Usage Examples:
 * ```tsx
 * // Shopping cart badge
 * <NotificationBadge
 *   href="/cart"
 *   icon={ShoppingCart}
 *   count={cartItemCount}
 *   ariaLabel="View shopping cart"
 * />
 *
 * // Notification badge
 * <NotificationBadge
 *   href="/notifications"
 *   icon={Bell}
 *   count={unreadNotifications}
 *   ariaLabel="View notifications"
 * />
 * ```
 */

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LucideIcon } from 'lucide-react'

/**
 * =============================================================================
 * TYPE DEFINITIONS
 * =============================================================================
 */

interface NotificationBadgeProps {
  /** URL to navigate to when badge is clicked */
  href: string

  /** Lucide icon component to display */
  icon: LucideIcon

  /** Number to display in the badge (0 hides badge) */
  count: number

  /** Accessibility label for screen readers */
  ariaLabel?: string

  /** Additional CSS classes for responsive behavior */
  className?: string

  /** Test identifier for automated testing */
  testId?: string
}

/**
 * =============================================================================
 * NOTIFICATION BADGE COMPONENT
 * =============================================================================
 *
 * Displays an icon with an optional count badge overlay. The badge appears
 * only when count > 0 and shows "99+" for counts over 99. Uses consistent
 * styling and hover effects that match the header design.
 *
 * Accessibility Features:
 * - Proper ARIA labels for screen readers
 * - Keyboard navigation support via Link component
 * - High contrast badge colors for visibility
 * - Semantic HTML structure
 *
 * Performance Features:
 * - Memoized to prevent unnecessary re-renders
 * - Optimized conditional rendering for badge
 * - Efficient count display logic
 *
 * @param props - Component properties
 * @returns Notification badge component
 */
export const NotificationBadge = React.memo<NotificationBadgeProps>(
  ({ href, icon: Icon, count, ariaLabel, className = 'hidden md:block', testId }) => {
    /**
     * Format count for display
     * Shows actual count up to 99, then "99+" for higher values
     */
    const displayCount = count > 99 ? '99+' : count.toString()

    /**
     * Generate comprehensive ARIA label
     * Includes count information for better accessibility
     */
    const accessibilityLabel = ariaLabel
      ? count > 0
        ? `${ariaLabel} (${count} ${count === 1 ? 'item' : 'items'})`
        : ariaLabel
      : undefined

    return (
      <Link href={href} className={className}>
        <Button
          variant="ghost"
          size="icon"
          className="text-neutral-200 hover:bg-white/10 hover:text-white relative rounded-full transition-colors duration-200"
          aria-label={accessibilityLabel}
          data-testid={testId}
        >
          {/* Main icon display */}
          <Icon className="h-5 w-5" aria-hidden="true" />

          {/* Count badge overlay - only shown when count > 0 */}
          {count > 0 && (
            <Badge
              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white text-xs px-1 min-w-[16px] h-4 flex items-center justify-center rounded-full border-2 border-brand-primary"
              aria-label={`${count} unread`}
            >
              {displayCount}
            </Badge>
          )}
        </Button>
      </Link>
    )
  }
)

// Set display name for debugging and React DevTools
NotificationBadge.displayName = 'NotificationBadge'
