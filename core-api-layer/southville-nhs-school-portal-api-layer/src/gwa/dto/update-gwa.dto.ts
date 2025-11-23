import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGwaDto {
  @ApiProperty({
    description: 'General Weighted Average (50-100)',
    example: 87.5,
    minimum: 50,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(100)
  gwa?: number;

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
    required: false,
  })
  @IsOptional()
  @IsString()
  honor_status?: string;
}
