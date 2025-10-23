import {
  IsEnum,
  IsOptional,
  IsArray,
  IsUUID,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublishQuizDto {
  @IsEnum(['published', 'scheduled'])
  @ApiProperty({
    example: 'published',
    description: 'Publication status',
    enum: ['published', 'scheduled'],
  })
  status: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  @ApiProperty({
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    description:
      'Section IDs to assign this quiz to (for section_only visibility)',
    required: false,
    type: [String],
  })
  sectionIds?: string[];
}
