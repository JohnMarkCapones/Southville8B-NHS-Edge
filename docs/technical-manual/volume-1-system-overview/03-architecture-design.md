# 3. Architecture & Design

**Last Updated:** January 10, 2026
**Status:** 🚧 In Progress (75% Complete)

---

## 3.1 System Architecture Overview

### 3.1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Browser)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐ │
│  │   Guest    │  │  Student   │  │  Teacher   │  │    Admin     │ │
│  │   Portal   │  │   Portal   │  │   Portal   │  │    Portal    │ │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘  └──────┬───────┘ │
└─────────┼────────────────┼────────────────┼────────────────┼─────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
          ┌─────────▼─────────┐       ┌──────────▼──────────┐
          │   NEXT.JS 15      │       │    SUPABASE         │
          │   APP ROUTER      │◄──────┤    REALTIME         │
          │  (Frontend App)   │       │   (WebSocket)       │
          └─────────┬─────────┘       └─────────────────────┘
                    │
          ┌─────────┴──────────────────────────────┐
          │                                        │
  ┌───────▼────────┐                    ┌─────────▼────────┐
  │  CORE API      │                    │   CHAT SERVICE   │
  │  (REST API)    │                    │   (Node.js)      │
  └───────┬────────┘                    └─────────┬────────┘
          │                                        │
          └────────────────┬───────────────────────┘
                           │
                ┌──────────▼───────────┐
                │                      │
       ┌────────▼────────┐   ┌────────▼────────┐
       │    SUPABASE     │   │  CLOUDFLARE R2  │
       │   (Database)    │   │   (Storage)     │
       └─────────────────┘   └─────────────────┘
```

### 3.1.2 Component Interaction Flow

#### Authentication Flow
```
User (Browser)
    │
    ├─► Login Request
    │       │
    │       ▼
    │   Next.js Server
    │       │
    │       ├─► Validate Credentials (Core API)
    │       │       │
    │       │       ▼
    │       │   Supabase Auth
    │       │       │
    │       │       ├─► Generate JWT Token
    │       │       │
    │       │       └─► Return User Session
    │       │
    │       └─► Set Session Cookie
    │
    └─► Authenticated Routes
            │
            ├─► Server Components (no client JS)
            │
            └─► Client Components (interactive)
```

#### Data Fetching Flow (Server Components)
```
Page Request
    │
    ▼
Server Component
    │
    ├─► Direct Database Query (Supabase)
    │       │
    │       └─► Return Data
    │
    └─► Render HTML (Server-side)
            │
            └─► Send to Client (No JavaScript needed)
```

#### Real-time Chat Flow
```
User A (Client)              Supabase Realtime              User B (Client)
    │                                 │                            │
    ├─► Send Message ─────────────────┤                            │
    │   (HTTP POST)                   │                            │
    │                                 │                            │
    │   ┌─────────────────────────────┘                            │
    │   │ Store in Database                                        │
    │   │                                                          │
    │   └─► Broadcast via WebSocket ──────────────────────────────┤
    │                                                              │
    │◄─────────────────────────────────────────────── Receive ────┤
    │   (WebSocket subscription)                                   │
