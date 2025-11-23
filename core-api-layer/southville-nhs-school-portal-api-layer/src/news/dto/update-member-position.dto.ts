import { IsString, IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for updating a member's position in journalism
 */
export class UpdateMemberPositionDto {
  @ApiProperty({
    description: 'New journalism position (student positions only)',
    enum: [
      'Editor-in-Chief',
      'Co-Editor-in-Chief',
      'Publisher',
      'Writer',
      'Member',
    ],
    example: 'Publisher',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'Editor-in-Chief',
    'Co-Editor-in-Chief',
    'Publisher',
    'Writer',
    'Member',
  ])
  position: string;
}
