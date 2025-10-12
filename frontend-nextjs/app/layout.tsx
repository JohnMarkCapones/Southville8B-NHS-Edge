import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { BackToTop } from "@/components/ui/back-to-top"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ConditionalLayout } from "@/components/conditional-layout"
import { SITE_URL } from "@/lib/seo"

const inter = Inter({ subsets: ["latin"] })

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
    locale: "en_US",
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} disableTransitionOnChange>
          <ScrollToTop />
          <ConditionalLayout>{children}</ConditionalLayout>
          <Toaster />
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  )
}
