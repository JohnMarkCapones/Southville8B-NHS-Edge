import {
  IsUUID,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGwaDto {
  @ApiProperty({
    description: 'Student ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  student_id: string;

  @ApiProperty({
    description: 'General Weighted Average (50-100)',
    example: 87.5,
    minimum: 50,
    maximum: 100,
  })
  @IsNumber()
  @Min(50)
  @Max(100)
  gwa: number;

  @ApiProperty({
    description: 'Grading period',
    example: 'Q1',
    enum: ['Q1', 'Q2', 'Q3', 'Q4'],
  })
  @IsString()
  @IsIn(['Q1', 'Q2', 'Q3', 'Q4'])
  grading_period: string;

  @ApiProperty({
    description: 'School year',
    example: '2024-2025',
  })
  @IsString()
  school_year: string;

  @ApiProperty({
    description: 'Optional remarks',
    example: 'Excellent performance',
    required: false,
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({
    description: 'Honor status',
    example: 'With Honors',
    enum: ['None', 'With Honors', 'High Honors', 'Highest Honors'],
  })
  @IsString()
  honor_status: string;
}
