import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsEnum,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GradingPeriod } from '../entities/gwa.entity';

export class CreateGwaDto {
  @IsUUID()
  @ApiProperty({
    description: 'Student ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  studentId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(50.0)
  @Max(100.0)
  @ApiProperty({
    description: 'General Weighted Average (50.00 - 100.00)',
    example: 95.5,
    minimum: 50.0,
    maximum: 100.0,
  })
  gwa: number;

  @IsEnum(GradingPeriod)
  @ApiProperty({
    description: 'Grading period',
    enum: GradingPeriod,
    example: GradingPeriod.Q1,
  })
  gradingPeriod: GradingPeriod;

  @IsString()
  @Matches(/^\d{4}-\d{4}$/, {
    message: 'School year must be in format YYYY-YYYY (e.g., 2024-2025)',
  })
  @ApiProperty({
    description: 'School year in YYYY-YYYY format',
    example: '2024-2025',
    pattern: '^\\d{4}-\\d{4}$',
  })
  schoolYear: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @ApiProperty({
    description: 'Remarks (optional)',
    required: false,
    example: 'Excellent Performance',
    minLength: 1,
    maxLength: 100,
  })
  remarks?: string;
}
