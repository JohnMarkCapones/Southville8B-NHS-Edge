import {
  IsString,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({
    example: 'Section A',
    description: 'Section name',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'Grade 10',
    description: 'Grade level',
    required: false,
    minLength: 2,
    maxLength: 50,
  })
  gradeLevel?: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Teacher ID (foreign key to users table)',
    required: false,
  })
  teacherId?: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Room ID',
    required: false,
  })
  roomId?: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Building ID',
    required: false,
  })
  buildingId?: string;
}
