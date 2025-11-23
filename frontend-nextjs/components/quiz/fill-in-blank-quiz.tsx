"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { QuizComponentProps, FillInBlankQuestion } from "@/types/quiz"

interface FillInBlankQuizProps extends QuizComponentProps {
  question: FillInBlankQuestion
}

export default function FillInBlankQuiz({ question, value = [], onChange, disabled = false }: FillInBlankQuizProps) {
  // Parse the text to find blanks marked with {{blank_0}}, {{blank_1}}, etc.
  const questionText = question.text || question.title || ""
  const parts = questionText.split(/({{blank_\d+}})/g)

  // Count blanks
  const blanks = questionText.match(/{{blank_\d+}}/g) || []
  const blankCount = blanks.length

  const handleBlankChange = (blankIndex: number, newValue: string) => {
    const newAnswers = [...value]
    newAnswers[blankIndex] = newValue
    onChange(newAnswers)
  }

  let currentBlankIndex = 0

  // Check if question has sensitivity settings
  const hasSensitivitySettings = (question as any).caseSensitive || (question as any).whitespaceSensitive

  return (
    <div className="space-y-4">
      {/* Only show description if it exists, no title with markers */}
      {question.description && (
        <div>
          <Label className="text-base font-medium text-slate-700 dark:text-slate-300">
            {question.description}
          </Label>
        </div>
      )}

      {/* Question Image */}
      {(question as any).question_image_url && (
        <div>
          <img
            src={(question as any).question_image_url}
            alt="Question"
            className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
            loading="lazy"
          />
        </div>
      )}

      {/* ✅ NEW: Show sensitivity hints if enabled */}
      {hasSensitivitySettings && !disabled && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <p className="font-semibold">Grading Notes:</p>
            {(question as any).caseSensitive && (
              <p>• Capitalization matters (e.g., "Paris" not "paris")</p>
            )}
            {(question as any).whitespaceSensitive && (
              <p>• Spacing must be exact (no extra spaces)</p>
            )}
          </div>
        </div>
      )}

      {/* Question with inline blanks */}
      <div className="space-y-2">
        <div className="text-lg leading-relaxed flex flex-wrap items-baseline gap-1">
          {parts.map((part, index) => {
            // Check if this part is a blank marker
            if (part.match(/{{blank_\d+}}/)) {
              const blankIdx = currentBlankIndex++
              const blankMatch = part.match(/{{blank_(\d+)}}/)
              const expectedAnswer = blankMatch ? question.options?.[parseInt(blankMatch[1])] : ""

              return (
                <input
                  key={index}
                  type="text"
                  value={value[blankIdx] || ""}
                  onChange={(e) => handleBlankChange(blankIdx, e.target.value)}
                  disabled={disabled}
                  placeholder=" "
                  className="border-0 border-b-2 border-slate-400 dark:border-slate-500 bg-transparent outline-none px-2 py-1 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors disabled:opacity-50 min-w-[80px] sm:min-w-[120px] max-w-full"
                  style={{
                    width: `clamp(80px, ${Math.max(120, (expectedAnswer?.length || 8) * 12)}px, 100%)`,
                  }}
                />
              )
            }

            // Regular text
            return <span key={index} className="inline">{part}</span>
          })}
          {question.required && <span className="text-red-500 ml-2">*</span>}
        </div>
      </div>
    </div>
  )
}
