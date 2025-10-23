"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp } from "lucide-react"

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)

    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Don't return null - causes hydration mismatch. Instead, render but hide with opacity
  return (
    <Button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full bg-primary shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-110 ${
        isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      size="icon"
      aria-label="Back to top"
      title="Back to top"
    >
      <ChevronUp className="h-6 w-6" />
    </Button>
  )
}
