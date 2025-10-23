"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Plus,
  ArrowLeft,
  Shield,
  Shuffle,
  Clock,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Star,
  Sparkles,
  Zap,
  Eye,
  MousePointer,
  Monitor,
  CheckCircle2,
  HelpCircle,
  X,
  Timer,
  Calendar,
  CalendarClock,
  FileText,
  Layers,
  ArrowRight,
  CheckCircle,
  Globe,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreateQuiz() {
  const router = useRouter()
  const [animatingToggles, setAnimatingToggles] = useState<Set<string>>(new Set())
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [formProgress, setFormProgress] = useState(0)

  const [newQuiz, setNewQuiz] = useState({
    testType: "long-form" as "long-form" | "mixed" | "one-at-a-time",
    visibility: "assigned" as "assigned" | "school-wide",
    accessCode: "",
    title: "",
    subjects: ["Mathematics"], // Dynamic array of subjects
    grades: ["Grade 8"], // Dynamic array of grades
    sections: ["Section A"], // Dynamic array of sections
    timeLimitMinutes: 30, // How long students have to complete the quiz
    // </CHANGE>
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    timeZone: "Asia/Manila",
    // Main toggles
    publishMode: "immediate" as "immediate" | "scheduled",
    scheduleOpenDate: "",
    scheduleOpenTime: "",
    scheduleCloseDate: "",
    scheduleCloseTime: "",
    // </CHANGE>
    securedQuiz: false,
    questionPool: false,
    strictTimeLimit: false,
    autoSave: true,
    backtrackingControl: false,
    shuffleQuestions: false,
    // Security sub-options (only visible when securedQuiz is true)
    quizLockdown: false,
    antiScreenshot: false,
    disableCopyPaste: false,
    disableRightClick: false,
    lockdownUI: false,
    // Question pool sub-options
    stratifiedSampling: false,
    totalQuestions: 20,
    poolSize: 20,
  })

  const [newSubject, setNewSubject] = useState("")
  const [newGrade, setNewGrade] = useState("")
  const [newSection, setNewSection] = useState("")

  const subjectOptions = [
    "Mathematics",
    "Science",
    "English",
    "Filipino",
    "Social Studies",
    "Physical Education",
    "Music",
    "Arts",
    "Technology and Livelihood Education",
    "Values Education",
    "Computer Science",
    "Physics",
    "Chemistry",
    "Biology",
  ]

  const gradeOptions = [
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
    "Kindergarten",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
  ]

  const sectionOptions = [
    "Section A",
    "Section B",
    "Section C",
    "Section D",
    "Section E",
    "Section F",
    "Section G",
    "Section H",
    "Section I",
    "Section J",
    "Diamond",
    "Emerald",
    "Ruby",
    "Sapphire",
    "Pearl",
    "Gold",
    "Silver",
  ]

  type ExpandableSection = "securedQuiz" | "questionPool"
  const [expandedSections, setExpandedSections] = useState<Record<ExpandableSection, boolean>>({
    securedQuiz: false,
    questionPool: false,
  })

  useEffect(() => {
    const requiredFields = ["title", "subjects", "grades", "sections"]
    const filledFields = requiredFields.filter((field) => {
      const value = newQuiz[field as keyof typeof newQuiz]
      return Array.isArray(value) ? value.length > 0 : value
    })
    setFormProgress((filledFields.length / requiredFields.length) * 100)
  }, [newQuiz])

  const addSubject = () => {
    if (newSubject && !newQuiz.subjects.includes(newSubject)) {
      setNewQuiz({ ...newQuiz, subjects: [...newQuiz.subjects, newSubject] })
      setNewSubject("")
    }
  }

  const removeSubject = (subject: string) => {
    if (newQuiz.subjects.length > 1) {
      setNewQuiz({ ...newQuiz, subjects: newQuiz.subjects.filter((s) => s !== subject) })
    }
  }

  const addGrade = () => {
    if (newGrade && !newQuiz.grades.includes(newGrade)) {
      setNewQuiz({ ...newQuiz, grades: [...newQuiz.grades, newGrade] })
      setNewGrade("")
    }
  }

  const removeGrade = (grade: string) => {
    if (newQuiz.grades.length > 1) {
      setNewQuiz({ ...newQuiz, grades: newQuiz.grades.filter((g) => g !== grade) })
    }
  }

  const addSection = () => {
    if (newSection && !newQuiz.sections.includes(newSection)) {
      setNewQuiz({ ...newQuiz, sections: [...newQuiz.sections, newSection] })
      setNewSection("")
    }
  }

  const removeSection = (section: string) => {
    if (newQuiz.sections.length > 1) {
      setNewQuiz({ ...newQuiz, sections: newQuiz.sections.filter((s) => s !== section) })
    }
  }

  const handleToggleChange = (key: string, checked: boolean) => {
    setAnimatingToggles((prev) => new Set(prev).add(key))
    setNewQuiz({ ...newQuiz, [key]: checked })

    setTimeout(() => {
      setAnimatingToggles((prev) => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
    }, 300)

    if (key === "securedQuiz" && checked) {
      setExpandedSections((prev) => ({ ...prev, securedQuiz: true }))
    }
    if (key === "questionPool" && checked) {
      setExpandedSections((prev) => ({ ...prev, questionPool: true }))
    }
  }

  const handleCreateQuestions = () => {
    // Validate required fields
    if (
      !newQuiz.title ||
      newQuiz.subjects.length === 0 ||
      newQuiz.grades.length === 0 ||
      newQuiz.sections.length === 0
    ) {
      return
    }

    // Store quiz details in localStorage or state management
    localStorage.setItem("quizDetails", JSON.stringify(newQuiz))

    // Navigate to quiz builder
    router.push("/teacher/quiz/builder")
  }

  const toggleSection = (section: ExpandableSection) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const getRecommendations = () => {
    const recommendations = []

    if (newQuiz.title.toLowerCase().includes("exam") || newQuiz.title.toLowerCase().includes("test")) {
      recommendations.push("securedQuiz")
      recommendations.push("questionPool")
    }

    if (newQuiz.subjects.some((subject) => subject === "Mathematics" || subject === "Science")) {
      recommendations.push("questionPool")
      recommendations.push("shuffleQuestions")
    }

    return recommendations
  }

  const recommendations = getRecommendations()

  const tooltipExplanations = {
    securedQuiz:
      "Enables comprehensive security measures to prevent cheating during the quiz. This includes browser lockdown, screenshot blocking, and other anti-cheating features.",
    questionPool:
      "Create more questions than needed and randomly select a subset for each student. For example, create 30 questions but only show 20 to each student, ensuring different question sets.",
    stratifiedSampling:
      "Categorize questions by difficulty (Easy, Medium, Hard) and ensure balanced distribution across all students. Requires Question Pool to be enabled.",
    strictTimeLimit:
      "Set individual time limits for each question. Students must answer within the specified time or the question will auto-advance.",
    autoSave:
      "Automatically save student progress and submit the quiz when time expires. Prevents data loss due to technical issues or accidental browser closure.",
    backtrackingControl:
      "Prevent students from going back to previous questions once they've moved forward. Ensures linear progression through the quiz.",
    shuffleQuestions:
      "Randomize the order of questions for each student to prevent copying from neighbors during in-person exams.",
    quizLockdown:
      "Force the quiz to open only in a secure browser environment, preventing access to other applications or websites during the exam.",
    antiScreenshot:
      "Block screenshot capabilities and screen recording software to prevent students from capturing quiz content.",
    disableCopyPaste:
      "Disable copy and paste functionality to prevent students from copying questions or pasting pre-written answers.",
    disableRightClick:
      "Disable right-click context menu to prevent access to browser developer tools and other potentially helpful features.",
    lockdownUI:
      "Force the quiz into full-screen mode and hide browser navigation, taskbar, and other UI elements that could be distracting or helpful for cheating.",
  }

  const QuestionTooltip = ({ content, children }: { content: string; children?: React.ReactNode }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 ml-2"
            aria-label="Get help with quiz creation"
          >
            <HelpCircle className="w-3 h-3 text-gray-500 dark:text-gray-400" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  const getSchedulePreview = () => {
    if (newQuiz.publishMode === "immediate") {
      return "Quiz will be available immediately after creation"
    }

    const openDateTime =
      newQuiz.scheduleOpenDate && newQuiz.scheduleOpenTime
        ? `${new Date(newQuiz.scheduleOpenDate).toLocaleDateString()} at ${newQuiz.scheduleOpenTime}`
        : "Not set"

    const closeDateTime =
      newQuiz.scheduleCloseDate && newQuiz.scheduleCloseTime
        ? `${new Date(newQuiz.scheduleCloseDate).toLocaleDateString()} at ${newQuiz.scheduleCloseTime}`
        : "Not set"

    return { openDateTime, closeDateTime }
  }
  // </CHANGE>

  // </CHANGE>

  const generateAccessCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    setNewQuiz({ ...newQuiz, accessCode: code })
  }

  // Generate access code when public-code visibility is selected
  // </CHANGE>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Create Quiz
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-gray-600 dark:text-gray-400">Design an assessment for your students</p>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                    style={{ width: `${formProgress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round(formProgress)}%</span>
              </div>
            </div>
          </div>
        </div>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50 mb-6">
          <CardHeader className="pb-6 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-t-lg">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-500" />
              Choose Your Test Format
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Select how students will experience your quiz. Each format offers different benefits for various
              assessment types.
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <RadioGroup
              value={newQuiz.testType}
              onValueChange={(value: "long-form" | "mixed" | "one-at-a-time") =>
                setNewQuiz({ ...newQuiz, testType: value })
              }
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Long Form Type */}
              <div
                className={`relative cursor-pointer transition-all duration-300 ${
                  newQuiz.testType === "long-form"
                    ? "scale-105 ring-2 ring-blue-500 shadow-xl"
                    : "hover:scale-102 hover:shadow-lg"
                }`}
                onClick={() => setNewQuiz({ ...newQuiz, testType: "long-form" })}
              >
                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <RadioGroupItem value="long-form" id="long-form" className="mt-1" />
                    <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>

                  <Label htmlFor="long-form" className="cursor-pointer">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">All Questions (Long Form)</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      All questions displayed on one scrollable page, like Google Forms
                    </p>
                  </Label>

                  {/* Animated Preview */}
                  <div className="relative h-32 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-300 dark:border-blue-700 overflow-hidden mb-4">
                    <div className="absolute inset-0 p-3 space-y-2 animate-scroll-slow">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-start gap-2 bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                          <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 space-y-1">
                            <div className="h-2 bg-blue-300 dark:bg-blue-700 rounded w-3/4" />
                            <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Easy navigation between questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>See all questions at once</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Best for surveys & forms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mixed Type */}
              <div
                className={`relative cursor-pointer transition-all duration-300 ${
                  newQuiz.testType === "mixed"
                    ? "scale-105 ring-2 ring-purple-500 shadow-xl"
                    : "hover:scale-102 hover:shadow-lg"
                }`}
                onClick={() => setNewQuiz({ ...newQuiz, testType: "mixed" })}
              >
                <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <RadioGroupItem value="mixed" id="mixed" className="mt-1" />
                    <Layers className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>

                  <Label htmlFor="mixed" className="cursor-pointer">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Mixed Sections</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Questions organized into sections or pages with navigation
                    </p>
                  </Label>

                  <div className="relative h-32 bg-white dark:bg-gray-800 rounded-lg border-2 border-purple-300 dark:border-purple-700 overflow-hidden mb-4">
                    <div className="absolute inset-0 p-3">
                      {/* Progress indicator with animation */}
                      <div className="flex gap-2 mb-3">
                        <div className="h-1 flex-1 bg-purple-500 rounded-full animate-progress-fill" />
                        <div className="h-1 flex-1 bg-purple-200 dark:bg-purple-800 rounded-full" />
                        <div className="h-1 flex-1 bg-purple-200 dark:bg-purple-800 rounded-full" />
                      </div>
                      {/* Questions with page transition animation (horizontal) */}
                      <div className="space-y-2 animate-page-transition">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded">
                          <div className="h-2 bg-purple-300 dark:bg-purple-700 rounded w-full mb-1" />
                          <div className="h-2 bg-purple-200 dark:bg-purple-800 rounded w-3/4" />
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded">
                          <div className="h-2 bg-purple-300 dark:bg-purple-700 rounded w-full mb-1" />
                          <div className="h-2 bg-purple-200 dark:bg-purple-800 rounded w-2/3" />
                        </div>
                      </div>
                      {/* Next button with pulse animation */}
                      <div className="absolute bottom-3 right-3">
                        <div className="bg-purple-500 rounded p-1 animate-button-pulse">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Organized by topics/sections</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Progress tracking per section</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Best for structured exams</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* One at a Time Type */}
              <div
                className={`relative cursor-pointer transition-all duration-300 ${
                  newQuiz.testType === "one-at-a-time"
                    ? "scale-105 ring-2 ring-orange-500 shadow-xl"
                    : "hover:scale-102 hover:shadow-lg"
                }`}
                onClick={() => setNewQuiz({ ...newQuiz, testType: "one-at-a-time" })}
              >
                <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <RadioGroupItem value="one-at-a-time" id="one-at-a-time" className="mt-1" />
                    <Monitor className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>

                  <Label htmlFor="one-at-a-time" className="cursor-pointer">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">One Question at a Time</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Single question per screen with next/previous navigation
                    </p>
                  </Label>

                  <div className="relative h-32 bg-white dark:bg-gray-800 rounded-lg border-2 border-orange-300 dark:border-orange-700 overflow-hidden mb-4">
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      {/* Question counter */}
                      <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">Question 1 of 10</div>
                      {/* Single question with horizontal slide animation */}
                      <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg flex-1 my-2 flex items-center justify-center animate-question-slide">
                        <div className="w-full space-y-2">
                          <div className="h-3 bg-orange-300 dark:bg-orange-700 rounded w-full" />
                          <div className="h-3 bg-orange-200 dark:bg-orange-800 rounded w-4/5" />
                        </div>
                      </div>
                      {/* Navigation buttons */}
                      <div className="flex justify-between items-center">
                        <div className="h-6 w-16 bg-orange-200 dark:bg-orange-800 rounded opacity-50" />
                        <div className="h-6 w-16 bg-orange-500 rounded animate-button-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Maximum focus per question</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Reduces overwhelm</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Best for timed quizzes</span>
                    </div>
                  </div>
                </div>
              </div>
            </RadioGroup>

            {/* Selected Type Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {newQuiz.testType === "long-form" && "Long Form Selected"}
                    {newQuiz.testType === "mixed" && "Mixed Sections Selected"}
                    {newQuiz.testType === "one-at-a-time" && "One at a Time Selected"}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {newQuiz.testType === "long-form" &&
                      "Students will see all questions on one page and can scroll through them freely. Great for surveys, worksheets, and comprehensive assessments where students benefit from seeing the full scope."}
                    {newQuiz.testType === "mixed" &&
                      "Questions will be organized into logical sections or pages. Students can navigate between sections while maintaining focus. Ideal for exams with different topics or question types."}
                    {newQuiz.testType === "one-at-a-time" &&
                      "Students will see one question at a time with clear navigation buttons. This format minimizes distractions and is perfect for timed assessments or when you want students to focus on each question individually."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl border-0 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
          <CardHeader className="pb-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-t-lg">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Quiz Details & Settings
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8 p-8">
            {/* Quiz Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gradient-to-r from-gray-200 to-transparent dark:from-gray-700 pb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Quiz Information
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2 group">
                    <Label
                      htmlFor="quiz-title"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400"
                    >
                      Quiz Title *
                    </Label>
                    <Input
                      id="quiz-title"
                      placeholder="Enter quiz title..."
                      value={newQuiz.title}
                      onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                      className="bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-600/50"
                    />
                  </div>

                  <div className="space-y-4 p-5 bg-gradient-to-br from-violet-50/50 to-purple-50/30 dark:from-violet-900/20 dark:to-purple-900/10 rounded-xl border-2 border-violet-200/50 dark:border-violet-800/30">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      <Label className="text-base font-semibold text-gray-900 dark:text-white">Quiz Visibility</Label>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Choose who can access this quiz</p>

                    <RadioGroup
                      value={newQuiz.visibility}
                      onValueChange={(value: "assigned" | "school-wide") =>
                        setNewQuiz({ ...newQuiz, visibility: value })
                      }
                      className="space-y-3"
                    >
                      {/* Assigned to Specific Classes */}
                      <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors border border-violet-200/50 dark:border-violet-800/30">
                        <RadioGroupItem value="assigned" id="assigned" className="mt-1" />
                        <Label htmlFor="assigned" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">Assigned to Specific Classes</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                            Only students in selected grade levels and sections can access
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30">
                              Targeted
                            </Badge>
                            <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30">
                              Tracked
                            </Badge>
                          </div>
                        </Label>
                      </div>

                      {/* School-wide */}
                      <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors border border-violet-200/50 dark:border-violet-800/30">
                        <RadioGroupItem value="school-wide" id="school-wide" className="mt-1" />
                        <Label htmlFor="school-wide" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <Globe className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">School-wide (All Students)</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                            Available to all students in the school
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30">
                              Open Access
                            </Badge>
                            <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30">
                              Practice
                            </Badge>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    {/* Show grade/section selectors only for assigned visibility */}
                    {newQuiz.visibility === "assigned" && (
                      <div className="pt-4 border-t border-violet-200 dark:border-violet-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          Select target classes below (Subjects, Grade Levels, Sections)
                        </p>
                      </div>
                    )}

                    {/* Show school-wide notice */}
                    {newQuiz.visibility === "school-wide" && (
                      <div className="pt-4 border-t border-violet-200 dark:border-violet-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="p-3 bg-green-100/50 dark:bg-green-900/20 rounded-lg border border-green-300/50 dark:border-green-700/50">
                          <p className="text-xs font-medium text-green-900 dark:text-green-100 flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            This quiz will be visible to all students in your school
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {newQuiz.visibility === "assigned" && (
                    <>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subjects *</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {newQuiz.subjects.map((subject, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                            >
                              {subject}
                              {newQuiz.subjects.length > 1 && (
                                <button
                                  onClick={() => removeSubject(subject)}
                                  className="ml-2 hover:text-red-600 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Select value={newSubject} onValueChange={setNewSubject}>
                            <SelectTrigger className="bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-all duration-200">
                              <SelectValue placeholder="Select subject..." />
                            </SelectTrigger>
                            <SelectContent>
                              {subjectOptions
                                .filter((subject) => !newQuiz.subjects.includes(subject))
                                .map((subject) => (
                                  <SelectItem key={subject} value={subject}>
                                    {subject}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            onClick={addSubject}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={!newSubject}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Grade Levels *</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {newQuiz.grades.map((grade, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                            >
                              {grade}
                              {newQuiz.grades.length > 1 && (
                                <button
                                  onClick={() => removeGrade(grade)}
                                  className="ml-2 hover:text-red-600 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Select value={newGrade} onValueChange={setNewGrade}>
                            <SelectTrigger className="bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-all duration-200">
                              <SelectValue placeholder="Select grade level..." />
                            </SelectTrigger>
                            <SelectContent>
                              {gradeOptions
                                .filter((grade) => !newQuiz.grades.includes(grade))
                                .map((grade) => (
                                  <SelectItem key={grade} value={grade}>
                                    {grade}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            onClick={addGrade}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={!newGrade}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sections *</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {newQuiz.sections.map((section, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                            >
                              {section}
                              {newQuiz.sections.length > 1 && (
                                <button
                                  onClick={() => removeSection(section)}
                                  className="ml-2 hover:text-red-600 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Select value={newSection} onValueChange={setNewSection}>
                            <SelectTrigger className="bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-all duration-200">
                              <SelectValue placeholder="Select section..." />
                            </SelectTrigger>
                            <SelectContent>
                              {sectionOptions
                                .filter((section) => !newQuiz.sections.includes(section))
                                .map((section) => (
                                  <SelectItem key={section} value={section}>
                                    {section}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            onClick={addSection}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            disabled={!newSection}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-4 p-5 bg-gradient-to-br from-orange-50/50 to-yellow-50/30 dark:from-orange-900/20 dark:to-yellow-900/10 rounded-xl border-2 border-orange-200/50 dark:border-orange-800/30">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Timer className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <Label className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          Quiz Time Limit
                          <QuestionTooltip content="How long students have to complete the quiz once they start. For example, if you set 60 minutes, students must finish within 60 minutes from when they begin." />
                        </Label>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Total time students have to complete the quiz after starting
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          min="1"
                          max="480"
                          placeholder="60"
                          value={newQuiz.timeLimitMinutes}
                          onChange={(e) =>
                            setNewQuiz({ ...newQuiz, timeLimitMinutes: Number.parseInt(e.target.value) || 30 })
                          }
                          className="w-32 bg-white/70 dark:bg-gray-700/70 text-lg font-semibold"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">minutes</span>
                      </div>

                      <div className="p-3 bg-orange-100/50 dark:bg-orange-900/20 rounded-lg border border-orange-300/50 dark:border-orange-700/50">
                        <p className="text-xs text-orange-900 dark:text-orange-100">
                          <strong>Example:</strong> If set to {newQuiz.timeLimitMinutes} minutes, students must complete
                          the quiz within {newQuiz.timeLimitMinutes} minutes from when they click "Start Quiz"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors group-focus-within:text-blue-600 flex items-center gap-2">
                      Due Date
                      <QuestionTooltip content="The last date students can start taking the quiz. After this date, the quiz will no longer be accessible." />
                    </Label>
                    <Input
                      type="date"
                      value={newQuiz.dueDate}
                      onChange={(e) => setNewQuiz({ ...newQuiz, dueDate: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      className="bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Students can start the quiz anytime before this date
                    </p>
                  </div>
                  {/* </CHANGE> */}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2 group">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors group-focus-within:text-blue-600">
                      Description
                    </Label>
                    <Textarea
                      placeholder="Provide instructions for your quiz..."
                      value={newQuiz.description}
                      onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                      className="min-h-[120px] bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm resize-none hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-4 p-5 bg-gradient-to-br from-cyan-50/50 to-blue-50/30 dark:from-cyan-900/20 dark:to-blue-900/10 rounded-xl border-2 border-cyan-200/50 dark:border-cyan-800/30">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                        <CalendarClock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <Label className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          Quiz Availability Window
                          <QuestionTooltip content="Control when students can access and start the quiz. This is different from the time limit - this controls the dates/times when the quiz is available to begin." />
                        </Label>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          When can students access and start this quiz?
                        </p>
                      </div>
                    </div>

                    <RadioGroup
                      value={newQuiz.publishMode}
                      onValueChange={(value: "immediate" | "scheduled") =>
                        setNewQuiz({ ...newQuiz, publishMode: value })
                      }
                      className="space-y-3"
                    >
                      <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors border border-cyan-200/50 dark:border-cyan-800/30">
                        <RadioGroupItem value="immediate" id="immediate" className="mt-1" />
                        <Label htmlFor="immediate" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold">Available Immediately</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-normal">
                            Quiz becomes available right after you create it. Students can start anytime until the due
                            date.
                          </p>
                          <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                            <p className="text-xs text-green-800 dark:text-green-200">
                              <strong>Timeline:</strong> Now → Due Date ({newQuiz.dueDate || "Not set"})
                            </p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors border border-cyan-200/50 dark:border-cyan-800/30">
                        <RadioGroupItem value="scheduled" id="scheduled" className="mt-1" />
                        <Label htmlFor="scheduled" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold">Schedule Availability Window</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-normal">
                            Set specific dates and times when the quiz opens and closes. Students can only start during
                            this window.
                          </p>
                        </Label>
                      </div>
                    </RadioGroup>

                    {newQuiz.publishMode === "scheduled" && (
                      <div className="space-y-4 pt-4 border-t border-cyan-200 dark:border-cyan-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" />
                            <span>
                              <strong>Important:</strong> Students can only START the quiz during this window. Once
                              started, they have {newQuiz.timeLimitMinutes} minutes to complete it.
                            </span>
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                              Quiz Opens (Students Can Start)
                            </Label>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-600 dark:text-gray-400">Date</Label>
                              <Input
                                type="date"
                                value={newQuiz.scheduleOpenDate}
                                onChange={(e) => setNewQuiz({ ...newQuiz, scheduleOpenDate: e.target.value })}
                                className="bg-white/70 dark:bg-gray-700/70 text-sm"
                                min={new Date().toISOString().split("T")[0]}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-600 dark:text-gray-400">Time</Label>
                              <Input
                                type="time"
                                value={newQuiz.scheduleOpenTime}
                                onChange={(e) => setNewQuiz({ ...newQuiz, scheduleOpenTime: e.target.value })}
                                className="bg-white/70 dark:bg-gray-700/70 text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                              Quiz Closes (No New Attempts)
                            </Label>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-600 dark:text-gray-400">Date</Label>
                              <Input
                                type="date"
                                value={newQuiz.scheduleCloseDate}
                                onChange={(e) => setNewQuiz({ ...newQuiz, scheduleCloseDate: e.target.value })}
                                className="bg-white/70 dark:bg-gray-700/70 text-sm"
                                min={newQuiz.scheduleOpenDate || new Date().toISOString().split("T")[0]}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-600 dark:text-gray-400">Time</Label>
                              <Input
                                type="time"
                                value={newQuiz.scheduleCloseTime}
                                onChange={(e) => setNewQuiz({ ...newQuiz, scheduleCloseTime: e.target.value })}
                                className="bg-white/70 dark:bg-gray-700/70 text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {newQuiz.scheduleOpenDate && newQuiz.scheduleOpenTime && (
                          <div className="p-4 bg-gradient-to-r from-cyan-100/50 to-blue-100/50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-300/50 dark:border-cyan-700/50">
                            <p className="text-xs font-semibold text-cyan-900 dark:text-cyan-100 mb-2 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Availability Summary:
                            </p>
                            <div className="space-y-1 text-xs text-cyan-800 dark:text-cyan-200">
                              <p>
                                <strong>Opens:</strong> {new Date(newQuiz.scheduleOpenDate).toLocaleDateString()} at{" "}
                                {newQuiz.scheduleOpenTime}
                              </p>
                              {newQuiz.scheduleCloseDate && newQuiz.scheduleCloseTime && (
                                <p>
                                  <strong>Closes:</strong> {new Date(newQuiz.scheduleCloseDate).toLocaleDateString()} at{" "}
                                  {newQuiz.scheduleCloseTime}
                                </p>
                              )}
                              <p className="pt-2 border-t border-cyan-300 dark:border-cyan-700 mt-2">
                                <strong>Time Limit:</strong> {newQuiz.timeLimitMinutes} minutes per attempt
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* </CHANGE> */}
                </div>
              </div>
            </div>

            {/* Quiz Settings Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gradient-to-r from-gray-200 to-transparent dark:from-gray-700 pb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Quiz Settings
              </h3>

              <div className="space-y-4">
                {/* Secured Quiz Toggle */}
                {recommendations.includes("securedQuiz") ? (
                  <div className="relative p-1 rounded-3xl bg-gradient-to-r from-amber-200 via-orange-200 to-red-200 dark:from-amber-800 dark:via-orange-800 dark:to-red-800 shadow-lg">
                    <div className="absolute -top-4 left-4 z-10">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg">
                        <Star className="w-3 h-3 mr-1" />
                        Recommended
                      </Badge>
                    </div>
                    <div
                      className={`p-6 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-red-50/30 dark:from-amber-900/20 dark:via-orange-900/10 dark:to-red-900/10 transition-all duration-300 transform hover:scale-[1.02] ${animatingToggles.has("securedQuiz") ? "animate-pulse" : ""}`}
                      onMouseEnter={() => setHoveredCard("securedQuiz")}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 transition-all duration-300 ${hoveredCard === "securedQuiz" ? "scale-110 rotate-3" : ""}`}
                          >
                            <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <Label className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              Secured Quiz
                              <QuestionTooltip content={tooltipExplanations.securedQuiz} />
                              {newQuiz.securedQuiz && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                            </Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Enable comprehensive security features
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={newQuiz.securedQuiz}
                            onCheckedChange={(checked) => handleToggleChange("securedQuiz", checked)}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-600 data-[state=checked]:to-pink-600 transition-all duration-300"
                          />
                          {newQuiz.securedQuiz && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSection("securedQuiz")}
                              className={`h-10 w-10 p-0 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 ${expandedSections.securedQuiz ? "bg-red-50 dark:bg-red-900/20" : ""}`}
                            >
                              {expandedSections.securedQuiz ? (
                                <ChevronDown className="w-5 h-5 text-red-600 transition-transform duration-200" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-red-600 transition-transform duration-200" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {newQuiz.securedQuiz && expandedSections.securedQuiz && (
                        <div className="mt-6 pt-6 border-t border-red-200 dark:border-red-800/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              {
                                key: "quizLockdown",
                                label: "Quiz Lockdown",
                                desc: "Browser-only access",
                                icon: Monitor,
                              },
                              {
                                key: "antiScreenshot",
                                label: "Anti-Screenshot",
                                desc: "Block screen recording",
                                icon: Eye,
                              },
                              {
                                key: "disableCopyPaste",
                                label: "Disable Copy/Paste",
                                desc: "Prevent text copying",
                                icon: MousePointer,
                              },
                              {
                                key: "disableRightClick",
                                label: "Right-Click Block",
                                desc: "Disable context menu",
                                icon: MousePointer,
                              },
                              {
                                key: "lockdownUI",
                                label: "Lockdown UI",
                                desc: "Full screen mode",
                                span: true,
                                icon: Monitor,
                              },
                            ].map((option, index) => (
                              <div
                                key={option.key}
                                className={`flex items-center justify-between p-4 bg-gradient-to-r from-red-50/50 to-pink-50/30 dark:from-red-900/20 dark:to-pink-900/10 rounded-xl border border-red-200/50 dark:border-red-800/30 hover:from-red-100/50 hover:to-pink-100/40 dark:hover:from-red-900/30 dark:hover:to-pink-900/20 transition-all duration-300 transform hover:scale-[1.02] ${option.span ? "md:col-span-2" : ""}`}
                                style={{ animationDelay: `${index * 100}ms` }}
                              >
                                <div className="flex items-center gap-3">
                                  <option.icon className="w-4 h-4 text-red-600 dark:text-red-400" />
                                  <div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                      {option.label}
                                      <QuestionTooltip
                                        content={tooltipExplanations[option.key as keyof typeof tooltipExplanations]}
                                      />
                                    </span>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{option.desc}</p>
                                  </div>
                                </div>
                                <Switch
                                  checked={newQuiz[option.key as keyof typeof newQuiz] as boolean}
                                  onCheckedChange={(checked) => handleToggleChange(option.key, checked)}
                                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-600 data-[state=checked]:to-pink-600"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${animatingToggles.has("securedQuiz") ? "animate-pulse" : ""}`}
                    onMouseEnter={() => setHoveredCard("securedQuiz")}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 transition-all duration-300 ${hoveredCard === "securedQuiz" ? "scale-110 rotate-3" : ""}`}
                        >
                          <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <Label className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            Secured Quiz
                            <QuestionTooltip content={tooltipExplanations.securedQuiz} />
                            {newQuiz.securedQuiz && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                          </Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Enable comprehensive security features
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={newQuiz.securedQuiz}
                          onCheckedChange={(checked) => handleToggleChange("securedQuiz", checked)}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-600 data-[state=checked]:to-pink-600 transition-all duration-300"
                        />
                        {newQuiz.securedQuiz && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSection("securedQuiz")}
                            className={`h-10 w-10 p-0 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 ${expandedSections.securedQuiz ? "bg-red-50 dark:bg-red-900/20" : ""}`}
                          >
                            {expandedSections.securedQuiz ? (
                              <ChevronDown className="w-5 h-5 text-red-600 transition-transform duration-200" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-red-600 transition-transform duration-200" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {newQuiz.securedQuiz && expandedSections.securedQuiz && (
                      <div className="mt-6 pt-6 border-t border-red-200 dark:border-red-800/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { key: "quizLockdown", label: "Quiz Lockdown", desc: "Browser-only access", icon: Monitor },
                            {
                              key: "antiScreenshot",
                              label: "Anti-Screenshot",
                              desc: "Block screen recording",
                              icon: Eye,
                            },
                            {
                              key: "disableCopyPaste",
                              label: "Disable Copy/Paste",
                              desc: "Prevent text copying",
                              icon: MousePointer,
                            },
                            {
                              key: "disableRightClick",
                              label: "Right-Click Block",
                              desc: "Disable context menu",
                              icon: MousePointer,
                            },
                            {
                              key: "lockdownUI",
                              label: "Lockdown UI",
                              desc: "Full screen mode",
                              span: true,
                              icon: Monitor,
                            },
                          ].map((option, index) => (
                            <div
                              key={option.key}
                              className={`flex items-center justify-between p-4 bg-gradient-to-r from-red-50/50 to-pink-50/30 dark:from-red-900/20 dark:to-pink-900/10 rounded-xl border border-red-200/50 dark:border-red-800/30 hover:from-red-100/50 hover:to-pink-100/40 dark:hover:from-red-900/30 dark:hover:to-pink-900/20 transition-all duration-300 transform hover:scale-[1.02] ${option.span ? "md:col-span-2" : ""}`}
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <div className="flex items-center gap-3">
                                <option.icon className="w-4 h-4 text-red-600 dark:text-red-400" />
                                <div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                    {option.label}
                                    <QuestionTooltip
                                      content={tooltipExplanations[option.key as keyof typeof tooltipExplanations]}
                                    />
                                  </span>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">{option.desc}</p>
                                </div>
                              </div>
                              <Switch
                                checked={newQuiz[option.key as keyof typeof newQuiz] as boolean}
                                onCheckedChange={(checked) => handleToggleChange(option.key, checked)}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-600 data-[state=checked]:to-pink-600"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Question Pool Toggle */}
                {recommendations.includes("questionPool") ? (
                  <div className="relative p-1 rounded-3xl bg-gradient-to-r from-blue-200 via-cyan-200 to-indigo-200 dark:from-blue-800 dark:via-cyan-800 dark:to-indigo-800 shadow-lg">
                    <div className="absolute -top-4 left-4 z-10">
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg">
                        <Star className="w-3 h-3 mr-1" />
                        Recommended
                      </Badge>
                    </div>
                    <div
                      className={`p-6 rounded-2xl bg-gradient-to-br from-blue-50 via-cyan-50/50 to-indigo-50/30 dark:from-blue-900/20 dark:via-cyan-900/10 dark:to-indigo-900/10 transition-all duration-300 transform hover:scale-[1.02] ${animatingToggles.has("questionPool") ? "animate-pulse" : ""}`}
                      onMouseEnter={() => setHoveredCard("questionPool")}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 transition-all duration-300 ${hoveredCard === "questionPool" ? "scale-110 rotate-3" : ""}`}
                          >
                            <Shuffle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <Label className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              Question Pool with Randomize Sampling
                              <QuestionTooltip content={tooltipExplanations.questionPool} />
                              {newQuiz.questionPool && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                            </Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Create more questions than needed
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={newQuiz.questionPool}
                            onCheckedChange={(checked) => handleToggleChange("questionPool", checked)}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-cyan-600 transition-all duration-300"
                          />
                          {newQuiz.questionPool && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSection("questionPool")}
                              className={`h-10 w-10 p-0 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 ${expandedSections.questionPool ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                            >
                              {expandedSections.questionPool ? (
                                <ChevronDown className="w-5 h-5 text-blue-600 transition-transform duration-200" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-blue-600 transition-transform duration-200" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {newQuiz.questionPool && expandedSections.questionPool && (
                        <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-800/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2 group">
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors group-focus-within:text-blue-600">
                                Questions to Show
                              </Label>
                              <Input
                                type="number"
                                value={newQuiz.totalQuestions}
                                onChange={(e) =>
                                  setNewQuiz({ ...newQuiz, totalQuestions: Number.parseInt(e.target.value) || 20 })
                                }
                                className="bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-all duration-200"
                              />
                            </div>
                            <div className="space-y-2 group">
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors group-focus-within:text-blue-600">
                                Total Pool Size
                              </Label>
                              <Input
                                type="number"
                                value={newQuiz.poolSize}
                                onChange={(e) =>
                                  setNewQuiz({ ...newQuiz, poolSize: Number.parseInt(e.target.value) || 20 })
                                }
                                className="bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-all duration-200"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-cyan-50/30 dark:from-blue-900/20 dark:to-cyan-900/10 rounded-xl border border-blue-200/50 dark:border-blue-800/30 hover:from-blue-100/50 hover:to-cyan-100/40 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/20 transition-all duration-300 transform hover:scale-[1.02]">
                            <div className="flex items-center gap-3">
                              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                  Stratified Sampling
                                  <QuestionTooltip content={tooltipExplanations.stratifiedSampling} />
                                </span>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Easy/Medium/Hard categories</p>
                              </div>
                            </div>
                            <Switch
                              checked={newQuiz.stratifiedSampling}
                              onCheckedChange={(checked) => handleToggleChange("stratifiedSampling", checked)}
                              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-cyan-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-700/50 hover:border-gray-300 dark:hover:border-gray-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${animatingToggles.has("questionPool") ? "animate-pulse" : ""}`}
                    onMouseEnter={() => setHoveredCard("questionPool")}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 transition-all duration-300 ${hoveredCard === "questionPool" ? "scale-110 rotate-3" : ""}`}
                        >
                          <Shuffle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <Label className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            Question Pool with Randomize Sampling
                            <QuestionTooltip content={tooltipExplanations.questionPool} />
                            {newQuiz.questionPool && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                          </Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Create more questions than needed</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={newQuiz.questionPool}
                          onCheckedChange={(checked) => handleToggleChange("questionPool", checked)}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-cyan-600 transition-all duration-300"
                        />
                        {newQuiz.questionPool && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSection("questionPool")}
                            className={`h-10 w-10 p-0 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 ${expandedSections.questionPool ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                          >
                            {expandedSections.questionPool ? (
                              <ChevronDown className="w-5 h-5 text-blue-600 transition-transform duration-200" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-blue-600 transition-transform duration-200" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Question Pool Sub-options */}
                    {newQuiz.questionPool && expandedSections.questionPool && (
                      <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-800/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2 group">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors group-focus-within:text-blue-600">
                              Questions to Show
                            </Label>
                            <Input
                              type="number"
                              value={newQuiz.totalQuestions}
                              onChange={(e) =>
                                setNewQuiz({ ...newQuiz, totalQuestions: Number.parseInt(e.target.value) || 20 })
                              }
                              className="bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-all duration-200"
                            />
                          </div>
                          <div className="space-y-2 group">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors group-focus-within:text-blue-600">
                              Total Pool Size
                            </Label>
                            <Input
                              type="number"
                              value={newQuiz.poolSize}
                              onChange={(e) =>
                                setNewQuiz({ ...newQuiz, poolSize: Number.parseInt(e.target.value) || 20 })
                              }
                              className="bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-all duration-200"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-cyan-50/30 dark:from-blue-900/20 dark:to-cyan-900/10 rounded-xl border border-blue-200/50 dark:border-blue-800/30 hover:from-blue-100/50 hover:to-cyan-100/40 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/20 transition-all duration-300 transform hover:scale-[1.02]">
                          <div className="flex items-center gap-3">
                            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                Stratified Sampling
                                <QuestionTooltip content={tooltipExplanations.stratifiedSampling} />
                              </span>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Easy/Medium/Hard categories</p>
                            </div>
                          </div>
                          <Switch
                            checked={newQuiz.stratifiedSampling}
                            onCheckedChange={(checked) => handleToggleChange("stratifiedSampling", checked)}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-cyan-600"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Other Settings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strict Time Limit */}
                  <div
                    className="p-5 bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-800 dark:to-orange-900/10 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                    onMouseEnter={() => setHoveredCard("strictTimeLimit")}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 transition-all duration-300 ${hoveredCard === "strictTimeLimit" ? "scale-110 rotate-3" : ""}`}
                        >
                          <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <Label className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            Strict per Question Time Limit
                            <QuestionTooltip content={tooltipExplanations.strictTimeLimit} />
                            {newQuiz.strictTimeLimit && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                          </Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Individual question timing</p>
                        </div>
                      </div>
                      <Switch
                        checked={newQuiz.strictTimeLimit}
                        onCheckedChange={(checked) => handleToggleChange("strictTimeLimit", checked)}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-600 data-[state=checked]:to-yellow-600"
                      />
                    </div>
                  </div>

                  {/* Auto-Save & Auto-Submit */}
                  {recommendations.includes("autoSave") ? (
                    <div className="relative p-1 rounded-3xl bg-gradient-to-r from-amber-200 via-green-200 to-emerald-200 dark:from-amber-800 dark:via-green-800 dark:to-emerald-800 shadow-lg">
                      <div className="absolute -top-4 left-4 z-10">
                        <Badge className="bg-gradient-to-r from-amber-500 to-green-500 hover:from-amber-600 hover:to-green-600 text-white shadow-lg text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Recommended
                        </Badge>
                      </div>
                      <div
                        className={`p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-green-50/30 dark:from-amber-900/20 dark:to-green-900/10 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg`}
                        onMouseEnter={() => setHoveredCard("autoSave")}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 transition-all duration-300 ${hoveredCard === "autoSave" ? "scale-110 rotate-3" : ""}`}
                            >
                              <Save className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                Auto-Save & Auto-Submit
                                <QuestionTooltip content={tooltipExplanations.autoSave} />
                                {newQuiz.autoSave && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                              </Label>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Automatic progress saving</p>
                            </div>
                          </div>
                          <Switch
                            checked={newQuiz.autoSave}
                            onCheckedChange={(checked) => handleToggleChange("autoSave", checked)}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-600 data-[state=checked]:to-emerald-600"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="p-5 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-900/10 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                      onMouseEnter={() => setHoveredCard("autoSave")}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 transition-all duration-300 ${hoveredCard === "autoSave" ? "scale-110 rotate-3" : ""}`}
                          >
                            <Save className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              Auto-Save & Auto-Submit
                              <QuestionTooltip content={tooltipExplanations.autoSave} />
                              {newQuiz.autoSave && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                            </Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Automatic progress saving</p>
                          </div>
                        </div>
                        <Switch
                          checked={newQuiz.autoSave}
                          onCheckedChange={(checked) => handleToggleChange("autoSave", checked)}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-600 data-[state=checked]:to-emerald-600"
                        />
                      </div>
                    </div>
                  )}

                  {/* Backtracking Control */}
                  <div
                    className="p-5 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/10 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                    onMouseEnter={() => setHoveredCard("backtrackingControl")}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 transition-all duration-300 ${hoveredCard === "backtrackingControl" ? "scale-110 rotate-3" : ""}`}
                        >
                          <RotateCcw className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <Label className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            Backtracking Control
                            <QuestionTooltip content={tooltipExplanations.backtrackingControl} />
                            {newQuiz.backtrackingControl && <div className="w-2 h-2 bg-purple-500 rounded-full" />}
                          </Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Prevent going back to previous questions
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={newQuiz.backtrackingControl}
                        onCheckedChange={(checked) => handleToggleChange("backtrackingControl", checked)}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-violet-600"
                      />
                    </div>
                  </div>

                  {/* Shuffle Questions */}
                  {recommendations.includes("shuffleQuestions") ? (
                    <div className="relative p-1 rounded-3xl bg-gradient-to-r from-amber-200 via-indigo-200 to-blue-200 dark:from-amber-800 dark:via-indigo-800 dark:to-blue-800 shadow-lg">
                      <div className="absolute -top-4 left-4 z-10">
                        <Badge className="bg-gradient-to-r from-amber-500 to-indigo-500 hover:from-amber-600 hover:to-indigo-600 text-white shadow-lg text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Recommended
                        </Badge>
                      </div>
                      <div
                        className={`p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-indigo-50/30 dark:from-amber-900/20 dark:to-indigo-900/10 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg`}
                        onMouseEnter={() => setHoveredCard("shuffleQuestions")}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 transition-all duration-300 ${hoveredCard === "shuffleQuestions" ? "scale-110 rotate-3" : ""}`}
                            >
                              <Shuffle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                Shuffle Questions
                                <QuestionTooltip content={tooltipExplanations.shuffleQuestions} />
                                {newQuiz.shuffleQuestions && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                              </Label>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Randomize question order</p>
                            </div>
                          </div>
                          <Switch
                            checked={newQuiz.shuffleQuestions}
                            onCheckedChange={(checked) => handleToggleChange("shuffleQuestions", checked)}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-indigo-600 data-[state=checked]:to-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="p-5 bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-800 dark:to-indigo-900/10 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                      onMouseEnter={() => setHoveredCard("shuffleQuestions")}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 transition-all duration-300 ${hoveredCard === "shuffleQuestions" ? "scale-110 rotate-3" : ""}`}
                          >
                            <Shuffle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              Shuffle Questions
                              <QuestionTooltip content={tooltipExplanations.shuffleQuestions} />
                              {newQuiz.shuffleQuestions && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                            </Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Randomize question order</p>
                          </div>
                        </div>
                        <Switch
                          checked={newQuiz.shuffleQuestions}
                          onCheckedChange={(checked) => handleToggleChange("shuffleQuestions", checked)}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-indigo-600 data-[state=checked]:to-blue-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-8 border-t border-gradient-to-r from-gray-200 to-transparent dark:from-gray-700">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="px-8 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateQuestions}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                disabled={
                  !newQuiz.title ||
                  newQuiz.subjects.length === 0 ||
                  newQuiz.grades.length === 0 ||
                  newQuiz.sections.length === 0
                }
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Questions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
