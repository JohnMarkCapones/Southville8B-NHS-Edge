"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/toaster"
import { BackToTop } from "@/components/ui/back-to-top"
import { UtilityBar } from "@/components/layout/utility-bar"
import { NotificationBanner } from "@/components/ui/notification-banner"
import { ScrollToTop } from "@/components/scroll-to-top"
// <CHANGE> Import usePathname to conditionally render components
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

// <CHANGE> Create a client component to handle conditional rendering
function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStudentPage = pathname?.startsWith("/student")

  if (isStudentPage) {
    // <CHANGE> Return only children for student pages (no old header/footer/utility bar)
    return <>{children}</>
  }

  // <CHANGE> Return full layout for non-student pages
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <ScrollToTop />
          <ConditionalLayout>{children}</ConditionalLayout>
          <Toaster />
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  )
}
