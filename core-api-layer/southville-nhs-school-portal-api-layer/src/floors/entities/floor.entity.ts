import { ApiProperty } from '@nestjs/swagger';

export class Floor {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Floor ID',
  })
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Building ID',
  })
  buildingId: string;

  @ApiProperty({
    example: 'Ground Floor',
    description: 'Floor name',
  })
  name: string;

  @ApiProperty({
    example: 1,
    description: 'Floor number',
  })
  number: number;

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

  // Relations
  @ApiProperty({
    description: 'Building information',
    required: false,
  })
  building?: {
    id: string;
    buildingName: string;
    code: string;
  };

  @ApiProperty({
    description: 'Rooms on this floor',
    required: false,
  })
  rooms?: Array<{
    id: string;
    roomNumber: string;
    name: string;
    capacity: number;
    status: string;
  }>;
}
