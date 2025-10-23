import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateModuleDto {
  @ApiProperty({
    description: 'Title of the module',
    example: 'Introduction to Biology',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the module',
    example: 'Basic concepts of biology for beginners',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description:
      'Whether this module is global (accessible to all teachers of the same subject)',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isGlobal?: boolean = false;

  @ApiPropertyOptional({
    description: 'Subject ID - required if isGlobal is true',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  subjectId?: string; // Required if isGlobal = true

  @ApiPropertyOptional({
    description: 'Section IDs - required if isGlobal is false',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987fcdeb-51a2-43d1-b789-123456789abc',
    ],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  sectionIds?: string[]; // Required if isGlobal = false
}
