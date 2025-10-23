import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Clubs | Southville 8B NHS",
  description: "Discover student clubs and organizations that enrich campus life and leadership opportunities.",
  alternates: { canonical: "/guess/clubs" },
  openGraph: {
    title: "Clubs | Southville 8B NHS",
    description: "Discover student clubs and organizations that enrich campus life and leadership opportunities.",
    url: "/guess/clubs",
    type: "website",
    images: [{ url: `/api/og?title=${encodeURIComponent("Clubs")}&subtitle=${encodeURIComponent("Southville 8B NHS")}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clubs | Southville 8B NHS",
    description: "Discover student clubs and organizations that enrich campus life and leadership opportunities.",
    images: [`/api/og?title=${encodeURIComponent("Clubs")}&subtitle=${encodeURIComponent("Southville 8B NHS")}`],
  },
}

export default function ClubsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
