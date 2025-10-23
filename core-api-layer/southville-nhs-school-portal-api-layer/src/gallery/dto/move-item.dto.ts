import { IsUUID, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * DTO for moving an item to a different album
 */
export class MoveItemDto {
  @ApiProperty({
    description: 'Target album ID to move the item to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  target_album_id: string;

  @ApiPropertyOptional({
    description: 'Display order in the new album',
    example: 0,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return parseInt(value, 10);
    return value;
  })
  display_order?: number = 0;
}
