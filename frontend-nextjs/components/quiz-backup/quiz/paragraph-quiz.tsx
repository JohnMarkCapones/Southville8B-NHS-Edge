"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { QuizComponentProps, ParagraphQuestion } from "@/types/quiz"

interface ParagraphQuizProps extends QuizComponentProps {
  question: ParagraphQuestion
}

export default function ParagraphQuiz({ question, value = "", onChange, disabled = false }: ParagraphQuizProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={`question-${question.id}`} className="text-base font-medium">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {question.description && <p className="text-sm text-muted-foreground mt-1">{question.description}</p>}
      </div>

      <Textarea
        id={`question-${question.id}`}
        placeholder={question.placeholder || "Enter your detailed answer..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={question.maxLength}
        className="w-full min-h-[120px] resize-y"
      />

      {question.maxLength && (
        <p className="text-xs text-muted-foreground text-right">
          {value.length}/{question.maxLength} characters
        </p>
      )}
    </div>
  )
}
