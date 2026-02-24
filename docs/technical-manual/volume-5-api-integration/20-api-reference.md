# 20. API Reference & Endpoints

**Last Updated:** January 10, 2026
**Status:** ✅ Complete

---

## Table of Contents

- [20.1 Next.js API Routes](#201-nextjs-api-routes)
- [20.2 Core API Endpoints](#202-core-api-endpoints)
- [20.3 Request/Response Formats](#203-requestresponse-formats)
- [20.4 Rate Limiting](#204-rate-limiting)

---

## 20.1 Next.js API Routes

### 20.1.1 Route Handlers

Next.js 15 uses Route Handlers in the App Router for API endpoints.

#### Basic Route Handler

```typescript
// app/api/hello/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Hello from API!',
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  return NextResponse.json({
    received: body,
    status: 'success',
  }, { status: 201 })
}
```

**Available Methods:**
- `GET` - Retrieve data
- `POST` - Create resources
- `PUT` - Update resources
- `PATCH` - Partial updates
- `DELETE` - Delete resources
- `HEAD` - Headers only
- `OPTIONS` - CORS preflight

---

#### Dynamic Routes

```typescript
// app/api/students/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const studentId = params.id

  // Fetch student data
  const student = await fetchStudent(studentId)

  if (!student) {
    return NextResponse.json(
      { error: 'Student not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(student)
}
```

---

### 20.1.2 Request/Response Types

#### Request Object

```typescript
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  // Get JSON body
  const body = await request.json()

  // Get form data
  const formData = await request.formData()
  const name = formData.get('name')

  // Get URL parameters
  const searchParams = request.nextUrl.searchParams
  const page = searchParams.get('page')

  // Get headers
  const authorization = request.headers.get('authorization')

  // Get cookies
  const token = request.cookies.get('token')

  return NextResponse.json({ success: true })
}
```

#### Response Object

```typescript
import { NextResponse } from 'next/server'

// JSON response
return NextResponse.json({ data: 'value' })

// Custom status code
return NextResponse.json(
  { error: 'Not found' },
  { status: 404 }
)

// Set headers
return NextResponse.json(
  { data: 'value' },
  {
    status: 200,
    headers: {
      'Cache-Control': 'max-age=3600',
      'X-Custom-Header': 'value',
    },
  }
)

// Set cookies
const response = NextResponse.json({ success: true })
response.cookies.set('token', 'value', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 7, // 1 week
})
return response

// Redirect
return NextResponse.redirect(new URL('/login', request.url))
```

---

### 20.1.3 Middleware

#### Authentication Middleware

```typescript
// app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()

  // Verify authentication
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // User is authenticated
  return NextResponse.json({
    message: 'Protected data',
    user: {
      id: user.id,
      email: user.email,
    },
  })
}
```

#### CORS Middleware

```typescript
// app/api/public/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data: 'public' })

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  return response
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

---

## 20.2 Core API Endpoints

### 20.2.1 Student Endpoints

#### Base URL: `/api/v1/students`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/students` | List all students | Required | Admin, Teacher |
| GET | `/students/:id` | Get student by ID | Required | Admin, Teacher, Student (own) |
| POST | `/students` | Create student | Required | Admin |
| PUT | `/students/:id` | Update student | Required | Admin |
| DELETE | `/students/:id` | Delete student | Required | Admin |
| GET | `/students/:id/grades` | Get student grades | Required | Admin, Teacher, Student (own) |
| GET | `/students/:id/assignments` | Get student assignments | Required | Admin, Teacher, Student (own) |

---

#### GET `/students`

**Query Parameters:**
```typescript
{
  page?: number        // Page number (default: 1)
  limit?: number       // Items per page (default: 20, max: 100)
  gradeLevel?: number  // Filter by grade (7-10)
  sectionId?: string   // Filter by section
  search?: string      // Search by name or email
  sortBy?: string      // Sort field (default: 'last_name')
  sortOrder?: 'asc' | 'desc'  // Sort order (default: 'asc')
}
```

**Example Request:**
```bash
GET /api/v1/students?page=1&limit=20&gradeLevel=8
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@school.edu",
      "grade_level": 8,
      "section_id": "uuid",
      "sections": {
        "id": "uuid",
        "name": "8-A",
        "grade_level": 8
      },
      "created_at": "2026-01-10T10:00:00Z",
      "updated_at": "2026-01-10T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

#### POST `/students`

**Request Body:**
```json
{
  "userId": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@school.edu",
  "gradeLevel": 8,
  "sectionId": "uuid"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@school.edu",
  "grade_level": 8,
  "section_id": "uuid",
  "created_at": "2026-01-10T10:00:00Z",
  "updated_at": "2026-01-10T10:00:00Z"
}
```

**Error Responses:**
```json
// 400 Bad Request - Validation Error
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email format"],
    "gradeLevel": ["Must be between 7 and 10"]
  }
}

// 409 Conflict - Duplicate Email
{
  "statusCode": 409,
  "message": "Email already exists"
}
```

---

### 20.2.2 Teacher Endpoints

#### Base URL: `/api/v1/teachers`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teachers` | List all teachers | Required | Admin |
| GET | `/teachers/:id` | Get teacher by ID | Required | Admin, Teacher (own) |
| POST | `/teachers` | Create teacher | Required | Admin |
| PUT | `/teachers/:id` | Update teacher | Required | Admin |
| DELETE | `/teachers/:id` | Delete teacher | Required | Admin |
| GET | `/teachers/:id/students` | Get teacher's students | Required | Admin, Teacher (own) |
| GET | `/teachers/:id/subjects` | Get teacher's subjects | Required | Admin, Teacher (own) |

**Similar structure to Students API**

---

### 20.2.3 Module Endpoints

#### Base URL: `/api/v1/modules`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/modules` | List modules | Required | All authenticated |
| GET | `/modules/:id` | Get module details | Required | All authenticated |
| POST | `/modules/upload` | Upload module | Required | Teacher, Admin |
| GET | `/modules/:id/download` | Download module | Required | All authenticated |
| DELETE | `/modules/:id` | Delete module | Required | Teacher (owner), Admin |

---

#### POST `/modules/upload`

**Content-Type:** `multipart/form-data`

**Form Fields:**
```
file: File (required)
  - Max size: 10MB
  - Allowed types: PDF, PPTX, DOCX, PPT, DOC

title: string (required)
  - Min length: 3

description: string (optional)

isGlobal: boolean (optional)
  - true: Available to all sections
  - false: Specific to section(s)

subjectId: string (optional)
  - Required if isGlobal = false

sectionId: string (optional)
  - Required if isGlobal = false
```

**Example Request:**
```bash
POST /api/v1/modules/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="lesson.pdf"
Content-Type: application/pdf

[binary data]
--boundary
Content-Disposition: form-data; name="title"

Mathematics Lesson 1
--boundary
Content-Disposition: form-data; name="description"

Introduction to Algebra
--boundary
Content-Disposition: form-data; name="isGlobal"

false
--boundary
Content-Disposition: form-data; name="subjectId"

uuid
--boundary--
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "title": "Mathematics Lesson 1",
  "description": "Introduction to Algebra",
  "file_url": "https://r2.cloudflarestorage.com/...",
  "r2_file_key": "modules/sections/uuid/uuid-lesson.pdf",
  "file_name": "lesson.pdf",
  "file_size": 1048576,
  "mime_type": "application/pdf",
  "is_global": false,
  "subject_id": "uuid",
  "uploaded_by": "uuid",
  "created_at": "2026-01-10T10:00:00Z"
}
```

**Rate Limiting:**
- Teachers: 10 uploads per hour
- Admins: No limit

---

#### GET `/modules/:id/download`

**Response (200 OK):**
```json
{
  "url": "https://r2.cloudflarestorage.com/...?signature=...",
  "fileName": "lesson.pdf",
  "expiresIn": 3600
}
```

**Note:** Returns a presigned URL valid for 1 hour.

---

### 20.2.4 Quiz Endpoints

#### Base URL: `/api/v1/quizzes`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/quizzes` | List quizzes | Required | All authenticated |
| GET | `/quizzes/:id` | Get quiz details | Required | All authenticated |
| POST | `/quizzes` | Create quiz | Required | Teacher, Admin |
| PUT | `/quizzes/:id` | Update quiz | Required | Teacher (owner), Admin |
| DELETE | `/quizzes/:id` | Delete quiz | Required | Teacher (owner), Admin |
| POST | `/quizzes/:id/submit` | Submit quiz answers | Required | Student |
| GET | `/quizzes/:id/results` | Get quiz results | Required | Teacher, Admin, Student (own) |

---

#### POST `/quizzes`

**Request Body:**
```json
{
  "title": "Mathematics Quiz 1",
  "description": "Algebra basics",
  "subjectId": "uuid",
  "timeLimit": 30,
  "questions": [
    {
      "question": "What is 2 + 2?",
      "type": "multiple-choice",
      "choices": ["3", "4", "5", "6"],
      "correctAnswer": "4",
      "points": 1
    },
    {
      "question": "Is algebra a branch of mathematics?",
      "type": "true-false",
      "correctAnswer": "true",
      "points": 1
    }
  ]
}
```

---

### 20.2.5 Assignment Endpoints

#### Base URL: `/api/v1/assignments`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/assignments` | List assignments | Required | All authenticated |
| GET | `/assignments/:id` | Get assignment details | Required | All authenticated |
| POST | `/assignments` | Create assignment | Required | Teacher, Admin |
| PUT | `/assignments/:id` | Update assignment | Required | Teacher (owner), Admin |
| DELETE | `/assignments/:id` | Delete assignment | Required | Teacher (owner), Admin |
| POST | `/assignments/:id/submit` | Submit assignment | Required | Student |
| GET | `/assignments/:id/submissions` | Get submissions | Required | Teacher, Admin |

---

### 20.2.6 Admin Endpoints

#### Base URL: `/api/v1/admin`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/admin/dashboard` | Admin dashboard stats | Required | Admin, SuperAdmin |
| GET | `/admin/users` | List all users | Required | Admin, SuperAdmin |
| PUT | `/admin/users/:id/role` | Update user role | Required | SuperAdmin |
| GET | `/admin/logs` | System logs | Required | Admin, SuperAdmin |
| GET | `/admin/analytics` | System analytics | Required | Admin, SuperAdmin |

---

### 20.2.7 Public Endpoints

#### Base URL: `/api/public`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/public/announcements` | Public announcements | None | Public |
| GET | `/public/events` | Upcoming events | None | Public |
| GET | `/public/news` | News articles | None | Public |
| GET | `/public/about` | School information | None | Public |

---

## 20.3 Request/Response Formats

### 20.3.1 Standard Response Structure

#### Success Response

```json
{
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2026-01-10T10:00:00Z",
    "version": "1.0"
  }
}
```

#### List Response with Pagination

```json
{
  "data": [
    // Array of items
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

### 20.3.2 Error Response Format

#### Standard Error

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Additional error details",
  "timestamp": "2026-01-10T10:00:00Z"
}
```

#### Validation Error

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "fieldName": [
      "Error message 1",
      "Error message 2"
    ]
  }
}
```

#### HTTP Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable Entity | Business logic error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

### 20.3.3 Pagination

**Query Parameters:**
```
?page=1          // Page number (1-indexed)
&limit=20        // Items per page (default: 20, max: 100)
&sortBy=created_at
&sortOrder=desc
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Navigation:**
```
First page:    ?page=1
Next page:     ?page=2
Previous page: ?page=1
Last page:     ?page=8
```

