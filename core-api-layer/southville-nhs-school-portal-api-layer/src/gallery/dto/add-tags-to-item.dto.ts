import { IsArray, ArrayMinSize, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for adding tags to a gallery item
 */
export class AddTagsToItemDto {
  @ApiProperty({
    description: 'Array of tag IDs to add to the item',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
    type: [String],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  tag_ids: string[];
}
