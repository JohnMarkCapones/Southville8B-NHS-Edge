import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
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
import { BulkImportResultDto } from './import-students-csv.dto';

export class CsvTeacherRowDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'Justin',
    description: 'First name',
  })
  first_name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'Rivero',
    description: 'Last name',
  })
  last_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiProperty({
    example: 'justin',
    description: 'Middle name',
    required: false,
  })
  middle_name?: string;

  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(80)
  @ApiProperty({
    example: 25,
    description: 'Age',
    required: false,
  })
  age?: number;

  @IsString()
  @ApiProperty({
    example: 'Math',
    description:
      'Subject specialization name (will lookup UUID from subjects table)',
  })
  subject_specialization_id: string;

  @IsString()
  @ApiProperty({
    example: 'Math',
    description: 'Department name (will lookup UUID from departments table)',
  })
  department_id: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Acacia',
    description:
      'Advisory section name (will lookup UUID from sections table, optional)',
    required: false,
  })
  advisory_section_id?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  @ApiProperty({
    example: 'justin.rivero@school.edu',
    description:
      'Email address (optional - will auto-generate if not provided)',
    required: false,
  })
  email?: string;

  @IsDateString()
  @ApiProperty({
    example: '2000-10-22',
    description: 'Birthday (YYYY-MM-DD format, used for password generation)',
  })
  birthday: string;
}

export class ImportTeachersCsvDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CsvTeacherRowDto)
  @ApiProperty({
    description: 'Array of teacher rows from CSV',
    type: [CsvTeacherRowDto],
  })
  teachers: CsvTeacherRowDto[];
}

// Re-export BulkImportResultDto for consistency
export { BulkImportResultDto };
