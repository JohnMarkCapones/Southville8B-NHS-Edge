# Testing Guide - Southville 8B NHS Edge

This document provides comprehensive guidance for testing the Southville 8B NHS Edge Next.js application.

## Table of Contents

- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Getting Started](#getting-started)
- [Component Testing](#component-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

## Overview

Our testing strategy ensures code quality, accessibility, and reliability across the application:

- **Component Tests**: Unit and integration tests for React components using Vitest + React Testing Library
- **E2E Tests**: Full user flow testing with Playwright across multiple browsers
- **Accessibility Tests**: Automated WCAG compliance checks
- **Visual Regression**: Screenshot-based testing for UI consistency

## Testing Stack

| Tool | Purpose | Documentation |
|------|---------|---------------|
| **Vitest** | Component test runner | [vitest.dev](https://vitest.dev) |
| **React Testing Library** | Component testing utilities | [testing-library.com](https://testing-library.com/react) |
| **@testing-library/jest-dom** | Custom DOM matchers | [jest-dom](https://github.com/testing-library/jest-dom) |
| **@testing-library/user-event** | User interaction simulation | [user-event](https://testing-library.com/docs/user-event/intro) |
| **Playwright** | E2E testing framework | [playwright.dev](https://playwright.dev) |

## Getting Started

### 1. Install Playwright Browsers

```bash
cd frontend-nextjs
npm run playwright:install
```

### 2. Run Your First Test

```bash
# Component tests (watch mode)
npm run test

# E2E tests
npm run test:e2e
```

## Component Testing

### What to Test

✅ **Do test:**
- User interactions (clicks, typing, form submissions)
- Component rendering with different props
- Conditional rendering logic
- Accessibility (ARIA attributes, keyboard navigation)
- Form validation
- State management

❌ **Don't test:**
- Implementation details (internal state, specific CSS classes)
- Third-party library internals
- Next.js routing (mock it instead)

### Example: Button Component Test

```tsx
// components/ui/button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

describe('Button', () => {
  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('is keyboard accessible', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Press Enter</Button>)

    const button = screen.getByRole('button')
    button.focus()
    await userEvent.keyboard('{Enter}')

    expect(handleClick).toHaveBeenCalled()
  })
})
```

### Test File Naming Conventions

- Component tests: `*.test.tsx` or `*.spec.tsx`
- Test utilities: `test-utils.tsx`
- Place tests alongside components or in `__tests__/` directory

```
components/
├── ui/
│   ├── button.tsx
│   └── button.test.tsx        ✅ Co-located
__tests__/
├── components/
│   └── form-validation.test.tsx  ✅ Grouped by feature
└── utils/
    └── test-utils.tsx
```

## End-to-End Testing

### What to Test

✅ **Do test:**
- Critical user journeys (login, quiz submission, grade viewing)
- Navigation between pages
- Form submissions
- Responsive design across viewports
- Accessibility on real pages
- Error handling

### Example: Navigation Test

```typescript
// e2e/navigation.spec.ts
import { test, expect } from '@playwright/test'

test('student can navigate to assignments', async ({ page }) => {
  await page.goto('/student/dashboard')

  await page.click('text=Assignments')

  await expect(page).toHaveURL(/\/student\/assignments/)
  await expect(page.locator('h1')).toContainText('Assignments')
})
```

### Test File Organization

```
e2e/
├── homepage.spec.ts           # Homepage tests
├── navigation.spec.ts         # Navigation flows
├── accessibility.spec.ts      # Accessibility checks
├── student/
│   ├── dashboard.spec.ts      # Student dashboard
│   ├── assignments.spec.ts    # Assignment workflows
│   └── quiz.spec.ts           # Quiz taking
└── teacher/
    ├── grading.spec.ts        # Grading workflows
    └── quiz-builder.spec.ts   # Quiz creation
```

## Running Tests

### Component Tests

```bash
# Run all component tests (watch mode)
npm run test

# Run tests with UI (interactive)
npm run test:ui

# Run tests once (CI mode)
npm run test -- --run

# Generate coverage report
npm run test:coverage

# Run specific test file
npm run test button.test.tsx

# Run tests matching pattern
npm run test -- --grep "Button"
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug

# Run specific browser
npm run test:e2e -- --project=chromium

# Run specific test file
npm run test:e2e navigation.spec.ts

# Run tests matching title
npm run test:e2e -- --grep "student dashboard"
```

### Viewing Test Results

**Component Tests:**
- Terminal output shows pass/fail status
- Coverage report: `coverage/index.html`
- UI mode: Interactive browser interface

**E2E Tests:**
- HTML report automatically opens on failure
- Manual: `npx playwright show-report`
- Screenshots: `test-results/` directory
- Videos: Enable in `playwright.config.ts`

## Writing Tests

### Test Structure (AAA Pattern)

```typescript
test('descriptive test name', async () => {
  // Arrange: Set up test data and environment
  const user = userEvent.setup()
  render(<MyComponent initialValue="test" />)

  // Act: Perform actions
  await user.type(screen.getByLabelText('Name'), 'John')
  await user.click(screen.getByRole('button', { name: /submit/i }))

  // Assert: Verify results
  expect(screen.getByText('Success')).toBeInTheDocument()
})
```

### Querying Elements

**Priority order (prefer top to bottom):**

1. `getByRole` - Most accessible
2. `getByLabelText` - Form inputs
3. `getByPlaceholderText` - Inputs without labels
4. `getByText` - Text content
5. `getByTestId` - Last resort

```typescript
// ✅ Good: Accessible queries
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')
screen.getByText('Welcome back')

// ❌ Avoid: Implementation details
screen.getByClassName('btn-primary')
screen.getByTestId('submit-button') // Use only if needed
```

### Async Testing

```typescript
// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})

// Find element that will appear
const element = await screen.findByText('Async content')

// Wait for element to disappear
await waitForElementToBeRemoved(() => screen.queryByText('Loading'))
```

### Mocking

**Mock Next.js Router:**
```typescript
// Already configured in vitest.setup.ts
// Customize per test if needed:
vi.mocked(useRouter).mockReturnValue({
  push: vi.fn(),
  pathname: '/student/dashboard',
})
```

**Mock API Calls:**
```typescript
// Mock fetch for component tests
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'mock data' }),
})
```

## Best Practices

### General

1. **Test User Behavior, Not Implementation**
   - Focus on what users see and do
   - Avoid testing internal component state

2. **Write Descriptive Test Names**
   ```typescript
   // ✅ Good
   test('shows error when email is invalid')

   // ❌ Bad
   test('email validation')
   ```

3. **Keep Tests Independent**
   - Each test should run in isolation
   - Don't rely on test execution order

4. **Use Data-Testid Sparingly**
   - Prefer semantic queries (`getByRole`, `getByLabelText`)
   - Only use `data-testid` when no other option exists

### Component Testing

1. **Test Component Contracts**
   ```typescript
   // Test how component responds to props
   render(<Button disabled>Click</Button>)
   expect(screen.getByRole('button')).toBeDisabled()
   ```

2. **Test User Interactions**
   ```typescript
   const user = userEvent.setup()
   await user.click(button)
   await user.type(input, 'text')
   await user.tab()
   ```

3. **Test Accessibility**
   ```typescript
   // Ensure proper ARIA attributes
   expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close')

   // Verify keyboard navigation
   await user.tab()
   expect(document.activeElement).toBe(screen.getByRole('button'))
   ```

### E2E Testing

1. **Use Page Object Pattern for Complex Flows**
   ```typescript
   class LoginPage {
     constructor(public page: Page) {}

     async login(email: string, password: string) {
       await this.page.fill('[name="email"]', email)
       await this.page.fill('[name="password"]', password)
       await this.page.click('button[type="submit"]')
     }
   }
   ```

2. **Wait for Network Requests**
   ```typescript
   await page.waitForResponse(resp =>
     resp.url().includes('/api/assignments')
   )
   ```

3. **Take Screenshots on Failure**
   ```typescript
   // Already configured in playwright.config.ts
   test('..', async ({ page }) => {
     // Screenshot taken automatically on failure
   })
   ```

## Accessibility Testing

### Component Level

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('has no accessibility violations', async () => {
  const { container } = render(<MyComponent />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### E2E Level

```typescript
// e2e/accessibility.spec.ts - already created
test('supports keyboard navigation', async ({ page }) => {
  await page.goto('/')

  await page.keyboard.press('Tab')
  const focused = await page.evaluate(() => document.activeElement?.tagName)
  expect(focused).toBeTruthy()
})
```

## Coverage Goals

| Type | Target | Priority |
|------|--------|----------|
| **Statements** | 70%+ | Medium |
| **Branches** | 60%+ | Medium |
| **Functions** | 70%+ | Medium |
| **Lines** | 70%+ | Medium |

**High-priority coverage:**
- ✅ UI components (`components/ui/*`)
- ✅ Form validation logic
- ✅ Student/Teacher features
- ✅ Quiz system
- ✅ Authentication flows

**Lower-priority coverage:**
- ⚠️ Static pages (news, events)
- ⚠️ Layout components
- ⚠️ Simple presentational components

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test -- --run
      - run: npm run test:coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Common Issues

**1. Tests timeout**
```typescript
// Increase timeout for slow operations
test('slow operation', async () => {
  // ...
}, { timeout: 10000 })
```

**2. Element not found**
```typescript
// Wait for element
await screen.findByText('content') // findBy* waits automatically

// Or use waitFor
await waitFor(() => screen.getByText('content'))
```

**3. Playwright browser not installed**
```bash
npm run playwright:install
```

**4. Module resolution errors**
```typescript
// Ensure vitest.config.ts has correct alias
resolve: {
  alias: {
    '@': path.resolve(__dirname, './'),
  },
}
```

## Resources

- [Testing Library Queries Cheatsheet](https://testing-library.com/docs/queries/about#priority)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [React Testing Examples](https://github.com/testing-library/react-testing-library/tree/main/examples)
- [Vitest API Reference](https://vitest.dev/api/)

## Next Steps

1. **Expand Test Coverage**: Start with high-priority components
2. **Set Up CI/CD**: Automate test runs on pull requests
3. **Add Visual Testing**: Consider Storybook + Chromatic
4. **Performance Testing**: Add Lighthouse CI checks
5. **Security Testing**: Integrate OWASP ZAP or similar tools

---

**Questions or issues?** Open an issue in the repository or consult the documentation links above.
