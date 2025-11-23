import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'

/**
 * Custom render function that wraps components with common providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
      </ThemeProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'

// Override render method with our custom one
export { customRender as render }

/**
 * Mock router push function for testing navigation
 */
export const mockRouterPush = vi.fn()

/**
 * Create mock user data for testing
 */
export function createMockStudent(overrides = {}) {
  return {
    id: '1',
    name: 'Test Student',
    email: 'student@test.com',
    role: 'student',
    grade: 10,
    section: 'A',
    ...overrides,
  }
}

export function createMockTeacher(overrides = {}) {
  return {
    id: '1',
    name: 'Test Teacher',
    email: 'teacher@test.com',
    role: 'teacher',
    department: 'Mathematics',
    ...overrides,
  }
}

/**
 * Create mock assignment data
 */
export function createMockAssignment(overrides = {}) {
  return {
    id: '1',
    title: 'Test Assignment',
    description: 'This is a test assignment',
    dueDate: new Date('2025-12-31'),
    subject: 'Mathematics',
    status: 'pending',
    ...overrides,
  }
}

/**
 * Create mock quiz data
 */
export function createMockQuiz(overrides = {}) {
  return {
    id: '1',
    title: 'Test Quiz',
    description: 'This is a test quiz',
    questions: [
      {
        id: '1',
        question: 'What is 2 + 2?',
        options: ['2', '3', '4', '5'],
        correctAnswer: 2,
      },
    ],
    duration: 30,
    totalPoints: 10,
    ...overrides,
  }
}
