# Teacher Files System - Implementation Plan

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Module Structure](#module-structure)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Security Implementation](#security-implementation)
7. [Performance Optimizations](#performance-optimizations)
8. [Implementation Details](#implementation-details)
9. [Configuration](#configuration)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Checklist](#deployment-checklist)

---

## Overview

### Purpose
An **admin-managed file library system** that allows administrators to organize and share files with teachers through a hierarchical folder structure, integrated with Cloudflare R2 storage and Supabase PostgreSQL.

### Key Features

- **Folder Hierarchy**: Unlimited nested folder structure
- **File Management**: Upload, update, soft delete, and restore files
- **Role-Based Access**:
  - **Admins**: Full CRUD control over folders and files
  - **Teachers**: Read-only access, can download files
- **R2 Storage Integration**: Secure file storage with presigned URLs
- **Download Analytics**: Track file downloads and usage
- **Soft Delete**: 30-day retention with recovery capability
- **Audit Trail**: Track who created, updated, or deleted resources

### Technology Stack

- **Backend**: NestJS 11 with TypeScript 5.7
- **HTTP Adapter**: Fastify (multipart file handling)
- **Database**: Supabase PostgreSQL with RLS
- **Storage**: Cloudflare R2 (S3-compatible)
- **Authentication**: Supabase Auth with JWT
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI

---

## System Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Client                         │
│                   (Next.js 15 / React)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS + JWT
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    NestJS API Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         TeacherFilesController                       │  │
│  │  • Folder Endpoints    • File Endpoints              │  │
│  │  • Analytics Endpoints                               │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│  ┌────────────────┴─────────────────────────────────────┐  │
│  │           Service Layer                              │  │
│  │  • FolderService         • FileStorageService        │  │
│  │  • FileDownloadLoggerService                         │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│  ┌────────────────┴─────────────────────────────────────┐  │
│  │         Guards & Middleware                          │  │
│  │  • SupabaseAuthGuard    • RolesGuard                 │  │
│  │  • ValidationPipe       • ThrottlerGuard             │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────┬────────────────┬────────────────────────┘
                    │                │
         ┌──────────▼─────┐   ┌─────▼────────────┐
         │   Supabase     │   │  Cloudflare R2   │
         │  PostgreSQL    │   │   (Storage)      │
         │  + RLS + Auth  │   │                  │
         └────────────────┘   └──────────────────┘
```

### Data Flow

#### **File Upload Flow (Admin Only)**
```
1. Admin uploads file via multipart/form-data
   ↓
2. SupabaseAuthGuard validates JWT token
   ↓
3. RolesGuard checks user role = 'Admin'
   ↓
4. Controller parses Fastify multipart stream
   ↓
5. Validate file size, MIME type, filename
   ↓
6. Generate unique R2 key: teacher-files/{folder_id}/{uuid}-{filename}
   ↓
7. Upload file to R2 storage
   ↓
8. Insert record to teacher_files table (using service client)
   ↓
9. Return file metadata with public URL
```

#### **File Download Flow (Admin + Teacher)**
```
1. User requests download URL for file ID
   ↓
2. SupabaseAuthGuard validates JWT token
   ↓
3. RolesGuard checks user role = 'Admin' OR 'Teacher'
   ↓
4. Query teacher_files table (RLS policy applies)
   ↓
5. If file exists and not deleted:
   ↓
6. Generate presigned URL (valid 1 hour)
   ↓
7. Log download attempt to teacher_file_downloads
   ↓
8. Return presigned URL to user
   ↓
9. User downloads directly from R2 via presigned URL
```

---

## Module Structure

```
src/teacher-files/
├── teacher-files.module.ts                # Module configuration
├── teacher-files.controller.ts            # REST API endpoints
│
├── entities/
│   ├── teacher-folder.entity.ts           # Folder interface
│   ├── teacher-file.entity.ts             # File interface
│   └── teacher-file-download.entity.ts    # Download log interface
│
├── dto/
│   ├── create-folder.dto.ts               # Create folder validation
│   ├── update-folder.dto.ts               # Update folder validation
│   ├── upload-file.dto.ts                 # File metadata DTO
│   ├── update-file.dto.ts                 # Update file validation
│   ├── folder-query.dto.ts                # Folder filtering/pagination
│   └── file-query.dto.ts                  # File filtering/pagination
│
└── services/
    ├── folder.service.ts                  # Folder CRUD operations
    ├── file-storage.service.ts            # R2 integration + file CRUD
    └── file-download-logger.service.ts    # Download tracking
```

---

## Database Schema

### Tables (Already Created in Supabase)

#### **teacher_folders**
```sql
CREATE TABLE public.teacher_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES teacher_folders(id) ON DELETE CASCADE,

  -- Soft Delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id),

  -- Audit Trail
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX idx_teacher_folders_parent_id ON teacher_folders(parent_id);
CREATE INDEX idx_teacher_folders_is_deleted ON teacher_folders(is_deleted);
```

#### **teacher_files**
```sql
CREATE TABLE public.teacher_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL REFERENCES teacher_folders(id) ON DELETE CASCADE,

  -- File Information
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- R2 Storage Integration
  file_url VARCHAR(500) NOT NULL,
  r2_file_key TEXT NOT NULL UNIQUE,
  file_size_bytes BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,

  -- Soft Delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id),

  -- Audit Trail
  uploaded_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX idx_teacher_files_folder_id ON teacher_files(folder_id);
CREATE INDEX idx_teacher_files_is_deleted ON teacher_files(is_deleted);
CREATE INDEX idx_teacher_files_r2_key ON teacher_files(r2_file_key);
CREATE INDEX idx_teacher_files_mime_type ON teacher_files(mime_type);
CREATE INDEX idx_teacher_files_created_at ON teacher_files(created_at);
```

#### **teacher_file_downloads**
```sql
CREATE TABLE public.teacher_file_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES teacher_files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  downloaded_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true
);
```

**Indexes:**
```sql
CREATE INDEX idx_teacher_file_downloads_file_id ON teacher_file_downloads(file_id);
CREATE INDEX idx_teacher_file_downloads_user_id ON teacher_file_downloads(user_id);
CREATE INDEX idx_teacher_file_downloads_downloaded_at ON teacher_file_downloads(downloaded_at);
```

### RLS Policies (Already Applied)

**Admins**: Full access to all operations
**Teachers**: Read-only access to non-deleted folders/files

---

## API Endpoints

### Base URL: `/api/v1/teacher-files`

### Folder Endpoints

| Method | Endpoint | Description | Roles | Request | Response |
|--------|----------|-------------|-------|---------|----------|
| **GET** | `/folders` | Get folder tree | Admin, Teacher | Query: `includeDeleted?` | Hierarchical folder tree |
| **GET** | `/folders/:id` | Get folder + files | Admin, Teacher | - | Folder with file list |
| **POST** | `/folders` | Create folder | Admin | `{ name, description?, parent_id? }` | Created folder |
| **PUT** | `/folders/:id` | Update folder | Admin | `{ name?, description? }` | Updated folder |
| **DELETE** | `/folders/:id` | Soft delete folder | Admin | - | Success message |
| **POST** | `/folders/:id/restore` | Restore folder | Admin | - | Restored folder |
| **PUT** | `/folders/:id/move` | Move folder | Admin | `{ parent_id }` | Updated folder |

### File Endpoints

| Method | Endpoint | Description | Roles | Request | Response |
|--------|----------|-------------|-------|---------|----------|
| **GET** | `/files` | Get files (filtered) | Admin, Teacher | Query: `folderId?, search?, mimeType?, page?, limit?` | Paginated file list |
| **GET** | `/files/:id` | Get file details | Admin, Teacher | - | File metadata |
| **POST** | `/files` | Upload file | Admin | Multipart: `file, folder_id, title, description?` | Created file metadata |
| **PUT** | `/files/:id` | Update file metadata | Admin | `{ title?, description?, folder_id? }` | Updated file |
| **POST** | `/files/:id/replace` | Replace file content | Admin | Multipart: `file` | Updated file |
| **DELETE** | `/files/:id` | Soft delete file | Admin | - | Success message |
| **POST** | `/files/:id/restore` | Restore file | Admin | - | Restored file |
| **GET** | `/files/:id/download-url` | Get presigned URL | Admin, Teacher | - | `{ url, expiresAt }` |

### Analytics Endpoints

| Method | Endpoint | Description | Roles | Response |
|--------|----------|-------------|-------|----------|
| **GET** | `/analytics/overview` | System-wide stats | Admin | Download counts, storage usage |
| **GET** | `/analytics/popular` | Most downloaded files | Admin | Top N files by downloads |
| **GET** | `/files/:id/downloads` | File download history | Admin | Download log for file |
| **GET** | `/analytics/my-downloads` | User download history | Admin, Teacher | User's download history |

---

## Security Implementation

### Authentication & Authorization

#### 1. **JWT Token Validation**

```typescript
// Every request requires valid Supabase JWT
@UseGuards(SupabaseAuthGuard)
export class TeacherFilesController {
  // SupabaseAuthGuard validates:
  // - JWT signature
  // - Token expiration
  // - User exists in database
}
```

#### 2. **Role-Based Access Control (RBAC)**

```typescript
// Admin-only endpoints
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('Admin')
@Post('folders')
async createFolder() { }

// Admin + Teacher endpoints
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('Admin', 'Teacher')
@Get('files/:id/download-url')
async getDownloadUrl() { }
```

#### 3. **Row-Level Security (RLS)**

All database queries are protected by Supabase RLS policies:

- **Teachers**: Can only SELECT non-deleted records
- **Admins**: Full access including soft-deleted records
- **Service Client**: Used for INSERT/UPDATE/DELETE (bypasses RLS)

```typescript
// Read operations (RLS applies)
const folder = await this.supabaseService
  .getClient()
  .from('teacher_folders')
  .select('*');

// Write operations (bypass RLS)
const { data } = await this.supabaseService
  .getServiceClient()
  .from('teacher_folders')
  .insert({ name, created_by: userId });
```

### File Upload Security

#### 1. **File Size Validation**

```typescript
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

if (fileBuffer.length > MAX_FILE_SIZE) {
  throw new BadRequestException('File exceeds maximum size of 50MB');
}
```

#### 2. **MIME Type Whitelist**

```typescript
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  'application/vnd.ms-excel', // XLS
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
  throw new BadRequestException(`File type ${mimeType} not allowed`);
}
```

#### 3. **Filename Sanitization**

```typescript
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars
    .replace(/_{2,}/g, '_')          // Replace multiple underscores
    .toLowerCase();
}
```

#### 4. **Content-Type Verification**

```typescript
// Verify MIME type matches file content (optional, requires magic-bytes)
import { fileTypeFromBuffer } from 'file-type';

