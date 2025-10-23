import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TeacherFileDownload {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'File ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  file_id: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  user_id: string;

  @ApiProperty({
    description: 'Download timestamp',
    example: '2024-01-15T14:30:00Z',
  })
  downloaded_at: string;

  @ApiPropertyOptional({
    description: 'User IP address',
    example: '192.168.1.1',
  })
  ip_address?: string;

  @ApiPropertyOptional({
    description: 'User agent string',
    example: 'Mozilla/5.0...',
  })
  user_agent?: string;

  @ApiProperty({
    description: 'Download success flag',
    default: true,
  })
  success: boolean;
}
