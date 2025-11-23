import { IsUUID, IsOptional, IsArray, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @IsUUID()
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Question ID',
  })
  questionId: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Choice ID (for MCQ, True/False)',
    required: false,
  })
  choiceId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiProperty({
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    description: 'Choice IDs (for checkbox - multiple correct)',
    type: [String],
    required: false,
  })
  choiceIds?: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'The answer is 42',
    description: 'Text answer (for short answer, essay)',
    required: false,
  })
  answerText?: string;

  @IsOptional()
  @ApiProperty({
    example: { pairs: [{ left: 'A', right: '1' }] },
    description: 'Complex answer (for matching, ordering, drag-drop)',
    required: false,
  })
  answerJson?: any;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 45,
    description: 'Time spent on this question in seconds',
    required: false,
    minimum: 0,
  })
  timeSpentSeconds?: number;
}
