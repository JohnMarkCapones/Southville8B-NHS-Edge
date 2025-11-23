import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsObject,
  IsDateString,
} from 'class-validator';
import { ActivityType } from '../entities/student-activity.entity';

export class CreateStudentActivityDto {
  @ApiProperty({ description: 'Student user ID (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  studentUserId: string;

  @ApiProperty({
    description: 'Activity type',
    enum: ActivityType,
  })
  @IsEnum(ActivityType)
  @IsNotEmpty()
  activityType: ActivityType;

  @ApiProperty({ description: 'Activity title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Activity description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Additional metadata (JSON object)',
    required: false,
    example: {
      club_id: 'uuid',
      club_name: 'Science Club',
    },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Related entity ID (UUID)', required: false })
  @IsUUID()
  @IsOptional()
  relatedEntityId?: string;

  @ApiProperty({
    description: 'Related entity type',
    required: false,
    example: 'quiz',
  })
  @IsString()
  @IsOptional()
  relatedEntityType?: string;

  @ApiProperty({
    description: 'Icon name from Lucide React',
    required: false,
    example: 'CheckCircle2',
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({
    description: 'Color class',
    required: false,
    example: 'text-green-500',
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: 'Is highlighted',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isHighlighted?: boolean;

  @ApiProperty({
    description: 'Is visible',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiProperty({
    description: 'Activity timestamp (ISO 8601)',
    required: false,
    example: '2025-01-15T10:30:00Z',
  })
  @IsDateString()
  @IsOptional()
  activityTimestamp?: string;
}
