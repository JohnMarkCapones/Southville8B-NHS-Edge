import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsValidSlug } from './validators/is-valid-slug.validator';

export class CreateTagDto {
  @ApiProperty({
    description: 'Tag name',
    example: 'Science Fair',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug (auto-generated from name if not provided)',
    example: 'science-fair',
  })
  @IsString()
  @IsOptional()
  @IsValidSlug()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Tag description',
    example: 'Photos from annual science fair events',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'UI color for tag display (hex color or preset name)',
    example: '#3B82F6',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  color?: string;
}
