import type React from "react"
import type { Metadata } from "next"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"

export const metadata: Metadata = {
  title: "News & Updates | Southville 8B NHS",
  description: "Latest news, achievements, events, and stories from Southville 8B National High School.",
  alternates: { canonical: "/guess/news" },
  openGraph: {
    title: "News & Updates | Southville 8B NHS",
    description: "Latest news, achievements, events, and stories from Southville 8B National High School.",
    url: "/guess/news",
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "News & Updates | Southville 8B NHS",
    description: "Latest news, achievements, events, and stories from Southville 8B National High School.",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
