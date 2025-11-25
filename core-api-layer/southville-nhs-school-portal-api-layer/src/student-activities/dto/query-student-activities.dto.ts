import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsDateString,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityType } from '../entities/student-activity.entity';

export class QueryStudentActivitiesDto {
  @ApiProperty({
    description: 'Activity types to filter',
    required: false,
    enum: ActivityType,
    isArray: true,
  })
  @IsEnum(ActivityType, { each: true })
  @IsOptional()
  activityTypes?: ActivityType[];

  @ApiProperty({
    description: 'Related entity type filter',
    required: false,
    example: 'quiz',
  })
  @IsString()
  @IsOptional()
  relatedEntityType?: string;

  @ApiProperty({
    description: 'Show only highlighted activities',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  highlightedOnly?: boolean;

  @ApiProperty({
    description: 'Show only visible activities',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  visibleOnly?: boolean;

  @ApiProperty({
    description: 'Start date for filtering (ISO 8601)',
    required: false,
    example: '2025-01-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering (ISO 8601)',
    required: false,
    example: '2025-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'Page number',
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page',
    required: false,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
