import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDomainDto {
  @ApiProperty({
    description: 'Domain type',
    example: 'club',
    enum: ['club', 'event', 'project'],
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Domain name',
    example: 'Math Club',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateClubDomainDto {
  @ApiProperty({
    description: 'Club name',
    example: 'Math Club',
  })
  @IsString()
  @IsNotEmpty()
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
}