const detectedType = await fileTypeFromBuffer(fileBuffer);
if (detectedType?.mime !== declaredMimeType) {
  throw new BadRequestException('File content does not match declared type');
}
```

### R2 Storage Security

#### 1. **Presigned URLs (Temporary Access)**

```typescript
// Generate URL valid for 1 hour only
const presignedUrl = await this.r2StorageService.generatePresignedUrl(
  file.r2_file_key,
  3600 // 1 hour expiration
);
```

#### 2. **Private Bucket Configuration**

- R2 bucket is **NOT publicly accessible**
- All access via presigned URLs only
- URLs expire after configured duration

#### 3. **R2 Key Namespacing**

```typescript
// Keys are organized by folder to prevent collisions
const r2Key = `teacher-files/${folderId}/${uuid}-${sanitizedFilename}`;
```

### Input Validation

#### 1. **DTO Validation (class-validator)**

```typescript
export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9 ._-]+$/, {
    message: 'Folder name contains invalid characters'
  })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsUUID()
  parent_id?: string;
}
```

#### 2. **Global Validation Pipe**

```typescript
// Already configured in main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // Strip unknown properties
    forbidNonWhitelisted: true,   // Throw error on unknown properties
    transform: true,              // Auto-transform to DTO types
  }),
);
```

### Rate Limiting

#### 1. **Global Rate Limit**

```typescript
// Already configured in app.module.ts
ThrottlerModule.forRoot([
  {
    ttl: 60000,  // 1 minute
    limit: 100,  // 100 requests per minute
  },
]),
```

#### 2. **File Upload Rate Limit (Recommended)**

```typescript
// Custom guard for file uploads
@UseGuards(UploadThrottleGuard)
@Post('files')
async uploadFile() { }

