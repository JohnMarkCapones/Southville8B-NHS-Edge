"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import {
  Play,
  Users,
  Trophy,
  Target,
  BookOpen,
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  Timer,
  Brain,
  Zap,
  Eye,
  RotateCcw,
  User,
  Clock,
  Bell,
  Mail,
} from "lucide-react"
import StudentLayout from "@/components/student/student-layout"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function QuizPage() {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  // Initialize to null to avoid hydration mismatch - will be set on client
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [showQuizNotification, setShowQuizNotification] = useState(true)
  const [instructionModalOpen, setInstructionModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const liveQuizzes = [
    {
      id: 1,
      title: "Mathematics - Quadratic Equations",
      subject: "Mathematics",
      teacher: "Ms. Garcia",
      duration: 45,
      timeLeft: 25,
      participants: 28,
      maxScore: 100,
      difficulty: "Medium",
      status: "live",
      instructions: "Solve all quadratic equation problems. Show your work for partial credit.",
      startedAt: new Date(Date.now() - 20 * 60 * 1000),
      endsAt: new Date(Date.now() + 25 * 60 * 1000),
    },
    {
      id: 2,
      title: "Science - Photosynthesis Process",
      subject: "Science",
      teacher: "Mr. Santos",
      duration: 30,
      timeLeft: 18,
      participants: 32,
      maxScore: 80,
      difficulty: "Easy",
      status: "live",
      instructions: "Answer questions about the photosynthesis process and its stages.",
      startedAt: new Date(Date.now() - 12 * 60 * 1000),
      endsAt: new Date(Date.now() + 18 * 60 * 1000),
    },
    {
      id: 3,
      title: "English - Grammar & Syntax",
      subject: "English",
      teacher: "Mrs. Johnson",
      duration: 40,
      timeLeft: 35,
      participants: 25,
      maxScore: 90,
      difficulty: "Hard",
      status: "live",
      instructions: "Complete grammar exercises and identify syntax errors.",
      startedAt: new Date(Date.now() - 5 * 60 * 1000),
      endsAt: new Date(Date.now() + 35 * 60 * 1000),
    },
    {
      id: 4,
      title: "History - World War II",
      subject: "History",
      teacher: "Mr. Davis",
      duration: 50,
      timeLeft: 42,
      participants: 30,
      maxScore: 120,
      difficulty: "Medium",
      status: "live",
      instructions: "Answer questions about major events and figures of WWII.",
      startedAt: new Date(Date.now() - 8 * 60 * 1000),
      endsAt: new Date(Date.now() + 42 * 60 * 1000),
    },
    {
      id: 5,
      title: "Physics - Newton's Laws",
      subject: "Physics",
      teacher: "Dr. Wilson",
      duration: 35,
      timeLeft: 0,
      participants: 22,
      maxScore: 85,
      difficulty: "Hard",
      status: "expired",
      instructions: "Apply Newton's laws to solve physics problems.",
      startedAt: new Date(Date.now() - 40 * 60 * 1000),
      endsAt: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: 6,
      title: "Chemistry - Periodic Table",
      subject: "Chemistry",
      teacher: "Ms. Brown",
      duration: 25,
      timeLeft: 10,
      participants: 27,
      maxScore: 75,
      difficulty: "Easy",
      status: "starting-soon",
      instructions: "Identify elements and their properties from the periodic table.",
      startedAt: new Date(Date.now() + 10 * 60 * 1000),
      endsAt: new Date(Date.now() + 35 * 60 * 1000),
    },
    {
      id: 7,
      title: "Biology - Cell Structure",
      subject: "Biology",
      teacher: "Mr. Taylor",
      duration: 30,
      timeLeft: 8,
      participants: 24,
      maxScore: 70,
      difficulty: "Medium",
      status: "starting-soon",
      instructions: "Label cell organelles and explain their functions.",
      startedAt: new Date(Date.now() + 8 * 60 * 1000),
      endsAt: new Date(Date.now() + 38 * 60 * 1000),
    },
    {
      id: 8,
      title: "Geography - Climate Zones",
      subject: "Geography",
      teacher: "Mrs. Anderson",
      duration: 40,
      timeLeft: 12,
      participants: 29,
      maxScore: 95,
      difficulty: "Medium",
      status: "starting-soon",
      instructions: "Identify different climate zones and their characteristics.",
      startedAt: new Date(Date.now() + 12 * 60 * 1000),
      endsAt: new Date(Date.now() + 52 * 60 * 1000),
    },
    {
      id: 9,
      title: "Computer Science - Algorithms",
      subject: "Computer Science",
      teacher: "Dr. Lee",
      duration: 60,
      timeLeft: 9,
      participants: 18,
      maxScore: 150,
      difficulty: "Hard",
      status: "starting-soon",
      instructions: "Solve algorithmic problems and analyze time complexity.",
      startedAt: new Date(Date.now() + 9 * 60 * 1000),
      endsAt: new Date(Date.now() + 69 * 60 * 1000),
    },
    {
      id: 10,
      title: "Art History - Renaissance Period",
      subject: "Art",
      teacher: "Ms. Martinez",
      duration: 35,
      timeLeft: 11,
      participants: 21,
      maxScore: 80,
      difficulty: "Easy",
      status: "starting-soon",
      instructions: "Identify Renaissance artworks and their historical context.",
      startedAt: new Date(Date.now() + 11 * 60 * 1000),
      endsAt: new Date(Date.now() + 46 * 60 * 1000),
    },
  ]

  const scheduledQuizzes = [
    {
      id: 3,
      title: "English - Literature Analysis",
      subject: "English",
      teacher: "Mrs. Cruz",
      scheduledDate: "2024-02-25",
      scheduledTime: "10:00 AM",
      duration: 60,
      maxScore: 100,
      difficulty: "Hard",
      status: "scheduled",
      instructions: "Analyze the given literary passages and answer comprehension questions.",
      reminderSet: true,
    },
    {
      id: 4,
      title: "Filipino - Gramatika at Panitikan",
      subject: "Filipino",
      teacher: "Ms. Reyes",
      scheduledDate: "2024-02-26",
      scheduledTime: "2:00 PM",
      duration: 40,
      maxScore: 75,
      difficulty: "Medium",
      status: "scheduled",
      instructions: "Sumagot sa mga tanong tungkol sa gramatika at panitikang Filipino.",
      reminderSet: false,
    },
  ]

  const practiceQuizzes = [
    {
      id: 5,
      title: "Math Practice - Algebra Basics",
      subject: "Mathematics",
      difficulty: "Easy",
      questions: 15,
      estimatedTime: 20,
      maxScore: 75,
      status: "practice",
      hasHints: true,
      hasExplanations: true,
      attempts: 3,
      bestScore: 68,
    },
    {
      id: 6,
      title: "Science Review - Chemistry Fundamentals",
      subject: "Science",
      difficulty: "Medium",
      questions: 20,
      estimatedTime: 25,
      maxScore: 100,
      status: "practice",
      hasHints: true,
      hasExplanations: true,
      attempts: 1,
      bestScore: 85,
    },
  ]

  const quizHistory = [
    {
      id: 7,
      title: "Mathematics - Linear Equations",
      subject: "Mathematics",
      teacher: "Ms. Garcia",
      completedDate: "2024-02-20",
      score: 92,
      maxScore: 100,
      timeSpent: 35,
      status: "completed",
      grade: "A",
      canReview: true,
      feedback: "Excellent work! Strong understanding of linear equations.",
    },
    {
      id: 8,
      title: "Science - Cell Structure",
      subject: "Science",
      teacher: "Mr. Santos",
      completedDate: "2024-02-18",
      score: 78,
      maxScore: 100,
      timeSpent: 28,
      status: "completed",
      grade: "B+",
      canReview: true,
      feedback: "Good understanding. Review mitochondria functions for improvement.",
    },
    {
      id: 9,
      title: "English - Grammar Quiz",
      subject: "English",
      teacher: "Mrs. Cruz",
      completedDate: "2024-02-15",
      score: 88,
      maxScore: 100,
      timeSpent: 22,
      status: "completed",
      grade: "A-",
      canReview: false,
      feedback: "Well done! Minor errors in complex sentence structures.",
    },
  ]

  const quizStats = {
    totalQuizzes: quizHistory.length + liveQuizzes.length + scheduledQuizzes.length,
    averageScore: Math.round(
      quizHistory.reduce((sum, quiz) => sum + (quiz.score / quiz.maxScore) * 100, 0) / quizHistory.length,
    ),
    bestSubject: "Mathematics",
    totalTimeSpent: quizHistory.reduce((sum, quiz) => sum + quiz.timeSpent, 0),
    streak: 5,
  }

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date()
    const diff = endTime.getTime() - now.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (diff <= 0) return "00:00"
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const getDifficultyColor = (difficulty: string) => {
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

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-green-600 dark:text-green-400"
    if (grade.startsWith("B")) return "text-blue-600 dark:text-blue-400"
    if (grade.startsWith("C")) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const [showContactDialog, setShowContactDialog] = useState(false)
  const [selectedExpiredQuiz, setSelectedExpiredQuiz] = useState<any>(null)

  const handleJoinQuiz = (quizId: number) => {
    const quiz = liveQuizzes.find((q) => q.id === quizId)
    if (quiz?.status === "expired") {
      setSelectedExpiredQuiz(quiz)
      setShowContactDialog(true)
      return
    }

    if (quizId === 2) {
      // Science Photosynthesis -> Quiz 2 (continuous scroll format)
      router.push(`/student/quiz/2`)
    } else if (quizId === 3) {
      // English Grammar -> Quiz 3 (hybrid format)
      router.push(`/student/quiz/3`)
    } else {
      // Default routing for other quizzes
      router.push(`/student/quiz/${quizId}`)
    }
  }

  return (
    <StudentLayout>
      <Dialog open={showQuizNotification} onOpenChange={setShowQuizNotification}>
        <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-2 border-indigo-200/50 dark:border-indigo-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-lg"></div>
          <div className="relative">
            <DialogHeader className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                🚨 Incoming Quiz Alert!
              </DialogTitle>
              {/* Changed from DialogDescription to div to avoid invalid HTML nesting (<p> cannot contain <div>) */}
              <div className="text-base text-slate-700 dark:text-slate-300 space-y-3">
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-indigo-200/30 dark:border-indigo-700/30">
                  <div className="font-semibold text-indigo-700 dark:text-indigo-300">
                    Mathematics - Quadratic Equations
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Starting in 5 minutes</div>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      <Timer className="w-3 h-3 mr-1" />
                      45 min
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      <Trophy className="w-3 h-3 mr-1" />
                      100 pts
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Get ready! Make sure you have a stable internet connection and a quiet environment.
                </div>
              </div>
            </DialogHeader>
            <DialogFooter className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowQuizNotification(false)}
                className="flex-1 border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              >
                Remind Later
              </Button>
              <Button
                onClick={() => setShowQuizNotification(false)}
                className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg"
              >
                <Zap className="w-4 h-4 mr-2" />
                Get Ready!
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/30 rounded-full blur-xl animate-pulse"></div>
            <div
              className="absolute bottom-10 right-10 w-24 h-24 bg-white/25 rounded-full blur-lg animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/20 rounded-full blur-md animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute top-20 right-1/4 w-20 h-20 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 rounded-full blur-lg animate-bounce"
              style={{ animationDelay: "0.5s", animationDuration: "3s" }}
            ></div>
            <div
              className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-br from-green-300/20 to-blue-300/20 rounded-full blur-md animate-bounce"
              style={{ animationDelay: "1.5s", animationDuration: "4s" }}
            ></div>
          </div>

          <div className="relative p-4 sm:p-6 lg:p-8 text-white">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30 shadow-2xl hover:scale-105 transition-transform duration-300">
                <Brain className="w-6 h-6 sm:w-8 lg:w-10 sm:h-8 lg:h-10 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Quiz Center
                </h1>
                <p className="text-indigo-100 dark:text-indigo-200 text-sm sm:text-lg lg:text-xl font-medium">
                  Test your knowledge and track your progress
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
          <div className="container mx-auto p-2 sm:p-4 lg:p-6 max-w-7xl">
            <Tabs defaultValue="live" className="space-y-6 lg:space-y-8">
              <div className="flex justify-center">
                <TooltipProvider>
                  <TabsList className="grid w-full max-w-4xl grid-cols-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-2 border-indigo-200/40 dark:border-indigo-700/40 shadow-2xl rounded-3xl p-2 sm:p-3 hover:shadow-3xl transition-all duration-500 h-16 sm:h-20">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger
                          value="live"
                          className="flex items-center gap-1 sm:gap-3 rounded-2xl px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:via-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/30 data-[state=active]:scale-105 hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          <div className="relative">
                            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-ping data-[state=active]:bg-white"></div>
                          </div>
                          <span className="hidden sm:inline">Live Quizzes</span>
                          <Badge className="hidden sm:flex bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs px-1 sm:px-2 py-1 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                            {liveQuizzes.filter((q) => q.status === "live").length}
                          </Badge>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="sm:hidden">
                        <p>Live Quizzes ({liveQuizzes.filter((q) => q.status === "live").length})</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger
                          value="scheduled"
                          className="flex items-center gap-1 sm:gap-3 rounded-2xl px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 data-[state=active]:scale-105 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="hidden sm:inline">Scheduled</span>
                          <Badge className="hidden sm:flex bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-xs px-1 sm:px-2 py-1 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                            {liveQuizzes.filter((q) => q.status === "starting-soon").length}
                          </Badge>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="sm:hidden">
                        <p>Scheduled Quizzes ({liveQuizzes.filter((q) => q.status === "starting-soon").length})</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger
                          value="practice"
                          className="flex items-center gap-1 sm:gap-3 rounded-2xl px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:via-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 data-[state=active]:scale-105 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="hidden sm:inline">Practice</span>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="sm:hidden">
                        <p>Practice Quizzes</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger
                          value="history"
                          className="flex items-center gap-1 sm:gap-3 rounded-2xl px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:via-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 data-[state=active]:scale-105 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="hidden sm:inline">History</span>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="sm:hidden">
                        <p>Quiz History</p>
                      </TooltipContent>
                    </Tooltip>
                  </TabsList>
                </TooltipProvider>
              </div>

              {/* Live Quizzes Tab */}
              <TabsContent value="live" className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 rounded-3xl p-6 sm:p-8 border-2 border-blue-200/50 dark:border-blue-800/50 shadow-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 dark:text-blue-200">Live Quizzes</h2>
                    <div className="hidden sm:flex gap-3">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-2 text-base font-semibold shadow-lg"
                      >
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-ping"></div>
                        {liveQuizzes.filter((q) => q.status === "live").length} Live Now
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-4 py-2 text-base font-semibold shadow-lg"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        {liveQuizzes.filter((q) => q.status === "starting-soon").length} Starting Soon
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {liveQuizzes.map((quiz) => {
                      const timeRemaining =
                        quiz.status === "live" ? getTimeRemaining(quiz.endsAt) : `${quiz.timeLeft} min`
                      const isStartingSoon = quiz.status === "starting-soon"
                      const isExpired = quiz.status === "expired"

                      return (
                        <Card
                          key={quiz.id}
                          className={`${
                            isExpired
                              ? "border-l-red-500 bg-gradient-to-r from-red-50/50 to-indigo-50/30 dark:from-red-900/20 dark:to-indigo-900/10"
                              : isStartingSoon
                                ? "border-l-purple-500 bg-gradient-to-r from-purple-50/50 to-indigo-50/30 dark:from-purple-900/20 dark:to-indigo-900/10"
                                : "border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-900/20 dark:to-indigo-900/10"
                          } backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border border-opacity-50 group`}
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                              {/* Left Section - Quiz Info */}
                              <div className="flex-1 min-w-0 w-full sm:w-auto">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 truncate">
                                    {quiz.title}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      className={`${
                                        isExpired
                                          ? "bg-red-500 text-white animate-pulse"
                                          : isStartingSoon
                                            ? "bg-blue-500 text-white animate-pulse"
                                            : "bg-green-500 text-white animate-pulse"
                                      } px-2 py-1 text-xs font-semibold`}
                                    >
                                      {isExpired ? (
                                        <>
                                          <AlertCircle className="w-3 h-3 mr-1" />
                                          <span className="hidden xs:inline">EXPIRED</span>
                                          <span className="xs:hidden">EXPIRED</span>
                                        </>
                                      ) : isStartingSoon ? (
                                        <>
                                          <Clock className="w-3 h-3 mr-1" />
                                          <span className="hidden xs:inline">STARTING SOON</span>
                                          <span className="xs:hidden">SOON</span>
                                        </>
                                      ) : (
                                        <>
                                          <Play className="w-3 h-3 mr-1" />
                                          LIVE
                                        </>
                                      )}
                                    </Badge>
                                    <Badge
                                      className={`${getDifficultyColor(quiz.difficulty)} px-2 py-1 text-xs font-semibold`}
                                    >
                                      {quiz.difficulty}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="truncate">{quiz.subject}</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="truncate">{quiz.teacher}</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {quiz.participants} students
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {quiz.maxScore} pts
                                  </span>
                                </div>
                              </div>

                              {/* Center Section - Time Info */}
                              <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 sm:gap-2 px-2 sm:px-4 w-full sm:w-auto">
                                <div className="flex sm:flex-col items-center gap-2 sm:gap-1">
                                  <div
                                    className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                                      isExpired
                                        ? "text-red-600 dark:text-red-400"
                                        : isStartingSoon
                                          ? "text-blue-600 dark:text-blue-400"
                                          : "text-green-600 dark:text-green-400"
                                    }`}
                                  >
                                    {isExpired ? "EXPIRED" : timeRemaining}
                                  </div>
                                  <div className="text-xs text-muted-foreground text-center">
                                    {isExpired ? "" : isStartingSoon ? "Starts in" : "Time left"}
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground">Duration: {quiz.duration} min</div>
                              </div>

                              {/* Right Section - Action Button */}
                              <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                                <Button
                                  onClick={() => handleJoinQuiz(quiz.id)}
                                  className={`${
                                    isExpired
                                      ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                                      : isStartingSoon
                                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                        : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                  } text-white shadow-lg group-hover:shadow-xl transition-all duration-300 px-3 sm:px-6 py-2 text-sm flex-1 sm:flex-none`}
                                >
                                  {isExpired ? (
                                    <>
                                      <AlertCircle className="w-4 h-4 mr-2" />
                                      <span className="hidden xs:inline">Time Expired</span>
                                      <span className="xs:hidden">Expired</span>
                                    </>
                                  ) : isStartingSoon ? (
                                    <>
                                      <Bell className="w-4 h-4 mr-2" />
                                      <span className="hidden xs:inline">Get Ready</span>
                                      <span className="xs:hidden">Ready</span>
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-4 h-4 mr-2" />
                                      <span className="hidden xs:inline">Join Now</span>
                                      <span className="xs:hidden">Join</span>
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs hover:bg-slate-50 dark:hover:bg-slate-800 bg-transparent flex-1 sm:flex-none"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  <span className="hidden xs:inline">Preview</span>
                                  <span className="xs:hidden">View</span>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* Scheduled Quizzes Tab */}
              <TabsContent value="scheduled" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Upcoming Quizzes</h2>
                  <Badge variant="secondary">{scheduledQuizzes.length} Scheduled</Badge>
                </div>

                <div className="grid gap-6">
                  {scheduledQuizzes.map((quiz) => (
                    <Card
                      key={quiz.id}
                      className="border-l-4 border-l-blue-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold">{quiz.title}</h3>
                              <Badge className="bg-blue-500 text-white">
                                <Calendar className="w-3 h-3 mr-1" />
                                SCHEDULED
                              </Badge>
                              <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span>
                                {quiz.subject} • {quiz.teacher}
                              </span>
                              <span>
                                {quiz.duration} minutes • {quiz.maxScore} points
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{quiz.instructions}</p>
                          </div>

                          <div className="text-right">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="font-bold text-blue-600 dark:text-blue-400">{quiz.scheduledDate}</div>
                              <div className="text-sm text-blue-500">{quiz.scheduledTime}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-2">
                            {quiz.reminderSet ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Reminder Set
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                No Reminder
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Calendar className="w-4 h-4 mr-2" />
                              {quiz.reminderSet ? "Edit Reminder" : "Set Reminder"}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Practice Quizzes Tab */}
              <TabsContent value="practice" className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-xl sm:text-2xl font-bold">Practice Quizzes</h2>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  {practiceQuizzes.map((quiz) => (
                    <Card
                      key={quiz.id}
                      className="border-l-4 border-l-purple-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold">{quiz.title}</h3>
                              <Badge className="bg-purple-500 text-white">
                                <Target className="w-3 h-3 mr-1" />
                                PRACTICE
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span>{quiz.subject}</span>
                              <span>{quiz.questions} questions</span>
                              <span>~{quiz.estimatedTime} min</span>
                            </div>
                          </div>
                          <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span>Best Score:</span>
                            <span className="font-bold">
                              {quiz.bestScore}/{quiz.maxScore}
                            </span>
                          </div>
                          <Progress value={(quiz.bestScore / quiz.maxScore) * 100} className="h-2" />
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Attempts: {quiz.attempts}</span>
                            {quiz.hasHints && (
                              <span className="flex items-center">
                                <Brain className="w-3 h-3 mr-1" />
                                Hints Available
                              </span>
                            )}
                            {quiz.hasExplanations && (
                              <span className="flex items-center">
                                <BookOpen className="w-3 h-3 mr-1" />
                                Explanations
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                            <Play className="w-4 h-4 mr-2" />
                            Start Practice
                          </Button>
                          {quiz.attempts > 0 && (
                            <Button variant="outline" size="sm">
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Retry
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Quiz History</h2>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search quizzes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  {quizHistory.map((quiz) => (
                    <Card key={quiz.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{quiz.title}</h3>
                              <Badge variant="outline" className={getGradeColor(quiz.grade)}>
                                Grade: {quiz.grade}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <span>
                                {quiz.subject} • {quiz.teacher}
                              </span>
                              <span>Completed: {quiz.completedDate}</span>
                              <span>Time: {quiz.timeSpent} minutes</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{quiz.feedback}</p>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold mb-1">
                              {quiz.score}/{quiz.maxScore}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {Math.round((quiz.score / quiz.maxScore) * 100)}%
                            </div>
                            <div className="flex gap-2 mt-3">
                              {quiz.canReview && (
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Review
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Retake
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {showContactDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quiz Time Expired</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You can no longer join "{selectedExpiredQuiz?.title}" because the set time for joining has finished.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  window.location.href = `mailto:${selectedExpiredQuiz?.teacher?.toLowerCase().replace(/\s+/g, ".")}@southville8b.edu.ph?subject=Quiz Access Request - ${selectedExpiredQuiz?.title}`
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Teacher
              </Button>
              <Button variant="outline" onClick={() => setShowContactDialog(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  )
}
