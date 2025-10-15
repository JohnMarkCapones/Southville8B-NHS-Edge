import { ApiProperty } from '@nestjs/swagger';
import { EmergencyContact } from './emergency-contact.entity';

export class Student {
  @ApiProperty({ description: 'Student ID (UUID)' })
  id: string;

  @ApiProperty({ description: 'User ID (UUID)' })
  user_id: string;

  @ApiProperty({ description: 'First name' })
  first_name: string;

  @ApiProperty({ description: 'Last name' })
  last_name: string;

  @ApiProperty({ description: 'Middle name', required: false })
  middle_name?: string;

  @ApiProperty({ description: 'Student ID' })
  student_id: string;

  @ApiProperty({ description: 'LRN ID' })
  lrn_id: string;

  @ApiProperty({ description: 'Grade level', required: false })
  grade_level?: string;

  @ApiProperty({ description: 'Enrollment year', required: false })
  enrollment_year?: number;

  @ApiProperty({ description: 'Honor status', required: false })
  honor_status?: string;

  @ApiProperty({ description: 'Rank', required: false })
  rank?: number;

  @ApiProperty({ description: 'Section ID', required: false })
  section_id?: string;

  @ApiProperty({ description: 'Age', required: false })
  age?: number;

  @ApiProperty({ description: 'Birthday', required: false })
  birthday?: string;

  // Related data
  @ApiProperty({ description: 'Section', required: false })
  section?: {
    id: string;
    name: string;
    grade_level: string;
  };

  @ApiProperty({ description: 'User data', required: false })
  user?: {
    id: string;
    email: string;
    full_name: string;
    status: string;
  };

  @ApiProperty({
    description: 'Emergency contacts',
    type: [EmergencyContact],
    required: false,
  })
  emergencyContacts?: EmergencyContact[];
}
