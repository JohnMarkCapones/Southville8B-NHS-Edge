import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartQuizAttemptDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'desktop-chrome-fingerprint-123',
    description: 'Device fingerprint for tracking',
    required: false,
  })
  deviceFingerprint?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
    description: 'User agent string',
    required: false,
  })
  userAgent?: string;
}
