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
