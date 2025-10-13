import { ApiProperty } from '@nestjs/swagger';

export class Building {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Building ID',
  })
  id: string;

  @ApiProperty({
    example: 'Main Campus Building',
    description: 'Building name',
  })
  buildingName: string;

  @ApiProperty({
    example: 'MCB',
    description: 'Building code',
  })
  code: string;

  @ApiProperty({
    example: 1000,
    description: 'Building capacity',
    required: false,
  })
  capacity?: number;

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
    description: 'Floors in this building',
    required: false,
  })
  floors?: Array<{
    id: string;
    name: string;
    number: number;
    roomsCount?: number;
  }>;

  @ApiProperty({
    description: 'Building statistics',
    required: false,
  })
  stats?: {
    totalFloors: number;
    totalRooms: number;
    totalCapacity: number;
    utilizationRate: number;
  };
}
