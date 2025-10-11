"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { QuizComponentProps, MultipleChoiceQuestion } from "@/types/quiz"

interface MultipleChoiceQuizProps extends QuizComponentProps {
  question: MultipleChoiceQuestion
}

export default function MultipleChoiceQuiz({
  question,
  value,
  onChange,
  disabled = false,
  showCorrectAnswer = false,
}: MultipleChoiceQuizProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {question.description && <p className="text-sm text-muted-foreground mt-1">{question.description}</p>}
      </div>

      <RadioGroup
        value={value?.toString()}
        onValueChange={(val) => onChange(Number.parseInt(val))}
        disabled={disabled}
        className="space-y-3"
      >
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-3">
            <RadioGroupItem
              value={index.toString()}
              id={`${question.id}-option-${index}`}
              className={showCorrectAnswer && question.correctAnswer === index ? "border-green-500" : ""}
            />
            <Label
              htmlFor={`${question.id}-option-${index}`}
              className={`flex-1 cursor-pointer ${
                showCorrectAnswer && question.correctAnswer === index ? "text-green-600 font-medium" : ""
              }`}
            >
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
