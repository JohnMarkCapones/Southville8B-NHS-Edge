"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Crown, Medal, Search, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

type Student = {
  id: string
  name: string
  grade: number
  section: string
  avatar?: string
  gwa: number // on 100 scale for clarity
  rank: number
  trend: number // positive=improving, negative=declining
}

const STUDENTS: Student[] = [
  {
    id: "1",
    name: "Ava Martinez",
    grade: 12,
    section: "A",
    gwa: 98.6,
    rank: 1,
    trend: 0.8,
    avatar: "/placeholder.svg?height=72&width=72",
  },
  {
    id: "2",
    name: "Liam Chen",
    grade: 11,
    section: "B",
    gwa: 97.9,
    rank: 2,
    trend: 0.3,
    avatar: "/placeholder.svg?height=72&width=72",
  },
  {
    id: "3",
    name: "Sophia Johnson",
    grade: 12,
    section: "C",
    gwa: 97.4,
    rank: 3,
    trend: -0.2,
    avatar: "/placeholder.svg?height=72&width=72",
  },
  {
    id: "4",
    name: "Noah Patel",
    grade: 10,
    section: "A",
    gwa: 96.8,
    rank: 4,
    trend: 0.5,
    avatar: "/placeholder.svg?height=72&width=72",
  },
  {
    id: "5",
    name: "Mia Rodriguez",
    grade: 9,
    section: "D",
    gwa: 96.2,
    rank: 5,
    trend: 0.1,
    avatar: "/placeholder.svg?height=72&width=72",
  },
  {
    id: "6",
    name: "Ethan Kim",
    grade: 8,
    section: "B",
    gwa: 95.7,
    rank: 6,
    trend: 0.2,
    avatar: "/placeholder.svg?height=72&width=72",
  },
  {
    id: "7",
    name: "Isabella Nguyen",
    grade: 7,
    section: "A",
    gwa: 95.2,
    rank: 7,
    trend: 0.4,
    avatar: "/placeholder.svg?height=72&width=72",
  },
  {
    id: "8",
    name: "James Wilson",
    grade: 11,
    section: "C",
    gwa: 94.9,
    rank: 8,
    trend: -0.1,
    avatar: "/placeholder.svg?height=72&width=72",
  },
  {
    id: "9",
    name: "Charlotte Rivera",
    grade: 10,
    section: "B",
    gwa: 94.6,
    rank: 9,
    trend: 0.2,
    avatar: "/placeholder.svg?height=72&width=72",
  },
  {
    id: "10",
    name: "Benjamin Lee",
    grade: 12,
    section: "D",
    gwa: 94.3,
    rank: 10,
    trend: -0.3,
    avatar: "/placeholder.svg?height=72&width=72",
  },
  {
    id: "11",
    name: "Grace Miller",
    grade: 9,
    section: "A",
    gwa: 94.0,
    rank: 11,
    trend: 0.1,
    avatar: "/placeholder.svg?height=72&width=72",
  },
  {
    id: "12",
    name: "Oliver Davis",
    grade: 8,
    section: "C",
    gwa: 93.6,
    rank: 12,
    trend: 0.0,
    avatar: "/placeholder.svg?height=72&width=72",
  },
]

function rankBadge(rank: number) {
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
  if (rank === 1) return <span className={cn(base, "bg-amber-500 text-white")}>#1</span>
  if (rank === 2) return <span className={cn(base, "bg-slate-500 text-white")}>#2</span>
  if (rank === 3) return <span className={cn(base, "bg-orange-500 text-white")}>#3</span>
  return <span className={cn(base, "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200")}>#{rank}</span>
}

function TrendChip({ value }: { value: number }) {
  const up = value >= 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        up
          ? "border-emerald-600 text-emerald-900 bg-emerald-100 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-100"
          : "border-rose-600 text-rose-900 bg-rose-100 dark:border-rose-500 dark:bg-rose-950 dark:text-rose-100",
      )}
      aria-label={`Trend ${up ? "up" : "down"} by ${Math.abs(value).toFixed(1)} points`}
    >
      {up ? <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />}
      <span aria-hidden="true">
        {up ? "+" : ""}
        {value.toFixed(1)}
      </span>
    </span>
  )
}

