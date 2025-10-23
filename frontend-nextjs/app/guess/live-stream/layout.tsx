import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Live Stream | Southville 8B NHS",
  description: "Watch live events and broadcasts from Southville 8B NHS.",
  alternates: { canonical: "/guess/live-stream" },
  openGraph: {
    title: "Live Stream | Southville 8B NHS",
    description: "Watch live events and broadcasts from Southville 8B NHS.",
    url: "/guess/live-stream",
    type: "website",
    images: [{ url: `/api/og?title=${encodeURIComponent("Live Stream")}&subtitle=${encodeURIComponent("Southville 8B NHS")}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Stream | Southville 8B NHS",
    description: "Watch live events and broadcasts from Southville 8B NHS.",
    images: [`/api/og?title=${encodeURIComponent("Live Stream")}&subtitle=${encodeURIComponent("Southville 8B NHS")}`],
  },
}

export default function LiveStreamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
