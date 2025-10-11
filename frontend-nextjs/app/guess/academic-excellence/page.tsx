import { StudentRankings } from "@/components/student-rankings"

export const metadata = {
  title: "Academic Excellence Rankings",
  description: "Top 3 podium and Top 10 leaderboard by grade",
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
