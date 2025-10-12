import type { Metadata } from "next"
import { StudentRankings } from "@/components/student-rankings"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Academic Excellence Rankings",
  description: "Top 3 podium and Top 10 leaderboard by grade",
  alternates: { canonical: "/guess/academic-excellence" },
  openGraph: {
    title: "Academic Excellence Rankings",
    description: "Top 3 podium and Top 10 leaderboard by grade",
    url: "/guess/academic-excellence",
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Academic Excellence Rankings",
    description: "Top 3 podium and Top 10 leaderboard by grade",
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function AcademicExcellencePage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Academic Excellence Rankings</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Explore the Top 3 podium and Top 10 leaderboard overall or by grade level.
        </p>
      </header>

      <StudentRankings />
    </main>
  )
}
