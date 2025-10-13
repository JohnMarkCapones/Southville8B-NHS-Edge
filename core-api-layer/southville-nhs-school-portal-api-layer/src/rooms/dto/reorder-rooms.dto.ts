import { IsArray, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderRoomsDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @ApiProperty({
    example: [1, 2, 3, 4, 5],
    description: 'Array of room IDs in new order',
    type: [String],
  })
  roomIds: string[];
}
