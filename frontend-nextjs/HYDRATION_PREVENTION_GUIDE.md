# Next.js Hydration Error Prevention Guide

## Table of Contents
1. [What Are Hydration Errors?](#what-are-hydration-errors)
2. [Common Causes](#common-causes)
3. [Fixes Applied in This Project](#fixes-applied-in-this-project)
4. [Best Practices](#best-practices)
5. [Testing for Hydration Errors](#testing-for-hydration-errors)
6. [Prevention Tools](#prevention-tools)

---

## What Are Hydration Errors?

**Hydration** is the process where React attaches event handlers and makes server-rendered HTML interactive on the client side. A hydration error occurs when:

> The HTML rendered on the **server** doesn't match the HTML rendered on the **client** during the initial render.

### Common Error Messages

```
⚠ A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.

⚠ Hydration failed because the server rendered HTML didn't match the client.

⚠ There was an error while hydrating. Because the error happened outside of a Suspense boundary, the entire root will switch to client rendering.
```

### Why It Matters

Hydration errors cause:
- **Performance degradation** - React has to re-render the entire component tree on the client
- **Visual flashing** - Users see content flash/flicker as React re-renders
- **Inconsistent state** - Application state may be unreliable
- **SEO issues** - Search engines may see different content than users

---

## Common Causes

### 1. Conditional Rendering Based on Client State

#### ❌ Anti-Pattern: Returning `null` during SSR

```tsx
"use client"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ❌ BAD: Returns null on server, returns button on client
  if (!mounted) return null

  return <button>Toggle Theme</button>
}
```

**Problem**: Server renders `null`, client renders `<button>` → Mismatch!

#### ✅ Correct Pattern: Consistent DOM Structure

```tsx
"use client"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ GOOD: Always renders the same DOM structure
  const isDarkMode = mounted ? theme === "dark" : false

  return (
    <button suppressHydrationWarning>
      {mounted && theme === "dark" ? <Moon /> : <Sun />}
    </button>
  )
}
```

**Solution**:
- Always render the same DOM structure
- Use `suppressHydrationWarning` for attributes that differ
- Calculate safe fallback values for server rendering

---

### 2. Using `Date()` or Time-Dependent Values

#### ❌ Anti-Pattern: `new Date()` in Component Body

```tsx
export function Footer() {
  // ❌ BAD: Different value on server vs client
  const currentYear = new Date().getFullYear()

  return <footer>© {currentYear} School Name</footer>
}
```

**Problem**: Server renders time `T1`, client renders time `T2` → Mismatch!

#### ✅ Correct Pattern: SSR-Safe Date Handling

```tsx
export function Footer() {
  // ✅ GOOD: Only call Date() on client-side
  const currentYear = typeof window !== 'undefined'
    ? new Date().getFullYear()
    : 2025

  return <footer suppressHydrationWarning>© {currentYear} School Name</footer>
}
```

**Alternative**: Use `useEffect` to set date after mount

```tsx
export function Footer() {
  const [year, setYear] = useState(2025)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return <footer suppressHydrationWarning>© {year} School Name</footer>
}
```

---

### 3. CSS-Based Visibility vs. Conditional Rendering

#### ❌ Anti-Pattern: Conditional Element Rendering

```tsx
export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  // ❌ BAD: Different DOM structure
  if (!isVisible) return null

  return <button>Back to Top</button>
}
```

**Problem**: Server renders `null`, client might render button → Mismatch!

#### ✅ Correct Pattern: CSS-Based Visibility

```tsx
export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  // ✅ GOOD: Same DOM, different CSS
  return (
    <button
      className={`
        fixed bottom-8 right-8
        ${isVisible
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"}
      `}
    >
      Back to Top
    </button>
  )
}
```

**Solution**: Always render the element, control visibility with CSS

---

### 4. Browser-Only APIs (window, document, localStorage)

#### ❌ Anti-Pattern: Direct Access During Render

```tsx
export function UserGreeting() {
  // ❌ BAD: window is undefined on server
  const username = window.localStorage.getItem('username')

  return <div>Hello, {username}!</div>
}
```

#### ✅ Correct Pattern: Guard with `useEffect`

```tsx
export function UserGreeting() {
  const [username, setUsername] = useState('Guest')

  useEffect(() => {
    // ✅ GOOD: Only runs on client
    const name = window.localStorage.getItem('username')
    if (name) setUsername(name)
  }, [])

  return <div>Hello, {username}!</div>
}
```

---

### 5. Random Values or Dynamic IDs

#### ❌ Anti-Pattern: `Math.random()` in Component Body

```tsx
export function Card() {
  // ❌ BAD: Different value each render
  const id = Math.random()

  return <div id={id}>Card</div>
}
```

#### ✅ Correct Pattern: Stable IDs with `useId` or `useEffect`

```tsx
import { useId } from 'react'

export function Card() {
  // ✅ GOOD: Consistent between server and client
  const id = useId()

  return <div id={id}>Card</div>
}
```

---

## Fixes Applied in This Project

### 1. Header Component (`components/layout/header.tsx`)

**Issue**: Component returned `null` when not mounted, causing hydration mismatch.

**Fix Applied** (lines 119-138):
```tsx
export function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ Don't return null - this causes hydration mismatch
  // Instead, render the same structure but handle theme safely
  const isDarkMode = mounted ? theme === "dark" : false

  // ... rest of component
}
```

**Theme Toggle Fix** (lines 408-424):
```tsx
<AnimatedButton
  onClick={() => setTheme(mounted && theme === "light" ? "dark" : "light")}
  aria-label={`Switch to ${mounted && theme === "light" ? "dark" : "light"} mode`}
  suppressHydrationWarning
>
  {mounted && theme === "dark" ? (
    <Moon className="h-3 w-3 text-blue-400" />
  ) : (
    <Sun className="h-3 w-3 text-yellow-500" />
  )}
</AnimatedButton>
```

---

### 2. Footer Component (`components/layout/footer.tsx`)

**Issue**: `new Date().getFullYear()` called during render produces different values on server vs client.

**Fix Applied** (lines 31-33):
```tsx
export function Footer() {
  // ✅ Use hardcoded year or calculate client-side to avoid hydration mismatch
  const currentYear = typeof window !== 'undefined'
    ? new Date().getFullYear()
    : 2025

  return (
    <footer suppressHydrationWarning>
      © {currentYear} Southville 8B National High School
    </footer>
  )
}
```

---

### 3. BackToTop Component (`components/ui/back-to-top.tsx`)

**Issue**: Component returned `null` when not visible, causing DOM structure mismatch.

**Fix Applied** (lines 32-45):
```tsx
export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  // ✅ Don't return null - causes hydration mismatch
  // Instead, render but hide with opacity
  return (
    <Button
      className={`
        fixed bottom-8 right-8 z-50 h-12 w-12
        ${isVisible
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"}
      `}
      aria-label="Back to top"
    >
      <ChevronUp className="h-6 w-6" />
    </Button>
  )
}
```

---

### 4. HomePage Component (`components/home/home-page.tsx`)

**Issue**: Background decorative circles used `Math.random()` directly in the render, causing different positions on server vs client.

**Error Message**:
```
⚠ A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.

The className and style attributes (left, top, width, height) were different.
```

**Fix Applied** (lines 79-97 and 354-368):

```tsx
export default function HomePage() {
  // ✅ Generate background circles only on client to avoid hydration mismatch
  const [backgroundCircles, setBackgroundCircles] = useState<Array<{
    left: string
    top: string
    width: string
    height: string
  }>>([])

  useEffect(() => {
    // Generate random positions only on client side
    setBackgroundCircles(
      Array.from({ length: 6 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${Math.random() * 200 + 100}px`,
        height: `${Math.random() * 200 + 100}px`,
      }))
    )
  }, [])

  return (
    <section>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {backgroundCircles.map((circle, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              left: circle.left,
              top: circle.top,
              width: circle.width,
              height: circle.height,
            }}
          />
        ))}
      </div>
    </section>
  )
}
```

**Key Pattern**:
- ❌ **Bad**: `Math.random()` called during render
- ✅ **Good**: Random values generated in `useEffect`, stored in state
- Server renders empty array (no circles)
- Client generates circles after mount (no mismatch)

---

## Best Practices

### 1. Use `suppressHydrationWarning` Sparingly

```tsx
// Only use on specific elements where mismatch is expected and safe
<div suppressHydrationWarning>
  {mounted ? clientValue : serverValue}
