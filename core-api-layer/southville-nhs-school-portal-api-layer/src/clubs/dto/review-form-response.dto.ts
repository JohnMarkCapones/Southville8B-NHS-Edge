import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReviewStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class ReviewFormResponseDto {
  @ApiProperty({
    description: 'Review status',
    example: 'approved',
    enum: ReviewStatus,
  })
  @IsEnum(ReviewStatus)
  status: ReviewStatus;

  @ApiPropertyOptional({
    description: 'Review notes',
    example: 'Welcome to our club!',
  })
  @IsOptional()
  @IsString()
  review_notes?: string;
}
