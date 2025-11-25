import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateStudentActivityDto {
  @ApiProperty({
    description: 'Update visibility',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}
