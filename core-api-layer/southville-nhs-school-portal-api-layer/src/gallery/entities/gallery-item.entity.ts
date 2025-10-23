import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Gallery Item Entity (Simplified - No Albums)
 * Represents an individual photo or video in the gallery
 */
export class GalleryItem {
  @ApiProperty({
    description: 'Unique item identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'R2 public URL for the file',
    example: 'https://bucket.r2.dev/gallery/abc123-photo.jpg',
  })
  file_url: string;

  @ApiProperty({
    description: 'Internal R2 storage key',
    example: 'gallery/abc123-photo.jpg',
  })
  r2_file_key: string;

  @ApiPropertyOptional({
    description: 'R2 public URL for thumbnail',
    example: 'https://bucket.r2.dev/gallery/thumbnails/abc123-photo_thumb.jpg',
  })
  thumbnail_url?: string;

  @ApiPropertyOptional({
    description: 'Internal R2 thumbnail key',
    example: 'gallery/thumbnails/abc123-photo_thumb.jpg',
  })
  r2_thumbnail_key?: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'student-presentation.jpg',
  })
  original_filename: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 2048576,
  })
  file_size_bytes: number;

  @ApiProperty({
    description: 'MIME type',
    example: 'image/jpeg',
  })
  mime_type: string;

  @ApiProperty({
    description: 'Media type',
    enum: ['image', 'video'],
    example: 'image',
  })
  media_type: string;

  @ApiPropertyOptional({
    description: 'Item title',
    example: 'Students presenting their robotics project',
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Item caption/description',
    example:
      'Grade 10 students showcasing their award-winning robotics innovation',
  })
  caption?: string;

  @ApiPropertyOptional({
    description: 'Accessibility alt text',
    example: 'Three students in lab coats standing next to a robotic arm',
  })
  alt_text?: string;

  @ApiProperty({
    description: 'Display order for sorting',
    example: 5,
    default: 0,
  })
  display_order: number;

  @ApiProperty({
    description: 'Whether this item is featured on homepage',
    example: false,
    default: false,
  })
  is_featured: boolean;

  @ApiPropertyOptional({
    description: 'Photographer name',
    example: 'John Doe',
  })
  photographer_name?: string;

  @ApiPropertyOptional({
    description: 'Photographer credit text',
    example: 'Photo by John Doe, School Journalism Club',
  })
  photographer_credit?: string;

  @ApiPropertyOptional({
    description: 'When photo/video was taken',
    example: '2024-03-15T14:30:00Z',
  })
  taken_at?: string;

  @ApiPropertyOptional({
    description: 'Where photo/video was taken',
    example: 'School Gymnasium',
  })
  location?: string;

  @ApiProperty({
    description: 'View count',
    example: 250,
    default: 0,
  })
  views_count: number;

  @ApiProperty({
    description: 'Download count',
    example: 15,
    default: 0,
  })
  downloads_count: number;

  @ApiProperty({
    description: 'User ID who uploaded the item',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  uploaded_by: string;

  @ApiPropertyOptional({
    description: 'User ID who last updated the item',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  updated_by?: string;

  @ApiPropertyOptional({
    description: 'User ID who deleted the item',
    example: '123e4567-e89b-12d3-a456-426614174004',
  })
  deleted_by?: string;

  @ApiProperty({
    description: 'Soft delete flag',
    example: false,
    default: false,
  })
  is_deleted: boolean;

  @ApiPropertyOptional({
    description: 'Deletion timestamp',
    example: '2024-03-20T15:30:00Z',
  })
  deleted_at?: string;

  @ApiProperty({
    description: 'Upload timestamp',
    example: '2024-03-01T10:00:00Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-03-15T14:30:00Z',
  })
  updated_at: string;
}

/**
 * Extended Gallery Item with nested details
 */
export class GalleryItemWithDetails extends GalleryItem {
  @ApiPropertyOptional({
    description: 'Uploader user information',
  })
  uploader?: {
    id: string;
    full_name: string;
    email: string;
  };

  @ApiPropertyOptional({
    description: 'Tags associated with this item',
    type: 'array',
  })
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
    color?: string;
  }>;
}