// UploadThrottleGuard.ts
@Injectable()
export class UploadThrottleGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;

    // Check Redis or DB for upload count in last hour
    const uploadCount = await this.getUploadCount(userId, 3600);

    if (uploadCount >= 20) { // 20 uploads per hour
      throw new ThrottlerException('Upload limit exceeded. Try again later.');
    }

    return true;
  }
}
```

### Security Best Practices

- ✅ **Never expose service role key** to frontend
- ✅ **Always validate user permissions** before operations
- ✅ **Use presigned URLs** for file downloads (never direct URLs)
- ✅ **Sanitize all file names** before storage
- ✅ **Validate MIME types** against whitelist
- ✅ **Implement rate limiting** on upload endpoints
- ✅ **Log all file operations** for audit trail
- ✅ **Use soft delete** to prevent accidental data loss
- ✅ **Enable RLS** on all tables
- ✅ **Use HTTPS only** in production

---

## Performance Optimizations

### Database Performance

#### 1. **Indexes (Already Created)**

All critical query paths are indexed:

```sql
-- Folder queries
CREATE INDEX idx_teacher_folders_parent_id ON teacher_folders(parent_id);
CREATE INDEX idx_teacher_folders_is_deleted ON teacher_folders(is_deleted);

-- File queries
CREATE INDEX idx_teacher_files_folder_id ON teacher_files(folder_id);
CREATE INDEX idx_teacher_files_is_deleted ON teacher_files(is_deleted);
CREATE INDEX idx_teacher_files_r2_key ON teacher_files(r2_file_key);
CREATE INDEX idx_teacher_files_mime_type ON teacher_files(mime_type);

