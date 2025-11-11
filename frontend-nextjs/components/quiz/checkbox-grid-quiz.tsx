"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { QuizComponentProps, CheckboxGridQuestion } from "@/types/quiz"

interface CheckboxGridQuizProps extends QuizComponentProps {
  question: CheckboxGridQuestion
}

export default function CheckboxGridQuiz({
  question,
  value = {},
  onChange,
  disabled = false,
  showCorrectAnswer = false,
}: CheckboxGridQuizProps) {
  const handleCellChange = (rowId: string, columnId: string, checked: boolean) => {
    const newValue = { ...value }
    if (!newValue[rowId]) {
      newValue[rowId] = []
    }

    const rowValues = [...newValue[rowId]]
    if (checked) {
      if (!rowValues.includes(columnId)) {
        rowValues.push(columnId)
      }
    } else {
      const index = rowValues.indexOf(columnId)
      if (index > -1) {
        rowValues.splice(index, 1)
      }
    }

    newValue[rowId] = rowValues
    onChange(newValue)
  }

  const isCellChecked = (rowId: string, columnId: string) => {
    return value[rowId]?.includes(columnId) || false
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
                <div className="space-y-2">
                  {question.columns.map((column) => (
                    <div key={column.id} className="flex items-center space-x-3">
                      <Checkbox
                        checked={isCellChecked(row.id, column.id)}
                        onCheckedChange={(checked) => handleCellChange(row.id, column.id, !!checked)}
                        disabled={disabled}
                        className={
                          showCorrectAnswer && question.correctAnswers?.[row.id]?.includes(column.id)
                            ? "border-green-500"
                            : ""
                        }
                      />
                      <Label className="text-sm">{column.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop: Grid layout */}
              <div
                className="hidden md:grid gap-2"
                style={{ gridTemplateColumns: `200px repeat(${question.columns.length}, 1fr)` }}
              >
                <div className="flex items-center p-2 text-sm">{row.label}</div>

                {question.columns.map((column) => (
                  <div key={column.id} className="flex justify-center items-center p-2">
                    <Checkbox
                      checked={isCellChecked(row.id, column.id)}
                      onCheckedChange={(checked) => handleCellChange(row.id, column.id, !!checked)}
                      disabled={disabled}
                      className={
                        showCorrectAnswer && question.correctAnswers?.[row.id]?.includes(column.id)
                          ? "border-green-500"
                          : ""
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
