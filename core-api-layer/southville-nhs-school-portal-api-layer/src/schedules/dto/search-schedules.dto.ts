import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek, Semester } from '../entities/schedule.entity';

export class SearchSchedulesDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Search term for teacher name, subject name, or section name',
    required: false,
    example: 'John Doe',
  })
  search?: string;

  @IsUUID('4')
  @IsOptional()
  @ApiProperty({
    description: 'Filter by section ID',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  sectionId?: string;

  @IsUUID('4')
  @IsOptional()
  @ApiProperty({
    description: 'Filter by teacher ID',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  teacherId?: string;

  @IsEnum(DayOfWeek)
  @IsOptional()
  @ApiProperty({
    description: 'Filter by day of the week',
    enum: DayOfWeek,
    required: false,
    example: DayOfWeek.MONDAY,
  })
  dayOfWeek?: DayOfWeek;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Filter by school year',
    required: false,
    example: '2024-2025',
  })
  schoolYear?: string;

  @IsEnum(Semester)
  @IsOptional()
  @ApiProperty({
    description: 'Filter by semester',
    enum: Semester,
    required: false,
    example: Semester.FIRST,
  })
  semester?: Semester;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @ApiProperty({
    description: 'Page number',
    required: false,
    example: 1,
    minimum: 1,
    maximum: 100,
  })
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @ApiProperty({
    description: 'Items per page',
    required: false,
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  limit?: number = 10;
}
