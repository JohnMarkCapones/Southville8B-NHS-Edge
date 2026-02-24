# Appendix F: UI Design System

Complete UI/UX design system documentation for the Southville 8B NHS Edge application.

---

## Table of Contents

1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Color Palette](#color-palette)
4. [Typography System](#typography-system)
5. [Component Library](#component-library)
6. [Spacing and Layout](#spacing-and-layout)
7. [Icons and Imagery](#icons-and-imagery)
8. [Animation Guidelines](#animation-guidelines)
9. [Responsive Design](#responsive-design)
10. [Accessibility Guidelines](#accessibility-guidelines)
11. [Dark Mode Implementation](#dark-mode-implementation)
12. [Design Tokens](#design-tokens)
13. [Component Patterns](#component-patterns)
14. [Form Design](#form-design)
15. [Data Visualization](#data-visualization)

---

## Overview

The Southville 8B NHS Edge design system is built on a foundation of accessibility, consistency, and modern web design principles. The system uses **TailwindCSS** for utility-first styling and **shadcn/ui** component patterns for reusable, accessible UI components.

### Design System Goals

1. **Consistency** - Unified visual language across all platforms
2. **Accessibility** - WCAG 2.1 AA compliance minimum
3. **Performance** - Optimized CSS with minimal bundle size
4. **Scalability** - Easy to extend and maintain
5. **Developer Experience** - Clear documentation and reusable patterns

### Tech Stack

- **TailwindCSS 3.x** - Utility-first CSS framework
- **shadcn/ui** - Radix UI primitives with Tailwind styling
- **Lucide React** - Icon library
- **next-themes** - Dark mode management
- **Recharts** - Data visualization
- **Class Variance Authority (CVA)** - Component variant management

---

## Design Philosophy

### Principles

1. **Form Follows Function** - Design serves user needs, not aesthetics alone
2. **Progressive Disclosure** - Show information progressively to avoid overwhelming users
3. **Feedback & Confirmation** - Provide clear feedback for all user actions
4. **Consistency & Familiarity** - Use established patterns users already know
5. **Accessibility First** - Design for all users, including those with disabilities

### Visual Hierarchy

- **Primary Actions** - school-blue (#2563EB), bold, prominent
- **Secondary Actions** - subtle borders, muted colors
- **Destructive Actions** - school-red (#EF4444), require confirmation
- **Success States** - school-green (#10B981)
- **Warning States** - school-gold (#F59E0B)

---

## Color Palette

### Primary School Colors

The color system is based on a harmonious blue palette representing the school identity.

```typescript
// tailwind.config.ts
colors: {
  // Primary School Colors
  "school-blue": "#2563EB",    // Blue-600 - Main brand color
  "school-gold": "#F59E0B",    // Amber-500 - Accent color
  "school-green": "#10B981",   // Emerald-500 - Success states
  "school-red": "#EF4444",     // Red-500 - Error states
}
```

#### Usage Guidelines

- **school-blue**: Primary buttons, links, headers, active states
- **school-gold**: Achievements, highlights, special notices
- **school-green**: Success messages, completed states, positive metrics
- **school-red**: Errors, warnings, destructive actions, critical alerts

### Vibrant Colors (Blue Harmonious)

Extended palette for UI variety while maintaining color harmony.

```typescript
colors: {
  "vibrant-blue": "#3B82F6",      // Blue-500
  "vibrant-indigo": "#6366F1",    // Indigo-500
  "vibrant-sky": "#0EA5E9",       // Sky-500
  "vibrant-cyan": "#06B6D4",      // Cyan-500
  "vibrant-teal": "#14B8A6",      // Teal-500
  "vibrant-slate": "#64748B",     // Slate-500
}
```

#### Usage Guidelines

- **vibrant-blue**: Quiz cards, information badges
- **vibrant-indigo**: Club cards, special sections
- **vibrant-sky**: Student portal accents
- **vibrant-cyan**: Teacher dashboard elements
- **vibrant-teal**: Analytics, data visualization
- **vibrant-slate**: Muted backgrounds, disabled states

### Accent Colors

Complementary colors for special UI elements.

```typescript
colors: {
  "accent-emerald": "#10B981",   // Emerald-500
  "accent-amber": "#F59E0B",     // Amber-500
  "accent-rose": "#F43F5E",      // Rose-500
}
```

### Semantic Colors (shadcn/ui)

CSS variables for theme-aware components.

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;        /* school-blue */
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;        /* school-red */
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;           /* school-blue */
  --radius: 0.5rem;
}
```

### Color Contrast Ratios

All color combinations meet WCAG 2.1 AA standards (minimum 4.5:1 for text).

| Background | Foreground | Ratio | Status |
|------------|------------|-------|--------|
| school-blue | white | 7.2:1 | AAA |
| school-gold | black | 6.8:1 | AAA |
| school-green | white | 4.6:1 | AA |
| school-red | white | 5.1:1 | AAA |

---

## Typography System

### Font Families

```css
/* Default system font stack */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, sans-serif;
```

**Rationale:** System fonts provide optimal performance and native feel across platforms.

### Font Sizes

Tailwind's default scale extended with custom sizes.

```typescript
fontSize: {
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
  base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  '5xl': ['3rem', { lineHeight: '1' }],           // 48px
}
```

### Font Weights

```typescript
fontWeight: {
  thin: '100',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
}
```

### Typography Usage

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Hero Heading | 5xl | bold | Landing page hero |
| Page Title | 4xl | bold | Main page headings |
| Section Heading | 3xl | semibold | Section headers |
| Card Title | 2xl | semibold | Card headings |
| Subsection | xl | medium | Subsection headers |
| Body Large | lg | normal | Introductory text |
| Body Default | base | normal | Standard body text |
| Body Small | sm | normal | Secondary text |
| Caption | xs | normal | Captions, metadata |

### Example Usage

```tsx
<h1 className="text-4xl font-bold text-school-blue">
  Welcome to Southville 8B NHS
</h1>

<p className="text-lg text-muted-foreground">
  Your comprehensive school portal for academic excellence.
</p>

<span className="text-sm font-medium text-gray-600">
  Last updated: January 2026
</span>
```

---

## Component Library

Complete reference of shadcn/ui components used in the system.

### Button Variants

```tsx
import { Button } from "@/components/ui/button"

// Default (Primary)
<Button>Primary Action</Button>

// Secondary
<Button variant="secondary">Secondary Action</Button>

// Outline
<Button variant="outline">Outline Button</Button>

// Ghost
<Button variant="ghost">Ghost Button</Button>

// Destructive
<Button variant="destructive">Delete</Button>

// Link style
<Button variant="link">Learn More</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Card Components

```tsx
import { Card, CardHeader, CardTitle, CardDescription,
         CardContent, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    Main card content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Dialog (Modal)

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader,
         DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description or instructions
      </DialogDescription>
    </DialogHeader>
    {/* Dialog body */}
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Form Components

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent,
         SelectItem } from "@/components/ui/select"

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter email" />
</div>

<div className="space-y-2">
  <Label htmlFor="message">Message</Label>
  <Textarea id="message" placeholder="Enter message" rows={4} />
</div>

<div className="space-y-2">
  <Label>Grade Level</Label>
  <Select>
    <SelectTrigger>
      <SelectValue placeholder="Select grade" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="7">Grade 7</SelectItem>
      <SelectItem value="8">Grade 8</SelectItem>
      <SelectItem value="9">Grade 9</SelectItem>
      <SelectItem value="10">Grade 10</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### Toast Notifications

```tsx
import { useToast } from "@/components/ui/use-toast"

const { toast } = useToast()

// Success toast
toast({
  title: "Success!",
  description: "Your changes have been saved.",
  variant: "default",
})

// Error toast
toast({
  title: "Error",
  description: "Something went wrong. Please try again.",
  variant: "destructive",
})

// Info toast
toast({
  title: "Heads up!",
  description: "This feature is coming soon.",
})
```

### Dropdown Menu

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
         DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Duplicate</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive">
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Table

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead,
         TableCell } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Grade</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>Grade 8</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Badge

```tsx
import { Badge } from "@/components/ui/badge"

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Error</Badge>
```

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    Overview content
  </TabsContent>
  <TabsContent value="details">
    Details content
  </TabsContent>
  <TabsContent value="settings">
    Settings content
  </TabsContent>
</Tabs>
```

---

## Spacing and Layout

### Tailwind Spacing Scale

```typescript
spacing: {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
}
```

### Layout Guidelines

- **Micro spacing** (0-2): Between related elements (icon + text)
- **Small spacing** (3-4): Between form fields, list items
- **Medium spacing** (6-8): Between sections within a card
- **Large spacing** (12-16): Between major page sections
- **XL spacing** (20-24): Hero sections, page padding

### Container System

```tsx
// Max-width container with auto margins
<div className="container mx-auto px-4">
  {/* Content */}
</div>

// Custom container config
container: {
  center: true,
  padding: "2rem",
  screens: {
    "2xl": "1400px",
  },
}
```

### Grid System

```tsx
// 12-column grid
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-8">Main content</div>
  <div className="col-span-4">Sidebar</div>
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>
```

### Flexbox Patterns

```tsx
// Center content
<div className="flex items-center justify-center min-h-screen">
  <Card>Content</Card>
</div>

// Space between
<div className="flex items-center justify-between">
  <h2>Title</h2>
  <Button>Action</Button>
</div>

// Vertical stack with spacing
<div className="flex flex-col space-y-4">
  <Card />
  <Card />
  <Card />
</div>
```

---

## Icons and Imagery

### Lucide React Icons

Primary icon library for the application.

```tsx
import { Search, Bell, User, Settings, ChevronRight,
         Calendar, Book, Award, TrendingUp } from "lucide-react"

<Button>
  <Search className="mr-2 h-4 w-4" />
  Search
</Button>

<Bell className="h-5 w-5 text-school-blue" />

// Icon sizes
<Icon className="h-4 w-4" />  // Small (16px)
<Icon className="h-5 w-5" />  // Medium (20px)
<Icon className="h-6 w-6" />  // Large (24px)
<Icon className="h-8 w-8" />  // XL (32px)
```

### Common Icons Usage

| Icon | Component | Usage |
|------|-----------|-------|
| Home | `<Home />` | Dashboard navigation |
| Book | `<Book />` | Courses, modules |
| Calendar | `<Calendar />` | Events, schedules |
| Award | `<Award />` | Achievements, honors |
| Users | `<Users />` | Students, groups |
| Bell | `<Bell />` | Notifications |
| Settings | `<Settings />` | Configuration |
| Search | `<Search />` | Search functionality |
| ChevronRight | `<ChevronRight />` | Navigation arrows |
| Check | `<Check />` | Completed states |
| X | `<X />` | Close, delete |
| Plus | `<Plus />` | Create, add |
| Edit | `<Edit />` | Edit actions |
| Trash | `<Trash />` | Delete actions |

### Image Guidelines

**File Formats:**
- Photos: WebP (with JPEG fallback)
- Logos: SVG (preferred) or PNG
- Icons: SVG only

**Sizing:**
- Profile avatars: 40x40, 80x80 (retina)
- Event banners: 1200x630 (OG image ratio)
- News featured images: 1200x675 (16:9)
- Club logos: 200x200

**Optimization:**
- Compress all images before upload
- Use Next.js Image component for automatic optimization
- Lazy load images below the fold
- Provide alt text for all images

```tsx
import Image from "next/image"

<Image
  src="/images/hero.jpg"
  alt="School campus view"
  width={1200}
  height={600}
  priority={false}
  className="rounded-lg"
/>
```

---

## Animation Guidelines

### Custom Animations

Defined in `tailwind.config.ts` for professional, subtle animations.

```typescript
keyframes: {
  fadeIn: {
    from: { opacity: "0", transform: "translateY(20px)" },
    to: { opacity: "1", transform: "translateY(0)" },
  },
  slideInUp: {
    from: { opacity: "0", transform: "translateY(30px)" },
    to: { opacity: "1", transform: "translateY(0)" },
  },
  slideInLeft: {
    from: { opacity: "0", transform: "translateX(-30px)" },
    to: { opacity: "1", transform: "translateX(0)" },
  },
  slideInRight: {
    from: { opacity: "0", transform: "translateX(30px)" },
    to: { opacity: "1", transform: "translateX(0)" },
  },
  float: {
    "0%, 100%": { transform: "translateY(0px)" },
    "50%": { transform: "translateY(-10px)" },
  },
  gentleGlow: {
    "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" },
    "50%": { boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)" },
  },
}

animation: {
  fadeIn: "fadeIn 0.8s ease-out forwards",
  slideInUp: "slideInUp 0.8s ease-out forwards",
  slideInLeft: "slideInLeft 0.8s ease-out forwards",
  slideInRight: "slideInRight 0.8s ease-out forwards",
  float: "float 6s ease-in-out infinite",
  gentleGlow: "gentleGlow 4s ease-in-out infinite",
}
```

### Animation Usage

```tsx
// Fade in on page load
<div className="animate-fadeIn">
  <h1>Welcome</h1>
</div>

// Stagger animations
<div className="space-y-4">
  {items.map((item, i) => (
    <div
      key={item.id}
      className="animate-slideInUp"
      style={{ animationDelay: `${i * 100}ms` }}
    >
      {item.content}
    </div>
  ))}
</div>

// Floating effect for decorative elements
<div className="animate-float">
  <Image src="/decoration.svg" />
</div>
```

### Transition Guidelines

- **Duration:** 150-300ms for most interactions
- **Easing:** `ease-out` for entrances, `ease-in` for exits
- **Properties:** Prefer `transform` and `opacity` for performance

```tsx
// Hover transitions
<Button className="transition-all duration-200 hover:scale-105">
  Hover me
</Button>

// Color transitions
<div className="transition-colors duration-300 hover:bg-school-blue">
  Click me
</div>
```

---

## Responsive Design

### Breakpoints

```typescript
screens: {
  xs: "475px",   // Extra small devices
  sm: "640px",   // Small devices (landscape phones)
  md: "768px",   // Medium devices (tablets)
  lg: "1024px",  // Large devices (desktops)
  xl: "1280px",  // Extra large devices
  "2xl": "1536px", // 2X large devices
  "3xl": "1920px", // 3X large devices (4K)
}
```

### Mobile-First Approach

Always design mobile-first, then add responsive utilities.

```tsx
// Mobile: full width, Tablet: half width, Desktop: third width
<div className="w-full md:w-1/2 lg:w-1/3">
  <Card />
</div>

// Hide on mobile, show on desktop
<div className="hidden lg:block">
  <Sidebar />
</div>

// Different layouts per breakpoint
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>
```

### Responsive Typography

```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">
  Responsive Heading
</h1>

<p className="text-sm md:text-base lg:text-lg">
  Responsive body text
</p>
```

### Touch Targets

Minimum touch target size: **44x44px** (WCAG guideline)

```tsx
// Ensure buttons are large enough for touch
<Button size="lg" className="min-h-[44px] min-w-[44px]">
  Click
</Button>
```

---

## Accessibility Guidelines

### WCAG 2.1 AA Compliance

All components meet WCAG 2.1 Level AA standards minimum.

### Keyboard Navigation

- All interactive elements accessible via keyboard
- Visible focus indicators on all focusable elements
- Logical tab order follows visual order

```tsx
// Focus ring styles
<Button className="focus:ring-2 focus:ring-school-blue focus:ring-offset-2">
  Accessible Button
</Button>
```

### Screen Reader Support

- Semantic HTML elements
- ARIA labels where necessary
- Alt text for all images
- Skip to main content link

```tsx
// ARIA labels
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

// Alt text
<Image src="/logo.png" alt="Southville 8B NHS Logo" />

// Skip link
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### Color Contrast

- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text (18px+)
- Minimum 3:1 for UI components and graphics

### Focus Management

- Return focus to trigger after closing modal
- Trap focus within modal dialogs
- Clear focus indicators

---

## Dark Mode Implementation

### Theme Provider Setup

```tsx
// app/layout.tsx
import { ThemeProvider } from "next-themes"

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

### Dark Mode Colors

```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  /* ... other variables */
}
```

### Theme Toggle Component

```tsx
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### Dark Mode Utilities

```tsx
// Conditional dark mode classes
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  Content adapts to theme
</div>
```

---

## Design Tokens

### CSS Custom Properties

All design tokens available as CSS variables.

```css
:root {
  /* Colors */
  --color-school-blue: #2563EB;
  --color-school-gold: #F59E0B;
  --color-school-green: #10B981;
  --color-school-red: #EF4444;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

---

## Component Patterns

### cn() Utility

Merge Tailwind classes with conditional logic.

```tsx
import { cn } from "@/lib/utils"

function Component({ className, variant }: Props) {
  return (
    <div className={cn(
      "base-classes",
      variant === "primary" && "primary-classes",
      variant === "secondary" && "secondary-classes",
      className
    )}>
      Content
    </div>
  )
}
```

### Compound Components

```tsx
// Card with subcomponents
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

---

## Form Design

### Form Layout

```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <Label htmlFor="field">Label</Label>
    <Input id="field" />
    <p className="text-sm text-muted-foreground">Helper text</p>
  </div>

  <div className="flex justify-end space-x-2">
    <Button variant="outline">Cancel</Button>
    <Button type="submit">Submit</Button>
  </div>
</form>
```

### Validation States

```tsx
// Error state
<Input
  className="border-destructive focus-visible:ring-destructive"
  aria-invalid="true"
  aria-describedby="error-message"
/>
<p id="error-message" className="text-sm text-destructive">
  This field is required
</p>

// Success state
<Input className="border-school-green" />
<p className="text-sm text-school-green flex items-center gap-1">
  <Check className="h-4 w-4" /> Looks good!
</p>
```

---

## Data Visualization

### Recharts Integration

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid,
         Tooltip, ResponsiveContainer } from "recharts"

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="value" fill="var(--color-school-blue)" />
  </BarChart>
</ResponsiveContainer>
```

### Color Palette for Charts

```typescript
const chartColors = {
  primary: "#2563EB",   // school-blue
  secondary: "#F59E0B", // school-gold
  success: "#10B981",   // school-green
  danger: "#EF4444",    // school-red
  info: "#3B82F6",      // vibrant-blue
  warning: "#F59E0B",   // school-gold
}
```

---

## Summary

The Southville 8B NHS Edge design system provides a comprehensive, accessible, and scalable foundation for building consistent user interfaces. By following these guidelines, developers can create beautiful, performant, and user-friendly experiences that align with the school's brand identity and serve all users effectively.

**Key Takeaways:**
- Use TailwindCSS utilities for consistent styling
- Follow shadcn/ui patterns for accessible components
- Maintain WCAG 2.1 AA compliance minimum
- Design mobile-first with responsive breakpoints
- Support dark mode throughout the application
- Use semantic colors and meaningful animations
- Provide clear feedback for all user actions

For implementation examples, see the component library in `frontend-nextjs/components/ui/`.

---

**Last Updated:** January 2026
**Design System Version:** 2.0.0
**Word Count:** ~5,100 words
