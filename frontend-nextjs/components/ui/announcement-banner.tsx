"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"

type AnnouncementItem = {
  icon?: ReactNode
  message: string
  action?: { label: string; href: string }
}

interface AnnouncementBannerProps {
  items?: AnnouncementItem[]
  intervalMs?: number
  className?: string
  rounded?: boolean
  fullBleed?: boolean // new: edge-to-edge background spanning the viewport
}

/**
 * AnnouncementBanner
 * - Slim blue banner cycling through messages
 * - Vertical slide animation alternating top->down, then bottom->up
 * - Yellow pill action button on the right
 * - Full-bleed variant spans edge-to-edge with subtle shadow and ring
 */
export function AnnouncementBanner({
  items,
  intervalMs = 6000,
  className,
  rounded = false,
  fullBleed = true,
}: AnnouncementBannerProps) {
  const defaultItems: AnnouncementItem[] = useMemo(
    () => [
      {
        message: "Early Application Deadline: December 15th for priority consideration",
        action: { label: "Apply Now", href: "/contact" },
      },
      {
        message: "Congratulations to our Science Olympiad team for winning the State Championship!",
        action: { label: "Read Story", href: "/news" },
      },
    ],
    [],
  )

  const data = items && items.length > 0 ? items : defaultItems

  const [index, setIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState<number | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [entered, setEntered] = useState(true)
  const [direction, setDirection] = useState<"down" | "up">("down")
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (data.length <= 1) return
    const start = () => {
      timerRef.current = window.setInterval(() => {
        setPrevIndex((curr) => (curr === null ? index : curr))
        setIndex((curr) => (curr + 1) % data.length)
        setDirection((d) => (d === "down" ? "up" : "down"))
        setTransitioning(true)
        setEntered(false)
        requestAnimationFrame(() => setEntered(true))
        window.setTimeout(() => {
          setTransitioning(false)
          setPrevIndex(null)
        }, 320)
      }, intervalMs)
    }
    start()
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length, intervalMs])

  const current = data[index]
  const prev = prevIndex !== null ? data[prevIndex] : null

  const leaveTo = direction === "down" ? "translate-y-full" : "-translate-y-full"
  const enterFrom = direction === "down" ? "-translate-y-full" : "translate-y-full"

  // Full-bleed wrapper stretches across the viewport even inside a constrained container
  // The inner bar carries the background, ring, and shadow.
  return (
    <div className={cn(fullBleed && "relative left-1/2 right-1/2 -mx-[50vw] w-screen max-w-none", className)}>
      <div
        role="region"
        aria-live="polite"
        className={cn(
          // Background + gradient + subtle border + shadow
          "text-white bg-[#2563eb] bg-gradient-to-r from-[#2563eb] to-[#1d4ed8]",
          "ring-1 ring-black/5 shadow-sm",
          // Elevation to sit above surrounding content slightly
          "z-10",
          // Spacing and optional rounding (useful when not full-bleed)
          "py-2.5 md:py-3",
          rounded && !fullBleed && "rounded-md",
        )}
      >
        {/* Keep content aligned with page via container while background is full-bleed */}
        <div className="container mx-auto px-3 sm:px-4">
          <div className="relative h-7 sm:h-8 overflow-hidden">
            {/* Previous item (leaving) */}
            {prev && (
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-between gap-3 sm:gap-4",
                  "transition-transform duration-300 ease-out",
                  transitioning ? (entered ? leaveTo : "translate-y-0") : "translate-y-0",
                  "motion-reduce:transition-none motion-reduce:transform-none",
                )}
                aria-hidden="true"
              >
                <BannerRow item={prev} />
              </div>
            )}

            {/* Current item (entering or static) */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-between gap-3 sm:gap-4",
                "transition-transform duration-300 ease-out",
                transitioning ? (entered ? "translate-y-0" : enterFrom) : "translate-y-0",
                "motion-reduce:transition-none motion-reduce:transform-none",
              )}
            >
              <BannerRow item={current} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BannerRow({ item }: { item: AnnouncementItem }) {
  return (
    <>
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {item.icon && (
          <span className="text-white/95 shrink-0" aria-hidden="true">
            {item.icon}
          </span>
        )}
        <p className="truncate text-[13px] sm:text-sm font-semibold tracking-tight">{item.message}</p>
      </div>

      {item.action?.href && item.action?.label && (
        <Link
          href={item.action.href}
          className={cn(
            "inline-flex items-center rounded-full font-semibold text-gray-900",
            "bg-amber-400 hover:bg-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
            "px-3 sm:px-4 py-1 text-xs sm:text-sm transition-colors",
          )}
        >
          {item.action.label}
        </Link>
      )}
    </>
  )
}
