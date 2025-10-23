import { IsString, IsNotEmpty, MaxLength, IsInt, Min } from 'class-validator';

export class CreateClubGoalDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  goal_text: string;

  @IsInt()
  @Min(0)
  order_index: number;
}
