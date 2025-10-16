# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Southville NHS School Portal - API Layer** is a NestJS-based backend API providing secure, high-performance REST endpoints for the Southville 8B National High School portal. This API integrates with **Supabase** for authentication and database, **Cloudflare R2** for object storage, and uses **Fastify** for optimal performance.

## Essential Commands

```bash
# Development
npm run start:dev              # Start development server with watch mode
npm run start:debug            # Start with debugging enabled

# Build & Production
npm run build                  # Build the application
npm run start:prod             # Run production build

# Code Quality
npm run lint                   # Run ESLint with auto-fix
npm run format                 # Format code with Prettier

# Testing
npm run test                   # Run unit tests
npm run test:watch             # Run tests in watch mode
npm run test:cov               # Run tests with coverage report
npm run test:e2e               # Run end-to-end tests
npm run test:debug             # Debug tests

# Utility Scripts
npm run test:r2-connection     # Test R2 storage connection
npm run security-check         # Run security vulnerability check
```

## High-Level Architecture

### Application Stack

- **Framework**: NestJS 11 with TypeScript 5.7
- **HTTP Adapter**: Fastify (not Express) - affects file upload handling
- **Database**: Supabase PostgreSQL with Row-Level Security (RLS)
- **Authentication**: Supabase Auth with JWT tokens
- **Storage**: Cloudflare R2 (S3-compatible) for file uploads
- **API Versioning**: URI-based (default v1) with `/api` global prefix
- **Documentation**: Swagger/OpenAPI at `/api/docs`

### Application Bootstrap (src/main.ts)

The application bootstraps with:
1. **Fastify adapter** with 50MB file upload limit
2. **Security middleware**: Helmet (CSP), compression, CORS
3. **Global validation pipe**: `whitelist`, `forbidNonWhitelisted`, `transform`
4. **API versioning**: URI-based with `/api/v1` prefix
5. **Multipart support**: Fastify multipart (NOT Express multer)
6. **Swagger docs**: Available at `/api/docs` with JWT bearer auth

### Module Organization

The codebase follows a **domain-driven module structure**:

```
src/
├── config/                    # Configuration files
│   ├── supabase.config.ts    # Supabase credentials & setup
│   ├── r2.config.ts          # R2 storage configuration
│   └── r2-config-validation/ # R2 config validation service
├── supabase/                  # Supabase integration
│   ├── supabase.module.ts
│   └── supabase.service.ts   # getClient() vs getServiceClient()
├── auth/                      # Authentication & authorization
│   ├── supabase-auth.guard.ts # JWT validation
│   ├── guards/
│   │   ├── roles.guard.ts    # Role-based access control
│   │   └── policies.guard.ts # Domain-based permissions (PBAC)
│   ├── jwt-verification.service.ts
│   ├── role-cache.service.ts
│   └── pbac.module.ts        # Permission-Based Access Control
├── storage/                   # R2 storage abstraction
│   └── storage.module.ts
├── modules/                   # Educational modules system (R2-integrated)
│   ├── modules.controller.ts
│   ├── modules.service.ts
│   ├── dto/                  # Data Transfer Objects
│   ├── entities/
│   ├── services/             # Specialized services
│   │   ├── module-access.service.ts
│   │   ├── module-storage.service.ts
│   │   └── module-download-logger.service.ts
│   └── guards/
│       └── module-upload-throttle.guard.ts
├── students/                  # Student management
├── users/                     # User management (teachers, admins)
├── sections/                  # Class sections
├── buildings/, floors/, rooms/ # Campus infrastructure
├── announcements/             # School announcements
├── events/                    # School events
├── schedules/                 # Class schedules
├── clubs/                     # Student clubs with forms
├── gwa/                       # Grade-Weighted Average
├── alerts/                    # System alerts
├── academic-calendar/         # Academic calendar
├── campus-facilities/         # Campus facilities
├── faq/                       # FAQ management
├── locations/                 # Campus locations
├── hotspots/                  # Notable campus hotspots
├── departments-information/   # Department info
└── common/                    # Shared utilities
```

### Key Architectural Patterns

#### 1. Dual Supabase Client Pattern

**Critical**: The `SupabaseService` provides two distinct clients:

```typescript
// For RLS-protected operations (respects Row-Level Security)
const client = this.supabaseService.getClient();

// For admin operations (bypasses RLS, used for writes)
const serviceClient = this.supabaseService.getServiceClient();
```

