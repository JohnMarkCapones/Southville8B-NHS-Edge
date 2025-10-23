import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "News & Events | Southville 8B NHS",
  description: "School news and upcoming events to keep the community informed.",
  alternates: { canonical: "/guess/news-events" },
  openGraph: {
    title: "News & Events | Southville 8B NHS",
    description: "School news and upcoming events to keep the community informed.",
    url: "/guess/news-events",
    type: "website",
    images: [{ url: `/api/og?title=${encodeURIComponent("News & Events")}&subtitle=${encodeURIComponent("Southville 8B NHS")}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "News & Events | Southville 8B NHS",
    description: "School news and upcoming events to keep the community informed.",
    images: [`/api/og?title=${encodeURIComponent("News & Events")}&subtitle=${encodeURIComponent("Southville 8B NHS")}`],
  },
}

export default function NewsEventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
