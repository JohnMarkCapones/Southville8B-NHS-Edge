import { ApiProperty } from '@nestjs/swagger';

export class EventStatisticsDto {
  @ApiProperty({ description: 'Total number of events' })
  totalEvents: number;

  @ApiProperty({ description: 'Events created this week' })
  thisWeekEvents: number;

  @ApiProperty({ description: 'Upcoming published events' })
  upcomingEvents: number;

  @ApiProperty({ description: 'Past completed events' })
  pastEvents: number;

  @ApiProperty({ description: 'Published events count' })
  publishedEvents: number;

  @ApiProperty({ description: 'Draft events count' })
  draftEvents: number;

  @ApiProperty({ description: 'Cancelled events count' })
  cancelledEvents: number;
}
