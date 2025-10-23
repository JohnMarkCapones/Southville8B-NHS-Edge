import { IsUUID, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkCreateRoomsDto {
  @IsUUID()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Floor ID',
  })
  floorId: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  @ApiProperty({
    example: 5,
    description: 'Number of rooms to create (max 100)',
    minimum: 1,
    maximum: 100,
  })
  count: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 30,
    description: 'Default capacity for all rooms',
    required: false,
    minimum: 0,
  })
  capacity?: number;
}
