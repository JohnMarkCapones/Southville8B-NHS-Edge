import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  NotificationType,
  NotificationCategory,
} from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'User ID to receive the notification',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: 'Notification type',
    example: 'info',
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'New Student Created',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiProperty({
    description: 'Notification message content',
    example: 'A new student has been added to the system.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: 'Notification category',
    example: 'user_account',
    enum: NotificationCategory,
  })
  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

  @ApiPropertyOptional({
    description: 'Related entity type (e.g., student, quiz, event)',
    example: 'student',
  })
  @IsOptional()
  @IsString()
  related_entity_type?: string;

  @ApiPropertyOptional({
    description: 'Related entity ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  related_entity_id?: string;

  @ApiPropertyOptional({
    description: 'User ID who created/triggered the notification',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  created_by?: string;
}
