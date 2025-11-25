"use client"

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getQuizComponent } from "@/lib/quizRenderer"
import type { Question, QuizResponse } from "@/types/quiz"

interface QuizRendererProps {
  question: Question
  response?: QuizResponse
  onResponseChange: (response: QuizResponse) => void
  disabled?: boolean
  showCorrectAnswer?: boolean
  questionNumber?: number
}

function QuizQuestionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </div>
      </CardContent>
    </Card>
  )
}

export function QuizRenderer({
  question,
  response,
  onResponseChange,
  disabled = false,
  showCorrectAnswer = false,
  questionNumber,
}: QuizRendererProps) {
  console.log('[QuizRenderer] Rendering question:', {
    id: question.id,
    type: question.type,
    title: question.title,
    has_image: !!(question as any).question_image_url || !!(question as any).questionImageUrl
  })

  const Component = getQuizComponent(question.type)

  const handleChange = (value: any) => {
    onResponseChange({
      questionId: question.id,
      answer: value,
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {questionNumber && (
            <span className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
              {questionNumber}
            </span>
          )}
          <span className="text-lg">Question {questionNumber || ""}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<QuizQuestionSkeleton />}>
          <Component
            question={question}
            value={response?.answer}
            onChange={handleChange}
            disabled={disabled}
            showCorrectAnswer={showCorrectAnswer}
          />
        </Suspense>
      </CardContent>
    </Card>
  )
}

export default QuizRenderer
