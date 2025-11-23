import {
  IsString,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  MaxLength,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
  IsEmail,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateClubGoalDto } from './create-club-goal.dto';
import { CreateClubBenefitDto } from './create-club-benefit.dto';
import { CreateClubFaqDto } from './create-club-faq.dto';

export class CreateClubDto {
  @ApiProperty({
    description: 'Club name',
    example: 'Math Club',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Club description',
    example: 'A club for mathematics enthusiasts',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'President user ID',
    example: 'e1caec49-f61d-4158-bac7-1dd456e9976b',
  })
  @IsOptional()
  @IsUUID()
  president_id?: string;

  @ApiPropertyOptional({
    description: 'Vice President user ID',
    example: 'e1caec49-f61d-4158-bac7-1dd456e9976b',
  })
  @IsOptional()
  @IsUUID()
  vp_id?: string;

  @ApiPropertyOptional({
    description: 'Secretary user ID',
    example: 'e1caec49-f61d-4158-bac7-1dd456e9976b',
  })
  @IsOptional()
  @IsUUID()
  secretary_id?: string;

  @ApiPropertyOptional({
    description: 'Advisor user ID',
    example: 'e1caec49-f61d-4158-bac7-1dd456e9976b',
  })
  @IsOptional()
  @IsUUID()
  advisor_id?: string;

  @ApiPropertyOptional({
    description: 'Co-Advisor user ID',
    example: 'e1caec49-f61d-4158-bac7-1dd456e9976b',
  })
  @IsOptional()
  @IsUUID()
  co_advisor_id?: string;

  @ApiPropertyOptional({
    description: 'Domain ID that this club belongs to',
    example: 'b9a9b3e4-5c5f-47b7-8ad5-89f09f0e1234',
  })
  @IsOptional()
  @IsUUID()
  domain_id?: string;

  @ApiPropertyOptional({
    description: 'Club mission statement',
    example: 'To foster scientific curiosity and innovation among students',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  mission_statement?: string;

  @ApiPropertyOptional({
    description: 'Official club email address',
    example: 'mathclub@southville8b.edu.ph',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    description: 'Number of championship wins',
    example: 5,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  championship_wins?: number;

  @ApiPropertyOptional({
    description: 'Benefits section title',
    example: 'Why Join Our Club?',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  benefits_title?: string;

  @ApiPropertyOptional({
    description: 'Benefits section description',
    example:
      'Join our club to develop leadership skills, network with peers, and participate in exciting competitions.',
  })
  @IsOptional()
  @IsString()
  benefits_description?: string;

  @ApiPropertyOptional({
    description: 'Club image/logo URL (Cloudflare Images public URL)',
    example: 'https://imagedelivery.net/<account-hash>/<image-id>/public',
  })
  @IsOptional()
  @IsString()
  club_image?: string;

  @ApiPropertyOptional({
    description: 'Club logo URL (Cloudflare Images public URL)',
    example: 'https://imagedelivery.net/<account-hash>/<logo-id>/public',
  })
  @IsOptional()
  @IsString()
  club_logo?: string;

  @ApiPropertyOptional({
    description: 'Club goals (max 5)',
    type: [CreateClubGoalDto],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => CreateClubGoalDto)
  goals?: CreateClubGoalDto[];

  @ApiPropertyOptional({
    description: 'Club membership benefits (max 6)',
    type: [CreateClubBenefitDto],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => CreateClubBenefitDto)
  benefits?: CreateClubBenefitDto[];

  @ApiPropertyOptional({
    description: 'Club FAQs',
    type: [CreateClubFaqDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClubFaqDto)
  faqs?: CreateClubFaqDto[];
}
