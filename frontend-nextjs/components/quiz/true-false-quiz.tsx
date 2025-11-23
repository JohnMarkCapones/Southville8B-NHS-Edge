"use client"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import type { QuizComponentProps, TrueFalseQuestion } from "@/types/quiz"

interface TrueFalseQuizProps extends QuizComponentProps {
  question: TrueFalseQuestion
}

export default function TrueFalseQuiz({
  question,
  value,
  onChange,
  disabled = false,
  showCorrectAnswer = false,
}: TrueFalseQuizProps) {
  // ✅ Support both formats: frontend (boolean) and backend (choices with IDs)
  const choices = (question as any).choices || [];
  const useBackendFormat = choices.length > 0;

  // ✅ For backend format, find choice UUIDs for True/False
  let trueChoiceId: string | undefined;
  let falseChoiceId: string | undefined;
  let correctChoiceId: string | undefined;

  if (useBackendFormat) {
    // Find choices by their text content (case-insensitive)
    const trueChoice = choices.find((c: any) =>
      c.choice_text.toLowerCase().includes('true')
    );
    const falseChoice = choices.find((c: any) =>
      c.choice_text.toLowerCase().includes('false')
    );

    trueChoiceId = trueChoice?.choice_id;
    falseChoiceId = falseChoice?.choice_id;
    correctChoiceId = choices.find((c: any) => c.is_correct)?.choice_id;
  }

  // ✅ Determine which button is selected
  const isTrue = useBackendFormat
    ? value === trueChoiceId
    : value === true;

  const isFalse = useBackendFormat
    ? value === falseChoiceId
    : value === false;

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium text-slate-900 dark:text-slate-100">
          {question.title}
          {question.required && <span className="text-red-600 dark:text-red-400 ml-1">*</span>}
        </Label>
        {question.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{question.description}</p>}

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

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <Button
          variant={isTrue ? "default" : "outline"}
          size="lg"
          onClick={() => {
            // ✅ Send choice UUID for backend format, boolean for frontend format
            if (useBackendFormat && trueChoiceId) {
              onChange(trueChoiceId);
            } else {
              onChange(true);
            }
          }}
          disabled={disabled}
          className={`flex items-center justify-center gap-2 min-w-[120px] w-full sm:w-auto ${
            showCorrectAnswer && (
              useBackendFormat
                ? trueChoiceId === correctChoiceId
                : question.correctAnswer === true
            ) ? "border-green-500 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : ""
          }`}
        >
          <Check className="w-4 h-4" />
          True
        </Button>

        <Button
          variant={isFalse ? "default" : "outline"}
          size="lg"
          onClick={() => {
            // ✅ Send choice UUID for backend format, boolean for frontend format
            if (useBackendFormat && falseChoiceId) {
              onChange(falseChoiceId);
            } else {
              onChange(false);
            }
          }}
          disabled={disabled}
          className={`flex items-center justify-center gap-2 min-w-[120px] w-full sm:w-auto ${
            showCorrectAnswer && (
              useBackendFormat
                ? falseChoiceId === correctChoiceId
                : question.correctAnswer === false
            ) ? "border-green-500 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : ""
          }`}
        >
          <X className="w-4 h-4" />
          False
        </Button>
      </div>
    </div>
  )
}
