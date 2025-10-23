import {
  IsString,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  MaxLength,
  IsObject,
  IsArray,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNewsDto {
  @ApiProperty({
    description: 'Article title',
    example: 'Science Fair Champions Announced',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description:
      'Article description/excerpt (auto-generated from content if empty)',
    example:
      "Congratulations to all participants in this year's science fair competition",
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description:
      'Article content in ProseMirror JSON format (from Tiptap editor)',
    example: { type: 'doc', content: [] },
  })
  @IsObject()
  @IsNotEmpty()
  articleJson: object;

  @ApiProperty({
    description: 'Article content in rendered HTML format (from Tiptap editor)',
    example: '<p>Full article content here...</p>',
  })
  @IsString()
  @IsNotEmpty()
  articleHtml: string;

  @ApiPropertyOptional({
    description: 'Category ID',
    example: 'b9a9b3e4-5c5f-47b7-8ad5-89f09f0e1234',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: "Tags (will be auto-created if they don't exist)",
    example: ['science', 'competition', 'students'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Article visibility',
    example: 'public',
    enum: ['public', 'students', 'teachers', 'private'],
    default: 'public',
  })
  @IsOptional()
  @IsEnum(['public', 'students', 'teachers', 'private'])
  visibility?: 'public' | 'students' | 'teachers' | 'private';

  @ApiPropertyOptional({
    description: 'Scheduled publish date (for future publication)',
    example: '2025-01-01T09:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({
    description: 'Co-author user IDs (must be journalism members)',
    example: ['e1caec49-f61d-4158-bac7-1dd456e9976b'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  coAuthorIds?: string[];

  @ApiPropertyOptional({
    description:
      'Featured image URL (from R2 storage, optional if article has images)',
    example: 'https://r2.../news/featured/abc123.jpg',
  })
  @IsOptional()
  @IsString()
  featuredImageUrl?: string;

  @ApiPropertyOptional({
    description: 'R2 storage key for featured image',
    example: 'news/featured/abc123.jpg',
  })
  @IsOptional()
  @IsString()
  r2FeaturedImageKey?: string;
}
