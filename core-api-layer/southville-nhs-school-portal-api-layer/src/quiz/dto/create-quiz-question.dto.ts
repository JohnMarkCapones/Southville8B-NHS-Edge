import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsUUID,
  IsArray,
  IsUrl,
  IsInt,
  ValidateNested,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateQuizChoiceDto } from './create-quiz-choice.dto';

export class CreateQuizQuestionDto {
  @IsString()
  @MinLength(3)
  @ApiProperty({
    example: 'What is 2 + 2?',
    description: 'Question text',
    minLength: 3,
  })
  questionText: string;

  @IsEnum([
    'multiple_choice',
    'checkbox',
    'true_false',
    'short_answer',
    'essay',
    'fill_in_blank',
    'matching',
    'drag_drop',
    'ordering',
    'dropdown',
    'linear_scale',
  ])
  @ApiProperty({
    example: 'multiple_choice',
    description: 'Question type',
    enum: [
      'multiple_choice',
      'checkbox',
      'true_false',
      'short_answer',
      'essay',
      'fill_in_blank',
      'matching',
      'drag_drop',
      'ordering',
      'dropdown',
      'linear_scale',
    ],
  })
  questionType: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiProperty({
    example: 'This question tests basic arithmetic skills.',
    description: 'Optional question description/explanation',
    required: false,
    maxLength: 1000,
  })
  description?: string;

  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 0,
    description: 'Order index (position in quiz)',
    minimum: 0,
  })
  orderIndex: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 5,
    description: 'Points for this question',
    default: 1,
    required: false,
    minimum: 0,
  })
  points?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Allow partial credit for this question',
    default: false,
    required: false,
  })
  allowPartialCredit?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiProperty({
    example: 60,
    description: 'Time limit in seconds for this question',
    required: false,
    minimum: 1,
  })
  timeLimitSeconds?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Is this question part of a randomization pool',
    default: false,
    required: false,
  })
  isPoolQuestion?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Is this question required to be answered',
    default: false,
    required: false,
  })
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Randomize choices order when displaying this question',
    default: false,
    required: false,
  })
  isRandomize?: boolean;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Source question bank ID if imported from question bank',
    required: false,
  })
  sourceQuestionBankId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizChoiceDto)
  @ApiProperty({
    type: [CreateQuizChoiceDto],
    description: 'Answer choices for multiple choice, checkbox, etc.',
    required: false,
  })
  choices?: CreateQuizChoiceDto[];

  @IsOptional()
  @ApiProperty({
    example: { pairs: [{ left: 'A', right: '1' }] },
    description:
      'Metadata for complex question types (matching, ordering, drag-drop, fill-in-blank)',
    required: false,
  })
  metadata?: any;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Case sensitive matching for fill-in-blank questions',
    default: false,
    required: false,
  })
  caseSensitive?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Whitespace sensitive matching for fill-in-blank questions',
    default: false,
    required: false,
  })
  whitespaceSensitive?: boolean;

  // ============================================================================
  // Image Support Fields (Cloudflare Images)
  // ============================================================================

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'quiz-q-1f3b8bf5-b165-473c-9740-aaa4912516f8',
    description: 'Cloudflare Images ID for question image',
    required: false,
  })
  questionImageId?: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({
    example: 'https://imagedelivery.net/abc123/quiz-q-1f3b8bf5/card',
    description: 'Full Cloudflare Images delivery URL for question image',
    required: false,
  })
  questionImageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiProperty({
    example: 1048576,
    description: 'File size in bytes of question image',
    required: false,
    minimum: 0,
  })
  questionImageFileSize?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'image/png',
    description: 'MIME type of question image (e.g., image/jpeg, image/png)',
    required: false,
  })
  questionImageMimeType?: string;
}
