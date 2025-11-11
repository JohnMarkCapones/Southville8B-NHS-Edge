/**
 * True/False Question Component
 *
 * Renders a true/false question with two radio button options.
 */

'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle } from 'lucide-react';
import type { QuizQuestion } from '@/lib/api/types';

interface TrueFalseQuestionProps {
  question: QuizQuestion;
  value?: boolean | null;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
  correctAnswer?: boolean;
}

export function TrueFalseQuestion({
  question,
  value,
  onChange,
  disabled = false,
  showCorrectAnswer = false,
  correctAnswer,
}: TrueFalseQuestionProps) {
  return (
    <div className="space-y-4">
      <RadioGroup
        value={value === null || value === undefined ? '' : String(value)}
        onValueChange={(val) => onChange(val === 'true')}
        disabled={disabled}
        className="space-y-3"
      >
        {/* True option */}
        <div
          className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
            value === true
              ? 'border-school-blue bg-blue-50 dark:bg-blue-950'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          } ${
            showCorrectAnswer && correctAnswer === true
              ? 'border-green-500 bg-green-50 dark:bg-green-950'
              : ''
          } ${
            showCorrectAnswer && value === true && correctAnswer === false
              ? 'border-red-500 bg-red-50 dark:bg-red-950'
              : ''
          }`}
        >
          <RadioGroupItem value="true" id="true" />
          <Label
            htmlFor="true"
            className="flex items-center gap-2 cursor-pointer text-base flex-1"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>True</span>
            {showCorrectAnswer && correctAnswer === true && (
              <span className="text-green-600 dark:text-green-400 text-sm font-semibold ml-auto">
                ✓ Correct Answer
              </span>
            )}
          </Label>
        </div>

        {/* False option */}
        <div
          className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
            value === false
              ? 'border-school-blue bg-blue-50 dark:bg-blue-950'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          } ${
            showCorrectAnswer && correctAnswer === false
              ? 'border-green-500 bg-green-50 dark:bg-green-950'
              : ''
          } ${
            showCorrectAnswer && value === false && correctAnswer === true
              ? 'border-red-500 bg-red-50 dark:bg-red-950'
              : ''
          }`}
        >
          <RadioGroupItem value="false" id="false" />
          <Label
            htmlFor="false"
            className="flex items-center gap-2 cursor-pointer text-base flex-1"
          >
            <XCircle className="w-5 h-5 text-red-600" />
            <span>False</span>
            {showCorrectAnswer && correctAnswer === false && (
              <span className="text-green-600 dark:text-green-400 text-sm font-semibold ml-auto">
                ✓ Correct Answer
              </span>
            )}
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
