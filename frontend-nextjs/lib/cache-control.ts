/**
 * Cache Control Headers for different content types
 * Optimized for Vercel CDN caching to minimize function executions
 */

export const CACHE_HEADERS = {
  /**
   * IMMUTABLE: Never changes (static assets, legal pages)
   * - Cached forever on CDN and browser
   * - Perfect for: Terms, Privacy, static images
   */
  IMMUTABLE: 'public, max-age=31536000, immutable',

  /**
   * LONG: Rarely changes (academic curriculum, staff directory)
   * - CDN: 24 hours fresh, 7 days stale-while-revalidate
   * - Perfect for: About, Academics, Athletics pages
   */
  LONG: 'public, s-maxage=86400, stale-while-revalidate=604800',

  /**
   * MEDIUM: Changes daily (news, events, announcements)
   * - CDN: 1 hour fresh, 24 hours stale-while-revalidate
   * - Perfect for: News, Events, Announcements
   */
  MEDIUM: 'public, s-maxage=3600, stale-while-revalidate=86400',

  /**
   * SHORT: Changes frequently (dashboards, recent activities)
   * - CDN: 5 minutes fresh, 1 hour stale-while-revalidate
   * - Perfect for: Student dashboards, teacher views
   */
  SHORT: 'public, s-maxage=300, stale-while-revalidate=3600',

  /**
   * PRIVATE: User-specific data (private dashboards, grades)
   * - Browser only: 1 minute fresh, 5 minutes stale-while-revalidate
   * - Perfect for: Personalized content, user profiles
   */
  PRIVATE: 'private, max-age=60, stale-while-revalidate=300',

  /**
   * NONE: Real-time data (no cache)
   * - No caching at all
   * - Perfect for: Live quizzes, real-time chat, WebSocket data
   */
  NONE: 'no-store, must-revalidate',
} as const

/**
 * Revalidation intervals (in seconds) for ISR
 * Use these with `export const revalidate = REVALIDATE_TIMES.XXX`
 */
export const REVALIDATE_TIMES = {
  /** Never revalidate (static forever) */
  NEVER: false,

  /** 1 minute - for frequently changing content */
  MINUTE: 60,

  /** 5 minutes - for semi-dynamic content */
  FIVE_MINUTES: 300,

  /** 10 minutes - for assignments, tasks */
  TEN_MINUTES: 600,

  /** 30 minutes - for grades, schedules */
  THIRTY_MINUTES: 1800,

  /** 1 hour - for news, events */
  HOUR: 3600,

  /** 6 hours - for clubs, activities */
  SIX_HOURS: 21600,

  /** 24 hours - for academic content */
  DAY: 86400,

  /** 7 days - for rarely changing content */
  WEEK: 604800,
} as const

/**
 * Helper function to create cache control headers
 * @param type - Type of caching strategy
 * @returns Headers object with Cache-Control
 */
export function getCacheHeaders(type: keyof typeof CACHE_HEADERS): Record<string, string> {
  return {
    'Cache-Control': CACHE_HEADERS[type],
  }
}

/**
 * Helper function for Vercel-specific CDN cache control
 * Adds both standard and Vercel-specific cache headers
 */
export function getVercelCacheHeaders(
  maxAge: number,
  swr?: number
): Record<string, string> {
  const swrPart = swr ? `, stale-while-revalidate=${swr}` : ''

  return {
    'Cache-Control': `public, s-maxage=${maxAge}${swrPart}`,
    'CDN-Cache-Control': `public, max-age=${maxAge}`,
    'Vercel-CDN-Cache-Control': `public, max-age=${maxAge}`,
  }
}

/**
 * Fetch options for different cache strategies
 * Use with fetch() in Server Components
 */
export function getCacheFetchOptions(revalidate: number | false, tags?: string[]) {
  return {
    next: {
      revalidate,
      ...(tags && { tags }),
    },
  }
}

/**
 * Example usage in Server Component:
 *
 * ```typescript
 * import { REVALIDATE_TIMES, getCacheFetchOptions } from '@/lib/cache-control'
 *
 * export const revalidate = REVALIDATE_TIMES.HOUR
 *
 * async function getData() {
 *   const res = await fetch(
 *     'https://api.example.com/data',
 *     getCacheFetchOptions(REVALIDATE_TIMES.HOUR, ['news'])
 *   )
 *   return res.json()
 * }
 * ```
 *
 * Example usage in API Route:
 *
 * ```typescript
 * import { getCacheHeaders } from '@/lib/cache-control'
 *
 * export async function GET() {
 *   const data = await fetchNews()
 *   return Response.json(data, {
 *     headers: getCacheHeaders('MEDIUM')
 *   })
 * }
 * ```
 */
