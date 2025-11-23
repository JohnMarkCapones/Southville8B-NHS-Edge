"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { UtilityBar } from "@/components/layout/utility-bar"
import { NotificationBanner } from "@/components/ui/notification-banner"
import { getActiveBanners } from "@/lib/api/endpoints/banners"
import type { BannerNotification } from "@/lib/api/types/banners"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStudentPage = pathname?.startsWith("/student")
  const isTeacherPage = pathname?.startsWith("/teacher")
  const isAdminPage = pathname?.startsWith("/admin")
  const isSuperAdminPage = pathname?.startsWith("/superadmin")
  const isMaintenancePage = pathname?.startsWith("/maintenance")

  const [activeBanner, setActiveBanner] = useState<BannerNotification | null>(null)
  const [dismissed, setDismissed] = useState(false)

  // Fetch active banner from API
  useEffect(() => {
    async function fetchBanner() {
      try {
        const banners = await getActiveBanners()
        if (banners && banners.length > 0) {
          setActiveBanner(banners[0]) // Show first active banner
        }
      } catch (error) {
        console.error("Failed to fetch active banners:", error)
      }
    }
    fetchBanner()
  }, [])

  if (isStudentPage || isTeacherPage || isAdminPage || isSuperAdminPage || isMaintenancePage) {
    return <>{children}</>
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {activeBanner && !dismissed && (
        <NotificationBanner
          message={activeBanner.message}
          shortMessage={activeBanner.shortMessage}
          type={activeBanner.type}
          dismissible={activeBanner.isDismissible}
          onDismiss={() => setDismissed(true)}
          action={activeBanner.hasAction && activeBanner.actionUrl ? {
            label: activeBanner.actionLabel || "Learn More",
            onClick: () => window.open(activeBanner.actionUrl, "_blank")
          } : undefined}
        />
      )}
      <UtilityBar />
      <Header />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
