"use client"

import { useState, useEffect, use } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BarChart3,
  Download,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  TrendingUp,
  ArrowLeft,
  Share,
  Target,
  BookOpen,
  Zap,
  GraduationCap,
  PieChart,
  Activity,
  Calendar,
  AlertCircle,
  Edit3,
} from "lucide-react"
import { useRouter } from "next/navigation"

// Default empty quiz data structure
const defaultQuizData = {
  id: "",
  title: "Loading...",
  subject: "",
  grade: "",
  questions: 0,
  duration: 0,
  totalAttempts: 0,
  avgScore: 0,
  created: "",
  dueDate: "",
  status: "draft",
}

// Helper function to clean fill-in-blank question display
const formatQuestionText = (questionText: string): string => {
  if (!questionText) return ""
  // Replace {{blank_0}}, {{blank_1}}, etc. with visual placeholders
  return questionText.replace(/{{blank_\d+}}/g, "_______")
}

// Helper function to format student answers (especially for fill-in-blank)
const formatStudentAnswer = (answer: any): string => {
  if (!answer) return "No answer provided"

  // If it's an array (fill-in-blank or checkbox), format it nicely
  if (Array.isArray(answer)) {
    return answer.map((item, idx) => `Blank ${idx + 1}: "${item}"`).join(", ")
  }

  // If it's an object, try to stringify it nicely
  if (typeof answer === "object") {
    try {
      return JSON.stringify(answer, null, 2)
    } catch {
      return String(answer)
    }
  }

  // Otherwise, just return as string
  return String(answer)
}

