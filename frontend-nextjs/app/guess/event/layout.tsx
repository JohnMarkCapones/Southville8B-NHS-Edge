import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Events | Southville 8B NHS",
  description: "Upcoming and past events, ceremonies, and activities at Southville 8B NHS.",
  alternates: { canonical: "/guess/event" },
  openGraph: {
    title: "Events | Southville 8B NHS",
    description: "Upcoming and past events, ceremonies, and activities at Southville 8B NHS.",
    url: "/guess/event",
    type: "website",
    images: [{ url: `/api/og?title=${encodeURIComponent("Events")}&subtitle=${encodeURIComponent("Southville 8B NHS")}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Events | Southville 8B NHS",
    description: "Upcoming and past events, ceremonies, and activities at Southville 8B NHS.",
    images: [`/api/og?title=${encodeURIComponent("Events")}&subtitle=${encodeURIComponent("Southville 8B NHS")}`],
  },
}

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
