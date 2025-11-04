"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { QuizComponentProps, CheckboxQuestion } from "@/types/quiz"

interface CheckboxQuizProps extends QuizComponentProps {
  question: CheckboxQuestion
}

export default function CheckboxQuiz({
  question,
  value = [],
  onChange,
  disabled = false,
  showCorrectAnswer = false,
}: CheckboxQuizProps) {
  const handleChange = (optionIndex: number, checked: boolean) => {
    const newValue = [...value]
    if (checked) {
      if (!newValue.includes(optionIndex)) {
        newValue.push(optionIndex)
      }
    } else {
      const index = newValue.indexOf(optionIndex)
      if (index > -1) {
        newValue.splice(index, 1)
      }
    }
    onChange(newValue)
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

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-3">
            <Checkbox
              id={`${question.id}-option-${index}`}
              checked={value.includes(index)}
              onCheckedChange={(checked) => handleChange(index, !!checked)}
              disabled={disabled}
              className={showCorrectAnswer && question.correctAnswers?.includes(index) ? "border-green-500" : ""}
            />
            <Label
              htmlFor={`${question.id}-option-${index}`}
              className={`flex-1 cursor-pointer ${
                showCorrectAnswer && question.correctAnswers?.includes(index) ? "text-green-600 font-medium" : ""
              }`}
            >
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
