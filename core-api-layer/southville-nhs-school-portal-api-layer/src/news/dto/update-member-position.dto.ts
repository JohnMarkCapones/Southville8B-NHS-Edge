import { IsString, IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for updating a member's position in journalism
 */
export class UpdateMemberPositionDto {
  @ApiProperty({
    description: 'New journalism position',
    enum: [
      'Adviser',
      'Co-Adviser',
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
    'Adviser',
    'Co-Adviser',
    'Editor-in-Chief',
    'Co-Editor-in-Chief',
    'Publisher',
    'Writer',
    'Member',
  ])
  position: string;
}
