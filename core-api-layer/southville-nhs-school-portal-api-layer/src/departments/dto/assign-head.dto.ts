import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignHeadDto {
  @ApiProperty({
    description: 'Teacher ID to assign as department head',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;
}
