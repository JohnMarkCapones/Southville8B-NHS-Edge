# 15. API Integration

**Last Updated:** January 10, 2026
**Status:** ✅ Complete

---

## Table of Contents

- [15.1 API Architecture Overview](#151-api-architecture-overview)
- [15.2 Data Fetching Patterns](#152-data-fetching-patterns)
- [15.3 Client-Side API Calls](#153-client-side-api-calls)
- [15.4 Error Handling](#154-error-handling)
- [15.5 Authentication & Authorization](#155-authentication--authorization)

---

## 15.1 API Architecture Overview

### 15.1.1 System Architecture

The Southville 8B NHS Edge system uses a **multi-layer API architecture**:

```
┌─────────────────────────────────────────┐
│   Next.js Frontend (Port 3000)         │
│   - Server Components (SSR)             │
│   - Client Components (CSR)             │
│   - API Routes (/app/api/*)            │
└─────────────────┬───────────────────────┘
                  │
                  ├──────────► Direct Supabase Client
                  │            (Read-only, RLS protected)
                  │
                  ├──────────► Core API Layer (Port 3000)
                  │            NestJS Backend
                  │            - Business logic
                  │            - File uploads (R2)
                  │            - Complex operations
                  │
                  └──────────► Chat Service (Port 3001)
                               - Real-time messaging
                               - Supabase Realtime
                               - WebSocket connections
```

### 15.1.2 API Endpoints

#### Supabase Direct Access

Used for simple CRUD operations with Row-Level Security:

```typescript
// Direct Supabase queries (Server Components)
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()
const { data, error } = await supabase
  .from('students')
  .select('*')
  .eq('grade_level', 8)
```

#### Core API Layer

NestJS backend for complex operations:

```
Base URL: http://localhost:3000/api/v1

Endpoints:
  /modules          - Learning modules with R2 storage
  /students         - Student management
  /teachers         - Teacher management
  /quizzes          - Quiz system
  /assignments      - Assignment system
  /sections         - Class sections
  /announcements    - School announcements
  /events           - School events
```

#### Chat Service

Dedicated service for real-time messaging:

```
Base URL: http://localhost:3001

Endpoints:
  /channels         - Chat channels
  /messages         - Direct messages
  /realtime         - WebSocket connections
```

---

### 15.1.3 Environment Configuration

```typescript
// .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_CHAT_SERVICE_URL=http://localhost:3001

# Core API is assumed at same origin for Next.js API routes
```

---

## 15.2 Data Fetching Patterns

### 15.2.1 Server Components (Recommended)

**Server Components** fetch data on the server during rendering.

#### Basic Server Component Data Fetching

```typescript
// app/student/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()

  // Fetch data on server
  const { data: student, error } = await supabase
    .from('students')
    .select('*, sections(*)')
    .single()

  if (error) {
    return <div>Error loading student data</div>
  }

  return (
    <div>
      <h1>Welcome, {student.first_name}!</h1>
      <p>Section: {student.sections?.name}</p>
    </div>
  )
}
```

**Benefits:**
- No loading spinners needed
- SEO-friendly (fully rendered HTML)
- Smaller client bundle
- Automatic request deduplication
- Built-in caching

---

### 15.2.2 Parallel Data Fetching

Fetch multiple data sources in parallel for better performance:

```typescript
// app/student/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()

  // Fetch all data in parallel
  const [
    { data: student },
    { data: assignments },
    { data: grades },
    { data: announcements }
  ] = await Promise.all([
    supabase.from('students').select('*').single(),
    supabase.from('assignments').select('*').limit(5),
    supabase.from('grades').select('*'),
    supabase.from('announcements').select('*').limit(3)
  ])

  return (
    <div>
      <StudentInfo student={student} />
      <RecentAssignments assignments={assignments || []} />
      <GradesOverview grades={grades || []} />
      <Announcements items={announcements || []} />
    </div>
  )
}
```

---

### 15.2.3 Data Fetching in Layouts

Share data across multiple pages using layouts:

```typescript
// app/student/layout.tsx
import { createClient } from '@/lib/supabase/server'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  // Fetch user data once for entire student section
  const { data: student } = await supabase
    .from('students')
    .select('*, sections(*)')
    .single()

  return (
    <div>
      <StudentSidebar student={student} />
      <main>{children}</main>
    </div>
  )
}
```

---

### 15.2.4 Streaming with Suspense

Stream data progressively for faster initial page loads:

```typescript
// app/student/grades/page.tsx
import { Suspense } from 'react'
import { GradesList } from '@/components/student/GradesList'
import { GradesSkeleton } from '@/components/student/GradesSkeleton'

export default function GradesPage() {
  return (
    <div>
      <h1>My Grades</h1>

      <Suspense fallback={<GradesSkeleton />}>
        <GradesList />
      </Suspense>
    </div>
  )
}

// components/student/GradesList.tsx
import { createClient } from '@/lib/supabase/server'

export async function GradesList() {
  const supabase = createClient()

  // This data will be streamed
  const { data: grades } = await supabase
    .from('grades')
    .select('*, subjects(*)')
    .order('created_at', { ascending: false })

  return (
    <div>
      {grades?.map((grade) => (
        <div key={grade.id}>
          {grade.subjects.name}: {grade.score}
        </div>
      ))}
    </div>
  )
}
```

---

## 15.3 Client-Side API Calls

### 15.3.1 When to Use Client-Side Fetching

Use client-side fetching when you need:
- User-triggered actions (form submissions, button clicks)
- Real-time updates
- Interactive features
- Data that changes frequently

---

### 15.3.2 Fetch Utility Wrapper

Create a reusable fetch wrapper for consistency:

```typescript
// lib/api/client.ts

interface ApiOptions extends RequestInit {
  token?: string
}

interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { token, ...fetchOptions } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(endpoint, {
      ...fetchOptions,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.message || 'Request failed',
        data
      )
    }

    return {
      data,
      error: null,
      status: response.status,
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        data: null,
        error: error.message,
        status: error.status,
      }
    }

    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
    }
  }
}

// Convenience methods
export const api = {
  get: <T>(url: string, options?: ApiOptions) =>
    apiClient<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, body?: any, options?: ApiOptions) =>
    apiClient<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(url: string, body?: any, options?: ApiOptions) =>
    apiClient<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T>(url: string, options?: ApiOptions) =>
    apiClient<T>(url, { ...options, method: 'DELETE' }),
}
```

---

### 15.3.3 Using the API Client

#### GET Request

```typescript
'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api/client'

interface Student {
  id: string
  name: string
  email: string
}

export function StudentList() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true)
        const { data, error } = await api.get<Student[]>('/api/students')

        if (error) {
          setError(error)
          return
        }

        setStudents(data || [])
      } catch (err) {
        setError('Failed to fetch students')
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <ul>
      {students.map((student) => (
        <li key={student.id}>{student.name}</li>
      ))}
    </ul>
  )
}
```

#### POST Request (Form Submission)

```typescript
'use client'

import { useState } from 'react'
import { api } from '@/lib/api/client'
import { useRouter } from 'next/navigation'

interface CreateStudentData {
  firstName: string
  lastName: string
  email: string
  gradeLevel: number
}

export function CreateStudentForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const data: CreateStudentData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      gradeLevel: Number(formData.get('gradeLevel')),
    }

    try {
      setLoading(true)
      setError(null)

      const { data: student, error: apiError } = await api.post(
        '/api/students',
        data
      )

      if (apiError) {
        setError(apiError)
        return
      }

      // Redirect to student page
      router.push(`/admin/students/${student.id}`)
    } catch (err) {
      setError('Failed to create student')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="text-red-500">{error}</div>}

      <input name="firstName" placeholder="First Name" required />
      <input name="lastName" placeholder="Last Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="gradeLevel" type="number" placeholder="Grade" required />

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Student'}
      </button>
    </form>
  )
}
```

#### PUT Request (Update)

```typescript
'use client'

import { api } from '@/lib/api/client'
import { toast } from 'sonner'

interface UpdateStudentData {
  firstName?: string
  lastName?: string
  email?: string
}

export function useUpdateStudent() {
  async function updateStudent(id: string, data: UpdateStudentData) {
    const { data: updated, error } = await api.put(
      `/api/students/${id}`,
      data
    )

    if (error) {
      toast.error(`Failed to update student: ${error}`)
      return { success: false, error }
    }

    toast.success('Student updated successfully')
    return { success: true, data: updated }
  }

  return { updateStudent }
}
```

#### DELETE Request

```typescript
'use client'

import { api } from '@/lib/api/client'
import { toast } from 'sonner'

export function useDeleteStudent() {
  async function deleteStudent(id: string) {
    if (!confirm('Are you sure you want to delete this student?')) {
      return { success: false }
    }

    const { error } = await api.delete(`/api/students/${id}`)

    if (error) {
      toast.error(`Failed to delete student: ${error}`)
      return { success: false, error }
    }

    toast.success('Student deleted successfully')
    return { success: true }
  }

  return { deleteStudent }
}
```

---

### 15.3.4 File Upload

```typescript
'use client'

import { useState } from 'react'

export function FileUploadForm() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const file = formData.get('file') as File

    if (!file) return

    try {
      setUploading(true)

      // Create FormData for file upload
      const uploadData = new FormData()
      uploadData.append('file', file)
      uploadData.append('title', formData.get('title') as string)
      uploadData.append('description', formData.get('description') as string)

      const response = await fetch('/api/modules/upload', {
        method: 'POST',
        body: uploadData,
        // Don't set Content-Type - browser will set it with boundary
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      console.log('Uploaded:', data)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload}>
      <input name="title" placeholder="Title" required />
      <textarea name="description" placeholder="Description" />
      <input name="file" type="file" required />

      <button type="submit" disabled={uploading}>
        {uploading ? `Uploading... ${progress}%` : 'Upload'}
      </button>
    </form>
  )
}
```

---

### 15.3.5 Supabase Client-Side Operations

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function RealtimeGrades() {
  const [grades, setGrades] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    async function fetchGrades() {
      const { data } = await supabase
        .from('grades')
        .select('*')
        .order('created_at', { ascending: false })

      setGrades(data || [])
    }

    fetchGrades()

    // Subscribe to realtime updates
    const channel = supabase
      .channel('grades-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grades',
        },
        (payload) => {
          console.log('Grade changed:', payload)

          if (payload.eventType === 'INSERT') {
            setGrades((current) => [payload.new, ...current])
          } else if (payload.eventType === 'UPDATE') {
            setGrades((current) =>
              current.map((grade) =>
                grade.id === payload.new.id ? payload.new : grade
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setGrades((current) =>
              current.filter((grade) => grade.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div>
      {grades.map((grade) => (
        <div key={grade.id}>
          {grade.subject}: {grade.score}
        </div>
      ))}
    </div>
  )
}
```

---

## 15.4 Error Handling

### 15.4.1 Error Types

```typescript
// lib/api/errors.ts

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public fields?: Record<string, string[]>) {
    super(400, message, 'VALIDATION_ERROR')
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(401, message, 'AUTH_REQUIRED')
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Permission denied') {
    super(403, message, 'FORBIDDEN')
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND')
  }
}

export class ServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(500, message, 'SERVER_ERROR')
  }
}
```

---

### 15.4.2 Error Handling Pattern

```typescript
'use client'

import { useState } from 'react'
import { api, ApiError } from '@/lib/api/client'
import { toast } from 'sonner'

export function StudentForm() {
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function handleSubmit(data: any) {
    try {
      setError(null)
      setFieldErrors({})

      const { error: apiError } = await api.post('/api/students', data)

      if (apiError) {
        // Handle different error types
        if (apiError.status === 400) {
          // Validation error
          setFieldErrors(apiError.details?.fields || {})
          setError('Please fix the validation errors')
        } else if (apiError.status === 401) {
          // Authentication error
          setError('Please log in to continue')
          // Redirect to login
        } else if (apiError.status === 403) {
          // Authorization error
          setError('You do not have permission to perform this action')
        } else if (apiError.status === 404) {
          // Not found
          setError('Resource not found')
        } else {
          // Generic error
          setError(apiError.message || 'An error occurred')
        }

        toast.error(error)
        return
      }

      toast.success('Student created successfully')
    } catch (err) {
      setError('An unexpected error occurred')
      toast.error('An unexpected error occurred')
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleSubmit({/* ... */})
    }}>
      {error && <div className="text-red-500">{error}</div>}

      <input name="name" />
      {fieldErrors.name && (
        <p className="text-sm text-red-500">{fieldErrors.name}</p>
      )}

      {/* More fields */}
    </form>
  )
}
```

---

### 15.4.3 Global Error Boundary

```typescript
// app/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={() => reset()}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Try again
      </button>
    </div>
  )
}
```

---

## 15.5 Authentication & Authorization

### 15.5.1 Getting User Session

```typescript
// Server Component
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/guess/login')
  }

  return <div>Welcome, {user.email}</div>
}

// Client Component
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function UserProfile() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()
  }, [supabase])

  if (!user) return <div>Not logged in</div>

  return <div>Welcome, {user.email}</div>
}
```

---

### 15.5.2 Authenticated API Calls

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { api } from '@/lib/api/client'

export function useAuthenticatedApi() {
  const supabase = createClient()

  async function makeAuthenticatedRequest<T>(
    endpoint: string,
    options?: RequestInit
  ) {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      throw new Error('Not authenticated')
    }

    // Make request with auth token
    return api.get<T>(endpoint, {
      ...options,
      token: session.access_token,
    })
  }

  return { makeAuthenticatedRequest }
}
```

