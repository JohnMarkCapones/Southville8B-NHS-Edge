import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsArray,
  IsUUID,
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
}
