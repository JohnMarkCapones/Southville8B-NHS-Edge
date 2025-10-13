import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  Min,
  Max,
  ValidateIf,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'atLeastOneSuspensionField', async: false })
class AtLeastOneSuspensionFieldConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    return !!(object.duration || object.suspendedUntil);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Either duration or suspendedUntil must be provided';
  }
}

export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
}

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    description: 'New user status',
  })
  status: UserStatus;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Reason for status change',
  })
  reason?: string;
}

export class SuspendUserDto {
  @IsString()
  @ApiProperty({
    description: 'Reason for suspension',
    example: 'Violation of school policies',
  })
  reason: string;

  @ValidateIf((o) => !o.suspendedUntil)
  @IsNumber()
  @Min(1)
  @Max(365)
  @ApiProperty({
    required: false,
    description: 'Suspension duration in days',
    example: 30,
    minimum: 1,
    maximum: 365,
  })
  duration?: number;

  @ValidateIf((o) => !o.duration)
  @IsDateString()
  @ApiProperty({
    required: false,
    description: 'Suspension end date (ISO format)',
    example: '2024-12-31',
  })
  suspendedUntil?: string;

  @Validate(AtLeastOneSuspensionFieldConstraint)
  _validateSuspensionFields?: any;
}
