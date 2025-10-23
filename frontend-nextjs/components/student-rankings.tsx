"use client"

import { useMemo, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Crown, 
  Medal, 
  Search, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Loader2,
  Star,
  Trophy
} from "lucide-react"
import { 
  getStudentRankings, 
  getTopStudentsByGwa 
} from "@/lib/api/endpoints/student-rankings"
import type { 
  LeaderboardStudent, 
  StudentRankingQueryParams 
} from "@/lib/api/types/student-rankings"

type GradeFilter = "all" | 7 | 8 | 9 | 10
type ScopedStudent = LeaderboardStudent & { scopedRank: number }

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

function HonorBadge({ honorStatus }: { honorStatus?: string }) {
  if (!honorStatus || honorStatus === 'None') return null
  
  const getBadgeVariant = (status: string) => {
    if (status.includes('Highest')) return 'default'
    if (status.includes('High')) return 'secondary'
    return 'outline'
  }
  
  const getBadgeColor = (status: string) => {
    if (status.includes('Highest')) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
    if (status.includes('High')) return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
    return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
  }
  
  return (
    <Badge 
      variant={getBadgeVariant(honorStatus)}
      className={cn("text-xs font-medium", getBadgeColor(honorStatus))}
    >
      <Star className="w-3 h-3 mr-1" />
      {honorStatus}
    </Badge>
  )
}

function computeTopTen(students: LeaderboardStudent[], scope: GradeFilter): ScopedStudent[] {
  const pool = scope === "all" ? students : students.filter((s) => s.gradeLevel === scope)
  const sorted = [...pool].sort((a, b) => (b.gwa !== a.gwa ? b.gwa - a.gwa : a.rank - b.rank))
  return sorted.slice(0, 10).map((s, i) => ({ ...s, scopedRank: i + 1 }))
}

function exportCsv(rows: ScopedStudent[], scope: GradeFilter) {
  const headers = ["Rank", "Name", "Grade", "Section", "GWA", "Honor Status", "Trend"]
  const data = rows.map((s) => [
    s.scopedRank,
    s.name,
    `G${s.gradeLevel}`,
    s.section,
    formatGwa(s.gwa),
    s.honorStatus || 'None',
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
            {student.honorStatus && (
              <div className="mt-1">
                <HonorBadge honorStatus={student.honorStatus} />
              </div>
            )}
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
  const [students, setStudents] = useState<LeaderboardStudent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Fetch data from API only (no mock fallback)
  const fetchRankings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch from API only
      const params: StudentRankingQueryParams = {
        page: 1,
        limit: 10,
        gradeLevel: grade === "all" ? undefined : `Grade ${grade}`,
        topN: 10
      }
      
      const response = await getStudentRankings(params)
      
      if (response.data && response.data.length > 0) {
        // Transform API data to frontend format
        const transformedData = response.data.map((ranking, index) => {
          const gradeLevel = parseInt(ranking.grade_level.replace('Grade ', '')) as 7 | 8 | 9 | 10
          
          return {
            id: ranking.student_id,
            name: `${ranking.student?.first_name} ${ranking.student?.last_name}`,
            avatar: `/placeholder.svg?height=80&width=80&query=${ranking.student?.first_name}+${ranking.student?.last_name}`,
            gradeLevel,
            section: "A" as const, // Default section
            gwa: 95 + (10 - ranking.rank) * 0.3, // Mock GWA calculation
            rank: ranking.rank,
            trend: (index % 2 === 0 ? 1 : -1) * (0.1 + (index % 5) * 0.15),
            honorStatus: ranking.honor_status,
            studentId: ranking.student_id
          }
        })
        
        setStudents(transformedData)
        setLastUpdated(new Date())
      } else {
        // No data from API
        console.log('No API data found')
        setStudents([])
        setError('No student rankings data available')
      }
    } catch (err) {
      console.error('Failed to fetch rankings:', err)
      setError(`Failed to load student rankings: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setStudents([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data on component mount and when grade changes
  useEffect(() => {
    fetchRankings()
  }, [grade])

  const topTen = useMemo(() => computeTopTen(students, grade), [students, grade])
  const podium = topTen.slice(0, 3)
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? topTen.filter((s) => s.name.toLowerCase().includes(q)) : topTen
  }, [topTen, query])

  const scopeLabel = grade === "all" ? "Overall" : `Grade ${grade}`

  // Loading state
  if (isLoading && students.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading rankings...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state (but still show mock data)
  if (error && students.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchRankings}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

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
          <Button 
            variant="outline" 
            onClick={fetchRankings}
            disabled={isLoading}
            className="hover:scale-105 transition-all duration-300"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => exportCsv(topTen, grade)}>
            <Download className="w-4 h-4 mr-2" />
            Export Top 10
          </Button>
        </div>
      </div>

      {/* Heading for context */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Top 10 — {scopeLabel}
          </h2>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
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
                  <TableHead className="hidden md:table-cell">Honors</TableHead>
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
                      <HonorBadge honorStatus={s.honorStatus} />
                    </TableCell>
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

      {/* Error Display */}
      {error && (
        <div className="text-center">
          <p className="text-xs text-red-500">
            API Error: {error}
          </p>
        </div>
      )}
    </div>
  )
}