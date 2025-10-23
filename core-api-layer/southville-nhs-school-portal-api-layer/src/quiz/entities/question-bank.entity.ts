import { ApiProperty } from '@nestjs/swagger';

export class QuestionBank {
  @ApiProperty({ description: 'Question ID (UUID)' })
  id: string;

  @ApiProperty({ description: 'Teacher ID (UUID)' })
  teacher_id: string;

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

  @ApiProperty({ description: 'Subject ID (UUID)', required: false })
  subject_id?: string;

  @ApiProperty({ description: 'Topic', required: false })
  topic?: string;

  @ApiProperty({
    description: 'Difficulty level',
    enum: ['easy', 'medium', 'hard'],
    required: false,
  })
  difficulty?: string;

  @ApiProperty({ description: 'Tags', type: [String], required: false })
  tags?: string[];

  @ApiProperty({ description: 'Default points', default: 1 })
  default_points: number;

  @ApiProperty({ description: 'Choices (JSONB)', required: false })
  choices?: any;

  @ApiProperty({ description: 'Correct answer (JSONB)', required: false })
  correct_answer?: any;

  @ApiProperty({ description: 'Allow partial credit', default: false })
  allow_partial_credit: boolean;

  @ApiProperty({
    description: 'Time limit in seconds',
    required: false,
  })
  time_limit_seconds?: number;

  @ApiProperty({ description: 'Created at timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Updated at timestamp' })
  updated_at: string;
}
