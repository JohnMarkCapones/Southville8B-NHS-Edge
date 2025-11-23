"use client"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { QuizComponentProps, LinearScaleQuestion } from "@/types/quiz"

interface LinearScaleQuizProps extends QuizComponentProps {
  question: LinearScaleQuestion
}

export default function LinearScaleQuiz({ question, value, onChange, disabled = false }: LinearScaleQuizProps) {
  const scaleValues = Array.from({ length: question.maxValue - question.minValue + 1 }, (_, i) => question.minValue + i)

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">
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

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{question.minLabel || question.minValue}</span>
          <span>{question.maxLabel || question.maxValue}</span>
        </div>

        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {scaleValues.map((scaleValue) => (
            <Button
              key={scaleValue}
              variant={value === scaleValue ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(scaleValue)}
              disabled={disabled}
              className="min-w-[44px] h-10 flex-shrink-0"
            >
              {scaleValue}
            </Button>
          ))}
        </div>

        {value !== undefined && <p className="text-center text-sm text-muted-foreground">Selected: {value}</p>}
      </div>
    </div>
  )
}
