import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsDateString,
  MaxLength,
  MinLength,
  IsUrl,
  ValidateIf,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum BannerType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  DESTRUCTIVE = 'destructive',
}

// Custom validator to check if start date is not in the past
@ValidatorConstraint({ name: 'isNotPastDate', async: false })
class IsNotPastDateConstraint implements ValidatorConstraintInterface {
  validate(dateString: string) {
    if (!dateString) return true;
    const date = new Date(dateString);
    const now = new Date();

    // Allow dates from today onwards (reset time to start of day for comparison)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const inputDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    return inputDate >= today;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Start date cannot be in the past. Please select today or a future date.';
  }
}

// Custom validator to check if end date is after start date
@ValidatorConstraint({ name: 'isEndDateAfterStartDate', async: false })
class IsEndDateAfterStartDateConstraint
  implements ValidatorConstraintInterface
{
  validate(endDateString: string, args: ValidationArguments) {
    const object = args.object as any;
    const startDateString = object.startDate;

    if (!endDateString || !startDateString) return true;

    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    // End date must be after start date
    return endDate > startDate;
  }

  defaultMessage(args: ValidationArguments) {
    return 'End date must be after start date. Please select a later date.';
  }
}

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  @ApiProperty({
    example:
      '⚠️ Weather Alert: Early dismissal at 2:00 PM due to heavy rain. Stay safe and dry!',
    description: 'Full banner message',
    minLength: 10,
    maxLength: 5000,
  })
  message: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  @ApiProperty({
    example: 'Weather Alert: Early dismissal at 2:00 PM',
    description: 'Short message for compact display',
    minLength: 5,
    maxLength: 255,
  })
  shortMessage: string;

  @IsEnum(BannerType)
  @ApiProperty({
    enum: BannerType,
    default: BannerType.INFO,
    description: 'Banner type/severity',
  })
  type: BannerType = BannerType.INFO;

  @IsBoolean()
  @ApiProperty({
    default: false,
    description: 'Whether banner is currently active',
  })
  isActive: boolean = false;

  @IsBoolean()
  @ApiProperty({
    default: true,
    description: 'Whether users can dismiss the banner',
  })
  isDismissible: boolean = true;

  @IsBoolean()
  @ApiProperty({
    default: false,
    description: 'Whether banner has an action button',
  })
  hasAction: boolean = false;

  @ValidateIf((o) => o.hasAction === true)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    required: false,
    example: 'Read More',
    description: 'Action button label (required if hasAction is true)',
    maxLength: 100,
  })
  actionLabel?: string;

  @ValidateIf((o) => o.hasAction === true)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @ApiProperty({
    required: false,
    example: '/news/weather-update',
    description: 'Action button URL (required if hasAction is true)',
    maxLength: 500,
  })
  actionUrl?: string;

  @IsDateString()
  @Validate(IsNotPastDateConstraint)
  @ApiProperty({
    example: '2024-01-15T08:00:00Z',
    description: 'Banner start date (cannot be in the past)',
  })
  startDate: string;

  @IsDateString()
  @Validate(IsEndDateAfterStartDateConstraint)
  @ApiProperty({
    example: '2024-01-15T18:00:00Z',
    description: 'Banner end date (must be after start date)',
  })
  endDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiProperty({
    required: false,
    example: 'Weather Alert',
    description: 'Banner template name',
    maxLength: 100,
  })
  template?: string;
}
