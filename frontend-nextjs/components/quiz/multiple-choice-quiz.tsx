"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { QuizComponentProps, MultipleChoiceQuestion } from "@/types/quiz"

interface MultipleChoiceQuizProps extends QuizComponentProps {
  question: MultipleChoiceQuestion
}

export default function MultipleChoiceQuiz({
  question,
  value,
  onChange,
  disabled = false,
  showCorrectAnswer = false,
}: MultipleChoiceQuizProps) {
  // ✅ Support both formats: frontend (options array) and backend (choices with IDs)
  const choices = (question as any).choices || [];
  const options = question.options || [];
  const useBackendFormat = choices.length > 0;

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

      <RadioGroup
        value={value?.toString()}
        onValueChange={(val) => {
          // ✅ Send choice UUID for backend format, index for frontend format
          if (useBackendFormat) {
            onChange(val); // Send choice_id (UUID string)
          } else {
            onChange(Number.parseInt(val)); // Send index (number)
          }
        }}
        disabled={disabled}
        className="space-y-3"
      >
        {useBackendFormat ? (
          // ✅ Backend format: Render choices with UUIDs
          choices.map((choice: any) => (
            <div key={choice.choice_id} className="space-y-2">
              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value={choice.choice_id}
                  id={`${question.id}-choice-${choice.choice_id}`}
                  className={showCorrectAnswer && choice.is_correct ? "border-green-500" : ""}
                />
                <Label
                  htmlFor={`${question.id}-choice-${choice.choice_id}`}
                  className={`flex-1 cursor-pointer ${
                    showCorrectAnswer && choice.is_correct
                      ? "text-green-700 dark:text-green-300 font-medium"
                      : "text-slate-900 dark:text-slate-100"
                  }`}
                >
                  <div dangerouslySetInnerHTML={{ __html: choice.choice_text }} />
                </Label>
              </div>

              {/* Choice Image */}
              {choice.choice_image_url && (
                <div className="ml-9">
                  <img
                    src={choice.choice_image_url}
                    alt={`Choice: ${choice.choice_text}`}
                    className="max-w-xs h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          // Frontend format: Render options with indices
          options.map((option, index) => (
            <div key={index} className="flex items-center space-x-3">
              <RadioGroupItem
                value={index.toString()}
                id={`${question.id}-option-${index}`}
                className={showCorrectAnswer && question.correctAnswer === index ? "border-green-500" : ""}
              />
              <Label
                htmlFor={`${question.id}-option-${index}`}
                className={`flex-1 cursor-pointer ${
                  showCorrectAnswer && question.correctAnswer === index
                    ? "text-green-700 dark:text-green-300 font-medium"
                    : "text-slate-900 dark:text-slate-100"
                }`}
              >
                {option}
              </Label>
            </div>
          ))
        )}
      </RadioGroup>
    </div>
  )
}
