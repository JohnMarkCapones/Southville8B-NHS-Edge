import {
  IsString,
  IsOptional,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBuildingDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @ApiProperty({
    example: 'Main Campus Building',
    description: 'Building name',
    minLength: 2,
    maxLength: 255,
  })
  buildingName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'MCB',
    description: 'Building code (must be unique)',
    minLength: 2,
    maxLength: 50,
  })
  code: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 1000,
    description: 'Building capacity',
    required: false,
    minimum: 0,
  })
  capacity?: number;
}
