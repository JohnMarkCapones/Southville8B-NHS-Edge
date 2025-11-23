"use client"

import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { useEffect, useState } from "react"

type BannerType = "info" | "success" | "warning" | "destructive"

interface NotificationBannerProps {
  message: string
  shortMessage?: string // Added optional short message for mobile
  type?: BannerType
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
  action?: { label: string; onClick: () => void }
  sticky?: boolean
}

export function NotificationBanner({
  message,
  shortMessage, // Added shortMessage parameter
  type = "destructive",
  dismissible = true,
  onDismiss,
  className,
  action,
  sticky = true,
}: NotificationBannerProps) {
  // Keep rendered true until the exit transition completes
  const [rendered, setRendered] = useState(true)
  // Visible controls enter/exit animation
  const [visible, setVisible] = useState(false)

  // On mount, trigger enter animation on next frame
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Get colors based on type
  const getTypeStyles = () => {
    switch (type) {
      case "info":
        return {
          bg: "bg-blue-600",
          gradient: "linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%), radial-gradient(1.5px 1.5px at 8px 8px, rgba(255,255,255,0.14) 1px, transparent 1.6px)",
        }
      case "success":
        return {
          bg: "bg-green-600",
          gradient: "linear-gradient(180deg, #16a34a 0%, #15803d 100%), radial-gradient(1.5px 1.5px at 8px 8px, rgba(255,255,255,0.14) 1px, transparent 1.6px)",
        }
      case "warning":
        return {
          bg: "bg-orange-500",
          gradient: "linear-gradient(180deg, #f97316 0%, #ea580c 100%), radial-gradient(1.5px 1.5px at 8px 8px, rgba(255,255,255,0.14) 1px, transparent 1.6px)",
        }
      case "destructive":
      default:
        return {
          bg: "bg-red-600",
          gradient: "linear-gradient(180deg, #dc2626 0%, #b91c1c 100%), radial-gradient(1.5px 1.5px at 8px 8px, rgba(255,255,255,0.14) 1px, transparent 1.6px)",
        }
    }
  }

  const typeStyles = getTypeStyles()

  if (!rendered) return null

  return (
    <div
      role="status"
      aria-live="polite"
      data-state={visible ? "open" : "closed"}
      className={cn(
        "w-full text-white",
        sticky && "sticky top-0 z-50", // Sticky positioning is now controlled by the sticky prop
        // Height
        "px-3 sm:px-4 py-3 md:py-4",
        // Background
        typeStyles.bg,
        // Slide + fade transitions
        "transition-all duration-300",
        visible ? "ease-out opacity-100 translate-y-0" : "ease-in opacity-0 -translate-y-full",
        // Improve perf and accessibility
        "will-change-transform",
        // Respect reduced motion
        "motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100",
        className,
      )}
      style={{
        backgroundImage: typeStyles.gradient,
        backgroundSize: "auto, 24px 24px",
        backgroundRepeat: "no-repeat, repeat",
      }}
      onTransitionEnd={(e) => {
        // Only handle transition end for the wrapper element
        if (e.target !== e.currentTarget) return
        // When closing finishes, unmount and call onDismiss
        if (!visible) {
          setRendered(false)
          onDismiss?.()
        }
      }}
    >
      <div className="container mx-auto flex items-center justify-center gap-3">
        <p className="flex-1 text-sm sm:text-base font-medium text-center">
          <span className="sm:hidden">{shortMessage || message}</span>
          <span className="hidden sm:inline">{message}</span>
        </p>

        {/* Optional action button */}
        {action && (
          <button
            onClick={action.onClick}
            className={cn(
              "text-xs sm:text-sm font-semibold rounded-md px-2 sm:px-3 py-1",
              "bg-white/10 border border-white/20 hover:bg-white/15 transition-colors",
            )}
          >
            {action.label}
          </button>
        )}

        {/* Dismiss button */}
        {dismissible && (
          <button
            type="button"
            aria-label="Dismiss notification"
            className="ml-1 p-1 rounded-md hover:bg-white/10 transition-colors"
            onClick={() => setVisible(false)}
          >
            <X className="h-4 w-4 text-white" />
          </button>
        )}
      </div>
    </div>
  )
}
