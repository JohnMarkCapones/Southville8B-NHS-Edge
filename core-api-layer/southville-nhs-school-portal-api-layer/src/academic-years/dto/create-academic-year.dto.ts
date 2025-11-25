import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUUID,
  MaxLength,
  Validate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateRangeValidConstraint } from './validators/is-date-range-valid.validator';

export class CreateAcademicYearDto {
  @ApiProperty({
    description: 'Academic year name',
    example: '2024-2025',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  year_name: string;

  @ApiProperty({
    description: 'Start date of the academic year',
    example: '2024-08-15',
  })
  @IsDateString()
  start_date: string;

  @ApiProperty({
    description: 'End date of the academic year',
    example: '2025-05-30',
  })
  @IsDateString()
  end_date: string;

  @ApiProperty({
    description: 'Academic year structure - always quarters',
    example: 'quarters',
    enum: ['quarters'],
    default: 'quarters',
  })
  @IsEnum(['quarters'])
  structure: 'quarters' = 'quarters';

  @ApiPropertyOptional({
    description: 'Whether this academic year is active',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = false;

  @ApiPropertyOptional({
    description: 'Description of the academic year',
    example: 'Academic Year 2024-2025 - Standard Quarter System',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Template ID to use for generating periods',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => (value === '' ? undefined : value))
  template_id?: string;

  @ApiPropertyOptional({
    description: 'Whether to automatically generate periods from template',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  auto_generate_periods?: boolean = true;

  @Validate(IsDateRangeValidConstraint)
  private _dateRangeValidation?: any;
}

export class CreateAcademicPeriodDto {
  @ApiProperty({
    description: 'Academic year ID',
    example: 'uuid-string',
  })
  @IsUUID()
  academic_year_id: string;

  @ApiProperty({
    description: 'Period name',
    example: '1st Quarter',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  period_name: string;

  @ApiProperty({
    description: 'Period order within the academic year',
    example: 1,
  })
  @IsNotEmpty()
  period_order: number;

  @ApiProperty({
    description: 'Start date of the period',
    example: '2024-08-15',
  })
  @IsDateString()
  start_date: string;

  @ApiProperty({
    description: 'End date of the period',
    example: '2024-10-31',
  })
  @IsDateString()
  end_date: string;

  @ApiPropertyOptional({
    description: 'Whether this is a grading period',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_grading_period?: boolean = true;

  @ApiPropertyOptional({
    description: 'Weight of this period (0.0 to 1.0)',
    example: 0.25,
    default: 1.0,
  })
  @IsOptional()
  weight?: number = 1.0;

  @ApiPropertyOptional({
    description: 'Description of the period',
    example: 'First quarter of the academic year',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @Validate(IsDateRangeValidConstraint)
  private _dateRangeValidation?: any;
}