---

### 20.3.4 Filtering & Sorting

**Filtering:**
```
// Exact match
?gradeLevel=8

// Multiple values (OR)
?gradeLevel=8,9

// Range
?createdAfter=2026-01-01
&createdBefore=2026-12-31

// Search
?search=john

// Null/Not null
?sectionId=null
?sectionId!=null
```

**Sorting:**
```
// Single field
?sortBy=created_at&sortOrder=desc

// Multiple fields
?sortBy=grade_level,last_name
&sortOrder=asc,asc
```

---

## 20.4 Rate Limiting

### 20.4.1 Global Rate Limits

**Default Limits:**
- **100 requests per minute** per IP address
- **10,000 requests per day** per user

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1736553600
```

---

### 20.4.2 Custom Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/login` | 5 attempts | 15 minutes |
| `/auth/signup` | 3 attempts | 1 hour |
| `/modules/upload` | 10 uploads | 1 hour |
| `/quizzes/:id/submit` | 1 submission | Per quiz |
| `/assignments/:id/submit` | 3 submissions | Per assignment |

---

### 20.4.3 Rate Limit Response

**Status:** `429 Too Many Requests`

```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Rate limit exceeded. Try again in 45 seconds.",
  "retryAfter": 45
}
```

**Headers:**
```
Retry-After: 45
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1736553600
```

