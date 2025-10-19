import { IsUUID, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for adding a co-author to an article
 * Co-author must be a journalism team member
 */
export class AddCoAuthorDto {
  @ApiProperty({
    description: 'User ID of the co-author (must be journalism member)',
    example: 'e1caec49-f61d-4158-bac7-1dd456e9976b',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({
    description: 'Role of the co-author in this article',
    example: 'co-author',
    enum: ['co-author', 'editor', 'contributor'],
    default: 'co-author',
  })
  @IsOptional()
  @IsEnum(['co-author', 'editor', 'contributor'])
  role?: 'co-author' | 'editor' | 'contributor';
}
