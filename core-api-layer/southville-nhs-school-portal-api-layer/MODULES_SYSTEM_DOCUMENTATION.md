# Modules System Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [R2 Storage Integration](#r2-storage-integration)
5. [API Endpoints](#api-endpoints)
6. [Authentication & Authorization](#authentication--authorization)
7. [File Management](#file-management)
8. [Security Features](#security-features)
9. [Performance Optimizations](#performance-optimizations)
10. [Error Handling](#error-handling)
11. [Configuration](#configuration)
12. [Deployment](#deployment)
13. [Testing](#testing)
14. [Troubleshooting](#troubleshooting)

---

## Overview

The Modules System is a comprehensive file management solution for educational content, built with NestJS, Supabase, and Cloudflare R2. It provides secure file upload, storage, access control, and analytics for educational modules.

### Key Features

- **File Upload & Storage**: Secure file upload to Cloudflare R2 with validation
- **Role-Based Access Control**: Admin, Teacher, and Student permissions
- **Module Types**: Global modules (subject-wide) and section-specific modules
- **Download Analytics**: Track downloads, popular modules, and user engagement
- **Soft Delete**: Safe deletion with retention policies
- **Rate Limiting**: Prevent abuse with upload/download limits
- **Audit Logging**: Complete audit trail for all operations

### Technology Stack

- **Backend**: NestJS with TypeScript
- **Database**: Supabase PostgreSQL with Row-Level Security (RLS)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Authentication**: Supabase Auth with JWT
- **File Handling**: Fastify multipart support
- **Documentation**: Swagger/OpenAPI

---

## Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   NestJS API    │    │   Supabase      │
│   (Client)      │◄──►│   (Backend)     │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Cloudflare R2   │
                       │ (File Storage)  │
                       └─────────────────┘
```

### Module Structure

```
src/modules/
├── modules.controller.ts          # API endpoints
├── modules.service.ts             # Business logic
├── modules.module.ts              # Module configuration
├── dto/                          # Data Transfer Objects
│   ├── create-module.dto.ts
│   ├── update-module.dto.ts
│   ├── upload-module.dto.ts
│   ├── module-query.dto.ts
│   └── assign-module.dto.ts
├── entities/                     # TypeScript interfaces
│   └── module.entity.ts
├── services/                     # Service layer
│   ├── module-access.service.ts
│   ├── module-storage.service.ts
│   └── module-download-logger.service.ts
└── guards/                       # Security guards
    └── module-upload-throttle.guard.ts
```

---

## Database Schema

### Tables Overview

| Table                  | Purpose                    | Key Features                             |
| ---------------------- | -------------------------- | ---------------------------------------- |
| `modules`              | Core module data           | RLS policies, soft delete, file metadata |
| `section_modules`      | Module-section assignments | Visibility control, assignment tracking  |
| `module_download_logs` | Download analytics         | Success tracking, user behavior          |

### Modules Table

```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  file_url VARCHAR(255) NOT NULL,           -- R2 file URL
  uploaded_by UUID REFERENCES users(id),
  r2_file_key TEXT,                        -- R2 storage key
  file_size_bytes BIGINT,
  mime_type VARCHAR,
  is_global BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id),
  subject_id UUID REFERENCES subjects(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Key Fields:**

- `file_url`: Public URL for file access (VARCHAR(255) NOT NULL)
- `r2_file_key`: Internal R2 storage key for operations
- `is_global`: Determines access scope (global vs section-specific)
- `is_deleted`: Soft delete flag for data retention

### Section Modules Table

```sql
CREATE TABLE section_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id),
  module_id UUID NOT NULL REFERENCES modules(id),
  visible BOOLEAN DEFAULT true,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES users(id)
);
```

**Purpose:** Links modules to specific sections with visibility control.

### Module Download Logs Table

```sql
CREATE TABLE module_download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id),
  user_id UUID REFERENCES users(id),
  downloaded_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true
);
```

**Purpose:** Analytics and audit trail for all download attempts.

### Row-Level Security (RLS) Policies

#### Modules Table Policies

1. **Admins**: Full access to all modules
2. **Teachers**:
   - Can create modules
   - Can view global modules for their subject
   - Can manage their own modules
3. **Students**:
   - Can view global modules
   - Can view section-specific modules if enrolled

#### Section Modules Table Policies

- Teachers can assign modules to sections
- Students can view assignments for their sections
- Admins have full access

#### Download Logs Table Policies

- Users can only view their own download history
- Admins can view all download logs

---

## R2 Storage Integration

### Cloudflare R2 Configuration

```typescript
// src/config/r2.config.ts
export default registerAs('r2', () => ({
  // Core R2 Settings
  accountId: process.env.R2_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucketName: process.env.R2_BUCKET_NAME,
  region: process.env.R2_REGION || 'auto',
  publicUrl: process.env.R2_PUBLIC_URL,

  // Endpoint Configuration
  endpoint:
    process.env.R2_ENDPOINT ||
    `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,

  // File Upload Settings
  maxFileSize: parseInt(process.env.R2_MAX_FILE_SIZE || '10485760'), // 10MB
  allowedMimeTypes: [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ],

  // Performance Settings
  multipartThreshold: parseInt(
    process.env.R2_MULTIPART_THRESHOLD || '10485760',
  ),
  multipartChunksize: parseInt(process.env.R2_MULTIPART_CHUNKSIZE || '5242880'),
  maxConcurrency: parseInt(process.env.R2_MAX_CONCURRENCY || '3'),

  // Security Settings
  enableVirusScanning: process.env.R2_ENABLE_VIRUS_SCANNING === 'true',
  enableContentValidation: process.env.R2_ENABLE_CONTENT_VALIDATION !== 'false',

  // Cache Settings
  cacheControl: process.env.R2_CACHE_CONTROL || 'public, max-age=31536000',
  enableCdn: process.env.R2_ENABLE_CDN !== 'false',

  // Presigned URL Settings
  presignedUrlExpiration: parseInt(
    process.env.R2_PRESIGNED_URL_EXPIRATION || '3600',
  ),

  // Connection Settings
  connectionTimeout: parseInt(process.env.R2_CONNECTION_TIMEOUT || '30000'),
  requestTimeout: parseInt(process.env.R2_REQUEST_TIMEOUT || '60000'),
  maxRetries: parseInt(process.env.R2_MAX_RETRIES || '3'),
}));
```

### File Organization Structure

```
R2 Bucket Structure:
├── modules/
│   ├── global/
│   │   └── {subject_id}/
│   │       └── {uuid}-{filename}
│   └── sections/
│       └── {section_id}/
│           └── {uuid}-{filename}
└── .deleted/
    └── modules/
        └── {original_path}
```

**Key Patterns:**

- **Global modules**: `modules/global/{subject_id}/{uuid}-{filename}`
- **Section modules**: `modules/sections/{section_id}/{uuid}-{filename}`
- **Soft deleted**: `.deleted/{original_path}`

### R2StorageService Methods

```typescript
class R2StorageService {
  // Core Operations
  async uploadFile(
    key: string,
    body: Buffer,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<FileUploadResult>;
  async downloadFile(key: string): Promise<Buffer>;
  async deleteFile(key: string): Promise<boolean>;
  async copyFile(sourceKey: string, destinationKey: string): Promise<boolean>;

  // URL Generation
  async generatePresignedUrl(
    key: string,
    expirationSeconds?: number,
  ): Promise<string>;

  // File Information
  async getFileInfo(key: string): Promise<FileInfo>;
  async listFiles(prefix?: string): Promise<string[]>;

  // Connection Testing
  async testConnection(): Promise<R2ConnectionTest>;
}
```

---

## API Endpoints

### Base URL

```
/api/v1/modules
```

### Authentication

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Endpoints Overview

| Method | Endpoint                 | Description                    | Roles                   |
| ------ | ------------------------ | ------------------------------ | ----------------------- |
| POST   | `/`                      | Create module with file upload | Admin, Teacher          |
| GET    | `/`                      | Get accessible modules         | Admin, Teacher, Student |
| GET    | `/:id`                   | Get module details             | Admin, Teacher, Student |
| PUT    | `/:id`                   | Update module                  | Admin, Teacher          |
| DELETE | `/:id`                   | Soft delete module             | Admin, Teacher          |
| DELETE | `/:id/permanent`         | Permanent delete               | Admin                   |
| POST   | `/:id/upload`            | Upload file to existing module | Admin, Teacher          |
| GET    | `/:id/download-url`      | Get presigned download URL     | Admin, Teacher, Student |
| GET    | `/:id/stats`             | Get module statistics          | Admin, Teacher          |
| POST   | `/:id/assign`            | Assign module to sections      | Admin, Teacher          |
| PUT    | `/:id/assign/:sectionId` | Update assignment visibility   | Admin, Teacher          |
| DELETE | `/:id/assign/:sectionId` | Remove assignment              | Admin, Teacher          |
| GET    | `/analytics/overview`    | Get download analytics         | Admin                   |
| GET    | `/popular`               | Get popular modules            | Admin, Teacher          |

### Detailed Endpoint Documentation

#### 1. Create Module with File Upload

**POST** `/api/v1/modules`

Creates a new module and uploads a file in a single operation.

**Content-Type:** `multipart/form-data`

**Request Body:**

```typescript
{
  file: File,                    // Required - Module file
  title: string,                 // Required - Module title
  description?: string,          // Optional - Module description
  isGlobal: boolean,             // Optional - Global vs section-specific
  subjectId?: string,            // Required if isGlobal = true
  sectionIds?: string[]          // Required if isGlobal = false
}
```

**Example Request:**

```bash
curl -X POST 'http://localhost:3000/api/v1/modules' \
  -H 'Authorization: Bearer <jwt-token>' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@module.pdf;type=application/pdf' \
  -F 'title=Introduction to Biology' \
  -F 'description=Basic biology concepts' \
  -F 'isGlobal=true' \
  -F 'subjectId=123e4567-e89b-12d3-a456-426614174000'
```

**Response (201 Created):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Introduction to Biology",
  "description": "Basic biology concepts",
  "file_url": "https://your-bucket.r2.dev/modules/global/subject-id/uuid-filename.pdf",
  "uploaded_by": "123e4567-e89b-12d3-a456-426614174000",
  "r2_file_key": "modules/global/subject-id/uuid-filename.pdf",
  "file_size_bytes": 2048576,
  "mime_type": "application/pdf",
  "is_global": true,
  "is_deleted": false,
  "subject_id": "123e4567-e89b-12d3-a456-426614174000",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

#### 2. Get Accessible Modules

**GET** `/api/v1/modules`

Retrieves modules accessible to the current user based on their role and permissions.

**Query Parameters:**

```typescript
{
  page?: number,                 // Page number (default: 1)
  limit?: number,                // Items per page (default: 10)
  search?: string,                // Search in title/description
  subjectId?: string,            // Filter by subject
  sectionId?: string,            // Filter by section
  isGlobal?: boolean,            // Filter by global modules
  uploadedBy?: string,           // Filter by uploader
  includeDeleted?: boolean,      // Include deleted modules (default: false)
  sortBy?: string,               // Sort field (default: 'created_at')
  sortOrder?: 'asc' | 'desc'     // Sort order (default: 'desc')
}
```

**Example Request:**

```bash
curl -X GET 'http://localhost:3000/api/v1/modules?page=1&limit=10&isGlobal=true' \
  -H 'Authorization: Bearer <jwt-token>'
```

**Response (200 OK):**

```json
{
  "modules": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Introduction to Biology",
      "description": "Basic biology concepts",
      "file_url": "https://your-bucket.r2.dev/modules/global/subject-id/uuid-filename.pdf",
      "uploaded_by": "123e4567-e89b-12d3-a456-426614174000",
      "r2_file_key": "modules/global/subject-id/uuid-filename.pdf",
      "file_size_bytes": 2048576,
      "mime_type": "application/pdf",
      "is_global": true,
      "is_deleted": false,
      "subject_id": "123e4567-e89b-12d3-a456-426614174000",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z",
      "uploader": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "full_name": "John Doe",
        "email": "john.doe@example.com"
      },
      "subject": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "subject_name": "Biology",
        "description": "Life sciences"
      },
      "sections": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "Grade 10-A",
          "grade_level": "10"
        }
      ],
      "downloadStats": {
        "totalDownloads": 25,
        "uniqueUsers": 18,
        "successRate": 96.0,
        "lastDownloaded": "2024-01-15T14:30:00Z"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

#### 3. Get Module Download URL

**GET** `/api/v1/modules/:id/download-url`

Generates a presigned URL for secure file download.

**Example Request:**

```bash
curl -X GET 'http://localhost:3000/api/v1/modules/123e4567-e89b-12d3-a456-426614174000/download-url' \
  -H 'Authorization: Bearer <jwt-token>'
```

**Response (200 OK):**

```json
{
  "url": "https://your-bucket.r2.dev/modules/global/subject-id/uuid-filename.pdf?X-Amz-Algorithm=...",
  "expiresAt": "2024-01-01T11:00:00Z"
}
```

#### 4. Get Module Statistics

**GET** `/api/v1/modules/:id/stats`

Retrieves download statistics for a specific module.

**Example Request:**

```bash
curl -X GET 'http://localhost:3000/api/v1/modules/123e4567-e89b-12d3-a456-426614174000/stats' \
  -H 'Authorization: Bearer <jwt-token>'
```

**Response (200 OK):**

```json
{
  "totalDownloads": 25,
  "uniqueUsers": 18,
  "successRate": 96.0,
  "lastDownloaded": "2024-01-15T14:30:00Z",
  "downloadsByDate": [
    {
      "date": "2024-01-15",
      "count": 5
    },
    {
      "date": "2024-01-14",
      "count": 8
    }
  ]
}
```

#### 5. Assign Module to Sections

**POST** `/api/v1/modules/:id/assign`

Assigns a module to one or more sections.

**Request Body:**

```json
{
  "sectionIds": [
    "123e4567-e89b-12d3-a456-426614174000",
    "987fcdeb-51a2-43d1-b789-123456789abc"
  ]
}
```

**Example Request:**

```bash
curl -X POST 'http://localhost:3000/api/v1/modules/123e4567-e89b-12d3-a456-426614174000/assign' \
  -H 'Authorization: Bearer <jwt-token>' \
  -H 'Content-Type: application/json' \
  -d '{"sectionIds": ["123e4567-e89b-12d3-a456-426614174000"]}'
```

**Response (201 Created):**

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "section_id": "123e4567-e89b-12d3-a456-426614174000",
    "module_id": "123e4567-e89b-12d3-a456-426614174000",
    "visible": true,
    "assigned_at": "2024-01-01T10:00:00Z",
    "assigned_by": "123e4567-e89b-12d3-a456-426614174000"
  }
]
```

---

## Authentication & Authorization

### Authentication Flow

1. **JWT Token**: All requests require valid JWT token from Supabase Auth
2. **Token Validation**: `SupabaseAuthGuard` validates token and extracts user info
3. **Role Extraction**: User role is extracted from JWT claims
4. **Permission Check**: `RolesGuard` enforces role-based access

### User Roles

#### Admin

- **Full Access**: All modules, all operations
- **Analytics**: Complete download analytics
- **Management**: Permanent delete, user management
- **Rate Limits**: No upload/download limits

#### Teacher

- **Module Creation**: Can create global and section-specific modules
- **Own Modules**: Full control over modules they uploaded
- **Global Access**: Can view global modules for their subject specialization
- **Section Management**: Can assign modules to sections
- **Rate Limits**: 10 uploads per hour, 100 downloads per hour
- **Analytics**: Can view statistics for their own modules

#### Student

- **Read Only**: Can view accessible modules
- **Global Modules**: Can view all global modules
- **Section Modules**: Can view modules assigned to their section
- **Download**: Can download accessible modules
- **Rate Limits**: 100 downloads per hour

### Permission Matrix

| Operation            | Admin | Teacher | Student |
| -------------------- | ----- | ------- | ------- |
| Create Module        | ✅    | ✅      | ❌      |
| Upload File          | ✅    | ✅      | ❌      |
| View All Modules     | ✅    | ❌      | ❌      |
| View Global Modules  | ✅    | ✅\*    | ✅      |
| View Section Modules | ✅    | ✅\*    | ✅\*    |
| Update Own Modules   | ✅    | ✅      | ❌      |
| Delete Own Modules   | ✅    | ✅      | ❌      |
| Permanent Delete     | ✅    | ❌      | ❌      |
| Assign to Sections   | ✅    | ✅      | ❌      |
| View Analytics       | ✅    | ✅\*    | ❌      |
| Download Files       | ✅    | ✅      | ✅      |

\*Subject to specific conditions (own modules, enrolled sections, etc.)

---

## File Management

### File Upload Process

1. **Validation**: File type, size, and content validation
2. **R2 Upload**: File uploaded to Cloudflare R2 with metadata
3. **Database Record**: Module record created with file information
4. **Section Assignment**: If section-specific, assigned to specified sections
5. **Audit Log**: Upload operation logged for tracking

### File Types Supported

```typescript
const allowedMimeTypes = [
  'application/pdf', // PDF documents
  'application/vnd.ms-powerpoint', // PowerPoint (.ppt)
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PowerPoint (.pptx)
  'application/msword', // Word (.doc)
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word (.docx)
  'image/jpeg', // JPEG images
  'image/png', // PNG images
  'image/webp', // WebP images
  'image/gif', // GIF images
  'text/csv', // CSV files
  'application/vnd.ms-excel', // Excel (.xls)
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel (.xlsx)
];
```

### File Size Limits

- **Default Maximum**: 10MB (10,485,760 bytes)
- **Configurable**: Via `R2_MAX_FILE_SIZE` environment variable
- **Multipart Upload**: Automatic for files > 10MB
- **Chunk Size**: 5MB chunks for large files

### File Validation

```typescript
// File validation checks
1. MIME type validation against allowed types
2. File size validation against maximum limit
3. Content validation (if enabled)
4. Virus scanning (if enabled)
5. Filename sanitization
6. Duplicate detection (optional)
```

### Soft Delete Process

1. **File Copy**: Original file copied to `.deleted/` prefix
2. **Database Update**: Module marked as deleted with timestamp
3. **Original Deletion**: Original file removed from active storage
4. **Retention**: Deleted files retained for configurable period
5. **Recovery**: Soft-deleted modules can be restored

---

## Security Features

### Row-Level Security (RLS)

All database tables have RLS policies enabled:

```sql
-- Enable RLS on all tables
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_download_logs ENABLE ROW LEVEL SECURITY;
```

### Access Control Policies

#### Modules Table Policies

```sql
-- Admins can manage all modules
CREATE POLICY "Admins can manage all modules" ON modules
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name = 'Admin'
  )
);

-- Teachers can insert modules
CREATE POLICY "Teachers can insert modules" ON modules
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.name = 'Teacher'
  ) AND uploaded_by = auth.uid()
);

