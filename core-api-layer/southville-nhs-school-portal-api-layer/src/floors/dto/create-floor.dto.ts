import {
  IsString,
  IsUUID,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFloorDto {
  @IsUUID()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Building ID',
  })
  buildingId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @ApiProperty({
    example: 'Ground Floor',
    description: 'Floor name',
    minLength: 2,
    maxLength: 255,
  })
  name: string;

  @IsNumber()
  @Min(1)
  @ApiProperty({
    example: 1,
    description: 'Floor number (must be unique within building)',
    minimum: 1,
  })
  number: number;
}
