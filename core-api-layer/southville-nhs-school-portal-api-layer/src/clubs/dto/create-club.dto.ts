import {
  IsString,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiProperty({
    description: 'Domain ID that this club belongs to',
    example: 'b9a9b3e4-5c5f-47b7-8ad5-89f09f0e1234',
  })
  @IsUUID()
  @IsNotEmpty()
  domain_id: string;
}
