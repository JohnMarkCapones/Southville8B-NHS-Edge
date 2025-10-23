import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AnnouncementPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class CreateClubAnnouncementDto {
  @ApiProperty({
    description: 'Club ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  club_id: string;

  @ApiProperty({
    description: 'Announcement title',
    example: 'Welcome to the Club!',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @ApiProperty({
    description: 'Announcement content',
    example:
      'We are excited to have you join our community. Stay tuned for upcoming events!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Announcement priority',
    enum: AnnouncementPriority,
    default: AnnouncementPriority.NORMAL,
    example: AnnouncementPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(AnnouncementPriority, {
    message:
      'Priority must be one of: low, normal, high, urgent',
  })
  priority?: AnnouncementPriority;
}