function PodiumCard({
  student,
  place,
  size = "md",
}: {
  student: Student
  place: 1 | 2 | 3
  size?: "sm" | "md" | "lg"
}) {
  const gradients: Record<1 | 2 | 3, string> = {
    1: "from-amber-500 to-orange-600",
    2: "from-slate-400 to-slate-600",
    3: "from-orange-400 to-amber-600",
  }
  const Icon = place === 1 ? Crown : Medal
  const heights: Record<"sm" | "md" | "lg", string> = {
    sm: "pt-4 pb-4",
    md: "pt-6 pb-6",
    lg: "pt-8 pb-8",
  }

  return (
    <Card className={cn("overflow-hidden border-slate-200 dark:border-slate-800 text-center", heights[size])}>
      <div className={cn("h-1 w-full bg-gradient-to-r", gradients[place])} />
      <CardContent className="pt-5">
        <div className="flex items-center justify-center">
          <span className={cn("rounded-full p-2 text-white bg-gradient-to-br", gradients[place])}>
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-4 flex items-center justify-center">
          <Avatar className="h-16 w-16 ring-2 ring-white dark:ring-slate-900">
            <AvatarImage
              src={student.avatar || "/placeholder.svg?height=72&width=72&query=student-avatar"}
              alt={`${student.name} avatar`}
            />
            <AvatarFallback className="font-bold bg-gradient-to-br from-emerald-500 to-violet-500 text-white">
              {student.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="mt-3 font-semibold">{student.name}</div>
        <div className="text-xs text-muted-foreground">
          Grade {student.grade} • Section {student.section}
        </div>
        <div className="mt-3 flex items-center justify-center gap-3">
          <Badge variant="secondary" className="px-2 py-0.5 text-[11px]">
            GWA {student.gwa.toFixed(1)}
          </Badge>
          {rankBadge(student.rank)}
        </div>
      </CardContent>
    </Card>
  )
}

export function Leaderboard() {
  const [query, setQuery] = useState("")
  const data = useMemo(() => [...STUDENTS].sort((a, b) => a.rank - b.rank), [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter((s) => s.name.toLowerCase().includes(q))
  }, [data, query])

  const top3 = filtered.slice(0, 3)
  const rest = filtered.slice(3)

  return (
    <div className="space-y-8">
      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-end">
        {/* 2nd */}
        {top3[1] ? (
          <div className="sm:translate-y-2">
            <PodiumCard student={top3[1]} place={2} size="md" />
          </div>
        ) : (
          <div className="hidden sm:block" />
        )}

        {/* 1st */}
        {top3[0] && (
          <div className="">
            <PodiumCard student={top3[0]} place={1} size="lg" />
          </div>
        )}

        {/* 3rd */}
        {top3[2] ? (
          <div className="sm:translate-y-3">
            <PodiumCard student={top3[2]} place={3} size="sm" />
          </div>
        ) : (
          <div className="hidden sm:block" />
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students..."
          aria-label="Search students"
          className="pl-9"
        />
      </div>

      {/* Leaderboard Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Grade</TableHead>
                <TableHead className="hidden sm:table-cell">Section</TableHead>
                <TableHead>GWA</TableHead>
                <TableHead className="hidden md:table-cell">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top3.map((s) => (
                <TableRow key={s.id} className="bg-emerald-50/50 dark:bg-emerald-900/10">
                  <TableCell className="font-semibold">{rankBadge(s.rank)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={s.avatar || "/placeholder.svg?height=72&width=72&query=student-avatar"}
                          alt={`${s.name} avatar`}
                        />
                        <AvatarFallback className="font-bold bg-gradient-to-br from-emerald-500 to-violet-500 text-white">
                          {s.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{s.name}</div>
                        <div className="text-xs text-muted-foreground sm:hidden">
                          G{s.grade} • Sec {s.section}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">G{s.grade}</TableCell>
                  <TableCell className="hidden sm:table-cell">{s.section}</TableCell>
                  <TableCell className="font-semibold">{s.gwa.toFixed(1)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <TrendChip value={s.trend} />
                  </TableCell>
                </TableRow>
              ))}

              {rest.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-semibold">{rankBadge(s.rank)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={s.avatar || "/placeholder.svg?height=72&width=72&query=student-avatar"}
                          alt={`${s.name} avatar`}
                        />
                        <AvatarFallback className="font-bold bg-gradient-to-br from-emerald-500 to-violet-500 text-white">
                          {s.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{s.name}</div>
                        <div className="text-xs text-muted-foreground sm:hidden">
                          G{s.grade} • Sec {s.section}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">G{s.grade}</TableCell>
                  <TableCell className="hidden sm:table-cell">{s.section}</TableCell>
                  <TableCell className="font-medium">{s.gwa.toFixed(1)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <TrendChip value={s.trend} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">No students match your search.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
