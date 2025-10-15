"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Crown, Medal, Search, Download, TrendingUp, TrendingDown } from "lucide-react"

type Student = {
  id: string
  name: string
  avatar?: string
  gradeLevel: 7 | 8 | 9 | 10
  section: "A" | "B" | "C" | "D"
  gwa: number // 0-100 style (e.g., 98.6)
  rank: number // global rank only as a consistent tie-breaker
  trend: number // +/- delta
}

const SECTIONS: Array<Student["section"]> = ["A", "B", "C", "D"]

// Deterministic sample data: 10 students for each grade (7, 8, 9, 10)
const STUDENTS: Student[] = (() => {
  const list: Student[] = []
  let globalRank = 1

  const makeName = (grade: number, i: number) => {
    const names7 = [
      "Avery Cruz",
      "Blake Ramirez",
      "Cody Tan",
      "Dylan Santos",
      "Emery Flores",
      "Harper Cruz",
      "Jordan Reyes",
      "Kai Mendoza",
      "Logan Dela Cruz",
      "Morgan Santos",
    ]
    const names8 = [
      "Noah Garcia",
      "Olivia Reyes",
      "Parker Santos",
      "Quinn Cruz",
      "Riley Flores",
      "Sawyer Tan",
      "Taylor Ramos",
      "Uma Rivera",
      "Val Cruz",
      "Wyatt Torres",
    ]
    const names9 = [
      "Xavier Gomez",
      "Yara Fernandez",
      "Zane Morales",
      "Aiden Bautista",
      "Bella Navarro",
      "Carter Aquino",
      "Dakota Ramos",
      "Elena Santos",
      "Felix Lopez",
      "Gianna Reyes",
    ]
    const names10 = [
      "Hudson Garcia",
      "Isla Mendoza",
      "Jasper Cruz",
      "Kendall Reyes",
      "Luca Santos",
      "Mila Flores",
      "Nolan Dela Cruz",
      "Ophelia Tan",
      "Paxton Rivera",
      "Quincy Ramos",
    ]
    const byGrade: Record<number, string[]> = { 7: names7, 8: names8, 9: names9, 10: names10 }
    return byGrade[grade][i - 1]
  }

  const sets: Array<{ grade: 7 | 8 | 9 | 10; startGwa: number }> = [
    { grade: 7, startGwa: 96.8 },
    { grade: 8, startGwa: 97.4 },
    { grade: 9, startGwa: 97.9 },
    { grade: 10, startGwa: 98.3 },
  ]

  sets.forEach(({ grade, startGwa }) => {
    for (let i = 1 as const; i <= 10; i++) {
      // Smooth descending GWAs with tiny deterministic variation
      const gwa = startGwa - (i - 1) * 0.35 + ((i % 3) * 0.02 - 0.02)
      const trend = (i % 2 === 0 ? 1 : -1) * (0.1 + (i % 5) * 0.15) // +/- changes
      const section = SECTIONS[(i - 1) % SECTIONS.length]
      list.push({
        id: `g${grade}-s${i}`,
        name: makeName(grade, i),
        avatar: `/placeholder.svg?height=80&width=80&query=Grade+${grade}+Student+${i}`,
        gradeLevel: grade,
        section,
        gwa: Number(gwa.toFixed(1)),
        rank: globalRank++,
        trend: Number(trend.toFixed(1)),
      })
    }
  })

  // Sort globally by GWA desc then by globalRank asc for a stable "All" view
  list.sort((a, b) => (b.gwa !== a.gwa ? b.gwa - a.gwa : a.rank - b.rank))
  return list
})()

const formatGwa = (gwa: number) => gwa.toFixed(1)

function TrendChip({ value }: { value: number }) {
  const up = value >= 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border",
        up
          ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40"
          : "bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/40",
      )}
      aria-label={`Trend ${up ? "+" : ""}${value.toFixed(1)}`}
    >
      {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {up ? "+" : ""}
      {value.toFixed(1)}
    </span>
  )
}

type GradeFilter = "all" | 7 | 8 | 9 | 10
type ScopedStudent = Student & { scopedRank: number }

function computeTopTen(scope: GradeFilter): ScopedStudent[] {
  const pool = scope === "all" ? STUDENTS : STUDENTS.filter((s) => s.gradeLevel === scope)
  const sorted = [...pool].sort((a, b) => (b.gwa !== a.gwa ? b.gwa - a.gwa : a.rank - b.rank))
  return sorted.slice(0, 10).map((s, i) => ({ ...s, scopedRank: i + 1 }))
}

