"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  ArrowLeft,
  Plus,
  Save,
  Eye,
  GripVertical,
  Trash2,
  Copy,
  CheckCircle,
  Type,
  AlignLeft,
  List,
  ToggleLeft,
  FileText,
  Menu,
  Clock,
  Check,
  ChevronDown,
  Square,
  Move,
  ArrowUpDown,
  BarChart3,
  X,
  Share,
  CheckCircleIcon,
} from "lucide-react"
import { Database, Search, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useToast } from "@/hooks/use-toast"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Question {
  id: string
  type:
    | "multiple-choice"
    | "checkbox"
    | "true-false"
    | "short-answer"
    | "long-answer"
    | "fill-blank"
    | "matching"
    | "drag-drop"
    | "ordering"
    | "dropdown"
    | "linear-scale"
    | "essay" // Added essay type
  title: string
  description?: string
  options?: string[]
  correctAnswer?: string | string[] | number | boolean
  correctAnswers?: string[] // For multiple correct answers in checkbox and fill-blank
  sampleAnswers?: string[] // For short/long answer grading guidance
  maxPoints?: number // For essay questions (short-answer, long-answer)
  gradingRubric?: string // Grading criteria for essay questions
  // </CHANGE>
  matchingPairs?: { [key: string]: string } // For matching questions
  dragDropAnswers?: string[] // Shared answer bank for drag-drop
  orderingItems?: string[] // Items to be ordered
  dropdownOptions?: string[] // Options for dropdown
  scaleMin?: number // Linear scale minimum
  scaleMax?: number // Linear scale maximum
  scaleLabels?: { min: string; max: string } // Labels for scale endpoints
  points: number
  required: boolean
  timeLimit?: number
  randomizeOptions?: boolean
  estimatedTime?: number // Added estimated time
}

interface QuizDetails {
  title: string
  subject: string
  grade: string
  duration: number
  description: string
  dueDate: string
  allowRetakes: boolean
  shuffleQuestions: boolean
  showResults: boolean
}

// Placeholder for questionBankData and related functions
// In a real app, these would be fetched from an API or context.
interface QuestionBankItem {
  id: string
  type: string
  question: string
  subject: string
  difficulty: string
  points: number
  tags: string[]
  usedIn: number
  createdAt: string
  options?: string[]
  correctAnswer?: string | string[] | boolean
  explanation?: string
}

// Mock question bank data (replace with actual data fetching)
const questionBankData: QuestionBankItem[] = [
  {
    id: "qb-1",
    type: "Multiple Choice",
    question: "What is the capital of France?",
    subject: "Geography",
    difficulty: "Easy",
    points: 1,
    tags: ["world", "europe"],
    usedIn: 5,
    createdAt: "2023-10-27T10:00:00Z",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correctAnswer: "Paris",
    explanation: "Paris is the capital and most populous city of France.",
  },
  {
    id: "qb-2",
    type: "True/False",
    question: "The Earth revolves around the Sun.",
    subject: "Science",
    difficulty: "Easy",
    points: 1,
    tags: ["astronomy", "solar system"],
    usedIn: 10,
    createdAt: "2023-10-27T10:05:00Z",
    correctAnswer: true,
    explanation: "This is a fundamental concept in astronomy.",
  },
  {
    id: "qb-3",
    type: "Short Answer",
    question: "Name a primary color.",
    subject: "Art",
    difficulty: "Medium",
    points: 2,
    tags: ["color theory"],
    usedIn: 3,
    createdAt: "2023-10-27T10:10:00Z",
    correctAnswer: "Red", // or Blue, or Yellow
    explanation: "Primary colors are red, blue, and yellow.",
  },
  {
    id: "qb-4",
    type: "Essay",
    question: "Discuss the impact of climate change on global ecosystems.",
    subject: "Environmental Science",
    difficulty: "Hard",
    points: 10,
    tags: ["climate change", "ecology"],
    usedIn: 7,
    createdAt: "2023-10-27T10:15:00Z",
    explanation: "This requires a detailed and well-reasoned discussion.",
  },
  {
    id: "qb-5",
    type: "Fill in the Blank",
    question: "The largest planet in our solar system is {{blank_0}}.",
    subject: "Science",
    difficulty: "Medium",
    points: 1,
    tags: ["astronomy"],
    usedIn: 8,
    createdAt: "2023-10-27T10:20:00Z",
    options: ["Jupiter"],
    correctAnswer: "Jupiter",
    explanation: "Jupiter is known for its immense size.",
  },
  {
    id: "qb-6",
    type: "Multiple Choice",
    question: "Which of the following is NOT a programming language?",
    subject: "Computer Science",
    difficulty: "Easy",
    points: 1,
    tags: ["programming"],
    usedIn: 6,
    createdAt: "2023-10-27T10:25:00Z",
    options: ["Python", "HTML", "Java", "C++"],
    correctAnswer: "HTML",
    explanation: "HTML is a markup language, not a programming language.",
  },
  {
    id: "qb-7",
    type: "Checkbox",
    question: "Which of these are mammals?",
    subject: "Biology",
    difficulty: "Medium",
    points: 3,
    tags: ["animals", "zoology"],
    usedIn: 4,
    createdAt: "2023-10-27T10:30:00Z",
    options: ["Dog", "Snake", "Eagle", "Whale"],
    correctAnswers: [0, 3], // Dog and Whale
    explanation: "Mammals are warm-blooded vertebrates that have hair or fur.",
  },
]

