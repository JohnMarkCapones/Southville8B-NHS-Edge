import type React from "react"
import type { Metadata } from "next"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Alumni | Southville 8B NHS",
  description: "Celebrating the achievements and stories of Southville 8B NHS alumni.",
  alternates: { canonical: "/guess/alumni" },
  openGraph: {
    title: "Alumni | Southville 8B NHS",
    description: "Celebrating the achievements and stories of Southville 8B NHS alumni.",
    url: "/guess/alumni",
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alumni | Southville 8B NHS",
    description: "Celebrating the achievements and stories of Southville 8B NHS alumni.",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function AlumniLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
