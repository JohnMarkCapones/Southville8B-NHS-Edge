"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Trophy,
  RotateCcw,
  Timer,
  ScrollText,
  FileText,
  Lock,
} from "lucide-react"
import StudentLayout from "@/components/student/student-layout"
import { QuizRenderer } from "@/components/quiz/quiz-renderer"
import { getQuizById } from "@/lib/quizData"
import type { Quiz, QuizResponse } from "@/types/quiz"

export default function Quiz3Page() {
  const router = useRouter()
  const quizId = "comprehensive-demo" // Using existing quiz data

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<Record<string, QuizResponse>>({})
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isHybridMode, setIsHybridMode] = useState(false) // Switch to paginated after first 3 questions

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

  // Timer effect
  useEffect(() => {
    if (!quizStarted || quizCompleted || timeRemaining <= 0) return

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
  }, [quizStarted, quizCompleted, timeRemaining])

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
    if (!quiz) return

    // Check if we're switching to hybrid mode (after first 3 questions)
    if (currentQuestionIndex === 2 && !isHybridMode) {
      setIsHybridMode(true)
    }

    if (currentQuestionIndex < quiz.questions.length - 1) {
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

  const canProceedToNext = () => {
    if (!quiz || !isHybridMode) return true // No validation in scroll mode

    const currentQuestion = quiz.questions[currentQuestionIndex]
    const response = responses[currentQuestion.id]

    // Validation: must answer current question to proceed
    if (!response || !response.answer) return false

    // Additional validation based on question type
    switch (currentQuestion.type) {
      case "short-answer":
      case "paragraph":
        return response.answer && response.answer.toString().trim().length > 0
      case "multiple-choice":
      case "dropdown":
      case "true-false":
        return response.answer !== undefined && response.answer !== null
      case "checkbox":
        return Array.isArray(response.answer) && response.answer.length > 0
      default:
        return response.answer !== undefined && response.answer !== null
    }
  }

  const calculateResults = () => {
    if (!quiz) return { score: 0, totalQuestions: 0, percentage: 0, correctAnswers: 0 }

    let correctAnswers = 0
    const totalQuestions = quiz.questions.length
    let totalScore = 0

    quiz.questions.forEach((question) => {
      const response = responses[question.id]
      if (!response) return

      // Simple scoring logic for demonstration
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
          // For subjective questions, assume full points if answered
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

  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading Quiz 3...</p>
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
  const progress = quiz.questions.length > 0 ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0

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
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Quiz 3 - Hybrid Format
                    </CardTitle>
                    <p className="text-lg text-muted-foreground mt-2">
                      Starts with scroll format, then switches to paginated with validation
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                    <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {quiz.questions.length}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Questions</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                    <Timer className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{quiz.timeLimit}</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Minutes</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/50">
                    <ScrollText className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">Hybrid</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Format</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200/50 dark:border-orange-700/50">
                    <Lock className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">Validated</div>
                    <div className="text-sm text-orange-600 dark:text-orange-400">Progression</div>
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

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-center mb-6">Quiz Format Explanation</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <ScrollText className="w-6 h-6 text-green-600 dark:text-green-400" />
                          <h4 className="font-semibold text-green-700 dark:text-green-300">Phase 1: Scroll Format</h4>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          First 3 questions displayed together in a scrollable format. You can answer them in any order
                          and navigate freely.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                            Phase 2: Paginated with Validation
                          </h4>
                        </div>
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                          Remaining questions shown one at a time. You must answer each question before proceeding to
                          the next.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Alert className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                  <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <AlertDescription className="text-purple-800 dark:text-purple-200">
                    <strong>Hybrid Format:</strong> This quiz combines the flexibility of continuous scrolling for
                    initial questions with the focused approach of paginated questions with validation. This ensures
                    thorough completion while maintaining user engagement.
                  </AlertDescription>
                </Alert>

                <div className="text-center pt-6">
                  <Button
                    onClick={handleStartQuiz}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-12 py-4 text-lg font-semibold"
                  >
                    <FileText className="w-5 h-5 mr-3" />
                    Start Hybrid Quiz
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
                  <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                </div>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Quiz 3 Completed!
                </CardTitle>
                <p className="text-xl text-muted-foreground">Hybrid Format with Validation</p>
              </CardHeader>

              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                    <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                      {results.percentage}%
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Final Score</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                      {results.correctAnswers}/{results.totalQuestions}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Correct Answers</div>
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
                      setCurrentQuestionIndex(0)
                      setIsHybridMode(false)
                      setResponses({})
                      setTimeRemaining(quiz.timeLimit * 60)
                    }}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-8 py-3"
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

  // Quiz taking screen - Hybrid format
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
                <h1 className="text-2xl font-bold">Quiz 3 - Hybrid Format</h1>
                <Badge variant="secondary" className="mt-1">
                  {isHybridMode ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Paginated Mode
                    </>
                  ) : (
                    <>
                      <ScrollText className="w-3 h-3 mr-1" />
                      Scroll Mode
                    </>
                  )}
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
                  {isHybridMode
                    ? `Question ${currentQuestionIndex + 1} of ${quiz.questions.length}`
                    : "Phase 1: Scroll Mode"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {answeredCount}/{quiz.questions.length} answered
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Mode transition alert */}
          {currentQuestionIndex === 2 && !isHybridMode && (
            <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <strong>Switching to Paginated Mode:</strong> After this section, questions will be shown one at a time
                with validation required before proceeding.
              </AlertDescription>
            </Alert>
          )}

          {/* Quiz Content */}
          {!isHybridMode ? (
            // Scroll mode for first 3 questions
            <div className="space-y-8">
              {quiz.questions.slice(0, 3).map((question, index) => (
                <Card key={question.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-lg">Question {index + 1}</span>
                      {responses[question.id] && <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuizRenderer
                      question={question}
                      response={responses[question.id]}
                      onResponseChange={(response) => handleResponseChange(question.id, response)}
                    />
                  </CardContent>
                </Card>
              ))}

              {/* Continue to paginated mode */}
              <div className="text-center">
                <Separator className="mb-6" />
                <Button
                  onClick={() => setIsHybridMode(true)}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-8 py-3"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Continue to Paginated Questions
                </Button>
              </div>
            </div>
          ) : (
            // Paginated mode with validation
            <>
              <Card className="mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                      {currentQuestionIndex + 1}
                    </span>
                    <span className="text-lg">Question {currentQuestionIndex + 1}</span>
                    {responses[quiz.questions[currentQuestionIndex].id] && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QuizRenderer
                    question={quiz.questions[currentQuestionIndex]}
                    response={responses[quiz.questions[currentQuestionIndex].id]}
                    onResponseChange={(response) =>
                      handleResponseChange(quiz.questions[currentQuestionIndex].id, response)
                    }
                  />
                </CardContent>
              </Card>

              {/* Validation message */}
              {!canProceedToNext() && (
                <Alert className="mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    <strong>Answer Required:</strong> Please provide an answer to this question before proceeding to the
                    next one.
                  </AlertDescription>
                </Alert>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={!canProceedToNext()}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      disabled={!canProceedToNext()}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-6"
                    >
                      Next
                      {canProceedToNext() ? <ArrowRight className="w-4 h-4 ml-2" /> : <Lock className="w-4 h-4 ml-2" />}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </StudentLayout>
  )
}
