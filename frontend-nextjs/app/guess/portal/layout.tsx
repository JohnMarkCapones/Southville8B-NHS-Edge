import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Portal | Southville 8B NHS",
  description: "Access the student and parent portal for grades, schedules, and resources.",
  alternates: { canonical: "/guess/portal" },
  openGraph: {
    title: "Portal | Southville 8B NHS",
    description: "Access the student and parent portal for grades, schedules, and resources.",
    url: "/guess/portal",
    type: "website",
    images: [{ url: `/api/og?title=${encodeURIComponent("Portal")}&subtitle=${encodeURIComponent("Southville 8B NHS")}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portal | Southville 8B NHS",
    description: "Access the student and parent portal for grades, schedules, and resources.",
    images: [`/api/og?title=${encodeURIComponent("Portal")}&subtitle=${encodeURIComponent("Southville 8B NHS")}`],
  },
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
