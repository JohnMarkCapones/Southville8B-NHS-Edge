import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { BackToTop } from "@/components/ui/back-to-top"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ConditionalLayout } from "@/components/conditional-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Southville 8B National High School",
    template: "%s | Southville 8B NHS",
  },
  description:
    "Excellence in education at Southville 8B National High School. Comprehensive academics, vibrant student life, and championship athletics.",
  keywords: ["high school", "education", "academics", "student life", "athletics", "Southville 8B", "NHS"],
  authors: [{ name: "Southville 8B NHS" }],
  creator: "Southville 8B NHS",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://southville8bnhs.edu",
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
    generator: 'v0.app'
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
