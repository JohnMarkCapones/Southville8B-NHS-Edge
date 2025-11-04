"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle, Trophy, RotateCcw, BookOpen, Timer, Target, Layers } from "lucide-react"
import StudentLayout from "@/components/student/student-layout"
import { FormModeRenderer } from "@/components/quiz/form-mode-renderer"
import { SequentialModeRenderer } from "@/components/quiz/sequential-mode-renderer"
import { HybridModeRenderer } from "@/components/quiz/hybrid-mode-renderer"
import { getQuizById } from "@/lib/quizData"
import type { Quiz, QuizResponse } from "@/types/quiz"
import { TimeUpDialog } from "@/components/quiz/time-up-dialog"

export default function DynamicQuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, QuizResponse>>({})
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false)

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const quizData = await getQuizById(quizId)
        if (quizData) {
          setQuiz(quizData)
          setTimeRemaining((quizData.timeLimit || 30) * 60) // Convert minutes to seconds
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
    if (!quizStarted || quizCompleted || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setShowTimeUpDialog(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizStarted, quizCompleted, timeRemaining])

  useEffect(() => {
    if (!quizStarted || quizCompleted) return

    const autoSaveTimer = setInterval(() => {
      // Auto-save logic - in a real app, this would save to backend
      console.log("[v0] Auto-saving quiz responses:", responses)
      // You can implement actual auto-save to backend here
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSaveTimer)
  }, [quizStarted, quizCompleted, responses])

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
    setShowTimeUpDialog(false)
  }

  const handleTimeUpSubmission = () => {
    console.log("[v0] Auto-submitting quiz due to time expiry with responses:", responses)
    setQuizCompleted(true)
    setShowResults(true)
    setShowTimeUpDialog(false)
  }

  const calculateResults = () => {
    if (!quiz) return { score: 0, totalQuestions: 0, percentage: 0, correctAnswers: 0 }

    let correctAnswers = 0
    const totalQuestions = quiz.questions.length
    let totalScore = 0

    quiz.questions.forEach((question) => {
      const response = responses[question.id]
      if (!response) return

      // Calculate score based on question type
      switch (question.type) {
        case "multiple-choice":
        case "true-false":
          if (response.selectedOption === question.correctAnswer) {
            correctAnswers++
            totalScore += question.points || 1
          }
          break
        case "checkbox":
          if (question.correctAnswers && response.selectedOptions) {
            const correct = question.correctAnswers.sort().join(",")
            const selected = response.selectedOptions.sort().join(",")
            if (correct === selected) {
              correctAnswers++
              totalScore += question.points || 1
            }
          }
          break
        case "fill-in-blank":
          if (question.correctAnswer && response.textAnswer) {
            if (response.textAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
              correctAnswers++
              totalScore += question.points || 1
            }
          }
          break
        case "matching":
          if (question.correctMatches && response.matches) {
            let allCorrect = true
            for (const [key, value] of Object.entries(question.correctMatches)) {
              if (response.matches[key] !== value) {
                allCorrect = false
                break
              }
            }
            if (allCorrect) {
              correctAnswers++
              totalScore += question.points || 1
            }
          }
          break
        case "ordering":
          if (question.correctOrder && response.orderedItems) {
            const correct = question.correctOrder.join(",")
            const selected = response.orderedItems.join(",")
            if (correct === selected) {
              correctAnswers++
              totalScore += question.points || 1
            }
          }
          break
        default:
          // For subjective questions, assume full points for now
          if (response.textAnswer && response.textAnswer.trim()) {
            totalScore += question.points || 1
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

  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading quiz...</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  if (!quiz) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
          <Card className="max-w-lg mx-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20 shadow-2xl">
            <CardContent className="p-8 text-center">
              {/* School-themed illustration */}
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center border-4 border-amber-200 dark:border-amber-700/50">
                  <BookOpen className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                </div>
                {/* Floating question marks */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center border-2 border-red-200 dark:border-red-700/50">
                  <span className="text-red-500 dark:text-red-400 font-bold text-sm">?</span>
                </div>
                <div className="absolute -bottom-1 -left-3 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center border-2 border-blue-200 dark:border-blue-700/50">
                  <span className="text-blue-500 dark:text-blue-400 font-bold text-xs">?</span>
                </div>
              </div>

              {/* School-friendly heading */}
              <h2 className="text-2xl font-bold mb-3 text-slate-800 dark:text-slate-200">Oops! Quiz Not Found</h2>

              {/* Educational and friendly message */}
              <div className="space-y-3 mb-8">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  It looks like this quiz might have been moved to a different classroom or is no longer available.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-4">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Don't worry!</strong> You can return to your quiz dashboard to find other available
                    assignments and activities.
                  </p>
                </div>
              </div>

              {/* School-themed action buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/student/quiz")}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-3"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Return to Quiz Dashboard
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push("/student")}
                  className="w-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 py-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Student Portal
                </Button>
              </div>

              {/* Helpful tip */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  💡 <strong>Tip:</strong> If you think this quiz should be available, please contact your teacher or
                  check your assignment notifications.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </StudentLayout>
    )
  }

  const results = calculateResults()
  const progress = quiz.questions.length > 0 ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0
  const answeredCount = getAnsweredCount()

  // Quiz start screen
  if (!quizStarted) {
    // Group questions by category for Quiz 1
    const questionsByCategory =
      quiz.id === "quiz-1"
        ? quiz.questions.reduce(
            (acc, question) => {
              const category = question.category || "General"
              if (!acc[category]) acc[category] = []
              acc[category].push(question)
              return acc
            },
            {} as Record<string, typeof quiz.questions>,
          )
        : {}

    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
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
                  <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {quiz.title}
                    </CardTitle>
                    <p className="text-lg text-muted-foreground mt-2">{quiz.description}</p>
                    {quiz.deliveryMode && (
                      <Badge variant="secondary" className="mt-2">
                        {quiz.deliveryMode === "form" && "All Questions at Once"}
                        {quiz.deliveryMode === "sequential" && "One Question at a Time"}
                        {quiz.deliveryMode === "hybrid" && "Mixed Format"}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                    <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{quiz.questions.length}</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Questions</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/50">
                    <Timer className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">{quiz.timeLimit || 30}</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Minutes</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                    <Layers className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {quiz.deliveryMode || "Sequential"}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Format</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200/50 dark:border-orange-700/50">
                    <Target className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">All Types</div>
                    <div className="text-sm text-orange-600 dark:text-orange-400">Question Formats</div>
                  </div>
                </div>

                {/* Academic integrity and monitoring notice */}
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
                          <strong>Flags are indicators, not proof:</strong> Automated flags help identify potential
                          issues but are not conclusive evidence of cheating
                        </li>
                        <li>
                          <strong>You can explain flagged behavior:</strong> If your activity is flagged, you'll have
                          the opportunity to provide an explanation
                        </li>
                        <li>
                          <strong>Don't over-rely on automated flags:</strong> Teachers review all flagged activities
                          with context and understanding
                        </li>
                        <li>
                          <strong>Your privacy is respected:</strong> Monitoring data is used solely for educational
                          purposes and handled confidentially
                        </li>
                        <li>
                          <strong>We comply with regulations:</strong> All monitoring practices follow educational
                          privacy laws and school policies
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
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>Instructions:</strong> This quiz contains various question types including text responses,
                    multiple choice, interactive elements, and assessment grids.
                    {quiz.deliveryMode === "form" && " All questions will be displayed at once for you to complete."}
                    {quiz.deliveryMode === "sequential" && " Questions will be presented one at a time."}
                    {quiz.deliveryMode === "hybrid" &&
                      " Initial questions will be shown together, followed by individual questions."}
                  </AlertDescription>
                </Alert>

                <div className="text-center pt-6">
                  <Button
                    onClick={handleStartQuiz}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-12 py-4 text-lg font-semibold"
                  >
                    <Target className="w-5 h-5 mr-3" />
                    Start Quiz
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
                  <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                </div>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  Quiz Completed!
                </CardTitle>
                <p className="text-xl text-muted-foreground">{quiz.title}</p>
              </CardHeader>

              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/50">
                    <div className="text-3xl font-bold text-green-700 dark:text-green-300 mb-2">
                      {results.percentage}%
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">Final Score</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                      {results.correctAnswers}/{results.totalQuestions}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Correct Answers</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                    <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-2">{results.score}</div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Points Earned</div>
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
                      setCurrentQuestionIndex(0)
                      setResponses({})
                      setTimeRemaining(quiz.timeLimit * 60)
                    }}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-8 py-3"
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

  // Quiz taking screen - now with dynamic delivery modes
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
                <h1 className="text-2xl font-bold">{quiz.title}</h1>
                {quiz.deliveryMode && (
                  <Badge variant="secondary" className="mt-1">
                    {quiz.deliveryMode.charAt(0).toUpperCase() + quiz.deliveryMode.slice(1)} Mode
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    timeRemaining <= 300
                      ? "text-red-600 dark:text-red-400 animate-pulse"
                      : timeRemaining <= 600
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-xs text-muted-foreground">Time Left</div>
              </div>
            </div>
          </div>

          {quiz.deliveryMode === "form" && (
            <FormModeRenderer
              quiz={quiz}
              responses={responses}
              onResponseChange={handleResponseChange}
              onSubmit={handleSubmitQuiz}
              timeRemaining={timeRemaining}
            />
          )}

          {quiz.deliveryMode === "sequential" && (
            <SequentialModeRenderer
              quiz={quiz}
              currentQuestionIndex={currentQuestionIndex}
              responses={responses}
              onResponseChange={handleResponseChange}
              onNext={handleNextQuestion}
              onPrevious={handlePreviousQuestion}
              onSubmit={handleSubmitQuiz}
              timeRemaining={timeRemaining}
            />
          )}

          {quiz.deliveryMode === "hybrid" && (
            <HybridModeRenderer
              quiz={quiz}
              responses={responses}
              onResponseChange={handleResponseChange}
              onSubmit={handleSubmitQuiz}
              timeRemaining={timeRemaining}
            />
          )}

          {/* Fallback to sequential mode if no delivery mode specified */}
          {(!quiz.deliveryMode || quiz.deliveryMode === "sequential") && quiz && (
            <SequentialModeRenderer
              quiz={quiz}
              currentQuestionIndex={currentQuestionIndex}
              responses={responses}
              onResponseChange={handleResponseChange}
              onNext={handleNextQuestion}
              onPrevious={handlePreviousQuestion}
              onSubmit={handleSubmitQuiz}
              timeRemaining={timeRemaining}
            />
          )}
        </div>

        {quiz && (
          <TimeUpDialog
            isOpen={showTimeUpDialog}
            quiz={quiz}
            responses={responses}
            onConfirm={handleTimeUpSubmission}
          />
        )}
      </div>
    </StudentLayout>
  )
}
