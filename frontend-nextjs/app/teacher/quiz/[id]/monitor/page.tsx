"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  RefreshCw,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Pause,
  XCircle,
  MessageSquare,
  Flag,
  FileText,
  Eye,
  BarChart3,
  Grid3x3,
  List,
  Download,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Mock data - TODO: Replace with actual database queries
const mockQuizData = {
  id: 1,
  title: "Photosynthesis Test",
  totalQuestions: 10,
  timeLimit: 30, // minutes
  startTime: "2:30 PM",
  endTime: "3:30 PM",
  status: "active",
}

const mockStudents = [
  {
    id: 1,
    name: "John Doe",
    status: "active",
    currentQuestion: 8,
    totalQuestions: 10,
    timeSpent: "18:45",
    progress: 80,
    flags: [],
    answers: [
      { question: 1, correct: true, time: "2:15" },
      { question: 2, correct: true, time: "1:45" },
      { question: 3, correct: false, time: "1:30" },
      { question: 4, correct: true, time: "2:00" },
      { question: 5, correct: true, time: "1:50" },
      { question: 6, correct: true, time: "2:10" },
      { question: 7, correct: false, time: "2:45" },
    ],
    startedAt: "2:30 PM",
    lastActivity: "2:48 PM",
  },
  {
    id: 2,
    name: "Jane Smith",
    status: "finished",
    currentQuestion: 10,
    totalQuestions: 10,
    timeSpent: "25:12",
    progress: 100,
    flags: [],
    answers: [
      { question: 1, correct: true, time: "2:30" },
      { question: 2, correct: true, time: "2:15" },
      { question: 3, correct: true, time: "2:45" },
      { question: 4, correct: true, time: "2:20" },
      { question: 5, correct: true, time: "2:50" },
      { question: 6, correct: true, time: "2:40" },
      { question: 7, correct: true, time: "2:35" },
      { question: 8, correct: true, time: "2:25" },
      { question: 9, correct: true, time: "2:30" },
      { question: 10, correct: true, time: "2:42" },
    ],
    startedAt: "2:30 PM",
    lastActivity: "2:55 PM",
    finishedAt: "2:55 PM",
  },
  {
    id: 3,
    name: "Mike Johnson",
    status: "flagged",
    currentQuestion: 5,
    totalQuestions: 10,
    timeSpent: "32:08",
    progress: 50,
    flags: [
      { type: "tab_switch", message: "Tab Switch - Left quiz 1 time", time: "2:40 PM", severity: "warning" },
      { type: "idle", message: "Idle - Inactive for 5 minutes", time: "2:45 PM", severity: "warning" },
      { type: "too_fast", message: "Too Fast - Q4-Q5 answered in 30 seconds", time: "2:50 PM", severity: "critical" },
    ],
    answers: [
      { question: 1, correct: true, time: "2:15" },
      { question: 2, correct: true, time: "1:45" },
      { question: 3, correct: false, time: "1:30" },
      { question: 4, correct: true, time: "0:15" },
      { question: 5, correct: true, time: "0:15" },
    ],
    startedAt: "2:30 PM",
    lastActivity: "2:50 PM",
  },
  {
    id: 4,
    name: "Sarah Lee",
    status: "idle",
    currentQuestion: 6,
    totalQuestions: 10,
    timeSpent: "22:30",
    progress: 60,
    flags: [{ type: "idle", message: "Idle - No activity for 3 minutes", time: "2:49 PM", severity: "info" }],
    answers: [
      { question: 1, correct: true, time: "2:20" },
      { question: 2, correct: true, time: "2:10" },
      { question: 3, correct: true, time: "2:30" },
      { question: 4, correct: false, time: "2:45" },
      { question: 5, correct: true, time: "2:15" },
    ],
    startedAt: "2:30 PM",
    lastActivity: "2:49 PM",
  },
  {
    id: 5,
    name: "Tom Brown",
    status: "active",
    currentQuestion: 7,
    totalQuestions: 10,
    timeSpent: "15:20",
    progress: 70,
    flags: [],
    answers: [
      { question: 1, correct: true, time: "2:00" },
      { question: 2, correct: true, time: "1:50" },
      { question: 3, correct: true, time: "2:20" },
      { question: 4, correct: true, time: "2:10" },
      { question: 5, correct: false, time: "2:30" },
      { question: 6, correct: true, time: "2:15" },
    ],
    startedAt: "2:30 PM",
    lastActivity: "2:45 PM",
  },
  {
    id: 6,
    name: "Lisa Wang",
    status: "flagged",
    currentQuestion: 9,
    totalQuestions: 10,
    timeSpent: "8:45",
    progress: 90,
    flags: [
      {
        type: "too_fast",
        message: "Too Fast - Completed 9 questions in 8 minutes",
        time: "2:38 PM",
        severity: "critical",
      },
    ],
    answers: [
      { question: 1, correct: true, time: "0:45" },
      { question: 2, correct: true, time: "0:50" },
      { question: 3, correct: true, time: "1:00" },
      { question: 4, correct: true, time: "0:55" },
      { question: 5, correct: true, time: "1:05" },
      { question: 6, correct: true, time: "0:50" },
      { question: 7, correct: true, time: "1:10" },
      { question: 8, correct: true, time: "1:00" },
    ],
    startedAt: "2:30 PM",
    lastActivity: "2:38 PM",
  },
  {
    id: 7,
    name: "David Chen",
    status: "not_started",
    currentQuestion: 0,
    totalQuestions: 10,
    timeSpent: "0:00",
    progress: 0,
    flags: [],
    answers: [],
    startedAt: null,
    lastActivity: null,
  },
  {
    id: 8,
    name: "Emma Wilson",
    status: "finished",
    currentQuestion: 10,
    totalQuestions: 10,
    timeSpent: "28:30",
    progress: 100,
    flags: [],
    answers: [
      { question: 1, correct: true, time: "2:45" },
      { question: 2, correct: true, time: "2:50" },
      { question: 3, correct: false, time: "3:10" },
      { question: 4, correct: true, time: "2:40" },
      { question: 5, correct: true, time: "3:00" },
      { question: 6, correct: true, time: "2:55" },
      { question: 7, correct: true, time: "2:45" },
      { question: 8, correct: false, time: "3:20" },
      { question: 9, correct: true, time: "2:50" },
      { question: 10, correct: true, time: "3:15" },
    ],
    startedAt: "2:30 PM",
    lastActivity: "2:58 PM",
    finishedAt: "2:58 PM",
  },
]

