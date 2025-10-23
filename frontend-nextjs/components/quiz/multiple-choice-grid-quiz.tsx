"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { QuizComponentProps, MultipleChoiceGridQuestion } from "@/types/quiz"

interface MultipleChoiceGridQuizProps extends QuizComponentProps {
  question: MultipleChoiceGridQuestion
}

export default function MultipleChoiceGridQuiz({
  question,
  value = {},
  onChange,
  disabled = false,
  showCorrectAnswer = false,
}: MultipleChoiceGridQuizProps) {
  const handleRowChange = (rowId: string, columnId: string) => {
    const newValue = { ...value }
    newValue[rowId] = columnId
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

      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header - Hidden on mobile, shown on larger screens */}
          <div
            className="hidden md:grid gap-2 mb-4"
            style={{ gridTemplateColumns: `200px repeat(${question.columns.length}, 1fr)` }}
          >
            <div></div>
            {question.columns.map((column) => (
              <div key={column.id} className="text-center text-sm font-medium p-2">
                {column.label}
              </div>
            ))}
          </div>

          {/* Mobile-first responsive rows */}
          {question.rows.map((row) => (
            <div key={row.id} className="mb-6 md:mb-3">
              {/* Mobile: Stack vertically */}
              <div className="md:hidden space-y-3">
                <div className="font-medium text-sm">{row.label}</div>
                <RadioGroup
                  value={value[row.id] || ""}
                  onValueChange={(columnId) => handleRowChange(row.id, columnId)}
                  disabled={disabled}
                  className="space-y-2"
                >
                  {question.columns.map((column) => (
                    <div key={column.id} className="flex items-center space-x-3">
                      <RadioGroupItem
                        value={column.id}
                        className={
                          showCorrectAnswer && question.correctAnswers?.[row.id] === column.id ? "border-green-500" : ""
                        }
                      />
                      <Label className="text-sm">{column.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Desktop: Grid layout */}
              <div
                className="hidden md:grid gap-2"
                style={{ gridTemplateColumns: `200px repeat(${question.columns.length}, 1fr)` }}
              >
                <div className="flex items-center p-2 text-sm">{row.label}</div>

                <RadioGroup
                  value={value[row.id] || ""}
                  onValueChange={(columnId) => handleRowChange(row.id, columnId)}
                  disabled={disabled}
                  className="contents"
                >
                  {question.columns.map((column) => (
                    <div key={column.id} className="flex justify-center items-center p-2">
                      <RadioGroupItem
                        value={column.id}
                        className={
                          showCorrectAnswer && question.correctAnswers?.[row.id] === column.id ? "border-green-500" : ""
                        }
                      />
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
