import { IsString, IsNotEmpty, MaxLength, IsInt, Min } from 'class-validator';

export class CreateClubFaqDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  question: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  answer: string;

  @IsInt()
  @Min(0)
  order_index: number;
}
