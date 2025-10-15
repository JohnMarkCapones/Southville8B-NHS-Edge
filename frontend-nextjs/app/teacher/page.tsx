"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  FileText,
  Star,
  Target,
  BarChart3,
  TrendingDown,
  Search,
  Download,
  Trophy,
  Medal,
  Crown,
  SortAsc,
  SortDesc,
  Eye,
  MessageCircle,
  Phone,
} from "lucide-react"
import SubjectsCarousel from "@/components/teacher/subjects-carousel"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for analytics
const classPerformanceData = [
  { subject: "Math", average: 85, students: 32, trend: "up" },
  { subject: "Science", average: 78, students: 30, trend: "up" },
  { subject: "English", average: 82, students: 35, trend: "down" },
  { subject: "History", average: 79, students: 28, trend: "up" },
  { subject: "PE", average: 91, students: 40, trend: "up" },
]

const weeklyProgressData = [
  { day: "Mon", assignments: 12, submissions: 10, attendance: 95 },
  { day: "Tue", assignments: 8, submissions: 8, attendance: 98 },
  { day: "Wed", assignments: 15, submissions: 13, attendance: 92 },
  { day: "Thu", assignments: 10, submissions: 9, attendance: 96 },
  { day: "Fri", assignments: 6, submissions: 6, attendance: 100 },
]

const gradeDistribution = [
  { grade: "A", count: 45, percentage: 30 },
  { grade: "B", count: 52, percentage: 35 },
  { grade: "C", count: 38, percentage: 25 },
  { grade: "D", count: 12, percentage: 8 },
  { grade: "F", count: 3, percentage: 2 },
]

const allStudents = [
  {
    id: 1,
    name: "Maria Santos",
    grade: "A+",
    gwa: 95.5,
    improvement: "+2.3",
    avatar: "/placeholder.svg?height=32&width=32",
    gradeLevel: "Grade 8",
    section: "A",
    subjects: { math: 96, science: 94, english: 97, history: 95 },
    attendance: 98,
    assignments: { completed: 45, total: 47 },
    quizzes: { average: 94.2, total: 12 },
    rank: 1,
    points: 2850,
    achievements: ["Top Performer", "Perfect Attendance", "Math Wizard"],
  },
  {
    id: 2,
    name: "John Dela Cruz",
    grade: "A",
    gwa: 93.2,
    improvement: "+1.8",
    avatar: "/placeholder.svg?height=32&width=32",
    gradeLevel: "Grade 8",
    section: "A",
    subjects: { math: 92, science: 95, english: 91, history: 94 },
    attendance: 96,
    assignments: { completed: 44, total: 47 },
    quizzes: { average: 92.8, total: 12 },
    rank: 2,
    points: 2720,
    achievements: ["Science Star", "Consistent Performer"],
  },
  {
    id: 3,
    name: "Ana Rodriguez",
    grade: "A",
    gwa: 92.8,
    improvement: "+3.1",
    avatar: "/placeholder.svg?height=32&width=32",
    gradeLevel: "Grade 8",
    section: "B",
    subjects: { math: 90, science: 93, english: 95, history: 93 },
    attendance: 97,
    assignments: { completed: 46, total: 47 },
    quizzes: { average: 91.5, total: 12 },
    rank: 3,
    points: 2680,
    achievements: ["English Excellence", "Most Improved"],
  },
  {
    id: 4,
    name: "Carlos Mendoza",
    grade: "A-",
    gwa: 91.5,
    improvement: "+0.9",
    avatar: "/placeholder.svg?height=32&width=32",
    gradeLevel: "Grade 9",
    section: "A",
    subjects: { math: 89, science: 92, english: 93, history: 92 },
    attendance: 95,
    assignments: { completed: 43, total: 47 },
    quizzes: { average: 90.2, total: 12 },
    rank: 4,
    points: 2590,
    achievements: ["History Hero", "Team Player"],
  },
  {
    id: 5,
    name: "Sofia Reyes",
    grade: "A-",
    gwa: 90.7,
    improvement: "+2.7",
    avatar: "/placeholder.svg?height=32&width=32",
    gradeLevel: "Grade 9",
    section: "B",
    subjects: { math: 88, science: 91, english: 92, history: 91 },
    attendance: 94,
    assignments: { completed: 42, total: 47 },
    quizzes: { average: 89.8, total: 12 },
    rank: 5,
    points: 2520,
    achievements: ["Creative Thinker", "Leadership"],
  },
  {
    id: 6,
    name: "Miguel Torres",
    grade: "D+",
    gwa: 67.3,
    improvement: "-1.2",
    avatar: "/placeholder.svg?height=32&width=32",
    gradeLevel: "Grade 8",
    section: "C",
    subjects: { math: 65, science: 68, english: 70, history: 66 },
    attendance: 85,
    assignments: { completed: 32, total: 47 },
    quizzes: { average: 66.5, total: 12 },
    rank: 45,
    points: 1240,
    achievements: [],
  },
  {
    id: 7,
    name: "Lisa Garcia",
    grade: "D",
    gwa: 65.8,
    improvement: "-0.8",
    avatar: "/placeholder.svg?height=32&width=32",
    gradeLevel: "Grade 9",
    section: "C",
    subjects: { math: 63, science: 66, english: 68, history: 65 },
    attendance: 82,
    assignments: { completed: 30, total: 47 },
    quizzes: { average: 64.2, total: 12 },
    rank: 46,
    points: 1180,
    achievements: [],
  },
  {
    id: 8,
    name: "Pedro Villanueva",
    grade: "D-",
    gwa: 62.1,
    improvement: "-2.1",
    avatar: "/placeholder.svg?height=32&width=32",
    gradeLevel: "Grade 8",
    section: "C",
    subjects: { math: 60, science: 62, english: 64, history: 62 },
    attendance: 78,
    assignments: { completed: 28, total: 47 },
    quizzes: { average: 61.8, total: 12 },
    rank: 47,
    points: 1050,
    achievements: [],
  },
]