**When to use each**:
- **`getClient()`**: SELECT queries where RLS policies apply
- **`getServiceClient()`**: INSERT, UPDATE, DELETE operations (bypasses RLS)

**Common mistake**: Using `getClient()` for INSERT operations will fail with RLS violations.

#### 2. Authentication & Authorization Flow

Three layers of security:

1. **SupabaseAuthGuard**: Validates JWT token from `Authorization: Bearer <token>` header
2. **RolesGuard**: Enforces role-based access (`@Roles('Admin', 'Teacher')`)
3. **PoliciesGuard**: Domain-based permission checks (PBAC system)

```typescript
// Controller example
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('Admin', 'Teacher')
@Get()
async findAll() { ... }
```

**User context**: Access authenticated user via `@Req()` or custom decorators.

#### 3. R2 Storage Integration

**Cloudflare R2** is used for all file uploads (not Supabase Storage).

**Key concepts**:
- **Bucket structure**: `modules/global/{subject_id}/` or `modules/sections/{section_id}/`
- **Presigned URLs**: Generate temporary secure URLs for downloads
- **Soft deletes**: Files moved to `.deleted/` prefix instead of immediate deletion
- **Multipart uploads**: Automatic for files >10MB

**Environment variables** (see `.env`):
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`
- `R2_MAX_FILE_SIZE` (default: 10MB)
- `R2_PRESIGNED_URL_EXPIRATION` (default: 3600s)

**Critical**: Use Fastify multipart, not Express multer:

```typescript
// Correct way to handle file uploads in Fastify
const data = await request.file();
const chunks: Buffer[] = [];
for await (const chunk of data.file) {
  chunks.push(chunk);
}
const fileBuffer = Buffer.concat(chunks);
```

#### 4. Database Entity Patterns

All entities use TypeScript interfaces (NOT TypeORM decorators) since Supabase manages the schema.

```typescript
// Example entity (interface, not class)
export interface Module {
  id: string;
  title: string;
  description?: string;
  file_url: string;          // R2 public URL
  r2_file_key: string;       // Internal R2 key
  uploaded_by: string;       // User UUID
  is_global: boolean;
  is_deleted: boolean;
  subject_id?: string;
  created_at: string;
  updated_at: string;
}
```

**Note**: Use snake_case for database fields (Supabase convention), camelCase in DTOs.

#### 5. DTO Validation Pattern

All DTOs use `class-validator` and `class-transformer`:

```typescript
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateModuleDto {
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
}
```

**Global validation** is enabled in `main.ts` with:
- `whitelist: true` - Strip non-whitelisted properties
- `forbidNonWhitelisted: true` - Throw error on unknown properties
- `transform: true` - Auto-transform payloads to DTO instances

#### 6. Rate Limiting & Throttling

**Global rate limiting** via `@nestjs/throttler`:
- Default: 100 requests per minute per IP

**Custom throttling** for specific operations:
- Module uploads: 10 per hour for Teachers (see `ModuleUploadThrottleGuard`)
- Module downloads: 100 per hour for Students

#### 7. Error Handling Standards

Use NestJS built-in exceptions:

```typescript
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException
} from '@nestjs/common';

// Example
if (!module) {
  throw new NotFoundException(`Module with ID ${id} not found`);
}

if (module.uploaded_by !== userId) {
  throw new ForbiddenException('You do not have permission to modify this module');
}
```

**RLS violations** from Supabase will appear as database errors - catch and translate them to appropriate HTTP exceptions.

## Important Development Notes

### Working with Fastify (NOT Express)

**File upload handling differs significantly**:

```typescript
// ❌ WRONG (Express/Multer style)
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file: Express.Multer.File) { ... }

