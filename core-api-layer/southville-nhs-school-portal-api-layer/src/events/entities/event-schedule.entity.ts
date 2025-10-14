import { ApiProperty } from '@nestjs/swagger';

export class EventSchedule {
  @ApiProperty({ description: 'Schedule item ID' })
  id: string;

  @ApiProperty({ description: 'Event ID' })
  eventId: string;

  @ApiProperty({ description: 'Activity time' })
  activityTime: string;

  @ApiProperty({ description: 'Activity description' })
  activityDescription: string;

  @ApiProperty({ description: 'Display order index' })
  orderIndex: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;
}
