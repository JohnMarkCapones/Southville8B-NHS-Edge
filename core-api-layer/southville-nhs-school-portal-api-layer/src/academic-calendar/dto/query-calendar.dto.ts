import {
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class QueryCalendarDto {
  @ApiPropertyOptional({
    description: 'Filter by academic year (e.g., "2024-2025")',
    example: '2024-2025',
  })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiPropertyOptional({
    description: 'Filter by month name (e.g., "October")',
    example: 'October',
  })
  @IsOptional()
  @IsString()
  month_name?: string;

  @ApiPropertyOptional({
    description: 'Filter by term (e.g., "First Term")',
    example: 'First Term',
  })
  @IsOptional()
  @IsString()
  term?: string;

  @ApiPropertyOptional({
    description:
      'Filter calendars that include this date (ISO 8601 date string)',
    example: '2024-10-15',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Include calendar days in the response',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(
    ({ value }) => value === true || String(value).toLowerCase() === 'true',
  )
  includeDays?: boolean = false;

  @ApiPropertyOptional({
    description: 'Include calendar markers in the response',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(
    ({ value }) => value === true || String(value).toLowerCase() === 'true',
  )
  includeMarkers?: boolean = false;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'start_date',
    enum: [
      'year',
      'month_name',
      'term',
      'start_date',
      'end_date',
      'created_at',
    ],
    default: 'start_date',
  })
  @IsOptional()
  @IsString()
  @IsIn(['year', 'month_name', 'term', 'start_date', 'end_date', 'created_at'])
  sortBy?:
    | 'year'
    | 'month_name'
    | 'term'
    | 'start_date'
    | 'end_date'
    | 'created_at' = 'start_date';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
    default: 'ASC',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  @Transform(({ value }) => String(value || 'ASC').toUpperCase())
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
