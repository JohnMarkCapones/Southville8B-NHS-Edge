import { ApiProperty } from '@nestjs/swagger';

export class DepartmentInformation {
  @ApiProperty({
    description: 'Unique identifier for the department information',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the department this information belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  department_id: string;

  @ApiProperty({
    description: 'Name of the office',
    example: 'Registrar Office',
  })
  office_name: string;

  @ApiProperty({
    description: 'Contact person for the department',
    example: 'Dr. John Smith',
  })
  contact_person: string;

  @ApiProperty({
    description: 'Description of the department',
    example: 'Handles student registration and academic records',
  })
  description: string;

  @ApiProperty({
    description: 'Email address for contact',
    example: 'registrar@southville.edu.ph',
  })
  email: string;

  @ApiProperty({
    description: 'Contact number',
    example: '+63 2 1234 5678',
  })
  contact_number: string;

  @ApiProperty({
    description: 'Timestamp when the record was created',
    example: '2024-01-15T10:30:00Z',
  })
  created_at: Date;
}
