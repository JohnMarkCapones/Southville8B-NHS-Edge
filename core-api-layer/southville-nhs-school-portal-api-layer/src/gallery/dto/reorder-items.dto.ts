import {
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Single item reorder instruction
 */
export class ItemOrderDto {
  @ApiProperty({
    description: 'Item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  item_id: string;

  @ApiProperty({
    description: 'New display order',
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  display_order: number;
}

/**
 * DTO for reordering items within an album
 */
export class ReorderItemsDto {
  @ApiProperty({
    description: 'Array of items with new display orders',
    type: [ItemOrderDto],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemOrderDto)
  items: ItemOrderDto[];
}
