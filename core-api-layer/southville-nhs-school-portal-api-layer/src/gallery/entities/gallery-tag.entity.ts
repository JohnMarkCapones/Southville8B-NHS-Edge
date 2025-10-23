import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Gallery Tag Entity
 * Represents a reusable tag for categorizing gallery items
 */
export class GalleryTag {
  @ApiProperty({
    description: 'Unique tag identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Tag name',
    example: 'Science Fair',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'science-fair',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Tag description',
    example: 'Photos from science fair events',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'UI color for tag display',
    example: '#3B82F6',
  })
  color?: string;

  @ApiProperty({
    description: 'Number of items with this tag',
    example: 45,
    default: 0,
  })
  usage_count: number;

  @ApiPropertyOptional({
    description: 'User ID who created the tag',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  created_by?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-03-01T10:00:00Z',
  })
  created_at: string;
}
