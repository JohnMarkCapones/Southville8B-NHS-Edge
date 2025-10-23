import { ApiProperty } from '@nestjs/swagger';
import { ImageType } from '../dto/create-location.dto';

export class Location {
  @ApiProperty({ description: 'Location ID (UUID)' })
  id: string;

  @ApiProperty({
    description: 'Location name',
    example: 'Main Library',
  })
  name: string;

  @ApiProperty({
    description: 'Location description',
    example: 'The main library building with study areas and computer labs',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Type of image for the location',
    enum: ImageType,
    example: ImageType.PANORAMIC,
  })
  image_type: ImageType;

  @ApiProperty({
    description: 'URL to the main location image',
    example:
      'https://project.supabase.co/storage/v1/object/public/locations/library-main.jpg',
    required: false,
  })
  image_url?: string;

  @ApiProperty({
    description: 'URL to the preview thumbnail image',
    example:
      'https://project.supabase.co/storage/v1/object/public/locations/library-preview.jpg',
    required: false,
  })
  preview_image_url?: string;

  @ApiProperty({ description: 'Created at timestamp' })
  created_at: string;

  // Virtual fields for related data
  @ApiProperty({
    description: 'Hotspots for this location',
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        label: { type: 'string' },
        x_position: { type: 'number' },
        y_position: { type: 'number' },
        link_to_location_id: { type: 'string', nullable: true },
        created_at: { type: 'string' },
      },
    },
  })
  hotspots?: Array<{
    id: string;
    label: string;
    x_position: number;
    y_position: number;
    link_to_location_id?: string;
    created_at: string;
  }>;
}
