"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import type { QuizComponentProps, MatchingPairQuestion } from "@/types/quiz"

interface MatchingPairQuizProps extends QuizComponentProps {
  question: MatchingPairQuestion
}

export default function MatchingPairQuiz({ question, value = {}, onChange, disabled = false }: MatchingPairQuizProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)

  // Shuffle right items for display
  const [rightItems] = useState(() => {
    const items = [...question.pairs]
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[items[i], items[j]] = [items[j], items[i]]
    }
    return items
  })

  const handleLeftClick = (pairId: string) => {
    if (disabled) return
    setSelectedLeft(pairId)
    if (selectedRight) {
      // Create or update match
      const newValue = { ...value }
      newValue[pairId] = selectedRight
      onChange(newValue)
      setSelectedLeft(null)
      setSelectedRight(null)
    }
  }

  const handleRightClick = (pairId: string) => {
    if (disabled) return
    setSelectedRight(pairId)
    if (selectedLeft) {
      // Create or update match
      const newValue = { ...value }
      newValue[selectedLeft] = pairId
      onChange(newValue)
      setSelectedLeft(null)
      setSelectedRight(null)
    }
  }

  const clearMatches = () => {
    onChange({})
    setSelectedLeft(null)
    setSelectedRight(null)
  }

  const getMatchedRight = (leftId: string) => {
    return value[leftId]
  }

  const isRightMatched = (rightId: string) => {
    return Object.values(value).includes(rightId)
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Match these items:</h4>
          {question.pairs.map((pair) => {
            const isSelected = selectedLeft === pair.id
            const isMatched = getMatchedRight(pair.id)

            return (
              <Button
                key={pair.id}
                variant={isSelected ? "default" : isMatched ? "secondary" : "outline"}
                className={`w-full justify-start text-left h-auto p-3 ${
                  isMatched ? "bg-green-50 border-green-200 text-green-800" : ""
                }`}
                onClick={() => handleLeftClick(pair.id)}
                disabled={disabled}
              >
                {pair.left}
                {isMatched && (
                  <span className="ml-2 text-xs">→ {rightItems.find((r) => r.id === isMatched)?.right}</span>
                )}
              </Button>
            )
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">With these items:</h4>
          {rightItems.map((pair) => {
            const isSelected = selectedRight === pair.id
            const isMatched = isRightMatched(pair.id)

            return (
              <Button
                key={pair.id}
                variant={isSelected ? "default" : isMatched ? "secondary" : "outline"}
                className={`w-full justify-start text-left h-auto p-3 ${
                  isMatched ? "bg-green-50 border-green-200 text-green-800" : ""
                }`}
                onClick={() => handleRightClick(pair.id)}
                disabled={disabled || isMatched}
              >
                {pair.right}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Matched: {Object.keys(value).length} / {question.pairs.length}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={clearMatches}
          disabled={disabled}
          className="flex items-center gap-2 bg-transparent"
        >
          <RotateCcw className="w-4 h-4" />
          Clear All
        </Button>
      </div>
    </div>
  )
}
