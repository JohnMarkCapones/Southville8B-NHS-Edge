import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for adding a co-author to an article
 * Co-author can be any name (internal or external contributor)
 */
export class AddCoAuthorDto {
  @ApiProperty({
    description:
      'Name of the co-author (can be internal user or external contributor)',
    example: 'John Smith',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  coAuthorName: string;

  @ApiPropertyOptional({
    description: 'Role of the co-author in this article',
    example: 'co-author',
    enum: ['co-author', 'editor', 'contributor'],
    default: 'co-author',
  })
  @IsOptional()
  @IsEnum(['co-author', 'editor', 'contributor'])
  role?: 'co-author' | 'editor' | 'contributor';
}
