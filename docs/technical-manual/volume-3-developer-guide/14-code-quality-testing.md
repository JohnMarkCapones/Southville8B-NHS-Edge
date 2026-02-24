# 14. Code Quality & Testing

**Last Updated:** January 10, 2026
**Status:** ✅ Complete

---

## Table of Contents

- [14.1 Code Quality Tools](#141-code-quality-tools)
- [14.2 ESLint Configuration](#142-eslint-configuration)
- [14.3 Testing Strategy](#143-testing-strategy)
- [14.4 Writing Tests](#144-writing-tests)
- [14.5 Code Review Checklist](#145-code-review-checklist)

---

## 14.1 Code Quality Tools

### 14.1.1 Tool Stack

The project uses a comprehensive set of code quality tools:

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **ESLint** | JavaScript/TypeScript linting | `.eslintrc.json` |
| **Prettier** | Code formatting | Built into ESLint config |
| **TypeScript** | Type checking | `tsconfig.json` |
| **Husky** | Git hooks | `.husky/` directory |
| **lint-staged** | Pre-commit linting | `package.json` |

---

### 14.1.2 Running Quality Checks

#### Development Workflow

```bash
# Navigate to frontend directory
cd frontend-nextjs

# Lint check (shows errors)
npm run lint

# Type check
npm run type-check  # If configured

# Build check (includes type checking)
npm run build
```

#### Pre-commit Hooks

Git hooks automatically run checks before commits:

```bash
# Husky runs on git commit
# - Lints staged files
# - Runs type checking
# - Prevents commit if errors exist
```

---

### 14.1.3 Editor Integration

#### VS Code Settings

Recommended `.vscode/settings.json`:

```json
{
  // Format on save
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",

  // ESLint
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },

  // TypeScript
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,

  // File associations
  "files.associations": {
    "*.css": "tailwindcss"
  },

  // Tailwind IntelliSense
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

#### Recommended Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

---

## 14.2 ESLint Configuration

### 14.2.1 Configuration Overview

The project uses **Next.js ESLint** with additional plugins and custom rules.

#### `.eslintrc.json`

```json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript"
  ],
  "rules": {
    // TypeScript
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-explicit-any": "error",

    // React
    "react/no-unescaped-entities": "off",
    "react/jsx-curly-brace-presence": [
      "error",
      {
        "props": "never",
        "children": "never"
      }
    ],

    // Import order
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "pathGroups": [
          {
            "pattern": "@/**",
            "group": "internal"
          }
        ],
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ],

    // General
    "no-console": [
      "warn",
      {
        "allow": ["warn", "error"]
      }
    ],
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

---

### 14.2.2 Common ESLint Rules Explained

#### No Unused Variables

```typescript
// ❌ Error: 'count' is declared but never used
const count = 5

// ✅ OK: Variable is used
const count = 5
console.log(count)

// ✅ OK: Prefix with underscore to ignore
const _unusedVar = 'ignored'

// Function parameters
function handleClick(_event: Event) {  // ✅ OK with underscore
  console.log('Clicked')
}
```

#### No Explicit Any

```typescript
// ❌ Error: Unexpected any. Specify a different type
function process(data: any) {
  return data
}

// ✅ OK: Use proper types
function process(data: Student[]) {
  return data
}

// ✅ OK: Use unknown for truly unknown types
function process(data: unknown) {
  if (Array.isArray(data)) {
    return data
  }
}
```

#### Import Order

```typescript
// ❌ Wrong order
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import fs from 'fs'

// ✅ Correct order (auto-fixed by ESLint)
// 1. Built-in Node modules
import fs from 'fs'

// 2. External dependencies
import { useState } from 'react'

// 3. Internal imports (@/ paths)
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
```

#### No Console Logs

```typescript
// ❌ Warning: Unexpected console.log
console.log('Debug info')

// ✅ OK: Allowed console methods
console.warn('Warning message')
console.error('Error message')

// ✅ OK: Remove before commit or use proper logging
import { logger } from '@/lib/logger'
logger.debug('Debug info')
```

---

### 14.2.3 Disabling Rules

Sometimes you need to disable rules (use sparingly):

```typescript
// Disable for entire file
/* eslint-disable @typescript-eslint/no-explicit-any */

// Disable for next line
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = fetchData()

// Disable for block
/* eslint-disable no-console */
console.log('Debug 1')
console.log('Debug 2')
/* eslint-enable no-console */

// Disable specific rule for file
// eslint-disable-next-line react/no-unescaped-entities
<p>Don't use this pattern</p>
```

**⚠️ Warning**: Only disable rules when absolutely necessary. Always add a comment explaining why.

---

## 14.3 Testing Strategy

### 14.3.1 Testing Pyramid

The project follows the testing pyramid approach:

```
        /\
       /  \      E2E Tests (Few)
      /____\     - Critical user flows
     /      \    - Integration tests
    /________\
   /          \  Unit Tests (Many)
  /____________\ - Components
                 - Utilities
                 - Hooks
```

#### Test Types

| Type | Purpose | Tools | Frequency |
|------|---------|-------|-----------|
| **Unit Tests** | Test individual functions/components | Jest, React Testing Library | Most tests |
| **Integration Tests** | Test component interactions | Jest, React Testing Library | Some tests |
| **E2E Tests** | Test complete user flows | Playwright, Cypress | Few tests |

---

### 14.3.2 Testing Tools

#### Jest

JavaScript testing framework for unit and integration tests.

**Configuration**: `jest.config.js`

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

#### React Testing Library

Testing library for React components with user-centric approach.

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

#### Playwright (Future)

End-to-end testing framework (not yet configured).

---

### 14.3.3 What to Test

#### ✅ Always Test

- **Business logic functions**
  ```typescript
  // calculateGrade.ts
  export function calculateGrade(score: number, total: number): string {
    const percentage = (score / total) * 100
    if (percentage >= 90) return 'A'
    if (percentage >= 80) return 'B'
    if (percentage >= 70) return 'C'
    if (percentage >= 60) return 'D'
    return 'F'
  }
  ```

- **Utility functions**
  ```typescript
  // formatDate.ts
  export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US').format(date)
  }
  ```

- **Custom hooks**
  ```typescript
  // useLocalStorage.ts
  export function useLocalStorage<T>(key: string, initialValue: T) {
    // Implementation
  }
  ```

- **Complex components with state**
  ```typescript
  // StudentForm.tsx
  export function StudentForm() {
    // Complex form logic
  }
  ```

#### ⚠️ Maybe Test

- **Simple presentational components**
  - Test if they have complex conditional rendering
  - Skip if they're just styled wrappers

- **API route handlers**
  - Test business logic
  - Mock external dependencies

#### ❌ Don't Test

- **Third-party libraries** (already tested)
- **Next.js internals** (framework features)
- **Pure UI with no logic** (just props → JSX)
- **Configuration files**

---

## 14.4 Writing Tests

### 14.4.1 Unit Test Examples

#### Testing Utility Functions

```typescript
// lib/utils/calculateGrade.ts
export function calculateGrade(score: number, total: number): string {
  if (total === 0) throw new Error('Total cannot be zero')

  const percentage = (score / total) * 100

  if (percentage >= 90) return 'A'
  if (percentage >= 80) return 'B'
  if (percentage >= 70) return 'C'
  if (percentage >= 60) return 'D'
  return 'F'
}

// lib/utils/__tests__/calculateGrade.test.ts
import { calculateGrade } from '../calculateGrade'

describe('calculateGrade', () => {
  it('returns A for 90% or higher', () => {
    expect(calculateGrade(90, 100)).toBe('A')
    expect(calculateGrade(95, 100)).toBe('A')
    expect(calculateGrade(100, 100)).toBe('A')
  })

  it('returns B for 80-89%', () => {
    expect(calculateGrade(80, 100)).toBe('B')
    expect(calculateGrade(85, 100)).toBe('B')
    expect(calculateGrade(89, 100)).toBe('B')
  })

  it('returns F for below 60%', () => {
    expect(calculateGrade(59, 100)).toBe('F')
    expect(calculateGrade(0, 100)).toBe('F')
  })

  it('handles decimal scores', () => {
    expect(calculateGrade(45.5, 50)).toBe('A')  // 91%
  })

  it('throws error for zero total', () => {
    expect(() => calculateGrade(50, 0)).toThrow('Total cannot be zero')
  })
})
```

#### Testing Date Formatting

```typescript
// lib/utils/formatDate.ts
export function formatDate(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

// lib/utils/__tests__/formatDate.test.ts
import { formatDate } from '../formatDate'

describe('formatDate', () => {
  it('formats date in US format by default', () => {
    const date = new Date('2026-01-10')
    expect(formatDate(date)).toBe('January 10, 2026')
  })

  it('formats date in specified locale', () => {
    const date = new Date('2026-01-10')
    expect(formatDate(date, 'en-GB')).toBe('10 January 2026')
  })

  it('handles different dates', () => {
    expect(formatDate(new Date('2025-12-25'))).toBe('December 25, 2025')
    expect(formatDate(new Date('2026-06-15'))).toBe('June 15, 2026')
  })
})
```

---

### 14.4.2 Component Testing

#### Simple Component Test

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'destructive'
  disabled?: boolean
}

export function Button({
  children,
  onClick,
  variant = 'default',
  disabled = false,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={variant === 'destructive' ? 'bg-red-500' : 'bg-blue-500'}
    >
      {children}
    </button>
  )
}

// components/ui/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn()
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    )

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies destructive styles when variant is destructive', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByText('Delete')
    expect(button).toHaveClass('bg-red-500')
  })

  it('applies default styles by default', () => {
    render(<Button>Submit</Button>)
    const button = screen.getByText('Submit')
    expect(button).toHaveClass('bg-blue-500')
  })
})
```

#### Complex Component Test

```typescript
// components/StudentCard.tsx
interface StudentCardProps {
  student: {
    id: string
    name: string
    email: string
  }
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function StudentCard({ student, onEdit, onDelete }: StudentCardProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div data-testid={`student-card-${student.id}`}>
      <h3>{student.name}</h3>
      <p>{student.email}</p>

      <button onClick={() => setShowActions(!showActions)}>
        {showActions ? 'Hide' : 'Show'} Actions
      </button>

      {showActions && (
        <div>
          <button onClick={() => onEdit(student.id)}>Edit</button>
          <button onClick={() => onDelete(student.id)}>Delete</button>
        </div>
      )}
    </div>
  )
}