type ActivityLog = {
  id: number
  studentName: string
  type: "finished" | "idle" | "flagged" | "started" | "resumed" | "answered" | "warning" | "manual"
  message: string
  time: string
  severity?: "info" | "warning" | "critical"
}

const mockActivityLogs: ActivityLog[] = [
  {
    id: 1,
    studentName: "Jane Smith",
    type: "finished",
    message: "Completed the quiz",
    time: "2:55 PM",
    severity: "info",
  },
  {
    id: 2,
    studentName: "Mike Johnson",
    type: "flagged",
    message: "Answered too fast (Q4-Q5 in 30s)",
    time: "2:50 PM",
    severity: "critical",
  },
  {
    id: 3,
    studentName: "Sarah Lee",
    type: "idle",
    message: "No activity for 3 minutes",
    time: "2:49 PM",
    severity: "warning",
  },
  {
    id: 4,
    studentName: "John Doe",
    type: "answered",
    message: "Answered question 8",
    time: "2:48 PM",
    severity: "info",
  },
  {
    id: 5,
    studentName: "Mike Johnson",
    type: "idle",
    message: "Inactive for 5 minutes",
    time: "2:45 PM",
    severity: "warning",
  },
  {
    id: 6,
    studentName: "Tom Brown",
    type: "resumed",
    message: "Resumed quiz activity",
    time: "2:45 PM",
    severity: "info",
  },
  {
    id: 7,
    studentName: "Mike Johnson",
    type: "warning",
    message: "Tab switch detected",
    time: "2:40 PM",
    severity: "warning",
  },
  {
    id: 8,
    studentName: "Lisa Wang",
    type: "flagged",
    message: "Completed 9 questions in 8 minutes",
    time: "2:38 PM",
    severity: "critical",
  },
  {
    id: 9,
    studentName: "Emma Wilson",
    type: "started",
    message: "Started the quiz",
    time: "2:30 PM",
    severity: "info",
  },
  {
    id: 10,
    studentName: "John Doe",
    type: "started",
    message: "Started the quiz",
    time: "2:30 PM",
    severity: "info",
  },
]

