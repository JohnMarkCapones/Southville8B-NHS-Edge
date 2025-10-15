import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFaqDto {
  @ApiProperty({
    description: 'FAQ question',
    example: 'How do I reset my password?',
    minLength: 5,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(500)
  question: string;

  @ApiProperty({
    description: 'FAQ answer',
    example:
      'You can reset your password by clicking the "Forgot Password" link on the login page and following the instructions sent to your email.',
    minLength: 10,
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  answer: string;
}
