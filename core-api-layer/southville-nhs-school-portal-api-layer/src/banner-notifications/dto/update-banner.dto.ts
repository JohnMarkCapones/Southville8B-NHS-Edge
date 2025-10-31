import { PartialType, OmitType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsDateString,
  MaxLength,
  MinLength,
  ValidateIf,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { CreateBannerDto, BannerType } from './create-banner.dto';

// Validator for UPDATE operations - allows past dates for existing banners
@ValidatorConstraint({ name: 'isEndDateAfterStartDateUpdate', async: false })
class IsEndDateAfterStartDateUpdateConstraint
  implements ValidatorConstraintInterface
{
  validate(endDateString: string, args: ValidationArguments) {
    const object = args.object as any;
    const startDateString = object.startDate;

    if (!endDateString || !startDateString) return true;

    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    // End date must be after start date (same as create, but no past date check)
    return endDate > startDate;
  }

  defaultMessage(args: ValidationArguments) {
    return 'End date must be after start date. Please select a later date.';
  }
}

// UpdateBannerDto - allows updating banners even if dates are in the past
// (useful for editing existing banners that were created earlier)
export class UpdateBannerDto {
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  shortMessage?: string;

  @IsOptional()
  @IsEnum(BannerType)
  type?: BannerType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDismissible?: boolean;

  @IsOptional()
  @IsBoolean()
  hasAction?: boolean;

  @ValidateIf((o) => o.hasAction === true)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  actionLabel?: string;

  @ValidateIf((o) => o.hasAction === true)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  actionUrl?: string;

  @IsOptional()
  @IsDateString()
  // NOTE: No past date validation on updates - allows editing existing banners
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @Validate(IsEndDateAfterStartDateUpdateConstraint)
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  template?: string;
}
