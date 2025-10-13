import { ApiProperty } from '@nestjs/swagger';

export class Teacher {
  @ApiProperty({ description: 'Teacher ID (UUID)' })
  id: string;

  @ApiProperty({ description: 'User ID (UUID)' })
  user_id: string;

  @ApiProperty({ description: 'First name' })
  first_name: string;

  @ApiProperty({ description: 'Last name' })
  last_name: string;

  @ApiProperty({ description: 'Middle name', required: false })
  middle_name?: string;

  @ApiProperty({ description: 'Age', required: false })
  age?: number;

  @ApiProperty({ description: 'Birthday', required: false })
  birthday?: string;

  @ApiProperty({ description: 'Subject specialization ID', required: false })
  subject_specialization_id?: string;

  @ApiProperty({ description: 'Department ID', required: false })
  department_id?: string;

  @ApiProperty({ description: 'Advisory section ID', required: false })
  advisory_section_id?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: string;

  // Related data
  @ApiProperty({ description: 'Subject specialization', required: false })
  subject_specialization?: {
    id: string;
    subject_name: string;
  };

  @ApiProperty({ description: 'Department', required: false })
  department?: {
    id: string;
    department_name: string;
  };

  @ApiProperty({ description: 'Advisory section', required: false })
  advisory_section?: {
    id: string;
    name: string;
    grade_level: string;
  };
}
