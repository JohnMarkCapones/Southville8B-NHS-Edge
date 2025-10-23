import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class QueryItemsDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => {
    const num = parseInt(value, 10);
    return isNaN(num) ? 1 : Math.max(1, num);
  })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => {
    const num = parseInt(value, 10);
    return isNaN(num) ? 20 : Math.min(100, Math.max(1, num));
  })
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Search query (searches title and caption)',
    example: 'robotics',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by media type',
    enum: ['image', 'video'],
    example: 'image',
  })
  @IsEnum(['image', 'video'])
  @IsOptional()
  media_type?: string;

  @ApiPropertyOptional({
    description: 'Filter by featured status',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value === 'true';
    return value;
  })
  is_featured?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by tag ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsOptional()
  tag_id?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: [
      'created_at',
      'updated_at',
      'title',
      'taken_at',
      'display_order',
      'views_count',
      'downloads_count',
    ],
    example: 'created_at',
    default: 'created_at',
  })
  @IsEnum([
    'created_at',
    'updated_at',
    'title',
    'taken_at',
    'display_order',
    'views_count',
    'downloads_count',
  ])
  @IsOptional()
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
  })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: string = 'desc';

  @ApiPropertyOptional({
    description: 'Include deleted items (admin only)',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value === 'true';
    return value;
  })
  includeDeleted?: boolean = false;
}
