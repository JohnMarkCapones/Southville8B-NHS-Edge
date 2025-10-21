import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsArray,
  ValidateNested,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CsvStudentRowDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({
    example: 'Liam Alexander Santos',
    description: 'Full name of the student',
  })
  full_name: string;

  @IsString()
  @ApiProperty({
    example: 'Student',
    description: 'Role (should be Student)',
  })
  role: string;

  @IsString()
  @ApiProperty({
    example: 'Active',
    description: 'Status (Active, Transferred, etc.)',
  })
  status: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'Liam',
    description: 'First name',
  })
  first_name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'Santos',
    description: 'Last name',
  })
  last_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiProperty({
    example: 'Alexander',
    description: 'Middle name',
    required: false,
  })
  middle_name?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  @ApiProperty({
    example: 'STU-1000',
    description: 'Student ID (not used for import, only LRN)',
  })
  student_id: string;

  @IsString()
  @MinLength(5)
  @MaxLength(15)
  @ApiProperty({
    example: 'LRN-9000',
    description: 'LRN ID (used for email generation)',
  })
  lrn_id: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @ApiProperty({
    example: 'Grade 8',
    description: 'Grade level',
  })
  grade_level: string;

  @IsNumber()
  @Min(2000)
  @Max(2030)
  @ApiProperty({
    example: 2023,
    description: 'Enrollment year',
  })
  enrollment: number;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'Sampaguita',
    description: 'Section name',
  })
  section: string;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(25)
  @ApiProperty({
    example: 13,
    description: 'Age',
    required: false,
  })
  age?: number;

  @IsDateString()
  @ApiProperty({
    example: '2008-11-04',
    description: 'Birthday (YYYY-MM-DD)',
  })
  birthday: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({
    example: 'Emma Hernandez',
    description: 'Guardian name',
  })
  guardian_name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'Mother',
    description: 'Relationship to student',
  })
  relationship: string;

  @IsString()
  @MinLength(10)
  @MaxLength(20)
  @ApiProperty({
    example: '6.39439E+11',
    description: 'Phone number (can be in scientific notation)',
  })
  phone_number: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  @ApiProperty({
    example: 'emmahernandez@gmail.com',
    description: 'Guardian email',
    required: false,
  })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiProperty({
    example: 'Unit 18, Pine Road, Barangay 5, Pasay',
    description: 'Address',
    required: false,
  })
  address?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Is this the primary guardian?',
    required: false,
  })
  is_primary?: boolean;
}

export class ImportStudentsCsvDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CsvStudentRowDto)
  @ApiProperty({
    description: 'Array of student rows from CSV',
    type: [CsvStudentRowDto],
  })
  students: CsvStudentRowDto[];
}

export class BulkImportResultDto {
  @ApiProperty({
    description: 'Number of successfully imported students',
    example: 25,
  })
  success: number;

  @ApiProperty({
    description: 'Number of failed imports',
    example: 2,
  })
  failed: number;

  @ApiProperty({
    description: 'Successfully imported student details',
    type: 'array',
  })
  results: any[];

  @ApiProperty({
    description: 'Failed import details with error messages',
    type: 'array',
  })
  errors: any[];
}
