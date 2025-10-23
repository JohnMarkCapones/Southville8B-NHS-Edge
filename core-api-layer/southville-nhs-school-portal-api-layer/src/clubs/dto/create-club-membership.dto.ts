import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClubMembershipDto {
  @ApiProperty({ description: 'Student ID', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'Club ID', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  clubId: string;

  @ApiProperty({ description: 'Position ID', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  positionId: string;

  @ApiPropertyOptional({ description: 'Join date', example: '2025-01-15' })
  @IsOptional()
  @IsDateString()
  joinedAt?: string;

  @ApiPropertyOptional({ description: 'Is active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
