import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateItemDto {
  @ApiPropertyOptional({
    description: 'Item title',
    example: 'Students presenting robotics project',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Item caption/description',
    example: 'Grade 10 students showcasing their award-winning innovation',
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  caption?: string;

  @ApiPropertyOptional({
    description: 'Accessibility alt text for screen readers',
    example: 'Three students in lab coats standing next to a robotic arm',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  alt_text?: string;

  @ApiPropertyOptional({
    description: 'Display order for sorting',
    example: 0,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return parseInt(value, 10);
    return value;
  })
  display_order?: number = 0;

  @ApiPropertyOptional({
    description: 'Mark as featured on homepage',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value === 'true';
    return value;
  })
  is_featured?: boolean = false;

  @ApiPropertyOptional({
    description: 'Photographer name',
    example: 'John Doe',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  photographer_name?: string;

  @ApiPropertyOptional({
    description: 'Photographer credit text',
    example: 'Photo by John Doe, School Journalism Club',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  photographer_credit?: string;

  @ApiPropertyOptional({
    description: 'When photo/video was taken',
    example: '2024-03-15T14:30:00Z',
  })
  @IsDateString()
  @IsOptional()
  taken_at?: string;

  @ApiPropertyOptional({
    description: 'Where photo/video was taken',
    example: 'School Gymnasium',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;
}
