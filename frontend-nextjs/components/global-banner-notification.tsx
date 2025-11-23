"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { X, AlertCircle, CheckCircle, AlertTriangle, Info, ExternalLink } from "lucide-react"
import { getActiveBanners } from "@/lib/api/endpoints/banners"
import type { BannerNotification } from "@/lib/api/types/banners"

export function GlobalBannerNotification() {
  const [banners, setBanners] = useState<BannerNotification[]>([])
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  // Only show on guest pages (routes starting with /guess or root /)
  const isGuestPage = pathname === "/" || pathname.startsWith("/guess")

  useEffect(() => {
    async function fetchBanners() {
      try {
        const activeBanners = await getActiveBanners()
        setBanners(activeBanners)
      } catch (error) {
        console.error("Failed to fetch active banners:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isGuestPage) {
      fetchBanners()
    } else {
      setLoading(false)
    }
  }, [isGuestPage])

  // Load dismissed banners from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("dismissedBanners")
      if (dismissed) {
        setDismissedBanners(new Set(JSON.parse(dismissed)))
      }
    }
  }, [])

  const handleDismiss = (bannerId: string) => {
    const newDismissed = new Set(dismissedBanners)
    newDismissed.add(bannerId)
    setDismissedBanners(newDismissed)

    // Persist to sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("dismissedBanners", JSON.stringify([...newDismissed]))
    }
  }

  // Don't render if not on guest pages or still loading
  if (!isGuestPage || loading) {
    return null
  }

  // Filter out dismissed banners
  const visibleBanners = banners.filter(banner => !dismissedBanners.has(banner.id))

  if (visibleBanners.length === 0) {
    return null
  }

  // Get banner styles based on type
  const getBannerStyles = (type: string) => {
    switch (type) {
      case "destructive":
        return {
          bg: "bg-red-600",
          hoverBg: "hover:bg-red-700",
          icon: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
        }
      case "warning":
        return {
          bg: "bg-orange-500",
          hoverBg: "hover:bg-orange-600",
          icon: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
        }
      case "success":
        return {
          bg: "bg-green-600",
          hoverBg: "hover:bg-green-700",
          icon: <CheckCircle className="w-5 h-5 flex-shrink-0" />,
        }
      case "info":
      default:
        return {
          bg: "bg-blue-600",
          hoverBg: "hover:bg-blue-700",
          icon: <Info className="w-5 h-5 flex-shrink-0" />,
        }
    }
  }

  return (
    <div className="w-full">
      {visibleBanners.map((banner) => {
        const styles = getBannerStyles(banner.type)

        return (
          <div
            key={banner.id}
            className={`${styles.bg} text-white px-4 py-3 relative`}
            role="alert"
            aria-live="polite"
          >
            <div className="container mx-auto flex items-center justify-center gap-3">
              {styles.icon}

              <p className="flex-1 text-sm md:text-base font-medium text-center">
                {banner.message}
              </p>

              {/* Action Button */}
              {banner.hasAction && banner.actionUrl && (
                <a
                  href={banner.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold rounded-md px-3 py-1.5 bg-white/10 border border-white/20 ${styles.hoverBg} hover:bg-white/20 transition-colors flex-shrink-0`}
                >
                  {banner.actionLabel || "Learn More"}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {/* Dismiss Button */}
              {banner.isDismissible && (
                <button
                  onClick={() => handleDismiss(banner.id)}
                  className="p-1 rounded-md hover:bg-white/10 transition-colors flex-shrink-0"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
