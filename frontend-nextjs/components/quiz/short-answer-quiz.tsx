"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { QuizComponentProps, ShortAnswerQuestion } from "@/types/quiz"

interface ShortAnswerQuizProps extends QuizComponentProps {
  question: ShortAnswerQuestion
}

export default function ShortAnswerQuiz({ question, value = "", onChange, disabled = false }: ShortAnswerQuizProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={`question-${question.id}`} className="text-base font-medium">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {question.description && <p className="text-sm text-muted-foreground mt-1">{question.description}</p>}

        {/* Question Image */}
        {(question as any).question_image_url && (
          <div className="mt-3">
            <img
              src={(question as any).question_image_url}
              alt="Question"
              className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
              loading="lazy"
            />
          </div>
        )}
      </div>

      <Input
        id={`question-${question.id}`}
        type="text"
        placeholder={question.placeholder || "Enter your answer..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={question.maxLength}
        className="w-full"
      />

      {question.maxLength && (
        <p className="text-xs text-muted-foreground text-right">
          {value.length}/{question.maxLength} characters
        </p>
      )}
    </div>
  )
}
