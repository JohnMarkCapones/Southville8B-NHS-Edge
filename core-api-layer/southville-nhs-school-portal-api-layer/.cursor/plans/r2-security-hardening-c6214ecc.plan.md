<!-- c6214ecc-ee53-40af-9618-a877e8d29ea8 85cfbadb-604a-4e32-9e0e-3c26aafab753 -->
# R2 Security for Modules System

## Overview

Secure Cloudflare R2 integration for educational modules with private bucket, JWT authentication, section enrollment verification, subject-based global module access for teachers, presigned URLs with different expiration times, and soft-delete with 30-day retention policy.

## Your Cloudflare Dashboard Setup

### 1. R2 Bucket Configuration

- Create private R2 bucket: `southville-modules-storage`
- Location: Choose closest to Philippines/your users
- Settings:
  - Public access: DISABLED
  - CORS: Configure for your API domain
  - Lifecycle rules: Auto-delete files with `.deleted` prefix after 30 days

### 2. API Token Security

- Create R2 API token:
  - Permission: Object Read & Write ONLY
  - Scope: `southville-modules-storage` bucket only
  - Save credentials for environment variables

### 3. CORS Configuration

```json
[
  {
    "AllowedOrigins": ["https://your-api-domain.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

## Database Schema Updates

### 1. Update Modules Table (Supabase SQL Editor)

```sql
-- Add new columns to existing modules table
ALTER TABLE public.modules 
  ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS r2_file_key TEXT,
  ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT,
  ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.users(id);

-- Update file_url to be nullable since we'll use R2 keys
ALTER TABLE public.modules 
  ALTER COLUMN file_url DROP NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_modules_uploaded_by ON public.modules(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_modules_r2_file_key ON public.modules(r2_file_key);
CREATE INDEX IF NOT EXISTS idx_modules_is_deleted ON public.modules(is_deleted) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_modules_global ON public.modules(is_global) WHERE is_global = true;

-- Add subject_id for global module access control
ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id);

CREATE INDEX IF NOT EXISTS idx_modules_subject_id ON public.modules(subject_id);

-- Update comment for clarity
COMMENT ON COLUMN public.modules.r2_file_key IS 'Cloudflare R2 storage key path';
COMMENT ON COLUMN public.modules.subject_id IS 'Subject for global module access control - only teachers with this subject can access';
```

### 2. Create Module Download Logs Table

```sql
-- Track module downloads for analytics and security
CREATE TABLE IF NOT EXISTS public.module_download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true
);

-- Indexes for performance
CREATE INDEX idx_module_downloads_module ON public.module_download_logs(module_id);
CREATE INDEX idx_module_downloads_user ON public.module_download_logs(user_id);
CREATE INDEX idx_module_downloads_date ON public.module_download_logs(downloaded_at DESC);

-- RLS Policies
ALTER TABLE public.module_download_logs ENABLE ROW LEVEL SECURITY;

-- Only admins and teachers can view download logs
CREATE POLICY "Admins can view all download logs"
  ON public.module_download_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name IN ('Admin', 'Teacher')
    )
  );

-- Users can view their own download logs
CREATE POLICY "Users can view their own download logs"
  ON public.module_download_logs FOR SELECT
  USING (user_id = auth.uid());

-- System can insert logs (via service role)
CREATE POLICY "System can insert download logs"
  ON public.module_download_logs FOR INSERT
  WITH CHECK (true);
```

### 3. Update RLS Policies for Modules Table

```sql
-- Enable RLS on modules table
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage all modules"
  ON public.modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'Admin'
    )
  );

-- Teachers can insert modules
CREATE POLICY "Teachers can insert modules"
  ON public.modules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'Teacher'
    ) AND uploaded_by = auth.uid()
  );

-- Teachers can update their own modules
CREATE POLICY "Teachers can update their own modules"
  ON public.modules FOR UPDATE
  USING (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'Teacher'
    )
  );

