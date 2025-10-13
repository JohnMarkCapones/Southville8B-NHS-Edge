"use client"

import React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { BackToTop } from "@/components/ui/back-to-top"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ConditionalLayout } from "@/components/conditional-layout"
import { Analytics } from "@vercel/analytics/react"

type ProvidersProps = {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ScrollToTop />
      <main id="main-content">
        <ConditionalLayout>{children}</ConditionalLayout>
      </main>
      <Toaster />
      <BackToTop />
      <Analytics />
    </ThemeProvider>
  )
}
