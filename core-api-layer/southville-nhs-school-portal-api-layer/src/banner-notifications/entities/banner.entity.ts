import { ApiProperty } from '@nestjs/swagger';

export class BannerNotification {
  @ApiProperty({ description: 'Banner notification ID' })
  id: string;

  @ApiProperty({ description: 'Full banner message' })
  message: string;

  @ApiProperty({ description: 'Short message for compact display' })
  shortMessage: string;

  @ApiProperty({
    description: 'Banner type/severity',
    enum: ['info', 'success', 'warning', 'destructive'],
  })
  type: string;

  @ApiProperty({ description: 'Whether banner is currently active' })
  isActive: boolean;

  @ApiProperty({ description: 'Whether users can dismiss the banner' })
  isDismissible: boolean;

  @ApiProperty({ description: 'Whether banner has an action button' })
  hasAction: boolean;

  @ApiProperty({
    description: 'Action button label',
    required: false,
  })
  actionLabel?: string;

  @ApiProperty({
    description: 'Action button URL',
    required: false,
  })
  actionUrl?: string;

  @ApiProperty({ description: 'Banner start date' })
  startDate: string;

  @ApiProperty({ description: 'Banner end date' })
  endDate: string;

  @ApiProperty({ description: 'User ID who created the banner' })
  createdBy: string;

  @ApiProperty({
    description: 'Banner template name',
    required: false,
  })
  template?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: string;

  // Relations
  @ApiProperty({
    description: 'Creator user info',
    required: false,
  })
  creator?: {
    id: string;
    fullName: string;
    email: string;
  };
}
