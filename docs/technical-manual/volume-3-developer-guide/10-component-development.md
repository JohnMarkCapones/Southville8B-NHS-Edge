# 10. Component Development

**Last Updated:** January 10, 2026
**Status:** ✅ Complete

---

## Table of Contents

- [10.1 Component Architecture](#101-component-architecture)
- [10.2 Component Patterns](#102-component-patterns)
- [10.3 shadcn/ui Integration](#103-shadcnui-integration)
- [10.4 Styling with TailwindCSS](#104-styling-with-tailwindcss)
- [10.5 Animation & Transitions](#105-animation--transitions)

---

## 10.1 Component Architecture

### 10.1.1 Component Organization

The project follows a **three-tier component architecture**:

```
components/
├── ui/                    # Tier 1: UI Primitives (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── ...
│
├── student/               # Tier 2: Feature Components
│   ├── AssignmentCard.tsx
│   ├── GradeChart.tsx
│   └── QuizTimer.tsx
│
├── teacher/               # Tier 2: Feature Components
│   ├── StudentList.tsx
│   ├── QuizBuilder.tsx
│   └── GradingTable.tsx
│
└── layouts/               # Tier 3: Layout Components
    ├── DashboardLayout.tsx
    ├── AuthLayout.tsx
    └── PublicLayout.tsx
```

---

### 10.1.2 UI Primitives (Tier 1)

**Purpose:** Reusable, unstyled UI building blocks.

**Characteristics:**
- Built on Radix UI primitives
- Styled with TailwindCSS
- Highly composable
- Accessible by default
- No business logic

**Example: Button component**

```tsx
// components/ui/button.tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-school-blue text-white hover:bg-school-blue/90',
        destructive: 'bg-school-red text-white hover:bg-school-red/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-school-blue underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

**Usage:**

```tsx
import { Button } from '@/components/ui/button'

// Default button
<Button>Click me</Button>

// Variant buttons
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">View</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// As link
<Button asChild>
  <Link href="/dashboard">Dashboard</Link>
</Button>
```

---

### 10.1.3 Feature Components (Tier 2)

**Purpose:** Business logic components for specific features.

**Characteristics:**
- Use UI primitives
- Contain feature-specific logic
- May fetch data
- Handle user interactions

**Example: Assignment Card**

```tsx
// components/student/AssignmentCard.tsx
'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/date-utils'
import type { Assignment } from '@/types/assignment'

interface AssignmentCardProps {
  assignment: Assignment
  onSubmit: (id: string) => void
}

export function AssignmentCard({ assignment, onSubmit }: AssignmentCardProps) {
  const isOverdue = new Date(assignment.dueDate) < new Date()
  const isSubmitted = assignment.status === 'submitted'

  return (
    <Card className={isOverdue && !isSubmitted ? 'border-school-red' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{assignment.title}</CardTitle>
            <CardDescription>{assignment.subject}</CardDescription>
          </div>
          <Badge variant={isSubmitted ? 'default' : 'secondary'}>
            {assignment.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          {assignment.description}
        </p>
        <div className="mt-4 text-sm">
          <span className="font-medium">Due: </span>
          <span className={isOverdue ? 'text-school-red' : ''}>
            {formatDate(assignment.dueDate)}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        {!isSubmitted && (
          <Button onClick={() => onSubmit(assignment.id)} className="w-full">
            Submit Assignment
          </Button>
        )}
        {isSubmitted && (
          <Button variant="outline" className="w-full" disabled>
            Submitted
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
```

---

### 10.1.4 Layout Components (Tier 3)

**Purpose:** Page-level layouts and templates.

**Characteristics:**
- Compose feature components
- Define page structure
- Handle routing/navigation
- Manage global state

**Example: Dashboard Layout**

```tsx
// components/layouts/DashboardLayout.tsx
'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layouts/Sidebar'
import { Header } from '@/components/layouts/Header'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    name: string
    role: string
    avatar?: string
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const { isOpen } = useSidebarStore()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />

      <div className={cn(
        'flex-1 flex flex-col transition-all duration-300',
        isOpen ? 'ml-64' : 'ml-20'
      )}>
        <Header user={user} />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## 10.2 Component Patterns

### 10.2.1 Composition Patterns

#### Compound Components

**Pattern:** Components that work together to form a cohesive UI.

```tsx
// Card component with subcomponents
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Implementation:**

```tsx
// components/ui/card.tsx
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
)

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
)

// Export all parts
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
```

---

#### Render Props Pattern

```tsx
interface DataFetcherProps<T> {
  url: string
  children: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [url])

  return <>{children(data, loading, error)}</>
}

// Usage
<DataFetcher<Student[]> url="/api/students">
  {(students, loading, error) => {
    if (loading) return <LoadingSpinner />
    if (error) return <ErrorMessage error={error} />
    return <StudentList students={students} />
  }}
</DataFetcher>
```

---

### 10.2.2 Props & TypeScript Interfaces

#### Component Props Interface

```tsx
// Define props with TypeScript
interface StudentCardProps {
  student: Student
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  className?: string
  variant?: 'default' | 'compact'
}

export function StudentCard({
  student,
  onEdit,
  onDelete,
  className,
  variant = 'default'
}: StudentCardProps) {
  // Component implementation
}
```

#### Extending HTML Attributes

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}
```

#### Generic Components

```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string
  emptyMessage?: string
}

export function List<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'No items'
}: ListProps<T>) {
  if (items.length === 0) {
    return <p className="text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  )
}

// Usage
<List<Student>
  items={students}
  renderItem={(student) => <StudentCard student={student} />}
  keyExtractor={(student) => student.id}
  emptyMessage="No students found"
/>
```

---

### 10.2.3 Children Patterns

#### Basic Children

```tsx
interface ContainerProps {
  children: React.ReactNode
}

export function Container({ children }: ContainerProps) {
  return <div className="container mx-auto px-4">{children}</div>
}
```

#### Typed Children

```tsx
interface TabsProps {
  children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[]
}

export function Tabs({ children }: TabsProps) {
  const tabs = React.Children.toArray(children) as React.ReactElement<TabProps>[]

  return (
    <div className="tabs">
      {tabs.map((tab, index) => (
        <div key={index}>{tab}</div>
      ))}
    </div>
  )
}
```

#### Children as Function

```tsx
interface ListBuilderProps<T> {
  items: T[]
  children: (item: T) => React.ReactNode
}

export function ListBuilder<T>({ items, children }: ListBuilderProps<T>) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>{children(item)}</div>
      ))}
    </div>
  )
}

// Usage
<ListBuilder items={students}>
  {(student) => <StudentCard student={student} />}
</ListBuilder>
```

---

## 10.3 shadcn/ui Integration

### 10.3.1 Installing Components

shadcn/ui components are added individually to your project.

#### Add a Component

```bash
# Add button component
npx shadcn-ui@latest add button

# Add multiple components
npx shadcn-ui@latest add card dialog input
```

This copies the component source code to `components/ui/`.

---

### 10.3.2 Available Components

| Component | Use Case | Import |
|-----------|----------|--------|
| **Button** | Clickable actions | `@/components/ui/button` |
| **Card** | Content containers | `@/components/ui/card` |
| **Dialog** | Modals | `@/components/ui/dialog` |
| **Input** | Text input | `@/components/ui/input` |
| **Select** | Dropdown selection | `@/components/ui/select` |
| **Checkbox** | Boolean input | `@/components/ui/checkbox` |
| **RadioGroup** | Single choice | `@/components/ui/radio-group` |
| **Table** | Data tables | `@/components/ui/table` |
| **Badge** | Status labels | `@/components/ui/badge` |
| **Alert** | Notifications | `@/components/ui/alert` |
| **Tooltip** | Hover information | `@/components/ui/tooltip` |
| **Tabs** | Tab navigation | `@/components/ui/tabs` |

---

### 10.3.3 Customizing Components

Components are **in your codebase**, so you can modify them directly.

#### Customize Colors

```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md...',
  {
    variants: {
      variant: {
        default: 'bg-school-blue text-white hover:bg-school-blue/90', // Custom color
        destructive: 'bg-school-red text-white hover:bg-school-red/90',
        success: 'bg-school-green text-white hover:bg-school-green/90', // Add new variant
      },
    },
  }
)
```

#### Add New Variants

```tsx
// Add 'loading' variant
const buttonVariants = cva(
  '...',
  {
    variants: {
      variant: { /* ... */ },
      loading: {
        true: 'cursor-not-allowed opacity-50',
        false: '',
      },
    },
  }
)

// Usage
<Button variant="default" loading={isLoading}>
  Submit
</Button>
```

---

### 10.3.4 Theme Configuration

Edit `tailwind.config.ts` to customize the theme:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // School branding
        'school-blue': '#2563EB',
        'school-gold': '#F59E0B',
        'school-green': '#10B981',
        'school-red': '#EF4444',

        // shadcn/ui semantic colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... more colors
      },
    },
  },
}
```

Update CSS variables in `app/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --primary: 221.2 83.2% 53.3%; /* school-blue */
    --primary-foreground: 210 40% 98%;

    /* Dark mode */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... */
  }
}
```

---

## 10.4 Styling with TailwindCSS

### 10.4.1 Design System & Color Palette

#### School Colors

```tsx
// Use school brand colors
<div className="bg-school-blue text-white">
  Southville 8B NHS
</div>

<Badge className="bg-school-gold">Featured</Badge>
<Button className="bg-school-green">Success</Button>
<Alert className="border-school-red">Error</Alert>
```

#### Vibrant Colors

```tsx
// Vibrant color palette (from tailwind.config.ts)
<div className="bg-vibrant-blue">Blue</div>
<div className="bg-vibrant-indigo">Indigo</div>
<div className="bg-vibrant-sky">Sky</div>
<div className="bg-vibrant-cyan">Cyan</div>
<div className="bg-vibrant-teal">Teal</div>
```

#### Accent Colors

```tsx
<Badge className="bg-accent-emerald">New</Badge>
<Badge className="bg-accent-amber">Warning</Badge>
<Badge className="bg-accent-rose">Important</Badge>
```

---

### 10.4.2 Custom Utilities (cn function)

The `cn` utility merges Tailwind classes intelligently.

```tsx
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Usage:**

```tsx
import { cn } from '@/lib/utils'

// Merge classes
<div className={cn('px-4 py-2', 'text-white', 'bg-blue-600')}>
  Hello
</div>

// Conditional classes
<div className={cn(
  'px-4 py-2',
  isActive && 'bg-blue-600',
  isDisabled && 'opacity-50 cursor-not-allowed'
)}>
  Button
</div>

// Override classes (later class wins)
<Button className={cn('bg-blue-600', 'bg-red-600')}>
  {/* bg-red-600 wins */}
  Click me
</Button>
```

---

### 10.4.3 Responsive Design Patterns

#### Breakpoints

```tsx
<div className="
  w-full           // Mobile: full width
  md:w-1/2         // Tablet: half width
  lg:w-1/3         // Desktop: one-third width
  xl:w-1/4         // Large desktop: one-quarter width
">
  Responsive box
</div>
```

#### Mobile-First Design

```tsx
// Start mobile, add larger breakpoints
<div className="
  flex flex-col      // Mobile: vertical stack
  md:flex-row        // Tablet+: horizontal layout
  gap-4              // Always 4 units gap
">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

#### Responsive Grid

```tsx
<div className="
  grid
  grid-cols-1        // Mobile: 1 column
  sm:grid-cols-2     // Small: 2 columns
  md:grid-cols-3     // Medium: 3 columns
  lg:grid-cols-4     // Large: 4 columns
  gap-4
">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

---

### 10.4.4 Dark Mode Implementation

#### Toggle Dark Mode

```tsx
'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

#### Dark Mode Styles

```tsx
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-white
  border-gray-200 dark:border-gray-700
">
  Content that adapts to theme
</div>
```

---

## 10.5 Animation & Transitions

### 10.5.1 Built-in Animations

Available animations from `tailwind.config.ts`:

```tsx
// Fade in
<div className="animate-fadeIn">
  Fades in from bottom
</div>

// Slide in
<div className="animate-slideInUp">Slides from bottom</div>
<div className="animate-slideInLeft">Slides from left</div>
<div className="animate-slideInRight">Slides from right</div>

// Float
<div className="animate-float">
  Gentle floating effect
</div>

// Gentle glow
<div className="animate-gentleGlow">
  Pulsing glow
</div>

// Notification
<div className="animate-notification">
  Slides in from right
</div>
```

---

### 10.5.2 Transition Classes

```tsx
// Smooth transitions
<button className="
  bg-blue-600
  hover:bg-blue-700
  transition-colors    // Smooth color transition
  duration-200         // 200ms duration
">
  Hover me
</button>

// Transform transitions
<div className="
  transform
  hover:scale-105      // Scale up on hover
  transition-transform
  duration-300
">
  Hover to scale
</div>

// Multiple properties
<div className="
  transition-all       // Transition all properties
  duration-300
  hover:scale-105
  hover:shadow-lg
">
  Interactive card
</div>
```

---

### 10.5.3 Custom Animations

Define custom animations in `tailwind.config.ts`:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-10px)' },
          '75%': { transform: 'translateX(10px)' },
        },
      },
      animation: {
        slideUp: 'slideUp 0.3s ease-out',
        shake: 'shake 0.5s ease-in-out',
      },
    },
  },
}
```

**Usage:**

```tsx
<div className="animate-slideUp">
  Slides up from bottom
</div>

<div className="animate-shake">
  Shakes horizontally
</div>
```

---

### 10.5.4 Performance Considerations

#### Use CSS Transforms

```tsx
// Good: Uses GPU acceleration
<div className="transform translate-x-4 scale-110">
  Smooth animation
</div>

// Avoid: Triggers layout recalculation
<div style={{ marginLeft: '16px', width: '110%' }}>
  Janky animation
</div>
```

#### Reduce Animation on Mobile

```tsx
<div className="
  motion-reduce:animate-none  // Disable if user prefers reduced motion
  animate-bounce
">
  Bouncing element
</div>
```

#### Lazy Load Heavy Animations

```tsx
import dynamic from 'next/dynamic'

// Load animation library only when needed
const LottieAnimation = dynamic(() => import('@/components/LottieAnimation'), {
  ssr: false,
  loading: () => <div>Loading animation...</div>
})
```

---

## Component Development Summary

### Quick Reference

**Component Tiers:**
1. **UI Primitives** - `components/ui/` (Button, Card, Input)
2. **Feature Components** - `components/student/`, `components/teacher/`
3. **Layout Components** - `components/layouts/`

**Best Practices:**
- ✅ Use TypeScript for all props
- ✅ Use `cn()` utility for class merging
- ✅ Prefer composition over inheritance
- ✅ Keep components small and focused
- ✅ Use shadcn/ui for base components
- ✅ Follow school color palette
- ✅ Support dark mode
- ✅ Make responsive by default

**Styling:**
- Use TailwindCSS utility classes
- Use school brand colors (`school-blue`, `school-gold`, etc.)
- Use `dark:` prefix for dark mode
- Use responsive prefixes (`md:`, `lg:`)
- Use built-in animations sparingly

---

## Navigation

- [← Previous: Next.js 15 App Router Guide](./09-nextjs-app-router.md)
- [Next: State Management →](./11-state-management.md)
- [↑ Back to Volume 3 Index](./README.md)
- [↑↑ Back to Manual Index](../README.md)
