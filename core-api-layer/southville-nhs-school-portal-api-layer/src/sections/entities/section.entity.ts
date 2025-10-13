import { ApiProperty } from '@nestjs/swagger';

export class Section {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Section ID',
  })
  id: string;

  @ApiProperty({
    example: 'Section A',
    description: 'Section name',
  })
  name: string;

  @ApiProperty({
    example: 'Grade 10',
    description: 'Grade level',
    required: false,
  })
  gradeLevel?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Teacher ID (foreign key to users table)',
    required: false,
  })
  teacherId?: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Creation timestamp',
  })
  createdAt: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Last update timestamp',
  })
  updatedAt: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Room ID',
    required: false,
  })
  roomId?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Building ID',
    required: false,
  })
  buildingId?: string;

  // Relations
  @ApiProperty({
    description: 'Teacher information',
    required: false,
  })
  teacher?: {
    id: string;
    fullName: string;
    email: string;
  };

  @ApiProperty({
    description: 'Students in this section',
    required: false,
  })
  students?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    studentId: string;
  }>;
}
