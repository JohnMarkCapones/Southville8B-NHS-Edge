"use client"
// Placeholder for Intersection Observer hook
import type React from "react"

// This hook would allow triggering animations when elements enter the viewport.
// Example usage:
// const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });
// if (isIntersecting) { /* trigger animation */ }

import { useEffect, useRef, useState } from "react"

interface IntersectionObserverOptions extends IntersectionObserverInit {}

export function useIntersectionObserver(options?: IntersectionObserverOptions): [React.RefObject<any>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<any>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [ref, options])

  return [ref, isIntersecting]
}
