import {
  IsUUID,
  IsDateString,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsInt,
  Min,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCalendarDayDto {
  @ApiProperty({
    description: 'ID of the academic calendar this day belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  academic_calendar_id: string;

  @ApiProperty({
    description: 'Exact date (ISO 8601 date string, e.g., "2025-10-15")',
    example: '2025-10-15',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Day name (e.g., "Monday")',
    example: 'Monday',
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  day_of_week: string;

  @ApiProperty({
    description: 'Week number in the month (1–6)',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  week_number: number;

  @ApiPropertyOptional({
    description: 'True if Saturday or Sunday',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_weekend?: boolean = false;

  @ApiPropertyOptional({
    description: 'True if marked as a holiday',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_holiday?: boolean = false;

  @ApiPropertyOptional({
    description: 'True if today',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_current_day?: boolean = false;

  @ApiPropertyOptional({
    description: 'Optional marker icon (e.g., "⭐", "📌")',
    example: '⭐',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  marker_icon?: string;

  @ApiPropertyOptional({
    description: 'Optional highlight color (e.g., "red", "#FF0000")',
    example: 'red',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  marker_color?: string;

  @ApiPropertyOptional({
    description: 'Optional note or description for the day',
    example: 'No classes due to holiday',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
