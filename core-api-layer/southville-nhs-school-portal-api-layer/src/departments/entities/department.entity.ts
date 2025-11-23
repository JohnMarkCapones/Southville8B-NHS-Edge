import { ApiProperty } from '@nestjs/swagger';

export class Department {
  @ApiProperty({
    description: 'Department UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Department name',
    example: 'Information Technology',
  })
  department_name: string;

  @ApiProperty({
    description: 'Department description',
    required: false,
    example: 'Manages all IT-related curriculum and programs',
  })
  description?: string;

  @ApiProperty({
    description: 'Teacher ID who heads the department',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  head_id?: string;

  @ApiProperty({
    description: 'Active status',
    default: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: 'Created timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Updated timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  updated_at: Date;

  // Join relations
  @ApiProperty({
    description: 'Department head details',
    required: false,
  })
  head?: any;
}
