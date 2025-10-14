# Testing Quick Start Guide

Quick reference for running and writing tests in Southville 8B NHS Edge.

## 🚀 First Time Setup

```bash
cd frontend-nextjs

# Install Playwright browsers
npm run playwright:install
```

## 📝 Running Tests

### Component Tests (Vitest)

| Command | Description |
|---------|-------------|
| `npm run test` | Run tests in watch mode |
| `npm run test:ui` | Interactive UI mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run test -- --run` | Run once (CI mode) |

### E2E Tests (Playwright)

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run all E2E tests |
| `npm run test:e2e:ui` | Interactive mode |
| `npm run test:e2e:headed` | See browser |
| `npm run test:e2e:debug` | Debug mode |

## ✍️ Writing Component Tests

### Basic Test Template

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../__tests__/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { MyComponent } from './my-component'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<MyComponent onClick={handleClick} />)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

### Query Priority

```typescript
// 1. getByRole (BEST - most accessible)
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox', { name: /email/i })

// 2. getByLabelText (for form fields)
screen.getByLabelText('Email')

// 3. getByPlaceholderText
screen.getByPlaceholderText('Enter email')

// 4. getByText
screen.getByText('Welcome')

// 5. getByTestId (LAST RESORT)
screen.getByTestId('custom-element')
```

### Common Assertions

```typescript
// Existence
expect(element).toBeInTheDocument()
expect(element).not.toBeInTheDocument()

// Visibility
expect(element).toBeVisible()
expect(element).not.toBeVisible()

// Text content
expect(element).toHaveTextContent('Hello')

// Attributes
expect(element).toHaveAttribute('href', '/link')
expect(element).toHaveClass('active')

// Form elements
expect(input).toHaveValue('text')
expect(checkbox).toBeChecked()
expect(button).toBeDisabled()
```

## 🎭 Writing E2E Tests

### Basic E2E Template

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should complete user flow', async ({ page }) => {
    // Navigate
    await page.goto('/student/dashboard')

    // Interact
    await page.click('text=Assignments')
    await page.fill('[name="search"]', 'math')
    await page.press('[name="search"]', 'Enter')

    // Assert
    await expect(page).toHaveURL(/\/assignments/)
    await expect(page.locator('h1')).toContainText('Assignments')
  })
})
```

### Common Playwright Actions

```typescript
// Navigation
await page.goto('/path')
await page.goBack()
await page.reload()

// Clicking
await page.click('button')
await page.click('text=Submit')

// Typing
await page.fill('[name="email"]', 'test@example.com')
await page.type('[name="search"]', 'query')
await page.press('[name="field"]', 'Enter')

// Waiting
await page.waitForSelector('.loaded')
await page.waitForURL('/new-page')
await page.waitForLoadState('networkidle')

// Assertions
await expect(page).toHaveURL('/expected')
await expect(page.locator('h1')).toBeVisible()
await expect(page.locator('h1')).toContainText('Title')
```

## 🔍 Test File Locations

```
frontend-nextjs/
├── components/
│   └── ui/
│       ├── button.tsx
│       └── button.test.tsx        ← Component tests here
├── __tests__/
│   ├── components/                ← Or group tests here
│   └── utils/
│       └── test-utils.tsx         ← Test utilities
└── e2e/
    ├── homepage.spec.ts           ← E2E tests here
    ├── navigation.spec.ts
    └── accessibility.spec.ts
```

## 🎯 What to Test

### ✅ Do Test

- User interactions (clicks, typing, form submissions)
- Component rendering with different props
- Form validation
- Accessibility (keyboard navigation, ARIA)
- Critical user flows (E2E)
- Error states
- Loading states

### ❌ Don't Test

- Implementation details
- CSS styling
- Third-party library internals
- Trivial components (simple divs)

## 🐛 Debugging Tests

### Component Tests

```bash
# Run specific test file
npm run test button.test.tsx

# Use test.only to focus on one test
test.only('this test', () => { /* ... */ })

# View in UI mode
npm run test:ui
```

### E2E Tests

```bash
# Debug mode (step through)
npm run test:e2e:debug

# Run in headed mode
npm run test:e2e:headed

# Run specific test
npm run test:e2e navigation.spec.ts

# Add page.pause() in test
await page.pause()  // Opens inspector
```

## 📊 Coverage

```bash
# Generate coverage report
npm run test:coverage

# View report
open coverage/index.html
```

**Target:** 70%+ coverage for critical components

## 🚨 Common Pitfalls

### 1. Not Waiting for Async Updates

```typescript
// ❌ Wrong
render(<AsyncComponent />)
expect(screen.getByText('Loaded')).toBeInTheDocument()

// ✅ Correct
render(<AsyncComponent />)
await screen.findByText('Loaded')
// or
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

### 2. Testing Implementation Details

```typescript
// ❌ Wrong
expect(wrapper.state().count).toBe(5)

// ✅ Correct
expect(screen.getByText('Count: 5')).toBeInTheDocument()
```

### 3. Using Wrong Query

```typescript
// ❌ Less accessible
screen.getByTestId('submit-button')

// ✅ More accessible
screen.getByRole('button', { name: /submit/i })
```

## 📚 Additional Resources

- [Full Testing Guide](./TESTING.md) - Comprehensive documentation
- [React Testing Library](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev)
- [Vitest API](https://vitest.dev/api/)

## 💡 Tips

1. **Start small**: Test one component at a time
2. **Use test:ui**: Interactive mode helps debug
3. **Check examples**: Look at existing tests in `components/ui/button.test.tsx`
4. **Test user behavior**: Focus on what users see and do
5. **Mock sparingly**: Only mock external dependencies

---

Need help? Check [TESTING.md](./TESTING.md) or open an issue!