---

## API Best Practices Summary

### ✅ For API Consumers

- **Include Authorization header** - Bearer token required
- **Handle rate limits** - Check headers, implement backoff
- **Validate input** - Client-side validation
- **Handle errors gracefully** - Don't crash on API errors
- **Use pagination** - Don't request all data at once
- **Cache responses** - Reduce API calls
- **Use HTTPS** - Secure communication
- **Version your requests** - `/api/v1`
- **Set proper timeouts** - Don't wait forever
- **Log errors** - Track API issues

### ✅ For API Providers

- **Validate all input** - Security first
- **Return consistent responses** - Standard format
- **Use proper HTTP methods** - RESTful design
- **Implement rate limiting** - Prevent abuse
- **Document endpoints** - Swagger/OpenAPI
- **Version your API** - Breaking changes
- **Handle errors properly** - Informative messages
- **Monitor performance** - Track slow endpoints
- **Implement caching** - Reduce database load
- **Secure sensitive endpoints** - Authentication required

---

## Quick Reference

### Authentication

```bash
# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@school.edu",
  "password": "password"
}

# Use token in requests
GET /api/v1/students
Authorization: Bearer <access_token>
```

### Common Requests

```bash
# List with filters
GET /api/v1/students?gradeLevel=8&page=1&limit=20

# Get single resource
GET /api/v1/students/{id}

# Create resource
POST /api/v1/students
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@school.edu",
  "gradeLevel": 8
}

# Update resource
PUT /api/v1/students/{id}
Content-Type: application/json

{
  "firstName": "John Updated"
}

# Delete resource
DELETE /api/v1/students/{id}

# File upload
POST /api/v1/modules/upload
Content-Type: multipart/form-data

file: [binary]
title: "Lesson 1"
description: "Introduction"
```

---

## Navigation

- [← Previous: Chat Service Integration](./19-chat-service.md)
- [↑ Back to Volume 5 Index](./README.md)
- [↑↑ Back to Manual Index](../README.md)
