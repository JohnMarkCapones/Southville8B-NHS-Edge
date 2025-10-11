"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { QuizRenderer } from "./quiz-renderer"
import { QuizSubmissionDialog } from "./quiz-submission-dialog"
import type { Quiz, QuizResponse } from "@/types/quiz"

interface FormModeRendererProps {
  quiz: Quiz
  responses: Record<string, QuizResponse>
  onResponseChange: (questionId: string, response: QuizResponse) => void
  onSubmit: () => void
  timeRemaining: number
}

export function FormModeRenderer({
  quiz,
  responses,
  onResponseChange,
  onSubmit,
  timeRemaining,
}: FormModeRendererProps) {
  const [showValidation, setShowValidation] = useState(false)
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false)

  const getAnsweredCount = () => {
    return quiz.questions.filter((q) => responses[q.id]).length
  }

  const allQuestionsAnswered = quiz.questions.every((q) => responses[q.id])
  const canSubmitQuiz = !quiz.validationSettings.requireAllAnswersToSubmit || allQuestionsAnswered

  const handleSubmit = () => {
    if (quiz.validationSettings.requireAllAnswersToSubmit) {
      const unansweredQuestions = quiz.questions.filter((q) => !responses[q.id])

      if (unansweredQuestions.length > 0) {
        setShowValidation(true)
        const firstUnanswered = unansweredQuestions[0]
        const element = document.getElementById(`question-${firstUnanswered.id}`)
        element?.scrollIntoView({ behavior: "smooth", block: "center" })
        return
      }
    } else {
      const unansweredRequired = quiz.questions.filter((q) => q.required && !responses[q.id])

      if (unansweredRequired.length > 0) {
        setShowValidation(true)
        const firstUnanswered = unansweredRequired[0]
        const element = document.getElementById(`question-${firstUnanswered.id}`)
        element?.scrollIntoView({ behavior: "smooth", block: "center" })
        return
      }
    }

    setShowSubmissionDialog(true)
  }

  const handleConfirmedSubmit = () => {
    onSubmit()
  }

  const answeredCount = getAnsweredCount()
  const progress = quiz.questions.length > 0 ? (answeredCount / quiz.questions.length) * 100 : 0

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-4 z-10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Progress: {answeredCount} of {quiz.questions.length} questions
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />

          {showValidation && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {quiz.validationSettings.requireAllAnswersToSubmit
                    ? "Please answer all questions before submitting"
                    : "Please answer all required questions before submitting"}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {quiz.questions.map((question, index) => {
          const isAnswered = !!responses[question.id]
          const shouldHighlight =
            showValidation &&
            (quiz.validationSettings.requireAllAnswersToSubmit ? !isAnswered : question.required && !isAnswered)

          return (
            <Card
              key={question.id}
              id={`question-${question.id}`}
              className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm transition-all duration-200 ${
                shouldHighlight ? "ring-2 ring-red-500 ring-opacity-50" : ""
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Question {index + 1}</span>
                      {(question.required || quiz.validationSettings.requireAllAnswersToSubmit) && (
                        <span className="text-red-500 text-sm">*</span>
                      )}
                      {isAnswered && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                    <CardTitle className="text-lg">{question.title}</CardTitle>
                    {question.description && (
                      <p className="text-sm text-muted-foreground mt-1">{question.description}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <QuizRenderer
                  question={question}
                  response={responses[question.id]}
                  onResponseChange={(response) => onResponseChange(question.id, response)}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky bottom-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {answeredCount} of {quiz.questions.length} questions answered
              {!canSubmitQuiz && (
                <div className="text-orange-600 dark:text-orange-400 mt-1">
                  {quiz.validationSettings.requireAllAnswersToSubmit
                    ? "Answer all questions to submit"
                    : "Answer required questions to submit"}
                </div>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmitQuiz}
              size="lg"
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
        </CardContent>
      </Card>

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
