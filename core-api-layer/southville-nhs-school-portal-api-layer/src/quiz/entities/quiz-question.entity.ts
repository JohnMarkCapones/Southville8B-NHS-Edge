import { ApiProperty } from '@nestjs/swagger';

export class QuizQuestion {
  @ApiProperty({ description: 'Question ID (UUID)' })
  question_id: string;

  @ApiProperty({ description: 'Quiz ID (UUID)' })
  quiz_id: string;

  @ApiProperty({ description: 'Question text' })
  question_text: string;

  @ApiProperty({
    description: 'Question type',
    enum: [
      'multiple_choice',
      'checkbox',
      'true_false',
      'short_answer',
      'essay',
      'fill_in_blank',
      'matching',
      'drag_drop',
      'ordering',
      'dropdown',
      'linear_scale',
    ],
  })
  question_type: string;

  @ApiProperty({ description: 'Order index' })
  order_index: number;

  @ApiProperty({ description: 'Points for this question', default: 1 })
  points: number;

  @ApiProperty({ description: 'Allow partial credit', default: false })
  allow_partial_credit: boolean;

  @ApiProperty({
    description: 'Time limit in seconds for this question',
    required: false,
  })
  time_limit_seconds?: number;

  @ApiProperty({
    description: 'Is this question part of a randomization pool',
    default: false,
  })
  is_pool_question: boolean;

  @ApiProperty({
    description: 'Source question bank ID if imported (UUID)',
    required: false,
  })
  source_question_bank_id?: string;

  @ApiProperty({ description: 'Created at timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Updated at timestamp' })
  updated_at: string;
}
