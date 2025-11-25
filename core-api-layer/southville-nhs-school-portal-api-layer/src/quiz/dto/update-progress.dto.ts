import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating student progress during quiz
 * Used for real-time monitoring in teacher dashboard
 */
export class UpdateProgressDto {
  @ApiProperty({
    description: 'Current question index (0-based)',
    example: 2,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  currentQuestionIndex: number;

  @ApiProperty({
    description: 'Number of questions answered so far',
    example: 2,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  questionsAnswered: number;

  @ApiProperty({
    description: 'Progress percentage (0-100)',
    example: 40,
    minimum: 0,
    maximum: 100,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiPropertyOptional({
    description: 'Total idle time in seconds',
    example: 30,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  idleTimeSeconds?: number;
}
