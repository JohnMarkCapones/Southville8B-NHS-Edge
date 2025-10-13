import { IsUUID, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MoveRoomDto {
  @IsUUID()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Target floor ID',
  })
  targetFloorId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 1,
    description: 'Target position in the floor (for ordering)',
    required: false,
    minimum: 0,
  })
  targetPosition?: number;
}
