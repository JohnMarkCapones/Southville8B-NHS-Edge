"use client"

import React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { BackToTop } from "@/components/ui/back-to-top"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ConditionalLayout } from "@/components/conditional-layout"
import { Analytics } from "@vercel/analytics/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { LanguageProvider } from "@/lib/i18n"

import { SpeedInsights } from "@vercel/speed-insights/next"
import { SWRConfig } from "swr"

type ProvidersProps = {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Create React Query client (one per app instance)
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            refetchOnWindowFocus: true,
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
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
        <LanguageProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <ScrollToTop />
            <ConditionalLayout>{children}</ConditionalLayout>
            <Toaster />
            <BackToTop />
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </LanguageProvider>
      </SWRConfig>
    </QueryClientProvider>
  )
}
