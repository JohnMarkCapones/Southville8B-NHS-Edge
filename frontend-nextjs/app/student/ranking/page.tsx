"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Crown,
  Medal,
  Download,
  TrendingUp,
  Trophy,
  Star,
  Award,
  Filter,
  Users,
  Target,
  Zap,
  Flame,
  Loader2,
} from "lucide-react"
import StudentLayout from "@/components/student/student-layout"
import { LeaderboardTable } from "@/components/gamification"
import {
  getLeaderboard,
  formatPoints,
  getLevelTitle,
  type LeaderboardQuery,
  type LeaderboardResponse,
  type LeaderboardEntry,
} from "@/lib/api/endpoints/gamification"

type ScopeFilter = "global" | "grade" | "section"

function PodiumCard({ entry, place }: { entry: LeaderboardEntry; place: 1 | 2 | 3 }) {
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

  const getInitials = (name: string) => {
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

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
            <div className="font-bold text-lg truncate">{entry.student.name}</div>
            <div className="text-sm text-muted-foreground">
              {entry.student.gradeLevel && `Grade ${entry.student.gradeLevel}`}
              {entry.student.section && ` • Section ${entry.student.section}`}
            </div>
          </div>
          <div className="text-right">
            <div className="font-extrabold text-2xl text-emerald-600">
              {formatPoints(entry.stats.totalPoints)}
            </div>
            <div className="text-xs text-muted-foreground">Level {entry.stats.level}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={entry.student.avatarUrl || "/placeholder.svg"} alt={`${entry.student.name} avatar`} />
            <AvatarFallback className="font-semibold">
              {getInitials(entry.student.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">{formatPoints(entry.stats.totalPoints)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{entry.stats.totalBadges}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-medium">{entry.stats.currentStreak}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function StudentRankingPage() {
  const [scope, setScope] = useState<ScopeFilter>("global")
  const [scopeValue, setScopeValue] = useState<string>("")
  const [page, setPage] = useState(1)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const query: LeaderboardQuery = {
          scope,
          page,
          limit: 50,
        }

        if (scope !== "global" && scopeValue) {
          query.scopeValue = scopeValue
        }

        const data = await getLeaderboard(query)
        setLeaderboardData(data)
      } catch (err) {
        console.error("Error fetching leaderboard:", err)
        setError("Failed to load leaderboard data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [scope, scopeValue, page])

  const topThree = leaderboardData?.entries.slice(0, 3) || []
  const stats = {
    totalStudents: leaderboardData?.pagination.total || 0,
    averagePoints:
      leaderboardData && leaderboardData.entries.length > 0
        ? Math.round(
            leaderboardData.entries.reduce((sum, e) => sum + e.stats.totalPoints, 0) /
              leaderboardData.entries.length
          )
        : 0,
    totalBadges:
      leaderboardData?.entries.reduce((sum, e) => sum + e.stats.totalBadges, 0) || 0,
    averageLevel:
      leaderboardData && leaderboardData.entries.length > 0
        ? Math.round(
            leaderboardData.entries.reduce((sum, e) => sum + e.stats.level, 0) /
              leaderboardData.entries.length
          )
        : 0,
  }

  const exportCsv = () => {
    if (!leaderboardData || leaderboardData.entries.length === 0) return

    const headers = ["Rank", "Name", "Grade", "Section", "Points", "Level", "Badges", "Streak"]
    const data = leaderboardData.entries.map((e) => [
      e.rank,
      e.student.name,
      e.student.gradeLevel || "N/A",
      e.student.section || "N/A",
      e.stats.totalPoints,
      e.stats.level,
      e.stats.totalBadges,
      e.stats.currentStreak,
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
                  <p className="text-emerald-100 text-sm">Average Points</p>
                  <p className="text-2xl font-bold">{formatPoints(stats.averagePoints)}</p>
                </div>
                <Target className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Total Badges</p>
                  <p className="text-2xl font-bold">{stats.totalBadges}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Avg Level</p>
                  <p className="text-2xl font-bold">{stats.averageLevel}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-lg border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center text-emerald-700">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
            <CardDescription>Filter rankings by scope</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Scope Filter */}
              <Select
                value={scope}
                onValueChange={(v) => {
                  setScope(v as ScopeFilter)
                  setScopeValue("")
                  setPage(1)
                }}
              >
                <SelectTrigger className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global Rankings</SelectItem>
                  <SelectItem value="grade">By Grade Level</SelectItem>
                  <SelectItem value="section">By Section</SelectItem>
                </SelectContent>
              </Select>

              {/* Grade/Section Value */}
              {scope === "grade" && (
                <Select
                  value={scopeValue}
                  onValueChange={(v) => {
                    setScopeValue(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400">
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Grade 7</SelectItem>
                    <SelectItem value="8">Grade 8</SelectItem>
                    <SelectItem value="9">Grade 9</SelectItem>
                    <SelectItem value="10">Grade 10</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {scope === "section" && (
                <Select
                  value={scopeValue}
                  onValueChange={(v) => {
                    setScopeValue(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400">
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                    <SelectItem value="D">Section D</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                {leaderboardData && (
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                    {leaderboardData.pagination.total} students
                  </Badge>
                )}
                {scope === "grade" && scopeValue && <Badge variant="secondary">Grade {scopeValue}</Badge>}
                {scope === "section" && scopeValue && <Badge variant="secondary">Section {scopeValue}</Badge>}
              </div>
              <Button
                onClick={exportCsv}
                variant="outline"
                disabled={!leaderboardData || leaderboardData.entries.length === 0}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-muted-foreground">Loading rankings...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Top 3 Podium */}
        {!isLoading && !error && topThree.length >= 3 && (
          <section>
            <h2 className="text-2xl font-bold text-center mb-6 text-emerald-800">🏆 Top Performers</h2>
            <div className="grid gap-6 md:grid-cols-3 items-end">
              {/* Second place */}
              <div className="md:translate-y-4">
                <PodiumCard entry={topThree[1]} place={2} />
              </div>

              {/* First place */}
              <div className="order-first md:order-none">
                <div className="md:-translate-y-2">
                  <PodiumCard entry={topThree[0]} place={1} />
                </div>
              </div>

              {/* Third place */}
              <div className="md:translate-y-6">
                <PodiumCard entry={topThree[2]} place={3} />
              </div>
            </div>
          </section>
        )}

        {/* Leaderboard Table */}
        {!isLoading && !error && leaderboardData && (
          <LeaderboardTable
            entries={leaderboardData.entries}
            currentUser={leaderboardData.currentUser}
            pagination={leaderboardData.pagination}
            onPageChange={setPage}
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && leaderboardData && leaderboardData.entries.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-muted-foreground">No rankings available</p>
              <p className="text-sm text-muted-foreground">Check back later for updated rankings</p>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentLayout>
  )
}
