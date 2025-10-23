import type React from "react"
import type { Metadata } from "next"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Academics | Southville 8B NHS",
  description:
    "Explore our comprehensive academic programs across STEM, languages, social studies, arts, and physical education.",
  alternates: { canonical: "/guess/academics" },
  openGraph: {
    title: "Academics | Southville 8B NHS",
    description:
      "Explore our comprehensive academic programs across STEM, languages, social studies, arts, and physical education.",
    url: "/guess/academics",
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Academics | Southville 8B NHS",
    description:
      "Explore our comprehensive academic programs across STEM, languages, social studies, arts, and physical education.",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function AcademicsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
