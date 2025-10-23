import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  MinLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuizChoiceDto {
  @IsString()
  @MinLength(1)
  @ApiProperty({
    example: '4',
    description: 'Choice text',
    minLength: 1,
  })
  choiceText: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Is this the correct answer',
    default: false,
    required: false,
  })
  isCorrect?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 0,
    description: 'Order index for the choice',
    required: false,
    minimum: 0,
  })
  orderIndex?: number;

  @IsOptional()
  @ApiProperty({
    example: { pairId: 'A' },
    description: 'Additional metadata for complex question types',
    required: false,
  })
  metadata?: any;
}
