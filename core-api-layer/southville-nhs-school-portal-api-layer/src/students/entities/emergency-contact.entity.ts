import { ApiProperty } from '@nestjs/swagger';

export class EmergencyContact {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Emergency contact ID',
  })
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Student user ID',
  })
  studentId: string;

  @ApiProperty({
    example: 'Maria Santos',
    description: 'Guardian name',
  })
  guardianName: string;

  @ApiProperty({
    example: 'Mother',
    description: 'Relationship',
  })
  relationship: string;

  @ApiProperty({
    example: '+639171234567',
    description: 'Phone number',
  })
  phoneNumber: string;

  @ApiProperty({
    example: 'maria@email.com',
    description: 'Email',
    required: false,
  })
  email?: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'Address',
    required: false,
  })
  address?: string;

  @ApiProperty({
    example: true,
    description: 'Is primary contact',
  })
  isPrimary: boolean;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Created timestamp',
  })
  createdAt: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Updated timestamp',
  })
  updatedAt: string;
}
