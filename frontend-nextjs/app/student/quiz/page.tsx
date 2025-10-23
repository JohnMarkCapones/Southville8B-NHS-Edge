"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Play,
  Trophy,
  Clock,
  BookOpen,
  User,
  Calendar,
  Search,
  AlertCircle,
  Brain,
  Zap,
  Eye,
} from "lucide-react"
import StudentLayout from "@/components/student/student-layout"
import { quizApi } from "@/lib/api/endpoints"
import { useToast } from "@/hooks/use-toast"
import type { AvailableQuiz, QuizStatus } from "@/lib/api/types"
import { getQuizAccessStatus, getTimeUntilQuizEvent } from "@/lib/utils/quiz-validation"
import { format, formatDistanceToNow } from "date-fns"

export default function StudentQuizPage() {
  const router = useRouter()
  const { toast } = useToast()

  // State
  const [quizzes, setQuizzes] = useState<AvailableQuiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch available quizzes
  useEffect(() => {
    fetchQuizzes()
  }, [selectedSubject, currentPage])

  const fetchQuizzes = async () => {
    setIsLoading(true)
    try {
      const filters: any = {
        page: currentPage,
        limit: 10,
      }

      if (selectedSubject !== "all") {
        filters.subject_id = selectedSubject
      }

      const response = await quizApi.student.getAvailableQuizzes(filters)
      setQuizzes(response.data)
      setTotalPages(response.pagination.totalPages)
    } catch (error) {
      console.error("Failed to fetch quizzes:", error)
      toast({
        title: "Error",
        description: "Failed to load quizzes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter quizzes by search
  const filteredQuizzes = quizzes.filter((quiz) => {
    if (searchQuery) {
      return quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  // Group quizzes by status
  const activeQuizzes = filteredQuizzes.filter(
    (q) => getQuizAccessStatus(q) === "active"
  )
  const upcomingQuizzes = filteredQuizzes.filter(
    (q) => getQuizAccessStatus(q) === "upcoming"
  )
  const expiredQuizzes = filteredQuizzes.filter(
    (q) => getQuizAccessStatus(q) === "expired"
  )

  // Handle quiz start
  const handleStartQuiz = (quizId: string) => {
    const quiz = quizzes.find((q) => q.quiz_id === quizId)
    if (!quiz) return

    const status = getQuizAccessStatus(quiz)

    if (status === "expired") {
      toast({
        title: "Quiz Expired",
        description: "This quiz is no longer available.",
        variant: "destructive",
      })
      return
    }

    if (status === "upcoming") {
      toast({
        title: "Quiz Not Started",
        description: "This quiz hasn't started yet.",
        variant: "destructive",
      })
      return
    }

    // Navigate to quiz taking page
    router.push(`/student/quiz/${quizId}`)
  }

  // Get difficulty badge color
  const getDifficultyColor = (difficulty?: string) => {
    if (!difficulty) return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"

    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  // Format time remaining
  const formatTimeRemaining = (quiz: AvailableQuiz) => {
    const { untilEnd } = getTimeUntilQuizEvent(quiz)
    if (untilEnd === null) return "No deadline"
    if (untilEnd < 0) return "Expired"

    const hours = Math.floor(untilEnd / (1000 * 60 * 60))
    const minutes = Math.floor((untilEnd % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h left`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m left`
    }
    return `${minutes}m left`
  }

  // Loading skeleton
  if (isLoading && quizzes.length === 0) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
          <div className="container mx-auto max-w-7xl space-y-6">
            {/* Header Skeleton */}
            <Card className="border-2 border-indigo-200/50 dark:border-indigo-700/50">
              <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
            </Card>

            {/* Quiz Skeletons */}
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
          <div className="relative p-4 sm:p-6 lg:p-8 text-white">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30 shadow-2xl">
                <Brain className="w-6 h-6 sm:w-8 lg:w-10 sm:h-8 lg:h-10" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold">Quiz Center</h1>
                <p className="text-indigo-100 dark:text-indigo-200 text-sm sm:text-lg lg:text-xl">
                  Test your knowledge and track your progress
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="container mx-auto max-w-7xl">
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search quizzes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Subject Filter */}
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {/* TODO: Fetch subjects from API */}
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Refresh Button */}
                  <Button
                    onClick={fetchQuizzes}
                    variant="outline"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Refresh"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="active" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-white/95 dark:bg-slate-800/95">
                <TabsTrigger value="active" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Active ({activeQuizzes.length})
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Upcoming ({upcomingQuizzes.length})
                </TabsTrigger>
                <TabsTrigger value="expired" className="gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Expired ({expiredQuizzes.length})
                </TabsTrigger>
              </TabsList>

              {/* Active Quizzes */}
              <TabsContent value="active" className="space-y-4">
                {activeQuizzes.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Active Quizzes</h3>
                      <p className="text-muted-foreground">
                        Check back later for new quizzes from your teachers.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  activeQuizzes.map((quiz) => (
                    <Card
                      key={quiz.quiz_id}
                      className="border-l-4 border-l-green-500 hover:shadow-lg transition-all"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          {/* Quiz Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold">{quiz.title}</h3>
                              <Badge className="bg-green-500 text-white">ACTIVE</Badge>
                            </div>

                            {quiz.description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {quiz.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              {quiz.subject_id && (
                                <span className="flex items-center gap-1">
                                  <BookOpen className="w-4 h-4" />
                                  Subject
                                </span>
                              )}
                              {quiz.time_limit && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {quiz.time_limit} minutes
                                </span>
                              )}
                              {quiz.total_points && (
                                <span className="flex items-center gap-1">
                                  <Trophy className="w-4 h-4" />
                                  {quiz.total_points} points
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Time & Actions */}
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                {formatTimeRemaining(quiz)}
                              </div>
                              {quiz.end_date && (
                                <div className="text-xs text-muted-foreground">
                                  Due {format(new Date(quiz.end_date), "MMM d, h:mm a")}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // TODO: Preview quiz
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-green-500 to-emerald-600"
                                onClick={() => handleStartQuiz(quiz.quiz_id)}
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Start Quiz
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Upcoming Quizzes */}
              <TabsContent value="upcoming" className="space-y-4">
                {upcomingQuizzes.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Upcoming Quizzes</h3>
                      <p className="text-muted-foreground">
                        No scheduled quizzes at the moment.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  upcomingQuizzes.map((quiz) => (
                    <Card
                      key={quiz.quiz_id}
                      className="border-l-4 border-l-blue-500 opacity-75"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold">{quiz.title}</h3>
                          <Badge className="bg-blue-500 text-white">UPCOMING</Badge>
                        </div>

                        {quiz.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {quiz.description}
                          </p>
                        )}

                        {quiz.start_date && (
                          <div className="text-sm text-blue-600 dark:text-blue-400">
                            Starts {format(new Date(quiz.start_date), "MMM d, yyyy 'at' h:mm a")}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Expired Quizzes */}
              <TabsContent value="expired" className="space-y-4">
                {expiredQuizzes.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Expired Quizzes</h3>
                      <p className="text-muted-foreground">
                        You haven't missed any quizzes yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  expiredQuizzes.map((quiz) => (
                    <Card
                      key={quiz.quiz_id}
                      className="border-l-4 border-l-red-500 opacity-50"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold">{quiz.title}</h3>
                          <Badge className="bg-red-500 text-white">EXPIRED</Badge>
                        </div>

                        {quiz.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {quiz.description}
                          </p>
                        )}

                        {quiz.end_date && (
                          <div className="text-sm text-red-600 dark:text-red-400">
                            Expired {formatDistanceToNow(new Date(quiz.end_date), { addSuffix: true })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
