import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for approving a news article
 * Only Advisers and Co-Advisers can approve
 */
export class ApproveNewsDto {
  @ApiPropertyOptional({
    description: 'Optional remarks/feedback from approver',
    example: 'Great article! Well written and informative.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}
