"use client"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import type { QuizComponentProps, TrueFalseQuestion } from "@/types/quiz"

interface TrueFalseQuizProps extends QuizComponentProps {
  question: TrueFalseQuestion
}

export default function TrueFalseQuiz({
  question,
  value,
  onChange,
  disabled = false,
  showCorrectAnswer = false,
}: TrueFalseQuizProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {question.description && <p className="text-sm text-muted-foreground mt-1">{question.description}</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <Button
          variant={value === true ? "default" : "outline"}
          size="lg"
          onClick={() => onChange(true)}
          disabled={disabled}
          className={`flex items-center justify-center gap-2 min-w-[120px] w-full sm:w-auto ${
            showCorrectAnswer && question.correctAnswer === true ? "border-green-500 bg-green-50 text-green-700" : ""
          }`}
        >
          <Check className="w-4 h-4" />
          True
        </Button>

        <Button
          variant={value === false ? "default" : "outline"}
          size="lg"
          onClick={() => onChange(false)}
          disabled={disabled}
          className={`flex items-center justify-center gap-2 min-w-[120px] w-full sm:w-auto ${
            showCorrectAnswer && question.correctAnswer === false ? "border-green-500 bg-green-50 text-green-700" : ""
          }`}
        >
          <X className="w-4 h-4" />
          False
        </Button>
      </div>
    </div>
  )
}
