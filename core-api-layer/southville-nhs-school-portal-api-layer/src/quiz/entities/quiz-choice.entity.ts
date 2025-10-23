import { ApiProperty } from '@nestjs/swagger';

export class QuizChoice {
  @ApiProperty({ description: 'Choice ID (UUID)' })
  choice_id: string;

  @ApiProperty({ description: 'Question ID (UUID)' })
  question_id: string;

  @ApiProperty({ description: 'Choice text' })
  choice_text: string;

  @ApiProperty({ description: 'Is this the correct answer', default: false })
  is_correct: boolean;

  @ApiProperty({ description: 'Order index', required: false })
  order_index?: number;

  @ApiProperty({
    description: 'Additional metadata for complex question types',
    required: false,
  })
  metadata?: any;

  @ApiProperty({ description: 'Created at timestamp' })
  created_at: string;
}
