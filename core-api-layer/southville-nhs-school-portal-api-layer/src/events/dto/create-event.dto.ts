import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  IsUUID,
  MaxLength,
  MinLength,
  ArrayMinSize,
  ArrayMaxSize,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidateNested,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import * as sanitizeHtml from 'sanitize-html';
import { IsSafeUrl } from '../../common';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum EventVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

@ValidatorConstraint({ name: 'isFutureDate', async: false })
class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(date: string, args: ValidationArguments) {
    if (!date) return false;
    const eventDate = new Date(date);
    const now = new Date();
    // Allow events up to 1 year in the past for grace period
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    return eventDate >= oneYearAgo;
  }

  defaultMessage() {
    return 'Event date must be within the last year or in the future';
  }
}

@ValidatorConstraint({ name: 'isValidTime', async: false })
class IsValidTimeConstraint implements ValidatorConstraintInterface {
  validate(time: string, args: ValidationArguments) {
    if (!time) return false;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  defaultMessage() {
    return 'Time must be in HH:MM format (24-hour)';
  }
}

export class CreateEventAdditionalInfoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @ApiProperty({
    example: 'Event Guidelines',
    description: 'Info section title',
    minLength: 3,
    maxLength: 255,
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  @Transform(({ value }) =>
    sanitizeHtml(value, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
      allowedAttributes: { a: ['href'] },
    }),
  )
  @ApiProperty({
    example: 'Please follow these guidelines...',
    description: 'Info section content (HTML sanitized)',
    minLength: 10,
    maxLength: 2000,
  })
  content: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @ApiProperty({
    required: false,
    description: 'Display order index',
    example: 0,
  })
  orderIndex?: number;
}

export class CreateEventHighlightDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @ApiProperty({
    example: 'Key Speaker',
    description: 'Highlight title',
    minLength: 3,
    maxLength: 255,
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  @Transform(({ value }) =>
    sanitizeHtml(value, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
      allowedAttributes: { a: ['href'] },
    }),
  )
  @ApiProperty({
    example: 'Dr. Smith will present...',
    description: 'Highlight content (HTML sanitized)',
    minLength: 10,
    maxLength: 2000,
  })
  content: string;

  @IsOptional()
  @IsSafeUrl()
  @MaxLength(500)
  @ApiProperty({
    required: false,
    example: 'https://example.com/speaker.jpg',
    description: 'Highlight image URL',
    maxLength: 500,
  })
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @ApiProperty({
    required: false,
    description: 'Display order index',
    example: 0,
  })
  orderIndex?: number;
}

export class CreateEventScheduleDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsValidTimeConstraint)
  @ApiProperty({
    example: '09:00',
    description: 'Activity time (HH:MM format)',
  })
  activityTime: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(1000)
  @Transform(({ value }) =>
    sanitizeHtml(value, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    }),
  )
  @ApiProperty({
    example: 'Registration and welcome',
    description: 'Activity description (HTML sanitized)',
    minLength: 5,
    maxLength: 1000,
  })
  activityDescription: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @ApiProperty({
    required: false,
    description: 'Display order index',
    example: 0,
  })
  orderIndex?: number;
}

