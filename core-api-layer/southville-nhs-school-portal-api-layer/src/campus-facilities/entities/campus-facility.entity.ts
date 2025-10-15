import { ApiProperty } from '@nestjs/swagger';

export class CampusFacility {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Campus facility ID',
  })
  id: string;

  @ApiProperty({
    example: 'Library',
    description: 'Campus facility name',
  })
  name: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Image URL of the campus facility',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    example:
      'A modern library with extensive collection of books and digital resources',
    description: 'Description of the campus facility',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Creation timestamp',
  })
  createdAt: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Last update timestamp',
  })
  updatedAt: string;
}
