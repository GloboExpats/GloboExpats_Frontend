/**
 * =============================================================================
 * LOCATION UTILITIES
 * =============================================================================
 *
 * Utilities for parsing and formatting location data with street address and postcode.
 * The backend stores location as a single string field, so we use a structured format:
 *
 * Full format: "StreetAddress | Postcode | City, Country"
 * Display format (cards): "City, Country" (extracted from full format)
 * Display format (product page): Full address with street and postcode
 */

/**
 * Structured location data with all components
 */
export interface ParsedLocation {
  streetAddress: string
  postcode: string
  city: string
  country: string
  /** Full formatted string for display */
  fullAddress: string
  /** Short format for cards (City, Country) */
  shortAddress: string
}

/**
 * Format location data into a storable string format
 * Format: "StreetAddress | Postcode | City, Country"
 */
export function formatLocationForStorage(params: {
  cityCountry: string
  streetAddress?: string
  postcode?: string
}): string {
  const { cityCountry, streetAddress, postcode } = params

  // If no street address or postcode, just return city/country
  if (!streetAddress?.trim() && !postcode?.trim()) {
    return sanitizeLocationString(cityCountry)
  }

  // Build structured format: "StreetAddress | Postcode | City, Country"
  const parts: string[] = []

  if (streetAddress?.trim()) {
    parts.push(streetAddress.trim())
  }

  if (postcode?.trim()) {
    parts.push(postcode.trim())
  }

  // Add city/country
  const sanitizedCityCountry = sanitizeLocationString(cityCountry)
  if (sanitizedCityCountry) {
    parts.push(sanitizedCityCountry)
  }

  return parts.join(' | ')
}

/**
 * Parse a stored location string back into structured components
 * Handles both legacy format (just "City, Country") and new format with street/postcode
 */
export function parseStoredLocation(locationString: string | undefined | null): ParsedLocation {
  const defaultResult: ParsedLocation = {
    streetAddress: '',
    postcode: '',
    city: '',
    country: '',
    fullAddress: '',
    shortAddress: '',
  }

  if (!locationString || typeof locationString !== 'string') {
    return defaultResult
  }

  const trimmed = locationString.trim()
  if (!trimmed) {
    return defaultResult
  }

  // Check if it's the new structured format (contains " | " separator)
  if (trimmed.includes(' | ')) {
    const parts = trimmed.split(' | ').map((p) => p.trim())

    // Format: "StreetAddress | Postcode | City, Country" or "StreetAddress | City, Country" or "Postcode | City, Country"
    if (parts.length >= 2) {
      // Last part is always City, Country
      const cityCountry = parts[parts.length - 1]
      const { city, country } = parseCityCountry(cityCountry)

      let streetAddress = ''
      let postcode = ''

      if (parts.length === 3) {
        // Full format: Street | Postcode | City, Country
        streetAddress = parts[0]
        postcode = parts[1]
      } else if (parts.length === 2) {
        // Either Street | City, Country OR Postcode | City, Country
        // Try to detect postcode (usually shorter, has numbers)
        const firstPart = parts[0]
        if (looksLikePostcode(firstPart)) {
          postcode = firstPart
        } else {
          streetAddress = firstPart
        }
      }

      return {
        streetAddress,
        postcode,
        city,
        country,
        fullAddress: buildFullAddress(streetAddress, postcode, city, country),
        shortAddress: cityCountry,
      }
    }
  }

  // Legacy format: just "City, Country"
  const { city, country } = parseCityCountry(trimmed)

  return {
    streetAddress: '',
    postcode: '',
    city,
    country,
    fullAddress: trimmed,
    shortAddress: trimmed,
  }
}

/**
 * Extract city and country from "City, Country" or "City, CC" format
 */
function parseCityCountry(cityCountryStr: string): { city: string; country: string } {
  if (!cityCountryStr) {
    return { city: '', country: '' }
  }

  // Handle "City, Country" format
  const commaIndex = cityCountryStr.lastIndexOf(',')
  if (commaIndex > 0) {
    return {
      city: cityCountryStr.substring(0, commaIndex).trim(),
      country: cityCountryStr.substring(commaIndex + 1).trim(),
    }
  }

  // No comma - treat entire string as city
  return { city: cityCountryStr.trim(), country: '' }
}

/**
 * Check if a string looks like a postcode
 * Postcodes typically have numbers and are relatively short
 */
function looksLikePostcode(str: string): boolean {
  if (!str || str.length > 15) return false

  // Contains at least one digit
  const hasDigit = /\d/.test(str)
  // Is relatively short (most postcodes are under 10 characters)
  const isShort = str.length <= 10
  // Contains typical postcode characters
  const isPostcodeFormat = /^[A-Z0-9\s-]+$/i.test(str)

  return hasDigit && isShort && isPostcodeFormat
}

/**
 * Build a full address string for display
 */
function buildFullAddress(
  streetAddress: string,
  postcode: string,
  city: string,
  country: string
): string {
  const parts: string[] = []

  if (streetAddress) parts.push(streetAddress)
  if (postcode) parts.push(postcode)

  // Add city and country
  const locationPart = [city, country].filter(Boolean).join(', ')
  if (locationPart) parts.push(locationPart)

  return parts.join(', ')
}

/**
 * Remove emojis and non-ASCII characters from location string
 * (for backend compatibility)
 */
function sanitizeLocationString(location: string): string {
  if (!location) return ''
  // Remove emojis and non-ASCII (e.g., flags), trim extra spaces
  return location.replace(/[^\x20-\x7E]/g, '').trim()
}

/**
 * Get the short display format (City, Country) from any location string
 * Used for product cards where we only show city and country
 */
export function getShortLocationDisplay(locationString: string | undefined | null): string {
  const parsed = parseStoredLocation(locationString)
  return parsed.shortAddress || 'Unknown'
}

/**
 * Get the full display format with street address and postcode
 * Used for product detail pages
 */
export function getFullLocationDisplay(locationString: string | undefined | null): string {
  const parsed = parseStoredLocation(locationString)
  return parsed.fullAddress || 'Unknown'
}
