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
  CheckCircle2,
  Trophy,
  RotateCcw,
  BookOpen,
  Timer,
  ScrollText,
  FileText,
  AlertCircle,
} from "lucide-react"
import StudentLayout from "@/components/student/student-layout"
import { QuizRenderer } from "@/components/quiz/quiz-renderer"
import { getQuizById } from "@/lib/quizData"
import type { Quiz, QuizResponse } from "@/types/quiz"

export default function Quiz2Page() {
  const router = useRouter()
  const quizId = "comprehensive-demo" // Using existing quiz data

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<Record<string, QuizResponse>>({})
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showResults, setShowResults] = useState(false)

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
            <p className="text-lg text-muted-foreground">Loading Quiz 2...</p>
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
                  <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl">
                    <ScrollText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Quiz 2 - Continuous Scroll Format
                    </CardTitle>
                    <p className="text-lg text-muted-foreground mt-2">
                      All questions displayed in a single scrollable form, similar to Google Forms
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/50">
                    <FileText className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">{quiz.questions.length}</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Questions</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                    <Timer className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{quiz.timeLimit}</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Minutes</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                    <ScrollText className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">Scroll</div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Format</div>
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

                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <ScrollText className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <strong>Continuous Scroll Format:</strong> All questions are displayed on a single page. You can
                    scroll through all questions, answer them in any order, and submit when ready. This format is
                    similar to Google Forms and allows for easy navigation between questions.
                  </AlertDescription>
                </Alert>

                <div className="text-center pt-6">
                  <Button
                    onClick={handleStartQuiz}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-12 py-4 text-lg font-semibold"
                  >
                    <ScrollText className="w-5 h-5 mr-3" />
                    Start Continuous Quiz
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
                  Quiz 2 Completed!
                </CardTitle>
                <p className="text-xl text-muted-foreground">Continuous Scroll Format</p>
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
                      setResponses({})
                      setTimeRemaining(quiz.timeLimit * 60)
                    }}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8 py-3"
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

  // Quiz taking screen - Continuous scroll format
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
                <h1 className="text-2xl font-bold">Quiz 2 - Continuous Scroll</h1>
                <Badge variant="secondary" className="mt-1">
                  <ScrollText className="w-3 h-3 mr-1" />
                  Google Forms Style
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
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {answeredCount}/{quiz.questions.length} answered
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {/* All Questions in Continuous Scroll */}
          <div className="space-y-8">
            {quiz.questions.map((question, index) => (
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
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <Separator className="mb-6" />
            <Button
              onClick={handleSubmitQuiz}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-12 py-4 text-lg font-semibold"
            >
              <CheckCircle2 className="w-5 h-5 mr-3" />
              Submit Quiz
            </Button>
            <p className="text-sm text-muted-foreground mt-2">You can submit even if not all questions are answered</p>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
