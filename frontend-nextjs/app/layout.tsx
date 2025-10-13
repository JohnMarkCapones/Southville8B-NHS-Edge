import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { SITE_URL } from "@/lib/seo"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
  fallback: ["system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
  preload: true,
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Southville 8B National High School",
    template: "%s | Southville 8B NHS",
  },
  description:
    "Excellence in education at Southville 8B National High School. Comprehensive academics, vibrant student life, and championship athletics.",
  keywords: ["high school", "education", "academics", "student life", "athletics", "Southville 8B", "NHS"],
  authors: [{ name: "Southville 8B NHS" }],
  creator: "Southville 8B NHS",
  applicationName: "Southville 8B NHS",
  alternates: {
    canonical: "/", 
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "https://southville8bnhs.com/",
    title: "Southville 8B National High School",
    description: "Excellence in education with comprehensive academics and vibrant student life.",
    siteName: "Southville 8B NHS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Southville 8B National High School",
    description: "Excellence in education with comprehensive academics and vibrant student life.",
    creator: "@southville8bnhs",
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-PH" suppressHydrationWarning>
      <head>
        {/* Preconnect to optimize external resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for faster external requests */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={inter.className}>
        {/* Enhanced Skip Links for Keyboard Navigation - WCAG 2.1 AAA */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-xl focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all"
        >
          Skip to main content
        </a>
        <a
          href="#navigation"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-xl focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all"
        >
          Skip to navigation
        </a>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