```

### 3.1.3 Data Flow Diagrams

See [diagrams/data-flow-architecture.png](./diagrams/data-flow-architecture.png) for detailed data flow diagrams.

---

## 3.2 Technology Stack

### 3.2.1 Frontend Technologies

#### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.x | React framework with App Router |
| **React** | 18.x | UI library |
| **TypeScript** | 5.x | Type-safe JavaScript |

#### Styling & UI
| Technology | Version | Purpose |
|------------|---------|---------|
| **TailwindCSS** | 3.x | Utility-first CSS framework |
| **Radix UI** | Latest | Accessible UI primitives |
| **shadcn/ui** | Latest | Component library patterns |
| **Lucide React** | Latest | Icon library |
| **next-themes** | Latest | Dark mode support |

#### Forms & Validation
| Technology | Version | Purpose |
|------------|---------|---------|
| **React Hook Form** | 7.x | Form state management |
| **Zod** | 3.x | Schema validation |

#### Rich Content
| Technology | Version | Purpose |
|------------|---------|---------|
| **Tiptap** | Latest | Rich text editor |
| **Recharts** | 2.x | Data visualization |

#### State Management
| Technology | Version | Purpose |
|------------|---------|---------|
| **Zustand** | 4.x | Global state management |

### 3.2.2 Backend Services

#### Core API Layer
- **Framework**: Node.js/Express (core-api-layer)
- **Language**: TypeScript
- **Authentication**: JWT + Supabase Auth
- **API Pattern**: RESTful

#### Chat Service
- **Framework**: Node.js/Express (southville-chat-service)
- **Real-time**: Supabase Realtime (WebSocket)
- **Protocol**: HTTP + WebSocket

### 3.2.3 Database & Storage

#### Database
| Service | Purpose | Details |
|---------|---------|---------|
| **Supabase (PostgreSQL)** | Primary database | - User data<br>- Academic records<br>- Content storage<br>- Real-time subscriptions |

#### File Storage
| Service | Purpose | Details |
|---------|---------|---------|
| **Cloudflare R2** | Object storage | - Images<br>- Documents<br>- Learning materials<br>- Quiz attachments |

### 3.2.4 Third-Party Integrations

| Service | Purpose | Integration Type |
|---------|---------|------------------|
| **Supabase** | Database + Realtime + Auth | SDK |
| **Cloudflare R2** | File storage | S3-compatible API |

---

## 3.3 Application Structure

### 3.3.1 Directory Organization

```
frontend-nextjs/
├── app/                          # Next.js 15 App Router
│   ├── guess/                    # Public routes (unauthenticated)
│   │   ├── page.tsx             # Homepage
│   │   ├── login/               # Login page
│   │   ├── news/                # Public news
│   │   ├── events/              # Public events
│   │   ├── clubs/               # Club directory
│   │   └── academics/           # Academic info
│   │
│   ├── student/                  # Student portal
│   │   ├── dashboard/           # Student dashboard
│   │   ├── assignments/         # Assignments
│   │   ├── grades/              # Grades
│   │   ├── courses/             # Courses
│   │   ├── quiz/                # Quiz system
│   │   ├── schedule/            # Schedule
│   │   ├── clubs/               # Club participation
│   │   ├── publisher/           # Content creation
│   │   └── productivity/        # Notes, todo, goals
│   │
│   ├── teacher/                  # Teacher portal
│   │   ├── dashboard/           # Teacher dashboard
│   │   ├── students/            # Student management
│   │   ├── quiz/                # Quiz builder & grading
│   │   ├── classes/             # Class management
│   │   ├── schedule/            # Schedule management
│   │   └── clubs/               # Club management
│   │
│   ├── admin/                    # Admin portal
│   │   └── dashboard/           # Admin dashboard
│   │
│   ├── superadmin/               # Super admin portal
│   │   └── dashboard/           # Super admin dashboard
│   │
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── ui/                      # UI primitives (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   └── [other primitives]
│   │
│   ├── student/                 # Student components
│   ├── teacher/                 # Teacher components
│   ├── superadmin/              # Super admin components
│   ├── layouts/                 # Layout components
│   ├── homepage/                # Homepage sections
│   ├── quiz/                    # Quiz components
│   ├── chat/                    # Chat components
│   ├── productivity/            # Productivity tools
│   └── gallery/                 # Gallery components
│
├── lib/                         # Utilities & helpers
│   ├── utils.ts                 # Utility functions (cn, etc.)
│   ├── stores/                  # Zustand stores
│   │   ├── sidebar-store.ts
│   │   └── teacher-sidebar-store.ts
│   └── supabase/                # Supabase client config
│
├── hooks/                       # Custom React hooks
│   ├── use-toast.ts
│   └── [other hooks]
│
├── types/                       # TypeScript type definitions
│   └── [type files]
│
├── constants/                   # Application constants
│   └── [constant files]
│
├── public/                      # Static assets
│   ├── images/
│   └── icons/
│
├── tailwind.config.ts          # Tailwind configuration
├── next.config.mjs             # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

### 3.3.2 Routing Architecture (App Router)

#### Route Structure

Next.js 15 App Router uses file-system based routing with special file conventions:

| File | Purpose | Example |
|------|---------|---------|
| `page.tsx` | Route page component | `/student/dashboard/page.tsx` → `/student/dashboard` |
| `layout.tsx` | Shared layout | `/student/layout.tsx` wraps all `/student/*` routes |
| `loading.tsx` | Loading UI | Shown while page loads |
| `error.tsx` | Error boundary | Handles errors in route segment |
| `not-found.tsx` | 404 page | Custom 404 for route segment |

#### Server vs Client Components

By default, all components in the App Router are **Server Components**:

```typescript
// Server Component (default)
// app/student/dashboard/page.tsx
export default async function DashboardPage() {
  // Can directly query database
  const data = await fetchFromDatabase();

  return <div>{data}</div>;
}
```

Use `"use client"` directive for interactive components:

```typescript
// Client Component
"use client";

import { useState } from "react";

export default function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 3.3.3 Component Hierarchy

```
Root Layout (app/layout.tsx)
│
├─► Guest Layout (app/guess/layout.tsx)
│   └─► Guest Pages
│       ├─► Homepage
│       ├─► News
│       └─► Events
│
├─► Student Layout (app/student/layout.tsx)
│   ├─► Student Sidebar
│   └─► Student Pages
│       ├─► Dashboard
│       ├─► Assignments
│       └─► Quizzes
│
├─► Teacher Layout (app/teacher/layout.tsx)
│   ├─► Teacher Sidebar
│   └─► Teacher Pages
│       ├─► Dashboard
│       ├─► Quiz Builder
│       └─► Students
│
└─► Admin Layout (app/admin/layout.tsx)
    └─► Admin Pages
