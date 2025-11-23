"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, BookOpen, Timer, Eye, Lock, AlertCircle } from "lucide-react"
import { FormModeRenderer } from "@/components/quiz/form-mode-renderer"
import { SequentialModeRenderer } from "@/components/quiz/sequential-mode-renderer"
import { HybridModeRenderer } from "@/components/quiz/hybrid-mode-renderer"
import { teacherQuizApi } from "@/lib/api/endpoints/quiz"
import type { Quiz, QuizResponse } from "@/types/quiz"
import { mapBackendTypeToUI } from "@/lib/utils/quiz-type-mapper"

export default function QuizPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, QuizResponse>>({})
  const [previewStarted, setPreviewStarted] = useState(false)

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        console.log(`[QuizPreview] Loading quiz with ID: ${quizId}`)
        const quizData = await teacherQuizApi.getQuizById(quizId)
        console.log(`[QuizPreview] Quiz data loaded:`, quizData)

        if (quizData) {
          // Transform backend quiz format to match component expectations
          const transformedQuiz: Quiz = {
            id: quizData.quiz_id,
            title: quizData.title,
            description: quizData.description || "",
            timeLimit: quizData.time_limit || 30,
            deliveryMode: quizData.type === 'mixed' ? 'hybrid' : (quizData.type || 'sequential'),
            validationSettings: {
              requireAnswerToProgress: false,
              requireAllAnswersToSubmit: false,
              allowQuestionSkipping: true
            },
            createdAt: new Date(quizData.created_at || Date.now()),
            updatedAt: new Date(quizData.updated_at || Date.now()),
            questions: quizData.questions?.map((q: any) => {
              // Transform question format - map backend type to UI type
              const uiType = mapBackendTypeToUI(q.question_type as any) || 'multiple-choice'
              return {
                id: q.question_id,
                type: uiType,
                title: q.question_text || q.title || "",
                text: q.question_text || q.title || "",
                description: q.description || "",
                required: q.is_required !== false,
                options: q.options || [],
                correctAnswer: q.correct_answer,
                points: q.points || 1,
                ...q
              }
            }) || [],
          }

          setQuiz(transformedQuiz)
        }
      } catch (error) {
        console.error('[QuizPreview] Error loading quiz:', error)
      } finally {
        setLoading(false)
      }
    }

    if (quizId) {
      loadQuiz()
    }
  }, [quizId])

  const handleResponseChange = (questionId: string, response: QuizResponse) => {
    // In preview mode, we can update responses but they won't be saved
    setResponses((prev) => ({
      ...prev,
      [questionId]: response,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading quiz preview...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-lg mx-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/20 shadow-2xl">
          <CardContent className="pt-12 pb-10 px-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Quiz Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The quiz you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => router.push("/teacher/quiz")} variant="default">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quiz List
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Preview start screen
  if (!previewStarted) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push("/teacher/quiz")}
              className="mb-6 hover:bg-white/50 dark:hover:bg-slate-800/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quiz List
            </Button>

            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl">
                    <Eye className="w-8 h-8 text-white" />
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

              <CardContent className="space-y-6">
                {/* Preview Mode Alert */}
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>Preview Mode:</strong> This is how students will see the quiz. You can interact with questions but answers won't be saved.
                  </AlertDescription>
                </Alert>

                {/* Quiz Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Questions</p>
                      <p className="text-lg font-semibold">{quiz.questions?.length || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Timer className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time Limit</p>
                      <p className="text-lg font-semibold">{quiz.timeLimit ? `${quiz.timeLimit} min` : "No limit"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Lock className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Mode</p>
                      <p className="text-lg font-semibold capitalize">{quiz.deliveryMode || "Sequential"}</p>
                    </div>
                  </div>
                </div>

                {/* Start Preview Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() => setPreviewStarted(true)}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Start Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    )
  }

  // Quiz preview (student view)
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/teacher/quiz")}
                className="hover:bg-white/50 dark:hover:bg-slate-800/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{quiz.title}</h1>
                <Badge variant="outline" className="mt-1">
                  <Eye className="w-3 h-3 mr-1" />
                  Preview Mode
                </Badge>
              </div>
            </div>
          </div>

          {/* Preview Mode Alert */}
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 mb-6">
            <Eye className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              You're viewing this quiz as students will see it. This is a preview - no data will be saved.
            </AlertDescription>
          </Alert>

          {/* Quiz Renderer based on delivery mode */}
          {quiz.deliveryMode === "form" && (
            <FormModeRenderer
              quiz={quiz}
              responses={responses}
              onResponseChange={handleResponseChange}
              onSubmit={() => {
                alert("Preview mode - submission disabled")
              }}
              timeRemaining={0}
            />
          )}

          {quiz.deliveryMode === "sequential" && (
            <SequentialModeRenderer
              quiz={quiz}
              currentQuestionIndex={currentQuestionIndex}
              responses={responses}
              onResponseChange={handleResponseChange}
              onNext={() => {
                if (currentQuestionIndex < (quiz.questions?.length || 0) - 1) {
                  setCurrentQuestionIndex((prev) => prev + 1)
                }
              }}
              onPrevious={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex((prev) => prev - 1)
                }
              }}
              onSubmit={() => {
                alert("Preview mode - submission disabled")
              }}
              timeRemaining={0}
            />
          )}

          {quiz.deliveryMode === "hybrid" && (
            <HybridModeRenderer
              quiz={quiz}
              responses={responses}
              onResponseChange={handleResponseChange}
              onSubmit={() => {
                alert("Preview mode - submission disabled")
              }}
              timeRemaining={0}
            />
          )}
        </div>
      </div>
  )
}

