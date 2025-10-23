import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Gallery Download Entity
 * Tracks downloads for analytics (supports guest downloads via IP)
 */
export class GalleryDownload {
  @ApiProperty({
    description: 'Unique download record identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Gallery item ID that was downloaded',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  item_id: string;

  @ApiPropertyOptional({
    description: 'User ID who downloaded (null for guests)',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  user_id?: string;

  @ApiPropertyOptional({
    description: 'IP address (for guest tracking)',
    example: '192.168.1.1',
  })
  ip_address?: string;

  @ApiPropertyOptional({
    description: 'User agent string',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  user_agent?: string;

  @ApiProperty({
    description: 'Whether download was successful',
    example: true,
    default: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Download timestamp',
    example: '2024-03-15T14:30:00Z',
  })
  downloaded_at: string;
}

/**
 * Download statistics aggregation
 */
export class GalleryDownloadStats {
  @ApiProperty({
    description: 'Total number of downloads',
    example: 150,
  })
  total_downloads: number;

  @ApiProperty({
    description: 'Number of unique users who downloaded',
    example: 45,
  })
  unique_users: number;

  @ApiProperty({
    description: 'Success rate percentage',
    example: 98.5,
  })
  success_rate: number;

  @ApiPropertyOptional({
    description: 'Last download timestamp',
    example: '2024-03-20T10:15:00Z',
  })
  last_downloaded?: string;
}
