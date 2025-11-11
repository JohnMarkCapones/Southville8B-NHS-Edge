"use client"

import { useState, useMemo } from "react"
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

  // ✅ FIX: Convert matchingPairs object to pairs array
  const pairs = useMemo(() => {
    // Check if question has matchingPairs (object format from backend)
    const matchingPairs = (question as any).matchingPairs || {};

    // If pairs already exist (array format), use them
    if (question.pairs && Array.isArray(question.pairs)) {
      return question.pairs;
    }

    // Convert object to array format
    return Object.entries(matchingPairs).map(([left, right], index) => ({
      id: left,  // Use left item as ID for matching
      left,
      right: right as string,
    }));
  }, [question]);

  // ✅ FIX: Shuffle right items after pairs are computed
  const rightItems = useMemo(() => {
    const items = [...pairs];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }, [pairs])

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

  const handleRightClick = (rightText: string) => {
    if (disabled) return
    setSelectedRight(rightText)
    if (selectedLeft) {
      // Create or update match
      const newValue = { ...value }
      newValue[selectedLeft] = rightText
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

  // Debug: Log image data
  console.log('[MatchingQuiz] Question data:', {
    question_image_url: (question as any).question_image_url,
    questionImageUrl: (question as any).questionImageUrl,
    question_image_id: (question as any).question_image_id,
    hasImage: !!(question as any).question_image_url || !!(question as any).questionImageUrl
  })

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium text-slate-900 dark:text-slate-100">
          {question.title}
          {question.required && <span className="text-red-600 dark:text-red-400 ml-1">*</span>}
        </Label>
        {question.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{question.description}</p>}

        {/* Question Image - Check both snake_case and camelCase */}
        {((question as any).question_image_url || (question as any).questionImageUrl) && (
          <div className="mt-3">
            <img
              src={(question as any).question_image_url || (question as any).questionImageUrl}
              alt="Question"
              className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
              loading="lazy"
              onError={(e) => {
                console.error('[MatchingQuiz] Image load error:', e)
                console.error('[MatchingQuiz] Failed URL:', (question as any).question_image_url || (question as any).questionImageUrl)
              }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-slate-600 dark:text-slate-400">Match these items:</h4>
          {pairs.map((pair) => {
            const isSelected = selectedLeft === pair.id
            const isMatched = getMatchedRight(pair.id)

            return (
              <Button
                key={pair.id}
                variant={isSelected ? "default" : isMatched ? "secondary" : "outline"}
                className={`w-full justify-start text-left h-auto p-3 min-h-[44px] ${
                  isMatched
                    ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200"
                    : "border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                }`}
                onClick={() => handleLeftClick(pair.id)}
                disabled={disabled}
              >
                {pair.left}
                {isMatched && (
                  <span className="ml-2 text-xs">→ {isMatched}</span>
                )}
              </Button>
            )
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-slate-600 dark:text-slate-400">With these items:</h4>
          {rightItems.map((pair) => {
            const isSelected = selectedRight === pair.right
            const isMatched = isRightMatched(pair.right)

            return (
              <Button
                key={pair.id}
                variant={isSelected ? "default" : isMatched ? "secondary" : "outline"}
                className={`w-full justify-start text-left h-auto p-3 min-h-[44px] ${
                  isMatched
                    ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200"
                    : "border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                }`}
                onClick={() => handleRightClick(pair.right)}
                disabled={disabled || isMatched}
              >
                {pair.right}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Matched: {Object.keys(value).length} / {pairs.length}
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
