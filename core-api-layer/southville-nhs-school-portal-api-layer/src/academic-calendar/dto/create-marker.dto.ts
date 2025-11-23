import {
  IsUUID,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsInt,
  Min,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMarkerDto {
  @ApiPropertyOptional({
    description: 'ID of the academic calendar this marker applies to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  academic_calendar_id?: string;

  @ApiPropertyOptional({
    description: 'ID of the specific calendar day this marker applies to',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  academic_calendar_day_id?: number;

  @ApiProperty({
    description: 'Color of the marker dot (e.g., "red", "#FF0000")',
    example: 'red',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  color: string;

  @ApiPropertyOptional({
    description: 'Optional icon or symbol (e.g., "🎉", "📚")',
    example: '🎉',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({
    description: 'Short text label for marker',
    example: 'Holiday',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @ApiPropertyOptional({
    description: 'Order to display if multiple markers exist',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order_priority?: number = 0;
}
