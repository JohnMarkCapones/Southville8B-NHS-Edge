"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Crown,
  Medal,
  Search,
  Download,
  TrendingUp,
  TrendingDown,
  Trophy,
  Star,
  Award,
  Filter,
  Users,
  Target,
  Zap,
  Flame,
} from "lucide-react"
import StudentLayout from "@/components/student/student-layout"

type Student = {
  id: string
  name: string
  avatar?: string
  gradeLevel: 7 | 8 | 9 | 10
  section: "A" | "B" | "C" | "D"
  gwa: number
  rank: number
  trend: number
  points: number
  achievements: number
  streak: number
}

const SECTIONS: Array<Student["section"]> = ["A", "B", "C", "D"]

// Enhanced sample data with gamification elements
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
      const gwa = startGwa - (i - 1) * 0.35 + ((i % 3) * 0.02 - 0.02)
      const trend = (i % 2 === 0 ? 1 : -1) * (0.1 + (i % 5) * 0.15)
      const section = SECTIONS[(i - 1) % SECTIONS.length]
      const points = 2500 - (globalRank - 1) * 50 + Math.floor(Math.random() * 100)
      const achievements = Math.floor(Math.random() * 8) + 2
      const streak = Math.floor(Math.random() * 25) + 5

      list.push({
        id: `g${grade}-s${i}`,
        name: makeName(grade, i),
        avatar: `/placeholder.svg?height=80&width=80&query=Grade+${grade}+Student+${i}`,
        gradeLevel: grade,
        section,
        gwa: Number(gwa.toFixed(1)),
        rank: globalRank++,
        trend: Number(trend.toFixed(1)),
        points,
        achievements,
        streak,
      })
    }
  })

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
          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
          : "bg-rose-500/10 text-rose-600 border-rose-500/30",
      )}
    >
      {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {up ? "+" : ""}
      {value.toFixed(1)}
    </span>
  )
}

type GradeFilter = "all" | 7 | 8 | 9 | 10
type SectionFilter = "all" | "A" | "B" | "C" | "D"
type SortBy = "rank" | "gwa" | "points" | "achievements" | "streak"

