import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsBoolean,
  MaxLength,
  Validate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateRangeValidConstraint } from './validators/is-date-range-valid.validator';

export class CreateAcademicCalendarDto {
  @ApiProperty({
    description: 'Academic year',
    example: '2024-2025',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  year: string;

  @ApiProperty({
    description: 'Month name',
    example: 'October',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  month_name: string;

  @ApiProperty({
    description: 'Academic term',
    example: 'First Term',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  term: string;

  @ApiProperty({
    description: 'Start date of the calendar period',
    example: '2024-10-01',
  })
  @IsDateString()
  start_date: string;

  @ApiProperty({
    description: 'End date of the calendar period',
    example: '2024-10-31',
  })
  @IsDateString()
  end_date: string;

  @ApiPropertyOptional({
    description: 'Description of the calendar period',
    example: 'First term of academic year 2024-2025',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether to automatically generate calendar days',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  auto_generate_days?: boolean = true;

  @Validate(IsDateRangeValidConstraint)
  private _dateRangeValidation?: any;
}
