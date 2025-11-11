import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUrl,
  IsInt,
  MinLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuizChoiceDto {
  @IsString()
  @MinLength(1)
  @ApiProperty({
    example: '4',
    description: 'Choice text',
    minLength: 1,
  })
  choiceText: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Is this the correct answer',
    default: false,
    required: false,
  })
  isCorrect?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 0,
    description: 'Order index for the choice',
    required: false,
    minimum: 0,
  })
  orderIndex?: number;

  @IsOptional()
  @ApiProperty({
    example: { pairId: 'A' },
    description: 'Additional metadata for complex question types',
    required: false,
  })
  metadata?: any;

  // ============================================================================
  // Image Support Fields (Cloudflare Images)
  // ============================================================================

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'quiz-c-1f3b8bf5-b165-473c-9740-aaa4912516f8',
    description: 'Cloudflare Images ID for choice image',
    required: false,
  })
  choiceImageId?: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({
    example: 'https://imagedelivery.net/abc123/quiz-c-1f3b8bf5/card',
    description: 'Full Cloudflare Images delivery URL for choice image',
    required: false,
  })
  choiceImageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiProperty({
    example: 524288,
    description: 'File size in bytes of choice image',
    required: false,
    minimum: 0,
  })
  choiceImageFileSize?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'image/jpeg',
    description: 'MIME type of choice image (e.g., image/jpeg, image/png)',
    required: false,
  })
  choiceImageMimeType?: string;
}
