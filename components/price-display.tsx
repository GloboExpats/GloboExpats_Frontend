/**
 * =============================================================================
 * PRICE DISPLAY COMPONENT
 * =============================================================================
 *
 * Reusable component for displaying prices with automatic currency conversion.
 * Handles SSR safely and provides tooltips showing original base currency.
 *
 * Features:
 * - Automatic conversion based on selected currency
 * - SSR-safe (prevents hydration mismatches)
 * - Tooltip showing original amount in base currency
 * - Multiple display sizes and styles
 * - Loading state support
 * - Compact notation for large numbers
 *
 * Usage:
 * ```tsx
 * <PriceDisplay price={2500} />
 * <PriceDisplay price={2500} size="lg" showOriginal />
 * <PriceDisplay price={2500} compact className="text-brand-primary" />
 * ```
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useCurrency } from '@/providers/currency-provider'
import { CURRENCY_CONFIG } from '@/lib/currency-types'
import type { CurrencyCode } from '@/lib/currency-types'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * PriceDisplay Component Props
 */
export interface PriceDisplayProps {
  /** Price amount from database (stored in TZS) */
  price: number

  /** Original currency if not from database */
  originalCurrency?: CurrencyCode

  /** Display size */
  size?: 'sm' | 'md' | 'lg' | 'xl'

  /** Show original base currency in tooltip */
  showOriginal?: boolean

  /** Use compact notation for large numbers */
  compact?: boolean

  /** Show currency code alongside symbol */
  showCode?: boolean

  /** Custom CSS classes */
  className?: string

  /** Show loading skeleton */
  loading?: boolean

  /** Prefix text before price */
  prefix?: string

  /** Suffix text after price */
  suffix?: string

  /** Font weight */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'

  /** Color variant */
  variant?: 'default' | 'muted' | 'primary' | 'secondary' | 'success' | 'danger'
}

/**
 * Size to font size mapping
 */
const SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl',
} as const

/**
 * Weight to Tailwind class mapping
 */
const WEIGHT_CLASSES = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const

/**
 * Variant to color class mapping
 */
const VARIANT_CLASSES = {
  default: 'text-slate-900 dark:text-slate-100',
  muted: 'text-slate-600 dark:text-slate-400',
  primary: 'text-brand-primary dark:text-brand-primary',
  secondary: 'text-brand-secondary dark:text-brand-secondary',
  success: 'text-green-600 dark:text-green-400',
  danger: 'text-red-600 dark:text-red-400',
} as const

/**
 * PriceDisplay Component
 *
 * Displays prices with automatic currency conversion and formatting.
 * SSR-safe with proper hydration handling.
 */
export function PriceDisplay({
  price,
  originalCurrency = CURRENCY_CONFIG.BASE_CURRENCY,
  size = 'md',
  showOriginal = false,
  compact = false,
  showCode = false,
  className = '',
  loading = false,
  prefix,
  suffix,
  weight = 'semibold',
  variant = 'default',
}: PriceDisplayProps) {
  const { formatPrice, selectedCurrency, currencies } = useCurrency()
  const [isMounted, setIsMounted] = useState(false)

  // Handle mounting for SSR safety
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Show loading skeleton
  if (loading) {
    return <Skeleton className={`h-6 w-20 inline-block ${SIZE_CLASSES[size]}`} />
  }

  // Show placeholder during SSR to prevent hydration mismatch
  if (!isMounted) {
    return (
      <span
        className={`
          ${SIZE_CLASSES[size]}
          ${WEIGHT_CLASSES[weight]}
          ${VARIANT_CLASSES[variant]}
          ${className}
        `}
        suppressHydrationWarning
      >
        {prefix && <span className="mr-1">{prefix}</span>}
        <span className="opacity-0">Loading...</span>
        {suffix && <span className="ml-1">{suffix}</span>}
      </span>
    )
  }

  // Format the price in selected currency
  const formattedPrice = formatPrice(price, {
    compact,
    showCode,
    currency: selectedCurrency,
  })

  // Format original price for tooltip (always in base currency)
  const originalFormatted =
    originalCurrency === CURRENCY_CONFIG.BASE_CURRENCY
      ? formatPrice(price, {
          currency: CURRENCY_CONFIG.BASE_CURRENCY,
          compact: false,
          showCode: true,
        })
      : null

  // Check if conversion is happening
  const isConverted = selectedCurrency !== originalCurrency

  const priceContent = (
    <span
      className={`
        inline-flex items-center
        ${SIZE_CLASSES[size]}
        ${WEIGHT_CLASSES[weight]}
        ${VARIANT_CLASSES[variant]}
        ${isConverted ? 'cursor-help' : ''}
        ${className}
      `}
    >
      {prefix && <span className="mr-1 font-normal opacity-80">{prefix}</span>}
      <span className="tabular-nums">{formattedPrice}</span>
      {suffix && <span className="ml-1 font-normal opacity-80">{suffix}</span>}
    </span>
  )

  // Wrap in tooltip if showing original and converted
  if (showOriginal && isConverted && originalFormatted) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>{priceContent}</TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <div className="flex flex-col gap-1">
              <div className="font-medium">Original Price:</div>
              <div className="text-slate-600 dark:text-slate-300">{originalFormatted}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Rate: 1 {originalCurrency} = {currencies[selectedCurrency].exchangeRate.toFixed(4)}{' '}
                {selectedCurrency}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return priceContent
}

/**
 * Compact helper component for displaying prices in compact form
 */
export function PriceDisplayCompact(props: Omit<PriceDisplayProps, 'compact'>) {
  return <PriceDisplay {...props} compact />
}

/**
 * Large helper component for displaying prominent prices
 */
export function PriceDisplayLarge(props: Omit<PriceDisplayProps, 'size' | 'weight'>) {
  return <PriceDisplay {...props} size="xl" weight="bold" />
}

/**
 * Muted helper component for displaying secondary prices
 */
export function PriceDisplayMuted(props: Omit<PriceDisplayProps, 'variant'>) {
  return <PriceDisplay {...props} variant="muted" />
}

/**
 * Price range component for displaying min-max prices
 */
export interface PriceRangeProps extends Omit<PriceDisplayProps, 'price'> {
  minPrice: number
  maxPrice: number
  separator?: string
}

export function PriceRange({
  minPrice,
  maxPrice,
  separator = ' - ',
  ...priceProps
}: PriceRangeProps) {
  return (
    <span className="inline-flex items-center gap-1">
      <PriceDisplay price={minPrice} {...priceProps} />
      <span className="text-slate-400">{separator}</span>
      <PriceDisplay price={maxPrice} {...priceProps} />
    </span>
  )
}

/**
 * Export all components
 */
export default PriceDisplay
