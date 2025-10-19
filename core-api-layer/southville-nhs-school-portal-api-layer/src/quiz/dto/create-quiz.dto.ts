import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsUUID,
  Min,
  MinLength,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuizDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @ApiProperty({
    example: 'Math Quiz - Algebra Basics',
    description: 'Quiz title',
    minLength: 3,
    maxLength: 255,
  })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiProperty({
    example: 'This quiz covers basic algebra concepts including equations and inequalities',
    description: 'Quiz description',
    required: false,
    maxLength: 1000,
  })
  description?: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Subject ID (UUID)',
    required: false,
  })
  subjectId?: string;

  @IsOptional()
  @IsEnum(['form', 'sequential', 'mixed'])
  @ApiProperty({
    example: 'form',
    description: 'Quiz type',
    enum: ['form', 'sequential', 'mixed'],
    default: 'form',
    required: false,
  })
  type?: string;

  @IsOptional()
  @IsEnum(['auto', 'manual', 'hybrid'])
  @ApiProperty({
    example: 'auto',
    description: 'Grading type',
    enum: ['auto', 'manual', 'hybrid'],
    default: 'auto',
    required: false,
  })
  gradingType?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiProperty({
    example: 60,
    description: 'Time limit in minutes',
    required: false,
    minimum: 1,
  })
  timeLimit?: number;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2025-01-20T10:00:00Z',
    description: 'Quiz start date (ISO 8601 format)',
    required: false,
  })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2025-01-27T18:00:00Z',
    description: 'Quiz end date (ISO 8601 format)',
    required: false,
  })
  endDate?: string;

  @IsOptional()
  @IsEnum(['public', 'section_only'])
  @ApiProperty({
    example: 'section_only',
    description: 'Quiz visibility',
    enum: ['public', 'section_only'],
    default: 'section_only',
    required: false,
  })
  visibility?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiProperty({
    example: 50,
    description: 'Total questions in pool (for question randomization)',
    required: false,
    minimum: 1,
  })
  questionPoolSize?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @ValidateIf((o) => o.questionPoolSize)
  @ApiProperty({
    example: 20,
    description: 'Number of questions to display per attempt (must be <= questionPoolSize)',
    required: false,
    minimum: 1,
  })
  questionsToDisplay?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Allow students to retake the quiz',
    default: false,
    required: false,
  })
  allowRetakes?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Allow students to navigate back to previous questions',
    default: true,
    required: false,
  })
  allowBacktracking?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Shuffle questions for each attempt',
    default: false,
    required: false,
  })
  shuffleQuestions?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: false,
    description: 'Shuffle answer choices for each attempt',
    default: false,
    required: false,
  })
  shuffleChoices?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 100,
    description: 'Total points for the quiz',
    required: false,
    minimum: 0,
  })
  totalPoints?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 75,
    description: 'Passing score threshold',
    required: false,
    minimum: 0,
  })
  passingScore?: number;
}
