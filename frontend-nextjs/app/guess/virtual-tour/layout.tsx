import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Virtual Tour | Southville 8B NHS",
  description: "Take a virtual tour of our campus and facilities.",
  alternates: { canonical: "/guess/virtual-tour" },
  openGraph: {
    title: "Virtual Tour | Southville 8B NHS",
    description: "Take a virtual tour of our campus and facilities.",
    url: "/guess/virtual-tour",
    type: "website",
    images: [{ url: `/api/og?title=${encodeURIComponent("Virtual Tour")}&subtitle=${encodeURIComponent("Southville 8B NHS")}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Virtual Tour | Southville 8B NHS",
    description: "Take a virtual tour of our campus and facilities.",
    images: [`/api/og?title=${encodeURIComponent("Virtual Tour")}&subtitle=${encodeURIComponent("Southville 8B NHS")}`],
  },
}

export default function VirtualTourLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
