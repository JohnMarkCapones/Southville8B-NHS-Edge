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
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import sanitizeHtml from 'sanitize-html';

export enum AnnouncementVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

@ValidatorConstraint({ name: 'isFutureDate', async: false })
class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(dateString: string) {
    if (!dateString) return true; // Optional field
    const date = new Date(dateString);
    const now = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(now.getFullYear() + 1);

    return date > now && date <= oneYearFromNow;
  }

  defaultMessage() {
    return 'Expiration date must be in the future and not more than 1 year from now';
  }
}

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @ApiProperty({
    example: 'School Assembly Next Week',
    description: 'Announcement title',
    minLength: 3,
    maxLength: 255,
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(10000) // Prevent extremely large content
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value || '';
    }
    return sanitizeHtml(value, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
      allowedAttributes: { a: ['href'] },
    });
  })
  @ApiProperty({
    example: 'There will be a school assembly...',
    description: 'Announcement content (HTML sanitized)',
    minLength: 10,
    maxLength: 10000,
  })
  content: string;

  @IsOptional()
  @IsDateString()
  @Validate(IsFutureDateConstraint)
  @ApiProperty({
    required: false,
    example: '2025-12-31T23:59:59Z',
    description: 'Expiration date (must be in future, max 1 year)',
  })
  expiresAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiProperty({
    required: false,
    example: 'event',
    description: 'Announcement type',
    maxLength: 50,
  })
  type?: string;

  @IsEnum(AnnouncementVisibility)
  @ApiProperty({
    enum: AnnouncementVisibility,
    default: AnnouncementVisibility.PUBLIC,
    description: 'Visibility setting',
  })
  visibility: AnnouncementVisibility = AnnouncementVisibility.PUBLIC;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one target role is required' })
  @ArrayMaxSize(10, { message: 'Maximum 10 target roles allowed' })
  @IsUUID('4', { each: true })
  @ApiProperty({
    type: [String],
    description: 'Target role IDs (min: 1, max: 10)',
    example: ['role-uuid-1', 'role-uuid-2'],
    minItems: 1,
    maxItems: 10,
  })
  targetRoleIds: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: 'Maximum 10 tags allowed per announcement' })
  @IsUUID('4', { each: true })
  @ApiProperty({
    required: false,
    type: [String],
    description: 'Tag IDs to associate (max: 10)',
    example: ['tag-uuid-1'],
    maxItems: 10,
  })
  tagIds?: string[];
}