-- Teachers can view global modules for their subject
CREATE POLICY "Teachers can view global modules for their subject" ON modules
FOR SELECT USING (
  is_deleted = false AND (
    (is_global = true AND EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      JOIN teachers t ON u.id = t.user_id
      WHERE u.id = auth.uid()
        AND r.name = 'Teacher'
        AND t.subject_specialization_id = modules.subject_id
    )) OR uploaded_by = auth.uid()
  )
);

-- Students can view accessible modules
CREATE POLICY "Students can view their section modules" ON modules
FOR SELECT USING (
  is_deleted = false AND (
    is_global = true OR EXISTS (
      SELECT 1 FROM students s
      JOIN section_modules sm ON s.section_id = sm.section_id
      WHERE s.user_id = auth.uid()
        AND sm.module_id = modules.id
        AND sm.visible = true
    )
  )
);
```

### Rate Limiting

#### Upload Rate Limiting

```typescript
// ModuleUploadThrottleGuard
- Teachers: 10 uploads per hour
- Admins: No limit (1000 uploads per hour)
- Students: Cannot upload (blocked at guard level)
```

#### Download Rate Limiting

```typescript
// Per-user download limits
- Teachers: 100 downloads per hour
- Students: 100 downloads per hour
- Admins: No limit
```

### File Security

1. **Presigned URLs**: Temporary, secure access to files
2. **Access Validation**: Every download request validated against permissions
3. **Audit Logging**: All file access attempts logged
4. **Content Validation**: File content validation (if enabled)
5. **Virus Scanning**: Optional virus scanning integration

### Input Validation

```typescript
// DTO Validation with class-validator
@IsString()
@IsNotEmpty()
title: string;

