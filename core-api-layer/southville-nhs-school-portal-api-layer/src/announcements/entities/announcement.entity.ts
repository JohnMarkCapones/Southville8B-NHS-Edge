import { ApiProperty } from '@nestjs/swagger';

export class Announcement {
  @ApiProperty({ description: 'Announcement ID' })
  id: string;

  @ApiProperty({ description: 'User ID of creator' })
  userId: string;

  @ApiProperty({ description: 'Announcement title' })
  title: string;

  @ApiProperty({ description: 'Announcement content' })
  content: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: string;

  @ApiProperty({ description: 'Expiration timestamp', required: false })
  expiresAt?: string;

  @ApiProperty({ description: 'Announcement type', required: false })
  type?: string;

  @ApiProperty({
    description: 'Visibility (public/private)',
    enum: ['public', 'private'],
  })
  visibility: string;

  // Relations
  @ApiProperty({ description: 'Creator user info', required: false })
  user?: {
    id: string;
    fullName: string;
    email: string;
  };

  @ApiProperty({
    description: 'Tags associated with announcement',
    type: 'array',
    required: false,
  })
  tags?: Array<{
    id: string;
    name: string;
    color?: string;
  }>;

  @ApiProperty({ description: 'Target roles', type: 'array', required: false })
  targetRoles?: Array<{
    id: string;
    name: string;
  }>;
}
