# 9. Next.js 15 App Router Guide

**Last Updated:** January 10, 2026
**Status:** ✅ Complete

---

## Table of Contents

- [9.1 App Router Fundamentals](#91-app-router-fundamentals)
- [9.2 Route Organization by Role](#92-route-organization-by-role)
- [9.3 Server Components](#93-server-components)
- [9.4 Client Components](#94-client-components)
- [9.5 Data Fetching](#95-data-fetching)

---

## 9.1 App Router Fundamentals

### 9.1.1 File-Based Routing

Next.js 15 uses a **file-system based router** where folders define routes.

#### Basic Structure

```
app/
├── page.tsx                    # Route: /
├── about/
│   └── page.tsx               # Route: /about
├── student/
│   ├── page.tsx               # Route: /student
│   ├── dashboard/
│   │   └── page.tsx           # Route: /student/dashboard
│   └── grades/
│       └── page.tsx           # Route: /student/grades
```

#### Special Files

| File | Purpose | Required | Example |
|------|---------|----------|---------|
| `page.tsx` | Define a route | ✅ Yes | Renders the page UI |
| `layout.tsx` | Shared layout for route segment | No | Sidebar + content wrapper |
| `loading.tsx` | Loading UI (Suspense boundary) | No | Loading spinner |
| `error.tsx` | Error UI boundary | No | Error message |
| `not-found.tsx` | 404 page | No | Custom 404 |
| `route.ts` | API route | No | API endpoint |

---

### 9.1.2 Server Components vs Client Components

**Default:** All components in App Router are **Server Components**

#### Server Components (Default)

```tsx
// app/student/dashboard/page.tsx
// No "use client" directive = Server Component

export default async function DashboardPage() {
  // Can directly access database
  const students = await fetchStudents()

  return (
    <div>
      <h1>Dashboard</h1>
      {students.map(student => (
        <div key={student.id}>{student.name}</div>
      ))}
    </div>
  )
}
```

**Benefits:**
- Zero JavaScript sent to client
- Direct database access
- Better SEO
- Improved performance

**Limitations:**
- Cannot use React hooks (`useState`, `useEffect`)
- No event handlers (`onClick`, `onChange`)
- No browser APIs (`localStorage`, `window`)

#### Client Components

```tsx
// app/student/components/InteractiveButton.tsx
'use client' // Required directive

import { useState } from 'react'

export function InteractiveButton() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  )
}
```

**When to use:**
- Need React hooks
- Need event handlers
- Need browser APIs
- Third-party libraries requiring client-side

---

### 9.1.3 Special Files in Detail

#### page.tsx

Defines the UI for a route.

```tsx
// app/student/grades/page.tsx
export default function GradesPage() {
  return (
    <div>
      <h1>My Grades</h1>
      {/* Page content */}
    </div>
  )
}
```

#### layout.tsx

Shared UI that wraps multiple pages.

```tsx
// app/student/layout.tsx
import { StudentSidebar } from '@/components/student/StudentSidebar'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <StudentSidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
```

**Key points:**
- Layouts are shared across routes
- Nested layouts compose together
- Layouts persist during navigation (no re-render)

#### loading.tsx

Automatic loading UI with React Suspense.

```tsx
// app/student/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  )
}
```

Shows automatically while `page.tsx` is loading data.

#### error.tsx

Error boundary for route segment.

```tsx
// app/student/dashboard/error.tsx
'use client' // Error components must be Client Components

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

#### not-found.tsx

Custom 404 page for route segment.

```tsx
// app/student/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Student Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  )
}
```

---

## 9.2 Route Organization by Role

The application uses **role-based route organization** for security and separation of concerns.

### 9.2.1 Route Structure Overview

```
app/
├── guess/              # Public routes (unauthenticated)
├── student/            # Student portal
├── teacher/            # Teacher portal
├── admin/              # Admin portal
└── superadmin/         # Super admin portal
```

---

### 9.2.2 Guest Routes (/guess/*)

**Public, unauthenticated routes**

```
app/guess/
├── page.tsx                    # Homepage
├── layout.tsx                  # Public layout
├── login/
│   └── page.tsx               # Login page
├── news/
│   ├── page.tsx               # News list
│   └── [id]/
│       └── page.tsx           # News detail
├── events/
│   ├── page.tsx               # Events calendar
│   └── [id]/
│       └── page.tsx           # Event detail
├── clubs/
│   └── page.tsx               # Clubs directory
├── academics/
│   └── page.tsx               # Academic programs
└── announcements/
    └── page.tsx               # Public announcements
```

**Example: News detail page**

```tsx
// app/guess/news/[id]/page.tsx
interface NewsDetailPageProps {
  params: {
    id: string
  }
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const news = await fetchNewsById(params.id)

  if (!news) {
    notFound()
  }

  return (
    <article>
      <h1>{news.title}</h1>
      <p>{news.content}</p>
    </article>
  )
}
```

---

### 9.2.3 Student Routes (/student/*)

**Protected routes for authenticated students**

```
app/student/
├── layout.tsx                  # Student sidebar + layout
├── dashboard/
│   └── page.tsx               # Student dashboard
├── assignments/
│   ├── page.tsx               # Assignment list
│   └── [id]/
│       └── page.tsx           # Assignment detail
├── grades/
│   └── page.tsx               # Student grades
├── courses/
│   ├── page.tsx               # Enrolled courses
│   └── [id]/
│       └── page.tsx           # Course detail
├── quiz/
│   ├── page.tsx               # Available quizzes
│   ├── [id]/
│   │   └── page.tsx           # Take quiz
│   └── results/
│       └── [id]/
│           └── page.tsx       # Quiz results
├── schedule/
│   └── page.tsx               # Class schedule
├── clubs/
│   └── page.tsx               # My clubs
├── publisher/
│   └── page.tsx               # Student journalism
└── productivity/
    ├── notes/
    │   └── page.tsx           # Notes app
    ├── todo/
    │   └── page.tsx           # Todo list
    └── goals/
        └── page.tsx           # Goal tracker
```

**Example: Student layout with authentication**

```tsx
// app/student/layout.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { StudentSidebar } from '@/components/student/StudentSidebar'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  // Redirect if not authenticated or not a student
  if (!session || session.user.role !== 'student') {
    redirect('/guess/login')
  }

  return (
    <div className="flex min-h-screen">
      <StudentSidebar user={session.user} />
      <main className="flex-1 p-6 bg-gray-50">
        {children}
      </main>
    </div>
  )
}
```

---

### 9.2.4 Teacher Routes (/teacher/*)

**Protected routes for authenticated teachers**

```
app/teacher/
├── layout.tsx                  # Teacher sidebar + layout
├── dashboard/
│   └── page.tsx               # Teacher dashboard
├── students/
│   ├── page.tsx               # Student list
│   └── [id]/
│       └── page.tsx           # Student detail
├── classes/
│   ├── page.tsx               # My classes
│   └── [id]/
│       └── page.tsx           # Class detail
├── quiz/
│   ├── page.tsx               # Quiz list
│   ├── builder/
│   │   └── page.tsx           # Quiz builder
│   ├── [id]/
│   │   ├── edit/
│   │   │   └── page.tsx       # Edit quiz
│   │   └── grade/
│   │       └── page.tsx       # Grade quiz
│   └── monitor/
│       └── [id]/
│           └── page.tsx       # Monitor active quiz
├── schedule/
│   └── page.tsx               # Teacher schedule
├── clubs/
│   └── page.tsx               # Manage clubs
└── resources/
    └── page.tsx               # Teaching resources
```

---

### 9.2.5 Admin Routes (/admin/* and /superadmin/*)

**Protected routes for administrators**

```
app/admin/
├── layout.tsx
├── dashboard/
│   └── page.tsx
├── users/
│   └── page.tsx
└── reports/
    └── page.tsx

app/superadmin/
├── layout.tsx
├── dashboard/
│   └── page.tsx
├── system/
│   └── page.tsx
└── settings/
    └── page.tsx
```

---

## 9.3 Server Components

### 9.3.1 Benefits and Use Cases

**Why use Server Components:**
- ✅ **Zero client-side JavaScript**
- ✅ **Direct database access**
- ✅ **Better SEO** (fully rendered HTML)
- ✅ **Improved performance** (less JS to download)
- ✅ **Secure** (API keys safe on server)

**When to use:**
- Fetching data from database
- Rendering static content
- SEO-critical pages
- Large dependencies (charts, markdown renderers)

---

### 9.3.2 Data Fetching Patterns

#### Basic Data Fetching

```tsx
// app/student/dashboard/page.tsx
async function getStudentData(studentId: string) {
  const res = await fetch(`${process.env.API_URL}/students/${studentId}`, {
    cache: 'no-store', // Always fresh data
  })

  if (!res.ok) {
    throw new Error('Failed to fetch student data')
  }

  return res.json()
}

export default async function DashboardPage() {
  const student = await getStudentData('123')

  return (
    <div>
      <h1>Welcome, {student.name}</h1>
      <p>Grade: {student.grade}</p>
    </div>
  )
}
```

#### Parallel Data Fetching

```tsx
// Fetch multiple data sources in parallel
export default async function DashboardPage() {
  // These run in parallel
  const [student, assignments, grades] = await Promise.all([
    fetchStudent(),
    fetchAssignments(),
    fetchGrades(),
  ])

  return (
    <div>
      <StudentInfo student={student} />
      <AssignmentList assignments={assignments} />
      <GradesSummary grades={grades} />
    </div>
  )
}
```

#### Sequential Data Fetching (when needed)

```tsx
export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  // First, fetch the course
  const course = await fetchCourse(params.id)

  // Then, fetch related data based on course
  const students = await fetchStudentsByCourse(course.id)
  const assignments = await fetchAssignmentsByCourse(course.id)

  return (
    <div>
      <h1>{course.name}</h1>
      <StudentList students={students} />
      <AssignmentList assignments={assignments} />
    </div>
  )
}
```

---

### 9.3.3 Caching and Revalidation

#### Default Caching

```tsx
// Cached by default (until revalidated)
async function fetchNews() {
  const res = await fetch('https://api.example.com/news')
  return res.json()
}
```

#### No Caching

```tsx
// Always fetch fresh data
async function fetchDashboardData() {
  const res = await fetch('https://api.example.com/dashboard', {
    cache: 'no-store',
  })
  return res.json()
}
```

#### Time-based Revalidation

```tsx
// Revalidate every 60 seconds
async function fetchNews() {
  const res = await fetch('https://api.example.com/news', {
    next: { revalidate: 60 },
  })
  return res.json()
}
```

#### On-demand Revalidation

```tsx
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path')

  if (path) {
    revalidatePath(path)
    return Response.json({ revalidated: true, now: Date.now() })
  }

  return Response.json({ revalidated: false, now: Date.now() })
}
```

---

## 9.4 Client Components

### 9.4.1 When to Use Client Components

Use Client Components when you need:

| Feature | Requires Client Component |
|---------|--------------------------|
| React hooks (`useState`, `useEffect`) | ✅ Yes |
| Event handlers (`onClick`, `onChange`) | ✅ Yes |
| Browser APIs (`localStorage`, `window`) | ✅ Yes |
| Third-party libraries (most) | ✅ Yes |
| Form interactivity | ✅ Yes |
| Real-time features | ✅ Yes |

---

### 9.4.2 "use client" Directive

Place `"use client"` at the **top of the file** (before imports).

```tsx
// components/student/AssignmentSubmit.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function AssignmentSubmit() {
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = () => {
    if (!file) return
    // Submit logic
  }

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  )
}
```

---

### 9.4.3 Client Component Patterns

#### Pattern 1: Wrap Interactive Parts Only

**Good: Minimal client component**

```tsx
// app/student/dashboard/page.tsx (Server Component)
import { InteractiveChart } from './InteractiveChart'