@IsOptional()
@IsString()
description?: string;

@IsOptional()
@IsBoolean()
isGlobal?: boolean;

@IsOptional()
@IsUUID()
subjectId?: string;

@IsOptional()
@IsArray()
@IsUUID('4', { each: true })
sectionIds?: string[];
```

---

## Performance Optimizations

### Database Optimizations

#### Indexes

```sql
-- Modules table indexes
CREATE INDEX idx_modules_uploaded_by ON modules(uploaded_by);
CREATE INDEX idx_modules_subject_id ON modules(subject_id);
CREATE INDEX idx_modules_is_global ON modules(is_global);
CREATE INDEX idx_modules_is_deleted ON modules(is_deleted);
CREATE INDEX idx_modules_created_at ON modules(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_modules_global_subject ON modules(is_global, subject_id)
WHERE is_global = true AND is_deleted = false;

CREATE INDEX idx_modules_user_global ON modules(uploaded_by, is_global)
WHERE is_deleted = false;

-- Section modules indexes
CREATE INDEX idx_section_modules_section_id ON section_modules(section_id);
CREATE INDEX idx_section_modules_module_id ON section_modules(module_id);
CREATE INDEX idx_section_modules_visible ON section_modules(visible);

-- Download logs indexes
CREATE INDEX idx_download_logs_module_id ON module_download_logs(module_id);
CREATE INDEX idx_download_logs_user_id ON module_download_logs(user_id);
CREATE INDEX idx_download_logs_downloaded_at ON module_download_logs(downloaded_at);
```

#### Materialized Views

```sql
-- Popular modules materialized view
CREATE MATERIALIZED VIEW module_popularity AS
SELECT
  module_id,
  COUNT(*) as download_count,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(downloaded_at) as last_downloaded
FROM module_download_logs
WHERE success = true
GROUP BY module_id;

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_module_popularity()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW module_popularity;
END;
$$ LANGUAGE plpgsql;
```

### R2 Storage Optimizations

#### Connection Pooling

```typescript
// R2 connection pool configuration
r2ConnectionPool: {
  maxConnections: 50,
  connectionTimeout: 5000,
  keepAlive: true,
  keepAliveInterval: 30000
}
```

#### CDN Integration

```typescript
// CDN configuration
cdn: {
  enabled: true,
  customDomain: 'cdn.your-domain.com',
  cacheControl: 'public, max-age=86400'
}
```

#### Multipart Uploads

```typescript
// Large file handling
multipartThreshold: 10485760,  // 10MB
multipartChunksize: 5242880,   // 5MB chunks
maxConcurrency: 3              // Parallel uploads
```

### Caching Strategy

1. **Module Metadata**: Cache frequently accessed module data
2. **User Roles**: Cache user roles to reduce database queries
3. **Popular Modules**: Materialized view for analytics
4. **CDN Caching**: Static file caching via Cloudflare CDN

---

## Error Handling

### Error Types

#### Validation Errors (400 Bad Request)

```json
{
  "message": "Validation failed",
  "error": "Bad Request",
  "statusCode": 400,
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    },
    {
      "field": "file",
      "message": "File type application/zip is not allowed"
    }
  ]
}
```

#### Authentication Errors (401 Unauthorized)

```json
{
  "message": "Unauthorized",
  "error": "Unauthorized",
  "statusCode": 401
}
```

#### Authorization Errors (403 Forbidden)

```json
{
  "message": "You do not have permission to access this module",
  "error": "Forbidden",
  "statusCode": 403
}
```

#### Rate Limit Errors (429 Too Many Requests)

```json
{
  "message": "Upload limit exceeded. You can upload 10 modules per hour. Try again in 45 minutes.",
  "error": "Too Many Requests",
  "statusCode": 429
}
```

#### File Upload Errors (400 Bad Request)

```json
{
  "message": "Failed to create module: File size exceeds maximum allowed size of 10485760 bytes",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Error Handling Strategy

1. **Input Validation**: Validate all inputs at controller level
2. **Business Logic Validation**: Validate business rules at service level
3. **Database Errors**: Handle RLS violations and constraint errors
4. **R2 Errors**: Handle storage service errors gracefully
5. **Rate Limiting**: Provide clear feedback on limits
6. **Audit Logging**: Log all errors for debugging

---

## Configuration

### Environment Variables

#### Required Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# R2 Configuration
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_REGION=auto
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

#### Optional Variables

```bash
# R2 File Settings
R2_MAX_FILE_SIZE=10485760                    # 10MB
R2_ALLOWED_MIME_TYPES=application/pdf,image/jpeg,image/png
R2_PUBLIC_URL=https://your-bucket.r2.dev

# Performance Settings
R2_MULTIPART_THRESHOLD=10485760              # 10MB
R2_MULTIPART_CHUNKSIZE=5242880               # 5MB
R2_MAX_CONCURRENCY=3
R2_CONNECTION_TIMEOUT=30000                  # 30 seconds
R2_REQUEST_TIMEOUT=60000                     # 60 seconds
R2_MAX_RETRIES=3

# Cache Settings
R2_CACHE_CONTROL=public,max-age=31536000     # 1 year
R2_ENABLE_CDN=true

# Security Settings
R2_ENABLE_VIRUS_SCANNING=false
R2_ENABLE_CONTENT_VALIDATION=true
R2_PRESIGNED_URL_EXPIRATION=3600             # 1 hour

# Rate Limiting
R2_TEACHER_UPLOAD_LIMIT=10                   # 10 uploads per hour
R2_STUDENT_DOWNLOAD_LIMIT=100                # 100 downloads per hour

# Module-specific Settings
R2_MODULES_MAX_SIZE=52428800                 # 50MB for modules
R2_MODULES_ALLOWED_TYPES=application/pdf,application/vnd.ms-powerpoint
R2_GLOBAL_MODULE_CACHE=86400                 # 24 hours
R2_SECTION_MODULE_CACHE=3600                  # 1 hour
R2_SOFT_DELETE_RETENTION=30                  # 30 days

# Logging
R2_ENABLE_REQUEST_LOGGING=false
R2_LOG_LEVEL=info
```

### Configuration Files

#### R2 Config (`src/config/r2.config.ts`)

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('r2', () => ({
  // Core configuration
  accountId: process.env.R2_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucketName: process.env.R2_BUCKET_NAME,
  region: process.env.R2_REGION || 'auto',
  publicUrl: process.env.R2_PUBLIC_URL,

  // Endpoint configuration
  endpoint:
    process.env.R2_ENDPOINT ||
    `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,

  // File settings
  maxFileSize: parseInt(process.env.R2_MAX_FILE_SIZE || '10485760'),
  allowedMimeTypes: process.env.R2_ALLOWED_MIME_TYPES?.split(',') || [
    'application/pdf',
    'image/jpeg',
    'image/png',
  ],

  // Performance settings
  multipartThreshold: parseInt(
    process.env.R2_MULTIPART_THRESHOLD || '10485760',
  ),
  multipartChunksize: parseInt(process.env.R2_MULTIPART_CHUNKSIZE || '5242880'),
  maxConcurrency: parseInt(process.env.R2_MAX_CONCURRENCY || '3'),

  // Security settings
  enableVirusScanning: process.env.R2_ENABLE_VIRUS_SCANNING === 'true',
  enableContentValidation: process.env.R2_ENABLE_CONTENT_VALIDATION !== 'false',

  // Cache settings
  cacheControl: process.env.R2_CACHE_CONTROL || 'public, max-age=31536000',
  enableCdn: process.env.R2_ENABLE_CDN !== 'false',

  // Presigned URL settings
  presignedUrlExpiration: parseInt(
    process.env.R2_PRESIGNED_URL_EXPIRATION || '3600',
  ),

  // Connection settings
  connectionTimeout: parseInt(process.env.R2_CONNECTION_TIMEOUT || '30000'),
  requestTimeout: parseInt(process.env.R2_REQUEST_TIMEOUT || '60000'),
  maxRetries: parseInt(process.env.R2_MAX_RETRIES || '3'),

  // Logging settings
  enableRequestLogging: process.env.R2_ENABLE_REQUEST_LOGGING === 'true',
  logLevel: process.env.R2_LOG_LEVEL || 'info',
}));
```

---

## Deployment

### Prerequisites

1. **Node.js**: Version 18+ recommended
2. **Supabase Project**: Database and authentication setup
3. **Cloudflare R2**: Bucket and API credentials
4. **Environment Variables**: All required variables configured

### Build Process

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Run tests
npm run test

# Start production server
npm run start:prod
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
```

### Environment Setup

```bash
# Production environment
NODE_ENV=production
PORT=3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-bucket.r2.dev

# Performance
R2_MAX_CONCURRENCY=10
R2_CONNECTION_TIMEOUT=30000
R2_REQUEST_TIMEOUT=60000
```

### Health Checks

```typescript
// Health check endpoints
GET / api / r2 - health; // R2 connection status
GET / api / health; // Application health
GET / api / modules / health; // Modules service health
```

---

## Testing

### Unit Tests

```typescript
// Example test structure
describe('ModulesService', () => {
  let service: ModulesService;
  let supabaseService: SupabaseService;
  let r2StorageService: R2StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModulesService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: R2StorageService,
          useValue: mockR2StorageService,
        },
      ],
    }).compile();

    service = module.get<ModulesService>(ModulesService);
  });

  it('should create a module', async () => {
    const createModuleDto = {
      title: 'Test Module',
      description: 'Test Description',
      isGlobal: true,
      subjectId: 'test-subject-id',
    };

    const result = await service.create(createModuleDto, 'user-id');
    expect(result.title).toBe('Test Module');
  });
});
```

### Integration Tests

```typescript
// Test R2 integration
describe('R2StorageService Integration', () => {
  it('should upload file to R2', async () => {
    const fileBuffer = Buffer.from('test content');
    const result = await r2StorageService.uploadFile(
      'test-key',
      fileBuffer,
      'text/plain',
    );

    expect(result.success).toBe(true);
    expect(result.key).toBe('test-key');
  });
});
```

### E2E Tests

```typescript
// Test complete module creation flow
describe('Modules E2E', () => {
  it('should create module with file upload', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/modules')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', 'test-file.pdf')
      .field('title', 'Test Module')
      .field('isGlobal', 'true')
      .field('subjectId', 'test-subject-id')
      .expect(201);

    expect(response.body.title).toBe('Test Module');
    expect(response.body.file_url).toBeDefined();
  });
});
```

### Test Commands

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:e2e

# Run tests with coverage
npm run test:cov

# Run specific test file
npm run test -- modules.service.spec.ts
```

