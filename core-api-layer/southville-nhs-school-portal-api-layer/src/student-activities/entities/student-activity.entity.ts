import { ApiProperty } from '@nestjs/swagger';

export enum ActivityType {
  // Club Activities
  CLUB_JOINED = 'club_joined',
  CLUB_LEFT = 'club_left',
  CLUB_POSITION_CHANGED = 'club_position_changed',
  CLUB_EVENT_CREATED = 'club_event_created',
  CLUB_ANNOUNCEMENT_POSTED = 'club_announcement_posted',
  CLUB_MEMBER_ADDED = 'club_member_added',

  // Module Activities
  MODULE_RECEIVED = 'module_received',
  MODULE_UPLOADED_BY_TEACHER = 'module_uploaded_by_teacher',

  // Journalism Activities
  JOURNALISM_ARTICLE_APPROVED = 'journalism_article_approved',
  JOURNALISM_ARTICLE_REJECTED = 'journalism_article_rejected',
  JOURNALISM_ARTICLE_REVISION_REQUESTED = 'journalism_article_revision_requested',
  JOURNALISM_ARTICLE_PUBLISHED = 'journalism_article_published',

  // General Activities
  OTHER = 'other',
}

export interface StudentActivity {
  id: string;
  student_user_id: string;
  activity_type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  related_entity_id?: string;
  related_entity_type?: string;
  icon?: string;
  color?: string;
  is_highlighted: boolean;
  is_visible: boolean;
  activity_timestamp: string;
  created_at: string;
  updated_at: string;
}

export class StudentActivityDto {
  @ApiProperty({ description: 'Activity ID' })
  id: string;

  @ApiProperty({ description: 'Student user ID' })
  studentUserId: string;

  @ApiProperty({
    description: 'Activity type',
    enum: ActivityType,
  })
  activityType: ActivityType;

  @ApiProperty({ description: 'Activity title' })
  title: string;

  @ApiProperty({ description: 'Activity description', required: false })
  description?: string;

  @ApiProperty({
    description: 'Additional metadata',
    required: false,
    example: {
      club_id: 'uuid',
      club_name: 'Science Club',
    },
  })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Related entity ID', required: false })
  relatedEntityId?: string;

  @ApiProperty({ description: 'Related entity type', required: false })
  relatedEntityType?: string;

  @ApiProperty({ description: 'Icon name (Lucide React)', required: false })
  icon?: string;

  @ApiProperty({ description: 'Color class', required: false })
  color?: string;

  @ApiProperty({ description: 'Is highlighted', default: false })
  isHighlighted: boolean;

  @ApiProperty({ description: 'Is visible', default: true })
  isVisible: boolean;

  @ApiProperty({ description: 'Activity timestamp' })
  activityTimestamp: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: string;
}
