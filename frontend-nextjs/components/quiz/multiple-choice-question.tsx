/**
 * Multiple Choice Question Component
 *
 * Renders a multiple-choice question with radio button options.
 */

'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { QuizQuestion, QuizChoice } from '@/lib/api/types';

interface MultipleChoiceQuestionProps {
  question: QuizQuestion;
  value?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
}

export function MultipleChoiceQuestion({
  question,
  value,
  onChange,
  disabled = false,
  showCorrectAnswer = false,
}: MultipleChoiceQuestionProps) {
  const choices = (question as any).choices || [];

  return (
    <div className="space-y-4">
      <RadioGroup
        value={value || ''}
        onValueChange={onChange}
        disabled={disabled}
        className="space-y-3"
      >
        {choices.map((choice: any) => (
          <div
            key={choice.choice_id}
            className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${
              value === choice.choice_id
                ? 'border-school-blue bg-blue-50 dark:bg-blue-950'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            } ${
              showCorrectAnswer && choice.is_correct
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : ''
            } ${
              showCorrectAnswer &&
              value === choice.choice_id &&
              !choice.is_correct
                ? 'border-red-500 bg-red-50 dark:bg-red-950'
                : ''
            }`}
          >
            <RadioGroupItem
              value={choice.choice_id}
              id={choice.choice_id}
              className="mt-1"
            />
            <Label
              htmlFor={choice.choice_id}
              className="flex-1 cursor-pointer text-base"
            >
              <div
                className="prose dark:prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: choice.choice_text }}
              />
              {showCorrectAnswer && choice.is_correct && (
                <span className="text-green-600 dark:text-green-400 text-sm font-semibold ml-2">
                  ✓ Correct Answer
                </span>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
