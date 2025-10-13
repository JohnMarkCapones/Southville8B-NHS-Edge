import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'John',
    description: 'First name',
    minLength: 2,
    maxLength: 50,
  })
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
    minLength: 2,
    maxLength: 50,
  })
  lastName: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @ApiProperty({
    example: 'Michael',
    description: 'Middle name',
    required: false,
    minLength: 1,
    maxLength: 50,
  })
  middleName?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  @ApiProperty({
    example: 'STU-2024-001',
    description: 'Student ID',
    minLength: 5,
    maxLength: 20,
  })
  studentId: string;

  @IsString()
  @MinLength(10)
  @MaxLength(15)
  @ApiProperty({
    example: '123456789012',
    description: 'LRN ID (used as email: lrn_id@student.local)',
    minLength: 10,
    maxLength: 15,
  })
  lrnId: string;

  @IsDateString()
  @ApiProperty({
    example: '2008-05-15',
    description: 'Birthday',
    type: 'string',
    format: 'date',
  })
  birthday: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @ApiProperty({
    example: 'Grade 10',
    description: 'Grade level',
    minLength: 2,
    maxLength: 20,
  })
  gradeLevel: string;

  @IsNumber()
  @Min(2000)
  @Max(2030)
  @ApiProperty({
    example: 2024,
    description: 'Enrollment year',
    minimum: 2000,
    maximum: 2030,
  })
  enrollmentYear: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiProperty({
    example: 'Honor Student',
    description: 'Honor status',
    required: false,
    maxLength: 50,
  })
  honorStatus?: string;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(25)
  @ApiProperty({
    example: 16,
    description: 'Age',
    required: false,
    minimum: 5,
    maximum: 25,
  })
  age?: number;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    required: false,
    description: 'Section ID from sections table',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  sectionId?: string;
}
