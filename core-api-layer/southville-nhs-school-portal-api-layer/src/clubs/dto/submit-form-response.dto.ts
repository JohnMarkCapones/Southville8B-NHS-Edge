import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ResponseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class FormAnswerDto {
  @ApiProperty({
    description: 'Question ID',
    example: 'e1caec49-f61d-4158-bac7-1dd456e9976b',
  })
  @IsString()
  @IsNotEmpty()
  question_id: string;

  @ApiPropertyOptional({
    description: 'Answer text',
    example: 'I want to join because I love science',
  })
  @IsOptional()
  @IsString()
  answer_text?: string;

  @ApiPropertyOptional({
    description: 'Answer value (for dropdown/radio/checkbox)',
    example: 'grade_7',
  })
  @IsOptional()
  @IsString()
  answer_value?: string;
}

export class SubmitFormResponseDto {
  @ApiProperty({
    description: 'Array of answers to form questions',
    type: [FormAnswerDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormAnswerDto)
  answers: FormAnswerDto[];
}