</div>
```

**When to use**:
- Theme-dependent content
- Time-sensitive content
- User-specific content that differs between server/client

**Don't overuse**: It suppresses warnings but doesn't fix the underlying issue.

---

### 2. Prefer Server Components When Possible

```tsx
// ✅ Server Component (default in Next.js 15 App Router)
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}
```

Server Components don't hydrate, so they can't have hydration errors!

Only use `"use client"` when you need:
- `useState`, `useEffect`, or other React hooks
- Browser APIs (window, document)
- Event handlers (onClick, onChange)
- Context providers/consumers

---

### 3. Initialize State Safely

```tsx
// ❌ BAD
const [value, setValue] = useState(localStorage.getItem('key'))

// ✅ GOOD
const [value, setValue] = useState(null)

useEffect(() => {
  setValue(localStorage.getItem('key'))
}, [])
```

---

### 4. Use `useId` for Stable IDs

```tsx
import { useId } from 'react'

export function FormField() {
  const id = useId() // ✅ Same ID on server and client

  return (
    <div>
      <label htmlFor={id}>Name</label>
      <input id={id} />
    </div>
  )
}
```

---

### 5. Handle Theme Switching Properly

```tsx
"use client"

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemedComponent() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ Safe theme handling
  const currentTheme = mounted ? theme : 'light'

  return (
    <div suppressHydrationWarning className={currentTheme}>
      Content
    </div>
  )
}
```

---

## Testing for Hydration Errors

### Automated Testing with Playwright

This project includes comprehensive hydration error detection tests in:
**`e2e/hydration-errors.spec.ts`**

#### Running the Tests

```bash
# Install Playwright (first time only)
npx playwright install

