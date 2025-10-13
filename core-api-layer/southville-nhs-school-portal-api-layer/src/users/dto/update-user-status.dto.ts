import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

  @IsOptional()
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

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    required: false,
    description: 'Suspension end date (ISO format)',
    example: '2024-12-31',
  })
  suspendedUntil?: string;
}
