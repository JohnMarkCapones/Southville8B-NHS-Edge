"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import DashboardLayout from "@/components/superadmin/dashboard/layout"
import { LeaderboardWidget } from "@/components/gamification"
import {
  getAnalytics,
  getAllBadges,
  awardPoints,
  formatPoints,
  type Badge as BadgeType,
  type LeaderboardResponse,
  type AwardPointsRequest,
} from "@/lib/api/endpoints/gamification"
import {
  Trophy,
  Users,
  Zap,
  Star,
  TrendingUp,
  Award,
  Plus,
  Search,
  Loader2,
  Gift,
  BarChart3,
} from "lucide-react"

export default function SuperadminGamificationPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Award points dialog state
  const [isAwardDialogOpen, setIsAwardDialogOpen] = useState(false)
  const [awardForm, setAwardForm] = useState({
    studentId: "",
    points: "",
    reason: "",
    category: "bonus" as "quiz" | "activity" | "streak" | "bonus" | "penalty",
  })
  const [isAwarding, setIsAwarding] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [analytics, badgesData] = await Promise.all([
          getAnalytics(),
          getAllBadges(false),
        ])
        setAnalyticsData(analytics)
        setBadges(badgesData)
      } catch (err) {
        console.error("Error fetching gamification data:", err)
        setError("Failed to load gamification data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAwardPoints = async () => {
    if (!awardForm.studentId || !awardForm.points || !awardForm.reason) {
      alert("Please fill in all fields")
      return
    }

    setIsAwarding(true)
    try {
      const request: AwardPointsRequest = {
        studentId: awardForm.studentId,
        points: parseInt(awardForm.points),
        reason: awardForm.reason,
        category: awardForm.category,
        transactionType: "manual_award",
        isManual: true,
      }

      await awardPoints(request)
      alert("Points awarded successfully!")
      setIsAwardDialogOpen(false)
      setAwardForm({
        studentId: "",
        points: "",
        reason: "",
        category: "bonus",
      })
    } catch (err) {
      console.error("Error awarding points:", err)
      alert("Failed to award points. Please try again.")
    } finally {
      setIsAwarding(false)
    }
  }

  const stats = analyticsData
    ? {
        totalStudents: analyticsData.overview.totalStudents,
        activeStudents: analyticsData.overview.activeStudents,
        totalPoints: analyticsData.overview.totalPointsAwarded,
        averagePoints: analyticsData.overview.averagePointsPerStudent,
        averageLevel: analyticsData.overview.averageLevel,
        totalBadges: analyticsData.overview.totalBadgesEarned,
      }
    : {
        totalStudents: 0,
        activeStudents: 0,
        totalPoints: 0,
        averagePoints: 0,
        averageLevel: "N/A",
        totalBadges: 0,
      }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-800 bg-clip-text text-transparent">
              Gamification Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage points, badges, and student achievements
            </p>
          </div>
          <Dialog open={isAwardDialogOpen} onOpenChange={setIsAwardDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                <Gift className="w-4 h-4 mr-2" />
                Award Points
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Award Points to Student</DialogTitle>
                <DialogDescription>
                  Manually award points to a student for achievements or special recognition
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID (UUID)</Label>
                  <Input
                    id="studentId"
                    placeholder="Enter student UUID"
                    value={awardForm.studentId}
                    onChange={(e) => setAwardForm({ ...awardForm, studentId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    placeholder="100"
                    value={awardForm.points}
                    onChange={(e) => setAwardForm({ ...awardForm, points: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={awardForm.category}
                    onValueChange={(value) =>
                      setAwardForm({ ...awardForm, category: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                      <SelectItem value="streak">Streak</SelectItem>
                      <SelectItem value="bonus">Bonus</SelectItem>
                      <SelectItem value="penalty">Penalty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="Excellent performance in science fair..."
                    value={awardForm.reason}
                    onChange={(e) => setAwardForm({ ...awardForm, reason: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAwardDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAwardPoints} disabled={isAwarding}>
                  {isAwarding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Awarding...
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      Award Points
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-2 text-muted-foreground">Loading gamification data...</span>
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

        {/* Stats Overview */}
        {!isLoading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total Students</p>
                      <p className="text-3xl font-bold">{stats.totalStudents}</p>
                      <p className="text-xs text-purple-200 mt-1">
                        {stats.activeStudents} active
                      </p>
                    </div>
                    <Users className="w-12 h-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm">Total Points</p>
                      <p className="text-3xl font-bold">{formatPoints(stats.totalPoints)}</p>
                      <p className="text-xs text-yellow-200 mt-1">
                        Avg: {formatPoints(stats.averagePoints)}
                      </p>
                    </div>
                    <Zap className="w-12 h-12 text-yellow-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Badges Earned</p>
                      <p className="text-3xl font-bold">{stats.totalBadges}</p>
                      <p className="text-xs text-blue-200 mt-1">
                        {badges.length} total badges
                      </p>
                    </div>
                    <Star className="w-12 h-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performers */}
            {analyticsData && analyticsData.topPerformers && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>
                    Students with the highest points and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LeaderboardWidget
                    entries={analyticsData.topPerformers}
                    maxEntries={10}
                  />
                </CardContent>
              </Card>
            )}

            {/* Badges Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2 text-blue-600" />
                      Badge Management
                    </CardTitle>
                    <CardDescription>
                      Manage and monitor badge achievements
                    </CardDescription>
                  </div>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Badge
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search badges..." className="pl-10" />
                  </div>

                  {/* Badges Table */}
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Badge Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>Rarity</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {badges.slice(0, 10).map((badge) => (
                          <TableRow key={badge.id}>
                            <TableCell className="font-medium">{badge.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {badge.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">
                                {badge.tier}
                              </Badge>
                            </TableCell>
                            <TableCell className="capitalize">
                              {badge.rarity}
                            </TableCell>
                            <TableCell>{badge.points_reward}</TableCell>
                            <TableCell>
                              <Badge
                                variant={badge.is_active ? "default" : "secondary"}
                              >
                                {badge.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {badges.length > 10 && (
                    <div className="text-center">
                      <Button variant="outline">
                        View All {badges.length} Badges
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Average Level</p>
                    <p className="text-2xl font-bold">{stats.averageLevel}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Active Badges</p>
                    <p className="text-2xl font-bold">
                      {badges.filter((b) => b.is_active).length}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Progressive Badges</p>
                    <p className="text-2xl font-bold">
                      {badges.filter((b) => b.is_progressive).length}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Hidden Badges</p>
                    <p className="text-2xl font-bold">
                      {badges.filter((b) => b.is_hidden).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