export class CreateEventFaqDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(500)
  @ApiProperty({
    example: 'What should I bring to the event?',
    description: 'FAQ question',
    minLength: 5,
    maxLength: 500,
  })
  question: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  @Transform(({ value }) =>
    sanitizeHtml(value, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
      allowedAttributes: { a: ['href'] },
    }),
  )
  @ApiProperty({
    example: 'Please bring your ID and confirmation email...',
    description: 'FAQ answer (HTML sanitized)',
    minLength: 10,
    maxLength: 2000,
  })
  answer: string;
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  @ApiProperty({
    example: 'Annual School Science Fair',
    description: 'Event title',
    minLength: 5,
    maxLength: 255,
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(5000)
  @Transform(({ value }) =>
    sanitizeHtml(value, {
      allowedTags: [
        'b',
        'i',
        'em',
        'strong',
        'p',
        'br',
        'ul',
        'ol',
        'li',
        'a',
        'h1',
        'h2',
        'h3',
      ],
      allowedAttributes: { a: ['href'] },
    }),
  )
  @ApiProperty({
    example: 'Join us for our annual science fair...',
    description: 'Event description (HTML sanitized)',
    minLength: 20,
    maxLength: 5000,
  })
  description: string;

  @IsDateString()
  @Validate(IsFutureDateConstraint)
  @ApiProperty({
    example: '2025-12-15',
    description: 'Event date (YYYY-MM-DD format)',
  })
  date: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsValidTimeConstraint)
  @ApiProperty({
    example: '09:00',
    description: 'Event time (HH:MM format)',
  })
  time: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @ApiProperty({
    example: 'Main Auditorium',
    description: 'Event location',
    minLength: 3,
    maxLength: 255,
  })
  location: string;

  @IsUUID('4')
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Organizer user ID',
  })
  organizerId: string;

  @IsOptional()
  @IsUUID('4')
  @ApiProperty({
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Club ID for club-specific events (optional)',
  })
  clubId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiProperty({
    required: false,
    example: 'events/images/filename.jpg',
    description: 'Event image file key or URL',
    maxLength: 500,
  })
  eventImage?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    example: 'abc123-def456-ghi789',
    description: 'Cloudflare Images ID',
  })
  cfImageId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    example:
      'https://imagedelivery.net/kslzpqjNVD4TQGhwBAY6ew/abc123-def456-ghi789/public',
    description: 'Cloudflare Images delivery URL',
  })
  cfImageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiProperty({
    required: false,
    example: 2048576,
    description: 'Image file size in bytes',
  })
  imageFileSize?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    example: 'image/jpeg',
    description: 'Image MIME type',
  })
  imageMimeType?: string;

  @IsEnum(EventStatus)
  @ApiProperty({
    enum: EventStatus,
    default: EventStatus.DRAFT,
    description: 'Event status',
  })
  status: EventStatus;

  @IsEnum(EventVisibility)
  @ApiProperty({
    enum: EventVisibility,
    default: EventVisibility.PUBLIC,
    description: 'Event visibility',
  })
  visibility: EventVisibility;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(10, { message: 'Maximum 10 tags allowed per event' })
  @IsUUID('4', { each: true })
  @ApiProperty({
    required: false,
    type: [String],
    description: 'Tag IDs to associate (max: 10)',
    example: ['tag-uuid-1', 'tag-uuid-2'],
    maxItems: 10,
  })
  tagIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(20, { message: 'Maximum 20 additional info sections allowed' })
  @ValidateNested({ each: true })
  @Type(() => CreateEventAdditionalInfoDto)
  @ApiProperty({
    required: false,
    type: [CreateEventAdditionalInfoDto],
    description: 'Additional information sections',
    maxItems: 20,
  })
  additionalInfo?: CreateEventAdditionalInfoDto[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(10, { message: 'Maximum 10 highlights allowed' })
  @ValidateNested({ each: true })
  @Type(() => CreateEventHighlightDto)
  @ApiProperty({
    required: false,
    type: [CreateEventHighlightDto],
    description: 'Event highlights',
    maxItems: 10,
  })
  highlights?: CreateEventHighlightDto[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(50, { message: 'Maximum 50 schedule items allowed' })
  @ValidateNested({ each: true })
  @Type(() => CreateEventScheduleDto)
  @ApiProperty({
    required: false,
    type: [CreateEventScheduleDto],
    description: 'Event schedule',
    maxItems: 50,
  })
  schedule?: CreateEventScheduleDto[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(20, { message: 'Maximum 20 FAQ items allowed' })
  @ValidateNested({ each: true })
  @Type(() => CreateEventFaqDto)
  @ApiProperty({
    required: false,
    type: [CreateEventFaqDto],
    description: 'Event FAQ',
    maxItems: 20,
  })
  faq?: CreateEventFaqDto[];
}
