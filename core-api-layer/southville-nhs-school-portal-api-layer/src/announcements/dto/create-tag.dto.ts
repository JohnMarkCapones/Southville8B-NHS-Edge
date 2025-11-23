import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({
    example: 'Academic',
    description: 'Tag name',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color code (e.g., #FF5733)',
  })
  @ApiProperty({
    required: false,
    example: '#FF5733',
    description: 'Hex color code for UI',
    maxLength: 50,
  })
  color?: string;
}
