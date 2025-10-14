import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum QuestionType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  DROPDOWN = 'dropdown',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  NUMBER = 'number',
  EMAIL = 'email',
  DATE = 'date',
}

export class CreateQuestionOptionDto {
  @ApiProperty({
    description: 'Option display text',
    example: 'Grade 7',
  })
  @IsString()
  @IsNotEmpty()
  option_text: string;

  @ApiProperty({
    description: 'Option value',
    example: 'grade_7',
  })
  @IsString()
  @IsNotEmpty()
  option_value: string;

  @ApiPropertyOptional({
    description: 'Order index for sorting',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order_index?: number;
}

export class CreateFormQuestionDto {
  @ApiProperty({
    description: 'Question text',
    example: 'What is your grade level?',
  })
  @IsString()
  @IsNotEmpty()
  question_text: string;

  @ApiPropertyOptional({
    description: 'Type of question',
    example: 'dropdown',
    enum: QuestionType,
    default: QuestionType.TEXT,
  })
  @IsOptional()
  @IsEnum(QuestionType)
  question_type?: QuestionType;

  @ApiPropertyOptional({
    description: 'Whether the question is required',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({
    description: 'Order index for sorting',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order_index?: number;

  @ApiPropertyOptional({
    description: 'Options for dropdown/radio/checkbox questions',
    type: [CreateQuestionOptionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionOptionDto)
  options?: CreateQuestionOptionDto[];
}