---

## Troubleshooting

### Common Issues

#### 1. RLS Policy Violations

**Error**: `new row violates row-level security policy for table "modules"`

**Cause**: Service using anon client instead of service role client

**Solution**: Update service methods to use `getServiceClient()` for write operations

```typescript
// Wrong
const { data, error } = await this.supabaseService.getClient().from('modules').insert(...)

// Correct
const { data, error } = await this.supabaseService.getServiceClient().from('modules').insert(...)
```

#### 2. File Upload Failures

**Error**: `Failed to create module: data.file.toBuffer is not a function`

**Cause**: Fastify multipart file handling differs from Express

**Solution**: Use proper Fastify multipart parsing

```typescript
// Wrong
buffer: await data.file.toBuffer(),

// Correct
const chunks: Buffer[] = [];
for await (const chunk of data.file) {
  chunks.push(chunk);
}
const fileBuffer = Buffer.concat(chunks);
```

#### 3. Boolean Parsing Issues

**Error**: `Section IDs are required for section-specific modules`

**Cause**: Boolean form field not parsed correctly

**Solution**: Handle multiple boolean formats

```typescript
// Wrong
isGlobal: data.fields.isGlobal?.value === 'true',

// Correct
isGlobal: ['true', '1', true].includes(data.fields.isGlobal?.value),
```

