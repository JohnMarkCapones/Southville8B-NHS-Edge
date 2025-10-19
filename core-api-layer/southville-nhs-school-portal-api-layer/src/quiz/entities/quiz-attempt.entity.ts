import { ApiProperty } from '@nestjs/swagger';

export class QuizAttempt {
  @ApiProperty({ description: 'Attempt ID (UUID)' })
  attempt_id: string;

  @ApiProperty({ description: 'Quiz ID (UUID)' })
  quiz_id: string;

  @ApiProperty({ description: 'Student ID (UUID)' })
  student_id: string;

  @ApiProperty({ description: 'Attempt number' })
  attempt_number: number;

  @ApiProperty({ description: 'Score achieved', required: false })
  score?: number;

  @ApiProperty({ description: 'Maximum possible score', required: false })
  max_possible_score?: number;

  @ApiProperty({
    description: 'Attempt status',
    enum: ['in_progress', 'submitted', 'graded', 'terminated'],
    default: 'in_progress',
  })
  status: string;

  @ApiProperty({
    description: 'Was terminated by teacher',
    default: false,
  })
  terminated_by_teacher: boolean;

  @ApiProperty({
    description: 'Termination reason',
    required: false,
  })
  termination_reason?: string;

  @ApiProperty({ description: 'Started at timestamp' })
  started_at: string;

  @ApiProperty({ description: 'Submitted at timestamp', required: false })
  submitted_at?: string;

  @ApiProperty({
    description: 'Time taken in seconds',
    required: false,
  })
  time_taken_seconds?: number;

  @ApiProperty({
    description: 'Questions shown (array of UUIDs)',
    type: [String],
    required: false,
  })
  questions_shown?: string[];

  @ApiProperty({ description: 'Created at timestamp' })
  created_at: string;
}
