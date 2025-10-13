"use client"

import React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { BackToTop } from "@/components/ui/back-to-top"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ConditionalLayout } from "@/components/conditional-layout"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { SWRConfig } from "swr"

type ProvidersProps = {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SWRConfig
      value={{
        // Revalidate on focus (when user returns to tab)
        revalidateOnFocus: false,
        // Revalidate when user reconnects to network
        revalidateOnReconnect: true,
        // Dedupe requests within 1 minute
        dedupingInterval: 60000,
        // Auto refresh every 5 minutes (300000ms)
        refreshInterval: 300000,
        // Disable retries on error (save server costs)
        shouldRetryOnError: false,
        // Fetch function that handles errors gracefully
        fetcher: async (url: string) => {
          const res = await fetch(url)
          if (!res.ok) {
            const error = new Error('An error occurred while fetching the data.')
            throw error
          }
          return res.json()
        },
        // Keep data in cache for 5 minutes after component unmount
        keepPreviousData: true,
      }}
    >
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <ScrollToTop />
        <main id="main-content">
          <ConditionalLayout>{children}</ConditionalLayout>
        </main>
        <Toaster />
        <BackToTop />
        <Analytics />
        <SpeedInsights />
      </ThemeProvider>
    </SWRConfig>
  )
}