#### 4. UUID Validation Errors

**Error**: `invalid input syntax for type uuid: "null"`

**Cause**: Null values passed to UUID fields

**Solution**: Check for null values before database operations

```typescript
// Add null checks
if (teacherSubject) {
  queryBuilder = queryBuilder.or(
    `uploaded_by.eq.${userId},and(is_global.eq.true,subject_id.eq.${teacherSubject})`,
  );
} else {
  queryBuilder = queryBuilder.eq('uploaded_by', userId);
}
```

### Debugging Tools

#### 1. R2 Connection Test

```bash
# Test R2 connection
npm run test:r2-connection
```

#### 2. Database Query Logging

```typescript
// Enable query logging
const { data, error } = await this.supabaseService
  .getClient()
  .from('modules')
  .select('*')
  .eq('id', moduleId)
  .single();

if (error) {
  console.error('Database error:', error);
}
```

#### 3. R2 Operation Logging

```typescript
// Enable R2 logging
enableRequestLogging: true,
logLevel: 'debug'
```

### Performance Monitoring

#### 1. Database Performance

```sql
-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

#### 2. R2 Performance

```typescript
// Monitor upload times
const startTime = Date.now();
const result = await r2StorageService.uploadFile(key, buffer, mimeType);
const uploadTime = Date.now() - startTime;
console.log(`Upload took ${uploadTime}ms`);
```

### Log Analysis

#### 1. Application Logs

```bash
# View application logs
tail -f logs/application.log

# Filter for module-related logs
grep "ModulesService" logs/application.log
```

#### 2. Database Logs

```sql
-- Check recent errors
SELECT * FROM pg_stat_database
WHERE datname = 'your_database_name';
```

---

## Conclusion

The Modules System provides a robust, scalable solution for educational file management with:

- **Secure File Storage**: Cloudflare R2 with presigned URLs
- **Fine-grained Access Control**: RLS policies and role-based permissions
- **Comprehensive Analytics**: Download tracking and popular content insights
- **High Performance**: Optimized queries, caching, and CDN integration
- **Audit Trail**: Complete logging of all operations
- **Scalable Architecture**: Microservices-ready design

This documentation serves as a complete reference for developers, administrators, and users working with the Modules System.

---

_Last Updated: October 2024_
_Version: 1.0.0_

