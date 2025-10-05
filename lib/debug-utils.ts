/**
 * Debug utilities for catching problematic object rendering
 */

// Helper to safely render any value in JSX
export function safeRender(value: any, fallback: string = '[Object]'): string {
  if (value === null || value === undefined) {
    return String(value)
  }

  if (typeof value === 'object') {
    console.warn('🚨 [SAFE-RENDER] Attempting to render object directly:', value)

    // Check if it's a review object
    if (value.reviewId || value.reviewerName || value.reviewText || value.formattedCreatedAt) {
      console.error(
        '🚨 [SAFE-RENDER] REVIEW OBJECT DETECTED! Use specific properties instead of whole object:',
        value
      )
    }

    return fallback
  }

  return String(value)
}

// Helper to check if a value is safe to render in React
export function isSafeToRender(value: any): boolean {
  return typeof value !== 'object' || value === null || Array.isArray(value)
}

// Helper to extract safe string from review object
export function extractReviewText(review: any): string {
  if (typeof review === 'object' && review !== null) {
    return review.reviewText || review.text || review.content || '[Review text not available]'
  }
  return String(review)
}

// Helper to extract safe string from any object
export function extractDisplayText(obj: any, preferredKey?: string): string {
  if (typeof obj !== 'object' || obj === null) {
    return String(obj)
  }

  if (preferredKey && obj[preferredKey]) {
    return String(obj[preferredKey])
  }

  // Common display keys to try
  const displayKeys = ['text', 'title', 'name', 'description', 'content', 'value']

  for (const key of displayKeys) {
    if (obj[key] && typeof obj[key] === 'string') {
      return obj[key]
    }
  }

  // If all else fails, show object keys
  return `[Object with keys: ${Object.keys(obj).join(', ')}]`
}