-- Teachers can delete their own modules (soft delete)
CREATE POLICY "Teachers can delete their own modules"
  ON public.modules FOR DELETE
  USING (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'Teacher'
    )
  );

-- Teachers can view global modules for their subject
CREATE POLICY "Teachers can view global modules for their subject"
  ON public.modules FOR SELECT
  USING (
    is_deleted = false AND
    (
      is_global = true AND
      EXISTS (
        SELECT 1 FROM public.users u
        JOIN public.roles r ON u.role_id = r.id
        JOIN public.teachers t ON u.id = t.user_id
        WHERE u.id = auth.uid() 
          AND r.name = 'Teacher'
          AND t.subject_specialization_id = modules.subject_id
      )
      OR uploaded_by = auth.uid()
    )
  );

-- Students can view modules for their sections
CREATE POLICY "Students can view their section modules"
  ON public.modules FOR SELECT
  USING (
    is_deleted = false AND
    (
      -- Global modules visible to all students
      is_global = true
      OR
      -- Section-specific modules via section_modules
      EXISTS (
        SELECT 1 FROM public.students s
        JOIN public.section_modules sm ON s.section_id = sm.section_id
        WHERE s.user_id = auth.uid() 
          AND sm.module_id = modules.id
          AND sm.visible = true
      )
    )
  );
```

## Code Implementation

### Phase 1: Enhanced R2 Configuration

Update `src/config/r2.config.ts`:

```typescript
// Add module-specific configuration
modules: {
  maxFileSize: parseInt(process.env.R2_MODULES_MAX_SIZE || '52428800'), // 50MB
  allowedMimeTypes: process.env.R2_MODULES_ALLOWED_TYPES?.split(',') || [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ],
  globalCacheDuration: parseInt(process.env.R2_GLOBAL_MODULE_CACHE || '86400'), // 24 hours
  sectionCacheDuration: parseInt(process.env.R2_SECTION_MODULE_CACHE || '3600'), // 1 hour
  softDeleteRetentionDays: parseInt(process.env.R2_SOFT_DELETE_RETENTION || '30'),
},
```

### Phase 2: Module Access Service

Create `src/modules/services/module-access.service.ts`:

```typescript
@Injectable()
export class ModuleAccessService {
  
  // Check if student can access module
  async canStudentAccessModule(
    studentUserId: string,
    moduleId: string
  ): Promise<boolean> {
    // 1. Check if module is global
    // 2. If not global, verify student is in section that has access
    // 3. Check section_modules.visible = true
    // 4. Check students.section_id matches
  }

  // Check if teacher can access module
  async canTeacherAccessModule(
    teacherUserId: string,
    moduleId: string
  ): Promise<boolean> {
    // 1. Check if teacher uploaded it
    // 2. If global module, check teacher's subject_specialization_id matches
    // 3. Teachers cannot access non-global modules from other teachers
  }

  // Get student's section enrollment
  async getStudentSectionId(studentUserId: string): Promise<string | null>

  // Get teacher's subject specialization
  async getTeacherSubjectId(teacherUserId: string): Promise<string | null>

  // Verify section has access to module
  async isSectionAuthorizedForModule(
    sectionId: string,
    moduleId: string
  ): Promise<boolean>
}
```

### Phase 3: Module Storage Service

Create `src/modules/services/module-storage.service.ts`:

```typescript
@Injectable()
export class ModuleStorageService {
  
  async uploadModule(
    file: Express.Multer.File,
    uploadedBy: string,
    isGlobal: boolean,
    subjectId?: string
  ): Promise<{ r2FileKey: string; fileUrl: string }> {
    // 1. Validate file type and size
    // 2. Generate R2 key: modules/global/{subject_id}/{uuid}.ext or modules/sections/{section_id}/{uuid}.ext
    // 3. Upload to R2
    // 4. Return R2 key for database storage
  }

