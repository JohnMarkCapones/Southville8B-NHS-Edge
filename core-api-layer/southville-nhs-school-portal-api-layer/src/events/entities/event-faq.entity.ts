import { ApiProperty } from '@nestjs/swagger';

export class EventFaq {
  @ApiProperty({ description: 'FAQ ID' })
  id: string;

  @ApiProperty({ description: 'Event ID' })
  eventId: string;

  @ApiProperty({ description: 'FAQ question' })
  question: string;

  @ApiProperty({ description: 'FAQ answer' })
  answer: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;
}