const topStudents = allStudents.slice(0, 5)
const atRiskStudents = allStudents.slice(-3).map((student) => ({
  ...student,
  concern:
    student.attendance < 85
      ? "Low attendance"
      : student.assignments.completed < 35
        ? "Missing assignments"
        : "Quiz performance",
}))

const COLORS = ["hsl(var(--teacher-primary))", "hsl(var(--teacher-accent))", "#10b981", "#f59e0b", "#ef4444"]

function RealTimeClock() {
  // Initialize to null to avoid hydration mismatch - time will be set on client
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    // Set initial time on client mount
    setTime(new Date())

    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Show placeholder until time is set on client to avoid hydration mismatch
  if (!time) {
    return (
      <div className="text-right">
        <div className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">--:--:--</div>
        <div className="text-sm text-blue-500 dark:text-blue-300">Loading...</div>
      </div>
    )
  }

  return (
    <div className="text-right" suppressHydrationWarning>
      <div className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">{formatTime(time)}</div>
      <div className="text-sm text-blue-500 dark:text-blue-300">{formatDate(time)}</div>
    </div>
  )
}

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [sectionFilter, setSectionFilter] = useState("all")
  const [sortBy, setSortBy] = useState("rank")
  const [sortOrder, setSortOrder] = useState("asc")

  const filteredStudents = allStudents
    .filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGrade = gradeFilter === "all" || student.gradeLevel === gradeFilter
      const matchesSection = sectionFilter === "all" || student.section === sectionFilter
      return matchesSearch && matchesGrade && matchesSection
    })
    .sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case "name":
          aValue = a.name
          bValue = b.name
          break
        case "gwa":
          aValue = a.gwa
          bValue = b.gwa
          break
        case "attendance":
          aValue = a.attendance
          bValue = b.attendance
          break
        case "points":
          aValue = a.points
          bValue = b.points
          break
        default:
          aValue = a.rank
          bValue = b.rank
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "students", label: "Student Rankings", icon: Users },
    { id: "activity", label: "Activity", icon: BarChart3 },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 shadow-sm">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
            Welcome back, Ms. Rodriguez! Here's your classroom overview.
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
              <Calendar className="w-3 h-3 mr-1" />
              Academic Year 2024-2025
            </Badge>
            <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
              <Clock className="w-3 h-3 mr-1" />
              Semester 1
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <RealTimeClock />
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 px-3 py-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              All Systems Online
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Today's Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-t-xl">
        <nav className="flex space-x-8 overflow-x-auto px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-3 font-semibold text-sm whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 bg-gradient-to-t from-blue-50/80 to-transparent dark:from-blue-950/40 shadow-sm"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/30 dark:hover:bg-blue-900/20"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-950 dark:via-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-blue-700 dark:text-blue-300">Total Students</CardTitle>
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">165</div>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5 from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 dark:from-purple-950 dark:via-purple-900 dark:to-purple-800 border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                  Active Classes
                </CardTitle>
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">8</div>
                <p className="text-xs text-purple-600 dark:text-purple-400">Across 5 subjects</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-green-950 dark:via-green-900 dark:to-green-800 border-green-200 dark:border-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-green-700 dark:text-green-300">
                  Avg. Performance
                </CardTitle>
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300">
                  <Award className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">83.2%</div>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2.1% this quarter
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 dark:from-orange-950 dark:via-orange-900 dark:to-orange-800 border-orange-200 dark:border-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                  Module Uploads
                </CardTitle>
                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300">
                  <FileText className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-1">35</div>
                <p className="text-xs text-orange-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />8 this week
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubjectsCarousel />

            <Card className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950 dark:via-slate-900 dark:to-purple-950 border-indigo-200 dark:border-indigo-800 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-indigo-900 dark:text-indigo-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    Quick Actions
                  </div>
                  <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-xs">
                    Shortcuts
                  </Badge>
                </CardTitle>
                <CardDescription className="text-indigo-600 dark:text-indigo-300">
                  Common tasks and productivity shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Primary Actions */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-3">Primary Tasks</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        label: "Grade Papers",
                        icon: FileText,
                        color: "from-blue-500 to-blue-600",
                        count: "12 pending",
                      },
                      {
                        label: "Take Attendance",
                        icon: Users,
                        color: "from-green-500 to-green-600",
                        count: "3 classes",
                      },
                      { label: "Create Quiz", icon: Target, color: "from-orange-500 to-orange-600", count: "New" },
                      {
                        label: "Download Resources",
                        icon: FileText,
                        color: "from-purple-500 to-purple-600",
                        count: "Available",
                      },
                    ].map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-20 flex-col space-y-2 hover:bg-white/70 dark:hover:bg-indigo-800/50 bg-white/50 dark:bg-indigo-800/30 border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                      >
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
                        >
                          <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-center">
                          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-200 block">
                            {action.label}
                          </span>
                          <span className="text-xs text-indigo-500 dark:text-indigo-400">{action.count}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Secondary Actions */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-3">Quick Tools</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Reports", icon: BarChart3, color: "from-pink-500 to-pink-600" },
                      { label: "Schedule", icon: Calendar, color: "from-teal-500 to-teal-600" },
                      { label: "Settings", icon: Target, color: "from-gray-500 to-gray-600" },
                    ].map((action, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="h-14 flex-col space-y-1 hover:bg-indigo-100/50 dark:hover:bg-indigo-800/30 transition-all duration-200 hover:scale-105 group"
                      >
                        <div
                          className={`w-6 h-6 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200`}
                        >
                          <action.icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-300">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl border border-indigo-200 dark:border-indigo-700/50">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">24</div>
                      <div className="text-xs text-indigo-500 dark:text-indigo-300">Tasks Today</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">8</div>
                      <div className="text-xs text-purple-500 dark:text-indigo-300">Completed</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">67%</div>
                      <div className="text-xs text-green-500 dark:text-green-300">Progress</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Removed Section Engagement Breakdown card */}
          </div>
        </div>
      )}

      {activeTab === "performance" && (
        <div className="space-y-6">
          {/* Class Performance Overview */}
          <Card className="bg-[hsl(var(--teacher-card))] border-[hsl(var(--teacher-border))]">
            <CardHeader>
              <CardTitle className="text-[hsl(var(--teacher-foreground))]">Class Performance Overview</CardTitle>
              <CardDescription>Average scores and trends across all subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  average: {
                    label: "Average Score",
                    color: "hsl(var(--teacher-primary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--teacher-border))" />
                    <XAxis dataKey="subject" stroke="hsl(var(--teacher-muted-foreground))" />
                    <YAxis stroke="hsl(var(--teacher-muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="average" fill="hsl(var(--teacher-primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card className="bg-[hsl(var(--teacher-card))] border-[hsl(var(--teacher-border))]">
            <CardHeader>
              <CardTitle className="text-[hsl(var(--teacher-foreground))]">Weekly Progress</CardTitle>
              <CardDescription>Assignment submissions and attendance trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  submissions: {
                    label: "Submissions",
                    color: "hsl(var(--teacher-accent))",
                  },
                  attendance: {
                    label: "Attendance %",
                    color: "hsl(var(--teacher-primary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--teacher-border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--teacher-muted-foreground))" />
                    <YAxis stroke="hsl(var(--teacher-muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      type="monotone"
                      dataKey="submissions"
                      stroke="hsl(var(--teacher-accent))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--teacher-accent))", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="hsl(var(--teacher-primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--teacher-primary))", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "students" && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center">
                <Trophy className="w-6 h-6 mr-3 text-primary" />
                Student Rankings Dashboard
              </h2>
              <p className="text-muted-foreground mt-1">Comprehensive student performance analytics and leaderboard</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Grade Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="Grade 8">Grade 8</SelectItem>
                <SelectItem value="Grade 9">Grade 9</SelectItem>
                <SelectItem value="Grade 10">Grade 10</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                <SelectItem value="A">Section A</SelectItem>
                <SelectItem value="B">Section B</SelectItem>
                <SelectItem value="C">Section C</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rank">Rank</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="gwa">GWA</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="points">Points</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Students</p>
                    <p className="text-2xl font-bold text-foreground">{allStudents.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Average GWA</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(allStudents.reduce((sum, s) => sum + s.gwa, 0) / allStudents.length).toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Top Performers</p>
                    <p className="text-2xl font-bold text-foreground">
                      {allStudents.filter((s) => s.gwa >= 90).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Need Support</p>
                    <p className="text-2xl font-bold text-foreground">{allStudents.filter((s) => s.gwa < 75).length}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                  Top 3 Champions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-center space-x-2 mb-6">
                  {/* 2nd Place */}
                  <div className="text-center">
                    <div className="w-16 h-20 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-lg flex items-end justify-center pb-2 mb-2">
                      <span className="text-white font-bold text-lg">2</span>
                    </div>
                    <Avatar className="w-12 h-12 mx-auto mb-2 border-2 border-gray-400">
                      <AvatarImage src={topStudents[1]?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {topStudents[1]?.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-foreground font-medium">{topStudents[1]?.name.split(" ")[0]}</p>
                    <p className="text-xs text-muted-foreground">{topStudents[1]?.gwa}%</p>
                  </div>

                  {/* 1st Place */}
                  <div className="text-center">
                    <div className="w-16 h-24 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg flex items-end justify-center pb-2 mb-2">
                      <span className="text-white font-bold text-xl">1</span>
                    </div>
                    <Avatar className="w-14 h-14 mx-auto mb-2 border-2 border-yellow-500">
                      <AvatarImage src={topStudents[0]?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {topStudents[0]?.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-foreground font-bold">{topStudents[0]?.name.split(" ")[0]}</p>
                    <p className="text-xs text-muted-foreground">{topStudents[0]?.gwa}%</p>
                  </div>

                  {/* 3rd Place */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-lg flex items-end justify-center pb-2 mb-2">
                      <span className="text-white font-bold text-lg">3</span>
                    </div>
                    <Avatar className="w-12 h-12 mx-auto mb-2 border-2 border-amber-600">
                      <AvatarImage src={topStudents[2]?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {topStudents[2]?.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-foreground font-medium">{topStudents[2]?.name.split(" ")[0]}</p>
                    <p className="text-xs text-muted-foreground">{topStudents[2]?.gwa}%</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-border pt-4">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center">
                    <Trophy className="w-4 h-4 mr-2" />
                    Top 10 Leaderboard
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {allStudents.slice(3, 13).map((student, index) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-semibold">
                            {index + 4}
                          </div>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={student.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {student.name.split(" ")[0]} {student.name.split(" ")[1]?.[0]}.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {student.gradeLevel}-{student.section}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">{student.gwa}%</p>
                          <p className="text-xs text-muted-foreground">{student.points} pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Honor Roll Analytics */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-500" />
                  Honor Roll Analytics
                </CardTitle>
                <CardDescription>Academic recognition breakdown by honor levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Highest Honor (95-100%) */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Highest Honor</h4>
                        <p className="text-sm text-yellow-600 dark:text-yellow-300">95-100% GWA</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                        {allStudents.filter((s) => s.gwa >= 95).length}
                      </div>
                      <div className="text-sm text-yellow-600 dark:text-yellow-300">students</div>
                    </div>
                  </div>

                  {/* High Honor (90-94%) */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <Medal className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">High Honor</h4>
                        <p className="text-sm text-blue-600 dark:text-blue-300">90-94% GWA</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                        {allStudents.filter((s) => s.gwa >= 90 && s.gwa < 95).length}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-300">students</div>
                    </div>
                  </div>

                  {/* With Honors (85-89%) */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800 dark:text-green-200">With Honors</h4>
                        <p className="text-sm text-green-600 dark:text-green-300">85-89% GWA</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                        {allStudents.filter((s) => s.gwa >= 85 && s.gwa < 90).length}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-300">students</div>
                    </div>
                  </div>

                  {/* Summary Statistics */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                          {allStudents.filter((s) => s.gwa >= 85).length}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Total Honor Roll</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                          {Math.round((allStudents.filter((s) => s.gwa >= 85).length / allStudents.length) * 100)}%
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Honor Roll Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                  Students Need Guidance
                </CardTitle>
                <CardDescription>Analytics for students requiring additional support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Missed Quizzes */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-800 dark:text-red-200">Missed Quizzes</h4>
                        <p className="text-sm text-red-600 dark:text-red-300">Students with absences</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                        {allStudents.filter((s) => s.quizzes.total < 12).length}
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-300">students</div>
                    </div>
                  </div>

                  {/* Unread Modules */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-orange-800 dark:text-orange-200">Unread Modules</h4>
                        <p className="text-sm text-orange-600 dark:text-orange-300">Low engagement</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                        {allStudents.filter((s) => s.assignments.completed < 40).length}
                      </div>
                      <div className="text-sm text-orange-600 dark:text-orange-300">students</div>
                    </div>
                  </div>

                  {/* Low Grades */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200">Low Grades</h4>
                        <p className="text-sm text-purple-600 dark:text-purple-300">Below 75% GWA</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                        {allStudents.filter((s) => s.gwa < 75).length}
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-300">students</div>
                    </div>
                  </div>

                  {/* Poor Attendance */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-slate-500 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Poor Attendance</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Below 85%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {allStudents.filter((s) => s.attendance < 85).length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">students</div>
                    </div>
                  </div>

                  {/* Action Summary */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 rounded-lg border border-red-200 dark:border-red-700/50">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                          {
                            allStudents.filter((s) => s.gwa < 75 || s.attendance < 85 || s.assignments.completed < 40)
                              .length
                          }
                        </div>
                        <div className="text-sm text-red-500 dark:text-red-300">Need Intervention</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          {Math.round(
                            (allStudents.filter((s) => s.gwa < 75 || s.attendance < 85 || s.assignments.completed < 40)
                              .length /
                              allStudents.length) *
                              100,
                          )}
                          %
                        </div>
                        <div className="text-sm text-orange-500 dark:text-orange-300">At Risk Rate</div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 bg-transparent"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact Parents
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Student Leaderboard ({filteredStudents.length} students)</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredStudents.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            student.rank === 1
                              ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-white"
                              : student.rank === 2
                                ? "bg-gradient-to-r from-gray-400 to-gray-300 text-white"
                                : student.rank === 3
                                  ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white"
                                  : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {student.rank <= 3 ? (
                            student.rank === 1 ? (
                              <Crown className="w-4 h-4" />
                            ) : student.rank === 2 ? (
                              <Medal className="w-4 h-4" />
                            ) : (
                              <Trophy className="w-4 h-4" />
                            )
                          ) : (
                            student.rank
                          )}
                        </div>
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={student.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-foreground">{student.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {student.gradeLevel} - {student.section}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-muted-foreground">GWA: {student.gwa}%</span>
                          <span className="text-sm text-muted-foreground">Attendance: {student.attendance}%</span>
                          <span className="text-sm text-muted-foreground">Points: {student.points}</span>
                        </div>
                        {student.achievements.length > 0 && (
                          <div className="flex items-center space-x-1 mt-2">
                            {student.achievements.slice(0, 2).map((achievement, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {achievement}
                              </Badge>
                            ))}
                            {student.achievements.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{student.achievements.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className={`${
                          student.gwa >= 90
                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                            : student.gwa >= 80
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : student.gwa >= 70
                                ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                : "bg-red-500/10 text-red-600 border-red-500/20"
                        }`}
                      >
                        {student.grade}
                      </Badge>
                      <span
                        className={`text-sm font-medium ${
                          student.improvement.startsWith("+") ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {student.improvement}
                      </span>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500/5 to-orange-500/5 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Students Needing Attention
              </CardTitle>
              <CardDescription>Students who may need additional support and intervention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {atRiskStudents.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={student.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.gradeLevel} - {student.section} • GWA: {student.gwa}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">
                        {student.grade}
                      </Badge>
                      <span className="text-sm text-red-600">{student.concern}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/20 text-red-600 hover:bg-red-500/10 bg-transparent"
                      >
                        Contact Parent
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="space-y-6">
          {/* Activity Timeline */}
          <Card className="bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-3 text-slate-600 dark:text-slate-400" />
                  Activity Timeline
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-80 overflow-y-auto">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700"></div>

                <div className="space-y-6">
                  {/* Activity 1 */}
                  <div className="relative flex items-start space-x-4">
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-purple-500 rounded-full shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          12 Assignments have been graded
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">12 min ago</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Mathematics assignments have been graded and returned to students
                      </p>
                      <div className="flex items-center mt-2">
                        <FileText className="w-4 h-4 text-red-500 mr-2" />
                        <span className="text-xs text-slate-600 dark:text-slate-400">assignments.pdf</span>
                      </div>
                    </div>
                  </div>

                  {/* Activity 2 */}
                  <div className="relative flex items-start space-x-4">
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-green-500 rounded-full shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Parent Meeting</h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">45 min ago</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Parent conference with Mrs. Santos @2:30pm
                      </p>
                      <div className="flex items-center mt-2">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarImage src="/placeholder.svg?height=24&width=24" />
                          <AvatarFallback className="text-xs">MS</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Mrs. Santos (Parent)
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Maria's Academic Progress</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity 3 */}
                  <div className="relative flex items-start space-x-4">
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-cyan-500 rounded-full shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Create new quiz for Grade 8
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">2 Day Ago</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">5 sections will take the quiz</p>
                      <div className="flex items-center mt-2">
                        <div className="flex -space-x-2">
                          <Avatar className="w-6 h-6 border-2 border-white dark:border-slate-800">
                            <AvatarImage src="/placeholder.svg?height=24&width=24" />
                            <AvatarFallback className="text-xs">S1</AvatarFallback>
                          </Avatar>
                          <Avatar className="w-6 h-6 border-2 border-white dark:border-slate-800">
                            <AvatarImage src="/placeholder.svg?height=24&width=24" />
                            <AvatarFallback className="text-xs">S2</AvatarFallback>
                          </Avatar>
                          <Avatar className="w-6 h-6 border-2 border-white dark:border-slate-800">
                            <AvatarImage src="/placeholder.svg?height=24&width=24" />
                            <AvatarFallback className="text-xs">S3</AvatarFallback>
                          </Avatar>
                          <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">+2</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
