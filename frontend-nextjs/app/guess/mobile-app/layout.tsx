import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mobile App | Southville 8B NHS",
  description: "Download our mobile app to stay updated with announcements, events, and more.",
  alternates: { canonical: "/guess/mobile-app" },
  openGraph: {
    title: "Mobile App | Southville 8B NHS",
    description: "Download our mobile app to stay updated with announcements, events, and more.",
    url: "/guess/mobile-app",
    type: "website",
    images: [{ url: `/api/og?title=${encodeURIComponent("Mobile App")}&subtitle=${encodeURIComponent("Southville 8B NHS")}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobile App | Southville 8B NHS",
    description: "Download our mobile app to stay updated with announcements, events, and more.",
    images: [`/api/og?title=${encodeURIComponent("Mobile App")}&subtitle=${encodeURIComponent("Southville 8B NHS")}`],
  },
}

export default function MobileAppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
