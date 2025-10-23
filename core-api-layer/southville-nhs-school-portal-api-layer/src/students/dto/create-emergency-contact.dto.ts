import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmergencyContactDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({
    example: 'Maria Santos',
    description: 'Guardian/Emergency contact name',
    minLength: 2,
    maxLength: 100,
  })
  guardianName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'Mother',
    description: 'Relationship to student',
    minLength: 2,
    maxLength: 50,
  })
  relationship: string;

  @IsString()
  @MinLength(10)
  @MaxLength(20)
  @ApiProperty({
    example: '+639171234567',
    description: 'Phone number',
    minLength: 10,
    maxLength: 20,
  })
  phoneNumber: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  @ApiProperty({
    example: 'maria.santos@email.com',
    description: 'Email address',
    required: false,
    maxLength: 100,
  })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiProperty({
    example: '123 Main St, City',
    description: 'Address',
    required: false,
    maxLength: 500,
  })
  address?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Is this the primary contact?',
    required: false,
    default: false,
  })
  isPrimary?: boolean;
}
