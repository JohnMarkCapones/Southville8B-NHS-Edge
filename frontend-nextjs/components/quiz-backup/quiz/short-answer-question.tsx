/**
 * Short Answer Question Component
 *
 * Renders a short answer question with a text input field.
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { QuizQuestion } from '@/lib/api/types';

interface ShortAnswerQuestionProps {
  question: QuizQuestion;
  value?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
  correctAnswer?: string;
}

export function ShortAnswerQuestion({
  question,
  value,
  onChange,
  disabled = false,
  showCorrectAnswer = false,
  correctAnswer,
}: ShortAnswerQuestionProps) {
  const isCorrect =
    showCorrectAnswer &&
    correctAnswer &&
    value &&
    value.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="short-answer" className="text-sm text-muted-foreground">
          Your Answer:
        </Label>
        <Input
          id="short-answer"
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Type your answer here..."
          className={`${
            showCorrectAnswer
              ? isCorrect
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : 'border-red-500 bg-red-50 dark:bg-red-950'
              : ''
          }`}
        />
      </div>

      {showCorrectAnswer && correctAnswer && (
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
            Correct Answer:
          </p>
          <p className="text-blue-800 dark:text-blue-200">{correctAnswer}</p>
        </div>
      )}

      {showCorrectAnswer && (
        <div
          className={`p-3 rounded-lg ${
            isCorrect
              ? 'bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200'
          }`}
        >
          <p className="text-sm font-semibold">
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </p>
        </div>
      )}
    </div>
  );
}
