import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  IsDateString,
  IsEnum,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

/**
 * DTO for updating gallery item metadata
 */
export class UpdateItemDto {
  @ApiPropertyOptional({
    description: 'Item title',
    example: 'Science Fair Winners 2024',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Item caption/description',
    example: 'Students showcasing their innovative projects',
  })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({
    description: 'Alt text for accessibility',
    example: 'Students standing with science fair trophies',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  alt_text?: string;

  @ApiPropertyOptional({
    description: 'Display order for sorting',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  display_order?: number;

  @ApiPropertyOptional({
    description: 'Is this item featured on homepage',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @ApiPropertyOptional({
    description: "Photographer's name",
    example: 'John Smith',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  photographer_name?: string;

  @ApiPropertyOptional({
    description: 'Photographer credit text',
    example: 'Photo by John Smith',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  photographer_credit?: string;

  @ApiPropertyOptional({
    description: 'When the photo/video was taken',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  taken_at?: string;

  @ApiPropertyOptional({
    description: 'Location where photo/video was taken',
    example: 'Science Laboratory Building',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;
}
