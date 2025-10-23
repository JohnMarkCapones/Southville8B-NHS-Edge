"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

/**
 * Route prefetching configurations by user type
 */
const PREFETCH_ROUTES = {
  guest: [
    '/guess/news',
    '/guess/event',
    '/guess/about',
    '/guess/academics',
    '/guess/login',
  ],
  student: [
    '/student/assignments',
    '/student/grades',
    '/student/courses',
    '/student/calendar',
    '/student/events',
  ],
  teacher: [
    '/teacher/students',
    '/teacher/classes',
    '/teacher/quiz',
    '/teacher/schedule',
  ],
} as const

interface PrefetchRoutesProps {
  userType?: 'guest' | 'student' | 'teacher' | 'admin'
  customRoutes?: string[]
  delay?: number
}

/**
 * Component that prefetches common routes on idle
 * Place this in your layout to automatically prefetch routes
 *
 * @example
 * ```tsx
 * // In student layout
 * <PrefetchRoutes userType="student" />
 *
 * // With custom routes
 * <PrefetchRoutes
 *   userType="student"
 *   customRoutes={['/student/clubs', '/student/notes']}
 * />
 * ```
 */
export function PrefetchRoutes({
  userType = 'guest',
  customRoutes = [],
  delay = 1000
}: PrefetchRoutesProps) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only prefetch if browser supports requestIdleCallback
    if (!('requestIdleCallback' in window)) {
      return
    }

    const routes = [...(PREFETCH_ROUTES[userType] || []), ...customRoutes]
      // Don't prefetch current route
      .filter(route => route !== pathname)

    // Prefetch routes during browser idle time
    const timeouts: number[] = []

    routes.forEach((route, index) => {
      const timeout = window.setTimeout(() => {
        window.requestIdleCallback(() => {
          router.prefetch(route)
        })
      }, delay + (index * 500)) // Stagger prefetches by 500ms

      timeouts.push(timeout)
    })

    // Cleanup
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [router, pathname, userType, customRoutes, delay])

  return null
}

/**
 * Hook for manual route prefetching
 *
 * @example
 * ```tsx
 * const prefetch = usePrefetch()
 *
 * <button
 *   onMouseEnter={() => prefetch('/student/grades')}
 *   onClick={() => router.push('/student/grades')}
 * >
 *   View Grades
 * </button>
 * ```
 */
export function usePrefetch() {
  const router = useRouter()

  return (route: string) => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        router.prefetch(route)
      })
    } else {
      router.prefetch(route)
    }
  }
}
