import {
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GradeAnswerDto {
  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 8.5,
    description: 'Points awarded for this answer',
    minimum: 0,
  })
  pointsAwarded: number;

  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Is the answer correct',
  })
  isCorrect: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Good answer, but could use more details on X',
    description: 'Feedback for the student',
    required: false,
  })
  graderFeedback?: string;
}