type ViewMode = "grid" | "list"
type FilterMode = "all" | "active" | "flagged" | "finished" | "not_started"

const STUDENTS_PER_PAGE = 12

export default function QuizMonitorPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [students, setStudents] = useState(mockStudents)
  const [selectedStudent, setSelectedStudent] = useState<(typeof mockStudents)[0] | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [filterMode, setFilterMode] = useState<FilterMode>("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [messageDialog, setMessageDialog] = useState(false)
  const [messageText, setMessageText] = useState("")
  const [extendTimeDialog, setExtendTimeDialog] = useState(false)
  const [extendMinutes, setExtendMinutes] = useState("5")
  const [currentPage, setCurrentPage] = useState(1)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs)

  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    student: (typeof mockStudents)[0]
  } | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    action: () => void
  }>({
    open: false,
    title: "",
    description: "",
    action: () => {},
  })

  // TODO: Replace with actual data fetching from database
  // const fetchQuizData = async () => {
  //   const response = await fetch(`/api/quiz/${params.id}/monitor`)
  //   const data = await response.json()
  //   setStudents(data.students)
  // }

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      handleRefresh()
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    const handleScroll = () => setContextMenu(null)

    if (contextMenu) {
      document.addEventListener("click", handleClick)
      document.addEventListener("scroll", handleScroll, true)
      return () => {
        document.removeEventListener("click", handleClick)
        document.removeEventListener("scroll", handleScroll, true)
      }
    }
  }, [contextMenu])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    // TODO: Fetch updated data from database
    // fetchQuizData()

    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false)
    }, 500)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30"
      case "idle":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30"
      case "finished":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30"
      case "not_started":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/30"
      case "flagged":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Circle className="h-3 w-3 fill-green-500 text-green-500" />
      case "idle":
        return <Pause className="h-3 w-3" />
      case "finished":
        return <CheckCircle2 className="h-3 w-3" />
      case "not_started":
        return <Circle className="h-3 w-3" />
      case "flagged":
        return <AlertTriangle className="h-3 w-3" />
      default:
        return <Circle className="h-3 w-3" />
    }
  }

  const getFlagSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 dark:text-red-400"
      case "warning":
        return "text-orange-600 dark:text-orange-400"
      case "info":
        return "text-blue-600 dark:text-blue-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const filteredStudents = students.filter((student) => {
    if (filterMode === "all") return true
    return student.status === filterMode
  })

  const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE)
  const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE
  const endIndex = startIndex + STUDENTS_PER_PAGE
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [filterMode])

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "active").length,
    idle: students.filter((s) => s.status === "idle").length,
    finished: students.filter((s) => s.status === "finished").length,
    notStarted: students.filter((s) => s.status === "not_started").length,
    flagged: students.filter((s) => s.status === "flagged").length,
    avgProgress: Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length),
    avgTime: "18:25", // TODO: Calculate from actual data
  }

  const getActivityIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "finished":
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      case "idle":
        return <Pause className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      case "flagged":
        return <Flag className="h-4 w-4 text-red-600 dark:text-red-400" />
      case "started":
        return <Circle className="h-4 w-4 fill-green-500 text-green-500" />
      case "resumed":
        return <Circle className="h-4 w-4 fill-blue-500 text-blue-500" />
      case "answered":
        return <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      case "manual":
        return <Flag className="h-4 w-4 text-red-600 dark:text-red-400" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send.",
        variant: "destructive",
      })
      return
    }

    // TODO: Send message to student via database/notification system
    toast({
      title: "Message Sent",
      description: `Message sent to ${selectedStudent?.name}`,
    })
    setMessageDialog(false)
    setMessageText("")
  }

  const handleExtendTime = () => {
    const minutes = Number.parseInt(extendMinutes)
    if (isNaN(minutes) || minutes <= 0) {
      toast({
        title: "Invalid Time",
        description: "Please enter a valid number of minutes.",
        variant: "destructive",
      })
      return
    }

    // TODO: Update quiz time limit in database
    toast({
      title: "Time Extended",
      description: `Added ${minutes} minutes for ${selectedStudent?.name}`,
    })
    setExtendTimeDialog(false)
    setExtendMinutes("5")
  }

  const handleEndQuiz = (studentId: number) => {
    const student = students.find((s) => s.id === studentId)
    if (!student) return

    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status: "finished" as const } : s)))

    toast({
      title: "Quiz Ended",
      description: `Quiz has been ended for ${student.name}.`,
    })

    setActivityLogs((prev) => [
      {
        id: Date.now(),
        studentName: student.name,
        type: "finished",
        message: "Quiz ended by teacher",
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        severity: "info",
      },
      ...prev,
    ])
  }

  const handleFlagStudent = (studentId: number) => {
    const student = students.find((s) => s.id === studentId)
    if (!student) return

    const isFlagged = student.status === "flagged"

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              status: isFlagged ? "active" : ("flagged" as const),
              flags: isFlagged
                ? []
                : [
                    ...s.flags,
                    {
                      type: "manual",
                      message: "Manually flagged by teacher for review",
                      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
                      severity: "warning" as const,
                    },
                  ],
            }
          : s,
      ),
    )

    toast({
      title: isFlagged ? "Flag Removed" : "Student Flagged",
      description: isFlagged ? `Flag removed from ${student.name}.` : `${student.name} has been flagged for review.`,
    })

    if (!isFlagged) {
      setActivityLogs((prev) => [
        {
          id: Date.now(),
          studentName: student.name,
          type: "flagged",
          message: "Manually flagged by teacher",
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          severity: "warning",
        },
        ...prev,
      ])
    }
  }

  const handleContextMenu = (e: React.MouseEvent, student: (typeof mockStudents)[0]) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      student,
    })
  }

  const handleContextAction = (action: string, student: (typeof mockStudents)[0]) => {
    setContextMenu(null)

    switch (action) {
      case "view":
        setSelectedStudent(student)
        break
      case "flag":
        setConfirmDialog({
          open: true,
          title: student.status === "flagged" ? "Remove Flag?" : "Flag Student?",
          description:
            student.status === "flagged"
              ? `Are you sure you want to remove the flag from ${student.name}?`
              : `Are you sure you want to flag ${student.name} for review?`,
          action: () => handleFlagStudent(student.id),
        })
        break
      case "end":
        setConfirmDialog({
          open: true,
          title: "End Quiz?",
          description: `Are you sure you want to end the quiz for ${student.name}? This action cannot be undone.`,
          action: () => handleEndQuiz(student.id),
        })
        break
      case "message":
        setSelectedStudent(student)
        setMessageDialog(true)
        break
      case "extend":
        setSelectedStudent(student)
        setExtendTimeDialog(true)
        break
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Live Quiz Monitor</h1>
              <p className="text-muted-foreground">{mockQuizData.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30">
              Active
            </Badge>
            <span className="text-sm text-muted-foreground">
              {mockQuizData.startTime} - {mockQuizData.endTime}
            </span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
              <Circle className="h-4 w-4 fill-green-500" />
              <span className="text-xs">Active</span>
            </div>
            <p className="text-2xl font-bold">{stats.active}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-1">
              <Pause className="h-4 w-4" />
              <span className="text-xs">Idle</span>
            </div>
            <p className="text-2xl font-bold">{stats.idle}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs">Finished</span>
            </div>
            <p className="text-2xl font-bold">{stats.finished}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
              <Circle className="h-4 w-4" />
              <span className="text-xs">Not Started</span>
            </div>
            <p className="text-2xl font-bold">{stats.notStarted}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">Flagged</span>
            </div>
            <p className="text-2xl font-bold">{stats.flagged}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Avg Time</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgTime}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Avg Progress</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgProgress}%</p>
          </Card>
        </div>

        {/* Controls */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={filterMode === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMode("all")}
              >
                All
              </Button>
              <Button
                variant={filterMode === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMode("active")}
              >
                Active
              </Button>
              <Button
                variant={filterMode === "flagged" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMode("flagged")}
              >
                Flagged
              </Button>
              <Button
                variant={filterMode === "finished" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMode("finished")}
              >
                Finished
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                Auto-refresh {autoRefresh ? "ON" : "OFF"}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Students Section */}
          <div className="space-y-4">
            {/* Students Grid/List */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedStudents.map((student) => (
                  <Card
                    key={student.id}
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedStudent(student)}
                    onContextMenu={(e) => handleContextMenu(e, student)}
                  >
                    <div className="space-y-3">
                      {/* Student Name & Status */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{student.name}</h3>
                          <Badge className={`${getStatusColor(student.status)} mt-1`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(student.status)}
                              <span className="capitalize">{student.status.replace("_", " ")}</span>
                            </span>
                          </Badge>
                        </div>
                        {student.flags.length > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {student.flags.length}
                          </Badge>
                        )}
                      </div>

                      {/* Progress */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{student.progress}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Question</p>
                          <p className="font-medium">
                            {student.currentQuestion}/{student.totalQuestions}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Time</p>
                          <p className="font-medium">{student.timeSpent}</p>
                        </div>
                      </div>

                      {/* Flags */}
                      {student.flags.length > 0 && (
                        <div className="space-y-1">
                          {student.flags.slice(0, 2).map((flag, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs">
                              <AlertTriangle
                                className={`h-3 w-3 mt-0.5 flex-shrink-0 ${getFlagSeverityColor(flag.severity)}`}
                              />
                              <span className="text-muted-foreground line-clamp-1">{flag.message}</span>
                            </div>
                          ))}
                          {student.flags.length > 2 && (
                            <p className="text-xs text-muted-foreground">+{student.flags.length - 2} more</p>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <div className="divide-y">
                  {paginatedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="p-4 hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => setSelectedStudent(student)}
                      onContextMenu={(e) => handleContextMenu(e, student)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{student.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Started: {student.startedAt || "Not started"}
                            </p>
                          </div>
                          <Badge className={getStatusColor(student.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(student.status)}
                              <span className="capitalize">{student.status.replace("_", " ")}</span>
                            </span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Question</p>
                            <p className="font-medium">
                              {student.currentQuestion}/{student.totalQuestions}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Time</p>
                            <p className="font-medium">{student.timeSpent}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Progress</p>
                            <p className="font-medium">{student.progress}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Flags</p>
                            <p className="font-medium">{student.flags.length}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {totalPages > 1 && (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length}{" "}
                    students
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <Card className="p-4 h-fit lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Activity Feed
              </h3>
              <Badge variant="secondary">{activityLogs.length}</Badge>
            </div>

            {/* Scrollable Activity List */}
            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    log.severity === "critical"
                      ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/30"
                      : log.severity === "warning"
                        ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900/30"
                        : "bg-accent border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getActivityIcon(log.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{log.studentName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{log.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{log.time}</p>
                    </div>
                    {log.severity && (
                      <Badge
                        variant={log.severity === "critical" ? "destructive" : "secondary"}
                        className="text-xs shrink-0"
                      >
                        {log.severity}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Student Detail Dialog */}
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Student Details - {selectedStudent?.name}</DialogTitle>
            </DialogHeader>

            {selectedStudent && (
              <div className="space-y-6">
                {/* Status Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <Badge className={getStatusColor(selectedStudent.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(selectedStudent.status)}
                        <span className="capitalize">{selectedStudent.status.replace("_", " ")}</span>
                      </span>
                    </Badge>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Progress</p>
                    <p className="text-2xl font-bold">{selectedStudent.progress}%</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Time Spent</p>
                    <p className="text-2xl font-bold">{selectedStudent.timeSpent}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Flags</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{selectedStudent.flags.length}</p>
                  </Card>
                </div>

                {/* Flags */}
                {selectedStudent.flags.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      Flags ({selectedStudent.flags.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedStudent.flags.map((flag, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-accent rounded-lg">
                          <AlertTriangle
                            className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getFlagSeverityColor(flag.severity)}`}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{flag.message}</p>
                            <p className="text-sm text-muted-foreground">{flag.time}</p>
                          </div>
                          <Badge variant={flag.severity === "critical" ? "destructive" : "secondary"}>
                            {flag.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Answer History */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Answer History
                  </h3>
                  <div className="space-y-2">
                    {selectedStudent.answers.map((answer, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                        <div className="flex items-center gap-3">
                          {answer.correct ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                          <span className="font-medium">Question {answer.question}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{answer.time}</span>
                          <Badge variant={answer.correct ? "default" : "destructive"}>
                            {answer.correct ? "Correct" : "Wrong"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {selectedStudent.currentQuestion > selectedStudent.answers.length && (
                      <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                        <div className="flex items-center gap-3">
                          <Circle className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Question {selectedStudent.currentQuestion}</span>
                        </div>
                        <Badge variant="secondary">In Progress</Badge>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Activity Timeline */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Activity Timeline
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-20 text-sm text-muted-foreground">{selectedStudent.startedAt}</div>
                      <div className="flex-1">
                        <p className="font-medium">Started quiz</p>
                      </div>
                    </div>
                    {selectedStudent.flags.map((flag, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-20 text-sm text-muted-foreground">{flag.time}</div>
                        <div className="flex-1">
                          <p className={`font-medium ${getFlagSeverityColor(flag.severity)}`}>{flag.message}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-start gap-3">
                      <div className="w-20 text-sm text-muted-foreground">{selectedStudent.lastActivity}</div>
                      <div className="flex-1">
                        <p className="font-medium">Last activity</p>
                      </div>
                    </div>
                    {selectedStudent.finishedAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-20 text-sm text-muted-foreground">{selectedStudent.finishedAt}</div>
                        <div className="flex-1">
                          <p className="font-medium text-green-600 dark:text-green-400">Finished quiz</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Teacher Actions */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Teacher Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMessageDialog(true)
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setExtendTimeDialog(true)
                      }}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Extend Time
                    </Button>
                    <Button variant="outline" onClick={() => handleFlagStudent(selectedStudent.id)}>
                      <Flag className="h-4 w-4 mr-2" />
                      Flag for Review
                    </Button>
                    <Button variant="outline" onClick={() => handleEndQuiz(selectedStudent.id)}>
                      <XCircle className="h-4 w-4 mr-2" />
                      End Quiz
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Send Message Dialog */}
        <Dialog open={messageDialog} onOpenChange={setMessageDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Message to {selectedStudent?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setMessageDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendMessage}>Send Message</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Extend Time Dialog */}
        <Dialog open={extendTimeDialog} onOpenChange={setExtendTimeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Extend Time for {selectedStudent?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="minutes">Additional Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="1"
                  value={extendMinutes}
                  onChange={(e) => setExtendMinutes(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setExtendTimeDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleExtendTime}>Extend Time</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {contextMenu && (
          <div
            className="fixed z-50 bg-popover border rounded-lg shadow-lg py-1 min-w-[180px]"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
              onClick={() => handleContextAction("view", contextMenu.student)}
            >
              <Eye className="h-4 w-4" />
              View Details
            </button>
            <button
              className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
              onClick={() => handleContextAction("flag", contextMenu.student)}
            >
              <Flag className="h-4 w-4" />
              {contextMenu.student.status === "flagged" ? "Remove Flag" : "Flag for Review"}
            </button>
            <button
              className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
              onClick={() => handleContextAction("message", contextMenu.student)}
            >
              <MessageSquare className="h-4 w-4" />
              Send Message
            </button>
            <button
              className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
              onClick={() => handleContextAction("extend", contextMenu.student)}
            >
              <Clock className="h-4 w-4" />
              Extend Time
            </button>
            <div className="border-t my-1" />
            <button
              className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2 text-destructive"
              onClick={() => handleContextAction("end", contextMenu.student)}
            >
              <XCircle className="h-4 w-4" />
              End Quiz
            </button>
          </div>
        )}

        <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
              <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  confirmDialog.action()
                  setConfirmDialog({ ...confirmDialog, open: false })
                }}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
