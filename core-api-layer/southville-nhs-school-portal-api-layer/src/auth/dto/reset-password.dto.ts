import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'User ID whose password will be reset',
    example: 'b4c3204d-1f85-4256-9b9d-cdbc9f768527',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
