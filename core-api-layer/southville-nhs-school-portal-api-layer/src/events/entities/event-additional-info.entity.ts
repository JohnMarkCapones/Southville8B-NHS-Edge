import { ApiProperty } from '@nestjs/swagger';

export class EventAdditionalInfo {
  @ApiProperty({ description: 'Additional info ID' })
  id: string;

  @ApiProperty({ description: 'Event ID' })
  eventId: string;

  @ApiProperty({ description: 'Info section title' })
  title: string;

  @ApiProperty({ description: 'Info section content' })
  content: string;

  @ApiProperty({ description: 'Display order index' })
  orderIndex: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;
}
