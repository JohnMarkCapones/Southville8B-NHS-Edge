import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderRoomsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiProperty({
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    description: 'Array of room IDs in new order',
    type: [String],
  })
  roomIds: string[];
}
