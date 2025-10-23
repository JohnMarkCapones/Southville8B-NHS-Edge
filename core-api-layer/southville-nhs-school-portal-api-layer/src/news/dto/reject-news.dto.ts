import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for rejecting a news article
 * Only Advisers and Co-Advisers can reject
 * Requires remarks explaining why the article was rejected
 */
export class RejectNewsDto {
  @ApiProperty({
    description: 'Remarks explaining why the article was rejected (required)',
    example: 'Please check grammar and add more sources.',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  remarks: string;
}
