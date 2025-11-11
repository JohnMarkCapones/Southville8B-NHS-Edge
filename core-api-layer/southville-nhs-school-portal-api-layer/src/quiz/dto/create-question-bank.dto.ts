import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsArray,
  IsUUID,
  IsUrl,
  IsInt,
  IsObject,
  MinLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionBankDto {
  @IsString()
  @MinLength(3)
  @ApiProperty({
    example: 'What is the capital of France?',
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
  @IsUUID()
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Subject ID',
    required: false,
  })
  subjectId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Geography',
    description: 'Topic name',
    required: false,
  })
  topic?: string;

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  @ApiProperty({
    example: 'medium',
    description: 'Difficulty level',
    enum: ['easy', 'medium', 'hard'],
    required: false,
  })
  difficulty?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    example: ['geography', 'capitals', 'europe'],
    description: 'Tags for categorization',
    type: [String],
    required: false,
  })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 5,
    description: 'Default points for this question',
    default: 1,
    required: false,
    minimum: 0,
  })
  defaultPoints?: number;

  @IsOptional()
  @ApiProperty({
    example: [
      { text: 'Paris', is_correct: true },
      { text: 'London', is_correct: false },
    ],
    description: 'Choices in JSONB format',
    required: false,
  })
  choices?: any;

  @IsOptional()
  @ApiProperty({
    example: { answer: 'Paris' },
    description: 'Correct answer in JSONB format (for complex types)',
    required: false,
  })
  correctAnswer?: any;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Allow partial credit',
    default: false,
    required: false,
  })
  allowPartialCredit?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiProperty({
    example: 60,
    description: 'Time limit in seconds',
    required: false,
    minimum: 1,
  })
  timeLimitSeconds?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Optional explanation or rationale for the correct answer',
    required: false,
    example: 'Because 2+2 equals 4 by basic arithmetic rules.',
  })
  explanation?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Make this question available publicly to other teachers',
    required: false,
    default: false,
  })
  isPublic?: boolean;

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

  @IsOptional()
  @IsObject()
  @ApiProperty({
    example: {
      choices: [
        {
          text: 'Paris',
          imageId: 'quiz-c-abc123',
          imageUrl: 'https://imagedelivery.net/abc123/quiz-c-abc123/card',
          fileSize: 524288,
          mimeType: 'image/jpeg',
        },
      ],
    },
    description:
      'JSONB object storing image data for each choice (used for multiple choice questions in question bank)',
    required: false,
  })
  choicesImageData?: Record<string, any>;
}