export default async function DashboardPage() {
  const data = await fetchData()

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Static content here</p>

      {/* Only this is a client component */}
      <InteractiveChart data={data} />
    </div>
  )
}

// ./InteractiveChart.tsx
'use client'

export function InteractiveChart({ data }: { data: any[] }) {
  const [filter, setFilter] = useState('all')
  // Interactive logic
  return <div>Chart with filters</div>
}
```

**Bad: Entire page as client component**

```tsx
// DON'T DO THIS
'use client'

export default function DashboardPage() {
  // Unnecessary - makes entire page client-side
  const [data, setData] = useState([])

  useEffect(() => {
    fetchData().then(setData)
  }, [])

  return <div>...</div>
}
```

#### Pattern 2: Passing Server Components to Client Components

```tsx
// Client Component can accept Server Components as children
'use client'

export function Tabs({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div>
      <TabButtons activeTab={activeTab} setActiveTab={setActiveTab} />
      {children}
    </div>
  )
}

// Usage in Server Component
export default async function Page() {
  const data = await fetchData()

  return (
    <Tabs>
      <ServerComponent data={data} /> {/* Server Component inside Client Component */}
    </Tabs>
  )
}
```

---

### 9.4.4 Common Client Component Examples

#### Form with Validation

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function CreateAssignmentForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    console.log('Submitting:', data)
    // API call
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <p>{errors.title.message}</p>}

      <textarea {...register('description')} />

      <button type="submit">Create</button>
    </form>
  )
}
```

