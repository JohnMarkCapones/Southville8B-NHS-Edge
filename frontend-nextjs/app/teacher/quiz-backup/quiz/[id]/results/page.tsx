"use client"

import { useState } from "react"
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

// Mock quiz data
const quizData = {
  id: "QZ001",
  title: "Mathematics - Algebra Basics",
  subject: "Mathematics",
  grade: "Grade 8",
  questions: 15,
  duration: 30,
  totalAttempts: 45,
  avgScore: 82.5,
  created: "2024-01-10",
  dueDate: "2024-01-25",
  status: "completed",
}

// Mock questions data
const questionsData = [
  {
    id: 1,
    question: "What is the value of x in the equation 2x + 5 = 15?",
    type: "Multiple Choice",
    correctAnswer: "x = 5",
    options: ["x = 3", "x = 5", "x = 7", "x = 10"],
    difficulty: "Medium",
    avgScore: 85.2,
    correctCount: 38,
    totalAttempts: 45,
    timeSpent: "2.3m",
    needsGrading: false,
  },
  {
    id: 2,
    question: "Simplify the expression: 3(x + 4) - 2x",
    type: "Short Answer",
    correctAnswer: "x + 12",
    difficulty: "Easy",
    avgScore: 92.1,
    correctCount: 41,
    totalAttempts: 45,
    timeSpent: "1.8m",
    needsGrading: true, // Essay question needs grading
    ungradedCount: 12, // Number of ungraded submissions
  },
  {
    id: 3,
    question: "Which of the following is a quadratic equation?",
    type: "Multiple Choice",
    correctAnswer: "x² + 3x + 2 = 0",
    options: ["2x + 5 = 0", "x² + 3x + 2 = 0", "3x - 7 = 0", "x/2 + 1 = 0"],
    difficulty: "Hard",
    avgScore: 67.8,
    correctCount: 30,
    totalAttempts: 45,
    timeSpent: "3.1m",
    needsGrading: false,
  },
  {
    id: 4,
    question:
      "Explain the concept of variables in algebra and provide two real-world examples of how variables are used.",
    type: "Long Answer",
    difficulty: "Medium",
    avgScore: 0, // Not yet graded
    correctCount: 0,
    totalAttempts: 45,
    timeSpent: "5.2m",
    needsGrading: true, // Essay question needs grading
    ungradedCount: 45, // All submissions need grading
    maxPoints: 10,
  },
  {
    id: 5,
    question: "Describe the steps to solve a linear equation. Use an example to illustrate your explanation.",
    type: "Long Answer",
    difficulty: "Hard",
    avgScore: 0, // Not yet graded
    correctCount: 0,
    totalAttempts: 45,
    timeSpent: "6.5m",
    needsGrading: true, // Essay question needs grading
    ungradedCount: 45, // All submissions need grading
    maxPoints: 10,
  },
]

// Mock students data
const studentsData = [
  {
    id: "ST001",
    name: "Adit Irwan",
    avatar: "/placeholder.svg?height=40&width=40",
    score: 95,
    timeSpent: "28m",
    attempts: 1,
    completedAt: "2024-01-20 14:30",
    answers: [
      { questionId: 1, answer: "x = 5", isCorrect: true, timeSpent: "2.1m" },
      { questionId: 2, answer: "x + 12", isCorrect: true, timeSpent: "1.5m" },
      { questionId: 3, answer: "x² + 3x + 2 = 0", isCorrect: true, timeSpent: "2.8m" },
    ],
  },
  {
    id: "ST002",
    name: "Arif Brata",
    avatar: "/placeholder.svg?height=40&width=40",
    score: 78,
    timeSpent: "32m",
    attempts: 2,
    completedAt: "2024-01-20 15:45",
    answers: [
      { questionId: 1, answer: "x = 3", isCorrect: false, timeSpent: "3.2m" },
      { questionId: 2, answer: "x + 12", isCorrect: true, timeSpent: "2.1m" },
      { questionId: 3, answer: "x² + 3x + 2 = 0", isCorrect: true, timeSpent: "3.5m" },
    ],
  },
  {
    id: "ST003",
    name: "Ardhi Irwandi",
    avatar: "/placeholder.svg?height=40&width=40",
    score: 89,
    timeSpent: "25m",
    attempts: 1,
    completedAt: "2024-01-20 16:20",
    answers: [
      { questionId: 1, answer: "x = 5", isCorrect: true, timeSpent: "1.8m" },
      { questionId: 2, answer: "x + 10", isCorrect: false, timeSpent: "2.3m" },
      { questionId: 3, answer: "x² + 3x + 2 = 0", isCorrect: true, timeSpent: "2.9m" },
    ],
  },
]