-- Download logs
CREATE INDEX idx_teacher_file_downloads_file_id ON teacher_file_downloads(file_id);
CREATE INDEX idx_teacher_file_downloads_user_id ON teacher_file_downloads(user_id);
CREATE INDEX idx_teacher_file_downloads_downloaded_at ON teacher_file_downloads(downloaded_at);
```

#### 2. **Query Optimization**

**Use SELECT specific columns** instead of `*`:

```typescript
// Bad
const folders = await supabase.from('teacher_folders').select('*');

// Good
const folders = await supabase
  .from('teacher_folders')
  .select('id, name, parent_id, is_deleted');
```

**Limit result sets** with pagination:

```typescript
const { data, error, count } = await supabase
  .from('teacher_files')
  .select('*', { count: 'exact' })
  .eq('is_deleted', false)
  .range(offset, offset + limit - 1)
  .order('created_at', { ascending: false });
```

**Use proper filtering**:

```typescript
// Apply filters to reduce result set
const query = supabase
  .from('teacher_files')
  .select('*')
  .eq('is_deleted', false);

if (folderId) {
  query.eq('folder_id', folderId);
}

if (mimeType) {
  query.eq('mime_type', mimeType);
}

if (searchTerm) {
  query.ilike('title', `%${searchTerm}%`);
}
```

#### 3. **Connection Pooling**

Supabase client already uses connection pooling, but ensure:

```typescript
// Reuse Supabase client instances (already done in SupabaseService)
@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;
  private readonly serviceClient: SupabaseClient;

  constructor(private configService: ConfigService) {
    // Initialize once, reuse everywhere
    this.client = createClient(url, anonKey);
    this.serviceClient = createClient(url, serviceKey);
  }
}
```

### R2 Storage Performance

#### 1. **Multipart Uploads (Large Files)**

```typescript
// For files > 10MB, use multipart upload
if (fileSize > 10 * 1024 * 1024) {
  await this.r2StorageService.uploadLargeFile(key, buffer, {
    partSize: 5 * 1024 * 1024, // 5MB chunks
    concurrency: 3,             // 3 parallel uploads
  });
} else {
  await this.r2StorageService.uploadFile(key, buffer);
}
```

#### 2. **Presigned URL Caching**

```typescript
// Cache presigned URLs for short duration (5 minutes)
// This prevents regenerating URLs for same file in quick succession
import { Cache } from 'cache-manager';

async generateDownloadUrl(fileId: string): Promise<string> {
  const cacheKey = `presigned-url:${fileId}`;

  // Check cache first
  let url = await this.cacheManager.get<string>(cacheKey);

  if (!url) {
    // Generate new URL
    url = await this.r2StorageService.generatePresignedUrl(key, 3600);

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, url, 300);
  }

  return url;
}
```

#### 3. **CDN Integration (Optional)**

If using Cloudflare CDN with R2:

```typescript
// Use public CDN URL for frequently accessed files
const publicUrl = `https://cdn.yourdomain.com/teacher-files/${r2Key}`;
```

### API Response Performance

#### 1. **Pagination**

```typescript
export class FileQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}

// In service
const offset = (page - 1) * limit;
const { data, count } = await supabase
  .from('teacher_files')
  .select('*', { count: 'exact' })
  .range(offset, offset + limit - 1);

return {
  data,
  pagination: {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
  },
};
```

#### 2. **Lazy Loading Relationships**

```typescript
// Don't always fetch related data
// Option 1: Basic file list (no relationships)
const files = await supabase
  .from('teacher_files')
  .select('id, title, file_size_bytes, created_at');

