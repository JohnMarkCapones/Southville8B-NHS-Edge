import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Student Life | Southville 8B NHS",
  description: "Experience vibrant student life: activities, traditions, and community at Southville 8B NHS.",
  alternates: { canonical: "/guess/student-life" },
  openGraph: {
    title: "Student Life | Southville 8B NHS",
    description: "Experience vibrant student life: activities, traditions, and community at Southville 8B NHS.",
    url: "/guess/student-life",
    type: "website",
    images: [{ url: `/api/og?title=${encodeURIComponent("Student Life")}&subtitle=${encodeURIComponent("Southville 8B NHS")}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Life | Southville 8B NHS",
    description: "Experience vibrant student life: activities, traditions, and community at Southville 8B NHS.",
    images: [`/api/og?title=${encodeURIComponent("Student Life")}&subtitle=${encodeURIComponent("Southville 8B NHS")}`],
  },
}

export default function StudentLifeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
