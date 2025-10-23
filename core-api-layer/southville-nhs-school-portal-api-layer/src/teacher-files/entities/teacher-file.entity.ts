import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TeacherFile {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Folder ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  folder_id: string;

  @ApiProperty({
    description: 'File title',
    example: 'Math Quiz - Algebra',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'File description',
    example: 'Quiz covering algebraic equations',
  })
  description?: string;

  @ApiProperty({
    description: 'R2 public URL',
    example: 'https://bucket.r2.dev/teacher-files/folder-id/uuid-filename.pdf',
  })
  file_url: string;

  @ApiProperty({
    description: 'R2 storage key',
    example: 'teacher-files/folder-id/uuid-filename.pdf',
  })
  r2_file_key: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 2048576,
  })
  file_size_bytes: number;

  @ApiProperty({
    description: 'MIME type',
    example: 'application/pdf',
  })
  mime_type: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'algebra-quiz.pdf',
  })
  original_filename: string;

  @ApiProperty({
    description: 'Soft delete flag',
    default: false,
  })
  is_deleted: boolean;

  @ApiPropertyOptional({
    description: 'Deletion timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  deleted_at?: string;

  @ApiPropertyOptional({
    description: 'User who deleted',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  deleted_by?: string;

  @ApiProperty({
    description: 'User who uploaded',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uploaded_by: string;

  @ApiPropertyOptional({
    description: 'User who last updated',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  updated_by?: string;

  @ApiProperty({
    description: 'Upload timestamp',
    example: '2024-01-01T10:00:00Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  updated_at: string;
}

export class TeacherFileWithDetails extends TeacherFile {
  @ApiPropertyOptional({
    description: 'Folder information',
  })
  folder?: {
    id: string;
    name: string;
    parent_id?: string;
  };

  @ApiPropertyOptional({
    description: 'Uploader information',
  })
  uploader?: {
    id: string;
    full_name: string;
    email: string;
  };

  @ApiPropertyOptional({
    description: 'Download count',
    example: 25,
  })
  download_count?: number;
}
