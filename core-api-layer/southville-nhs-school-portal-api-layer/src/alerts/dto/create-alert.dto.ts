import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlertType } from '../entities/alert.entity';

export class CreateAlertDto {
  @ApiProperty({
    description: 'Alert type',
    example: 'info',
    enum: AlertType,
  })
  @IsEnum(AlertType)
  @IsNotEmpty()
  type: AlertType;

  @ApiProperty({
    description: 'Alert title',
    example: 'System Maintenance Notice',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiProperty({
    description: 'Alert message content',
    example: 'The system will be under maintenance from 2:00 AM to 4:00 AM.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: 'Alert expiration date (ISO string)',
    example: '2024-01-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}
