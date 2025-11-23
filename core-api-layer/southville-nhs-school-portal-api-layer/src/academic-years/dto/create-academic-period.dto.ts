import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsUUID,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import { IsDateRangeValidConstraint } from './validators/is-date-range-valid.validator';

export class CreateAcademicPeriodDto {
  @ApiProperty({
    description: 'ID of the academic year this period belongs to',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  academicYearId: string;

  @ApiProperty({
    description: 'Name of the academic period (e.g., "1st Quarter")',
    example: '1st Quarter',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  periodName: string;

  @ApiProperty({
    description: 'Order of the period within the academic year (0-indexed)',
    example: 0,
  })
  @IsNumber()
  @Min(0)
  periodOrder: number;

  @ApiProperty({
    description: 'Start date of the academic period',
    example: '2024-08-15',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date of the academic period',
    example: '2024-10-31',
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Whether this period is a grading period',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isGradingPeriod?: boolean;

  @ApiPropertyOptional({
    description:
      'Weight of this period for overall academic year calculation (0.00 - 1.00)',
    example: 0.25,
    default: 1.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Description of the academic period',
    example: 'First quarter of the academic year',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @Validate(IsDateRangeValidConstraint)
  private _dateRangeValidation?: any;
}
