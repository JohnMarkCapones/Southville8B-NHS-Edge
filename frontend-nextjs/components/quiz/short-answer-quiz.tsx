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