// components/__tests__/StudentCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { StudentCard } from '../StudentCard'

describe('StudentCard', () => {
  const mockStudent = {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
  }

  const mockOnEdit = jest.fn()
  const mockOnDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders student information', () => {
    render(
      <StudentCard
        student={mockStudent}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('hides actions by default', () => {
    render(
      <StudentCard
        student={mockStudent}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })

  it('shows actions when Show Actions is clicked', () => {
    render(
      <StudentCard
        student={mockStudent}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    fireEvent.click(screen.getByText('Show Actions'))

    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('calls onEdit with student id', () => {
    render(
      <StudentCard
        student={mockStudent}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    fireEvent.click(screen.getByText('Show Actions'))
    fireEvent.click(screen.getByText('Edit'))

    expect(mockOnEdit).toHaveBeenCalledWith('123')
  })

  it('calls onDelete with student id', () => {
    render(
      <StudentCard
        student={mockStudent}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    fireEvent.click(screen.getByText('Show Actions'))
    fireEvent.click(screen.getByText('Delete'))

    expect(mockOnDelete).toHaveBeenCalledWith('123')
  })
})
```

---

### 14.4.3 Hook Testing

```typescript
// hooks/useCounter.ts
import { useState, useCallback } from 'react'

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue)

  const increment = useCallback(() => {
    setCount((c) => c + 1)
  }, [])

  const decrement = useCallback(() => {
    setCount((c) => c - 1)
  }, [])

  const reset = useCallback(() => {
    setCount(initialValue)
  }, [initialValue])

  return { count, increment, decrement, reset }
}

// hooks/__tests__/useCounter.test.ts
import { renderHook, act } from '@testing-library/react'
import { useCounter } from '../useCounter'

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current.count).toBe(0)
  })

  it('initializes with custom value', () => {
    const { result } = renderHook(() => useCounter(10))
    expect(result.current.count).toBe(10)
  })

  it('increments count', () => {
    const { result } = renderHook(() => useCounter())

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(2)
  })

  it('decrements count', () => {
    const { result } = renderHook(() => useCounter(5))

    act(() => {
      result.current.decrement()
    })

    expect(result.current.count).toBe(4)
  })

  it('resets to initial value', () => {
    const { result } = renderHook(() => useCounter(10))

    act(() => {
      result.current.increment()
      result.current.increment()
    })

    expect(result.current.count).toBe(12)

    act(() => {
      result.current.reset()
    })

    expect(result.current.count).toBe(10)
  })
})
```

---

### 14.4.4 Mocking

#### Mocking Modules

```typescript
// lib/api.ts
export async function fetchStudent(id: string) {
  const response = await fetch(`/api/students/${id}`)
  return response.json()
}

