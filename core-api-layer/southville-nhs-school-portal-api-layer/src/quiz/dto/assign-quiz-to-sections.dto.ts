import {
  IsArray,
  IsUUID,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignQuizToSectionsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiProperty({
    example: ['550e8400-e29b-41d4-a716-446655440001'],
    description: 'Array of section IDs to assign quiz to',
    type: [String],
  })
  sectionIds: string[];

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2025-01-15T10:00:00Z',
    description: 'Override start date for these sections',
    required: false,
  })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2025-01-20T23:59:59Z',
    description: 'Override end date for these sections',
    required: false,
  })
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiProperty({
    example: 60,
    description: 'Override time limit in minutes for these sections',
    required: false,
  })
  timeLimit?: number;

  @IsOptional()
  @ApiProperty({
    example: { allowLateSub: true, latePenalty: 10 },
    description: 'Section-specific settings override',
    required: false,
  })
  sectionSettings?: any;
}
