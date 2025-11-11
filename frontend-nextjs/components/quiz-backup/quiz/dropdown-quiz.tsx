"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { QuizComponentProps, DropdownQuestion } from "@/types/quiz"

interface DropdownQuizProps extends QuizComponentProps {
  question: DropdownQuestion
}

export default function DropdownQuiz({
  question,
  value,
  onChange,
  disabled = false,
  showCorrectAnswer = false,
}: DropdownQuizProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-medium">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {question.description && <p className="text-sm text-muted-foreground mt-1">{question.description}</p>}
      </div>

      <Select value={value?.toString()} onValueChange={(val) => onChange(Number.parseInt(val))} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an option..." />
        </SelectTrigger>
        <SelectContent>
          {question.options.map((option, index) => (
            <SelectItem
              key={index}
              value={index.toString()}
              className={showCorrectAnswer && question.correctAnswer === index ? "bg-green-50 text-green-700" : ""}
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
