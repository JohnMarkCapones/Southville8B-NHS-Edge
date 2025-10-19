import { ApiProperty } from '@nestjs/swagger';

export class Quiz {
  @ApiProperty({ description: 'Quiz ID (UUID)' })
  quiz_id: string;

  @ApiProperty({ description: 'Quiz title' })
  title: string;

  @ApiProperty({ description: 'Quiz description', required: false })
  description?: string;

  @ApiProperty({ description: 'Subject ID (UUID)', required: false })
  subject_id?: string;

  @ApiProperty({ description: 'Teacher ID (UUID)' })
  teacher_id: string;

  @ApiProperty({
    description: 'Quiz type',
    enum: ['form', 'sequential', 'mixed'],
    default: 'form',
  })
  type: string;

  @ApiProperty({
    description: 'Grading type',
    enum: ['auto', 'manual', 'hybrid'],
    default: 'auto',
  })
  grading_type: string;

  @ApiProperty({
    description: 'Time limit in minutes',
    required: false,
  })
  time_limit?: number;

  @ApiProperty({
    description: 'Quiz start date (ISO 8601)',
    required: false,
  })
  start_date?: string;

  @ApiProperty({
    description: 'Quiz end date (ISO 8601)',
    required: false,
  })
  end_date?: string;

  @ApiProperty({
    description: 'Quiz status',
    enum: ['draft', 'published', 'archived', 'scheduled'],
    default: 'draft',
  })
  status: string;

  @ApiProperty({ description: 'Quiz version number', default: 1 })
  version: number;

  @ApiProperty({
    description: 'Parent quiz ID for versioning (UUID)',
    required: false,
  })
  parent_quiz_id?: string;

  @ApiProperty({
    description: 'Visibility setting',
    enum: ['public', 'section_only'],
    default: 'section_only',
  })
  visibility: string;

  @ApiProperty({
    description: 'Total questions in pool',
    required: false,
  })
  question_pool_size?: number;

  @ApiProperty({
    description: 'Questions to display per attempt',
    required: false,
  })
  questions_to_display?: number;

  @ApiProperty({ description: 'Allow retakes', default: false })
  allow_retakes: boolean;

  @ApiProperty({ description: 'Allow backtracking', default: true })
  allow_backtracking: boolean;

  @ApiProperty({ description: 'Shuffle questions', default: false })
  shuffle_questions: boolean;

  @ApiProperty({ description: 'Shuffle choices', default: false })
  shuffle_choices: boolean;

  @ApiProperty({ description: 'Total points', required: false })
  total_points?: number;

  @ApiProperty({ description: 'Passing score', required: false })
  passing_score?: number;

  @ApiProperty({ description: 'Created at timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Updated at timestamp' })
  updated_at: string;
}
