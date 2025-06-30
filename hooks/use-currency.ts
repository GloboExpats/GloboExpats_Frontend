'use client'

/**
 * =============================================================================
 * useCurrency Hook - Currency Management
 * =============================================================================
 *
 * Manages currency selection and formatting for the marketplace.
 * Provides access to all supported currencies and current selection.
 *
 * Features:
 * - Current currency state management
 * - Currency switching functionality
 * - Access to all supported currencies
 * - Fallback to default currency
 *
 * Usage:
 * ```tsx
 * const { currency, setCurrency, currentCurrency, currencies } = useCurrency()
 *
 * // Get current currency
 * console.log(currentCurrency.code) // 'TZS'
 *
 * // Change currency
 * setCurrency('USD')
 * ```
 */

import { useState } from 'react'
import { CURRENCIES } from '@/lib/constants'

/**
 * Currency management hook
 *
 * @returns Currency state and actions
 */
export function useCurrency() {
  // Default to TZS (Tanzanian Shilling) as primary market currency
  const [currency, setCurrency] = useState('TZS')

  // Get current currency object with fallback to first available currency
  const currentCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0]

  return {
    /** Current currency code (e.g., 'TZS', 'USD') */
    currency,

    /** Function to change the current currency */
    setCurrency,

    /** Current currency object with full details (name, symbol, etc.) */
    currentCurrency,

    /** Array of all supported currencies */
    currencies: CURRENCIES,
  }
}
