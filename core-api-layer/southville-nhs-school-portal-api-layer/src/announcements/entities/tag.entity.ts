import { ApiProperty } from '@nestjs/swagger';

export class Tag {
  @ApiProperty({ description: 'Tag ID' })
  id: string;

  @ApiProperty({ description: 'Tag name' })
  name: string;

  @ApiProperty({ description: 'Tag color for UI', required: false })
  color?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;
}
