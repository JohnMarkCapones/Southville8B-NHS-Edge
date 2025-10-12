"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Lock } from "lucide-react"
import { QuizRenderer } from "./quiz-renderer"
import { QuizSubmissionDialog } from "./quiz-submission-dialog"
import type { Quiz, QuizResponse } from "@/types/quiz"

interface SequentialModeRendererProps {
  quiz: Quiz
  currentQuestionIndex: number
  responses: Record<string, QuizResponse>
  onResponseChange: (questionId: string, response: QuizResponse) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  timeRemaining: number
}

export function SequentialModeRenderer({
  quiz,
  currentQuestionIndex,
  responses,
  onResponseChange,
  onNext,
  onPrevious,
  onSubmit,
  timeRemaining,
}: SequentialModeRendererProps) {
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false)

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = quiz.questions.length > 0 ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0
  const answeredCount = quiz.questions.filter((q) => responses[q.id]).length

  const isCurrentQuestionAnswered = !!responses[currentQuestion.id]
  const allQuestionsAnswered = quiz.questions.every((q) => responses[q.id])

  // Check if user can proceed to next question
  const canProceedToNext = !quiz.validationSettings.requireAnswerToProgress || isCurrentQuestionAnswered

  // Check if user can submit quiz
  const canSubmitQuiz = !quiz.validationSettings.requireAllAnswersToSubmit || allQuestionsAnswered

  const handleSubmitClick = () => {
    setShowSubmissionDialog(true)
  }

  const handleConfirmedSubmit = () => {
    onSubmit()
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <div className="flex items-center gap-2">
              {isCurrentQuestionAnswered && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              <span className="text-sm text-muted-foreground">
                {answeredCount}/{quiz.questions.length} answered
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card
        className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm ${
          quiz.validationSettings.requireAnswerToProgress && !isCurrentQuestionAnswered
            ? "ring-2 ring-orange-200 dark:ring-orange-800"
            : ""
        }`}
      >
        <CardContent className="p-6">
          <div className="mb-4">
            {currentQuestion.category && (
              <Badge variant="secondary" className="mb-2">
                {currentQuestion.category}
              </Badge>
            )}
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-semibold">{currentQuestion.title}</h2>
              {quiz.validationSettings.requireAnswerToProgress && !isCurrentQuestionAnswered && (
                <Lock className="w-4 h-4 text-orange-500" />
              )}
            </div>
            {currentQuestion.description && <p className="text-muted-foreground">{currentQuestion.description}</p>}
          </div>

          <QuizRenderer
            question={currentQuestion}
            response={responses[currentQuestion.id]}
            onResponseChange={(response) => onResponseChange(currentQuestion.id, response)}
          />

          {quiz.validationSettings.requireAnswerToProgress && !isCurrentQuestionAnswered && (
            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Please answer this question to continue</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentQuestionIndex === 0}
          className="px-6 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <div className="flex flex-col items-end gap-2">
              {!canSubmitQuiz && (
                <span className="text-sm text-orange-600 dark:text-orange-400">Answer all questions to submit</span>
              )}
              <Button
                onClick={handleSubmitClick}
                disabled={!canSubmitQuiz}
                className={`px-8 ${
                  canSubmitQuiz
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit Quiz
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-2">
              {!canProceedToNext && (
                <span className="text-sm text-orange-600 dark:text-orange-400">Complete this question to continue</span>
              )}
              <Button
                onClick={onNext}
                disabled={!canProceedToNext}
                className={`px-6 ${
                  canProceedToNext
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <QuizSubmissionDialog
        open={showSubmissionDialog}
        onOpenChange={setShowSubmissionDialog}
        quiz={quiz}
        responses={responses}
        timeRemaining={timeRemaining}
        onConfirmSubmit={handleConfirmedSubmit}
      />
    </div>
  )
}
