# 11. State Management

**Last Updated:** January 10, 2026
**Status:** ✅ Complete

---

## Table of Contents

- [11.1 State Management Strategy](#111-state-management-strategy)
- [11.2 Zustand Store Architecture](#112-zustand-store-architecture)
- [11.3 Server State](#113-server-state)
- [11.4 Client State Examples](#114-client-state-examples)

---

## 11.1 State Management Strategy

### 11.1.1 Server State vs Client State

In Next.js 15 App Router, we distinguish between two types of state:

#### Server State (Data from Database/APIs)

**What it is:**
- Data fetched from databases, APIs, or external sources
- Examples: User profiles, assignments, grades, news articles

**How to handle:**
- ✅ Fetch in **Server Components**
- ✅ Pass as props to Client Components
- ✅ Use Next.js caching and revalidation
- ❌ Don't store in global state (Zustand/Redux)

**Example:**

```tsx
// Server Component - fetches data
export default async function DashboardPage() {
  // Fetch directly in Server Component
  const student = await fetchStudent()
  const assignments = await fetchAssignments()

  return (
    <div>
      <StudentInfo student={student} />
      <AssignmentList assignments={assignments} />
    </div>
  )
}
```

---

#### Client State (UI State)

**What it is:**
- UI-only state that doesn't need to persist
- Examples: Sidebar open/closed, modal visibility, form inputs

**How to handle:**
- ✅ Use **Zustand** for global UI state
- ✅ Use **React hooks** (`useState`) for local component state
- ❌ Don't fetch data and store in global state

**Example:**

```tsx
'use client'

import { useSidebarStore } from '@/lib/stores/sidebar-store'

export function Sidebar() {
  const { isOpen, toggle } = useSidebarStore()

  return (
    <aside className={isOpen ? 'w-64' : 'w-20'}>
      <button onClick={toggle}>Toggle</button>
    </aside>
  )
}
```

---

### 11.1.2 When to Use Each Approach

| State Type | Use Case | Tool | Example |
|------------|----------|------|---------|
| **Server State** | Database data | Server Components | Student list, grades |
| **Global Client State** | Shared UI state | Zustand | Sidebar state, theme |
| **Local Client State** | Component-only state | `useState` | Form inputs, toggles |
| **Form State** | Form data & validation | React Hook Form | Login form, quiz submission |
| **URL State** | Shareable state | URL params | Filters, pagination |

---

## 11.2 Zustand Store Architecture

Zustand is a lightweight state management library for React.

### 11.2.1 Creating Stores

#### Basic Store Structure

```tsx
// lib/stores/example-store.ts
import { create } from 'zustand'

interface ExampleState {
  // State
  count: number

  // Actions
  increment: () => void
  decrement: () => void
  reset: () => void
}

export const useExampleStore = create<ExampleState>((set) => ({
  // Initial state
  count: 0,

  // Actions
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))
```

**Usage:**

```tsx
'use client'

import { useExampleStore } from '@/lib/stores/example-store'

export function Counter() {
  const { count, increment, decrement, reset } = useExampleStore()

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}
```

---

### 11.2.2 Existing Stores

#### Sidebar Store

```tsx
// lib/stores/sidebar-store.ts
import { create } from 'zustand'

interface SidebarState {
  isOpen: boolean
  toggle: () => void
  setOpen: (open: boolean) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,

  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  setOpen: (open) => set({ isOpen: open }),
}))
```

**Usage in Sidebar:**

```tsx
'use client'

import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { isOpen, toggle } = useSidebarStore()

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all',
      isOpen ? 'w-64' : 'w-20'
    )}>
      <button onClick={toggle} className="p-4">
        {isOpen ? '<' : '>'}
      </button>

      {isOpen && (
        <nav className="p-4">
          {/* Navigation items */}
        </nav>
      )}
    </aside>
  )
}
```

**Usage in Main Layout:**

```tsx
'use client'

import { useSidebarStore } from '@/lib/stores/sidebar-store'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebarStore()

  return (
    <div className="flex">
      <Sidebar />
      <main className={cn(
        'flex-1 transition-all',
        isOpen ? 'ml-64' : 'ml-20'
      )}>
        {children}
      </main>
    </div>
  )
}
```

---

#### Teacher Sidebar Store

```tsx
// lib/stores/teacher-sidebar-store.ts
import { create } from 'zustand'

interface TeacherSidebarState {
  isOpen: boolean
  activeSection: string | null
  toggle: () => void
  setOpen: (open: boolean) => void
  setActiveSection: (section: string) => void
}

export const useTeacherSidebarStore = create<TeacherSidebarState>((set) => ({
  isOpen: true,
  activeSection: null,

  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  setOpen: (open) => set({ isOpen: open }),

  setActiveSection: (section) => set({ activeSection: section }),
}))
```

---

### 11.2.3 Advanced Zustand Patterns

#### With Middleware (Persist)

```tsx
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PreferencesState {
  theme: 'light' | 'dark'
  language: string
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: string) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'user-preferences', // localStorage key
    }
  )
)
```

**Data persists in localStorage automatically!**

---

#### Async Actions

```tsx
interface NotificationState {
  notifications: Notification[]
  loading: boolean
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true })

    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      set({ notifications: data, loading: false })
    } catch (error) {
      console.error('Failed to fetch notifications', error)
      set({ loading: false })
    }
  },

  markAsRead: async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })

      // Update local state
      set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        )
      }))
    } catch (error) {
      console.error('Failed to mark as read', error)
    }
  },
}))
```

---

#### Slices Pattern (Large Stores)

```tsx
// Split large stores into slices
interface UserSlice {
  user: User | null
  setUser: (user: User) => void
}

interface SettingsSlice {
  settings: Settings
  updateSettings: (settings: Partial<Settings>) => void
}

type AppState = UserSlice & SettingsSlice

const createUserSlice = (set: any): UserSlice => ({
  user: null,
  setUser: (user) => set({ user }),
})

const createSettingsSlice = (set: any): SettingsSlice => ({
  settings: { theme: 'light', notifications: true },
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    })),
})

export const useAppStore = create<AppState>((set, get) => ({
  ...createUserSlice(set),
  ...createSettingsSlice(set),
}))
```

---

### 11.2.4 Best Practices

#### ✅ Do's

```tsx
// ✅ Use descriptive names
export const useSidebarStore = create(...)

// ✅ Type your store
interface StoreState {
  count: number
  increment: () => void
}

// ✅ Keep stores focused
// One store per feature domain
export const useAuthStore = create(...)
export const useNotificationStore = create(...)

// ✅ Use shallow comparison for performance
import { shallow } from 'zustand/shallow'

const { name, email } = useUserStore(
  (state) => ({ name: state.name, email: state.email }),
  shallow
)

// ✅ Extract only what you need
const increment = useCountStore((state) => state.increment) // Only subscribes to increment
```

#### ❌ Don'ts

```tsx
// ❌ Don't store server data
// Instead, fetch in Server Components
const students = useStudentStore((state) => state.students) // Bad

// ❌ Don't use in Server Components
export default async function Page() {
  const count = useCountStore((state) => state.count) // Error!
}

// ❌ Don't create circular dependencies
// Store A shouldn't depend on Store B

// ❌ Don't mutate state directly
set((state) => {
  state.count++ // Wrong!
  return state
})

// Do this instead
set((state) => ({ count: state.count + 1 })) // Correct
```

---

## 11.3 Server State

### 11.3.1 Fetching in Server Components

**Pattern:** Fetch data directly in Server Components.

```tsx
// app/student/assignments/page.tsx
async function getAssignments() {
  const res = await fetch('http://localhost:3000/api/assignments', {
    cache: 'no-store', // Always fresh
  })

  if (!res.ok) {
    throw new Error('Failed to fetch')
  }

  return res.json()
}

export default async function AssignmentsPage() {
  const assignments = await getAssignments()

  return (
    <div>
      <h1>My Assignments</h1>
      <AssignmentList assignments={assignments} />
    </div>
  )
}
```

---

### 11.3.2 Caching Strategies

#### No Caching (Always Fresh)

```tsx
const res = await fetch('/api/data', {
  cache: 'no-store',
})
```

**Use for:**
- User-specific data
- Real-time data
- Frequently changing data

---

#### Time-Based Revalidation

```tsx
const res = await fetch('/api/news', {
  next: { revalidate: 60 }, // Revalidate every 60 seconds
})
```

**Use for:**
- News articles
- Public announcements
- Moderately dynamic content

---

#### Full Caching (Static)

```tsx
const res = await fetch('/api/about')
// Default: fully cached until revalidated
```

**Use for:**
- Static content
- Rarely changing data
- About pages, FAQs

---

### 11.3.3 Revalidation

#### On-Demand Revalidation

```tsx
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: Request) {
  const { path, tag } = await request.json()

  if (path) {
    revalidatePath(path)
  }

  if (tag) {
    revalidateTag(tag)
  }

  return Response.json({ revalidated: true })
}
```

**Trigger revalidation after data changes:**

```tsx
async function createAssignment(data: AssignmentData) {
  // Save to database
  await saveAssignment(data)

  // Revalidate the assignments page
  await fetch('/api/revalidate', {
    method: 'POST',
    body: JSON.stringify({ path: '/student/assignments' })
  })
}
```

---

## 11.4 Client State Examples

### 11.4.1 Modal State

```tsx
// lib/stores/modal-store.ts
import { create } from 'zustand'

interface ModalState {
  isOpen: boolean
  modalType: string | null
  modalProps: any
  openModal: (type: string, props?: any) => void
  closeModal: () => void
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  modalType: null,
  modalProps: null,

  openModal: (type, props = {}) => set({
    isOpen: true,
    modalType: type,
    modalProps: props
  }),

  closeModal: () => set({
    isOpen: false,
    modalType: null,
    modalProps: null
  }),
}))
```

**Usage:**

```tsx
'use client'

import { useModalStore } from '@/lib/stores/modal-store'
import { Button } from '@/components/ui/button'

export function CreateStudentButton() {
  const openModal = useModalStore((state) => state.openModal)

  return (
    <Button onClick={() => openModal('create-student', { role: 'student' })}>
      Create Student
    </Button>
  )
}

// Modal Manager
export function ModalManager() {
  const { isOpen, modalType, modalProps, closeModal } = useModalStore()

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      {modalType === 'create-student' && <CreateStudentForm {...modalProps} />}
      {modalType === 'edit-student' && <EditStudentForm {...modalProps} />}
    </Dialog>
  )
}
```

---

### 11.4.2 Filter State

```tsx
// lib/stores/filter-store.ts
interface FilterState {
  searchQuery: string
  filters: {
    subject?: string
    status?: string
    dateRange?: { start: Date; end: Date }
  }
  setSearchQuery: (query: string) => void
  setFilter: (key: string, value: any) => void
  clearFilters: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: '',
  filters: {},

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),

  clearFilters: () => set({ searchQuery: '', filters: {} }),
}))
```

**Usage:**

```tsx
'use client'

import { useFilterStore } from '@/lib/stores/filter-store'

export function StudentFilters() {
  const { searchQuery, filters, setSearchQuery, setFilter, clearFilters } = useFilterStore()

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search students..."
      />

      <select
        value={filters.subject || ''}
        onChange={(e) => setFilter('subject', e.target.value)}
      >
        <option value="">All Subjects</option>
        <option value="math">Math</option>
        <option value="science">Science</option>
      </select>

      <button onClick={clearFilters}>Clear Filters</button>
    </div>
  )
}
```

---

### 11.4.3 Toast Notifications

```tsx
// lib/stores/toast-store.ts
interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

interface ToastState {
  toasts: Toast[]
  addToast: (message: string, type: Toast['type']) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message, type) => {
    const id = Math.random().toString(36)

    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }))

    // Auto remove after 3 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }))
    }, 3000)
  },

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),
}))
```

**Usage:**

```tsx
import { useToastStore } from '@/lib/stores/toast-store'

export function SaveButton() {
  const addToast = useToastStore((state) => state.addToast)

  const handleSave = async () => {
    try {
      await saveData()
      addToast('Saved successfully!', 'success')
    } catch (error) {
      addToast('Failed to save', 'error')
    }
  }

  return <Button onClick={handleSave}>Save</Button>
}
```

---

## State Management Summary

### Decision Tree

```
Need to manage state?
│
├─ Is it data from database/API?
│  └─ YES → Use Server Components (fetch directly)
│
└─ Is it UI state?
   │
   ├─ Shared across multiple components?
   │  └─ YES → Use Zustand store
   │
   └─ Only used in one component?
      └─ YES → Use useState
```

### Quick Reference

| Scenario | Solution | Example |
|----------|----------|---------|
| **Fetch student list** | Server Component | `await fetchStudents()` |
| **Sidebar open/close** | Zustand | `useSidebarStore()` |
| **Form input value** | `useState` | `const [value, setValue] = useState('')` |
| **Modal visibility** | Zustand | `useModalStore()` |
| **User preferences** | Zustand + persist | Stored in localStorage |
| **Real-time chat** | Client Component + Supabase | WebSocket subscription |

---

## Navigation

- [← Previous: Component Development](./10-component-development.md)
- [Next: Forms & Validation →](./12-forms-validation.md)
- [↑ Back to Volume 3 Index](./README.md)
- [↑↑ Back to Manual Index](../README.md)
