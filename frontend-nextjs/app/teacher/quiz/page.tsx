"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
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
import {
  ClipboardList,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  Play,
  Pause,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  BookOpen,
  Target,
  TrendingUp,
  Settings,
  Download,
  Upload,
  Filter,
  SortAsc,
  Calendar,
  Award,
  Zap,
  ChevronDown,
  Share2,
  AlertCircle,
  Monitor,
  Send,
  FileText,
  Tag,
  X,
  CheckCircle2,
  MoreVertical,
  AlertTriangle,
  Info,
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog" // Added for Share modal
import { useToast } from "@/components/ui/use-toast" // Import toast
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Mock quiz data
const quizzesData = [
  {
    id: "QZ001",
    title: "Mathematics - Algebra Basics",
    subject: "Mathematics",
    grade: "Grade 8",
    questions: 15,
    duration: 30,
    status: "active",
    attempts: 45,
    avgScore: 82.5,
    created: "2024-01-10",
    dueDate: "2024-01-25",
    type: "mixed",
  },
  {
    id: "QZ002",
    title: "Science - Periodic Table",
    subject: "Science",
    grade: "Grade 8",
    questions: 20,
    duration: 45,
    status: "draft",
    attempts: 0,
    avgScore: 0,
    created: "2024-01-15",
    dueDate: "2024-01-30",
    type: "multiple-choice",
  },
  {
    id: "QZ003",
    title: "English - Reading Comprehension",
    subject: "English",
    grade: "Grade 8",
    questions: 12,
    duration: 25,
    status: "completed",
    attempts: 38,
    avgScore: 78.9,
    created: "2024-01-05",
    dueDate: "2024-01-20",
    type: "mixed",
  },
  {
    id: "QZ004",
    title: "Filipino - Gramatika",
    subject: "Filipino",
    grade: "Grade 8",
    questions: 18,
    duration: 35,
    status: "active",
    attempts: 32,
    avgScore: 85.2,
    created: "2024-01-12",
    dueDate: "2024-01-27",
    type: "true-false",
  },
  {
    id: "QZ005",
    title: "History - World War II",
    subject: "History",
    grade: "Grade 8",
    questions: 25,
    duration: 40,
    status: "scheduled",
    attempts: 0,
    avgScore: 0,
    created: "2024-01-18",
    dueDate: "2024-02-05",
    scheduledDate: "2024-01-28T09:00:00",
    type: "mixed",
  },
  {
    id: "QZ006",
    title: "Mathematics - Geometry Fundamentals",
    subject: "Mathematics",
    grade: "Grade 8",
    questions: 20,
    duration: 35,
    status: "scheduled",
    attempts: 0,
    avgScore: 0,
    created: "2024-01-19",
    dueDate: "2024-02-10",
    scheduledDate: "2024-01-30T10:30:00",
    type: "multiple-choice",
  },
  {
    id: "QZ007",
    title: "Science - Chemical Reactions",
    subject: "Science",
    grade: "Grade 8",
    questions: 15,
    duration: 30,
    status: "scheduled",
    attempts: 0,
    avgScore: 0,
    created: "2024-01-20",
    dueDate: "2024-02-15",
    scheduledDate: "2024-02-01T14:00:00",
    type: "mixed",
  },
  {
    id: "QZ008",
    title: "Mathematics - Trigonometry Basics",
    subject: "Mathematics",
    grade: "Grade 8",
    questions: 18,
    duration: 40,
    status: "draft",
    attempts: 0,
    avgScore: 0,
    created: "2024-01-21",
    dueDate: "2024-02-20",
    type: "mixed",
  },
  {
    id: "QZ009",
    title: "English - Grammar and Punctuation",
    subject: "English",
    grade: "Grade 8",
    questions: 22,
    duration: 35,
    status: "draft",
    attempts: 0,
    avgScore: 0,
    created: "2024-01-22",
    dueDate: "2024-02-25",
    type: "multiple-choice",
  },
  {
    id: "QZ010",
    title: "Science - Human Body Systems",
    subject: "Science",
    grade: "Grade 8",
    questions: 16,
    duration: 30,
    status: "draft",
    attempts: 0,
    avgScore: 0,
    created: "2024-01-23",
    dueDate: "2024-03-01",
    type: "mixed",
  },
  {
    id: "QZ011",
    title: "Filipino - Panitikan at Kultura",
    subject: "Filipino",
    grade: "Grade 8",
    questions: 14,
    duration: 25,
    status: "draft",
    attempts: 0,
    avgScore: 0,
    created: "2024-01-24",
    dueDate: "2024-03-05",
    type: "short-answer",
  },
]

const questionTypes = [
  { id: "multiple-choice", name: "Multiple Choice", icon: "○", description: "Single correct answer from options" },
  { id: "true-false", name: "True/False", icon: "✓", description: "Binary choice questions" },
  { id: "short-answer", name: "Short Answer", icon: "✎", description: "Brief text responses" },
  { id: "essay", name: "Essay", icon: "📝", description: "Long-form written responses" },
  { id: "matching", name: "Matching", icon: "⟷", description: "Match items from two lists" },
  { id: "fill-blank", name: "Fill in the Blank", icon: "___", description: "Complete missing words" },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500/10 text-green-600 border-green-500/20"
    case "draft":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
    case "completed":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20"
    case "paused":
      return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    case "scheduled":
      return "bg-purple-500/10 text-purple-600 border-purple-500/20"
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <Play className="w-4 h-4" />
    case "draft":
      return <Edit className="w-4 h-4" />
    case "completed":
      return <CheckCircle className="w-4 h-4" />
    case "paused":
      return <Pause className="w-4 h-4" />
    case "scheduled":
      return <Calendar className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

export default function TeacherQuizPage() {
  const router = useRouter()
  const { toast } = useToast() // Initialize toast
  const [activeTab, setActiveTab] = useState("all-quizzes")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [sortBy, setSortBy] = useState("created")
  const [viewMode, setViewMode] = useState("table") // table or cards
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [quizToDelete, setQuizToDelete] = useState<any>(null)
  const [contextMenu, setContextMenu] = useState<{
    show: boolean
    x: number
    y: number
    quiz: any
  }>({ show: false, x: 0, y: 0, quiz: null })

  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareQuiz, setShareQuiz] = useState<any>(null)

  const [quizzes, setQuizzes] = useState(quizzesData)

  const [statusConfirmation, setStatusConfirmation] = useState<{
    open: boolean
    quizId: string
    quizTitle: string
    newStatus: string
  }>({
    open: false,
    quizId: "",
    quizTitle: "",
    newStatus: "",
  })

  const [wizardStep, setWizardStep] = useState<"select-type" | "fill-details">("select-type")
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [previewQuestion, setPreviewQuestion] = useState<any>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)
  const [addQuestionDialogOpen, setAddQuestionDialogOpen] = useState(false)
  const [questionSearchQuery, setQuestionSearchQuery] = useState("")
  const [selectedQuestionType, setSelectedQuestionType] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [newQuestion, setNewQuestion] = useState({
    type: "multiple-choice",
    question: "",
    subject: "",
    difficulty: "medium",
    points: 1,
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    tags: [] as string[],
  })

  const [editWarningOpen, setEditWarningOpen] = useState(false)
  const [questionToEdit, setQuestionToEdit] = useState<any>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (contextMenu.show) {
        setContextMenu({ show: false, x: 0, y: 0, quiz: null })
      }
    }

    // Add scroll event listener to window
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Also add to any scrollable containers within the page
    const scrollableElements = document.querySelectorAll("[data-scrollable]")
    scrollableElements.forEach((element) => {
      element.addEventListener("scroll", handleScroll, { passive: true })
    })

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll)
      scrollableElements.forEach((element) => {
        element.removeEventListener("scroll", handleScroll)
      })
    }
  }, [contextMenu.show])

  const tabs = [
    { id: "all-quizzes", label: "All Quizzes", icon: ClipboardList, count: quizzes.length },
    { id: "question-bank", label: "Question Bank", icon: BookOpen, count: 24 },
    { id: "analytics", label: "Analytics", icon: BarChart3, count: null },
  ]

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = selectedSubject === "all" || quiz.subject === selectedSubject
    const matchesStatus = selectedStatus === "all" || quiz.status.toLowerCase() === selectedStatus.toLowerCase()
    return matchesSearch && matchesSubject && matchesStatus
  })

  const sortedQuizzes = filteredQuizzes.sort((a, b) => {
    if (sortBy === "created") {
      return new Date(b.created).getTime() - new Date(a.created).getTime()
    } else if (sortBy === "title") {
      return a.title.localeCompare(b.title)
    } else if (sortBy === "attempts") {
      return b.attempts - a.attempts
    } else if (sortBy === "score") {
      return b.avgScore - a.avgScore
    }
    return 0
  })

  const groupedQuizzes = {
    active: sortedQuizzes.filter((quiz) => quiz.status === "active"),
    draft: sortedQuizzes.filter((quiz) => quiz.status === "draft"),
    completed: sortedQuizzes.filter((quiz) => quiz.status === "completed"),
    paused: sortedQuizzes.filter((quiz) => quiz.status === "paused"),
    scheduled: sortedQuizzes
      .filter((quiz) => quiz.status === "scheduled")
      .sort((a, b) => {
        const dateA = new Date(a.scheduledDate || a.created).getTime()
        const dateB = new Date(b.scheduledDate || b.created).getTime()
        return dateA - dateB
      }),
  }

  const handleCreateQuiz = () => {
    router.push("/teacher/quiz/create")
  }

  const handleDeleteClick = (quiz: any) => {
    setQuizToDelete(quiz)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (quizToDelete) {
      // Here you would implement the actual delete logic
      setQuizzes((prevQuizzes) => prevQuizzes.filter((q) => q.id !== quizToDelete.id))
      console.log("Deleting quiz:", quizToDelete.id)
      toast({
        title: "Quiz Deleted",
        description: `"${quizToDelete.title}" has been successfully deleted.`,
        variant: "destructive",
        duration: 3000,
      })
      setDeleteDialogOpen(false)
      setQuizToDelete(null)
    }
  }

  const handleRightClick = (e: React.MouseEvent, quiz: any) => {
    e.preventDefault()
    e.stopPropagation()

    console.log("[v0] Right click event:", {
      clientX: e.clientX,
      clientY: e.clientY,
      pageX: e.pageX,
      pageY: e.pageY,
      scrollY: window.scrollY,
    })

    const menuWidth = 180 // min-w-[180px] from the menu
    const menuHeight = 200 // estimated height for menu items
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let x = e.clientX
    let y = e.clientY

    // Adjust x position if menu would go off right edge
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10
    }

    // Adjust y position if menu would go off bottom edge
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10
    }

    // Ensure minimum distance from edges
    x = Math.max(10, x)
    y = Math.max(10, y)

    console.log("[v0] Final menu position:", { x, y })

    setContextMenu({
      show: true,
      x: x,
      y: y,
      quiz: quiz,
    })
  }

  const updateQuizStatus = (quizId: string, newStatus: string) => {
    setQuizzes((prevQuizzes) =>
      prevQuizzes.map((quiz) =>
        quiz.id === quizId
          ? { ...quiz, status: newStatus.toLowerCase() } // Ensure status is lowercase for consistency
          : quiz,
      ),
    )

    // Show success toast
    toast({
      title: "Status Updated!",
      description: `Quiz status has been changed to ${newStatus}.`,
      variant: "success",
      duration: 4000,
    })
  }

  const requestStatusChange = (quizId: string, quizTitle: string, newStatus: string) => {
    setStatusConfirmation({
      open: true,
      quizId,
      quizTitle,
      newStatus,
    })
  }

  const confirmStatusChange = () => {
    updateQuizStatus(statusConfirmation.quizId, statusConfirmation.newStatus)
    setStatusConfirmation({
      open: false,
      quizId: "",
      quizTitle: "",
      newStatus: "",
    })
  }

  const cancelStatusChange = () => {
    setStatusConfirmation({
      open: false,
      quizId: "",
      quizTitle: "",
      newStatus: "",
    })
  }

  // Handle context menu actions with updated logic
  const handleContextMenuAction = (action: string) => {
    if (contextMenu.quiz) {
      switch (action) {
        case "view":
          router.push(`/teacher/quiz/${contextMenu.quiz.id}`)
          break
        case "analytics":
          router.push(`/teacher/quiz/${contextMenu.quiz.id}/analytics`)
          break
        case "share":
          setShareQuiz(contextMenu.quiz)
          setShareModalOpen(true) // Open the share modal
          break
        case "delete":
          handleDeleteClick(contextMenu.quiz)
          break
        case "draft":
        case "private":
        case "offline":
          requestStatusChange(contextMenu.quiz.id, contextMenu.quiz.title, "Draft")
          break
        case "active":
          requestStatusChange(contextMenu.quiz.id, contextMenu.quiz.title, "Active")
          break
        // Add 'scheduled' action to context menu for scheduled quizzes
        case "scheduled":
          requestStatusChange(contextMenu.quiz.id, contextMenu.quiz.title, "Scheduled")
          break
      }
    }
    setContextMenu({ show: false, x: 0, y: 0, quiz: null })
  }

  const copyQuizLink = () => {
    if (shareQuiz) {
      const quizLink = `${window.location.origin}/quiz/${shareQuiz.id}`
      navigator.clipboard.writeText(quizLink)
      console.log("[v0] Copy button clicked, showing toast") // Added debug log
      toast({
        title: "Link Copied Successfully!",
        description: "Quiz link has been copied to clipboard",
        duration: 3000,
      })
      console.log("[v0] Toast called") // Added debug log
    }
  }

  const getQRCodeUrl = () => {
    if (shareQuiz) {
      const quizLink = `${window.location.origin}/quiz/${shareQuiz.id}`
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(quizLink)}`
    }
    return ""
  }

  const handleClickOutside = () => {
    setContextMenu({ show: false, x: 0, y: 0, quiz: null })
  }

  // Mock question bank data
  const questionBankData = [
    {
      id: "q1",
      type: "Multiple Choice",
      question: "What is the quadratic formula?",
      subject: "Mathematics",
      difficulty: "Medium",
      points: 2,
      tags: ["algebra", "equations"],
      usedIn: 3,
      createdAt: "2024-01-15",
      options: [
        "x = (-b ± √(b²-4ac)) / 2a",
        "x = (b ± √(b²-4ac)) / 2a",
        "x = (-b ± √(b²-4ac)) / a",
        "x = (b ± √(b²-4ac)) / a",
      ],
      correctAnswer: "x = (-b ± √(b²-4ac)) / 2a",
      explanation: "The quadratic formula solves for x in any quadratic equation of the form ax² + bx + c = 0.",
    },
    {
      id: "q2",
      type: "True/False",
      question: "The mitochondria is the powerhouse of the cell.",
      subject: "Science",
      difficulty: "Easy",
      points: 1,
      tags: ["biology", "cells"],
      usedIn: 5,
      createdAt: "2024-01-14",
      correctAnswer: "true",
      explanation:
        "The mitochondria are responsible for generating most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy.",
    },
    {
      id: "q3",
      type: "Essay",
      question: "Explain the water cycle in your own words.",
      subject: "Science",
      difficulty: "Hard",
      points: 5,
      tags: ["earth science", "water"],
      usedIn: 2,
      createdAt: "2024-01-13",
      explanation:
        "Key points to cover include evaporation, transpiration, condensation, precipitation, and collection. Discuss the role of the sun and gravity.",
    },
    {
      id: "q4",
      type: "Multiple Choice",
      question: "What is the capital of France?",
      subject: "Geography",
      difficulty: "Easy",
      points: 1,
      tags: ["europe", "capitals"],
      usedIn: 8,
      createdAt: "2024-01-12",
      options: ["Berlin", "Madrid", "Paris", "Rome"],
      correctAnswer: "Paris",
      explanation: "Paris is the capital and most populous city of France.",
    },
    {
      id: "q5",
      type: "Short Answer",
      question: "Solve for x: 2x + 5 = 15",
      subject: "Mathematics",
      difficulty: "Medium",
      points: 2,
      tags: ["algebra", "equations"],
      usedIn: 4,
      createdAt: "2024-01-11",
      correctAnswer: "x=5",
      explanation: "Subtract 5 from both sides (2x = 10), then divide by 2 (x = 5).",
    },
  ]

  const filteredQuestions = questionBankData.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(questionSearchQuery.toLowerCase()) ||
      q.tags.some((tag) => tag.toLowerCase().includes(questionSearchQuery.toLowerCase()))
    const matchesType = selectedQuestionType === "all" || q.type === selectedQuestionType
    const matchesDifficulty = selectedDifficulty === "all" || q.difficulty.toLowerCase() === selectedDifficulty
    return matchesSearch && matchesType && matchesDifficulty
  })

  const handleAddQuestion = () => {
    if (editingQuestionId) {
      console.log("[v0] Editing question:", editingQuestionId, newQuestion)
      // Edit question logic here
      toast({
        title: "Question Updated",
        description: `Question "${newQuestion.question.substring(0, 30)}..." has been updated.`,
        variant: "success",
        duration: 3000,
      })
    } else {
      console.log("[v0] Adding new question:", newQuestion)
      // Add question logic here
      toast({
        title: "Question Added",
        description: `New question "${newQuestion.question.substring(0, 30)}..." added to your bank.`,
        variant: "success",
        duration: 3000,
      })
    }
    handleCloseQuestionDialog()
  }

  const handleCloseQuestionDialog = () => {
    setAddQuestionDialogOpen(false)
    setWizardStep("select-type")
    setEditingQuestionId(null)
    setNewQuestion({
      type: "multiple-choice",
      question: "",
      subject: "",
      difficulty: "medium",
      points: 1,
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      tags: [],
    })
  }

  const handleSelectQuestionType = (type: string) => {
    setNewQuestion({ ...newQuestion, type })
    setWizardStep("fill-details")
  }

  const handleEditQuestion = (question: any) => {
    // Check if question is used in quizzes and warn
    if (question.usedIn > 0) {
      setQuestionToEdit(question)
      setEditWarningOpen(true)
      return
    }

    // If not used in quizzes, proceed directly
    proceedWithEdit(question)
  }

  const proceedWithEdit = (question: any) => {
    // Pre-fill form with existing question data
    setEditingQuestionId(question.id)
    setNewQuestion({
      type: question.type.toLowerCase().replace(/\s+/g, "-").replace("/", "-"),
      question: question.question,
      subject: question.subject,
      difficulty: question.difficulty.toLowerCase(),
      points: question.points,
      options: question.options || ["", "", "", ""],
      correctAnswer: question.correctAnswer || "",
      explanation: question.explanation || "",
      tags: question.tags || [],
    })
    setWizardStep("fill-details")
    setAddQuestionDialogOpen(true)
    setEditWarningOpen(false) // Close the warning dialog
  }

  const handlePreviewQuestion = (question: any) => {
    setPreviewQuestion(question)
  }

  const handleDeleteQuestion = (questionId: string) => {
    setQuestionToDelete(questionId)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteQuestion = () => {
    console.log("[v0] Deleting question:", questionToDelete)
    // Delete question logic here
    toast({
      title: "Question Deleted",
      description: `Question with ID ${questionToDelete} has been deleted.`,
      variant: "destructive",
      duration: 3000,
    })
    setDeleteConfirmOpen(false)
    setQuestionToDelete(null)
  }

  const questionBankDataMock = [
    // Renamed to avoid conflict if questionBankData is defined elsewhere
    {
      id: "q1",
      type: "Multiple Choice",
      question: "What is the quadratic formula?",
      subject: "Mathematics",
      difficulty: "Medium",
      points: 2,
      tags: ["algebra", "equations"],
      usedIn: 3,
      createdAt: "2024-01-15",
      options: [
        "x = (-b ± √(b²-4ac)) / 2a",
        "x = (b ± √(b²-4ac)) / 2a",
        "x = (-b ± √(b²-4ac)) / a",
        "x = (b ± √(b²-4ac)) / a",
      ],
      correctAnswer: "x = (-b ± √(b²-4ac)) / 2a",
      explanation: "The quadratic formula solves for x in any quadratic equation of the form ax² + bx + c = 0.",
    },
    {
      id: "q2",
      type: "True/False",
      question: "The mitochondria is the powerhouse of the cell.",
      subject: "Science",
      difficulty: "Easy",
      points: 1,
      tags: ["biology", "cells"],
      usedIn: 5,
      createdAt: "2024-01-14",
      correctAnswer: "true",
      explanation:
        "The mitochondria are responsible for generating most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy.",
    },
    {
      id: "q3",
      type: "Essay",
      question: "Explain the water cycle in your own words.",
      subject: "Science",
      difficulty: "Hard",
      points: 5,
      tags: ["earth science", "water"],
      usedIn: 2,
      createdAt: "2024-01-13",
      explanation:
        "Key points to cover include evaporation, transpiration, condensation, precipitation, and collection. Discuss the role of the sun and gravity.",
    },
    {
      id: "q4",
      type: "Multiple Choice",
      question: "What is the capital of France?",
      subject: "Geography",
      difficulty: "Easy",
      points: 1,
      tags: ["europe", "capitals"],
      usedIn: 8,
      createdAt: "2024-01-12",
      options: ["Berlin", "Madrid", "Paris", "Rome"],
      correctAnswer: "Paris",
      explanation: "Paris is the capital and most populous city of France.",
    },
    {
      id: "q5",
      type: "Short Answer",
      question: "Solve for x: 2x + 5 = 15",
      subject: "Mathematics",
      difficulty: "Medium",
      points: 2,
      tags: ["algebra", "equations"],
      usedIn: 4,
      createdAt: "2024-01-11",
      correctAnswer: "x=5",
      explanation: "Subtract 5 from both sides (2x = 10), then divide by 2 (x = 5).",
    },
  ]

  const filteredQuestionsBank = questionBankDataMock.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(questionSearchQuery.toLowerCase()) ||
      q.tags.some((tag) => tag.toLowerCase().includes(questionSearchQuery.toLowerCase()))
    const matchesType = selectedQuestionType === "all" || q.type === selectedQuestionType
    const matchesDifficulty = selectedDifficulty === "all" || q.difficulty.toLowerCase() === selectedDifficulty
    return matchesSearch && matchesType && matchesDifficulty
  })

  const handleBulkDelete = () => {
    console.log("[v0] Deleting questions:", selectedQuestions)
    toast({
      title: "Questions Deleted",
      description: `${selectedQuestions.length} question(s) have been deleted.`,
      variant: "destructive",
      duration: 3000,
    })
    setSelectedQuestions([])
  }

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId],
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8">
      {/* Enhanced Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800 p-6 lg:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <ClipboardList className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Quiz Central
                </h1>
                <p className="text-blue-100 text-lg">Create, manage, and analyze quizzes and assessments</p>
              </div>
            </div>

            {/* Quick Stats in Header */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">{quizzes.length} Total Quizzes</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {quizzes.filter((q) => q.status === "active").length} Active
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{quizzes.reduce((acc, q) => acc + q.attempts, 0)} Attempts</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Questions
            </Button>
            {/* Updated Create Quiz button to use navigation instead of dialog */}
            <Button
              onClick={handleCreateQuiz}
              size="sm"
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation with Mobile Support */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Mobile Tab Menu */}
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-700">
          <Button
            variant="ghost"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full justify-between p-4 h-auto"
          >
            <div className="flex items-center gap-3">
              {(() => {
                const activeTabData = tabs.find((tab) => tab.id === activeTab)
                if (activeTabData) {
                  const IconComponent = activeTabData.icon
                  return <IconComponent className="w-5 h-5" />
                }
                return null
              })()}
              <span className="font-medium">{tabs.find((tab) => tab.id === activeTab)?.label}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isMobileMenuOpen ? "rotate-180" : ""}`} />
          </Button>

          {isMobileMenuOpen && (
            <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </div>
                  {tab.count && (
                    <Badge
                      variant="secondary"
                      className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300"
                    >
                      {tab.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden lg:block border-b border-slate-200 dark:border-slate-700">
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
                {tab.count && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "all-quizzes" && (
            <div className="space-y-6">
              {/* Enhanced Filters with Mobile Support */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search quizzes by title, subject, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-full sm:w-40 h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Filipino">Filipino</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-40 h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-40 h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <SortAsc className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created">Date Created</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="attempts">Attempts</SelectItem>
                      <SelectItem value="score">Average Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="lg:hidden space-y-6">
                {(selectedStatus === "all" || selectedStatus === "scheduled") &&
                  groupedQuizzes.scheduled.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-2 border-b-2 border-purple-200 dark:border-purple-800">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                          <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300">Scheduled Quizzes</h3>
                          <p className="text-sm text-purple-600 dark:text-green-400">
                            {groupedQuizzes.scheduled.length} quiz{groupedQuizzes.scheduled.length !== 1 ? "es" : ""}{" "}
                            scheduled
                          </p>
                        </div>
                      </div>
                      {groupedQuizzes.scheduled.map((quiz) => (
                        <Card
                          key={quiz.id}
                          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-context-menu"
                          onContextMenu={(e) => handleRightClick(e, quiz)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{quiz.title}</h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <Badge
                                    variant="secondary"
                                    className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                  >
                                    {quiz.subject}
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                  >
                                    {quiz.grade}
                                  </Badge>
                                  <Badge variant="secondary" className={`${getStatusColor(quiz.status)} select-none`}>
                                    {quiz.status}
                                  </Badge>
                                </div>
                                {/* Scheduled date display */}
                                <div className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    Goes live:{" "}
                                    {new Date(quiz.scheduledDate || quiz.created).toLocaleString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem
                                    className="flex items-center gap-2"
                                    onClick={() => router.push(`/teacher/quiz/${quiz.id}`)}
                                  >
                                    <Eye className="w-4 h-4" />
                                    View Quiz
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2"
                                    onClick={() => router.push(`/teacher/quiz/${quiz.id}/edit`)}
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit Quiz
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center gap-2">
                                    <Copy className="w-4 h-4" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Settings
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 text-red-600"
                                    onClick={() => handleDeleteClick(quiz)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <BookOpen className="w-4 h-4" />
                                <span>{quiz.questions} questions</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Clock className="w-4 h-4" />
                                <span>{quiz.duration}m</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                {/* Active Quizzes Section */}
                {(selectedStatus === "all" || selectedStatus === "active") && groupedQuizzes.active.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b-2 border-green-200 dark:border-green-800">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Play className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-green-700 dark:text-green-300">Active Quizzes</h3>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {groupedQuizzes.active.length} quiz{groupedQuizzes.active.length !== 1 ? "es" : ""} currently
                          active
                        </p>
                      </div>
                    </div>
                    {groupedQuizzes.active.map((quiz) => (
                      <Card
                        key={quiz.id}
                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-context-menu"
                        onContextMenu={(e) => handleRightClick(e, quiz)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{quiz.title}</h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge
                                  variant="secondary"
                                  className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                >
                                  {quiz.subject}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                >
                                  {quiz.grade}
                                </Badge>
                                <Badge variant="secondary" className={`${getStatusColor(quiz.status)} select-none`}>
                                  {quiz.status}
                                </Badge>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => router.push(`/teacher/quiz/${quiz.id}`)}
                                >
                                  <Eye className="w-4 h-4" />
                                  View Quiz
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => router.push(`/teacher/quiz/${quiz.id}/edit`)}
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit Quiz
                                </DropdownMenuItem>
                                {quiz.status === "active" && (
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400"
                                    onClick={() => router.push(`/teacher/quiz/${quiz.id}/monitor`)}
                                  >
                                    <Monitor className="w-4 h-4" />
                                    Live Monitor
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Copy className="w-4 h-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => router.push(`/teacher/quiz/${quiz.id}/results`)}
                                >
                                  <BarChart3 className="w-4 h-4" />
                                  View Results
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Settings className="w-4 h-4" />
                                  Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 text-red-600"
                                  onClick={() => handleDeleteClick(quiz)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <BookOpen className="w-4 h-4" />
                              <span>{quiz.questions} questions</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Clock className="w-4 h-4" />
                              <span>{quiz.duration}m</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Users className="w-4 h-4" />
                              <span>{quiz.attempts} attempts</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Award className="w-4 h-4" />
                              <span>{quiz.avgScore}% avg</span>
                            </div>
                          </div>

                          {quiz.avgScore > 0 && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Performance</span>
                                <span className="font-medium text-slate-900 dark:text-white">{quiz.avgScore}%</span>
                              </div>
                              <Progress value={quiz.avgScore} className="h-2" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Draft Quizzes Section */}
                {(selectedStatus === "all" || selectedStatus === "draft") && groupedQuizzes.draft.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b-2 border-yellow-200 dark:border-yellow-800">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                        <Edit className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-yellow-700 dark:text-yellow-300">Draft Quizzes</h3>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                          {groupedQuizzes.draft.length} quiz{groupedQuizzes.draft.length !== 1 ? "es" : ""} in draft
                        </p>
                      </div>
                    </div>
                    {groupedQuizzes.draft.map((quiz) => (
                      <Card
                        key={quiz.id}
                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-context-menu"
                        onContextMenu={(e) => handleRightClick(e, quiz)}
                      >
                        {/* Same card content structure as active quizzes */}
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{quiz.title}</h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge
                                  variant="secondary"
                                  className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                >
                                  {quiz.subject}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                >
                                  {quiz.grade}
                                </Badge>
                                <Badge variant="secondary" className={`${getStatusColor(quiz.status)} select-none`}>
                                  {quiz.status}
                                </Badge>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => router.push(`/teacher/quiz/${quiz.id}`)}
                                >
                                  <Eye className="w-4 h-4" />
                                  View Quiz
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => router.push(`/teacher/quiz/${quiz.id}/edit`)}
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit Quiz
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Copy className="w-4 h-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => router.push(`/teacher/quiz/${quiz.id}/results`)}
                                >
                                  <BarChart3 className="w-4 h-4" />
                                  View Results
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Settings className="w-4 h-4" />
                                  Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 text-red-600"
                                  onClick={() => handleDeleteClick(quiz)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <BookOpen className="w-4 h-4" />
                              <span>{quiz.questions} questions</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Clock className="w-4 h-4" />
                              <span>{quiz.duration}m</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Users className="w-4 h-4" />
                              <span>{quiz.attempts} attempts</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Award className="w-4 h-4" />
                              <span>{quiz.avgScore}% avg</span>
                            </div>
                          </div>

                          {quiz.avgScore > 0 && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Performance</span>
                                <span className="font-medium text-slate-900 dark:text-white">{quiz.avgScore}%</span>
                              </div>
                              <Progress value={quiz.avgScore} className="h-2" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Completed Quizzes Section */}
                {(selectedStatus === "all" || selectedStatus === "completed") &&
                  groupedQuizzes.completed.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-2 border-b-2 border-blue-200 dark:border-blue-800">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300">Completed Quizzes</h3>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            {groupedQuizzes.completed.length} quiz{groupedQuizzes.completed.length !== 1 ? "es" : ""}{" "}
                            completed
                          </p>
                        </div>
                      </div>
                      {groupedQuizzes.completed.map((quiz) => (
                        <Card
                          key={quiz.id}
                          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-context-menu"
                          onContextMenu={(e) => handleRightClick(e, quiz)}
                        >
                          {/* Same card content structure as active quizzes */}
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{quiz.title}</h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <Badge
                                    variant="secondary"
                                    className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                  >
                                    {quiz.subject}
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                  >
                                    {quiz.grade}
                                  </Badge>
                                  <Badge variant="secondary" className={`${getStatusColor(quiz.status)} select-none`}>
                                    {quiz.status}
                                  </Badge>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem
                                    className="flex items-center gap-2"
                                    onClick={() => router.push(`/teacher/quiz/${quiz.id}`)}
                                  >
                                    <Eye className="w-4 h-4" />
                                    View Quiz
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2"
                                    onClick={() => router.push(`/teacher/quiz/${quiz.id}/edit`)}
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit Quiz
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center gap-2">
                                    <Copy className="w-4 h-4" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2"
                                    onClick={() => router.push(`/teacher/quiz/${quiz.id}/results`)}
                                  >
                                    <BarChart3 className="w-4 h-4" />
                                    View Results
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Settings
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 text-red-600"
                                    onClick={() => handleDeleteClick(quiz)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <BookOpen className="w-4 h-4" />
                                <span>{quiz.questions} questions</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Clock className="w-4 h-4" />
                                <span>{quiz.duration}m</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Users className="w-4 h-4" />
                                <span>{quiz.attempts} attempts</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Award className="w-4 h-4" />
                                <span>{quiz.avgScore}% avg</span>
                              </div>
                            </div>

                            {quiz.avgScore > 0 && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-600 dark:text-slate-400">Performance</span>
                                  <span className="font-medium text-slate-900 dark:text-white">{quiz.avgScore}%</span>
                                </div>
                                <Progress value={quiz.avgScore} className="h-2" />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                {/* Paused Quizzes Section */}
                {(selectedStatus === "all" || selectedStatus === "paused") && groupedQuizzes.paused.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b-2 border-gray-200 dark:border-gray-800">
                      <div className="p-2 bg-gray-100 dark:bg-gray-900/20 rounded-lg">
                        <Pause className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Paused Quizzes</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {groupedQuizzes.paused.length} quiz{groupedQuizzes.paused.length !== 1 ? "es" : ""} paused
                        </p>
                      </div>
                    </div>
                    {groupedQuizzes.paused.map((quiz) => (
                      <Card
                        key={quiz.id}
                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-context-menu"
                        onContextMenu={(e) => handleRightClick(e, quiz)}
                      >
                        {/* Same card content structure as other sections */}
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{quiz.title}</h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge
                                  variant="secondary"
                                  className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                >
                                  {quiz.subject}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                >
                                  {quiz.grade}
                                </Badge>
                                <Badge variant="secondary" className={`${getStatusColor(quiz.status)} select-none`}>
                                  {quiz.status}
                                </Badge>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => router.push(`/teacher/quiz/${quiz.id}`)}
                                >
                                  <Eye className="w-4 h-4" />
                                  View Quiz
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => router.push(`/teacher/quiz/${quiz.id}/edit`)}
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit Quiz
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Copy className="w-4 h-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => router.push(`/teacher/quiz/${quiz.id}/results`)}
                                >
                                  <BarChart3 className="w-4 h-4" />
                                  View Results
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Settings className="w-4 h-4" />
                                  Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 text-red-600"
                                  onClick={() => handleDeleteClick(quiz)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <BookOpen className="w-4 h-4" />
                              <span>{quiz.questions} questions</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Clock className="w-4 h-4" />
                              <span>{quiz.duration}m</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Users className="w-4 h-4" />
                              <span>{quiz.attempts} attempts</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Award className="w-4 h-4" />
                              <span>{quiz.avgScore}% avg</span>
                            </div>
                          </div>

                          {quiz.avgScore > 0 && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Performance</span>
                                <span className="font-medium text-slate-900 dark:text-white">{quiz.avgScore}%</span>
                              </div>
                              <Progress value={quiz.avgScore} className="h-2" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="hidden lg:block space-y-6">
                {(selectedStatus === "all" || selectedStatus === "scheduled") &&
                  groupedQuizzes.scheduled.length > 0 && (
                    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                      <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-purple-50 dark:bg-purple-900/10">
                        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <span className="text-purple-700 dark:text-purple-300">Scheduled Quizzes</span>
                            <p className="text-sm font-normal text-purple-600 dark:text-purple-400">
                              {groupedQuizzes.scheduled.length} quiz{groupedQuizzes.scheduled.length !== 1 ? "es" : ""}{" "}
                              scheduled to go live
                            </p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                              <TableHead className="font-semibold">Quiz Details</TableHead>
                              <TableHead className="font-semibold">Subject & Grade</TableHead>
                              <TableHead className="font-semibold">Scheduled Date</TableHead>
                              <TableHead className="font-semibold">Questions</TableHead>
                              <TableHead className="font-semibold">Status</TableHead>
                              <TableHead className="font-semibold">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {groupedQuizzes.scheduled.map((quiz) => (
                              <TableRow
                                key={quiz.id}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-context-menu"
                                onContextMenu={(e) => handleRightClick(e, quiz)}
                              >
                                <TableCell className="py-4">
                                  <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{quiz.title}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{quiz.id}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1">
                                      <Calendar className="w-3 h-3" />
                                      Due: {quiz.dueDate}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{quiz.subject}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{quiz.grade}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                      <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-purple-700 dark:text-purple-300">
                                        {new Date(quiz.scheduledDate || quiz.created).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                      </p>
                                      <p className="text-xs text-purple-600 dark:text-purple-400">
                                        {new Date(quiz.scheduledDate || quiz.created).toLocaleTimeString("en-US", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-900 dark:text-white">{quiz.questions}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className={`${getStatusColor(quiz.status)} select-none`}>
                                    {quiz.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {/* Published Now button */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-2 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 font-medium"
                                      title="Publish Now"
                                      onClick={() => {
                                        toast({
                                          title: "Quiz Published",
                                          description: `"${quiz.title}" has been published and is now live for students.`,
                                        })
                                        // Optionally update the status to 'active' here
                                        updateQuizStatus(quiz.id, "active")
                                      }}
                                    >
                                      <Send className="w-4 h-4 mr-1" />
                                      Publish Now
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                      title="View Quiz"
                                      onClick={() => router.push(`/teacher/quiz/${quiz.id}`)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                                      title="Edit Schedule"
                                      onClick={() => router.push(`/teacher/quiz/${quiz.id}/edit`)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                                      title="Delete Quiz"
                                      onClick={() => handleDeleteClick(quiz)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                {/* Active Quizzes Table */}
                {(selectedStatus === "all" || selectedStatus === "active") && groupedQuizzes.active.length > 0 && (
                  <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-green-50 dark:bg-green-900/10">
                      <CardTitle className="text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                          <Play className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <span className="text-green-700 dark:text-green-300">Active Quizzes</span>
                          <p className="text-sm font-normal text-green-600 dark:text-green-400">
                            {groupedQuizzes.active.length} quiz{groupedQuizzes.active.length !== 1 ? "es" : ""}{" "}
                            currently active
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                            <TableHead className="font-semibold">Quiz Details</TableHead>
                            <TableHead className="font-semibold">Subject & Grade</TableHead>
                            <TableHead className="font-semibold">Questions</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Performance</TableHead>
                            <TableHead className="font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupedQuizzes.active.map((quiz) => (
                            <TableRow
                              key={quiz.id}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-context-menu"
                              onContextMenu={(e) => handleRightClick(e, quiz)}
                            >
                              <TableCell className="py-4">
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white">{quiz.title}</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">{quiz.id}</p>
                                  <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1">
                                    <Calendar className="w-3 h-3" />
                                    Due: {quiz.dueDate}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-white">{quiz.subject}</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">{quiz.grade}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-slate-900 dark:text-white">{quiz.questions}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={`${getStatusColor(quiz.status)} select-none`}>
                                  {quiz.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-2 min-w-[120px]">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                      {quiz.attempts} attempts
                                    </span>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                      {quiz.avgScore}%
                                    </span>
                                  </div>
                                  {quiz.avgScore > 0 && <Progress value={quiz.avgScore} className="h-2" />}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {quiz.status === "active" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                      title="Live Monitor"
                                      onClick={() => router.push(`/teacher/quiz/${quiz.id}/monitor`)}
                                    >
                                      <Monitor className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    title="View Quiz"
                                    onClick={() => router.push(`/teacher/quiz/${quiz.id}`)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
                                    title="View Results"
                                    onClick={() => router.push(`/teacher/quiz/${quiz.id}/results`)}
                                  >
                                    <BarChart3 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                                    title="Delete Quiz"
                                    onClick={() => handleDeleteClick(quiz)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* Draft Quizzes Table */}
                {(selectedStatus === "all" || selectedStatus === "draft") && groupedQuizzes.draft.length > 0 && (
                  <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-yellow-50 dark:bg-yellow-900/10">
                      <CardTitle className="text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                          <Edit className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <span className="text-yellow-700 dark:text-yellow-300">Draft Quizzes</span>
                          <p className="text-sm font-normal text-yellow-600 dark:text-yellow-400">
                            {groupedQuizzes.draft.length} quiz{groupedQuizzes.draft.length !== 1 ? "es" : ""} in draft
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                            <TableHead className="font-semibold">Quiz Details</TableHead>
                            <TableHead className="font-semibold">Subject & Grade</TableHead>
                            <TableHead className="font-semibold">Questions</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Performance</TableHead>
                            <TableHead className="font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupedQuizzes.draft.map((quiz) => (
                            <TableRow
                              key={quiz.id}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-context-menu"
                              onContextMenu={(e) => handleRightClick(e, quiz)}
                            >
                              <TableCell className="py-4">
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white">{quiz.title}</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">{quiz.id}</p>
                                  <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1">
                                    <Calendar className="w-3 h-3" />
                                    Due: {quiz.dueDate}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-white">{quiz.subject}</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">{quiz.grade}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-slate-900 dark:text-white">{quiz.questions}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={`${getStatusColor(quiz.status)} select-none`}>
                                  {quiz.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-2 min-w-[120px]">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                      {quiz.attempts} attempts
                                    </span>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                      {quiz.avgScore}%
                                    </span>
                                  </div>
                                  {quiz.avgScore > 0 && <Progress value={quiz.avgScore} className="h-2" />}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                                    title="Edit Quiz"
                                    onClick={() => router.push(`/teacher/quiz/${quiz.id}/edit`)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    title="View Quiz"
                                    onClick={() => router.push(`/teacher/quiz/${quiz.id}`)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                                    title="Delete Quiz"
                                    onClick={() => handleDeleteClick(quiz)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* Completed Quizzes Table */}
                {(selectedStatus === "all" || selectedStatus === "completed") &&
                  groupedQuizzes.completed.length > 0 && (
                    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                      <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/10">
                        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <span className="text-blue-700 dark:text-blue-300">Completed Quizzes</span>
                            <p className="text-sm font-normal text-blue-600 dark:text-blue-400">
                              {groupedQuizzes.completed.length} quiz{groupedQuizzes.completed.length !== 1 ? "es" : ""}{" "}
                              completed
                            </p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                              <TableHead className="font-semibold">Quiz Details</TableHead>
                              <TableHead className="font-semibold">Subject & Grade</TableHead>
                              <TableHead className="font-semibold">Questions</TableHead>
                              <TableHead className="font-semibold">Status</TableHead>
                              <TableHead className="font-semibold">Performance</TableHead>
                              <TableHead className="font-semibold">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {groupedQuizzes.completed.map((quiz) => (
                              <TableRow
                                key={quiz.id}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-context-menu"
                                onContextMenu={(e) => handleRightClick(e, quiz)}
                              >
                                <TableCell className="py-4">
                                  <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{quiz.title}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{quiz.id}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1">
                                      <Calendar className="w-3 h-3" />
                                      Due: {quiz.dueDate}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{quiz.subject}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{quiz.grade}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-900 dark:text-white">{quiz.questions}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className={`${getStatusColor(quiz.status)} select-none`}>
                                    {quiz.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-2 min-w-[120px]">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {quiz.attempts} attempts
                                      </span>
                                      <span className="font-semibold text-slate-900 dark:text-white">
                                        {quiz.avgScore}%
                                      </span>
                                    </div>
                                    {quiz.avgScore > 0 && <Progress value={quiz.avgScore} className="h-2" />}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                      title="View Quiz"
                                      onClick={() => router.push(`/teacher/quiz/${quiz.id}`)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
                                      title="View Results"
                                      onClick={() => router.push(`/teacher/quiz/${quiz.id}/results`)}
                                    >
                                      <BarChart3 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                                      title="Delete Quiz"
                                      onClick={() => handleDeleteClick(quiz)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                {/* Paused Quizzes Table */}
                {(selectedStatus === "all" || selectedStatus === "paused") && groupedQuizzes.paused.length > 0 && (
                  <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-gray-900/10">
                      <CardTitle className="text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-900/20 rounded-lg">
                          <Pause className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <span className="text-gray-700 dark:text-gray-300">Paused Quizzes</span>
                          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                            {groupedQuizzes.paused.length} quiz{groupedQuizzes.paused.length !== 1 ? "es" : ""} paused
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                            <TableHead className="font-semibold">Quiz Details</TableHead>
                            <TableHead className="font-semibold">Subject & Grade</TableHead>
                            <TableHead className="font-semibold">Questions</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Performance</TableHead>
                            <TableHead className="font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupedQuizzes.paused.map((quiz) => (
                            <TableRow
                              key={quiz.id}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-context-menu"
                              onContextMenu={(e) => handleRightClick(e, quiz)}
                            >
                              <TableCell className="py-4">
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white">{quiz.title}</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">{quiz.id}</p>
                                  <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1">
                                    <Calendar className="w-3 h-3" />
                                    Due: {quiz.dueDate}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-white">{quiz.subject}</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">{quiz.grade}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-slate-900 dark:text-white">{quiz.questions}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={`${getStatusColor(quiz.status)} select-none`}>
                                  {quiz.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-2 min-w-[120px]">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                      {quiz.attempts} attempts
                                    </span>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                      {quiz.avgScore}%
                                    </span>
                                  </div>
                                  {quiz.avgScore > 0 && <Progress value={quiz.avgScore} className="h-2" />}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    title="View Quiz"
                                    onClick={() => router.push(`/teacher/quiz/${quiz.id}`)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
                                    title="View Results"
                                    onClick={() => router.push(`/teacher/quiz/${quiz.id}/results`)}
                                  >
                                    <BarChart3 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                                    title="Delete Quiz"
                                    onClick={() => handleDeleteClick(quiz)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === "question-bank" && (
            <div className="space-y-6">
              {/* Header with Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Question Bank</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Manage and organize your quiz questions
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Dialog
                    open={addQuestionDialogOpen}
                    onOpenChange={(open) => {
                      if (!open) handleCloseQuestionDialog()
                      else setAddQuestionDialogOpen(open)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        New Question
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingQuestionId ? "Edit Question" : "Add New Question"}</DialogTitle>
                        <DialogDescription>
                          {wizardStep === "select-type"
                            ? "Choose the type of question you want to create"
                            : "Fill in the details for your question"}
                        </DialogDescription>
                      </DialogHeader>

                      {/* Step 1: Select Question Type */}
                      {wizardStep === "select-type" && (
                        <div className="space-y-4 py-6">
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              onClick={() => handleSelectQuestionType("multiple-choice")}
                              className="p-6 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200">
                                  <CheckCircle className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900">Multiple Choice</h3>
                                  <p className="text-sm text-slate-600 mt-1">
                                    Students select one correct answer from multiple options
                                  </p>
                                </div>
                              </div>
                            </button>

                            <button
                              onClick={() => handleSelectQuestionType("true-false")}
                              className="p-6 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900">True/False</h3>
                                  <p className="text-sm text-slate-600 mt-1">
                                    Students determine if a statement is true or false
                                  </p>
                                </div>
                              </div>
                            </button>

                            <button
                              onClick={() => handleSelectQuestionType("short-answer")}
                              className="p-6 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200">
                                  <FileText className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900">Short Answer</h3>
                                  <p className="text-sm text-slate-600 mt-1">
                                    Students provide a brief written response
                                  </p>
                                </div>
                              </div>
                            </button>

                            <button
                              onClick={() => handleSelectQuestionType("essay")}
                              className="p-6 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200">
                                  <FileText className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900">Essay</h3>
                                  <p className="text-sm text-slate-600 mt-1">
                                    Students write a detailed, long-form response
                                  </p>
                                </div>
                              </div>
                            </button>

                            <button
                              onClick={() => handleSelectQuestionType("fill-blank")}
                              className="p-6 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group col-span-2"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center group-hover:bg-teal-200">
                                  <FileText className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900">Fill in the Blank</h3>
                                  <p className="text-sm text-slate-600 mt-1">
                                    Students complete a sentence by filling in missing words
                                  </p>
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Fill Details */}
                      {wizardStep === "fill-details" && (
                        <div className="space-y-6 py-4">
                          {/* Question Text */}
                          <div className="space-y-2">
                            <Label>Question</Label>
                            <Textarea
                              placeholder="Enter your question here..."
                              value={newQuestion.question}
                              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                              rows={3}
                            />
                          </div>

                          {/* Options for Multiple Choice */}
                          {newQuestion.type === "multiple-choice" && (
                            <div className="space-y-2">
                              <Label>Answer Options</Label>
                              {newQuestion.options.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...newQuestion.options]
                                      newOptions[index] = e.target.value
                                      setNewQuestion({ ...newQuestion, options: newOptions })
                                    }}
                                  />
                                  <Checkbox
                                    checked={newQuestion.correctAnswer === option}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setNewQuestion({ ...newQuestion, correctAnswer: option })
                                      }
                                    }}
                                  />
                                  <span className="text-sm text-slate-600">Correct</span>
                                  {newQuestion.options.length > 2 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newOptions = newQuestion.options.filter((_, i) => i !== index)
                                        setNewQuestion({ ...newQuestion, options: newOptions })
                                      }}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setNewQuestion({ ...newQuestion, options: [...newQuestion.options, ""] })
                                }
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Option
                              </Button>
                            </div>
                          )}

                          {/* True/False Options */}
                          {newQuestion.type === "true-false" && (
                            <div className="space-y-2">
                              <Label>Correct Answer</Label>
                              <RadioGroup
                                value={newQuestion.correctAnswer}
                                onValueChange={(value) => setNewQuestion({ ...newQuestion, correctAnswer: value })}
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="true" id="true" />
                                  <Label htmlFor="true">True</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="false" id="false" />
                                  <Label htmlFor="false">False</Label>
                                </div>
                              </RadioGroup>
                            </div>
                          )}

                          {/* Short Answer */}
                          {newQuestion.type === "short-answer" && (
                            <div className="space-y-2">
                              <Label>Expected Answer (for reference)</Label>
                              <Input
                                placeholder="Enter the expected answer..."
                                value={newQuestion.correctAnswer}
                                onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                              />
                              <p className="text-xs text-slate-500">
                                This will be used as a reference for grading. Students can provide variations.
                              </p>
                            </div>
                          )}

                          {/* Fill in the Blank */}
                          {newQuestion.type === "fill-blank" && (
                            <div className="space-y-2">
                              <Label>Correct Answer</Label>
                              <Input
                                placeholder="Enter the word(s) that fill the blank..."
                                value={newQuestion.correctAnswer}
                                onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                              />
                              <p className="text-xs text-slate-500">
                                Use underscores (___) in your question to indicate where the blank should be.
                              </p>
                            </div>
                          )}

                          {/* Essay - No correct answer needed */}
                          {newQuestion.type === "essay" && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm text-blue-800">
                                Essay questions require manual grading. You can provide grading criteria in the
                                explanation field below.
                              </p>
                            </div>
                          )}

                          {/* Subject and Difficulty */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Subject</Label>
                              <Input
                                placeholder="e.g., Mathematics"
                                value={newQuestion.subject}
                                onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Difficulty</Label>
                              <Select
                                value={newQuestion.difficulty}
                                onValueChange={(value) => setNewQuestion({ ...newQuestion, difficulty: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="easy">Easy</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Points */}
                          <div className="space-y-2">
                            <Label>Points</Label>
                            <Input
                              type="number"
                              min="1"
                              value={newQuestion.points}
                              onChange={(e) =>
                                setNewQuestion({ ...newQuestion, points: Number.parseInt(e.target.value) || 1 })
                              }
                            />
                          </div>

                          {/* Explanation */}
                          <div className="space-y-2">
                            <Label>
                              {newQuestion.type === "essay" ? "Grading Criteria (Optional)" : "Explanation (Optional)"}
                            </Label>
                            <Textarea
                              placeholder={
                                newQuestion.type === "essay"
                                  ? "Provide grading criteria or rubric..."
                                  : "Explain the correct answer..."
                              }
                              value={newQuestion.explanation}
                              onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                              rows={2}
                            />
                          </div>

                          {/* Tags */}
                          <div className="space-y-2">
                            <Label>Tags (Optional)</Label>
                            <Input
                              placeholder="Press Enter to add tags (e.g., algebra, equations)"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  const value = e.currentTarget.value.trim()
                                  if (value && !newQuestion.tags.includes(value)) {
                                    setNewQuestion({
                                      ...newQuestion,
                                      tags: [...newQuestion.tags, value],
                                    })
                                    e.currentTarget.value = ""
                                  }
                                }
                              }}
                            />
                            {newQuestion.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {newQuestion.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="gap-1">
                                    {tag}
                                    <X
                                      className="w-3 h-3 cursor-pointer"
                                      onClick={() => {
                                        setNewQuestion({
                                          ...newQuestion,
                                          tags: newQuestion.tags.filter((_, i) => i !== index),
                                        })
                                      }}
                                    />
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <DialogFooter>
                        {wizardStep === "fill-details" && (
                          <Button variant="outline" onClick={() => setWizardStep("select-type")}>
                            Back
                          </Button>
                        )}
                        <Button variant="outline" onClick={handleCloseQuestionDialog}>
                          Cancel
                        </Button>
                        {wizardStep === "fill-details" && (
                          <Button onClick={handleAddQuestion}>
                            {editingQuestionId ? "Save Changes" : "Add Question"}
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={!!previewQuestion} onOpenChange={(open) => !open && setPreviewQuestion(null)}>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Question Preview</DialogTitle>
                        <DialogDescription>This is how students will see this question</DialogDescription>
                      </DialogHeader>

                      {previewQuestion && (
                        <div className="space-y-6 py-4">
                          {/* Question */}
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h3 className="text-lg font-medium">{previewQuestion.question}</h3>
                              <Badge variant="secondary">{previewQuestion.points} pts</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline">{previewQuestion.type}</Badge>
                              <Badge variant="outline">{previewQuestion.difficulty}</Badge>
                            </div>
                          </div>

                          {/* Answer Section based on type */}
                          {previewQuestion.type === "Multiple Choice" && (
                            <div className="space-y-2">
                              <Label>Select your answer:</Label>
                              <div className="space-y-2">
                                {["Option A", "Option B", "Option C", "Option D"].map((option, index) => (
                                  <div
                                    key={index}
                                    className={`p-3 border rounded-lg ${
                                      index === 0 ? "border-green-500 bg-green-50" : "border-slate-200"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-4 h-4 rounded-full border-2 ${
                                          index === 0 ? "border-green-500 bg-green-500" : "border-slate-300"
                                        }`}
                                      />
                                      <span>{option}</span>
                                      {index === 0 && <Badge className="ml-auto bg-green-600">Correct Answer</Badge>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {previewQuestion.type === "True/False" && (
                            <div className="space-y-2">
                              <Label>Select your answer:</Label>
                              <div className="space-y-2">
                                <div className="p-3 border border-green-500 bg-green-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full border-2 border-green-500 bg-green-500" />
                                    <span>True</span>
                                    <Badge className="ml-auto bg-green-600">Correct Answer</Badge>
                                  </div>
                                </div>
                                <div className="p-3 border border-slate-200 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                                    <span>False</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {previewQuestion.type === "Short Answer" && (
                            <div className="space-y-2">
                              <Label>Your answer:</Label>
                              <Textarea placeholder="Type your answer here..." rows={3} disabled />
                              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm font-medium text-green-800">Expected Answer:</p>
                                <p className="text-sm text-green-700 mt-1">{previewQuestion.correctAnswer || "N/A"}</p>
                              </div>
                            </div>
                          )}

                          {previewQuestion.type === "Essay" && (
                            <div className="space-y-2">
                              <Label>Your essay:</Label>
                              <Textarea placeholder="Write your essay here..." rows={6} disabled />
                              <p className="text-xs text-slate-500">This question requires manual grading</p>
                            </div>
                          )}

                          {previewQuestion.type === "Fill in the Blank" && (
                            <div className="space-y-2">
                              <Label>Complete the sentence:</Label>
                              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <p className="text-slate-700">
                                  The capital of France is{" "}
                                  <span className="inline-block w-32 border-b-2 border-slate-400 mx-1" />.
                                </p>
                              </div>
                              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm font-medium text-green-800">Correct Answer:</p>
                                <p className="text-sm text-green-700 mt-1">{previewQuestion.correctAnswer}</p>
                              </div>
                            </div>
                          )}

                          {/* Explanation */}
                          {previewQuestion.explanation && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm font-medium text-blue-800">Explanation:</p>
                              <p className="text-sm text-blue-700 mt-1">{previewQuestion.explanation}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <DialogFooter>
                        <Button onClick={() => setPreviewQuestion(null)}>Close</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Question</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this question? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>

                      {questionToDelete && (
                        <div className="py-4">
                          {(() => {
                            const question = questionBankDataMock.find((q) => q.id === questionToDelete) // Use the mock data
                            if (question && question.usedIn > 0) {
                              return (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                  <p className="text-sm font-medium text-red-800">Warning:</p>
                                  <p className="text-sm text-red-700 mt-1">
                                    This question is currently used in {question.usedIn} quiz(zes). Deleting it will
                                    remove it from all quizzes.
                                  </p>
                                </div>
                              )
                            }
                            return null
                          })()}
                        </div>
                      )}

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteQuestion}>
                          Delete Question
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Questions List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Questions ({filteredQuestionsBank.length})</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedQuestions([])}>
                      Clear Selection
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredQuestionsBank.map((q) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-800"
                      >
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={selectedQuestions.includes(q.id)}
                            onCheckedChange={() => toggleQuestionSelection(q.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white mb-2 line-clamp-2">{q.question}</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                              >
                                {q.type}
                              </Badge>
                              <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-700">
                                {q.subject}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className={`${
                                  q.difficulty === "Easy"
                                    ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                    : q.difficulty === "Medium"
                                      ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                                      : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                                }`}
                              >
                                {q.difficulty}
                              </Badge>
                              <Badge variant="outline">
                                <Award className="w-3 h-3 mr-1" />
                                {q.points} pts
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {q.createdAt}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Used in {q.usedIn} quizzes
                              </span>
                              {q.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handlePreviewQuestion(q)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditQuestion(q)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteQuestion(q.id)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}

                    {filteredQuestionsBank.length === 0 && (
                      <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No questions found</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">Try adjusting your search or filters</p>
                        <Button
                          onClick={() => {
                            setQuestionSearchQuery("")
                            setSelectedQuestionType("all")
                            setSelectedDifficulty("all")
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Enhanced Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                      Completion Rate
                    </CardTitle>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-900 dark:text-green-100">87.3%</div>
                    <Progress value={87.3} className="mt-3 h-2" />
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">+5.2% from last month</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Avg. Time Spent
                    </CardTitle>
                    <Clock className="h-5 w-5 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">24.5m</div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Per quiz attempt</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      Retake Rate
                    </CardTitle>
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">23.1%</div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">Students retaking</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Improvement Rate
                    </CardTitle>
                    <Zap className="h-5 w-5 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">+12.4%</div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">Score improvement</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Quiz Performance Analysis
                  </CardTitle>
                  <CardDescription>Detailed breakdown of quiz performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quizzes
                      .filter((q) => q.attempts > 0)
                      .map((quiz) => (
                        <div
                          key={quiz.id}
                          className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
                        >
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                            <div className="flex-1 mb-4 md:mb-0">
                              <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{quiz.title}</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {quiz.subject} • {quiz.attempts} attempts
                              </p>
                            </div>
                            <div className="text-left md:text-right">
                              <p className="text-3xl font-bold text-slate-900 dark:text-white">{quiz.avgScore}%</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Average Score</p>
                            </div>
                          </div>
                          <Progress value={quiz.avgScore} className="h-2 mb-3" />
                          <div className="flex flex-wrap items-center justify-between text-sm text-slate-500 dark:text-slate-400 gap-2">
                            <span>{quiz.questions} questions</span>
                            <span>{quiz.duration} minutes</span>
                            <Badge variant="secondary" className={getStatusColor(quiz.status)}>
                              {quiz.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div
        className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
        style={{ display: contextMenu.show ? "block" : "none" }}
        onClick={handleClickOutside}
      ></div>

      {contextMenu.show && (
        <div
          className="fixed z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-2 min-w-[180px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onMouseEnter={() =>
            console.log("[v0] Menu position on screen:", {
              left: contextMenu.x,
              top: contextMenu.y,
              scrollY: window.scrollY,
            })
          }
        >
          <div className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            {contextMenu.quiz?.title}
          </div>

          {/* Quiz Actions Section */}
          <button
            onClick={() => handleContextMenuAction("view")}
            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-300"
          >
            <Eye className="w-4 h-4 text-blue-600" />
            View Quiz
          </button>
          <button
            onClick={() => handleContextMenuAction("analytics")}
            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-300"
          >
            <BarChart3 className="w-4 h-4 text-green-600" />
            Analytics
          </button>
          <button
            onClick={() => handleContextMenuAction("share")}
            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-300"
          >
            <Share2 className="w-4 h-4 text-purple-600" />
            Share Link
          </button>

          <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>

          {/* Status Actions Section */}
          <div className="px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">Change Status</div>
          <button
            onClick={() => handleContextMenuAction("draft")}
            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-300"
          >
            <Edit className="w-4 h-4 text-yellow-600" />
            Draft/Private/Offline
          </button>
          <button
            onClick={() => handleContextMenuAction("active")}
            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-300"
          >
            <Play className="w-4 h-4 text-green-600" />
            Active (Online)
          </button>
          {/* Add 'Scheduled' action to context menu */}
          <button
            onClick={() => handleContextMenuAction("scheduled")}
            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-300"
          >
            <Calendar className="w-4 h-4 text-purple-600" />
            Scheduled
          </button>

          <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>

          <button
            onClick={() => handleContextMenuAction("delete")}
            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
            Delete Quiz
          </button>
        </div>
      )}

      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-600" />
              Share Quiz
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Share "{shareQuiz?.title}" with your students
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Quiz Link */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quiz Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareQuiz ? `${window.location.origin}/quiz/${shareQuiz.id}` : ""}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                />
                <Button onClick={copyQuizLink} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* QR Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">QR Code</label>
              <div className="flex justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <img src={getQRCodeUrl() || "/placeholder.svg"} alt="Quiz QR Code" className="w-32 h-32" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Students can scan this QR code to access the quiz
              </p>
            </div>

            {/* Quiz Info */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Questions:</span>
                <span className="font-medium text-slate-900 dark:text-white">{shareQuiz?.questions || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Time Limit:</span>
                <span className="font-medium text-slate-900 dark:text-white">{shareQuiz?.timeLimit || "No limit"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Status:</span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    shareQuiz?.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : shareQuiz?.status === "draft"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        : shareQuiz?.status === "private"
                          ? "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                          : shareQuiz?.status === "scheduled" // Added for scheduled status
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {shareQuiz?.status === "active"
                    ? "Online"
                    : shareQuiz?.status === "scheduled"
                      ? "Scheduled" // Display "Scheduled" for scheduled status
                      : shareQuiz?.status || "Unknown"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShareModalOpen(false)}
              variant="outline"
              className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Close
            </Button>
            <Button onClick={copyQuizLink} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete Quiz
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete "{quizToDelete?.title}"? This action cannot be undone and will permanently
              remove the quiz and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={statusConfirmation.open} onOpenChange={(open) => !open && cancelStatusChange()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              Confirm Status Change
            </DialogTitle>
            <DialogDescription className="pt-4">
              Are you sure you want to change the status of{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">"{statusConfirmation.quizTitle}"</span>{" "}
              to{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">{statusConfirmation.newStatus}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={cancelStatusChange}>
              Cancel
            </Button>
            <Button
              onClick={confirmStatusChange}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            >
              Confirm Change
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={editWarningOpen} onOpenChange={setEditWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <AlertDialogTitle>Edit Question in Use</AlertDialogTitle>
                <AlertDialogDescription className="mt-1">
                  This question is currently being used in active quizzes
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="my-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-amber-900">
                  This question is used in {questionToEdit?.usedIn} quiz{questionToEdit?.usedIn > 1 ? "zes" : ""}
                </p>
                <p className="text-sm text-amber-700">
                  Any changes you make will immediately affect all quizzes using this question. Students who have
                  already taken these quizzes will see the updated version.
                </p>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => proceedWithEdit(questionToEdit)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Continue Editing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
