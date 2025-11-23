import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MarkNotificationReadDto {
  @ApiPropertyOptional({
    description: 'Timestamp when notification was read (optional, defaults to now)',
    example: '2024-01-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  read_at?: string;
}