#### Modal/Dialog

```tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function CreateStudentDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Student</Button>
      </DialogTrigger>
      <DialogContent>
        <h2>Create New Student</h2>
        {/* Form content */}
      </DialogContent>
    </Dialog>
  )
}
```

#### Real-time Subscription

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function RealtimeMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  )
}
```

---

## 9.5 Data Fetching

### 9.5.1 Fetch API in Server Components

#### Basic Fetch

```tsx
async function getStudents() {
  const res = await fetch('http://localhost:3000/api/students')

  if (!res.ok) {
    throw new Error('Failed to fetch students')
  }

  return res.json()
}

export default async function StudentsPage() {
  const students = await getStudents()

  return (
    <ul>
      {students.map(student => (
        <li key={student.id}>{student.name}</li>
      ))}
    </ul>
  )
}
```

#### With Error Handling

```tsx
async function getStudents() {
  try {
    const res = await fetch('http://localhost:3000/api/students', {
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    return await res.json()
  } catch (error) {
    console.error('Error fetching students:', error)
    return []
  }
}
```

---

### 9.5.2 Loading States

#### Automatic with loading.tsx

```tsx
// app/student/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  )
}

// app/student/dashboard/page.tsx
export default async function DashboardPage() {
  // This will show loading.tsx while data fetches
  const data = await fetchDashboardData()
  return <Dashboard data={data} />
}
```

#### Manual with Suspense

```tsx
import { Suspense } from 'react'

function LoadingFallback() {
  return <div>Loading...</div>
}

async function StudentList() {
  const students = await fetchStudents()
  return (
    <ul>
      {students.map(s => <li key={s.id}>{s.name}</li>)}
    </ul>
  )
}

export default function Page() {
  return (
    <div>
      <h1>Students</h1>
      <Suspense fallback={<LoadingFallback />}>
        <StudentList />
      </Suspense>
    </div>
  )
}
```

---

### 9.5.3 Error Handling

#### With error.tsx

```tsx
// app/student/dashboard/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="error-container">
      <h2>Failed to load dashboard</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

#### Manual Error Handling

```tsx
async function getStudent(id: string) {
  const res = await fetch(`/api/students/${id}`)

  if (!res.ok) {
    if (res.status === 404) {
      notFound() // Triggers not-found.tsx
    }
    throw new Error('Failed to fetch student')
  }

  return res.json()
}
```

---

### 9.5.4 Revalidation Patterns

#### Page-level Revalidation

```tsx
// Revalidate page every 60 seconds
export const revalidate = 60

export default async function NewsPage() {
  const news = await fetchNews()
  return <NewsList news={news} />
}
```

#### Dynamic Route Revalidation

```tsx
// app/news/[id]/page.tsx
export async function generateStaticParams() {
  const posts = await fetchAllPosts()
  return posts.map((post) => ({
    id: post.id,
  }))
}

export default async function NewsDetail({ params }: { params: { id: string } }) {
  const post = await fetchPost(params.id)
  return <Article post={post} />
}

export const revalidate = 3600 // Revalidate every hour
```

---

## Navigation

- [← Previous: Development Workflow](./08-development-workflow.md)
- [Next: Component Development →](./10-component-development.md)
- [↑ Back to Volume 3 Index](./README.md)
- [↑↑ Back to Manual Index](../README.md)