# Run hydration tests
npx playwright test hydration-errors.spec.ts

# Run with UI
npx playwright test hydration-errors.spec.ts --ui

# Run in headed mode (see browser)
npx playwright test hydration-errors.spec.ts --headed
```

#### What the Tests Check

1. **Console Error Detection** - Listens for hydration-related errors on all pages
2. **HTML Consistency** - Compares server-rendered HTML with client-hydrated HTML
3. **Layout Shift Score** - Measures visual stability during hydration (CLS metric)
4. **Anti-Pattern Detection** - Tests common hydration issues (Date usage, theme switching)
5. **Performance** - Ensures hydration completes within 3 seconds

#### Pages Tested

- Homepage (`/`)
- About Page (`/guess/about`)
- Academics Page (`/guess/academics`)
- Student Life Page (`/guess/student-life`)
- Athletics Page (`/guess/athletics`)
- News Page (`/guess/news`)
- News & Events Page (`/guess/news-events`)
- Gallery Page (`/guess/gallery`)
- Login Page (`/guess/login`)
- Student Dashboard (`/student`)
- Teacher Dashboard (`/teacher`)

---

### Manual Testing

#### 1. Check Browser Console

Open DevTools Console (F12) and look for warnings:

```
⚠ Warning: Prop `className` did not match.
⚠ Warning: Text content did not match.
⚠ Hydration failed because the server rendered HTML didn't match the client.
```

#### 2. Enable React DevTools

Install React DevTools extension and check for hydration errors in the Profiler tab.

#### 3. Test in Production Mode

Hydration errors are more visible in production:

```bash
npm run build
npm start
```

---

## Prevention Tools

### 1. ESLint Rules

Add to `.eslintrc.json`:

```json
{
  "rules": {
    "react/no-direct-mutation-state": "error",
    "react/no-unknown-property": "error"
  }
}
```

### 2. TypeScript Strict Mode

Ensure `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### 3. Pre-Commit Hook

Add to `.husky/pre-commit` or `package.json`:

```bash
#!/bin/sh
npm run lint
npm run build
```

This catches hydration errors before they reach production.

### 4. CI/CD Pipeline

Add Playwright tests to your CI workflow:

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npx playwright install --with-deps
      - run: npx playwright test hydration-errors.spec.ts
```

---

## Quick Reference: Common Fixes

| Problem | ❌ Bad | ✅ Good |
|---------|--------|---------|
| **Conditional render** | `if (!mounted) return null` | Always render, use CSS visibility |
| **Date/Time** | `new Date()` in component body | `typeof window !== 'undefined'` check |
| **Random values** | `Math.random()` | `useId()` or `useEffect` |
| **localStorage** | Direct access in render | `useEffect` to read |
| **Theme** | Return null before mount | `mounted ? theme : 'light'` |
| **Browser APIs** | `window.innerWidth` | `useEffect` hook |

---

## Resources

- [Next.js Hydration Errors Documentation](https://nextjs.org/docs/messages/react-hydration-error)
- [React Hydration Documentation](https://react.dev/reference/react-dom/client/hydrateRoot)
- [Playwright Testing Documentation](https://playwright.dev/docs/intro)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)

---

## Summary

**Key Takeaways**:

1. **Hydration errors occur when server HTML ≠ client HTML**
2. **Always render consistent DOM structure** (use CSS for visibility)
3. **Guard time/random/browser values** with `useEffect` or `typeof window` checks
4. **Use `suppressHydrationWarning`** only when necessary
5. **Test automatically** with Playwright to catch regressions
6. **Prefer Server Components** when you don't need client interactivity

Following these patterns will eliminate hydration errors and provide a better user experience!
