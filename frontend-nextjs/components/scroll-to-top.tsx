"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant", // Use instant for immediate scroll on page change
      })
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(scrollToTop, 10)

    return () => clearTimeout(timeoutId)
  }, [pathname])

  return null
}
