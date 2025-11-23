"use client"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, RotateCcw } from "lucide-react"
import type { QuizComponentProps, OrderingQuestion } from "@/types/quiz"

interface OrderingQuizProps extends QuizComponentProps {
  question: OrderingQuestion
}

export default function OrderingQuiz({ question, value = [], onChange, disabled = false }: OrderingQuizProps) {
  // Initialize with original order if no value
  const items = value.length > 0 ? value : question.items.map((_, index) => index)

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return

    const newItems = [...items]
    const item = newItems[fromIndex]
    newItems.splice(fromIndex, 1)
    newItems.splice(toIndex, 0, item)
    onChange(newItems)
  }

  const resetOrder = () => {
    onChange(question.items.map((_, index) => index))
  }

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

      <div className="space-y-2">
        {items.map((itemIndex, position) => (
          <div key={`${itemIndex}-${position}`} className="flex items-center gap-2 p-3 border rounded-lg bg-white">
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveItem(position, position - 1)}
                disabled={disabled || position === 0}
                className="h-6 w-6 p-0"
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveItem(position, position + 1)}
                disabled={disabled || position === items.length - 1}
                className="h-6 w-6 p-0"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>

            <span className="flex-1">{question.items[itemIndex]}</span>
            <span className="text-sm text-muted-foreground font-mono">#{position + 1}</span>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={resetOrder}
        disabled={disabled}
        className="flex items-center gap-2 bg-transparent"
      >
        <RotateCcw className="w-4 h-4" />
        Reset Order
      </Button>
    </div>
  )
}
