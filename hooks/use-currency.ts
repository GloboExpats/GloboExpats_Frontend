'use client'

/**
 * =============================================================================
 * useCurrency Hook - Currency Management
 * =============================================================================
 *
 * Re-export of the useCurrency hook from CurrencyProvider.
 * This maintains backward compatibility with existing imports.
 *
 * NEW IMPLEMENTATION: Now uses React Context with advanced features:
 * - Global state management
 * - Automatic currency conversion
 * - localStorage persistence
 * - Exchange rate management
 * - Cross-tab synchronization
 * - SSR-safe operations
 *
 * Usage:
 * ```tsx
 * const { selectedCurrency, formatPrice, convertPrice, setSelectedCurrency } = useCurrency()
 *
 * // Get current currency
 * console.log(selectedCurrency) // 'TZS'
 *
 * // Change currency
 * setSelectedCurrency('USD')
 *
 * // Format a price
 * const formatted = formatPrice(1000) // "TSh 1,000" or "$0.40"
 *
 * // Convert between currencies
 * const converted = convertPrice(1000, 'TZS', 'USD')
 * ```
 */

import { useCurrency as useCurrencyContext } from '@/providers/currency-provider'
import { CURRENCIES } from '@/lib/constants'

/**
 * Currency management hook
 *
 * @deprecated The old API is maintained for backward compatibility
 * @returns Currency state and actions with both old and new API
 */
export function useCurrency() {
  // Get the full context from the provider
  const context = useCurrencyContext()

  // Map old constants format to new format for backward compatibility
  const legacyCurrencies = CURRENCIES.map((c) => ({
    code: c.code,
    name: c.name,
    flag: c.flag,
  }))

  const currentLegacyCurrency =
    legacyCurrencies.find((c) => c.code === context.selectedCurrency) || legacyCurrencies[0]

  // Return both old and new API for compatibility
  return {
    // OLD API (maintained for backward compatibility)
    /** @deprecated Use selectedCurrency instead */
    currency: context.selectedCurrency,

    /** @deprecated Use setSelectedCurrency instead */
    setCurrency: context.setSelectedCurrency,

    /** @deprecated Use currencies object instead */
    currentCurrency: currentLegacyCurrency,

    /** @deprecated Use currencies object from context */
    currencies: legacyCurrencies,

    // NEW API (recommended)
    /** Currently selected currency code */
    selectedCurrency: context.selectedCurrency,

    /** Change the selected currency */
    setSelectedCurrency: context.setSelectedCurrency,

    /** Format price with currency */
    formatPrice: context.formatPrice,

    /** Convert price between currencies */
    convertPrice: context.convertPrice,

    /** Get exchange rate */
    getExchangeRate: context.getExchangeRate,

    /** Refresh exchange rates */
    refreshRates: context.refreshRates,

    /** All currencies with full details */
    currenciesMap: context.currencies,

    /** Loading state */
    isLoading: context.isLoading,

    /** Error state */
    error: context.error,

    /** Last update timestamp */
    lastUpdated: context.lastUpdated,
  }
}

// Re-export everything from the provider for direct imports
export { useCurrency as useCurrencyContext } from '@/providers/currency-provider'
export type { CurrencyContextValue } from '@/lib/currency-types'
