import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, IsOptional } from 'class-validator';

/**
 * DTO for importing a question from question bank to a quiz
 */
export class ImportQuestionDto {
  @ApiProperty({
    description: 'Question bank ID to import from',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID('4', { message: 'Question bank ID must be a valid UUID' })
  questionBankId: string;

  @ApiProperty({
    description: 'Order index where question should be inserted in quiz',
    example: 1,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Order index must be an integer' })
  @Min(0, { message: 'Order index must be at least 0' })
  orderIndex?: number;
}
