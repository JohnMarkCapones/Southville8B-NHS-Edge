import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  IsOptional,
  MaxLength,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  @Matches(/^[A-Z0-9-]+$/, {
    message:
      'Subject code must contain only uppercase letters, numbers, and hyphens',
  })
  code: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsBoolean()
  @IsOptional()
  isElective?: boolean;

  @IsInt()
  @Min(0)
  @Max(30)
  @IsOptional()
  credits?: number;
}
