/**
 * Essay Question Component
 *
 * Renders an essay question with a rich text area.
 */

'use client';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { QuizQuestion } from '@/lib/api/types';

interface EssayQuestionProps {
  question: QuizQuestion;
  value?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
  modelAnswer?: string;
  maxWords?: number;
}

export function EssayQuestion({
  question,
  value,
  onChange,
  disabled = false,
  showCorrectAnswer = false,
  modelAnswer,
  maxWords,
}: EssayQuestionProps) {
  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = value?.length || 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="essay-answer" className="text-sm text-muted-foreground">
            Your Answer:
          </Label>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-normal">
              {wordCount} word{wordCount !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="font-normal">
              {charCount} character{charCount !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <Textarea
          id="essay-answer"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Type your answer here... Be detailed and thorough."
          className="min-h-[200px] resize-y"
          rows={10}
        />

        {maxWords && wordCount > maxWords && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            ⚠ Warning: You have exceeded the recommended word limit of {maxWords}{' '}
            words.
          </p>
        )}
      </div>

      {showCorrectAnswer && modelAnswer && (
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Model Answer / Key Points:
          </p>
          <div
            className="prose dark:prose-invert prose-sm max-w-none text-blue-800 dark:text-blue-200"
            dangerouslySetInnerHTML={{ __html: modelAnswer }}
          />
        </div>
      )}

      {!showCorrectAnswer && (
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <span className="font-semibold">Note:</span> Essay questions will be
            manually graded by your teacher. Make sure to answer thoroughly and
            address all parts of the question.
          </p>
        </div>
      )}
    </div>
  );
}