// Option 2: With folder info (when needed)
const filesWithFolder = await supabase
  .from('teacher_files')
  .select(`
    *,
    folder:teacher_folders!inner(id, name)
  `);

// Option 3: Full details (expensive, use sparingly)
const fileDetails = await supabase
  .from('teacher_files')
  .select(`
    *,
    folder:teacher_folders!inner(id, name, parent_id),
    uploader:users!uploaded_by(id, full_name, email)
  `)
  .eq('id', fileId)
  .single();
```

#### 3. **Response Compression**

Already enabled in `main.ts`:

```typescript
import compression from '@fastify/compress';

app.register(compression, {
  encodings: ['gzip', 'deflate'],
});
```

### Caching Strategy

#### 1. **Folder Tree Caching**

```typescript
// Cache folder tree for 5 minutes (it doesn't change often)
@Injectable()
export class FolderService {
  async getFolderTree(includeDeleted = false): Promise<TeacherFolderTree> {
    const cacheKey = `folder-tree:${includeDeleted}`;

    let tree = await this.cacheManager.get<TeacherFolderTree>(cacheKey);

    if (!tree) {
      const folders = await this.fetchAllFolders(includeDeleted);
      tree = this.buildTree(folders);

      // Cache for 5 minutes
      await this.cacheManager.set(cacheKey, tree, 300);
    }

    return tree;
  }

  // Invalidate cache when folder changes
  async createFolder(dto: CreateFolderDto): Promise<TeacherFolder> {
    const folder = await this.create(dto);

    // Clear cache
    await this.cacheManager.del('folder-tree:false');
    await this.cacheManager.del('folder-tree:true');

    return folder;
  }
}
```

#### 2. **File Metadata Caching**

```typescript
// Cache individual file metadata for 10 minutes
async getFile(id: string): Promise<TeacherFile> {
  const cacheKey = `file:${id}`;

  let file = await this.cacheManager.get<TeacherFile>(cacheKey);

  if (!file) {
    file = await this.fetchFile(id);
    await this.cacheManager.set(cacheKey, file, 600);
  }

  return file;
}
```

### Monitoring & Logging

#### 1. **Query Performance Logging**

```typescript
// Log slow queries
const startTime = Date.now();
const result = await supabase.from('teacher_files').select('*');
const duration = Date.now() - startTime;

if (duration > 1000) { // Log queries > 1 second
  this.logger.warn(`Slow query detected: ${duration}ms`, {
    table: 'teacher_files',
    operation: 'select',
  });
}
```

#### 2. **R2 Operation Metrics**

```typescript
// Track R2 upload/download times
const uploadStart = Date.now();
await this.r2StorageService.uploadFile(key, buffer);
const uploadDuration = Date.now() - uploadStart;

