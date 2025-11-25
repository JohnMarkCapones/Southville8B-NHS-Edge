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

  // ============================================================================
  // Image Support Fields (Cloudflare Images)
  // ============================================================================

  @ApiProperty({
    description: 'Cloudflare Images ID for choice image',
    required: false,
  })
  choice_image_id?: string;

  @ApiProperty({
    description: 'Full Cloudflare Images delivery URL for choice image',
    required: false,
  })
  choice_image_url?: string;

  @ApiProperty({
    description: 'File size in bytes of choice image',
    required: false,
  })
  choice_image_file_size?: number;

  @ApiProperty({
    description: 'MIME type of choice image',
    required: false,
  })
  choice_image_mime_type?: string;

  @ApiProperty({ description: 'Created at timestamp' })
  created_at: string;
}
