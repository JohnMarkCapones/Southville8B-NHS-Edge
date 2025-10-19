import {
  IsOptional,
  IsDateString,
  IsString,
  IsInt,
  IsBoolean,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateAccessLinkDto {
  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2025-01-20T23:59:59Z',
    description: 'Expiration date/time for the access link',
    required: false,
  })
  expiresAt?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @ApiProperty({
    example: 'MATH2025',
    description: 'Optional access code required to use the link',
    required: false,
    minLength: 4,
    maxLength: 20,
  })
  accessCode?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  @ApiProperty({
    example: 100,
    description: 'Maximum number of times this link can be used',
    required: false,
    minimum: 1,
    maximum: 10000,
  })
  maxUses?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Whether authentication is required to access quiz via this link',
    required: false,
    default: true,
  })
  requiresAuth?: boolean;
}

export class ValidateAccessLinkDto {
  @IsString()
  @ApiProperty({
    example: 'a1b2c3d4e5f6...',
    description: 'Access token from the URL',
  })
  token: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'MATH2025',
    description: 'Access code if required',
    required: false,
  })
  accessCode?: string;
}
