import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCampusFacilityDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @ApiProperty({
    example: 'Library',
    description: 'Campus facility name',
    minLength: 2,
    maxLength: 255,
  })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @ApiProperty({
    example:
      'A modern library with extensive collection of books and digital resources',
    description: 'Description of the campus facility',
    required: false,
    maxLength: 2000,
  })
  description?: string;
}