export default function QuizBuilderPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)
  const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const [contextMenu, setContextMenu] = useState<{
    show: boolean
    x: number
    y: number
    questionId: string
    questionIndex: number
  } | null>(null)

  const [blankContextMenu, setBlankContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    blankIndex: number
    questionId: string
  } | null>(null)

  const [selectedText, setSelectedText] = useState("")
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)

  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [publishSettings, setPublishSettings] = useState({
    makePublic: true,
    showResults: true,
    allowRetakes: false,
    notifyStudents: true,
  })
  const [quizLink, setQuizLink] = useState("")

  const [gradingType, setGradingType] = useState<"automatic" | "manual" | "mixed">("automatic")

  const [showQuestionBankDialog, setShowQuestionBankDialog] = useState(false)
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all")
  const [filterSubject, setFilterSubject] = useState<string>("all")
  const [previewQuestion, setPreviewQuestion] = useState<any>(null)

  // Derived state for question bank filtering
  const uniqueSubjects = useMemo(() => {
    const subjects = new Set<string>()
    questionBankData.forEach((item) => subjects.add(item.subject))
    return Array.from(subjects)
  }, [])

  const filteredQuestions = useMemo(() => {
    return questionBankData.filter((q) => {
      const matchesSearch =
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = filterType === "all" || q.type === filterType
      const matchesDifficulty = filterDifficulty === "all" || q.difficulty === filterDifficulty
      const matchesSubject = filterSubject === "all" || q.subject === filterSubject

      return matchesSearch && matchesType && matchesDifficulty && matchesSubject
    })
  }, [searchQuery, filterType, filterDifficulty, filterSubject])

  const getDefaultEstimatedTime = (questionType: Question["type"]): number => {
    switch (questionType) {
      case "true-false":
        return 0.5
      case "multiple-choice":
        return 1
      case "checkbox":
        return 1.5
      case "short-answer":
        return 2
      case "fill-blank":
        return 1.5
      case "dropdown":
        return 1
      case "linear-scale":
        return 0.5
      case "matching":
        return 3
      case "drag-drop":
        return 3
      case "ordering":
        return 2
      case "long-answer":
        return 5
      case "essay": // Added default time for essay
        return 5
      default:
        return 2
    }
  }

  const totalEstimatedTime = questions.reduce((total, question) => {
    return total + (question.estimatedTime || getDefaultEstimatedTime(question.type))
  }, 0)

  useEffect(() => {
    // Load quiz details from localStorage
    const savedDetails = localStorage.getItem("quizDetails")
    if (savedDetails) {
      setQuizDetails(JSON.parse(savedDetails))
    } else {
      // Redirect back if no quiz details found
      router.push("/teacher/quiz/create")
    }

    // Load saved questions if any
    const savedQuestions = localStorage.getItem("quizQuestions")
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions))
    }
  }, [router])

  useEffect(() => {
    const hasAutoGraded = questions.some(
      (q) =>
        q.type === "multiple-choice" ||
        q.type === "true-false" ||
        q.type === "checkbox" ||
        q.type === "ordering" ||
        q.type === "dropdown" ||
        q.type === "linear-scale",
    )
    const hasManualGraded = questions.some(
      (q) => q.type === "short-answer" || q.type === "long-answer" || q.type === "essay" || q.type === "fill-blank",
    )

    if (hasAutoGraded && hasManualGraded) {
      setGradingType("mixed")
    } else if (hasManualGraded) {
      setGradingType("manual")
    } else {
      setGradingType("automatic")
    }
  }, [questions])

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (quizDetails && questions.length > 0) {
      // Only save if quizDetails exist
      setIsSaving(true)
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      localStorage.setItem("quizQuestions", JSON.stringify(questions))
      localStorage.setItem("quizDetails", JSON.stringify(quizDetails)) // Also save quiz details
      setLastSaved(new Date())
      setIsSaving(false)
    }
  }, [questions, quizDetails])

  useEffect(() => {
    const autoSaveTimer = setTimeout(autoSave, 3000) // Increased interval to 3 seconds
    return () => clearTimeout(autoSaveTimer)
  }, [questions, quizDetails, autoSave])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200

      for (const question of questions) {
        const element = questionRefs.current[question.id]
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveQuestionId(question.id)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [questions])

  useEffect(() => {
    // Hide any footer elements on this page
    document.body.style.overflow = "hidden"
    const footer = document.querySelector("footer")
    if (footer) {
      footer.style.display = "none"
    }

    return () => {
      // Restore on cleanup
      document.body.style.overflow = "auto"
      const footer = document.querySelector("footer")
      if (footer) {
        footer.style.display = "block"
      }
    }
  }, [])

  const handleContextMenu = (e: React.MouseEvent, questionId: string, questionIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      questionId,
      questionIndex,
    })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  const deleteBlank = (questionId: string, blankIndex: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const parts = q.title.split(/({{blank_\d+}})/)
          let currentBlankIndex = 0
          const newParts = parts.filter((part) => {
            if (part.match(/({{blank_\d+}})/)) {
              if (currentBlankIndex === blankIndex) {
                currentBlankIndex++
                return false // Remove this blank
              }
              currentBlankIndex++
            }
            return true
          })

          // Update blank indices in remaining parts
          let newBlankIndex = 0
          const updatedParts = newParts.map((part) => {
            if (part.match(/({{blank_\d+}})/)) {
              return `{{blank_${newBlankIndex++}}}`
            }
            return part
          })

          const newOptions = [...(q.options || [])]
          newOptions.splice(blankIndex, 1)

          return {
            ...q,
            title: updatedParts.join(""),
            options: newOptions,
          }
        }
        return q
      }),
    )
    setBlankContextMenu(null)
  }

  const duplicateQuestion = (questionId: string) => {
    const questionToDuplicate = questions.find((q) => q.id === questionId)
    if (questionToDuplicate) {
      const newQuestion = {
        ...questionToDuplicate,
        id: `question-${Date.now()}`, // Use a more robust ID generation if needed
        title: `${questionToDuplicate.title} (Copy)`,
      }
      const questionIndex = questions.findIndex((q) => q.id === questionId)
      const newQuestions = [...questions]
      newQuestions.splice(questionIndex + 1, 0, newQuestion)
      setQuestions(newQuestions)
      toast({
        title: "Question Duplicated",
        description: "Question has been successfully duplicated.",
        variant: "default",
        className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg",
        duration: 3000,
      })
    }
    closeContextMenu()
  }

  const deleteQuestion = (questionId: string) => {
    if (questions.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one question in your quiz.",
        variant: "destructive",
        duration: 3000,
      })
      closeContextMenu()
      return
    }

    setQuestions(questions.filter((q) => q.id !== questionId))
    toast({
      title: "Question Deleted",
      description: "Question has been successfully deleted.",
      variant: "default",
      className: "bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 shadow-lg",
      duration: 3000,
    })
    closeContextMenu()
  }

  const moveQuestionUp = (questionIndex: number) => {
    if (questionIndex === 0) return
    const newQuestions = [...questions]
    const temp = newQuestions[questionIndex]
    newQuestions[questionIndex] = newQuestions[questionIndex - 1]
    newQuestions[questionIndex - 1] = temp
    setQuestions(newQuestions)
    closeContextMenu()
  }

  const moveQuestionDown = (questionIndex: number) => {
    if (questionIndex === questions.length - 1) return
    const newQuestions = [...questions]
    const temp = newQuestions[questionIndex]
    newQuestions[questionIndex] = newQuestions[questionIndex + 1]
    newQuestions[questionIndex + 1] = temp
    setQuestions(newQuestions)
    closeContextMenu()
  }

  const changeQuestionType = (questionId: string, newType: Question["type"]) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              type: newType,
              options:
                newType === "multiple-choice"
                  ? ["", "", "", ""]
                  : newType === "checkbox"
                    ? ["", ""]
                    : newType === "matching"
                      ? ["", "", "", ""]
                      : newType === "fill-blank"
                        ? []
                        : undefined,
              correctAnswer: undefined,
              correctAnswers: undefined,
              matchingPairs: undefined,
              estimatedTime: getDefaultEstimatedTime(newType),
            }
          : q,
      ),
    )
    toast({
      title: "Question Type Changed",
      description: `Question type changed to ${questionTypes.find((t) => t.value === newType)?.label}.`,
      variant: "default",
      className: "bg-gradient-to-r from-blue-50 to-indigo-600 text-white border-0 shadow-lg",
      duration: 3000,
    })
    closeContextMenu()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu && !event.target?.closest(".fixed")) {
        // Check if click is outside the context menu
        closeContextMenu()
      }
    }

    if (contextMenu) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [contextMenu])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (blankContextMenu && !event.target?.closest(".fixed")) {
        // Check if click is outside the blank context menu
        setBlankContextMenu(null)
      }
    }

    if (blankContextMenu) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [blankContextMenu])

  const questionTypes = useMemo(
    () => [
      { value: "multiple-choice", label: "Multiple Choice", icon: CheckCircle },
      { value: "checkbox", label: "Checkbox", icon: Square },
      { value: "true-false", label: "True/False", icon: ToggleLeft },
      { value: "short-answer", label: "Short Answer", icon: Type },
      { value: "long-answer", label: "Long Answer", icon: AlignLeft },
      { value: "fill-blank", label: "Fill in the Blank", icon: FileText },
      { value: "matching", label: "Matching", icon: List },
      { value: "drag-drop", label: "Drag & Drop", icon: Move },
      { value: "ordering", label: "Ordering", icon: ArrowUpDown },
      { value: "dropdown", label: "Dropdown", icon: ChevronDown },
      { value: "linear-scale", label: "Linear Scale", icon: BarChart3 },
      { value: "essay", label: "Essay", icon: FileText }, // Added essay type
    ],
    [],
  )

  const addNewQuestion = () => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type: "multiple-choice",
      title: "",
      description: "",
      options: ["", "", "", ""],
      points: 1,
      estimatedTime: getDefaultEstimatedTime("multiple-choice"), // Add default estimated time
    }
    setQuestions([...questions, newQuestion])
    setTimeout(() => {
      setActiveQuestionId(newQuestion.id)
      scrollToQuestion(newQuestion.id)
    }, 100)
  }

  const handleTextSelection = (questionId: string) => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim()
      const range = selection.getRangeAt(0)
      const questionElement = document.getElementById(`question-title-${questionId}`)

      if (questionElement && questionElement.contains(range.commonAncestorContainer)) {
        setSelectedText(selectedText)
        setSelectionRange({
          start: range.startOffset,
          end: range.endOffset,
        })
      } else {
        setSelectedText("")
        setSelectionRange(null)
      }
    } else {
      setSelectedText("")
      setSelectionRange(null)
    }
  }

  const convertToBlank = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId)
    if (!question || !question.title.trim()) return

    const title = question.title.trim()
    const words = title.split(" ")
    if (words.length === 0) return

    const lastWord = words[words.length - 1]
    const questionWithoutLastWord = words.slice(0, -1).join(" ")
    const newTitle = `${questionWithoutLastWord} {{blank_${Date.now()}}}` // Use unique ID for blank

    // Add the last word as a correct answer for the new blank
    const newOptions = question.options ? [...question.options, lastWord] : [lastWord]

    updateQuestion(questionId, {
      title: newTitle,
      options: newOptions,
      type: "fill-blank", // Ensure type is fill-blank
    })

    toast({
      title: "Blank Created",
      description: `"${lastWord}" has been converted to a blank and added as the correct answer.`,
      variant: "success",
      duration: 3000,
    })
  }

  const addBlankAtCursor = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId)
    if (!question) return

    const titleElement = document.getElementById(`question-title-${questionId}`)
    const selection = window.getSelection()

    if (titleElement && selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const isSelectionInsideQuestion = titleElement.contains(range.commonAncestorContainer)

      if (isSelectionInsideQuestion && selectionRange) {
        const newBlankId = `blank_${Date.now()}`
        const blankPlaceholder = `{{${newBlankId}}}`

        const currentTitle = question.title
        const newTitle =
          currentTitle.substring(0, selectionRange.start) +
          blankPlaceholder +
          currentTitle.substring(selectionRange.end)

        const newOptions = question.options ? [...question.options, ""] : [""] // Add an empty option for the new blank

        updateQuestion(questionId, {
          title: newTitle,
          options: newOptions,
          type: "fill-blank", // Ensure type is fill-blank
        })

        toast({
          title: "Blank Added",
          description: `A new blank has been inserted at the selected position.`,
          variant: "success",
          duration: 3000,
        })
        setSelectedText("") // Clear selection after adding blank
        setSelectionRange(null)
        window.getSelection()?.removeAllRanges()
      } else {
        toast({
          title: "Selection Error",
          description: "Please select text within the question title to add a blank.",
          variant: "destructive",
          duration: 3000,
        })
      }
    } else {
      toast({
        title: "Error",
        description: "Could not find the question title element.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const scrollToQuestion = (questionId: string) => {
    const element = questionRefs.current[questionId]
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      })
      setActiveQuestionId(questionId)
      setIsMobileMenuOpen(false)
    }
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const updatedQuestion = { ...q, ...updates }
          // Ensure options are initialized for relevant types if not present
          if (
            (updates.type === "multiple-choice" || updates.type === "checkbox" || updates.type === "matching") &&
            !updatedQuestion.options
          ) {
            updatedQuestion.options = []
          }
          // If type changes, reset correct answers if they become incompatible
          if (updates.type && updates.type !== q.type) {
            updatedQuestion.estimatedTime = getDefaultEstimatedTime(updates.type)
            if (
              (q.type === "multiple-choice" && updates.type !== "multiple-choice") ||
              (q.type === "checkbox" && updates.type !== "checkbox") ||
              (q.type === "true-false" && updates.type !== "true-false")
            ) {
              updatedQuestion.correctAnswer = undefined
            }
            if (q.type === "fill-blank" && updates.type !== "fill-blank") {
              updatedQuestion.options = undefined
            }
          }
          return updatedQuestion
        }
        return q
      }),
    )
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(questions)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setQuestions(items)

    toast({
      title: "Question Reordered",
      description: `Question moved from position ${result.source.index + 1} to position ${result.destination.index + 1}.`,
      variant: "info",
      duration: 3000,
    })
  }

  const saveQuiz = async () => {
    setIsSaving(true)
    const completeQuiz = {
      ...quizDetails,
      questions,
      createdAt: new Date().toISOString(),
      id: `quiz-${Date.now()}`,
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Saving quiz:", completeQuiz)

    toast({
      title: "Quiz Saved Successfully!",
      description: `"${quizDetails?.title}" has been saved with ${questions.length} question${questions.length !== 1 ? "s" : ""} and is ready for students.`,
      variant: "success",
      duration: 5000,
    })

    // Clear localStorage and redirect
    localStorage.removeItem("quizDetails")
    localStorage.removeItem("quizQuestions")
    setIsSaving(false)
    router.push("/teacher/quiz")
  }

  const publishQuiz = async () => {
    setIsSaving(true)
    const completeQuiz = {
      ...quizDetails,
      questions,
      publishSettings,
      gradingType,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      id: `quiz-${Date.now()}`,
      status: "published",
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate quiz link
    const generatedLink = `${window.location.origin}/quiz/take/${completeQuiz.id}`
    setQuizLink(generatedLink)

    console.log("Publishing quiz:", completeQuiz)

    toast({
      title: "Quiz Published Successfully!",
      description: `"${quizDetails?.title}" is now live and ready for students.`,
      variant: "success",
      duration: 5000,
    })

    setIsSaving(false)
    setShowPublishModal(false)
    setShowLinkModal(true)
  }

  const copyQuizLink = async () => {
    try {
      await navigator.clipboard.writeText(quizLink)
      toast({
        title: "Link Copied!",
        description: "Quiz link has been copied to clipboard.",
        variant: "success",
        duration: 3000,
      })
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  if (!quizDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading quiz builder...</p>
        </div>
      </div>
    )
  }

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="md:hidden bg-transparent hover:scale-105 transition-all duration-200"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <QuestionsSidebar />
      </SheetContent>
    </Sheet>
  )

  const QuestionsSidebar = () => (
    <div className="h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-xl relative z-30">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-slate-900 dark:text-white text-lg truncate">{quizDetails.title}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {quizDetails.subject} • {quizDetails.grade}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{questions.length}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Questions</div>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(totalEstimatedTime)}m
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Est. Time</div>
          </div>
        </div>

        {/* Auto-save status */}
        <div className="flex items-center gap-2 mb-4 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
          {isSaving ? (
            <>
              <Clock className="w-3 h-3 animate-spin text-blue-500" />
              <span>Saving...</span>
            </>
          ) : lastSaved ? (
            <>
              <Check className="w-3 h-3 text-green-500" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </>
          ) : (
            <span>No changes to save</span>
          )}
        </div>

        {/* Publish Button - Top Priority Action */}
        <div className="mb-4">
          <Button
            onClick={() => setShowPublishModal(true)}
            size="sm"
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:scale-105 transition-all duration-200 text-white"
            disabled={questions.length === 0 || isSaving}
          >
            <Share className="w-4 h-4 mr-2" />
            Publish Quiz
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex-1 bg-white/80 dark:bg-slate-800/80 hover:scale-105 transition-all duration-200"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>

          <Button
            onClick={saveQuiz}
            size="sm"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:scale-105 transition-all duration-200"
            disabled={questions.length === 0 || isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Questions Navigation List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 px-2">
            Questions ({questions.length})
          </h3>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sidebar-questions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {questions.map((question, index) => (
                    <Draggable key={question.id} draggableId={`sidebar-${question.id}`} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`group p-3 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${
                            snapshot.isDragging
                              ? "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-800/50 dark:to-indigo-800/50 border-blue-300 dark:border-blue-600 shadow-2xl opacity-90"
                              : activeQuestionId === question.id
                                ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-700 shadow-lg"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 dark:hover:from-slate-700 dark:hover:to-slate-600"
                          }`}
                          onClick={() => !snapshot.isDragging && scrollToQuestion(question.id)}
                          onContextMenu={(e) => handleContextMenu(e, question.id, index)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-200 ${
                                activeQuestionId === question.id || snapshot.isDragging
                                  ? "bg-blue-600 text-white shadow-lg"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {question.title || `Question ${index + 1}`}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                  {question.type.replace("-", " ")}
                                </span>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {question.points} pts
                                </span>
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                  {question.estimatedTime || getDefaultEstimatedTime(question.type)}m
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <GripVertical className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              <ChevronDown
                                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                  activeQuestionId === question.id ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Add Question Button */}
        <div className="mt-6 space-y-3">
          <Button
            onClick={() => addNewQuestion()}
            variant="outline"
            className="w-full justify-start bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Question
          </Button>

          <Button
            onClick={() => setShowQuestionBankDialog(true)}
            variant="outline"
            className="w-full justify-start bg-transparent hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 hover:scale-[1.02]"
          >
            <Database className="w-4 h-4 mr-2" />
            Import from Question Bank
          </Button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-10 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
        {/* Footer actions if needed */}
      </div>
    </div>
  )

  const isQuestionInQuiz = (questionId: string) => {
    return questions.some((q) => q.id === questionId)
  }

  const handleSelectAll = () => {
    if (selectedQuestionIds.size === filteredQuestions.length) {
      setSelectedQuestionIds(new Set())
    } else {
      setSelectedQuestionIds(new Set(filteredQuestions.map((q) => q.id)))
    }
  }

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestionIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "Medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "Hard":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
    }
  }

  const handleImportQuestions = () => {
    const questionsToAdd = questionBankData.filter((q) => selectedQuestionIds.has(q.id))

    const newQuestions: Question[] = questionsToAdd.map((qbQuestion) => {
      // Map QuestionBankItem to Question structure
      let questionType: Question["type"]
      switch (qbQuestion.type) {
        case "Multiple Choice":
          questionType = "multiple-choice"
          break
        case "True/False":
          questionType = "true-false"
          break
        case "Short Answer":
          questionType = "short-answer"
          break
        case "Long Answer":
          questionType = "long-answer"
          break
        case "Essay":
          questionType = "essay"
          break
        case "Fill in the Blank":
          questionType = "fill-blank"
          break
        // Add other type mappings as needed
        default:
          questionType = "multiple-choice" // Default or handle unknown types
      }

      const newQuestion: Question = {
        id: `question-${Date.now()}-${qbQuestion.id}`, // Unique ID combining timestamp and original ID
        type: questionType,
        title: qbQuestion.question,
        description: undefined, // Not available in QB item
        options: qbQuestion.options ? [...qbQuestion.options] : undefined,
        correctAnswer: qbQuestion.correctAnswer,
        correctAnswers: Array.isArray(qbQuestion.correctAnswer) ? qbQuestion.correctAnswer.map(String) : undefined, // Handle array for checkbox
        sampleAnswers: undefined, // Not available in QB item
        maxPoints: qbQuestion.points, // Assuming points in QB map to maxPoints
        gradingRubric: undefined, // Not available in QB item
        points: qbQuestion.points,
        required: false, // Default to not required
        estimatedTime: getDefaultEstimatedTime(questionType), // Calculate default estimated time
      }

      // Special handling for fill-in-the-blank options if correctAnswer is an array
      if (questionType === "fill-blank" && Array.isArray(qbQuestion.correctAnswer)) {
        newQuestion.options = qbQuestion.correctAnswer.map(String)
      }

      return newQuestion
    })

    setQuestions((prev) => [...prev, ...newQuestions])
    setSelectedQuestionIds(new Set()) // Clear selection
    setShowQuestionBankDialog(false)
    toast({
      title: "Questions Imported",
      description: `${newQuestions.length} question(s) added to your quiz.`,
      variant: "success",
      duration: 3000,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="flex h-full relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 fixed h-full z-30">
          <QuestionsSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-80 relative z-10 overflow-y-auto">
          {/* Mobile Header */}
          <div className="md:hidden sticky top-0 z-40 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MobileSidebar />
                <div>
                  <h1 className="font-bold text-slate-900 dark:text-white">{quizDetails.title}</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {questions.length} question{questions.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => setShowPublishModal(true)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={questions.length === 0 || isSaving}
                >
                  <Share className="w-4 h-4 mr-2" />
                  Publish
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={saveQuiz}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={questions.length === 0 || isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={() => setIsPreviewMode(!isPreviewMode)} size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {questions.length === 0 ? (
              <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-6">
                      <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No Questions Yet</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                      Start building your quiz by adding your first question. Choose from multiple question types to
                      create engaging assessments.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => addNewQuestion()}
                        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg px-8 py-3 text-lg hover:scale-105 transition-all duration-200"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add First Question
                      </Button>
                      <Button
                        onClick={() => setShowQuestionBankDialog(true)}
                        variant="outline"
                        className="border-2 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-8 py-3 text-lg hover:scale-105 transition-all duration-200"
                      >
                        <Database className="w-5 h-5 mr-2" />
                        Import from Bank
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="questions">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-8">
                      {questions.map((question, index) => (
                        <Draggable key={question.id} draggableId={question.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={(el) => {
                                provided.innerRef(el)
                                questionRefs.current[question.id] = el
                              }}
                              {...provided.draggableProps}
                              className={`transition-all duration-300 ${
                                snapshot.isDragging ? "opacity-80 shadow-2xl" : ""
                              }`}
                            >
                              <QuestionEditor
                                question={question}
                                onUpdate={(updates) => updateQuestion(question.id, updates)}
                                onConvertToBlank={convertToBlank}
                                onAddBlankAtCursor={addBlankAtCursor}
                                onDelete={() => deleteQuestion(question.id)}
                                onDuplicate={() => duplicateQuestion(question.id)}
                                questionNumber={index + 1}
                                dragHandleProps={provided.dragHandleProps}
                                isActive={activeQuestionId === question.id}
                                selectedText={selectedText}
                                selectionRange={selectionRange}
                                onTextSelection={handleTextSelection}
                                onClearSelection={() => {
                                  setSelectedText("")
                                  setSelectionRange(null)
                                  window.getSelection()?.removeAllRanges()
                                }}
                                setBlankContextMenu={setBlankContextMenu}
                                getDefaultEstimatedTime={getDefaultEstimatedTime}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            {/* Add Question Button */}
            {questions.length > 0 && (
              <div className="flex justify-center pt-8 gap-3">
                <Button
                  onClick={() => addNewQuestion()}
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg px-8 py-3 text-lg hover:scale-105 transition-all duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Question
                </Button>
                <Button
                  onClick={() => setShowQuestionBankDialog(true)}
                  variant="outline"
                  className="border-2 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-8 py-3 text-lg hover:scale-105 transition-all duration-200"
                >
                  <Database className="w-5 h-5 mr-2" />
                  Import from Bank
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
        <DialogContent className="sm:max-w-[900px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <Share className="w-5 h-5 text-green-600" />
              Publish Quiz Settings
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Configure how students will access and take your quiz.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6 py-4">
            {/* Left Column - Grading Type */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Grading Type</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Select how this quiz will be graded based on question types.
              </p>

              <div className="space-y-3">
                {/* Automatic Grading */}
                <div
                  onClick={() => setGradingType("automatic")}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    gradingType === "automatic"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        gradingType === "automatic"
                          ? "border-green-500 bg-green-500"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {gradingType === "automatic" && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="font-semibold text-slate-900 dark:text-white cursor-pointer">
                          Automatic Grading
                        </Label>
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                          Recommended
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        All questions are auto-graded (Multiple Choice, True/False). Results are instant.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Manual Grading */}
                <div
                  onClick={() => setGradingType("manual")}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    gradingType === "manual"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        gradingType === "manual"
                          ? "border-blue-500 bg-blue-500"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {gradingType === "manual" && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <Label className="font-semibold text-slate-900 dark:text-white cursor-pointer">
                        Manual Grading
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Contains essay questions (Short Answer, Long Answer). Requires teacher review and grading.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mixed Grading */}
                <div
                  onClick={() => setGradingType("mixed")}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    gradingType === "mixed"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        gradingType === "mixed"
                          ? "border-purple-500 bg-purple-500"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {gradingType === "mixed" && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <Label className="font-semibold text-slate-900 dark:text-white cursor-pointer">
                        Mixed Grading
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Combination of auto-graded and essay questions. Partial results shown immediately, full results
                        after teacher grading.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Access Settings & Quiz Behavior */}
            <div className="space-y-6">
              {/* Access Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Access Settings</h3>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div>
                    <Label className="font-medium">Make Quiz Public</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Anyone with the link can access</p>
                  </div>
                  <Switch
                    checked={publishSettings.makePublic}
                    onCheckedChange={(checked) => setPublishSettings({ ...publishSettings, makePublic: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div>
                    <Label className="font-medium">Notify Students</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Send notification when quiz is published
                    </p>
                  </div>
                  <Switch
                    checked={publishSettings.notifyStudents}
                    onCheckedChange={(checked) => setPublishSettings({ ...publishSettings, notifyStudents: checked })}
                  />
                </div>
              </div>

              {/* Quiz Behavior */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Quiz Behavior</h3>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div>
                    <Label className="font-medium">Show Results</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Display score after completion</p>
                  </div>
                  <Switch
                    checked={publishSettings.showResults}
                    onCheckedChange={(checked) => setPublishSettings({ ...publishSettings, showResults: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div>
                    <Label className="font-medium">Allow Retakes</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Students can retake the quiz</p>
                  </div>
                  <Switch
                    checked={publishSettings.allowRetakes}
                    onCheckedChange={(checked) => setPublishSettings({ ...publishSettings, allowRetakes: checked })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={publishQuiz}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              disabled={isSaving}
            >
              <Share className="w-4 h-4 mr-2" />
              {isSaving ? "Publishing..." : "Publish Quiz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              Quiz Published Successfully!
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Your quiz is now live. Share this link with your students.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-medium">Quiz Link</Label>
              <div className="flex gap-2">
                <Input value={quizLink} readOnly className="bg-slate-50 dark:bg-slate-800/50 font-mono text-sm" />
                <Button onClick={copyQuizLink} variant="outline" size="sm" className="shrink-0 bg-transparent">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Questions:</span>
                  <span className="ml-2 font-medium">{questions.length}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Est. Time:</span>
                  <span className="ml-2 font-medium">{Math.round(totalEstimatedTime)}m</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Access:</span>
                  <span className="ml-2 font-medium">{publishSettings.makePublic ? "Public" : "Private"}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Retakes:</span>
                  <span className="ml-2 font-medium">{publishSettings.allowRetakes ? "Allowed" : "Not Allowed"}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Grading:</span>
                  <span className="ml-2 font-medium capitalize">{gradingType}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkModal(false)}>
              Close
            </Button>
            <Button
              onClick={copyQuizLink}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={blankContextMenu && blankContextMenu.visible}
        onOpenChange={(visible) => !visible && setBlankContextMenu(null)}
      >
        <div
          className="fixed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-2 z-[60]"
          style={{
            left: blankContextMenu?.x,
            top: blankContextMenu?.y,
          }}
        >
          <button
            onClick={() => {
              if (!blankContextMenu) return
              deleteBlank(blankContextMenu.questionId, blankContextMenu.blankIndex)
            }}
            className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Blank
          </button>
          <button
            onClick={() => {
              if (!blankContextMenu) return
              // Duplicate the blank
              const question = questions.find((q) => q.id === blankContextMenu.questionId)
              if (question) {
                const answer = question.options?.[blankContextMenu.blankIndex] || ""
                const newOptions = [...(question.options || [])]
                newOptions.splice(blankContextMenu.blankIndex + 1, 0, answer)

                const parts = question.title.split(/({{blank_\d+}})/)
                let blankIndex = 0
                const newParts = []

                for (const part of parts) {
                  if (part.match(/({{blank_\d+}})/)) {
                    newParts.push(`{{blank_${blankIndex}}}`)
                    if (blankIndex === blankContextMenu.blankIndex) {
                      newParts.push(`{{blank_${blankIndex + 1}}}`)
                    }
                    blankIndex++
                  } else {
                    newParts.push(part)
                  }
                }

                // Update indices
                let finalBlankIndex = 0
                const finalParts = newParts.map((part) => {
                  if (part.match(/({{blank_\d+}})/)) {
                    return `{{blank_${finalBlankIndex++}}}`
                  }
                  return part
                })

                setQuestions((prev) =>
                  prev.map((q) =>
                    q.id === blankContextMenu.questionId
                      ? { ...q, title: finalParts.join(""), options: newOptions }
                      : q,
                  ),
                )
              }
              setBlankContextMenu(null)
            }}
            className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Duplicate Blank
          </button>
        </div>
      </Dialog>

      <Dialog open={showQuestionBankDialog} onOpenChange={setShowQuestionBankDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Database className="w-6 h-6 text-indigo-600" />
              Import from Question Bank
            </DialogTitle>
            <DialogDescription>
              Select questions from your question bank to add to this quiz. You can search, filter, and preview
              questions before importing.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search questions, tags, or subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                  <SelectItem value="True/False">True/False</SelectItem>
                  <SelectItem value="Short Answer">Short Answer</SelectItem>
                  <SelectItem value="Essay">Essay</SelectItem>
                  <SelectItem value="Fill in the Blank">Fill in the Blank</SelectItem>
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject Filter */}
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium">Subject:</Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterSubject === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterSubject("all")}
                >
                  All
                </Button>
                {uniqueSubjects.map((subject) => (
                  <Button
                    key={subject}
                    variant={filterSubject === subject ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterSubject(subject)}
                  >
                    {subject}
                  </Button>
                ))}
              </div>
            </div>

            {/* Selection Controls */}
            <div className="flex items-center justify-between py-2 border-y">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {selectedQuestionIds.size === filteredQuestions.length ? "Deselect All" : "Select All"}
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedQuestionIds.size} of {filteredQuestions.length} selected
                </span>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Showing {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Questions List */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-600 dark:text-slate-400">No questions found matching your filters.</p>
                  </div>
                ) : (
                  filteredQuestions.map((question) => {
                    const isSelected = selectedQuestionIds.has(question.id)
                    const isInQuiz = isQuestionInQuiz(question.id)

                    return (
                      <Card
                        key={question.id}
                        className={`transition-all duration-200 ${
                          isSelected
                            ? "border-indigo-500 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20"
                            : "hover:border-slate-300 dark:hover:border-slate-600"
                        } ${isInQuiz ? "opacity-50" : ""}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleQuestionSelection(question.id)}
                              disabled={isInQuiz}
                              className="mt-1"
                            />

                            {/* Question Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h4 className="font-medium text-slate-900 dark:text-white leading-snug">
                                  {question.question}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setPreviewQuestion(question)}
                                  className="shrink-0"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-sm">
                                <Badge variant="outline" className="font-normal">
                                  {question.type}
                                </Badge>
                                <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
                                <Badge variant="secondary">{question.subject}</Badge>
                                <span className="text-slate-600 dark:text-slate-400">{question.points} pts</span>
                                <span className="text-slate-500 dark:text-slate-500">•</span>
                                <span className="text-slate-600 dark:text-slate-400">
                                  Used in {question.usedIn} quizzes
                                </span>
                                {isInQuiz && (
                                  <>
                                    <span className="text-slate-500 dark:text-slate-500">•</span>
                                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                                      Already in quiz
                                    </span>
                                  </>
                                )}
                              </div>

                              {question.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {question.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs font-normal">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="p-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowQuestionBankDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleImportQuestions}
              disabled={selectedQuestionIds.size === 0}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Import {selectedQuestionIds.size > 0 ? `${selectedQuestionIds.size} ` : ""}Question
              {selectedQuestionIds.size !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewQuestion} onOpenChange={() => setPreviewQuestion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Question Preview
            </DialogTitle>
            <DialogDescription>This is how the question will appear to students.</DialogDescription>
          </DialogHeader>

          {previewQuestion && (
            <div className="space-y-4">
              {/* Question Info */}
              <div className="flex flex-wrap items-center gap-2 pb-3 border-b">
                <Badge variant="outline">{previewQuestion.type}</Badge>
                <Badge className={getDifficultyColor(previewQuestion.difficulty)}>{previewQuestion.difficulty}</Badge>
                <Badge variant="secondary">{previewQuestion.subject}</Badge>
                <span className="text-sm text-slate-600 dark:text-slate-400">{previewQuestion.points} points</span>
              </div>

              {/* Question Text */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  {previewQuestion.question}
                </h3>

                {/* Options for Multiple Choice */}
                {previewQuestion.type === "Multiple Choice" && previewQuestion.options && (
                  <div className="space-y-2">
                    {previewQuestion.options.map((option: string, index: number) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-2 ${
                          option === previewQuestion.correctAnswer
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              option === previewQuestion.correctAnswer
                                ? "border-green-500 bg-green-500"
                                : "border-slate-300 dark:border-slate-600"
                            }`}
                          >
                            {option === previewQuestion.correctAnswer && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-slate-900 dark:text-white">{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* True/False */}
                {previewQuestion.type === "True/False" && (
                  <div className="space-y-2">
                    {["True", "False"].map((option) => (
                      <div
                        key={option}
                        className={`p-3 rounded-lg border-2 ${
                          option.toLowerCase() === previewQuestion.correctAnswer
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              option.toLowerCase() === previewQuestion.correctAnswer
                                ? "border-green-500 bg-green-500"
                                : "border-slate-300 dark:border-slate-600"
                            }`}
                          >
                            {option.toLowerCase() === previewQuestion.correctAnswer && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="text-slate-900 dark:text-white">{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Short Answer / Fill in the Blank */}
                {(previewQuestion.type === "Short Answer" || previewQuestion.type === "Fill in the Blank") && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Student Answer Area</p>
                      <Input placeholder="Type answer here..." disabled />
                    </div>
                    <div className="p-3 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Correct Answer:</p>
                      <p className="text-slate-900 dark:text-white">{previewQuestion.correctAnswer}</p>
                    </div>
                  </div>
                )}

                {/* Essay */}
                {previewQuestion.type === "Essay" && (
                  <div className="p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Student Essay Area</p>
                    <Textarea placeholder="Type essay here..." rows={6} disabled />
                  </div>
                )}
              </div>

              {/* Explanation */}
              {previewQuestion.explanation && (
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Explanation:</p>
                  <p className="text-sm text-blue-800 dark:text-blue-400">{previewQuestion.explanation}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewQuestion(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface QuestionEditorProps {
  question: Question
  onUpdate: (updates: Partial<Question>) => void
  onConvertToBlank?: (questionId: string) => void
  onAddBlankAtCursor?: (questionId: string) => void
  onDelete: () => void
  onDuplicate: () => void
  questionNumber: number
  dragHandleProps: any
  isActive: boolean
  selectedText: string
  selectionRange: { start: number; end: number } | null
  onTextSelection: (questionId: string) => void
  onClearSelection: () => void
  setBlankContextMenu: (
    menu: { visible: boolean; x: number; y: number; blankIndex: number; questionId: string } | null,
  ) => void
  getDefaultEstimatedTime: (questionType: Question["type"]) => number
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  onUpdate,
  onConvertToBlank,
  onAddBlankAtCursor,
  onDelete,
  onDuplicate,
  questionNumber,
  dragHandleProps,
  isActive,
  selectedText,
  selectionRange,
  onTextSelection,
  onClearSelection,
  setBlankContextMenu,
  getDefaultEstimatedTime,
}) => {
  const questionTypes = useMemo(
    () => [
      { value: "multiple-choice", label: "Multiple Choice", icon: CheckCircle },
      { value: "checkbox", label: "Checkbox", icon: Square },
      { value: "true-false", label: "True/False", icon: ToggleLeft },
      { value: "short-answer", label: "Short Answer", icon: Type },
      { value: "long-answer", label: "Long Answer", icon: AlignLeft },
      { value: "fill-blank", label: "Fill in the Blank", icon: FileText },
      { value: "matching", label: "Matching", icon: List },
      { value: "drag-drop", label: "Drag & Drop", icon: Move },
      { value: "ordering", label: "Ordering", icon: ArrowUpDown },
      { value: "dropdown", label: "Dropdown", icon: ChevronDown },
      { value: "linear-scale", label: "Linear Scale", icon: BarChart3 },
      { value: "essay", label: "Essay", icon: FileText }, // Added essay type
    ],
    [],
  )

  const addOption = () => {
    const newOptions = [...(question.options || []), ""]
    onUpdate({ options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])]
    newOptions[index] = value
    onUpdate({ options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = question.options?.filter((_, i) => i !== index) || []
    onUpdate({ options: newOptions })
  }

  const setCorrectAnswer = (answer: number | boolean) => {
    onUpdate({ correctAnswer: answer })
  }

  const addCorrectAnswer = (answer: number) => {
    const currentCorrectAnswers = question.correctAnswers || []
    const newCorrectAnswers = currentCorrectAnswers.includes(answer)
      ? currentCorrectAnswers.filter((a) => a !== answer)
      : [...currentCorrectAnswers, answer]
    onUpdate({ correctAnswers: newCorrectAnswers })
  }

  const renderFillBlankEditor = () => {
    const parts = question.title.split(/({{blank_\d+}})/)
    let blankIndex = 0

    return (
      <div className="space-y-4">
        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Question with Blanks</Label>

        {/* Main question editor */}
        <div className="space-y-2">
          <div
            id={`question-title-${question.id}`}
            contentEditable={true}
            suppressContentEditableWarning
            onInput={(e) => {
              const newTitle = e.currentTarget.innerHTML
              onUpdate({ title: newTitle })
            }}
            onMouseUp={() => onTextSelection(question.id)}
            onMouseLeave={() => onClearSelection()}
            onContextMenu={(e) => e.stopPropagation()} // Prevent parent context menu
            className="min-h-[120px] p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors outline-none prose max-w-none"
          >
            <div className="text-lg leading-relaxed flex flex-wrap items-center gap-1">
              {parts.map((part, index) => {
                if (part.match(/({{blank_\d+}})/)) {
                  const currentBlankIndex = blankIndex++
                  const answer = question.options?.[currentBlankIndex] || ""

                  return (
                    <span
                      key={index}
                      // Make the blank span editable but styled as an input
                      contentEditable={false}
                      className="inline-block mx-1 px-3 py-2 border-2 border-blue-300 dark:border-blue-600 rounded-md bg-blue-50 dark:bg-blue-900/20 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500"
                      onContextMenu={(e) => handleBlankRightClick(e, currentBlankIndex, question.id)}
                      style={{
                        minWidth: "80px",
                        width: `${Math.max(80, (answer.length + 2) * 12)}px`,
                      }}
                    >
                      {answer || "____"} {/* Display answer or placeholder */}
                    </span>
                  )
                }

                return (
                  <span key={index}>
                    {part || (index === parts.length - 1 && parts.length === 1 ? "Type your question here..." : "")}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => onAddBlankAtCursor?.(question.id)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Blank
            </Button>
            {question.title.trim() && (
              <Button
                onClick={() => onConvertToBlank?.(question.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Convert Last Word
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const handleBlankRightClick = (e: React.MouseEvent, blankIndex: number, questionId: string) => {
    e.preventDefault()
    e.stopPropagation() // Prevent parent context menu
    setBlankContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      blankIndex,
      questionId,
    })
  }

  return (
    <Card
      className={`transition-all duration-300 hover:shadow-xl border-l-4 ${
        isActive
          ? "ring-2 ring-blue-500 shadow-xl border-l-blue-500"
          : "border-l-slate-200 dark:border-l-slate-700 hover:border-l-blue-400"
      }`}
    >
      <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/50 to-blue-50/50 dark:from-slate-800/50 dark:to-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform duration-200"
            >
              <GripVertical className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                {questionNumber}
              </div>
              <Select
                value={question.type}
                onValueChange={(value: Question["type"]) => {
                  let newOptions
                  if (value === "multiple-choice" && !question.options) {
                    newOptions = ["", "", "", ""]
                  } else if (value === "matching" && !question.options) {
                    newOptions = ["", "", "", ""]
                  } else if (value === "fill-blank" && !question.options) {
                    newOptions = []
                  } else if (value === "checkbox" && !question.options) {
                    newOptions = ["", ""]
                  }
                  onUpdate({
                    type: value,
                    options: newOptions,
                    correctAnswer: undefined,
                    correctAnswers: undefined,
                    matchingPairs: undefined,
                    estimatedTime: getDefaultEstimatedTime(value),
                  })
                }}
              >
                <SelectTrigger className="w-48 hover:border-blue-400 transition-colors duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Points:</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={question.points}
                onChange={(e) => onUpdate({ points: Number.parseInt(e.target.value) || 1 })}
                className="w-20 hover:border-blue-400 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Time:</Label>
              <Input
                type="number"
                min="0.5"
                max="60"
                step="0.5"
                value={question.estimatedTime || getDefaultEstimatedTime(question.type)}
                onChange={(e) =>
                  onUpdate({
                    estimatedTime: Number.parseFloat(e.target.value) || getDefaultEstimatedTime(question.type),
                  })
                }
                className="w-20 hover:border-gre"
              />
              <span className="text-xs text-slate-500">min</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent hover:scale-105 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDuplicate}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-transparent hover:scale-105 transition-all duration-200"
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Title */}
        {question.type === "fill-blank" ? (
          renderFillBlankEditor()
        ) : (
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Question</Label>
            <Textarea
              id={`question-title-${question.id}`}
              placeholder="Enter your question here..."
              value={question.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="min-h-[100px] text-base hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 hover:shadow-sm"
              onMouseUp={() => onTextSelection(question.id)}
              onMouseLeave={() => onClearSelection()}
            />
          </div>
        )}

        {/* Question Description */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description (Optional)</Label>
          <Textarea
            placeholder="Add additional context or instructions..."
            value={question.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="min-h-[60px] hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 hover:shadow-sm"
          />
        </div>

        {/* Question Type Specific Content */}
        {question.type === "multiple-choice" && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Answer Options</Label>
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctAnswer === index}
                    onChange={() => setCorrectAnswer(index)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className={`flex-1 transition-all duration-200 hover:shadow-sm ${
                      question.correctAnswer === index
                        ? "border-green-300 bg-green-50 dark:bg-green-900/20 shadow-sm"
                        : "hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400"
                    }`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addOption}
                className="w-full justify-start bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        {question.type === "checkbox" && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Answer Options</Label>
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <input
                    type="checkbox"
                    checked={question.correctAnswers?.includes(index) || false}
                    onChange={() => addCorrectAnswer(index)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className={`flex-1 transition-all duration-200 hover:shadow-sm ${
                      question.correctAnswers?.includes(index)
                        ? "border-green-300 bg-green-50 dark:bg-green-900/20 shadow-sm"
                        : "hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400"
                    }`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addOption}
                className="w-full justify-start bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        {question.type === "true-false" && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Correct Answer</Label>
            <div className="flex gap-4">
              <Button
                variant={question.correctAnswer === true ? "default" : "outline"}
                onClick={() => setCorrectAnswer(true)}
                className={`flex-1 transition-all duration-200 hover:scale-105 ${
                  question.correctAnswer === true
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                    : "hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-400"
                }`}
              >
                <Check className="w-4 h-4 mr-2" />
                True
              </Button>
              <Button
                variant={question.correctAnswer === false ? "default" : "outline"}
                onClick={() => setCorrectAnswer(false)}
                className={`flex-1 transition-all duration-200 hover:scale-105 ${
                  question.correctAnswer === false
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-lg"
                    : "hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400"
                }`}
              >
                <X className="w-4 h-4 mr-2" />
                False
              </Button>
            </div>
          </div>
        )}

        {(question.type === "short-answer" || question.type === "long-answer" || question.type === "essay") && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Max Points for Grading
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g., 5"
                  value={question.maxPoints || 5}
                  onChange={(e) => onUpdate({ maxPoints: Number.parseInt(e.target.value) || 5 })}
                  className="hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Points teachers can assign when grading (0 to this value)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Grading Rubric (Optional)
              </Label>
              <Textarea
                placeholder="Enter grading criteria...&#10;Example:&#10;• Clear explanation (2 pts)&#10;• Scientific accuracy (2 pts)&#10;• Proper grammar (1 pt)"
                value={question.gradingRubric || ""}
                onChange={(e) => onUpdate({ gradingRubric: e.target.value })}
                className="min-h-[100px] hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Provide grading criteria to help with consistent evaluation
              </p>
            </div>
            {/* </CHANGE> */}

            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Sample Answers (Optional)
            </Label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add sample correct answers to help with grading guidance.
            </p>
            <div className="space-y-2">
              {question.sampleAnswers?.map((answer, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <Input
                    placeholder={`Sample answer ${index + 1}`}
                    value={answer}
                    onChange={(e) => {
                      const newAnswers = [...(question.sampleAnswers || [])]
                      newAnswers[index] = e.target.value
                      onUpdate({ sampleAnswers: newAnswers })
                    }}
                    className="flex-1 hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newAnswers = question.sampleAnswers?.filter((_, i) => i !== index) || []
                      onUpdate({ sampleAnswers: newAnswers })
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const newAnswers = [...(question.sampleAnswers || []), ""]
                  onUpdate({ sampleAnswers: newAnswers })
                }}
                className="w-full justify-start bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Sample Answer
              </Button>
            </div>
          </div>
        )}

        {question.type === "fill-blank" && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Correct Answers</Label>
            <div className="space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                💡 <strong>How to create blanks:</strong>
                <br />
                1. Type your question text (e.g., "Hello I'm John")
                <br />
                2. Click "Add Blank" to add a blank at cursor position
                <br />
                3. Or click "Convert Last Word" to convert the last word to a blank
              </p>
              <div className="flex gap-2">
                {question.title.trim() && (
                  <>
                    <Button
                      onClick={() => onAddBlankAtCursor?.(question.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Blank
                    </Button>
                    <Button
                      onClick={() => onConvertToBlank?.(question.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Convert Last Word
                    </Button>
                  </>
                )}
              </div>
              {(!question.options || question.options.length === 0) && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No blanks created yet</p>
                  <p className="text-xs">Type your question and click "Add Blank"</p>
                </div>
              )}
            </div>
            {question.options && question.options.length > 0 && (
              <div className="space-y-3">
                {question.options.map((answer, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[60px] font-medium">
                      Blank {index + 1}:
                    </span>
                    <Input
                      placeholder="Enter correct answer"
                      value={answer}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {question.type === "fill-blank" && question.title && (
          <div className="space-y-4">
            <div className="text-lg leading-relaxed">
              {question.title.split(/({{blank_\d+}})/).map((part, index) => {
                if (part.match(/({{blank_\d+}})/)) {
                  const blankMatch = part.match(/{{blank_(\d+)}}/)
                  if (blankMatch) {
                    const blankIndex = Number.parseInt(blankMatch[1], 10)
                    const answer = question.options?.[blankIndex] || ""
                    return (
                      <span
                        key={index}
                        contentEditable={false}
                        className="inline-block mx-1 px-3 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        style={{
                          minWidth: "120px",
                          width: `${Math.max(120, (answer.length + 2) * 12)}px`,
                        }}
                        onContextMenu={(e) => handleBlankRightClick(e, blankIndex, question.id)}
                      >
                        {answer || "____"}
                      </span>
                    )
                  }
                }
                return <span key={index}>{part}</span>
              })}
            </div>
          </div>
        )}

        {question.type === "matching" && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Matching Pairs</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-500 dark:text-slate-400">Column A</Label>
                {question.options?.slice(0, Math.ceil((question.options?.length || 0) / 2)).map((option, index) => (
                  <Input
                    key={index}
                    placeholder={`Item ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                  />
                ))}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-500 dark:text-slate-400">Column B</Label>
                {question.options?.slice(Math.ceil((question.options?.length || 0) / 2)).map((option, index) => {
                  const actualIndex = Math.ceil((question.options?.length || 0) / 2) + index
                  return (
                    <Input
                      key={actualIndex}
                      placeholder={`Match ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(actualIndex, e.target.value)}
                      className="hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                    />
                  )
                })}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                addOption()
                addOption()
              }}
              className="w-full justify-start bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Matching Pair
            </Button>
          </div>
        )}

        {/* Question Settings */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={question.required} onCheckedChange={(checked) => onUpdate({ required: checked })} />
              <Label className="text-sm">Required</Label>
            </div>
            {(question.type === "multiple-choice" || question.type === "ordering") && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={question.randomizeOptions || false}
                  onCheckedChange={(checked) => onUpdate({ randomizeOptions: checked })}
                />
                <Label className="text-sm">Randomize Options</Label>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
