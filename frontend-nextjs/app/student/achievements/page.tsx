"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trophy, Award, Target, Star, Loader2 } from "lucide-react"
import StudentLayout from "@/components/student/student-layout"
import { BadgeShowcase } from "@/components/gamification"
import {
  getMyBadges,
  type MyBadgesResponse,
  type BadgeWithProgress,
} from "@/lib/api/endpoints/gamification"

export default function StudentAchievementsPage() {
  const [badgesData, setBadgesData] = useState<MyBadgesResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBadge, setSelectedBadge] = useState<BadgeWithProgress | null>(null)

  useEffect(() => {
    const fetchBadges = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getMyBadges("all")
        setBadgesData(data)
      } catch (err) {
        console.error("Error fetching badges:", err)
        setError("Failed to load badges. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBadges()
  }, [])

  const handleBadgeClick = (badge: BadgeWithProgress) => {
    setSelectedBadge(badge)
  }

  const stats = badgesData
    ? {
        total: badgesData.earned.length + badgesData.unearned.length,
        earned: badgesData.earned.length,
        unearned: badgesData.unearned.length,
        percentage: Math.round(
          (badgesData.earned.length /
            (badgesData.earned.length + badgesData.unearned.length)) *
            100
        ),
      }
    : { total: 0, earned: 0, unearned: 0, percentage: 0 }

  return (
    <StudentLayout>
      <div className="flex-1 p-6 space-y-8 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 rounded-full shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-800 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Achievements & Badges
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Collect badges by completing activities, earning points, and reaching milestones
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Badges</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Trophy className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Earned</p>
                  <p className="text-2xl font-bold">{stats.earned}</p>
                </div>
                <Award className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-sm">Locked</p>
                  <p className="text-2xl font-bold">{stats.unearned}</p>
                </div>
                <Target className="w-8 h-8 text-gray-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Completion</p>
                  <p className="text-2xl font-bold">{stats.percentage}%</p>
                </div>
                <Star className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Stats */}
        {badgesData && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🎓</div>
                <p className="text-sm text-muted-foreground dark:text-slate-400">Academic</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{badgesData.categories.academic}</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🎯</div>
                <p className="text-sm text-muted-foreground dark:text-slate-400">Participation</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{badgesData.categories.participation}</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🔥</div>
                <p className="text-sm text-muted-foreground dark:text-slate-400">Streak</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{badgesData.categories.streak}</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🤝</div>
                <p className="text-sm text-muted-foreground dark:text-slate-400">Social</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{badgesData.categories.social}</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">⭐</div>
                <p className="text-sm text-muted-foreground dark:text-slate-400">Special</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{badgesData.categories.special}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
            <span className="ml-2 text-muted-foreground dark:text-slate-400">Loading badges...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Badge Showcase */}
        {!isLoading && !error && badgesData && (
          <BadgeShowcase
            badges={[...badgesData.earned, ...badgesData.unearned]}
            categoryStats={badgesData.categories}
            onBadgeClick={handleBadgeClick}
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && badgesData && badgesData.earned.length === 0 && badgesData.unearned.length === 0 && (
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="py-12 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
              <p className="text-lg font-medium text-muted-foreground dark:text-slate-300">No badges available</p>
              <p className="text-sm text-muted-foreground dark:text-slate-400">Start completing activities to earn badges</p>
            </CardContent>
          </Card>
        )}

        {/* Motivational Message */}
        {!isLoading && !error && badgesData && stats.earned > 0 && (
          <Card className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Star className="h-5 w-5" />
                Keep Going!
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                {stats.percentage >= 75
                  ? "Amazing progress! You're a badge collecting master! 🏆"
                  : stats.percentage >= 50
                  ? "Great work! You're more than halfway there! 💪"
                  : stats.percentage >= 25
                  ? "Good start! Keep earning badges to unlock more achievements! 🌟"
                  : "Start your journey! Complete activities to earn your first badges! 🚀"}
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </StudentLayout>
  )
}
