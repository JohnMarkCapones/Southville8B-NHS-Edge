import {
  IsUUID,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateItemDto } from './create-item.dto';

/**
 * DTO for bulk uploading multiple items to an album
 * Used with multipart form data containing multiple files
 */
export class BulkUploadItemsDto {
  @ApiProperty({
    description: 'Album ID to upload items to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  album_id: string;

  @ApiProperty({
    description: 'Array of item metadata for each file',
    type: [CreateItemDto],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto)
  items: CreateItemDto[];
}
