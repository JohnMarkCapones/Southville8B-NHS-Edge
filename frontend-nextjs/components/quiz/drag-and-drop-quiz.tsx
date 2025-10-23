"use client"

import type React from "react"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { GripVertical, RotateCcw } from "lucide-react"
import type { QuizComponentProps, DragAndDropQuestion } from "@/types/quiz"

interface DragAndDropQuizProps extends QuizComponentProps {
  question: DragAndDropQuestion
}

export default function DragAndDropQuiz({ question, value = [], onChange, disabled = false }: DragAndDropQuizProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Initialize with original order if no value
  const items = value.length > 0 ? value : question.items.map((_, index) => index)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null) return

    const newItems = [...items]
    const draggedItem = newItems[draggedIndex]
    newItems.splice(draggedIndex, 1)
    newItems.splice(dropIndex, 0, draggedItem)

    onChange(newItems)
    setDraggedIndex(null)
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
      </div>

      <div className="space-y-2">
        {items.map((itemIndex, position) => (
          <div
            key={`${itemIndex}-${position}`}
            draggable={!disabled}
            onDragStart={() => handleDragStart(position)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(position)}
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-move transition-colors ${
              draggedIndex === position ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
            <span className="flex-1">{question.items[itemIndex]}</span>
            <span className="text-sm text-muted-foreground">#{position + 1}</span>
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