---

### 15.5.3 Role-Based Access

```typescript
// lib/auth/roles.ts
export type UserRole = 'student' | 'teacher' | 'admin' | 'superadmin'

export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

export function requireRole(
  userRole: UserRole,
  requiredRoles: UserRole[]
): void {
  if (!hasRole(userRole, requiredRoles)) {
    throw new Error('Insufficient permissions')
  }
}

// Usage in component
'use client'

import { hasRole } from '@/lib/auth/roles'

export function AdminPanel({ userRole }: { userRole: UserRole }) {
  if (!hasRole(userRole, ['admin', 'superadmin'])) {
    return <div>Access denied</div>
  }

  return <div>Admin Panel Content</div>
}
```

---

## API Integration Best Practices Summary

### ✅ Do

- **Use Server Components for initial data** - Better performance and SEO
- **Handle errors gracefully** - Provide user-friendly messages
- **Use type-safe API client** - TypeScript for all API calls
- **Implement loading states** - Show feedback during async operations
- **Cache when appropriate** - Use Next.js caching strategies
- **Validate input** - Both client and server-side
- **Use environment variables** - Never hardcode API URLs
- **Implement retry logic** - For transient failures
- **Log errors** - For debugging and monitoring
- **Use proper HTTP methods** - GET, POST, PUT, DELETE