  async getModuleDownloadUrl(
    moduleId: string,
    userId: string,
    userRole: string
  ): Promise<{ url: string; expiresAt: Date }> {
    // 1. Validate access via ModuleAccessService
    // 2. Determine cache duration (global vs section)
    // 3. Generate presigned URL with appropriate expiration
    // 4. Log download attempt
  }

  async softDeleteModule(
    moduleId: string,
    deletedBy: string
  ): Promise<void> {
    // 1. Get current R2 key from database
    // 2. Copy file to .deleted/{original-key} in R2
    // 3. Update database: is_deleted=true, deleted_at=now, deleted_by=userId
    // 4. Original file will be cleaned up by lifecycle rule after 30 days
  }

  async permanentlyDeleteModule(moduleId: string): Promise<void> {
    // Admin only - immediately delete from R2
  }

  async replaceModuleFile(
    moduleId: string,
    newFile: Express.Multer.File,
    uploadedBy: string
  ): Promise<{ r2FileKey: string }> {
    // 1. Soft delete old file
    // 2. Upload new file
    // 3. Update database with new R2 key
  }

  private generateR2Key(
    fileName: string,
    isGlobal: boolean,
    subjectId?: string,
    sectionId?: string
  ): string {
    const uuid = crypto.randomUUID();
    const ext = path.extname(fileName);
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    if (isGlobal) {
      return `modules/global/${subjectId}/${uuid}-${sanitizedName}`;
    } else {
      return `modules/sections/${sectionId}/${uuid}-${sanitizedName}`;
    }
  }
}
```

### Phase 4: Modules Controller Updates

Update `src/modules/modules.controller.ts`:

```typescript
@Controller('modules')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class ModulesController {

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async createModule(
    @UploadedFile() file: Express.Multer.File,
    @Body() createModuleDto: CreateModuleDto,
    @AuthUser() user: SupabaseUser
  ): Promise<Module> {
    // 1. Upload file to R2 via ModuleStorageService
    // 2. Create module record in database with r2_file_key
    // 3. If not global, create section_modules entries
  }

  @Get(':id/download')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  async getModuleDownloadUrl(
    @Param('id') moduleId: string,
    @AuthUser() user: SupabaseUser
  ): Promise<{ url: string; expiresAt: Date }> {
    // Generate presigned URL with access validation
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseInterceptors(FileInterceptor('file'))
  async updateModule(
    @Param('id') moduleId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateModuleDto: UpdateModuleDto,
    @AuthUser() user: SupabaseUser
  ): Promise<Module> {
    // If file provided, replace via ModuleStorageService
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async deleteModule(
    @Param('id') moduleId: string,
    @AuthUser() user: SupabaseUser
  ): Promise<{ success: boolean }> {
    // Soft delete module
  }

  @Get('my-modules')
  @Roles(UserRole.TEACHER)
  async getMyModules(
    @AuthUser() user: SupabaseUser
  ): Promise<Module[]> {
    // Get all modules uploaded by teacher
  }

  @Get('section/:sectionId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  async getSectionModules(
    @Param('sectionId') sectionId: string,
    @AuthUser() user: SupabaseUser
  ): Promise<Module[]> {
    // Get modules for specific section (with access validation)
  }

  @Get('global')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  async getGlobalModules(
    @AuthUser() user: SupabaseUser
  ): Promise<Module[]> {
    // Get all global modules (teachers filtered by subject)
  }
}
```

### Phase 5: DTOs

Create `src/modules/dto/create-module.dto.ts`:

```typescript
export class CreateModuleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isGlobal?: boolean = false;

  @IsUUID()
  @IsOptional()
  subjectId?: string; // Required if isGlobal = true

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  sectionIds?: string[]; // Required if isGlobal = false
}
```

### Phase 6: Rate Limiting

Create `src/modules/guards/module-upload-throttle.guard.ts`:

```typescript
@Injectable()
export class ModuleUploadThrottleGuard implements CanActivate {
  private readonly uploadCounts = new Map<string, { count: number; resetAt: Date }>();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const limit = 10; // 10 uploads per hour
    
    // Check and enforce rate limit
    // Teachers: 10 uploads per hour
    // Admins: No limit
  }
}
```

### Phase 7: Download Logging

Create `src/modules/services/module-download-logger.service.ts`:

```typescript
@Injectable()
export class ModuleDownloadLoggerService {
  