function PodiumCard({ student, place }: { student: Student; place: 1 | 2 | 3 }) {
  const medal =
    place === 1 ? (
      <Crown className="w-6 h-6 text-yellow-500" />
    ) : place === 2 ? (
      <Medal className="w-6 h-6 text-gray-400" />
    ) : (
      <Award className="w-6 h-6 text-amber-600" />
    )

  const gradient =
    place === 1
      ? "from-yellow-400 to-yellow-600"
      : place === 2
        ? "from-gray-300 to-gray-500"
        : "from-amber-400 to-amber-600"

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1",
        place === 1
          ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50"
          : place === 2
            ? "border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50"
            : "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50",
      )}
    >
      <div className={cn("h-2 w-full bg-gradient-to-r", gradient)} />
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={cn("rounded-full p-3 text-white bg-gradient-to-br", gradient)}>{medal}</div>
          <div className="min-w-0 flex-1">
            <div className="text-sm text-muted-foreground">#{place}</div>
            <div className="font-bold text-lg truncate">{student.name}</div>
            <div className="text-sm text-muted-foreground">
              Grade {student.gradeLevel} • Section {student.section}
            </div>
          </div>
          <div className="text-right">
            <div className="font-extrabold text-2xl text-emerald-600">{formatGwa(student.gwa)}</div>
            <TrendChip value={student.trend} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={student.avatar || "/placeholder.svg"} alt={`${student.name} avatar`} />
            <AvatarFallback className="font-semibold">
              {student.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">{student.points.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{student.achievements}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-medium">{student.streak}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function StudentRankingPage() {
  const [query, setQuery] = useState("")
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all")
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("all")
  const [sortBy, setSortBy] = useState<SortBy>("rank")

  const filteredAndSortedStudents = useMemo(() => {
    let filtered = STUDENTS

    // Apply grade filter
    if (gradeFilter !== "all") {
      filtered = filtered.filter((s) => s.gradeLevel === gradeFilter)
    }

    // Apply section filter
    if (sectionFilter !== "all") {
      filtered = filtered.filter((s) => s.section === sectionFilter)
    }

    // Apply search query
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(q))
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "gwa":
          return b.gwa - a.gwa
        case "points":
          return b.points - a.points
        case "achievements":
          return b.achievements - a.achievements
        case "streak":
          return b.streak - a.streak
        default:
          return a.rank - b.rank
      }
    })

    return filtered.map((s, i) => ({ ...s, displayRank: i + 1 }))
  }, [query, gradeFilter, sectionFilter, sortBy])

  const topThree = filteredAndSortedStudents.slice(0, 3)
  const stats = {
    totalStudents: filteredAndSortedStudents.length,
    averageGwa: filteredAndSortedStudents.reduce((sum, s) => sum + s.gwa, 0) / filteredAndSortedStudents.length,
    totalPoints: filteredAndSortedStudents.reduce((sum, s) => sum + s.points, 0),
    totalAchievements: filteredAndSortedStudents.reduce((sum, s) => sum + s.achievements, 0),
  }

  const exportCsv = () => {
    const headers = ["Rank", "Name", "Grade", "Section", "GWA", "Points", "Achievements", "Streak", "Trend"]
    const data = filteredAndSortedStudents.map((s) => [
      s.displayRank,
      s.name,
      `Grade ${s.gradeLevel}`,
      s.section,
      formatGwa(s.gwa),
      s.points.toLocaleString(),
      s.achievements,
      s.streak,
      `${s.trend >= 0 ? "+" : ""}${s.trend.toFixed(1)}`,
    ])
    const csv = [headers, ...data].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `student-rankings-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <StudentLayout>
      <div className="flex-1 p-6 space-y-8 bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            Student Rankings
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover top performers and track academic excellence across all grade levels
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Students</p>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Average GWA</p>
                  <p className="text-2xl font-bold">{stats.averageGwa.toFixed(1)}</p>
                </div>
                <Target className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Total Points</p>
                  <p className="text-2xl font-bold">{(stats.totalPoints / 1000).toFixed(0)}K</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Achievements</p>
                  <p className="text-2xl font-bold">{stats.totalAchievements}</p>
                </div>
                <Star className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-lg border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center text-emerald-700">
              <Filter className="w-5 h-5 mr-2" />
              Filters & Search
            </CardTitle>
            <CardDescription>Customize your view with advanced filtering options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search students..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                />
              </div>

              {/* Grade Filter */}
              <Select
                value={String(gradeFilter)}
                onValueChange={(v) => setGradeFilter(v === "all" ? "all" : (Number(v) as GradeFilter))}
              >
                <SelectTrigger className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400">
                  <SelectValue placeholder="Grade Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="7">Grade 7</SelectItem>
                  <SelectItem value="8">Grade 8</SelectItem>
                  <SelectItem value="9">Grade 9</SelectItem>
                  <SelectItem value="10">Grade 10</SelectItem>
                </SelectContent>
              </Select>

              {/* Section Filter */}
              <Select value={sectionFilter} onValueChange={(v) => setSectionFilter(v as SectionFilter)}>
                <SelectTrigger className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                  <SelectItem value="D">Section D</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                <SelectTrigger className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rank">Overall Rank</SelectItem>
                  <SelectItem value="gwa">GWA Score</SelectItem>
                  <SelectItem value="points">Points</SelectItem>
                  <SelectItem value="achievements">Achievements</SelectItem>
                  <SelectItem value="streak">Study Streak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                  {filteredAndSortedStudents.length} students found
                </Badge>
                {gradeFilter !== "all" && <Badge variant="secondary">Grade {gradeFilter}</Badge>}
                {sectionFilter !== "all" && <Badge variant="secondary">Section {sectionFilter}</Badge>}
              </div>
              <Button
                onClick={exportCsv}
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Podium */}
        {topThree.length >= 3 && (
          <section>
            <h2 className="text-2xl font-bold text-center mb-6 text-emerald-800">🏆 Top Performers</h2>
            <div className="grid gap-6 md:grid-cols-3 items-end">
              {/* Second place */}
              <div className="md:translate-y-4">
                <PodiumCard student={topThree[1]} place={2} />
              </div>

              {/* First place */}
              <div className="order-first md:order-none">
                <div className="md:-translate-y-2">
                  <PodiumCard student={topThree[0]} place={1} />
                </div>
              </div>

              {/* Third place */}
              <div className="md:translate-y-6">
                <PodiumCard student={topThree[2]} place={3} />
              </div>
            </div>
          </section>
        )}

        {/* Leaderboard Table */}
        <Card className="shadow-lg border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center text-emerald-700">
              <Trophy className="w-5 h-5 mr-2" />
              Complete Rankings
            </CardTitle>
            <CardDescription>Detailed leaderboard with comprehensive student performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50">
                    <TableHead className="w-16 font-semibold text-emerald-800">Rank</TableHead>
                    <TableHead className="font-semibold text-emerald-800">Student</TableHead>
                    <TableHead className="hidden sm:table-cell font-semibold text-emerald-800">Grade</TableHead>
                    <TableHead className="hidden sm:table-cell font-semibold text-emerald-800">Section</TableHead>
                    <TableHead className="font-semibold text-emerald-800">GWA</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold text-emerald-800">Points</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold text-emerald-800">Achievements</TableHead>
                    <TableHead className="hidden lg:table-cell font-semibold text-emerald-800">Streak</TableHead>
                    <TableHead className="hidden lg:table-cell font-semibold text-emerald-800">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedStudents.map((student, index) => (
                    <TableRow
                      key={student.id}
                      className={cn(
                        "hover:bg-emerald-50 transition-colors",
                        index < 3 && "bg-gradient-to-r from-yellow-50 to-amber-50",
                      )}
                    >
                      <TableCell className="font-bold">
                        <div className="flex items-center">
                          {index === 0 && <Crown className="w-4 h-4 text-yellow-500 mr-1" />}
                          {index === 1 && <Medal className="w-4 h-4 text-gray-400 mr-1" />}
                          {index === 2 && <Award className="w-4 h-4 text-amber-600 mr-1" />}#{student.displayRank}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.avatar || "/placeholder.svg"} alt={`${student.name} avatar`} />
                            <AvatarFallback className="text-xs font-semibold bg-emerald-100 text-emerald-700">
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground sm:hidden">
                              G{student.gradeLevel} • Sec {student.section}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                          Grade {student.gradeLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary">{student.section}</Badge>
                      </TableCell>
                      <TableCell className="font-bold text-emerald-600">{formatGwa(student.gwa)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">{student.points.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{student.achievements}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span className="font-medium">{student.streak} days</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <TrendChip value={student.trend} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredAndSortedStudents.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No students found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  )
}
