/**
 * App Providers
 * 
 * Centralized provider wrapper for global providers:
 * - React Query (TanStack Query)
 * - Theme Provider (next-themes)
 * 
 * This file wraps the entire application with necessary providers.
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';

/**
 * Props for AppProviders component
 */
interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Global app providers wrapper
 * 
 * Creates a new QueryClient instance per request (server-side safe)
 * Configures React Query with sensible defaults
 */
export function AppProviders({ children }: AppProvidersProps) {
  // Create QueryClient instance per request (important for server-side rendering)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default stale time: 1 minute
            staleTime: 60 * 1000,
            // Default cache time (gcTime): 5 minutes
            gcTime: 5 * 60 * 1000,
            // Refetch on window focus
            refetchOnWindowFocus: true,
            // Retry failed requests 3 times
            retry: 3,
            // Exponential backoff for retries
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Retry mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

