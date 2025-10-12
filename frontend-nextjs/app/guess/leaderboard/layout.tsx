import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Leaderboard | Southville 8B NHS",
  description: "Student achievements and rankings across academics and activities.",
  alternates: { canonical: "/guess/leaderboard" },
  openGraph: {
    title: "Leaderboard | Southville 8B NHS",
    description: "Student achievements and rankings across academics and activities.",
    url: "/guess/leaderboard",
    type: "website",
    images: [{ url: `/api/og?title=${encodeURIComponent("Leaderboard")}&subtitle=${encodeURIComponent("Southville 8B NHS")}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Leaderboard | Southville 8B NHS",
    description: "Student achievements and rankings across academics and activities.",
    images: [`/api/og?title=${encodeURIComponent("Leaderboard")}&subtitle=${encodeURIComponent("Southville 8B NHS")}`],
  },
}

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
