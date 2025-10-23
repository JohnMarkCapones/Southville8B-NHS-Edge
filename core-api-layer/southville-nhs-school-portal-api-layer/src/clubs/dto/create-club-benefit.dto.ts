import { IsString, IsNotEmpty, MaxLength, IsInt, Min } from 'class-validator';

export class CreateClubBenefitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description: string;

  @IsInt()
  @Min(0)
  order_index: number;
}
