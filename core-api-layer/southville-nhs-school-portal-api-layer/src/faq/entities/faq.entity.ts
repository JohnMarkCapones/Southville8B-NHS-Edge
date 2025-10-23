import { ApiProperty } from '@nestjs/swagger';

export class Faq {
  @ApiProperty({ description: 'FAQ ID (UUID)' })
  id: string;

  @ApiProperty({
    description: 'FAQ question',
    example: 'How do I reset my password?',
  })
  question: string;

  @ApiProperty({
    description: 'FAQ answer',
    example:
      'You can reset your password by clicking the "Forgot Password" link on the login page and following the instructions sent to your email.',
  })
  answer: string;

  @ApiProperty({ description: 'Created at timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Updated at timestamp' })
  updated_at: string;
}
