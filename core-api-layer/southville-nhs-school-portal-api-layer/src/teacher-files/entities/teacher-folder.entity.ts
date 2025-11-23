import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TeacherFolder {
  @ApiProperty({
    description: 'Unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Folder name',
    example: 'Grade 10 Materials',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Folder description',
    example: 'Teaching materials for Grade 10 students',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Parent folder ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  parent_id?: string;

  @ApiPropertyOptional({
    description: 'Subject ID for folder organization',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  subject_id?: string;

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

  @ApiPropertyOptional({
    description: 'User who created',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  created_by?: string;

  @ApiPropertyOptional({
    description: 'User who last updated',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  updated_by?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T10:00:00Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  updated_at: string;
}

export class TeacherFolderWithChildren extends TeacherFolder {
  @ApiPropertyOptional({
    description: 'Child folders',
    type: [TeacherFolder],
    isArray: true,
  })
  children?: TeacherFolderWithChildren[];

  @ApiPropertyOptional({
    description: 'Number of files in folder',
    example: 5,
  })
  file_count?: number;

  @ApiPropertyOptional({
    description: 'Subject information',
  })
  subject?: {
    id: string;
    name: string;
  };
}
