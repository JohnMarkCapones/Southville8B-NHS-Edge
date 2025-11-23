import { ApiProperty } from '@nestjs/swagger';

export class Event {
  @ApiProperty({ description: 'Event ID' })
  id: string;

  @ApiProperty({ description: 'Event title' })
  title: string;

  @ApiProperty({ description: 'Event description' })
  description: string;

  @ApiProperty({ description: 'Event date' })
  date: string;

  @ApiProperty({ description: 'Event time' })
  time: string;

  @ApiProperty({ description: 'Event location' })
  location: string;

  @ApiProperty({ description: 'Organizer user ID' })
  organizerId: string;

  @ApiProperty({
    description: 'Club ID for club-specific events',
    required: false,
  })
  clubId?: string;

  @ApiProperty({ description: 'Event image URL', required: false })
  eventImage?: string;

  @ApiProperty({ description: 'Cloudflare Images ID', required: false })
  cfImageId?: string;

  @ApiProperty({ description: 'Cloudflare Images URL', required: false })
  cfImageUrl?: string;

  @ApiProperty({ description: 'Image file size in bytes', required: false })
  imageFileSize?: number;

  @ApiProperty({ description: 'Image MIME type', required: false })
  imageMimeType?: string;

  @ApiProperty({
    description: 'Event status',
    enum: ['draft', 'published', 'cancelled', 'completed'],
  })
  status: string;

  @ApiProperty({
    description: 'Event visibility',
    enum: ['public', 'private'],
  })
  visibility: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: string;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  deleted_at?: string;

  @ApiProperty({
    description: 'User who deleted/archived the event',
    required: false,
  })
  deleted_by?: string;

  // Relations
  @ApiProperty({ description: 'Organizer user info', required: false })
  organizer?: {
    id: string;
    fullName: string;
    email: string;
  };

  @ApiProperty({
    description: 'Club info for club-specific events',
    required: false,
  })
  club?: {
    id: string;
    name: string;
    description?: string;
  };

  @ApiProperty({
    description: 'Tags associated with event',
    type: 'array',
    required: false,
  })
  tags?: Array<{
    id: string;
    name: string;
    color?: string;
  }>;

  @ApiProperty({
    description: 'Additional information sections',
    type: 'array',
    required: false,
  })
  additionalInfo?: Array<{
    id: string;
    title: string;
    content: string;
    orderIndex: number;
  }>;

  @ApiProperty({
    description: 'Event highlights',
    type: 'array',
    required: false,
  })
  highlights?: Array<{
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    orderIndex: number;
  }>;

  @ApiProperty({
    description: 'Event schedule',
    type: 'array',
    required: false,
  })
  schedule?: Array<{
    id: string;
    activityTime: string;
    activityDescription: string;
    orderIndex: number;
  }>;

  @ApiProperty({
    description: 'Event FAQ',
    type: 'array',
    required: false,
  })
  faq?: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
}
