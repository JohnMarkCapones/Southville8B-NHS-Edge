import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Gallery View Entity
 * Tracks album/item views for analytics
 */
export class GalleryView {
  @ApiProperty({
    description: 'Unique view record identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Type of entity viewed',
    enum: ['album', 'item'],
    example: 'album',
  })
  viewable_type: string;

  @ApiProperty({
    description: 'ID of the entity viewed (album or item)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  viewable_id: string;

  @ApiPropertyOptional({
    description: 'User ID who viewed (null for guests)',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  user_id?: string;

  @ApiPropertyOptional({
    description: 'IP address (for guest tracking)',
    example: '192.168.1.1',
  })
  ip_address?: string;

  @ApiProperty({
    description: 'View timestamp',
    example: '2024-03-15T14:30:00Z',
  })
  viewed_at: string;
}

/**
 * View statistics aggregation
 */
export class GalleryViewStats {
  @ApiProperty({
    description: 'Total number of views',
    example: 1250,
  })
  total_views: number;

  @ApiProperty({
    description: 'Number of unique viewers',
    example: 320,
  })
  unique_viewers: number;

  @ApiPropertyOptional({
    description: 'Last view timestamp',
    example: '2024-03-20T10:15:00Z',
  })
  last_viewed?: string;

  @ApiPropertyOptional({
    description: 'Views in last 24 hours',
    example: 45,
  })
  views_last_24h?: number;

  @ApiPropertyOptional({
    description: 'Views in last 7 days',
    example: 230,
  })
  views_last_7d?: number;
}
