"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { UtilityBar } from "@/components/layout/utility-bar"
import { NotificationBanner } from "@/components/ui/notification-banner"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStudentPage = pathname?.startsWith("/student")
  const isTeacherPage = pathname?.startsWith("/teacher")
  const isAdminPage = pathname?.startsWith("/admin")
  const isSuperAdminPage = pathname?.startsWith("/superadmin")
  const isMaintenancePage = pathname?.startsWith("/maintenance")

  if (isStudentPage || isTeacherPage || isAdminPage || isSuperAdminPage || isMaintenancePage) {
    return <>{children}</>
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <NotificationBanner
        message="⚠️ Weather Alert: Early dismissal at 2:00 PM due to heavy rain. Stay safe and dry!"
        shortMessage="Weather Alert: No class due to bad weather"
        type="destructive"
        dismissible={true}
      />
      <UtilityBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
