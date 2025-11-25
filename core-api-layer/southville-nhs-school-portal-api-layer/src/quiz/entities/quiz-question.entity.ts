import { ApiProperty } from '@nestjs/swagger';

export class QuizQuestion {
  @ApiProperty({ description: 'Question ID (UUID)' })
  question_id: string;

  @ApiProperty({ description: 'Quiz ID (UUID)' })
  quiz_id: string;

  @ApiProperty({ description: 'Question text' })
  question_text: string;

  @ApiProperty({
    description: 'Optional question description/explanation',
    required: false,
  })
  description?: string;

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
    description: 'Is this question required to answer',
    default: false,
  })
  is_required: boolean;

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
    description: 'Randomize choices order for this question',
    default: false,
  })
  is_randomize: boolean;

  @ApiProperty({
    description: 'Source question bank ID if imported (UUID)',
    required: false,
  })
  source_question_bank_id?: string;

  @ApiProperty({
    description: 'Case sensitive matching for fill-in-blank questions',
    default: false,
    required: false,
  })
  case_sensitive?: boolean;

  @ApiProperty({
    description: 'Whitespace sensitive matching for fill-in-blank questions',
    default: false,
    required: false,
  })
  whitespace_sensitive?: boolean;

  // ============================================================================
  // Image Support Fields (Cloudflare Images)
  // ============================================================================

  @ApiProperty({
    description: 'Cloudflare Images ID for question image',
    required: false,
  })
  question_image_id?: string;

  @ApiProperty({
    description: 'Full Cloudflare Images delivery URL for question image',
    required: false,
  })
  question_image_url?: string;

  @ApiProperty({
    description: 'File size in bytes of question image',
    required: false,
  })
  question_image_file_size?: number;

  @ApiProperty({
    description: 'MIME type of question image',
    required: false,
  })
  question_image_mime_type?: string;

  @ApiProperty({ description: 'Created at timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Updated at timestamp' })
  updated_at: string;
}