```

### 3.3.4 State Management Strategy

#### Server State (Database)
- Fetched in Server Components
- No client-side caching needed
- Fresh data on every request

#### Client State (UI)
```typescript
// Zustand store example
// lib/stores/sidebar-store.ts
import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
}));
```

#### Form State
```typescript
// React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

---

## 3.4 Design Patterns & Principles

### 3.4.1 Architectural Patterns

#### Server-First Architecture
- Render on server by default
- Client components only when needed
- Minimize JavaScript sent to client

#### Component Composition
```typescript
// Composable UI components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Separation of Concerns
- **Presentation**: React components
- **Business Logic**: Server actions, API routes
- **Data Access**: Supabase client, API calls
- **Styling**: Tailwind utility classes

### 3.4.2 Component Patterns

#### UI Primitive Pattern (shadcn/ui)
```typescript
// components/ui/button.tsx
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "destructive" && "bg-destructive text-destructive-foreground",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-9 px-3",
        className
      )}
      {...props}
    />
  );
}
```

#### Feature Component Pattern
```typescript
// components/student/assignment-card.tsx
interface AssignmentCardProps {
  assignment: Assignment;
  onSubmit?: (id: string) => void;
}

export function AssignmentCard({ assignment, onSubmit }: AssignmentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{assignment.title}</CardTitle>
        <CardDescription>Due: {assignment.dueDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{assignment.description}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onSubmit?.(assignment.id)}>
          Submit
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### 3.4.3 Code Organization Standards

#### Import Order
```typescript
// 1. React and framework imports
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 3. Local imports (components)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Local imports (utilities)
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/lib/stores/sidebar-store';

// 5. Types
import type { Assignment } from '@/types';
```

#### File Naming Conventions
- **Components**: `kebab-case.tsx` (e.g., `assignment-card.tsx`)
- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx` (Next.js convention)
- **Types**: `types.ts` or `index.ts` in types folder
- **Utilities**: `kebab-case.ts` (e.g., `date-utils.ts`)

---

## 3.5 Security Architecture

### 3.5.1 Authentication & Authorization

#### Authentication Flow
1. User submits credentials
2. Next.js server validates against Supabase Auth
3. JWT token generated and stored in HTTP-only cookie
4. Token validated on each request

#### Session Management
- Sessions stored in HTTP-only cookies
- Automatic token refresh
- Secure session invalidation on logout

### 3.5.2 Role-Based Access Control (RBAC)

#### Role Hierarchy
```
superadmin (highest privilege)
    │
    ├─► admin
    │       │
    │       ├─► teacher
    │       │       │
    │       │       └─► student
    │       │
    │       └─► parent/guardian
    │
    └─► guest (no authentication)
```

#### Route Protection
```typescript
// Middleware or layout-level protection
export async function middleware(request: NextRequest) {
  const session = await getSession(request);

  // Protect student routes
  if (request.nextUrl.pathname.startsWith('/student')) {
    if (!session || session.role !== 'student') {
      return NextResponse.redirect('/guess/login');
    }
  }

  // Protect teacher routes
  if (request.nextUrl.pathname.startsWith('/teacher')) {
    if (!session || session.role !== 'teacher') {
      return NextResponse.redirect('/guess/login');
    }
  }

  return NextResponse.next();
}
```

### 3.5.3 Security Best Practices

#### Data Protection
- **Encryption at Rest**: Database encryption (Supabase)
- **Encryption in Transit**: HTTPS/TLS for all communications
- **Input Validation**: Zod schema validation
- **Output Encoding**: React automatic XSS protection

#### Quiz Security Features
- **Fullscreen Enforcement**: Prevents cheating by requiring fullscreen mode
- **Tab Switch Detection**: Detects when student leaves quiz tab
- **Heartbeat Monitoring**: Ensures student connection is alive
- **Session Integrity**: Prevents multiple simultaneous sessions
- **Auto-submit on Violations**: Automatic submission on security violations

#### API Security
- **JWT Validation**: All API requests require valid JWT
- **Rate Limiting**: Prevent abuse (implementation pending)
- **CORS Configuration**: Restrict cross-origin requests
- **SQL Injection Prevention**: Parameterized queries via Supabase

---

## Navigation

- [← Previous: System Overview](./02-system-overview.md)
- [↑ Back to Volume 1 Index](./README.md)
- [↑↑ Back to Manual Index](../README.md)
- [Next Volume: Installation & Configuration →](../volume-2-installation/)
