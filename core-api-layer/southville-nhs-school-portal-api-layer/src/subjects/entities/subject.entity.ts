import { ApiProperty } from '@nestjs/swagger';

export class Subject {
  @ApiProperty({
    description: 'Subject UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Subject name',
    example: 'Advanced Mathematics',
  })
  subject_name: string;

  @ApiProperty({
    description: 'Subject description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Grade level',
    required: false,
    example: 10,
  })
  grade_level?: number;

  @ApiProperty({
    description: 'Department ID',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  department_id?: string;

  @ApiProperty({
    description: 'Color hex code',
    required: false,
    example: '#3B82F6',
  })
  color_hex?: string;

  @ApiProperty({
    description: 'Created timestamp',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Updated timestamp',
  })
  updated_at: Date;

  // Join relation
  @ApiProperty({
    description: 'Department details',
    required: false,
  })
  department?: any;
}
