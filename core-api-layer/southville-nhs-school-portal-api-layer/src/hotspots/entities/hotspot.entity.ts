import { ApiProperty } from '@nestjs/swagger';

export class Hotspot {
  @ApiProperty({ description: 'Hotspot ID (UUID)' })
  id: string;

  @ApiProperty({
    description: 'Location ID where this hotspot belongs',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  location_id: string;

  @ApiProperty({
    description: 'Hotspot label/name',
    example: 'Library Entrance',
  })
  label: string;

  @ApiProperty({
    description: 'X position as percentage (0-100)',
    example: 45.5,
  })
  x_position: number;

  @ApiProperty({
    description: 'Y position as percentage (0-100)',
    example: 32.8,
  })
  y_position: number;

  @ApiProperty({
    description: 'ID of location to link to (for tour navigation)',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  link_to_location_id?: string;

  @ApiProperty({ description: 'Created at timestamp' })
  created_at: string;

  // Virtual fields for related data
  @ApiProperty({
    description: 'Location where this hotspot belongs',
    required: false,
  })
  location?: {
    id: string;
    name: string;
    image_type: string;
    preview_image_url?: string;
  };

  @ApiProperty({
    description: 'Linked location for tour navigation',
    required: false,
  })
  linked_location?: {
    id: string;
    name: string;
    image_type: string;
    preview_image_url?: string;
  };
}
