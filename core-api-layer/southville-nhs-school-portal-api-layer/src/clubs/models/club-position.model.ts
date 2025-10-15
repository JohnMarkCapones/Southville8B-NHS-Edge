import { ApiProperty } from '@nestjs/swagger';

export class ClubPosition {
  @ApiProperty({ description: 'Position ID' })
  id: string;

  @ApiProperty({ description: 'Position name' })
  name: string;

  @ApiProperty({ description: 'Position description' })
  description?: string;

  @ApiProperty({ description: 'Authority level' })
  level: number;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}
