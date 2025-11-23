import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a review comment on a news article
 */
export class CreateReviewCommentDto {
  @ApiProperty({
    description: 'The review comment/feedback text',
    example: 'Great article! Please add more photos from the event.',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000, {
    message: 'Comment cannot exceed 5000 characters',
  })
  comment: string;
}
