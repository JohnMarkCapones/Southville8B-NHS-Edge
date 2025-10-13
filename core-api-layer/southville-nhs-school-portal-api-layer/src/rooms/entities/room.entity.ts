import { ApiProperty } from '@nestjs/swagger';

export class Room {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Room ID',
  })
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Floor ID',
  })
  floorId: string;

  @ApiProperty({
    example: 'Room 101',
    description: 'Room name',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: '101',
    description: 'Room number (auto-generated: 101, 102, 103...)',
  })
  roomNumber: string;

  @ApiProperty({
    example: 30,
    description: 'Room capacity',
    required: false,
  })
  capacity?: number;

  @ApiProperty({
    example: 'Available',
    description: 'Room status',
    enum: ['Available', 'Occupied', 'Maintenance'],
  })
  status: string;

  @ApiProperty({
    example: 1,
    description: 'Display order for drag & drop',
    required: false,
  })
  displayOrder?: number;

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
    description: 'Floor information',
    required: false,
  })
  floor?: {
    id: string;
    name: string;
    number: number;
    building: {
      id: string;
      buildingName: string;
      code: string;
    };
  };

  @ApiProperty({
    description: 'Building information (through floor)',
    required: false,
  })
  building?: {
    id: string;
    buildingName: string;
    code: string;
  };
}
