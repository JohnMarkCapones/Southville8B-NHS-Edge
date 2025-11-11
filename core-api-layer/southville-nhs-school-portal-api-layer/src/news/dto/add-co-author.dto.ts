import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for adding a co-author to an article
 * Co-author can be any name (internal or external contributor)
 */
export class AddCoAuthorDto {
  @ApiProperty({
    description:
      'Name of the co-author (can be internal user or external contributor)',
    example: 'John Smith',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  coAuthorName: string;
}
