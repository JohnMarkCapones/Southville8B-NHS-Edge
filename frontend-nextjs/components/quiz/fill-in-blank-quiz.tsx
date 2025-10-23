"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { QuizComponentProps, FillInBlankQuestion } from "@/types/quiz"

interface FillInBlankQuizProps extends QuizComponentProps {
  question: FillInBlankQuestion
}

export default function FillInBlankQuiz({ question, value = [], onChange, disabled = false }: FillInBlankQuizProps) {
  // Parse the text to find blanks marked with {{blank}}
  const parts = question.text.split(/\{\{blank\}\}/g)
  const blankCount = parts.length - 1

  const handleBlankChange = (index: number, newValue: string) => {
    const newAnswers = [...value]
    newAnswers[index] = newValue
    onChange(newAnswers)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {question.description && <p className="text-sm text-muted-foreground mt-1">{question.description}</p>}
      </div>

      <div className="space-y-2">
        <div className="text-base leading-relaxed">
          {parts.map((part, index) => (
            <span key={index}>
              {part}
              {index < blankCount && (
                <Input
                  type="text"
                  value={value[index] || ""}
                  onChange={(e) => handleBlankChange(index, e.target.value)}
                  disabled={disabled}
                  className="inline-block w-32 mx-1 h-8 text-center"
                  placeholder={`Blank ${index + 1}`}
                />
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
