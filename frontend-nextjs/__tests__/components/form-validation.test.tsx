import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '../utils/test-utils'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'

// Example login form schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

// Mock login form component for testing
function TestLoginForm({ onSubmit }: { onSubmit: (data: LoginFormData) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit', // Trigger validation on submit
    reValidateMode: 'onChange', // Re-validate on change after first submit
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="text"
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" role="alert" className="error">
            {errors.email.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          {...register('password')}
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <span id="password-error" role="alert" className="error">
            {errors.password.message}
          </span>
        )}
      </div>

      <Button type="submit">Login</Button>
    </form>
  )
}

describe('Form Validation with React Hook Form + Zod', () => {
  describe('Email Validation', () => {
    it('shows error for invalid email format', async () => {
      const handleSubmit = vi.fn()
      const user = userEvent.setup()

      render(<TestLoginForm onSubmit={handleSubmit} />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /login/i })

      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)

      // Wait for the error message to appear
      await waitFor(() => {
        const errorMessage = screen.getByText(/invalid email address/i)
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveAttribute('role', 'alert')
      }, { timeout: 3000 })

      // Verify email input has aria-invalid
      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')
      
      // Verify form was not submitted
      expect(handleSubmit).not.toHaveBeenCalled()
    })

    it('accepts valid email format', async () => {
      const handleSubmit = vi.fn()
      const user = userEvent.setup()

      render(<TestLoginForm onSubmit={handleSubmit} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /login/i })

      await user.type(emailInput, 'student@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          {
            email: 'student@example.com',
            password: 'password123',
          },
          expect.anything()
        )
      })
    })
  })

  describe('Password Validation', () => {
    it('shows error for short password', async () => {
      const handleSubmit = vi.fn()
      const user = userEvent.setup()

      render(<TestLoginForm onSubmit={handleSubmit} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /login/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, '12345')
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 6 characters/i)
        ).toBeInTheDocument()
      })

      expect(handleSubmit).not.toHaveBeenCalled()
    })

    it('accepts valid password', async () => {
      const handleSubmit = vi.fn()
      const user = userEvent.setup()

      render(<TestLoginForm onSubmit={handleSubmit} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /login/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'validpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledOnce()
      })
    })
  })

  describe('Form Submission', () => {
    it('displays multiple errors simultaneously', async () => {
      const handleSubmit = vi.fn()
      const user = userEvent.setup()

      render(<TestLoginForm onSubmit={handleSubmit} />)

      const submitButton = screen.getByRole('button', { name: /login/i })
      await user.click(submitButton)

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert')
        expect(alerts).toHaveLength(2)
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
        expect(
          screen.getByText(/password must be at least 6 characters/i)
        ).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('clears errors when valid input is provided', async () => {
      const handleSubmit = vi.fn()
      const user = userEvent.setup()

      render(<TestLoginForm onSubmit={handleSubmit} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /login/i })

      // Trigger error
      await user.click(submitButton)
      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
      }, { timeout: 3000 })

      // Fix error - clear and type new values
      await user.clear(emailInput)
      await user.type(emailInput, 'valid@example.com')
      await user.clear(passwordInput)
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText(/invalid email address/i)).not.toBeInTheDocument()
        expect(handleSubmit).toHaveBeenCalledWith(
          {
            email: 'valid@example.com',
            password: 'password123',
          },
          expect.anything()
        )
      }, { timeout: 3000 })
    })
  })
})
