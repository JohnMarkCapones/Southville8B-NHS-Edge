import { IsUUID, IsString, IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for adding a user to journalism domain with a position
 */
export class AddMemberDto {
  @ApiProperty({
    description: 'User ID to add to journalism',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Journalism position to assign',
    enum: [
      'Adviser',
      'Co-Adviser',
      'Editor-in-Chief',
      'Co-Editor-in-Chief',
      'Publisher',
      'Writer',
      'Member',
    ],
    example: 'Writer',
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
