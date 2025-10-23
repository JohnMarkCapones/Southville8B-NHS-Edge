import { ApiProperty } from '@nestjs/swagger';

export class EventHighlight {
  @ApiProperty({ description: 'Highlight ID' })
  id: string;

  @ApiProperty({ description: 'Event ID' })
  eventId: string;

  @ApiProperty({ description: 'Highlight title' })
  title: string;

  @ApiProperty({ description: 'Highlight content' })
  content: string;

  @ApiProperty({ description: 'Highlight image URL', required: false })
  imageUrl?: string;

  @ApiProperty({ description: 'Display order index' })
  orderIndex: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;
}
