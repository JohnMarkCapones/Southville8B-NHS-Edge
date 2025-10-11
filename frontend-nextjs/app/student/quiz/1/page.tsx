"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  CheckCircle2,
  Trophy,
  RotateCcw,
  BookOpen,
  Timer,
  FileText,
  AlertCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import StudentLayout from "@/components/student/student-layout"
import { QuizRenderer } from "@/components/quiz/quiz-renderer"
import { getQuizById } from "@/lib/quizData"
import type { Quiz, QuizResponse } from "@/types/quiz"

export default function Quiz1Page() {
  const router = useRouter()
  const quizId = "comprehensive-demo" // Using existing quiz data

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<Record<string, QuizResponse>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const [isKicked, setIsKicked] = useState(false)
  const [kickedCountdown, setKickedCountdown] = useState(15)

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const quizData = await getQuizById(quizId)
        if (quizData) {
          setQuiz(quizData)
          setTimeRemaining(quizData.timeLimit * 60)
        }
        setLoading(false)
      } catch (error) {
        console.error("Failed to load quiz:", error)
        setLoading(false)
      }
    }

    loadQuiz()
  }, [quizId])

  useEffect(() => {
    if (!quizStarted || quizCompleted) return

    console.log("[v0] Quiz started, will kick student in 5 seconds for demo")

    const kickTimer = setTimeout(() => {
      console.log("[v0] Kicking student now!")
      setIsKicked(true)
    }, 5000) // Kick after 5 seconds for demo (reduced from 10)

    return () => clearTimeout(kickTimer)
  }, [quizStarted, quizCompleted])

  useEffect(() => {
    if (!isKicked) return

    console.log("[v0] Student is kicked, countdown:", kickedCountdown)

    if (kickedCountdown <= 0) {
      console.log("[v0] Redirecting to quiz list")
      router.push("/student/quiz")
      return
    }

    const timer = setInterval(() => {
      setKickedCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isKicked, kickedCountdown, router])

  // Timer effect
  useEffect(() => {
    if (!quizStarted || quizCompleted || timeRemaining <= 0 || isKicked) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setQuizCompleted(true)
          setShowResults(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizStarted, quizCompleted, timeRemaining, isKicked])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleResponseChange = (questionId: string, response: QuizResponse) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: response,
    }))
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
  }

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitQuiz = () => {
    setQuizCompleted(true)
    setShowResults(true)
  }

  const calculateResults = () => {
    if (!quiz) return { score: 0, totalQuestions: 0, percentage: 0, correctAnswers: 0 }

    let correctAnswers = 0
    const totalQuestions = quiz.questions.length
    let totalScore = 0

    quiz.questions.forEach((question) => {
      const response = responses[question.id]
      if (!response) return

      switch (question.type) {
        case "multiple-choice":
        case "true-false":
          if (response.answer === question.correctAnswer) {
            correctAnswers++
            totalScore += 1
          }
          break
        case "checkbox":
          if (question.correctAnswers && Array.isArray(response.answer)) {
            const correct = question.correctAnswers.sort().join(",")
            const selected = response.answer.sort().join(",")
            if (correct === selected) {
              correctAnswers++
              totalScore += 1
            }
          }
          break
        default:
          if (response.answer && response.answer.toString().trim()) {
            totalScore += 1
          }
          break
      }
    })

    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

    return {
      score: totalScore,
      totalQuestions,
      percentage,
      correctAnswers,
    }
  }

  const getAnsweredCount = () => {
    if (!quiz) return 0
    return quiz.questions.filter((q) => responses[q.id]).length
  }

  if (isKicked) {
    console.log("[v0] Rendering kicked modal")
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-white dark:bg-slate-900 border-4 border-red-500 shadow-2xl animate-in fade-in zoom-in duration-300">
          <CardContent className="p-12 text-center space-y-8">
            {/* Warning Icon with Animation */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                <div className="relative p-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full">
                  <XCircle className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>

            {/* Main Message */}
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-red-600 dark:text-red-400">Quiz Access Removed</h2>
              <p className="text-xl text-muted-foreground">You have been removed from this quiz by your teacher</p>
            </div>

            {/* Reason (if provided) */}
            <Alert className="bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-900 dark:text-red-100">
                <strong>Reason:</strong> Your teacher has ended your quiz session. Please contact your teacher for more
                information.
              </AlertDescription>
            </Alert>

            {/* Countdown Timer */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Timer className="w-8 h-8 text-muted-foreground" />
                <div>
                  <div className="text-6xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                    {kickedCountdown}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Redirecting to quiz list in {kickedCountdown} {kickedCountdown === 1 ? "second" : "seconds"}...
                  </p>
                </div>
              </div>

              {/* Progress bar for countdown */}
              <div className="w-full max-w-md mx-auto">
                <Progress value={(kickedCountdown / 15) * 100} className="h-2 bg-red-100 dark:bg-red-950" />
              </div>
            </div>

            {/* Additional Info */}
            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                If you believe this was a mistake, please speak with your teacher.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading Math Quiz...</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  if (!quiz) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
          <Card className="max-w-lg mx-auto">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Quiz Not Found</h2>
              <p className="text-muted-foreground mb-6">The requested quiz could not be loaded.</p>
              <Button onClick={() => router.push("/student/quiz")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quiz List
              </Button>
            </CardContent>
          </Card>
        </div>
      </StudentLayout>
    )
  }

  const results = calculateResults()
  const answeredCount = getAnsweredCount()
  const progress = quiz.questions.length > 0 ? (answeredCount / quiz.questions.length) * 100 : 0
  const currentQuestion = quiz.questions[currentQuestionIndex]

  // Quiz start screen
  if (!quizStarted) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push("/student/quiz")}
              className="mb-6 hover:bg-white/50 dark:hover:bg-slate-800/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quiz List
            </Button>

            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Math Quiz - One Question at a Time
                    </CardTitle>
                    <p className="text-lg text-muted-foreground mt-2">
                      Navigate through questions one by one with Previous/Next buttons
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                    <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{quiz.questions.length}</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Questions</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                    <Timer className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{quiz.timeLimit}</div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Minutes</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/50">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">Step</div>
                    <div className="text-sm text-green-600 dark:text-green-400">by Step</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200/50 dark:border-orange-700/50">
                    <BookOpen className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">Mixed</div>
                    <div className="text-sm text-orange-600 dark:text-orange-400">Question Types</div>
                  </div>
                </div>

                <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 border-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-amber-900 dark:text-amber-100">
                    <div className="space-y-3">
                      <p className="font-bold text-base">⚠️ Important: Academic Integrity & Monitoring Notice</p>
                      <ul className="space-y-2 text-sm ml-4 list-disc">
                        <li>
                          <strong>You are being monitored:</strong> Your quiz activity may be tracked for academic
                          integrity purposes
                        </li>
                        <li>
                          <strong>Teacher can remove you:</strong> Your teacher has the ability to end your quiz session
                          at any time if suspicious activity is detected
                        </li>
                        <li>
                          <strong>Flags are indicators, not proof:</strong> Automated flags help identify potential
                          issues but are not conclusive evidence of cheating
                        </li>
                        <li>
                          <strong>You can explain flagged behavior:</strong> If your activity is flagged, you'll have
                          the opportunity to provide an explanation
                        </li>
                      </ul>
                      <p className="text-sm italic mt-3">
                        By starting this quiz, you acknowledge that you understand these monitoring practices and agree
                        to maintain academic integrity.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>

                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>One Question at a Time:</strong> Questions are displayed one at a time. Use the Previous and
                    Next buttons to navigate between questions. You can change your answers at any time before
                    submitting.
                  </AlertDescription>
                </Alert>

                <div className="text-center pt-6">
                  <Button
                    onClick={handleStartQuiz}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-12 py-4 text-lg font-semibold"
                  >
                    <FileText className="w-5 h-5 mr-3" />
                    Start Math Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </StudentLayout>
    )
  }

  // Results screen
  if (showResults) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                </div>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Math Quiz Completed!
                </CardTitle>
                <p className="text-xl text-muted-foreground">One Question at a Time Format</p>
              </CardHeader>

              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                      {results.percentage}%
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Final Score</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                    <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                      {results.correctAnswers}/{results.totalQuestions}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Correct Answers</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/50">
                    <div className="text-3xl font-bold text-green-700 dark:text-green-300 mb-2">{results.score}</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Points Earned</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200/50 dark:border-orange-700/50">
                    <div className="text-3xl font-bold text-orange-700 dark:text-orange-300 mb-2">
                      {formatTime(quiz.timeLimit * 60 - timeRemaining)}
                    </div>
                    <div className="text-sm text-orange-600 dark:text-orange-400">Time Taken</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <Button
                    onClick={() => router.push("/student/quiz")}
                    variant="outline"
                    size="lg"
                    className="px-8 py-3"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Quiz List
                  </Button>
                  <Button
                    onClick={() => {
                      setQuizStarted(false)
                      setQuizCompleted(false)
                      setShowResults(false)
                      setResponses({})
                      setCurrentQuestionIndex(0)
                      setTimeRemaining(quiz.timeLimit * 60)
                      setIsKicked(false)
                      setKickedCountdown(15)
                    }}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-8 py-3"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Retake Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </StudentLayout>
    )
  }

  // Quiz taking screen - One question at a time
  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/student/quiz")}
                className="hover:bg-white/50 dark:hover:bg-slate-800/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Quiz
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Math Quiz</h1>
                <Badge variant="secondary" className="mt-1">
                  <FileText className="w-3 h-3 mr-1" />
                  One at a Time
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatTime(timeRemaining)}</div>
                <div className="text-xs text-muted-foreground">Time Left</div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <Card className="mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {answeredCount}/{quiz.questions.length} answered
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Current Question */}
          <Card className="mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full text-lg font-medium">
                  {currentQuestionIndex + 1}
                </span>
                <span>Question {currentQuestionIndex + 1}</span>
                {responses[currentQuestion.id] && <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuizRenderer
                question={currentQuestion}
                response={responses[currentQuestion.id]}
                onResponseChange={(response) => handleResponseChange(currentQuestion.id, response)}
              />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} size="lg">
                Next
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
