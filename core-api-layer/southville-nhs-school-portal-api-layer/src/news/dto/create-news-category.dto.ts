import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a news category
 * Only Advisers can create categories
 */
export class CreateNewsCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Technology',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Technology and innovation news',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
