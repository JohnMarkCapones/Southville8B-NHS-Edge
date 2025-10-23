import {
  IsUUID,
  IsString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
  MaxLength,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentRankingDto {
  @ApiProperty({
    description: 'Student ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: 'Grade level',
    example: 'Grade 7',
    enum: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'])
  gradeLevel: string;

  @ApiProperty({
    description: 'Student rank (1-100 for top students)',
    example: 15,
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  rank: number;

  @ApiPropertyOptional({
    description: 'Honor status',
    example: 'With High Honors',
    enum: [
      'With Highest Honors',
      'With High Honors',
      'With Honors',
      'No Honors',
    ],
  })
  @IsOptional()
  @IsString()
  @IsIn(['With Highest Honors', 'With High Honors', 'With Honors', 'No Honors'])
  @MaxLength(50)
  honorStatus?: string;

  @ApiProperty({
    description: 'Academic quarter',
    example: 'Q1',
    enum: ['Q1', 'Q2', 'Q3', 'Q4'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['Q1', 'Q2', 'Q3', 'Q4'])
  quarter: string;

  @ApiProperty({
    description: 'School year',
    example: '2024-2025',
    pattern: '^\\d{4}-\\d{4}$',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  schoolYear: string;
}
