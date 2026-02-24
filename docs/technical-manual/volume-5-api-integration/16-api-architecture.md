# 16. API Architecture Overview

**Last Updated:** January 10, 2026
**Status:** ✅ Complete

---

## Table of Contents

- [16.1 System Architecture](#161-system-architecture)
- [16.2 Technology Stack](#162-technology-stack)
- [16.3 Authentication & Security](#163-authentication--security)
- [16.4 API Versioning & Documentation](#164-api-versioning--documentation)

---

## 16.1 System Architecture

### 16.1.1 Multi-Layer API Design

The Southville 8B NHS Edge system implements a **multi-layer API architecture** that separates concerns and optimizes for different use cases.

```
┌─────────────────────────────────────────────────────┐
│            CLIENT APPLICATIONS                       │
│  - Web Browser (Next.js Frontend)                   │
│  - Mobile Apps (Future)                             │
└──────────────────┬──────────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌─────────┐  ┌─────────┐  ┌─────────────┐
│ Next.js │  │ NestJS  │  │ Chat Service│
│   API   │  │ Backend │  │  (Real-time)│
│ Routes  │  │   API   │  │             │
│:3000    │  │  :3000  │  │    :3001    │
└────┬────┘  └────┬────┘  └──────┬──────┘
     │            │               │
     │            │               │
     └────────────┼───────────────┘
                  │
                  ▼
        ┌──────────────────┐
        │    SUPABASE      │
        │  - PostgreSQL    │
        │  - Auth          │
        │  - Realtime      │
        │  - Storage       │
        └────────┬─────────┘
                 │
        ┌────────┴─────────┐
        │                  │
        ▼                  ▼
┌──────────────┐   ┌──────────────┐
│ Cloudflare R2│   │ External APIs│
│  (S3-compat) │   │  (Future)    │
└──────────────┘   └──────────────┘
```

---

### 16.1.2 Service Communication

#### Communication Patterns

| Pattern | Use Case | Services |
|---------|----------|----------|
| **Direct Database Access** | Simple CRUD operations | Next.js ↔ Supabase |
| **REST API** | Complex business logic | Next.js/Frontend ↔ NestJS |
| **WebSocket** | Real-time messaging | Frontend ↔ Chat Service ↔ Supabase |
| **Realtime Subscriptions** | Live updates | Frontend ↔ Supabase Realtime |

---

### 16.1.3 Data Flow Patterns

#### Pattern 1: Direct Supabase Access (Simple Reads)

```typescript
// Next.js Server Component
// Direct database access for simple queries

import { createClient } from '@/lib/supabase/server'

export default async function StudentsPage() {
  const supabase = createClient()

  // Direct Supabase query with RLS protection
  const { data: students } = await supabase
    .from('students')
    .select('*')
    .eq('grade_level', 8)

  return <StudentsList students={students} />
}
```

**Flow:**
```
Next.js Server Component → Supabase (with RLS) → PostgreSQL
```

**Benefits:**
- Minimal latency (direct connection)
- Automatic Row-Level Security
- Built-in caching
- No intermediate API layer needed

---

#### Pattern 2: NestJS Backend API (Complex Operations)

```typescript
// Next.js Client Component calling NestJS backend

async function uploadModule(file: File, metadata: ModuleMetadata) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', metadata.title)
  formData.append('description', metadata.description)

  const response = await fetch('http://localhost:3000/api/v1/modules/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })

  return response.json()
}
```

**Flow:**
```
Frontend → NestJS API → R2 Storage
                      ↓
                   Supabase (metadata)
```

**Use Cases:**
- File uploads to R2
- Complex business logic
- Multi-step transactions
- Third-party integrations

---

#### Pattern 3: Chat Service (Real-Time)

```typescript
// Frontend component subscribing to chat messages

const supabase = createClient()

const channel = supabase
  .channel('chat-room-123')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: 'channel_id=eq.123'
  }, (payload) => {
    // Handle new message
    setMessages((prev) => [...prev, payload.new])
  })
  .subscribe()
```

**Flow:**
```
User A → Chat Service → Supabase → Realtime Broadcast → User B
```

**Benefits:**
- Instant message delivery
- Presence tracking
- Typing indicators
- Low latency (<100ms)

---

### 16.1.4 Service Responsibilities

#### Next.js Frontend (Port 3000)

**Responsibilities:**
- Server-side rendering (SSR)
- Client-side interactivity
- Simple API routes (proxies)
- Direct Supabase queries (read-only with RLS)

**Handles:**
- User interface
- Client-side state management
- Server Component data fetching
- Authentication flow

---

#### NestJS Backend API (Port 3000 - Different Container)

**Responsibilities:**
- Complex business logic
- File upload/download
- Multi-step operations
- Admin operations (bypassing RLS)

**Modules:**
```
core-api-layer/
├── auth/              # Authentication guards
├── modules/           # Learning modules with R2
├── students/          # Student management
├── teachers/          # Teacher management
├── quizzes/           # Quiz system
├── assignments/       # Assignments
└── storage/           # R2 storage abstraction
```

**Tech Stack:**
- NestJS 11
- Fastify adapter (not Express)
- TypeScript 5.7
- Swagger/OpenAPI docs

---

#### Chat Service (Port 3001)

**Responsibilities:**
- Real-time messaging
- WebSocket connections
- Presence tracking
- Message delivery

**Features:**
- Direct messages
- Group channels
- Typing indicators
- Read receipts
- Unread count

---

#### Supabase

**Responsibilities:**
- PostgreSQL database
- User authentication
- Row-Level Security
- Real-time subscriptions
- File storage (if not using R2)

**Services:**
- **Database**: PostgreSQL with RLS policies
- **Auth**: JWT-based authentication
- **Realtime**: WebSocket subscriptions
- **Storage**: File storage (alternative to R2)

---

## 16.2 Technology Stack

### 16.2.1 Frontend Stack

```typescript
// Next.js 15 with App Router
{
  "framework": "Next.js 15",
  "language": "TypeScript 5.x",
  "ui": "React 18 + shadcn/ui + Radix UI",
  "styling": "TailwindCSS",
  "state": "Zustand",
  "forms": "React Hook Form + Zod",
  "http": "fetch API",
  "realtime": "Supabase Realtime"
}
```

**Key Features:**
- Server Components for SSR
- Client Components for interactivity
- Automatic code splitting
- Image optimization
- Built-in caching

---

### 16.2.2 Backend Stack (NestJS)

```typescript
// NestJS Backend Configuration
{
  "framework": "NestJS 11",
  "language": "TypeScript 5.7",
  "adapter": "Fastify", // NOT Express!
  "database": "Supabase PostgreSQL",
  "orm": "None (direct Supabase client)",
  "storage": "Cloudflare R2 (S3-compatible)",
  "validation": "class-validator",
  "docs": "Swagger/OpenAPI"
}
```

**Critical Note:** Uses **Fastify** adapter, not Express. This affects file upload handling:

```typescript
// ✅ Correct (Fastify)
async uploadFile(@Req() request: FastifyRequest) {
  const data = await request.file()
  const fileBuffer = await data.file.toBuffer()
}

// ❌ Wrong (Express/Multer - don't use)
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  // This won't work with Fastify!
}
```

---

### 16.2.3 Database & Storage

#### Supabase PostgreSQL

```sql
-- Example table with RLS
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  grade_level INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-Level Security Policy
CREATE POLICY "Students can view own data"
ON students FOR SELECT
USING (auth.uid() = user_id);

-- Admin/Service Role can do anything
CREATE POLICY "Service role full access"
ON students
USING (auth.jwt() ->> 'role' = 'service_role');
```

#### Cloudflare R2 Storage

```typescript
// R2 Configuration
{
  "provider": "Cloudflare R2",
  "compatibility": "S3-compatible",
  "buckets": {
    "modules": "Learning materials storage",
    "uploads": "User uploads"
  },
  "features": [
    "Presigned URLs (time-limited access)",
    "Multipart uploads (>10MB)",
    "Soft deletes (.deleted/ prefix)",
    "CDN integration"
  ]
}
```

---

### 16.2.4 Communication Protocols

| Protocol | Use Case | Services |
|----------|----------|----------|
| **HTTPS/REST** | CRUD operations | Next.js ↔ NestJS |
| **WebSocket** | Real-time chat | Frontend ↔ Chat Service |
| **PostgreSQL Wire** | Database queries | All ↔ Supabase |
| **Supabase Realtime** | Live updates | Frontend ↔ Supabase |

---

## 16.3 Authentication & Security

### 16.3.1 JWT Token Flow

```
┌────────┐                     ┌──────────┐
│ Client │                     │ Supabase │
└───┬────┘                     └────┬─────┘
    │                               │
    │  1. Login (email/password)    │
    │─────────────────────────────>│
    │                               │
    │  2. JWT Access Token          │
    │<─────────────────────────────│
    │     (valid for 1 hour)        │
    │                               │
    │  3. API Request + Token       │
    │─────────────────────────────>│
    │                               │
    │  4. Verify Token              │
    │     - Check signature         │
    │     - Check expiration        │
    │     - Extract user_id         │
    │                               │
    │  5. Apply RLS with user_id    │
    │  6. Return filtered data      │
    │<─────────────────────────────│
    │                               │
```

---

### 16.3.2 Authentication Layers

#### Layer 1: Supabase Auth

```typescript
// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'student@school.edu',
  password: 'securepassword123'
})

// Get current session
const { data: { session } } = await supabase.auth.getSession()

// Access token for API calls
const token = session?.access_token
```

**Token Contains:**
```json
{
  "sub": "user-uuid",
  "email": "student@school.edu",
  "role": "authenticated",
  "app_metadata": {
    "provider": "email"
  },
  "user_metadata": {
    "role": "student",
    "grade_level": 8
  },
  "exp": 1736553600
}
```

---

#### Layer 2: NestJS Auth Guards

```typescript
// Supabase Auth Guard
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = request.headers.authorization?.split(' ')[1]

    if (!token) {
      throw new UnauthorizedException('No token provided')
    }

    // Verify JWT with Supabase
    const { data: { user }, error } = await this.supabase.auth.getUser(token)

    if (error || !user) {
      throw new UnauthorizedException('Invalid token')
    }

    request.user = user
    return true
  }
}

// Role-Based Access Control
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('Teacher', 'Admin')
@Post('modules/upload')
async uploadModule() {
  // Only teachers and admins can upload
}
```

---

#### Layer 3: Row-Level Security (RLS)

```sql
-- Students can only see their own data
CREATE POLICY "students_select_own"
ON students FOR SELECT
USING (auth.uid() = user_id);

-- Teachers can see students in their sections
CREATE POLICY "teachers_select_students"
ON students FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM teachers t
    WHERE t.user_id = auth.uid()
    AND t.section_id = students.section_id
  )
);

-- Admins can see all students
CREATE POLICY "admins_select_all"
ON students FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
);
```

---

### 16.3.3 Dual Client Pattern (Critical)

**The system uses TWO different Supabase clients:**

```typescript
// 1. Regular Client (RLS-protected)
// Use for SELECT queries where RLS applies
const client = supabaseService.getClient()
const { data } = await client
  .from('students')
  .select('*') // RLS filters results

// 2. Service Client (Bypasses RLS)
// Use for INSERT/UPDATE/DELETE operations
const serviceClient = supabaseService.getServiceClient()
const { data, error } = await serviceClient
  .from('students')
  .insert({ ... }) // Bypasses RLS
```

**Common Mistake:**
```typescript
// ❌ WRONG - Will fail with RLS violation
const { error } = await client.from('students').insert({ ... })

// ✅ CORRECT - Use service client for writes
const { error } = await serviceClient.from('students').insert({ ... })
```

---

### 16.3.4 API Security Best Practices

#### Input Validation

```typescript
// Using class-validator in NestJS
import { IsString, IsEmail, IsInt, Min, Max } from 'class-validator'

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  firstName: string

  @IsString()
  @IsNotEmpty()
  lastName: string

  @IsEmail()
  email: string

  @IsInt()
  @Min(7)
  @Max(10)
  gradeLevel: number
}
```

#### Rate Limiting

```typescript
// NestJS Throttler configuration
import { ThrottlerModule } from '@nestjs/throttler'

ThrottlerModule.forRoot({
  ttl: 60,           // Time window in seconds
  limit: 100,        // Max requests per window
})

// Custom rate limit for specific operations
@UseGuards(ModuleUploadThrottleGuard)
@Post('modules/upload')
async uploadModule() {
  // Limited to 10 uploads per hour for teachers
}
```

#### CORS Configuration

```typescript
// main.ts - Production CORS
app.enableCors({
  origin: [
    'https://southville8b.edu',
    'https://www.southville8b.edu'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
})
```

#### Security Headers

```typescript
// Helmet middleware for security headers
import helmet from '@fastify/helmet'

app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
})
```

---

## 16.4 API Versioning & Documentation

### 16.4.1 Versioning Strategy

#### URI-Based Versioning

```
Base URL: http://localhost:3000/api
Versioned: http://localhost:3000/api/v1

Examples:
  /api/v1/students
  /api/v1/teachers
  /api/v1/modules
  /api/v2/students (future)
```

**NestJS Configuration:**

```typescript
// main.ts
app.setGlobalPrefix('api')
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1'
})

// Controller
@Controller({
  path: 'students',
  version: '1'
})
export class StudentsController {
  // /api/v1/students
}
```

---

### 16.4.2 Swagger/OpenAPI Documentation

#### Automatic API Documentation

```
Swagger UI: http://localhost:3000/api/docs
OpenAPI JSON: http://localhost:3000/api/docs-json
```

**Configuration:**

```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

const config = new DocumentBuilder()
  .setTitle('Southville 8B NHS Edge API')
  .setDescription('REST API for school portal')
  .setVersion('1.0')
  .addBearerAuth()
  .build()

const document = SwaggerModule.createDocument(app, config)
SwaggerModule.setup('api/docs', app, document)
```

**Documenting Endpoints:**

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({ status: 200, description: 'List of students' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @Get()
  async findAll() {
    // ...
  }
}
```

---

### 16.4.3 API Response Standards

#### Success Response Format

```typescript
// Standard success response
{
  "data": {
    "id": "123",
    "firstName": "John",
    "lastName": "Doe"
  },
  "meta": {
    "timestamp": "2026-01-10T10:00:00Z",
    "version": "1.0"
  }
}

// Paginated response
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### Error Response Format

```typescript
// Validation error
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "gradeLevel",
      "message": "Must be between 7 and 10"
    }
  ]
}

// Authentication error
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}

// Not found error
{
  "statusCode": 404,
  "message": "Student not found",
  "error": "Resource with ID '123' does not exist"
}
```

---

### 16.4.4 API Changelog

#### Version 1.0 (Current)

**Features:**
- ✅ Student management CRUD
- ✅ Teacher management CRUD
- ✅ Learning modules with R2 storage
- ✅ Quiz system
- ✅ Assignments
- ✅ Sections management
- ✅ Announcements
- ✅ Events
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Rate limiting

**Endpoints:** 50+

**Breaking Changes:** None (initial release)

---

## Architecture Best Practices Summary

### ✅ Do

- **Use Server Components for data fetching** - Better performance
- **Use service client for writes** - Bypass RLS for admin operations
- **Validate all input** - class-validator DTOs
- **Implement rate limiting** - Prevent abuse
- **Use presigned URLs for R2** - Time-limited secure access
- **Document with Swagger** - Auto-generate API docs
- **Version your API** - URI-based versioning
- **Handle errors gracefully** - Standard error format
- **Use TypeScript strictly** - Type safety everywhere
- **Implement proper logging** - Track errors and usage

### ❌ Don't

- **Don't use regular client for INSERT/UPDATE/DELETE** - Use service client
- **Don't skip input validation** - Always validate
- **Don't expose service role key to frontend** - Backend only
- **Don't use Express patterns with Fastify** - Different file upload handling
- **Don't skip rate limiting** - Prevent API abuse
- **Don't hardcode secrets** - Use environment variables
- **Don't ignore CORS** - Configure properly for production
- **Don't skip authentication** - Protect all sensitive endpoints
- **Don't use HTTP in production** - Always HTTPS
- **Don't skip error handling** - Handle all error cases

---

## Quick Reference

```typescript
// Next.js Server Component (direct Supabase)
const { data } = await supabase.from('table').select('*')

// NestJS endpoint (protected)
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('Admin')
@Post()
async create(@Body() dto: CreateDto) {}

// Client-side API call
const response = await fetch('/api/v1/endpoint', {
  headers: { 'Authorization': `Bearer ${token}` }
})

// Real-time subscription
supabase.channel('channel').on('postgres_changes', {}, callback).subscribe()

// R2 file upload (NestJS)
const data = await request.file()
await r2Service.uploadFile(data)
```

---

## Navigation

- [← Back to Volume 5 Index](./README.md)
- [Next: Supabase Integration →](./17-supabase-integration.md)
- [↑↑ Back to Manual Index](../README.md)
