import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHotspotDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Location ID where this hotspot belongs',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  locationId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  @ApiProperty({
    description: 'Hotspot label/name',
    example: 'Library Entrance',
    minLength: 1,
    maxLength: 255,
  })
  label: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @ApiProperty({
    description: 'X position as percentage (0-100)',
    example: 45.5,
    minimum: 0,
    maximum: 100,
  })
  xPosition: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @ApiProperty({
    description: 'Y position as percentage (0-100)',
    example: 32.8,
    minimum: 0,
    maximum: 100,
  })
  yPosition: number;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    description: 'ID of location to link to (for tour navigation)',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  linkToLocationId?: string;
}
