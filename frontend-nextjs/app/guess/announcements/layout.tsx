import type React from "react"
import type { Metadata } from "next"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Announcements | Southville 8B NHS",
  description: "Official school announcements and important updates.",
  alternates: { canonical: "/guess/announcements" },
  openGraph: {
    title: "Announcements | Southville 8B NHS",
    description: "Official school announcements and important updates.",
    url: "/guess/announcements",
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Announcements | Southville 8B NHS",
    description: "Official school announcements and important updates.",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function AnnouncementsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