// components/__tests__/StudentProfile.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { StudentProfile } from '../StudentProfile'
import * as api from '@/lib/api'

// Mock the entire module
jest.mock('@/lib/api')

describe('StudentProfile', () => {
  it('displays student data when loaded', async () => {
    // Mock the function implementation
    const mockFetchStudent = api.fetchStudent as jest.MockedFunction<
      typeof api.fetchStudent
    >

    mockFetchStudent.mockResolvedValue({
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
    })

    render(<StudentProfile id="123" />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('displays error when fetch fails', async () => {
    const mockFetchStudent = api.fetchStudent as jest.MockedFunction<
      typeof api.fetchStudent
    >

    mockFetchStudent.mockRejectedValue(new Error('Failed to fetch'))

    render(<StudentProfile id="123" />)

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })
})
```

#### Mocking Zustand Stores

```typescript
// lib/stores/sidebar-store.ts
import { create } from 'zustand'

interface SidebarState {
  isOpen: boolean
  toggle: () => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))

// components/__tests__/Sidebar.test.tsx
import { render, screen } from '@testing-library/react'
import { Sidebar } from '../Sidebar'
import { useSidebarStore } from '@/lib/stores/sidebar-store'

// Mock Zustand store
jest.mock('@/lib/stores/sidebar-store')

describe('Sidebar', () => {
  it('renders open when isOpen is true', () => {
    ;(useSidebarStore as unknown as jest.Mock).mockReturnValue({
      isOpen: true,
      toggle: jest.fn(),
    })

    render(<Sidebar />)
    expect(screen.getByTestId('sidebar')).toHaveClass('open')
  })

  it('renders closed when isOpen is false', () => {
    ;(useSidebarStore as unknown as jest.Mock).mockReturnValue({
      isOpen: false,
      toggle: jest.fn(),
    })

    render(<Sidebar />)
    expect(screen.getByTestId('sidebar')).not.toHaveClass('open')
  })
})
```

---

### 14.4.5 Test Coverage

#### Running Coverage Reports

```bash
# Run tests with coverage
npm test -- --coverage

# Coverage report in terminal
# Coverage HTML report in coverage/lcov-report/index.html
```

#### Coverage Goals

| Type | Minimum Coverage |
|------|------------------|
| **Statements** | 80% |
| **Branches** | 75% |
| **Functions** | 80% |
| **Lines** | 80% |

**Focus areas for 100% coverage:**
- Critical business logic
- Utility functions
- Custom hooks
- Complex components

---

## 14.5 Code Review Checklist

### 14.5.1 Functionality

- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No obvious bugs
- [ ] User experience is smooth

---

### 14.5.2 Code Quality

- [ ] Code is readable and maintainable
- [ ] Follows project conventions
- [ ] No code duplication
- [ ] Functions are small and focused
- [ ] No unnecessary complexity
- [ ] Proper TypeScript types used
- [ ] No `any` types
- [ ] No ESLint errors

---

### 14.5.3 TypeScript

- [ ] All types are explicit where needed
- [ ] No implicit `any` types
- [ ] Proper null/undefined handling
- [ ] Type inference used appropriately
- [ ] Interfaces defined for complex types
- [ ] No type assertions (`as`) unless necessary

---

### 14.5.4 React Patterns

- [ ] Components are properly structured
- [ ] Server Components vs Client Components used correctly
- [ ] Props are properly typed
- [ ] No unnecessary `useEffect`
- [ ] Proper dependency arrays in hooks
- [ ] No prop drilling (use context/stores)
- [ ] Memoization used where appropriate

---

### 14.5.5 Performance

- [ ] No performance regressions
- [ ] Efficient algorithms used
- [ ] Proper caching implemented
- [ ] Images optimized
- [ ] Large dependencies justified
- [ ] Code splitting used where appropriate

---

### 14.5.6 Security

- [ ] No security vulnerabilities
- [ ] User input is validated
- [ ] Sensitive data is protected
- [ ] Authentication/authorization correct
- [ ] No hardcoded secrets
- [ ] XSS prevention (no dangerouslySetInnerHTML without sanitization)

---

### 14.5.7 Testing

- [ ] Tests are included for new functionality
- [ ] Tests are meaningful
- [ ] All tests pass
- [ ] Test coverage is adequate
- [ ] Edge cases are tested

---

### 14.5.8 Documentation

- [ ] Code is well-commented where needed
- [ ] Complex logic is explained
- [ ] Documentation updated (if needed)
- [ ] README updated (if needed)
- [ ] Types are documented (JSDoc)

---

## Code Quality Best Practices Summary

### ✅ Do

- **Run linting before commits** - Fix all ESLint errors
- **Write tests for business logic** - Aim for 80% coverage
- **Use TypeScript strictly** - No `any` types
- **Follow naming conventions** - Consistent naming
- **Keep functions small** - Single responsibility
- **Document complex code** - Explain the "why"
- **Review your own code first** - Before requesting review
- **Use meaningful variable names** - Self-documenting code
- **Handle errors gracefully** - User-friendly error messages
- **Optimize performance** - Profile and measure

### ❌ Don't

- **Don't commit with ESLint errors** - Fix them first
- **Don't skip tests** - Test critical functionality
- **Don't use `any` type** - Use proper types
- **Don't leave console.logs** - Remove debug code
- **Don't over-engineer** - Keep it simple
- **Don't skip code reviews** - Get feedback
- **Don't commit commented code** - Delete it
- **Don't hardcode values** - Use constants/config
- **Don't ignore warnings** - They exist for a reason
- **Don't merge without approval** - Follow process

---

## Quick Reference Commands

```bash
# Linting
npm run lint                 # Check for linting errors
npm run lint -- --fix        # Auto-fix linting errors

# Type checking
npm run build                # Includes type checking

# Testing
npm test                     # Run all tests
npm test -- --watch          # Run tests in watch mode
npm test -- --coverage       # Run with coverage report
npm test Button              # Run specific test file

# Pre-commit
git commit                   # Triggers lint-staged automatically
```

---

## Navigation

- [← Previous: TypeScript Guidelines](./13-typescript-guidelines.md)
- [Next: API Integration →](./15-api-integration.md)
- [↑ Back to Volume 3 Index](./README.md)
- [↑↑ Back to Manual Index](../README.md)