export default function QuizResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const { id: quizId } = use(params)

  // State
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState(0)
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [classFilter, setClassFilter] = useState("all") // all, passed, failed
  const [sortBy, setSortBy] = useState("name") // name, score, performance

  // Backend state
  const [isLoading, setIsLoading] = useState(false)
  const [backendError, setBackendError] = useState<Error | null>(null)
  const [quizData, setQuizData] = useState<any>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [questionAnalytics, setQuestionAnalytics] = useState<any>(null)
  const [studentPerformance, setStudentPerformance] = useState<any>(null)
  const [studentAnswers, setStudentAnswers] = useState<any>(null)
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false)

  // Backend integration: Load quiz data and analytics
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setBackendError(null)

      try {
        const { quizApi } = await import("@/lib/api/endpoints")

        // Load base quiz data first (to get all questions)
        const quiz = await quizApi.teacher.getQuizById(quizId)
        setQuizData(quiz)

        // Then load analytics data in parallel
        const [quizAnalytics, questionStats, studentStats] = await Promise.all([
          quizApi.analytics.getQuizAnalytics(quizId).catch(() => null),
          quizApi.analytics.getQuestionAnalytics(quizId).catch(() => null),
          quizApi.analytics.getStudentPerformance(quizId).catch(() => null),
        ])

        setAnalyticsData(quizAnalytics)
        setQuestionAnalytics(questionStats)
        setStudentPerformance(studentStats)

        toast({
          title: "Data Loaded",
          description: "Quiz and analytics loaded successfully.",
        })
      } catch (error) {
        console.error("Error loading data:", error)
        setBackendError(error as Error)
        toast({
          title: "Failed to Load Data",
          description: "Could not load quiz data. Check your connection.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [quizId, toast])

  // Backend integration: Load student answers when student is selected
  useEffect(() => {
    const loadStudentAnswers = async () => {
      // Only fetch if we have student performance data
      if (!studentPerformance?.students || studentPerformance.students.length === 0 || selectedStudent >= studentPerformance.students.length) {
        setStudentAnswers(null)
        return
      }

      const student = studentPerformance.students[selectedStudent]
      if (!student || !student.student_id) {
        setStudentAnswers(null)
        return
      }

      setIsLoadingAnswers(true)
      try {
        const { quizApi } = await import("@/lib/api/endpoints")
        const answers = await quizApi.analytics.getStudentAnswers(quizId, student.student_id)
        setStudentAnswers(answers)
      } catch (error) {
        console.error("Error loading student answers:", error)
        setStudentAnswers(null)
        toast({
          title: "Failed to Load Answers",
          description: "Could not load student answers.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingAnswers(false)
      }
    }

    loadStudentAnswers()
  }, [selectedStudent, studentPerformance, quizId, toast])

  // Backend integration: Transform analytics data for UI
  const transformedQuizData = quizData ? {
    ...defaultQuizData,
    id: quizId,
    title: quizData.title || analyticsData?.quizTitle || "Quiz Results",
    subject: quizData.subject?.subject_name || "",
    grade: quizData.grade_level || "",
    questions: quizData.questions?.length || 0,
    duration: quizData.time_limit || 0,
    totalAttempts: analyticsData?.totalAttempts || 0,
    avgScore: analyticsData?.averageScore || 0,
    created: quizData.created_at || "",
    dueDate: quizData.due_date || "",
    status: quizData.status || "draft",
  } : { ...defaultQuizData, id: quizId }

  // Transform questions: Use base quiz data, augment with analytics
  const transformedQuestions = quizData?.questions ? quizData.questions.map((q: any, index: number) => {
    // Find matching analytics data for this question (by question_id)
    const analytics = questionAnalytics?.questions?.find((qa: any) => qa.question_id === q.question_id)

    return {
      id: q.question_id, // UUID for internal use
      questionNumber: index + 1, // Display number (Question 1, Question 2, etc.)
      question: q.question_text || `Question ${index + 1}`,
      type: q.question_type || "Multiple Choice",
      correctAnswer: q.correct_answer,
      options: q.options || [],
      difficulty: q.difficulty || "medium",
      // Use analytics if available, otherwise default to 0
      avgScore: analytics?.correct_rate || 0,
      correctCount: analytics?.correct_attempts || 0,
      totalAttempts: analytics?.total_attempts || 0,
      timeSpent: analytics?.average_time_spent
        ? `${Math.floor(analytics.average_time_spent / 60)}:${String(analytics.average_time_spent % 60).padStart(2, '0')}`
        : "0:00",
      needsGrading: q.question_type === "essay" || q.question_type === "short_answer",
      ungradedCount: 0, // Would need additional API call to get ungraded count
    }
  }) : []

  const transformedStudents = studentPerformance?.students ? studentPerformance.students.map((s: any) => {
    const timeInSeconds = s.time_spent || 0

    return {
      id: s.student_id,
      name: s.student_name || 'Unknown Student',
      email: s.student_email || "",
      avatar: "/placeholder.svg?height=40&width=40",
      score: s.percentage || 0,
      totalQuestions: s.max_score || 0,
      correctAnswers: Math.round((s.score / s.max_score) * s.max_score) || 0,
      attempts: s.attempt_number || 1,
      attemptCount: s.attempt_number || 1, // Used for attempt patterns analysis
      timeSpent: timeInSeconds, // Time in seconds (for calculations)
      timeSpentDisplay: timeInSeconds ? `${Math.floor(timeInSeconds / 60)}m` : "0m", // Time display string
      completedAt: s.submitted_at ? new Date(s.submitted_at).toLocaleString() : "Not completed",
      status: s.status || "completed",
      answers: [], // Detailed answers not available in performance summary
    }
  }) : []

  const totalUngradedEssays = transformedQuestions
    .filter((q) => q.needsGrading)
    .reduce((sum, q) => sum + (q.ungradedCount || 0), 0)

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "questions", label: "Questions", icon: FileText },
    { id: "class", label: "Class", icon: GraduationCap },
    { id: "students", label: "Students", icon: Users },
  ]

  const filteredStudents = transformedStudents.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      classFilter === "all" ||
      (classFilter === "passed" && student.score >= 75) ||
      (classFilter === "failed" && student.score < 75)
    return matchesSearch && matchesFilter
  })

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case "score":
        return b.score - a.score
      case "performance":
        return b.correctAnswers - a.correctAnswers
      default:
        return a.name.localeCompare(b.name)
    }
  })

  const filteredQuestions = transformedQuestions.filter(
    (question) => filterDifficulty === "all" || question.difficulty.toLowerCase() === filterDifficulty,
  )

  const handleExport = (format: string) => {
    if (format === "pdf") {
      // Create PDF export
      const content = `
Quiz Results Report
==================
Quiz: ${transformedQuizData.title}
Subject: ${transformedQuizData.subject}
Grade: ${transformedQuizData.grade}
Total Attempts: ${transformedQuizData.totalAttempts}
Average Score: ${transformedQuizData.avgScore}%

Student Results:
${transformedStudents.map((student) => `${student.name}: ${student.score}% (${student.timeSpentDisplay})`).join("\n")}
      `

      const blob = new Blob([content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${transformedQuizData.title}_results.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (format === "csv") {
      // Create CSV export
      const headers = ["Student Name", "Score (%)", "Time Spent", "Attempts", "Completed At"]
      const csvContent = [
        headers.join(","),
        ...transformedStudents.map((student) =>
          [student.name, student.score, student.timeSpentDisplay, student.attempts, student.completedAt].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${transformedQuizData.title}_results.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const navigateStudent = (direction: "prev" | "next") => {
    if (direction === "prev" && selectedStudent > 0) {
      setSelectedStudent(selectedStudent - 1)
    } else if (direction === "next" && selectedStudent < filteredStudents.length - 1) {
      setSelectedStudent(selectedStudent + 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 lg:p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800 p-6 lg:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quizzes
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {transformedQuizData.title}
                </h1>
                <p className="text-blue-100 text-lg">Quiz Results & Analytics</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{transformedQuizData.totalAttempts} Attempts</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">{transformedQuizData.avgScore}% Avg Score</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">{transformedQuestions.length} Questions</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{transformedQuizData.duration}m Duration</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport("pdf")}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport("csv")}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              <Share className="w-4 h-4 mr-2" />
              Share Results
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {totalUngradedEssays > 0 && (
                <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-300 dark:border-red-700 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                          Essay Questions Need Grading
                        </h3>
                        <p className="text-red-700 dark:text-red-300 mb-4">
                          {totalUngradedEssays} essay submission{totalUngradedEssays !== 1 ? "s" : ""} from{" "}
                          {transformedQuestions.filter((q) => q.needsGrading).length} question
                          {transformedQuestions.filter((q) => q.needsGrading).length !== 1 ? "s" : ""} need your review to
                          complete the grading process.
                        </p>
                        <Button
                          onClick={() => router.push(`/teacher/quiz/${params.id}/grade`)}
                          className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Grade Essays Now
                        </Button>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold text-red-900 dark:text-red-100">{totalUngradedEssays}</div>
                        <p className="text-sm text-red-600 dark:text-red-400">Pending</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                      Total Attempts
                    </CardTitle>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-900 dark:text-green-100">{transformedQuizData.totalAttempts || 0}</div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">{transformedStudents.length || 0} students participated</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Average Score
                    </CardTitle>
                    <Award className="h-5 w-5 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{transformedQuizData.avgScore || 0}%</div>
                    <Progress value={transformedQuizData.avgScore || 0} className="mt-3 h-2" />
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">{transformedQuizData.avgScore >= 75 ? 'Above' : 'Below'} target (75%)</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      Avg. Time Spent
                    </CardTitle>
                    <Clock className="h-5 w-5 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                      {analyticsData?.averageTimeSpent ? `${Math.round(analyticsData.averageTimeSpent / 60)}m` : '0m'}
                    </div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">Average completion time</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Pass Rate
                    </CardTitle>
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{analyticsData?.passRate || 0}%</div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">Students scoring 75% or above</p>
                  </CardContent>
                </Card>
              </div>

              {/* Time Analysis Chart */}
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    Time Analysis
                  </CardTitle>
                  <CardDescription>Time spent distribution across students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      // Calculate time distribution from real student data
                      const totalStudents = transformedStudents.length || 1;
                      const timeRanges = [
                        { range: "0-15 min", min: 0, max: 15, count: 0, color: "bg-red-500" },
                        { range: "15-20 min", min: 15, max: 20, count: 0, color: "bg-orange-500" },
                        { range: "20-25 min", min: 20, max: 25, count: 0, color: "bg-yellow-500" },
                        { range: "25-30 min", min: 25, max: 30, count: 0, color: "bg-green-500" },
                        { range: "30+ min", min: 30, max: Infinity, count: 0, color: "bg-blue-500" },
                      ];

                      // Count students in each time range
                      transformedStudents.forEach(student => {
                        const timeInMinutes = student.timeSpent ? student.timeSpent / 60 : 0;
                        const range = timeRanges.find(r => timeInMinutes >= r.min && timeInMinutes < r.max);
                        if (range) range.count++;
                      });

                      return timeRanges.map((item) => {
                        const percentage = totalStudents > 0 ? (item.count / totalStudents) * 100 : 0;
                        return (
                          <div key={item.range} className="flex items-center gap-4">
                            <div className="w-20 text-sm font-medium text-slate-700 dark:text-slate-300">{item.range}</div>
                            <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-6 relative overflow-hidden">
                              <div
                                className={`${item.color} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                                style={{ width: `${Math.max(percentage, 5)}%` }}
                              >
                                <span className="text-white text-xs font-medium">{item.count}</span>
                              </div>
                            </div>
                            <div className="w-16 text-sm text-slate-600 dark:text-slate-400 text-right">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Question Difficulty Analysis */}
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-indigo-600" />
                    Question Difficulty Performance
                  </CardTitle>
                  <CardDescription>Average scores by question difficulty</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(() => {
                      // Calculate average correct rate for each difficulty level
                      const difficulties = ['easy', 'medium', 'hard'];
                      const difficultyData = difficulties.map(difficulty => {
                        const questions = transformedQuestions.filter(q => q.difficulty === difficulty);
                        const avgCorrectRate = questions.length > 0
                          ? questions.reduce((sum, q) => sum + (q.avgScore || 0), 0) / questions.length
                          : 0;
                        return { difficulty, avgCorrectRate, count: questions.length };
                      });

                      const easyData = difficultyData[0];
                      const mediumData = difficultyData[1];
                      const hardData = difficultyData[2];

                      return (
                        <>
                          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                            <div className="text-3xl font-bold text-green-700 dark:text-green-300 mb-2">
                              {easyData.avgCorrectRate.toFixed(1)}%
                            </div>
                            <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                              Easy Questions ({easyData.count})
                            </div>
                            <Progress value={easyData.avgCorrectRate} className="h-2" />
                          </div>
                          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800">
                            <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300 mb-2">
                              {mediumData.avgCorrectRate.toFixed(1)}%
                            </div>
                            <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                              Medium Questions ({mediumData.count})
                            </div>
                            <Progress value={mediumData.avgCorrectRate} className="h-2" />
                          </div>
                          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800">
                            <div className="text-3xl font-bold text-red-700 dark:text-red-300 mb-2">
                              {hardData.avgCorrectRate.toFixed(1)}%
                            </div>
                            <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                              Hard Questions ({hardData.count})
                            </div>
                            <Progress value={hardData.avgCorrectRate} className="h-2" />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Attempt Analysis */}
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-600" />
                    Attempt Patterns
                  </CardTitle>
                  <CardDescription>Student attempt behavior analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Attempts Distribution</h4>
                      <div className="space-y-3">
                        {(() => {
                          // Calculate attempt distribution from real student data
                          const totalStudents = transformedStudents.length || 1;
                          const oneAttempt = transformedStudents.filter(s => s.attemptCount === 1).length;
                          const twoAttempts = transformedStudents.filter(s => s.attemptCount === 2).length;
                          const threeOrMore = transformedStudents.filter(s => s.attemptCount >= 3).length;

                          const oneAttemptPct = totalStudents > 0 ? (oneAttempt / totalStudents) * 100 : 0;
                          const twoAttemptsPct = totalStudents > 0 ? (twoAttempts / totalStudents) * 100 : 0;
                          const threeOrMorePct = totalStudents > 0 ? (threeOrMore / totalStudents) * 100 : 0;

                          return (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">1 Attempt</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${oneAttemptPct}%` }}></div>
                                  </div>
                                  <span className="text-sm font-medium text-slate-900 dark:text-white">{oneAttempt} students</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">2 Attempts</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${twoAttemptsPct}%` }}></div>
                                  </div>
                                  <span className="text-sm font-medium text-slate-900 dark:text-white">{twoAttempts} students</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">3+ Attempts</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${threeOrMorePct}%` }}></div>
                                  </div>
                                  <span className="text-sm font-medium text-slate-900 dark:text-white">{threeOrMore} students</span>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Score Improvement</h4>
                      <div className="space-y-3">
                        {(() => {
                          // Calculate score improvement for students who retook the quiz
                          const studentsWithMultipleAttempts = transformedStudents.filter(s => s.attemptCount > 1);

                          if (studentsWithMultipleAttempts.length === 0) {
                            return (
                              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800">
                                <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                                  No retakes yet
                                </p>
                              </div>
                            );
                          }

                          // For now, show count of students who improved (score improvement tracking needs backend enhancement)
                          const avgImprovement = 0; // Would need historical attempt data from backend
                          const bestImprovement = 0; // Would need historical attempt data from backend

                          return (
                            <>
                              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                    Students with Retakes
                                  </span>
                                  <span className="text-lg font-bold text-green-800 dark:text-green-200">
                                    {studentsWithMultipleAttempts.length}
                                  </span>
                                </div>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  Total students who retook
                                </p>
                              </div>
                              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    Avg Attempts per Student
                                  </span>
                                  <span className="text-lg font-bold text-blue-800 dark:text-blue-200">
                                    {transformedStudents.length > 0
                                      ? (transformedStudents.reduce((sum, s) => sum + s.attemptCount, 0) / transformedStudents.length).toFixed(1)
                                      : '0'}
                                  </span>
                                </div>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Average across all students</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Score Distribution */}
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Score Distribution
                  </CardTitle>
                  <CardDescription>Performance breakdown by score ranges</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData?.scoreDistribution && analyticsData.scoreDistribution.length > 0 ? (
                      analyticsData.scoreDistribution
                        .filter((item: any) => item.count > 0)
                        .map((item: any, index: number) => {
                          const totalStudents = transformedStudents.length || 1;
                          const percentage = (item.count / totalStudents) * 100;
                          const rangeStart = parseInt(item.range.split('-')[0]);
                          const color = rangeStart >= 90 ? "bg-green-500" : rangeStart >= 80 ? "bg-blue-500" : rangeStart >= 70 ? "bg-yellow-500" : rangeStart >= 60 ? "bg-orange-500" : "bg-red-500";

                          return (
                            <div key={item.range} className="flex items-center gap-4">
                              <div className="w-20 text-sm font-medium text-slate-700 dark:text-slate-300">{item.range}%</div>
                              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-6 relative overflow-hidden">
                                <div
                                  className={`${color} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                                  style={{ width: `${Math.max(percentage, 5)}%` }}
                                >
                                  <span className="text-white text-xs font-medium">{item.count}</span>
                                </div>
                              </div>
                              <div className="w-16 text-sm text-slate-600 dark:text-slate-400 text-right">
                                {percentage.toFixed(1)}%
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <p className="text-center text-slate-500 dark:text-slate-400 py-8">No submission data yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Students with highest scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sortedStudents
                      .slice(0, 5)
                      .map((student, index) => (
                        <div
                          key={student.id}
                          className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                index === 0
                                  ? "bg-yellow-500"
                                  : index === 1
                                    ? "bg-gray-400"
                                    : index === 2
                                      ? "bg-amber-600"
                                      : "bg-slate-400"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                              <AvatarFallback>
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{student.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Completed in {student.timeSpentDisplay}
                              </p>
                            </div>
                          </div>
                          <div className="ml-auto text-right">
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{student.score}%</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {student.attempts} attempt{student.attempts > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === "questions" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger className="w-full sm:w-48 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Questions Analysis */}
              <div className="space-y-4">
                {filteredQuestions.length === 0 ? (
                  <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                    <CardContent className="p-12 text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        No Questions Found
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-4">
                        {transformedQuestions.length === 0
                          ? "This quiz doesn't have any questions yet, or the question data hasn't been loaded."
                          : "No questions match the selected difficulty filter."}
                      </p>
                      {transformedQuestions.length === 0 && (
                        <Button onClick={() => router.push(`/teacher/quiz/${quizId}/builder`)} className="mt-2">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Add Questions to Quiz
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  filteredQuestions.map((question) => (
                    <Card
                      key={question.id}
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-slate-900 dark:text-white mb-2">
                              Question {question.questionNumber}
                            </CardTitle>
                            <p className="text-slate-700 dark:text-slate-300 mb-3">{formatQuestionText(question.question)}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            >
                              {question.type}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`${
                                question.difficulty === "Easy"
                                  ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                  : question.difficulty === "Medium"
                                    ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                                    : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                              }`}
                            >
                              {question.difficulty}
                            </Badge>
                            {question.needsGrading && (
                              <Badge
                                variant="secondary"
                                className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                              >
                                {question.ungradedCount} Ungraded
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-slate-900 dark:text-white">{question.avgScore}%</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Average Score</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {question.needsGrading && (
                          <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-200 dark:border-red-800">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                <div>
                                  <p className="font-semibold text-red-900 dark:text-red-100">
                                    This question requires manual grading
                                  </p>
                                  <p className="text-sm text-red-700 dark:text-red-300">
                                    {question.ungradedCount} student submission{question.ungradedCount !== 1 ? "s" : ""}{" "}
                                    pending review
                                  </p>
                                </div>
                              </div>
                              <Button
                                onClick={() => router.push(`/teacher/quiz/${quizId}/grade?question=${question.id}`)}
                                className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Grade This Question
                              </Button>
                            </div>
                          </div>
                        )}

                        <Progress value={question.avgScore} className="h-3" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {question.correctCount}/{question.totalAttempts}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">Correct Answers</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{question.timeSpent}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">Avg Time Spent</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {((question.correctCount / question.totalAttempts) * 100).toFixed(1)}%
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">Success Rate</p>
                            </div>
                          </div>
                        </div>

                        {question.type === "Multiple Choice" && question.options && (
                          <div className="mt-4">
                            <p className="font-medium text-slate-900 dark:text-white mb-2">Answer Options:</p>
                            <div className="space-y-2">
                              {question.options.map((option, index) => (
                                <div
                                  key={index}
                                  className={`p-3 rounded-lg border ${
                                    option === question.correctAnswer
                                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                                      : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-700 dark:text-slate-300">{option}</span>
                                    {option === question.correctAnswer && (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "class" && (
            <div className="space-y-6">
              {/* Class Overview Header */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Class Performance</h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Detailed view of all student results across {transformedQuestions.length} questions
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport("pdf")}
                    className="bg-slate-50 dark:bg-slate-800"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport("csv")}
                    className="bg-slate-50 dark:bg-slate-800"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger className="w-32 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="passed">Passed (≥80%)</SelectItem>
                      <SelectItem value="failed">Failed (&lt;80%)</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Sort by Name</SelectItem>
                      <SelectItem value="score">Sort by Score</SelectItem>
                      <SelectItem value="performance">Sort by Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                      {" "}
                      {/* Minimum width to ensure proper layout */}
                      <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                          <tr>
                            <th className="text-left p-3 font-semibold text-slate-900 dark:text-white sticky left-0 bg-slate-50 dark:bg-slate-900 min-w-[60px]">
                              #
                            </th>
                            <th className="text-left p-3 font-semibold text-slate-900 dark:text-white sticky left-[60px] bg-slate-50 dark:bg-slate-900 min-w-[200px]">
                              Learner
                            </th>
                            <th className="text-left p-3 font-semibold text-slate-900 dark:text-white sticky left-[260px] bg-slate-50 dark:bg-slate-900 min-w-[100px]">
                              Points
                            </th>
                            {transformedQuestions.map((question, index) => (
                              <th
                                key={question.id}
                                className="text-center p-2 font-semibold text-slate-900 dark:text-white min-w-[70px] max-w-[70px]"
                              >
                                <div className="flex flex-col items-center">
                                  <span className="text-xs">Q{question.questionNumber}</span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                                    {question.totalAttempts > 0
                                      ? `${Math.round((question.correctCount / question.totalAttempts) * 100)}%`
                                      : '0%'}
                                  </span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sortedStudents.map((student, index) => (
                            <tr
                              key={student.id}
                              className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                            >
                              <td className="p-3 text-slate-600 dark:text-slate-400 font-medium sticky left-0 bg-white dark:bg-slate-800">
                                {index + 1}
                              </td>
                              <td className="p-3 sticky left-[60px] bg-white dark:bg-slate-800">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                                      {student.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                      {student.name}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Designer</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 sticky left-[260px] bg-white dark:bg-slate-800">
                                <div className="flex items-center gap-1">
                                  <Award className="w-3 h-3 text-yellow-500" />
                                  <span className="font-semibold text-slate-900 dark:text-white text-sm">
                                    {student.score}
                                  </span>
                                </div>
                              </td>
                              {transformedQuestions.map((question) => {
                                const answer = student.answers.find((a) => a.questionId === question.id)
                                return (
                                  <td key={question.id} className="p-2 text-center">
                                    <div className="flex justify-center">
                                      {answer?.isCorrect ? (
                                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </div>
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{sortedStudents.length}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Students</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-green-900 dark:text-green-100">
                          {sortedStudents.filter((s) => s.score >= 80).length}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">Passed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Award className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                          {sortedStudents.length > 0
                            ? Math.round(sortedStudents.reduce((acc, s) => acc + s.score, 0) / sortedStudents.length)
                            : 0}
                          %
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">Average</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <FileText className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                          {transformedQuestions.length}
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-400">Questions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === "students" && (
            <div className="space-y-6">
              {/* Search and Navigation */}
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Student Navigation */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateStudent("prev")}
                    disabled={selectedStudent === 0}
                    className="bg-slate-50 dark:bg-slate-800"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedStudent + 1} of {filteredStudents.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateStudent("next")}
                    disabled={selectedStudent === filteredStudents.length - 1}
                    className="bg-slate-50 dark:bg-slate-800"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Individual Student View */}
              {filteredStudents.length > 0 &&
                selectedStudent < filteredStudents.length &&
                filteredStudents[selectedStudent] && (
                  <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage
                              src={filteredStudents[selectedStudent]?.avatar || "/placeholder.svg"}
                              alt={filteredStudents[selectedStudent]?.name || "Student"}
                            />
                            <AvatarFallback className="text-lg">
                              {filteredStudents[selectedStudent]?.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "ST"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-2xl text-slate-900 dark:text-white">
                              {filteredStudents[selectedStudent]?.name || "Unknown Student"}
                            </CardTitle>
                            <CardDescription className="text-lg">
                              Completed on {filteredStudents[selectedStudent]?.completedAt || "Unknown date"}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-bold text-slate-900 dark:text-white">
                            {filteredStudents[selectedStudent]?.score || 0}%
                          </p>
                          <p className="text-slate-500 dark:text-slate-400">Final Score</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Student Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <Clock className="w-8 h-8 text-blue-600" />
                            <div>
                              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                {filteredStudents[selectedStudent]?.timeSpent || "0m"}
                              </p>
                              <p className="text-sm text-blue-600 dark:text-blue-400">Time Spent</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <Zap className="w-8 h-8 text-green-600" />
                            <div>
                              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                {filteredStudents[selectedStudent]?.attempts || 0}
                              </p>
                              <p className="text-sm text-green-600 dark:text-green-400">Attempts</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                            <Award className="w-8 h-8 text-purple-600" />
                            <div>
                              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                {studentAnswers?.answers?.filter((a: any) => a.isCorrect).length || 0}/
                                {studentAnswers?.answers?.length || 0}
                              </p>
                              <p className="text-sm text-purple-600 dark:text-purple-400">Correct</p>
                            </div>
                          </div>
                        </div>

                        {/* Individual Answers */}
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Individual Answers</h3>
                          {isLoadingAnswers ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-school-blue"></div>
                                <p className="text-slate-500 dark:text-slate-400">Loading answers...</p>
                              </div>
                            </div>
                          ) : studentAnswers?.answers && studentAnswers.answers.length > 0 ? (
                            studentAnswers.answers.map((answer: any) => (
                              <div
                                key={answer.questionId}
                                className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                                      Question {answer.questionNumber}
                                    </h4>
                                    <p className="text-slate-700 dark:text-slate-300 mb-3">{formatQuestionText(answer.questionText)}</p>

                                    {/* Question Image */}
                                    {answer.questionImageUrl && (
                                      <div className="mt-3 mb-3">
                                        <img
                                          src={answer.questionImageUrl}
                                          alt="Question"
                                          className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                                          loading="lazy"
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {answer.isCorrect ? (
                                      <CheckCircle className="w-6 h-6 text-green-600" />
                                    ) : (
                                      <XCircle className="w-6 h-6 text-red-600" />
                                    )}
                                    <Badge
                                      variant="secondary"
                                      className={
                                        answer.isCorrect
                                          ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                          : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                                      }
                                    >
                                      {answer.isCorrect ? "Correct" : "Incorrect"}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Student's Answer:
                                      </p>
                                      <p
                                        className={`p-3 rounded-lg ${
                                          answer.isCorrect
                                            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                                            : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                                        }`}
                                      >
                                        {formatStudentAnswer(answer.studentAnswer)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Correct Answer:
                                      </p>
                                      <p className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200">
                                        {formatStudentAnswer(answer.correctAnswer)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                      <Clock className="w-4 h-4" />
                                      <span>Time spent: {answer.timeSpent ? `${answer.timeSpent}s` : "N/A"}</span>
                                    </div>
                                    <div className="text-sm font-medium">
                                      <span className="text-slate-600 dark:text-slate-400">Points: </span>
                                      <span className={answer.isCorrect ? "text-green-600" : "text-red-600"}>
                                        {answer.pointsAwarded}/{answer.maxPoints}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-500 dark:text-slate-400 text-center py-8">No answers available for this student</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Empty State when no students found */}
              {filteredStudents.length === 0 && (
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="w-16 h-16 text-slate-400 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Students Found</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-center">
                      {searchQuery
                        ? "No students match your search criteria."
                        : "No students have taken this quiz yet."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
