import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Module {
  @ApiProperty({
    description: 'Unique identifier for the module',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Title of the module',
    example: 'Introduction to Biology',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the module',
    example: 'Basic concepts of biology for beginners',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'URL to the module file',
    example: 'https://example.com/modules/biology-intro.pdf',
  })
  file_url?: string;

  @ApiPropertyOptional({
    description: 'ID of the user who uploaded the module',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uploaded_by?: string;

  @ApiPropertyOptional({
    description: 'Cloudflare R2 storage key path',
    example: 'modules/123e4567-e89b-12d3-a456-426614174000/biology-intro.pdf',
  })
  r2_file_key?: string;

  @ApiPropertyOptional({
    description: 'File size in bytes',
    example: 2048576,
  })
  file_size_bytes?: number;

  @ApiPropertyOptional({
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  mime_type?: string;

  @ApiProperty({
    description:
      'Whether module is global (accessible to all teachers of same subject) or section-specific',
    default: false,
  })
  is_global: boolean;

  @ApiProperty({
    description: 'Soft delete flag - files retained for 30 days',
    default: false,
  })
  is_deleted: boolean;

  @ApiPropertyOptional({
    description: 'Timestamp when module was deleted',
    example: '2024-01-15T10:30:00Z',
  })
  deleted_at?: string;

  @ApiPropertyOptional({
    description: 'ID of the user who deleted the module',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  deleted_by?: string;

  @ApiPropertyOptional({
    description:
      'Subject ID for global module access control - only teachers with this subject can access',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  subject_id?: string;

  @ApiProperty({
    description: 'Timestamp when module was created',
    example: '2024-01-01T10:00:00Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'Timestamp when module was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  updated_at: string;
}

export class SectionModule {
  @ApiProperty({
    description: 'Unique identifier for the section-module assignment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Section ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  section_id: string;

  @ApiProperty({
    description: 'Module ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  module_id: string;

  @ApiProperty({
    description: 'Whether the module is visible to students in this section',
    default: true,
  })
  visible: boolean;

  @ApiProperty({
    description: 'Timestamp when module was assigned to section',
    example: '2024-01-01T10:00:00Z',
  })
  assigned_at: string;

  @ApiPropertyOptional({
    description: 'ID of the user who assigned the module to the section',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  assigned_by?: string;
}

export class ModuleWithDetails extends Module {
  @ApiPropertyOptional({
    description: 'Uploader information',
    type: 'object',
    properties: {
      id: { type: 'string' },
      full_name: { type: 'string' },
      email: { type: 'string' },
    },
  })
  uploader?: {
    id: string;
    full_name: string;
    email: string;
  };

  @ApiPropertyOptional({
    description: 'Subject information for global modules',
    type: 'object',
    properties: {
      id: { type: 'string' },
      subject_name: { type: 'string' },
      description: { type: 'string' },
    },
  })
  subject?: {
    id: string;
    subject_name: string;
    description?: string;
  };

  @ApiPropertyOptional({
    description: 'Sections assigned to this module (for non-global modules)',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        grade_level: { type: 'string' },
      },
    },
  })
  sections?: Array<{
    id: string;
    name: string;
    grade_level?: string;
  }>;

  @ApiPropertyOptional({
    description: 'Download statistics',
    type: 'object',
    properties: {
      totalDownloads: { type: 'number' },
      uniqueUsers: { type: 'number' },
      successRate: { type: 'number' },
      lastDownloaded: { type: 'string' },
    },
  })
  downloadStats?: {
    totalDownloads: number;
    uniqueUsers: number;
    successRate: number;
    lastDownloaded?: string;
  };
}
