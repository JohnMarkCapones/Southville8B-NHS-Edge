import { IsArray, ArrayMinSize, ArrayMaxSize, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignStudentsDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one student is required' })
  @ArrayMaxSize(50, { message: 'Maximum 50 students allowed per request' })
  @IsUUID('4', { each: true })
  @ApiProperty({
    description: 'Array of student IDs to assign to the schedule',
    type: [String],
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
    maxItems: 50,
    minItems: 1,
  })
  studentIds: string[];
}