this.logger.log(`R2 upload completed: ${uploadDuration}ms`, {
  fileSize: buffer.length,
  key,
});
```

---

## Implementation Details

### 1. Entities

#### teacher-folder.entity.ts

```typescript
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
    type: [TeacherFolderWithChildren],
  })
  children?: TeacherFolderWithChildren[];

  @ApiPropertyOptional({
    description: 'Number of files in folder',
    example: 5,
  })
  file_count?: number;
}
```

#### teacher-file.entity.ts

```typescript
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
    type: 'object',
  })
  folder?: {
    id: string;
    name: string;
    parent_id?: string;
  };

  @ApiPropertyOptional({
    description: 'Uploader information',
    type: 'object',
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
```

### 2. DTOs

#### create-folder.dto.ts

```typescript
import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty({
    description: 'Folder name',
    example: 'Grade 10 Materials',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Folder description',
    example: 'Teaching materials for Grade 10 students',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Parent folder ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  parent_id?: string;
}
```

#### update-folder.dto.ts

```typescript
import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFolderDto {
  @ApiPropertyOptional({
    description: 'Folder name',
    example: 'Updated Folder Name',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Folder description',
    example: 'Updated description',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Parent folder ID (to move folder)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  parent_id?: string;
}
```

#### folder-query.dto.ts

```typescript
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class FolderQueryDto {
  @ApiPropertyOptional({
    description: 'Include soft-deleted folders',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeDeleted?: boolean = false;
}
```

#### upload-file.dto.ts

```typescript
import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    description: 'Folder ID to upload file to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  folder_id: string;

  @ApiProperty({
    description: 'File title',
    example: 'Math Quiz - Algebra',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'File description',
    example: 'Quiz covering algebraic equations',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'File to upload',
    type: 'string',
    format: 'binary',
  })
  file: any; // Handled by Fastify multipart
}
```

#### file-query.dto.ts

```typescript
import { IsOptional, IsUUID, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FileQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by folder ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional({
    description: 'Search in title and description',
    example: 'algebra',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by MIME type',
    example: 'application/pdf',
  })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}
```

### 3. Services

Services will be implemented in the next phase with full R2 integration, following the modules system pattern.

---

## Configuration

### Environment Variables

Add to `.env`:

```bash
# Teacher Files Configuration
TEACHER_FILES_MAX_SIZE=52428800                           # 50MB max file size
TEACHER_FILES_SOFT_DELETE_RETENTION_DAYS=30               # Keep deleted files for 30 days
TEACHER_FILES_PRESIGNED_URL_EXPIRATION=3600               # 1 hour URL validity

# Allowed MIME Types (comma-separated)
TEACHER_FILES_ALLOWED_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,image/jpeg,image/png,image/webp,image/gif

# Rate Limiting
TEACHER_FILES_UPLOAD_RATE_LIMIT=20                        # 20 uploads per hour (admin only)
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('FolderService', () => {
  let service: FolderService;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FolderService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    service = module.get<FolderService>(FolderService);
  });

  it('should create folder', async () => {
    const dto = { name: 'Test Folder', description: 'Test' };
    const result = await service.create(dto, 'user-id');
    expect(result.name).toBe('Test Folder');
  });

  it('should build folder tree', () => {
    const folders = [
      { id: '1', name: 'Root', parent_id: null },
      { id: '2', name: 'Child', parent_id: '1' },
    ];
    const tree = service.buildTree(folders);
    expect(tree[0].children).toHaveLength(1);
  });
});
```

### Integration Tests

```typescript
describe('TeacherFilesController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth token
    authToken = await getTestAuthToken();
  });

  it('should upload file (Admin)', async () => {
    return request(app.getHttpServer())
      .post('/api/v1/teacher-files/files')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', 'test.pdf')
      .field('folder_id', 'test-folder-id')
      .field('title', 'Test File')
      .expect(201);
  });

  it('should reject file upload (Teacher)', async () => {
    const teacherToken = await getTeacherAuthToken();

    return request(app.getHttpServer())
      .post('/api/v1/teacher-files/files')
      .set('Authorization', `Bearer ${teacherToken}`)
      .attach('file', 'test.pdf')
      .expect(403);
  });

  it('should get download URL (Teacher)', async () => {
    const teacherToken = await getTeacherAuthToken();

    const response = await request(app.getHttpServer())
      .get('/api/v1/teacher-files/files/test-file-id/download-url')
      .set('Authorization', `Bearer ${teacherToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('url');
    expect(response.body).toHaveProperty('expiresAt');
  });
});
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database tables created with indexes
- [ ] RLS policies applied and tested
- [ ] R2 bucket created and configured
- [ ] R2 access keys generated
- [ ] Unit tests passing
- [ ] Integration tests passing

### Deployment

- [ ] Build application: `npm run build`
- [ ] Run production: `npm run start:prod`
- [ ] Verify health endpoint: `GET /api/health`
- [ ] Test admin file upload
- [ ] Test teacher file download
- [ ] Verify presigned URLs work
- [ ] Check Swagger docs: `/api/docs`

### Post-Deployment

- [ ] Monitor error logs
- [ ] Check R2 storage usage
- [ ] Verify RLS policies blocking unauthorized access
- [ ] Test soft delete and restore
- [ ] Monitor API response times
- [ ] Set up automated backup for deleted files
- [ ] Configure cron job for permanent deletion (30 days)

---

## Summary

This implementation plan provides a **complete, production-ready teacher files system** with:

- ✅ **Secure file storage** with R2 and presigned URLs
- ✅ **Role-based access control** (Admin full access, Teacher read-only)
- ✅ **Folder hierarchy** with unlimited nesting
- ✅ **Soft delete** with 30-day retention
- ✅ **Download analytics** and audit logging
- ✅ **Performance optimizations** (indexes, caching, pagination)
- ✅ **Security best practices** (input validation, rate limiting, RLS)
- ✅ **Comprehensive testing** strategy
- ✅ **Production deployment** checklist

**Next Step**: Begin implementation starting with module structure and entities.
