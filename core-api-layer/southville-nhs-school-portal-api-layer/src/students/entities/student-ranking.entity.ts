import { ApiProperty } from '@nestjs/swagger';

export class StudentRanking {
  @ApiProperty({ description: 'Ranking ID (UUID)' })
  id: string;

  @ApiProperty({ description: 'Student ID (UUID)' })
  student_id: string;

  @ApiProperty({ description: 'Grade level', example: 'Grade 7' })
  grade_level: string;

  @ApiProperty({ description: 'Student rank (1-100)', example: 15 })
  rank: number;

  @ApiProperty({
    description: 'Honor status',
    example: 'With High Honors',
    required: false,
  })
  honor_status?: string;

  @ApiProperty({ description: 'Academic quarter', example: 'Q1' })
  quarter: string;

  @ApiProperty({ description: 'School year', example: '2024-2025' })
  school_year: string;

  @ApiProperty({ description: 'Created at timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Updated at timestamp' })
  updated_at: string;

  // Related data
  @ApiProperty({
    description: 'Student information',
    required: false,
  })
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    student_id: string;
    grade_level: string;
  };
}
