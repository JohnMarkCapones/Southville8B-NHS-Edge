import type React from "react"
import type { Metadata } from "next"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Athletics | Southville 8B NHS",
  description: "Explore our Eagles athletics programs, schedules, and achievements.",
  alternates: { canonical: "/guess/athletics" },
  openGraph: {
    title: "Athletics | Southville 8B NHS",
    description: "Explore our Eagles athletics programs, schedules, and achievements.",
    url: "/guess/athletics",
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Athletics | Southville 8B NHS",
    description: "Explore our Eagles athletics programs, schedules, and achievements.",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function AthleticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
