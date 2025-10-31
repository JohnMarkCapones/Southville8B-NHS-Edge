import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for updating a review comment
 */
export class UpdateReviewCommentDto {
  @ApiProperty({
    description: 'The updated review comment/feedback text',
    example:
      'Great article! Please add more photos from the event and fix the typo in paragraph 2.',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000, {
    message: 'Comment cannot exceed 5000 characters',
  })
  comment: string;
}
