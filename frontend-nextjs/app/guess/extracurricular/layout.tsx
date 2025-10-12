import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Extracurricular | Southville 8B NHS",
  description: "Extracurricular programs fostering leadership, creativity, and teamwork.",
  alternates: { canonical: "/guess/extracurricular" },
  openGraph: {
    title: "Extracurricular | Southville 8B NHS",
    description: "Extracurricular programs fostering leadership, creativity, and teamwork.",
    url: "/guess/extracurricular",
    type: "website",
    images: [{ url: `/api/og?title=${encodeURIComponent("Extracurricular")}&subtitle=${encodeURIComponent("Southville 8B NHS")}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Extracurricular | Southville 8B NHS",
    description: "Extracurricular programs fostering leadership, creativity, and teamwork.",
    images: [`/api/og?title=${encodeURIComponent("Extracurricular")}&subtitle=${encodeURIComponent("Southville 8B NHS")}`],
  },
}

export default function ExtracurricularLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