// ✅ CORRECT (Fastify multipart style)
async uploadFile(@Req() request: FastifyRequest) {
  const data = await request.file();
  const fileBuffer = await data.file.toBuffer(); // or loop through chunks
  // ...
}
```

### Supabase RLS Best Practices

1. **Always use service client for writes**:
   ```typescript
   // INSERT, UPDATE, DELETE
   const { data, error } = await this.supabaseService
     .getServiceClient()
     .from('modules')
     .insert({ ... });
   ```

2. **Use regular client for reads with RLS**:
   ```typescript
   // SELECT with RLS policies applied
   const { data, error } = await this.supabaseService
     .getClient()
     .from('modules')
     .select('*')
     .eq('is_deleted', false);
   ```

3. **Handle RLS policy violations gracefully**:
   ```typescript
   if (error) {
     if (error.message.includes('row-level security')) {
       throw new ForbiddenException('Access denied');
     }
     throw new InternalServerErrorException(error.message);
   }
   ```

### R2 Storage Conventions

**File key naming**: Use descriptive, collision-free keys:
```
modules/global/{subject_id}/{uuid}-{sanitized-filename}
modules/sections/{section_id}/{uuid}-{sanitized-filename}
```

**Soft delete pattern**:
```typescript
// Move to .deleted/ prefix instead of permanent deletion
await r2StorageService.copyFile(
  originalKey,
  `.deleted/${originalKey}`
);
await r2StorageService.deleteFile(originalKey);
```

**Presigned URLs**: Always generate presigned URLs for downloads (never expose direct URLs):
```typescript
const url = await r2StorageService.generatePresignedUrl(
  module.r2_file_key,
  3600 // 1 hour expiration
);
```

### Module System Architecture

The **Modules** system is a comprehensive reference implementation showing:
- Multipart file uploads with Fastify
- R2 storage integration
- RLS-based access control
- Role-based permissions (Admin, Teacher, Student)
- Download analytics tracking
- Soft delete with retention
- Rate limiting for uploads/downloads

See `MODULES_SYSTEM_DOCUMENTATION.md` for complete details.

### Configuration Management

All configuration uses `@nestjs/config` with typed config objects:

```typescript
// Config registration (config/*.config.ts)
export default registerAs('r2', () => ({
  accountId: process.env.R2_ACCOUNT_ID,
  bucketName: process.env.R2_BUCKET_NAME,
  // ...
}));

// Config usage in services
constructor(private configService: ConfigService) {}

const accountId = this.configService.get<string>('r2.accountId');
```

**Configuration validation** happens at startup (see `R2ConfigValidationService`).

## Common Pitfalls

1. **Fastify vs Express**: File upload handling is completely different. Don't use Express patterns.

2. **RLS violations**: Using `getClient()` for INSERT/UPDATE/DELETE will fail. Use `getServiceClient()`.

3. **Boolean parsing in multipart forms**: Form data sends booleans as strings. Handle both:
   ```typescript
   isGlobal: ['true', '1', true].includes(data.fields.isGlobal?.value)
   ```

4. **UUID validation**: Ensure UUIDs are valid before database queries. Null/undefined UUIDs will cause "invalid input syntax for type uuid" errors.

5. **Supabase query building**: Always check for errors:
   ```typescript
   const { data, error } = await supabase.from('table').select();
   if (error) throw new InternalServerErrorException(error.message);
   ```

6. **CORS in production**: Update `main.ts` CORS origin for production domains.

## Testing Considerations

- **Unit tests**: Mock `SupabaseService` and `R2StorageService`
- **E2E tests**: Use test database and R2 bucket
- **R2 connection test**: Run `npm run test:r2-connection` to verify R2 setup
- **Authentication in tests**: Generate valid JWT tokens from Supabase for authenticated routes

## Security Checklist

- ✅ Never commit `.env` file
- ✅ Use service role key only on backend (never expose to frontend)
- ✅ Validate all file uploads (MIME type, size, content)
- ✅ Generate presigned URLs with short expiration for R2 downloads
- ✅ Implement rate limiting for sensitive operations
- ✅ Use RLS policies on all Supabase tables
- ✅ Sanitize file names before storage
- ✅ Validate user permissions before file operations

## API Documentation

**Swagger docs** are automatically generated and available at:
```
http://localhost:3000/api/docs
```

All endpoints require JWT authentication via:
```
Authorization: Bearer <supabase-jwt-token>
```

## Deployment Notes

- **Environment**: Node.js 18+
- **Build output**: `dist/` directory
- **Start command**: `npm run start:prod`
- **Health check**: `GET /` returns welcome message
- **Port**: Default 3000 (configurable via `PORT` env var)

## Additional Documentation

- `MODULES_SYSTEM_DOCUMENTATION.md` - Complete modules system reference
- `R2_CONFIGURATION_README.md` - R2 storage setup guide
- `R2_ENVIRONMENT_EXAMPLE.md` - R2 environment variables
- `R2_TESTING_GUIDE.md` - R2 testing procedures
- `README.md` - Project overview and setup instructions
