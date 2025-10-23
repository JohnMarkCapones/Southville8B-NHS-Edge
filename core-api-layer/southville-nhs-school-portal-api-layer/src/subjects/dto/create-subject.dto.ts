import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsUUID,
  MinLength,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubjectDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'MATH-8A',
    description: 'Subject code (must be unique)',
    minLength: 2,
    maxLength: 50,
  })
  code: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @ApiProperty({
    example: 'Mathematics 8',
    description: 'Subject name',
    minLength: 2,
    maxLength: 255,
  })
  subject_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiProperty({
    example: 'Advanced mathematics course for grade 8 students',
    description: 'Subject description',
    required: false,
    maxLength: 1000,
  })
  description?: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Department ID',
    required: false,
  })
  department_id?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @ApiProperty({
    example: ['Grade 7', 'Grade 8'],
    description: 'Grade levels for this subject',
    type: [String],
  })
  grade_levels: string[];

  @IsOptional()
  @IsEnum(['active', 'inactive', 'archived'])
  @ApiProperty({
    example: 'inactive',
    description: 'Subject status',
    enum: ['active', 'inactive', 'archived'],
    required: false,
  })
  status?: 'active' | 'inactive' | 'archived';

  @IsOptional()
  @IsEnum(['public', 'students', 'restricted'])
  @ApiProperty({
    example: 'public',
    description: 'Subject visibility',
    enum: ['public', 'students', 'restricted'],
    required: false,
  })
  visibility?: 'public' | 'students' | 'restricted';
}