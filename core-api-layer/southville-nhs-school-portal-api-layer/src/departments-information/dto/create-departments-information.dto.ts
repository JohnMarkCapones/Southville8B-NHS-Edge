import {
  IsString,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentsInformationDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Department ID from departments table',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  departmentId: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    description: 'Office name',
    example: 'Main Office',
    required: false,
    maxLength: 255,
  })
  officeName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    description: 'Contact person name',
    example: 'John Smith',
    required: false,
    maxLength: 255,
  })
  contactPerson?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @ApiProperty({
    description: 'Department description',
    example: 'Handles student enrollment and academic records',
    required: false,
    maxLength: 2000,
  })
  description?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  @ApiProperty({
    description: 'Contact email address',
    example: 'contact@school.edu',
    required: false,
    maxLength: 255,
  })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(16)
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Contact number must be a valid international format',
  })
  @ApiProperty({
    description: 'Contact phone number in international format',
    example: '+1234567890',
    required: false,
    minLength: 7,
    maxLength: 16,
  })
  contactNumber?: string;
}