  async logDownload(
    moduleId: string,
    userId: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    // Insert into module_download_logs table
  }

  async getModuleDownloadStats(
    moduleId: string
  ): Promise<{ totalDownloads: number; uniqueUsers: number }> {
    // Analytics for teachers/admins
  }

  async getUserDownloadHistory(
    userId: string,
    limit: number = 50
  ): Promise<ModuleDownloadLog[]> {
    // Get user's download history
  }
}
```

## Performance Optimization Layer

### Phase 8: Caching Strategy

Create `src/modules/services/module-cache.service.ts`:

```typescript
@Injectable()
export class ModuleCacheService {
  
  // Cache presigned URLs to reduce R2 API calls
  async getCachedPresignedUrl(
    moduleId: string,
    isGlobal: boolean
  ): Promise<string | null> {
    // Check Redis or in-memory cache
    // Global modules: 24hr cache
    // Section modules: 1hr cache
  }

  async cachePresignedUrl(
    moduleId: string,
    url: string,
    expirationSeconds: number
  ): Promise<void> {
    // Store in Redis with TTL matching presigned URL expiration
  }

  // Cache module metadata for faster access checks
  async getCachedModuleMetadata(
    moduleId: string
  ): Promise<ModuleMetadata | null> {
    // Cache: is_global, subject_id, uploaded_by, is_deleted
  }

  async cacheModuleMetadata(
    moduleId: string,
    metadata: ModuleMetadata
  ): Promise<void> {
    // 15 minute cache for module metadata
  }

  async invalidateModuleCache(moduleId: string): Promise<void> {
    // Clear all caches when module is updated/deleted
  }
}
```

### Phase 9: Database Query Optimization

Create `src/modules/services/module-query-optimizer.service.ts`:

```typescript
@Injectable()
export class ModuleQueryOptimizerService {
  
  // Batch load modules with single query using joins
  async getModulesForSectionBatch(
    sectionIds: string[]
  ): Promise<Map<string, Module[]>> {
    // Single query with JOIN instead of N+1 queries
    // Return Map of sectionId -> Module[]
  }

  // Use materialized view for frequently accessed data
  async getPopularModules(limit: number = 10): Promise<Module[]> {
    // Query pre-computed popular modules (from download logs)
  }

  // Pagination with cursor for large result sets
  async getModulesPaginated(
    filters: ModuleFilters,
    cursor?: string,
    limit: number = 50
  ): Promise<PaginatedResult<Module>> {
    // Cursor-based pagination for better performance than OFFSET
  }
}
```

### Phase 10: Connection Pooling & CDN

Update `src/config/r2.config.ts` for connection pooling:

```typescript
// Connection pooling for R2
r2ConnectionPool: {
  maxConnections: parseInt(process.env.R2_MAX_CONNECTIONS || '50'),
  connectionTimeout: parseInt(process.env.R2_CONNECTION_TIMEOUT || '5000'),
  keepAlive: true,
  keepAliveInterval: parseInt(process.env.R2_KEEP_ALIVE_INTERVAL || '30000'),
},

// CDN configuration for static content
cdn: {
  enabled: process.env.R2_CDN_ENABLED === 'true',
  customDomain: process.env.R2_CDN_DOMAIN,
  cacheControl: process.env.R2_CDN_CACHE_CONTROL || 'public, max-age=86400',
},
```

### Phase 11: Async Processing Queue

Create `src/modules/services/module-processing-queue.service.ts`:

```typescript
@Injectable()
export class ModuleProcessingQueueService {
  
