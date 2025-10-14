import { ApiProperty } from '@nestjs/swagger';

export enum GradingPeriod {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

export enum HonorStatus {
  NONE = 'None',
  WITH_HONORS = 'With Honors',
  WITH_HIGH_HONORS = 'With High Honors',
  WITH_HIGHEST_HONORS = 'With Highest Honors',
}

export class Gwa {
  @ApiProperty({ description: 'GWA record ID (UUID)' })
  id: string;

  @ApiProperty({ description: 'Student ID (UUID)' })
  student_id: string;

  @ApiProperty({
    description: 'General Weighted Average',
    example: 95.5,
    minimum: 50.0,
    maximum: 100.0,
  })
  gwa: number;

  @ApiProperty({
    description: 'Grading period',
    enum: GradingPeriod,
    example: GradingPeriod.Q1,
  })
  grading_period: GradingPeriod;

  @ApiProperty({
    description: 'School year',
    example: '2024-2025',
  })
  school_year: string;

  @ApiProperty({
    description: 'Remarks',
    required: false,
    example: 'Excellent Performance',
  })
  remarks?: string;

  @ApiProperty({
    description: 'Honor status',
    enum: HonorStatus,
    example: HonorStatus.WITH_HIGH_HONORS,
  })
  honor_status: HonorStatus;

  @ApiProperty({ description: 'Teacher who recorded this GWA (UUID)' })
  recorded_by: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: string;

  // Related data
  @ApiProperty({ description: 'Student information', required: false })
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    student_id: string;
    lrn_id: string;
    grade_level?: string;
    section?: {
      id: string;
      name: string;
      grade_level: string;
    };
  };

  @ApiProperty({
    description: 'Teacher who recorded this GWA',
    required: false,
  })
  teacher?: {
    id: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    advisory_section?: {
      id: string;
      name: string;
      grade_level: string;
    };
  };
}