export default function QuizResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState(0)
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [classFilter, setClassFilter] = useState("all") // all, passed, failed
  const [sortBy, setSortBy] = useState("name") // name, score, performance

  const totalUngradedEssays = questionsData
    .filter((q) => q.needsGrading)
    .reduce((sum, q) => sum + (q.ungradedCount || 0), 0)

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "questions", label: "Questions", icon: FileText },
    { id: "class", label: "Class", icon: GraduationCap },
    { id: "students", label: "Students", icon: Users },
  ]

  const extendedQuestionsData = Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    question: `Question ${index + 1}: ${questionsData[index % questionsData.length]?.question || "Sample question text"}`,
    type: questionsData[index % questionsData.length]?.type || "Multiple Choice",
    difficulty: ["Easy", "Medium", "Hard"][index % 3],
    avgScore: Math.floor(Math.random() * 40) + 60,
    correctCount: Math.floor(Math.random() * 15) + 10,
    totalAttempts: 25,
    timeSpent: Math.floor(Math.random() * 180) + 60,
  }))

  const extendedStudentsData = studentsData.map((student) => ({
    ...student,
    answers: Array.from({ length: 10 }, (_, index) => ({
      questionId: index + 1,
      answer: `Answer ${index + 1}`,
      isCorrect: Math.random() > 0.3, // 70% chance of being correct
      timeSpent: Math.floor(Math.random() * 120) + 30,
    })),
  }))

  const filteredStudents = extendedStudentsData.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      classFilter === "all" ||
      (classFilter === "passed" && student.score >= 80) ||
      (classFilter === "failed" && student.score < 80)
    return matchesSearch && matchesFilter
  })

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case "score":
        return b.score - a.score
      case "performance":
        const aCorrect = a.answers.filter((ans) => ans.isCorrect).length
        const bCorrect = b.answers.filter((ans) => ans.isCorrect).length
        return bCorrect - aCorrect
      default:
        return a.name.localeCompare(b.name)
    }
  })

  const filteredQuestions = questionsData.filter(
    (question) => filterDifficulty === "all" || question.difficulty.toLowerCase() === filterDifficulty,
  )

  const handleExport = (format: string) => {
    if (format === "pdf") {
      // Create PDF export
      const content = `
Quiz Results Report
==================
Quiz: ${quizData.title}
Subject: ${quizData.subject}
Grade: ${quizData.grade}
Total Attempts: ${quizData.totalAttempts}
Average Score: ${quizData.avgScore}%

Student Results:
${studentsData.map((student) => `${student.name}: ${student.score}% (${student.timeSpent})`).join("\n")}
      `

      const blob = new Blob([content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${quizData.title}_results.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (format === "csv") {
      // Create CSV export
      const headers = ["Student Name", "Score (%)", "Time Spent", "Attempts", "Completed At"]
      const csvContent = [
        headers.join(","),
        ...studentsData.map((student) =>
          [student.name, student.score, student.timeSpent, student.attempts, student.completedAt].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${quizData.title}_results.csv`
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
                  {quizData.title}
                </h1>
                <p className="text-blue-100 text-lg">Quiz Results & Analytics</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{quizData.totalAttempts} Attempts</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">{quizData.avgScore}% Avg Score</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">{quizData.questions} Questions</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{quizData.duration}m Duration</span>
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
                          {questionsData.filter((q) => q.needsGrading).length} question
                          {questionsData.filter((q) => q.needsGrading).length !== 1 ? "s" : ""} need your review to
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
                      Completion Rate
                    </CardTitle>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-900 dark:text-green-100">100%</div>
                    <Progress value={100} className="mt-3 h-2" />
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">All students completed</p>
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
                    <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{quizData.avgScore}%</div>
                    <Progress value={quizData.avgScore} className="mt-3 h-2" />
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Above target (75%)</p>
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
                    <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">28.3m</div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">Out of 30m allowed</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Retake Rate
                    </CardTitle>
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">22.2%</div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">10 students retook</p>
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
                    {[
                      { range: "0-15 min", count: 5, percentage: 11.1, color: "bg-red-500" },
                      { range: "15-20 min", count: 8, percentage: 17.8, color: "bg-orange-500" },
                      { range: "20-25 min", count: 12, percentage: 26.7, color: "bg-yellow-500" },
                      { range: "25-30 min", count: 15, percentage: 33.3, color: "bg-green-500" },
                      { range: "30+ min", count: 5, percentage: 11.1, color: "bg-blue-500" },
                    ].map((item) => (
                      <div key={item.range} className="flex items-center gap-4">
                        <div className="w-20 text-sm font-medium text-slate-700 dark:text-slate-300">{item.range}</div>
                        <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-6 relative overflow-hidden">
                          <div
                            className={`${item.color} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                            style={{ width: `${item.percentage}%` }}
                          >
                            <span className="text-white text-xs font-medium">{item.count}</span>
                          </div>
                        </div>
                        <div className="w-16 text-sm text-slate-600 dark:text-slate-400 text-right">
                          {item.percentage}%
                        </div>
                      </div>
                    ))}
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
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                      <div className="text-3xl font-bold text-green-700 dark:text-green-300 mb-2">92.1%</div>
                      <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Easy Questions</div>
                      <Progress value={92.1} className="h-2" />
                    </div>
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800">
                      <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300 mb-2">85.2%</div>
                      <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                        Medium Questions
                      </div>
                      <Progress value={85.2} className="h-2" />
                    </div>
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800">
                      <div className="text-3xl font-bold text-red-700 dark:text-red-300 mb-2">67.8%</div>
                      <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Hard Questions</div>
                      <Progress value={67.8} className="h-2" />
                    </div>
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
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">1 Attempt</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: "77.8%" }}></div>
                            </div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">35 students</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">2 Attempts</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: "17.8%" }}></div>
                            </div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">8 students</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">3+ Attempts</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div className="bg-orange-500 h-2 rounded-full" style={{ width: "4.4%" }}></div>
                            </div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">2 students</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Score Improvement</h4>
                      <div className="space-y-3">
                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                              Average Improvement
                            </span>
                            <span className="text-lg font-bold text-green-800 dark:text-green-200">+12.5%</span>
                          </div>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Students who retook the quiz
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              Best Improvement
                            </span>
                            <span className="text-lg font-bold text-blue-800 dark:text-blue-200">+28%</span>
                          </div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Single student improvement</p>
                        </div>
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
                    {[
                      { range: "90-100%", count: 15, percentage: 33.3, color: "bg-green-500" },
                      { range: "80-89%", count: 18, percentage: 40.0, color: "bg-blue-500" },
                      { range: "70-79%", count: 8, percentage: 17.8, color: "bg-yellow-500" },
                      { range: "60-69%", count: 3, percentage: 6.7, color: "bg-orange-500" },
                      { range: "Below 60%", count: 1, percentage: 2.2, color: "bg-red-500" },
                    ].map((item) => (
                      <div key={item.range} className="flex items-center gap-4">
                        <div className="w-20 text-sm font-medium text-slate-700 dark:text-slate-300">{item.range}</div>
                        <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-6 relative overflow-hidden">
                          <div
                            className={`${item.color} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                            style={{ width: `${item.percentage}%` }}
                          >
                            <span className="text-white text-xs font-medium">{item.count}</span>
                          </div>
                        </div>
                        <div className="w-16 text-sm text-slate-600 dark:text-slate-400 text-right">
                          {item.percentage}%
                        </div>
                      </div>
                    ))}
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
                    {studentsData
                      .sort((a, b) => b.score - a.score)
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
                                Completed in {student.timeSpent}
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
                {filteredQuestions.map((question) => (
                  <Card
                    key={question.id}
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-slate-900 dark:text-white mb-2">
                            Question {question.id}
                          </CardTitle>
                          <p className="text-slate-700 dark:text-slate-300 mb-3">{question.question}</p>
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
                                onClick={() => router.push(`/teacher/quiz/${params.id}/grade?question=${question.id}`)}
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
                ))}
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
                    Detailed view of all student results across {extendedQuestionsData.length} questions
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
                            {extendedQuestionsData.map((question, index) => (
                              <th
                                key={question.id}
                                className="text-center p-2 font-semibold text-slate-900 dark:text-white min-w-[70px] max-w-[70px]"
                              >
                                <div className="flex flex-col items-center">
                                  <span className="text-xs">Q{question.id}</span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                                    {Math.round((question.correctCount / question.totalAttempts) * 100)}%
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
                              {extendedQuestionsData.map((question) => {
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
                          {extendedQuestionsData.length}
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
                                {filteredStudents[selectedStudent]?.answers?.filter((a) => a.isCorrect).length || 0}/
                                {filteredStudents[selectedStudent]?.answers?.length || 0}
                              </p>
                              <p className="text-sm text-purple-600 dark:text-purple-400">Correct</p>
                            </div>
                          </div>
                        </div>

                        {/* Individual Answers */}
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Individual Answers</h3>
                          {filteredStudents[selectedStudent]?.answers?.map((answer, index) => {
                            const question = questionsData.find((q) => q.id === answer.questionId)
                            return (
                              <div
                                key={answer.questionId}
                                className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                                      Question {answer.questionId}
                                    </h4>
                                    <p className="text-slate-700 dark:text-slate-300 mb-3">{question?.question}</p>
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
                                        {answer.answer}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Correct Answer:
                                      </p>
                                      <p className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200">
                                        {question?.correctAnswer}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    <Clock className="w-4 h-4" />
                                    <span>Time spent: {answer.timeSpent}</span>
                                  </div>
                                </div>
                              </div>
                            )
                          }) || <p className="text-slate-500 dark:text-slate-400">No answers available</p>}
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