  // Process file uploads asynchronously
  async queueFileUpload(
    file: Express.Multer.File,
    moduleData: CreateModuleDto,
    userId: string
  ): Promise<string> {
    // Add to queue, return job ID immediately
    // Process upload in background
  }

  // Async thumbnail generation for PDFs/images
  async queueThumbnailGeneration(
    moduleId: string,
    fileKey: string
  ): Promise<void> {
    // Generate previews in background
  }

  // Batch delete processing
  async queueBatchDelete(moduleIds: string[]): Promise<void> {
    // Process multiple deletes efficiently
  }
}
```

### Phase 12: Response Compression

Create `src/modules/interceptors/compression.interceptor.ts`:

```typescript
@Injectable()
export class CompressionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Compress large JSON responses (module lists)
    // Use Brotli for better compression than gzip
  }
}
```

### Phase 13: Database Indexes Optimization

Add to Supabase SQL:

```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_modules_section_visible_not_deleted 
  ON public.modules(is_global, is_deleted, subject_id) 
  WHERE is_deleted = false;

CREATE INDEX idx_section_modules_section_visible 
  ON public.section_modules(section_id, visible) 
  WHERE visible = true;

-- Partial index for global modules only
CREATE INDEX idx_modules_global_subject 
  ON public.modules(subject_id, created_at DESC) 
  WHERE is_global = true AND is_deleted = false;

-- Index for teacher's own modules
CREATE INDEX idx_modules_uploaded_by_not_deleted 
  ON public.modules(uploaded_by, created_at DESC) 
  WHERE is_deleted = false;

-- Cover index for download logs analytics
CREATE INDEX idx_download_logs_analytics 
  ON public.module_download_logs(module_id, downloaded_at, success) 
  WHERE success = true;
```

### Phase 14: Materialized View for Analytics

```sql
-- Pre-compute popular modules for dashboard
CREATE MATERIALIZED VIEW module_popularity AS
SELECT 
  m.id,
  m.title,
  m.subject_id,
  COUNT(DISTINCT mdl.user_id) as unique_downloads,
  COUNT(mdl.id) as total_downloads,
  MAX(mdl.downloaded_at) as last_downloaded
FROM public.modules m
LEFT JOIN public.module_download_logs mdl ON m.id = mdl.module_id
WHERE m.is_deleted = false AND mdl.success = true
GROUP BY m.id, m.title, m.subject_id;

-- Index for materialized view
CREATE INDEX idx_module_popularity_downloads 
  ON module_popularity(total_downloads DESC);

-- Refresh hourly via cron job or trigger
CREATE OR REPLACE FUNCTION refresh_module_popularity()
RETURNS void AS $
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY module_popularity;
END;
$ LANGUAGE plpgsql;
```

### Phase 15: Bulk Operations

Create `src/modules/services/module-bulk-operations.service.ts`:

```typescript
@Injectable()
export class ModuleBulkOperationsService {
  
  // Batch assign modules to multiple sections
  async bulkAssignToSections(
    moduleIds: string[],
    sectionIds: string[]
  ): Promise<void> {
    // Single INSERT with multiple values
    // Much faster than individual inserts
  }

  // Bulk presigned URL generation
  async generateBulkPresignedUrls(
    moduleIds: string[],
    userId: string
  ): Promise<Map<string, string>> {
    // Generate multiple URLs in parallel
    // Return Map of moduleId -> presignedUrl
  }

  // Bulk download preparation
  async prepareModulesForDownload(
    moduleIds: string[],
    userId: string
  ): Promise<{ zipUrl: string; expiresAt: Date }> {
    // Create zip file in background
    // Return presigned URL for zip download
  }
}
```

## Environment Variables

Add to `.env`:

```bash
# R2 Modules Configuration
R2_MODULES_MAX_SIZE=52428800  # 50MB
R2_MODULES_ALLOWED_TYPES=application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation
R2_GLOBAL_MODULE_CACHE=86400  # 24 hours for global modules
R2_SECTION_MODULE_CACHE=3600  # 1 hour for section modules
R2_SOFT_DELETE_RETENTION=30   # 30 days retention for deleted files