function exportCsv(rows: ScopedStudent[], scope: GradeFilter) {
  const headers = ["Rank", "Name", "Grade", "Section", "GWA", "Trend"]
  const data = rows.map((s) => [
    s.scopedRank,
    s.name,
    `G${s.gradeLevel}`,
    s.section,
    formatGwa(s.gwa),
    `${s.trend >= 0 ? "+" : ""}${s.trend.toFixed(1)}`,
  ])
  const csv = [headers, ...data].map((r) => r.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", `academic-top-10-${scope === "all" ? "overall" : `grade-${scope}`}.csv`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function PodiumCard({
  student,
  place,
  emphasis = "normal",
}: {
  student: ScopedStudent
  place: 1 | 2 | 3
  emphasis?: "normal" | "highlight"
}) {
  const medal =
    place === 1 ? (
      <Crown className="w-6 h-6" />
    ) : (
      <Medal className={cn("w-6 h-6", place === 2 ? "text-slate-600" : "text-amber-600")} />
    )
  const gradient =
    place === 1
      ? "from-purple-500 to-pink-500"
      : place === 2
        ? "from-slate-400 to-slate-600"
        : "from-orange-400 to-amber-600"

  return (
    <Card className={cn("relative overflow-hidden border", emphasis === "highlight" ? "shadow-xl" : "shadow-md")}>
      <div className={cn("h-1 w-full bg-gradient-to-r", gradient)} />
      <CardContent className={cn("p-5 sm:p-6", emphasis === "highlight" ? "pt-7" : "")}>
        <div className="flex items-center gap-4">
          <div className={cn("rounded-full p-3 text-white bg-gradient-to-br", gradient)} aria-hidden>
            {medal}
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Rank #{student.scopedRank}</div>
            <div className={cn("font-bold truncate", emphasis === "highlight" ? "text-lg" : "")}>{student.name}</div>
            <div className="text-xs text-muted-foreground">
              Grade {student.gradeLevel} • Section {student.section}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className={cn("font-extrabold", emphasis === "highlight" ? "text-2xl" : "text-xl")}>
              {formatGwa(student.gwa)}
            </div>
            <TrendChip value={student.trend} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Avatar className={cn(emphasis === "highlight" ? "h-12 w-12" : "h-10 w-10")}>
            <AvatarImage
              src={student.avatar || "/placeholder.svg?height=80&width=80&query=student-avatar-generic"}
              alt={`${student.name} avatar`}
            />
            <AvatarFallback className="font-semibold">
              {student.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="text-xs text-muted-foreground">
            Outstanding academic performance and consistent excellence.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StudentRankings() {
  const [query, setQuery] = useState("")
  const [grade, setGrade] = useState<GradeFilter>("all")

  const topTen = useMemo(() => computeTopTen(grade), [grade])
  const podium = topTen.slice(0, 3) // podium reflects scoped Top 3
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? topTen.filter((s) => s.name.toLowerCase().includes(q)) : topTen
  }, [topTen, query])

  const scopeLabel = grade === "all" ? "Overall" : `Grade ${grade}`

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search student..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            aria-label="Search student"
          />
        </div>

        {/* Grade filter: All, 7, 8, 9, 10 */}
        <div className="sm:ml-auto w-full sm:w-auto">
          <Tabs
            value={String(grade)}
            onValueChange={(v) => setGrade(v === "all" ? "all" : (Number(v) as GradeFilter))}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-5 sm:w-auto sm:inline-grid">
              {["all", "7", "8", "9", "10"].map((g) => (
                <TabsTrigger key={g} value={g} className="text-xs sm:text-sm">
                  {g === "all" ? "All" : `Grade ${g}`}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportCsv(topTen, grade)}>
            <Download className="w-4 h-4 mr-2" />
            Export Top 10
          </Button>
        </div>
      </div>

      {/* Heading for context */}
      <div className="flex items-end justify-between">
        <h2 className="text-xl md:text-2xl font-bold">Top 10 — {scopeLabel}</h2>
        <p className="text-xs text-muted-foreground">Showing {visible.length} of Top 10</p>
      </div>

      {/* Top 3 Podium */}
      <section aria-label="Top 3 podium">
        <div className="grid gap-4 md:grid-cols-3 items-end">
          {/* Second place */}
          {podium[1] && (
            <div className="md:translate-y-2">
              <PodiumCard student={podium[1]} place={2} />
            </div>
          )}

          {/* First place (highlighted, elevated) */}
          {podium[0] && (
            <div className="order-first md:order-none">
              <div className="md:-translate-y-2">
                <PodiumCard student={podium[0]} place={1} emphasis="highlight" />
              </div>
            </div>
          )}

          {/* Third place */}
          {podium[2] && (
            <div className="md:translate-y-3">
              <PodiumCard student={podium[2]} place={3} />
            </div>
          )}
        </div>
      </section>

      {/* Leaderboard */}
      <section aria-label="Leaderboard">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden sm:table-cell">Grade</TableHead>
                  <TableHead className="hidden sm:table-cell">Section</TableHead>
                  <TableHead>GWA</TableHead>
                  <TableHead className="hidden md:table-cell">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((s) => (
                  <TableRow key={s.id} className="hover:bg-accent/50">
                    <TableCell className="font-semibold">#{s.scopedRank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={s.avatar || "/placeholder.svg?height=80&width=80&query=student-avatar-generic"}
                            alt={`${s.name} avatar`}
                          />
                          <AvatarFallback className="text-xs font-semibold">
                            {s.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{s.name}</div>
                          <div className="text-xs text-muted-foreground sm:hidden">
                            G{s.gradeLevel} • Sec {s.section}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">G{s.gradeLevel}</TableCell>
                    <TableCell className="hidden sm:table-cell">{s.section}</TableCell>
                    <TableCell className="font-bold">{formatGwa(s.gwa)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <TrendChip value={s.trend} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {visible.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-sm">No students found.</div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
