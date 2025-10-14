import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsString,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { GradingPeriod } from '../entities/gwa.entity';

export class QueryGwaDto {
  @IsOptional()
  @IsUUID()
  @ApiProperty({
    description: 'Filter by student ID',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  studentId?: string;

  @IsOptional()
  @IsEnum(GradingPeriod)
  @ApiProperty({
    description: 'Filter by grading period',
    required: false,
    enum: GradingPeriod,
    example: GradingPeriod.Q1,
  })
  gradingPeriod?: GradingPeriod;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{4}$/, {
    message: 'School year must be in format YYYY-YYYY (e.g., 2024-2025)',
  })
  @ApiProperty({
    description: 'Filter by school year',
    required: false,
    example: '2024-2025',
    pattern: '^\\d{4}-\\d{4}$',
  })
  schoolYear?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    example: 1,
    minimum: 1,
    maximum: 100,
  })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Sort by field',
    required: false,
    example: 'created_at',
    enum: ['created_at', 'updated_at', 'gwa', 'grading_period', 'school_year'],
  })
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Sort order',
    required: false,
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  sortOrder?: 'asc' | 'desc' = 'desc';
}