### ❌ Don't

- **Don't fetch data in Client Components unnecessarily** - Use Server Components
- **Don't ignore errors** - Always handle them
- **Don't use `any` types** - Type your API responses
- **Don't expose sensitive data** - Use proper authentication
- **Don't fetch data in loops** - Batch requests when possible
- **Don't forget loading states** - Users need feedback
- **Don't hardcode URLs** - Use environment variables
- **Don't skip validation** - Validate all user input
- **Don't fetch data on every render** - Use caching
- **Don't ignore HTTP status codes** - Handle different scenarios

---

## Quick Reference

```typescript
// Server Component data fetching
const { data } = await supabase.from('table').select('*')

// Client Component data fetching
const { data, error } = await api.get('/endpoint')

// Authenticated request
const { data: { session } } = await supabase.auth.getSession()
api.get('/endpoint', { token: session.access_token })

// Error handling
try {
  const { data, error } = await api.post('/endpoint', body)
  if (error) throw new Error(error)
} catch (err) {
  console.error(err)
}

// File upload
const formData = new FormData()
formData.append('file', file)
await fetch('/api/upload', { method: 'POST', body: formData })

// Realtime subscription
supabase.channel('channel-name')
  .on('postgres_changes', { event: '*', table: 'table' }, callback)
  .subscribe()
```

---

## Navigation

- [← Previous: Code Quality & Testing](./14-code-quality-testing.md)
- [↑ Back to Volume 3 Index](./README.md)
- [↑↑ Back to Manual Index](../README.md)
