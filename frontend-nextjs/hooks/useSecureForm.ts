/**
 * Secure Form Hook
 * React Hook Form wrapper with built-in security features
 */

"use client"

import { useForm, UseFormProps, UseFormReturn, FieldValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState, useCallback } from "react"
import { sanitizeInput } from "@/lib/security"

// ============================================================================
// TYPES
// ============================================================================

export interface SecureFormOptions<TFieldValues extends FieldValues = FieldValues>
  extends Omit<UseFormProps<TFieldValues>, "resolver"> {
  schema: z.ZodSchema<TFieldValues>
  sanitize?: boolean
  onSecurityThreat?: (threats: string[]) => void
}

export interface SecureFormReturn<TFieldValues extends FieldValues = FieldValues>
  extends UseFormReturn<TFieldValues> {
  isSubmitting: boolean
  submitError: string | null
  handleSecureSubmit: (
    onValid: (data: TFieldValues) => Promise<void> | void
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Use secure form with Zod validation and automatic sanitization
 *
 * @example
 * ```tsx
 * const form = useSecureForm({
 *   schema: loginSchema,
 *   defaultValues: {
 *     email: '',
 *     password: ''
 *   }
 * })
 *
 * const onSubmit = async (data) => {
 *   // Data is already validated and sanitized
 *   await login(data)
 * }
 *
 * <form onSubmit={form.handleSecureSubmit(onSubmit)}>
 *   ...
 * </form>
 * ```
 */
export function useSecureForm<TFieldValues extends FieldValues = FieldValues>({
  schema,
  sanitize = true,
  onSecurityThreat,
  ...options
}: SecureFormOptions<TFieldValues>): SecureFormReturn<TFieldValues> {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Initialize React Hook Form with Zod resolver
  const form = useForm<TFieldValues>({
    ...options,
    resolver: zodResolver(schema),
    mode: options.mode || "onBlur",
    reValidateMode: options.reValidateMode || "onChange",
  })

  /**
   * Secure submit handler
   * - Validates with Zod schema
   * - Optionally sanitizes input
   * - Detects security threats
   * - Handles errors gracefully
   */
  const handleSecureSubmit = useCallback(
    (onValid: (data: TFieldValues) => Promise<void> | void) => {
      return async (e?: React.BaseSyntheticEvent) => {
        e?.preventDefault()
        setSubmitError(null)
        setIsSubmitting(true)

        try {
          // Get form values
          const values = form.getValues()

          // Sanitize if enabled
          let sanitizedValues = values
          const detectedThreats: string[] = []

          if (sanitize) {
            sanitizedValues = sanitizeFormData(values, detectedThreats) as TFieldValues
          }

          // If threats detected, call callback
          if (detectedThreats.length > 0 && onSecurityThreat) {
            onSecurityThreat(detectedThreats)
          }

          // Validate with Zod schema
          const validatedData = schema.parse(sanitizedValues)

          // Call the actual submit handler
          await onValid(validatedData)
        } catch (error) {
          if (error instanceof z.ZodError) {
            // Handle validation errors
            error.errors.forEach((err) => {
              const path = err.path.join(".")
              form.setError(path as any, {
                type: "manual",
                message: err.message,
              })
            })
            setSubmitError("Please fix the errors before submitting")
          } else if (error instanceof Error) {
            setSubmitError(error.message)
          } else {
            setSubmitError("An unknown error occurred")
          }
        } finally {
          setIsSubmitting(false)
        }
      }
    },
    [form, schema, sanitize, onSecurityThreat]
  )

  return {
    ...form,
    isSubmitting,
    submitError,
    handleSecureSubmit,
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Recursively sanitize form data
 */
function sanitizeFormData(data: unknown, threats: string[]): unknown {
  if (data === null || data === undefined) {
    return data
  }

  if (typeof data === "string") {
    const result = sanitizeInput(data, {
      allowHtml: false,
      normalizeUnicode: true,
      detectThreats: true,
    })

    if (result.threats.length > 0) {
      threats.push(...result.threats)
    }

    return result.sanitized
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeFormData(item, threats))
  }

  if (typeof data === "object") {
    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(data)) {
      // Don't sanitize password fields
      if (key.toLowerCase().includes("password")) {
        sanitized[key] = value
      } else {
        sanitized[key] = sanitizeFormData(value, threats)
      }
    }

    return sanitized
  }

  return data
}

// ============================================================================
// ADDITIONAL HOOKS
// ============================================================================

/**
 * Hook for handling file uploads securely
 */
export function useSecureFileUpload(options?: {
  onProgress?: (progress: number) => void
  onError?: (error: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(
    async (file: File, endpoint: string) => {
      setUploading(true)
      setProgress(0)
      setError(null)

      try {
        const formData = new FormData()
        formData.append("file", file)

        // In production, use the secure API client
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`)
        }

        const data = await response.json()
        setProgress(100)
        options?.onProgress?.(100)

        return data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed"
        setError(errorMessage)
        options?.onError?.(errorMessage)
        throw err
      } finally {
        setUploading(false)
      }
    },
    [options]
  )

  return {
    upload,
    uploading,
    progress,
    error,
  }
}

/**
 * Hook for debounced validation (useful for async validation like checking username availability)
 */
export function useDebouncedValidation<T>(
  value: T,
  validator: (value: T) => Promise<boolean | string>,
  delay: number = 500
) {
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = useCallback(async () => {
    if (!value) {
      setError(null)
      return
    }

    setValidating(true)
    setError(null)

    try {
      const result = await validator(value)

      if (typeof result === "string") {
        setError(result)
      } else if (!result) {
        setError("Validation failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation error")
    } finally {
      setValidating(false)
    }
  }, [value, validator])

  // Debounce the validation
  useState(() => {
    const timer = setTimeout(validate, delay)
    return () => clearTimeout(timer)
  })

  return { validating, error }
}
