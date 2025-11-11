# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Southville 8B NHS Edge** is a comprehensive digital school portal for Southville 8B National High School. This is a **Next.js 15** web application providing a centralized hub for students, teachers, administrators, and parents.

## Working Directory

**All development work happens in: `frontend-nextjs/`**

## Development Commands

```bash
# Navigate to frontend directory first
cd frontend-nextjs

# Development
npm run dev              # Start development server at http://localhost:3000

# Build & Production
npm run build            # Production build
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint

# Bundle Analysis
npm run analyze         # Analyze production bundle (Windows)
npm run analyze:dev     # Analyze dev bundle (Windows)
```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom design system
- **UI Library**: Radix UI primitives + shadcn/ui patterns
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Rich Text Editor**: Tiptap
- **Charts**: Recharts
- **Icons**: Lucide React
- **Theming**: next-themes (dark mode support)

## Application Structure

### Route Organization (`app/` directory)

The app uses Next.js App Router with role-based route segments:

- **`/guess/*`** - Public/guest routes (unauthenticated users)
  - Homepage, login, news, events, clubs, academics, announcements

- **`/student/*`** - Student portal (authenticated students)
  - Dashboard, assignments, grades, schedule, courses
  - Clubs, events, news, calendar, activities
  - Quiz system, notes, todo, goals, pomodoro timer
  - Publisher (student journalism/content creation)
  - Ranking/leaderboard

- **`/teacher/*`** - Teacher portal (authenticated teachers)
  - Dashboard, students management, analytics, reports
  - Quiz builder and grading, schedule
  - Clubs management, resources, classes

- **`/admin/*`** - Administrator portal

- **`/superadmin/*`** - Super administrator portal

### Component Architecture (`components/` directory)

```
components/
├── ui/                    # Reusable UI primitives (shadcn/ui style)
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── card.tsx
│   └── [other primitives]
│
├── student/               # Student-specific features
├── teacher/               # Teacher-specific features
├── superadmin/            # Super admin features
│   ├── dashboard/         # Dashboard components
│   └── data/              # Mock/example data
│
├── layouts/               # Layout components
├── homepage/              # Homepage sections
├── academics/             # Academic content
├── quiz/                  # Quiz system components
├── productivity/          # Productivity tools
├── chat/                  # Chat/messaging
├── gallery/               # Image galleries
└── [other feature folders]
```

### Key Directories

- **`app/`** - Next.js App Router pages and layouts
- **`components/`** - React components organized by feature
- **`lib/`** - Utilities, helpers, constants
  - `lib/utils.ts` - Utility functions (includes `cn` for className merging)
  - `lib/stores/` - Zustand state stores
- **`hooks/`** - Custom React hooks
- **`types/`** - TypeScript type definitions
- **`constants/`** - Application constants
- **`public/`** - Static assets

## Styling System

### Color Palette

Custom blue-based school theme defined in `tailwind.config.ts`:

**Primary Colors**:
- `school-blue`: #2563EB (Blue-600) - Main brand color
- `school-gold`: #F59E0B (Amber-500) - Accent
- `school-green`: #10B981 (Emerald-500) - Success
- `school-red`: #EF4444 (Red-500) - Error

**Vibrant Colors** (blue harmonious):
- `vibrant-blue`, `vibrant-indigo`, `vibrant-sky`, `vibrant-cyan`, `vibrant-teal`, `vibrant-slate`

**Accents**:
- `accent-emerald`, `accent-amber`, `accent-rose`

### Custom Animations

Professional, subtle animations available:
- `fadeIn` - Fade in with slight upward movement
- `slideInUp`, `slideInLeft`, `slideInRight` - Directional slides
- `float` - Gentle floating effect
- `gentleGlow` - Pulsing glow effect
- `notification`, `notificationExit` - Notification animations
- `searchExpand`, `searchCollapse` - Search bar animations

### Breakpoints

```
xs:  475px
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
3xl: 1920px
```

## State Management

**Zustand stores** located in `lib/stores/`:
- `sidebar-store.ts` - Sidebar state management
- `teacher-sidebar-store.ts` - Teacher-specific sidebar state

Use Zustand for global client state. Prefer Server Components for data fetching where possible.

## UI Component Patterns

Components follow **shadcn/ui** conventions:
- Built on Radix UI primitives
- Styled with Tailwind utility classes
- Composable and accessible by default
- Use `cn()` utility for conditional classes

Example:
```tsx
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

<Button className={cn("custom-class", conditionalClass && "active")}>
  Click me
</Button>
```

## Form Handling

Use React Hook Form + Zod:
```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1, "Name is required")
})

const form = useForm({
  resolver: zodResolver(schema)
})
```

## Loading & Error States

- Use `loading.tsx` files for route-level loading states
- Use `not-found.tsx` files for 404 pages
- Both patterns are available at various route levels

## Environment Variables

The frontend requires the following environment variables for chat realtime functionality:

### Required for Chat Realtime

- **`NEXT_PUBLIC_SUPABASE_URL`** - Your Supabase project URL (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** - Supabase anonymous/public key (safe for client-side)

These values should match the same credentials used in `southville-chat-service/.env`:
- `SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Optional

- **`NEXT_PUBLIC_CHAT_SERVICE_URL`** - Chat service base URL (defaults to `http://localhost:3001`)

### Setup

1. Create a `.env.local` file in `frontend-nextjs/` directory
2. Copy the Supabase credentials from your main API or chat service `.env` file
3. Prefix them with `NEXT_PUBLIC_` for client-side access

Example `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_CHAT_SERVICE_URL=http://localhost:3001
```

**Note**: The `NEXT_PUBLIC_` prefix is required for Next.js to expose these variables to the client-side code.

## Important Notes

- This project uses **Next.js 15 App Router** (not Pages Router)
- Server Components are the default - use `"use client"` only when needed
- Package.json scripts use **Windows-specific commands** (`set` instead of `export`)
- TypeScript is strictly enforced
- All new components should follow the established shadcn/ui patterns
- Dark mode is supported via `next-themes` provider
- Chat uses **Supabase Realtime** for instant message updates (no polling)

## Commit Convention

Follow Conventional Commits format:

```
<type>(frontend): <description>

[optional body]
```

**Common types**: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `perf`

**Examples**:
- `feat(frontend): add quiz submission tracking for students`
- `fix(frontend): resolve dark mode toggle in settings`
- `refactor(frontend): simplify student dashboard layout`
