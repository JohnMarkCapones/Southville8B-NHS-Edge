import {
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AlertType } from '../entities/alert.entity';

export class QueryAlertDto {
  @IsOptional()
  @IsEnum(AlertType)
  @ApiProperty({
    description: 'Filter by alert type',
    required: false,
    example: 'info',
    enum: AlertType,
  })
  type?: AlertType;

  @IsOptional()
  @IsBoolean()
  @Transform(
    ({ value }) => value === true || String(value).toLowerCase() === 'true',
  )
  @ApiProperty({
    description: 'Include expired alerts in results',
    required: false,
    example: false,
    default: false,
  })
  includeExpired?: boolean = false;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    example: 1,
    minimum: 1,
    default: 1,
  })
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  limit?: number = 10;

  @IsOptional()
  @IsIn(['created_at', 'expires_at', 'title'])
  @ApiProperty({
    description: 'Sort by field',
    required: false,
    example: 'created_at',
    enum: ['created_at', 'expires_at', 'title'],
    default: 'created_at',
  })
  sortBy?: 'created_at' | 'expires_at' | 'title' = 'created_at';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  @Transform(({ value }) => String(value || 'DESC').toUpperCase())
  @ApiProperty({
    description: 'Sort order',
    required: false,
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