# Rate Limiting
R2_TEACHER_UPLOAD_LIMIT=10    # 10 uploads per hour per teacher

# Performance Configuration
R2_MAX_CONNECTIONS=50         # Connection pool size
R2_CONNECTION_TIMEOUT=5000    # 5 seconds
R2_KEEP_ALIVE_INTERVAL=30000  # 30 seconds
R2_CDN_ENABLED=true
R2_CDN_DOMAIN=cdn.your-domain.com
R2_ENABLE_COMPRESSION=true
REDIS_URL=redis://localhost:6379  # For caching
MODULE_CACHE_TTL_SECONDS=900  # 15 minutes for metadata cache
```

## Security Features Implemented

1. **Private Bucket**: All files stored in private R2, no direct access
2. **JWT Authentication**: All endpoints require valid JWT token
3. **Role-Based Access**: 

   - Admins: Full access to all modules
   - Teachers: Upload, manage own modules, access global modules for their subject
   - Students: Read-only access to assigned section modules and global modules

4. **Section Enrollment Verification**: Students can only access modules for sections they're enrolled in
5. **Subject-Based Global Access**: Teachers can only see global modules for subjects they teach
6. **Presigned URLs**: Temporary download links with configurable expiration (24hrs global, 1hr section)
7. **Soft Delete**: 30-day retention period before permanent deletion
8. **Download Logging**: Track all module downloads for analytics and security
9. **Rate Limiting**: Prevent upload abuse (10 uploads/hour for teachers)
10. **File Validation**: Strict MIME type and size validation (50MB max)

## Testing Checklist

1. Teacher uploads section-specific module
2. Teacher uploads global module for their subject
3. Student downloads module from their section
4. Student cannot download module from other section
5. Teacher accesses global module for their subject
6. Teacher cannot access non-global module from another teacher
7. Soft delete module and verify 30-day retention
8. Presigned URL expires after configured time
9. Rate limiting prevents excessive uploads
10. Download logs track all access attempts
11. File replacement works correctly
12. Admin can access all modules

## Success Criteria

- All module files stored in private R2 bucket
- No direct file URLs exposed
- Section enrollment verified for all student access
- Teachers can share global modules by subject
- Presigned URLs work with appropriate cache durations
- Soft delete with 30-day retention working
- Download logging captures all access
- Rate limiting prevents abuse
- File size limited to 50MB
- RLS policies enforce access control at database level

### To-dos

- [ ] Create private R2 bucket with CORS and lifecycle rules in Cloudflare dashboard
- [ ] Generate minimal-permission R2 API token and securely store credentials
- [ ] Add security configurations to r2.config.ts (encryption, access control, rate limit, audit)
- [ ] Create FileAccessPolicy enum for different access levels
- [ ] Implement FileSecurityService with access validation logic
- [ ] Create AuditLoggerService for file operation logging
- [ ] Implement RateLimiterService for upload/download rate limiting
- [ ] Add secure file methods to R2StorageService (uploadSecureFile, getPresignedDownloadUrl, deleteSecureFile)
- [ ] Create FileAccessGuard to protect file access endpoints
- [ ] Create SecureFilesController with protected upload/download/delete endpoints
- [ ] Create file_metadata and file_audit_logs tables with RLS policies in Supabase
- [ ] Update locations module to use secure file upload with proper access policies
- [ ] Update campus facilities module to use secure file upload
- [ ] Run comprehensive security tests (auth, RBAC, rate limiting, audit logs)
- [ ] Create SECURITY.md with file access policies and security procedures