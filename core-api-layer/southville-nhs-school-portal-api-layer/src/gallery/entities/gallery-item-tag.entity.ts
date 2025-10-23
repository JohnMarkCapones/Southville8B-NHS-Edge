import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Gallery Item Tag Entity
 * Junction table linking gallery items to tags (many-to-many)
 */
export class GalleryItemTag {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Gallery item ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  item_id: string;

  @ApiProperty({
    description: 'Tag ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  tag_id: string;

  @ApiPropertyOptional({
    description: 'User ID who added the tag',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  created_by?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-03-01T10:00:00Z',
  })
  created_at: string;
}
