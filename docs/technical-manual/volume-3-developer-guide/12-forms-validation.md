# 12. Forms & Validation

**Last Updated:** January 10, 2026
**Status:** ✅ Complete

---

## Table of Contents

- [12.1 React Hook Form Integration](#121-react-hook-form-integration)
- [12.2 Zod Schema Validation](#122-zod-schema-validation)
- [12.3 Form Patterns & Examples](#123-form-patterns--examples)
- [12.4 Error Handling & UX](#124-error-handling--ux)

---

## 12.1 React Hook Form Integration

### 12.1.1 Why React Hook Form?

**React Hook Form** is the form library of choice for Southville 8B NHS Edge due to:

**Performance Benefits:**
- Minimal re-renders (only updates changed fields)
- No controlled components overhead
- Uncontrolled form inputs by default
- Small bundle size (~8.5kb minified + gzipped)

**Developer Experience:**
- Simple API with hooks
- TypeScript support out of the box
- Seamless Zod integration
- Built-in validation
- Easy error handling

**Comparison:**

| Feature | React Hook Form | Formik | Plain React State |
|---------|----------------|--------|-------------------|
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Bundle Size | 8.5kb | 13kb | 0kb |
| Re-renders | Minimal | Many | Many |
| TypeScript | Excellent | Good | Manual |
| Learning Curve | Easy | Medium | Easy |

---

### 12.1.2 Basic Form Setup

#### Installation

Already included in the project dependencies:

```bash
# Already installed, but for reference:
npm install react-hook-form @hookform/resolvers zod
```

#### Simple Form Example

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface LoginFormData {
  email: string
  password: string
}

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>()

  const onSubmit = (data: LoginFormData) => {
    console.log('Form data:', data)
    // Handle login logic
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('email', { required: 'Email is required' })}
          type="email"
          placeholder="Email"
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Input
          {...register('password', { required: 'Password is required' })}
          type="password"
          placeholder="Password"
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Login
      </Button>
    </form>
  )
}
```

---

### 12.1.3 Form Registration

The `register` function connects your input to React Hook Form.

#### Basic Registration

```tsx
<Input {...register('fieldName')} />
```

#### Registration with Validation Rules

```tsx
<Input
  {...register('email', {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  })}
/>
```

#### Available Validation Rules

```tsx
register('username', {
  required: 'This field is required',
  minLength: {
    value: 3,
    message: 'Minimum 3 characters'
  },
  maxLength: {
    value: 20,
    message: 'Maximum 20 characters'
  },
  pattern: {
    value: /^[a-zA-Z0-9_]+$/,
    message: 'Only alphanumeric and underscore allowed'
  },
  validate: (value) => {
    return value !== 'admin' || 'Username "admin" is reserved'
  }
})
```

---

### 12.1.4 Controlled vs Uncontrolled

#### Uncontrolled (Default - Recommended)

React Hook Form uses uncontrolled inputs by default for better performance.

```tsx
export function UncontrolledForm() {
  const { register, handleSubmit } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Uncontrolled - React Hook Form manages the value */}
      <Input {...register('email')} />
    </form>
  )
}
```

**Pros:**
- Better performance (minimal re-renders)
- Less code
- Smaller bundle size

**Cons:**
- Can't easily access value during typing
- Harder to create dependent fields

#### Controlled (When Needed)

Use controlled inputs when you need to:
- Show live character count
- Format input as user types
- Create dependent fields

```tsx
export function ControlledForm() {
  const { control, handleSubmit } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <div>
            <Input {...field} />
            <p className="text-sm text-gray-500">
              Characters: {field.value?.length || 0}
            </p>
          </div>
        )}
      />
    </form>
  )
}
```

#### When to Use Each

| Use Uncontrolled | Use Controlled |
|------------------|----------------|
| Simple forms | Live formatting (phone, credit card) |
| Login/signup | Character counters |
| Contact forms | Dependent fields |
| Search forms | Custom components (Select, DatePicker) |
| Most cases (default) | Rich text editors |

---

### 12.1.5 Form State Management

#### Accessing Form State

```tsx
export function FormWithState() {
  const {
    register,
    handleSubmit,
    formState: {
      errors,        // Validation errors
      isSubmitting,  // True while submitting
      isValid,       // True if no errors
      isDirty,       // True if form was modified
      dirtyFields,   // Which fields were modified
      touchedFields, // Which fields were focused
    }
  } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('email')} />

      <Button
        type="submit"
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>

      {isDirty && (
        <p className="text-yellow-600">You have unsaved changes</p>
      )}
    </form>
  )
}
```

#### Watching Field Values

```tsx
export function WatchExample() {
  const { register, watch } = useForm()

  // Watch single field
  const email = watch('email')

  // Watch multiple fields
  const [email, password] = watch(['email', 'password'])

  // Watch all fields
  const allFields = watch()

  return (
    <div>
      <Input {...register('email')} />
      <p>Current email: {email}</p>
    </div>
  )
}
```

---

## 12.2 Zod Schema Validation

### 12.2.1 Why Zod?

**Zod** provides type-safe schema validation with excellent TypeScript integration.

**Benefits:**
- TypeScript-first design
- Automatic type inference
- Reusable schemas
- Clear error messages
- Runtime validation
- Works seamlessly with React Hook Form

---

### 12.2.2 Schema Definition

#### Basic Schema

```tsx
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// TypeScript type is automatically inferred
type LoginFormData = z.infer<typeof loginSchema>
// Equivalent to:
// {
//   email: string
//   password: string
// }
```

#### Complex Schema

```tsx
const registrationSchema = z.object({
  // String validations
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only alphanumeric and underscore allowed'),

  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase(), // Transform to lowercase

  // Number validations
  age: z
    .number()
    .int('Age must be a whole number')
    .min(13, 'Must be at least 13 years old')
    .max(120, 'Invalid age'),

  // Optional fields
  phoneNumber: z.string().optional(),

  // Required with nullable
  middleName: z.string().nullable(),

  // Boolean
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the terms'),

  // Enum
  role: z.enum(['student', 'teacher', 'admin']),

  // Date
  birthDate: z.date().max(new Date(), 'Birth date cannot be in the future'),

  // Array
  subjects: z.array(z.string()).min(1, 'Select at least one subject'),

  // Nested object
  address: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string().regex(/^\d{4}$/, 'Invalid zip code'),
  }),
})

type RegistrationFormData = z.infer<typeof registrationSchema>
```

---

### 12.2.3 Validation Rules

#### Common Validators

```tsx
// String
z.string()
  .min(5, 'Too short')
  .max(100, 'Too long')
  .email('Invalid email')
  .url('Invalid URL')
  .uuid('Invalid UUID')
  .regex(/pattern/, 'Invalid format')
  .startsWith('prefix', 'Must start with prefix')
  .endsWith('suffix', 'Must end with suffix')
  .includes('substring', 'Must include substring')
  .trim() // Remove whitespace
  .toLowerCase() // Convert to lowercase
  .toUpperCase() // Convert to uppercase

// Number
z.number()
  .min(0, 'Must be positive')
  .max(100, 'Too large')
  .int('Must be integer')
  .positive('Must be positive')
  .negative('Must be negative')
  .nonnegative('Cannot be negative')
  .multipleOf(5, 'Must be multiple of 5')

// Date
z.date()
  .min(new Date('2000-01-01'), 'Too early')
  .max(new Date(), 'Cannot be future date')

// Array
z.array(z.string())
  .min(1, 'At least one item required')
  .max(10, 'Maximum 10 items')
  .nonempty('Cannot be empty')

// Custom validation
z.string().refine(
  (val) => val !== 'admin',
  { message: 'Username "admin" is reserved' }
)

// Async validation
z.string().refine(
  async (username) => {
    const exists = await checkUsernameExists(username)
    return !exists
  },
  { message: 'Username already taken' }
)
```

---

### 12.2.4 Integration with React Hook Form

#### Using Zod with React Hook Form

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Define schema
const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// Infer TypeScript type
type FormData = z.infer<typeof formSchema>

export function ZodForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema), // Connect Zod schema
  })

  const onSubmit = (data: FormData) => {
    // Data is validated and typed!
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('email')} />
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}

      <Input {...register('password')} type="password" />
      {errors.password && <p className="text-red-500">{errors.password.message}</p>}

      <Button type="submit">Submit</Button>
    </form>
  )
}
```

---

### 12.2.5 Advanced Schema Patterns

#### Password Confirmation

```tsx
const signupSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'], // Error shows on confirmPassword field
  }
)
```

#### Conditional Validation

```tsx
const studentSchema = z.object({
  isScholar: z.boolean(),
  scholarshipType: z.string().optional(),
}).refine(
  (data) => {
    // If scholar, scholarshipType is required
    if (data.isScholar) {
      return !!data.scholarshipType
    }
    return true
  },
  {
    message: 'Scholarship type is required for scholars',
    path: ['scholarshipType'],
  }
)
```

#### Dependent Fields

```tsx
const quizSchema = z.object({
  quizType: z.enum(['multiple-choice', 'essay']),
  choices: z.array(z.string()).optional(),
  wordLimit: z.number().optional(),
}).refine(
  (data) => {
    // If multiple-choice, choices required
    if (data.quizType === 'multiple-choice') {
      return data.choices && data.choices.length >= 2
    }
    // If essay, wordLimit required
    if (data.quizType === 'essay') {
      return !!data.wordLimit
    }
    return true
  },
  {
    message: 'Invalid quiz configuration',
  }
)
```

#### Discriminated Unions

```tsx
const assignmentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('quiz'),
    questions: z.array(z.string()),
    timeLimit: z.number(),
  }),
  z.object({
    type: z.literal('essay'),
    topic: z.string(),
    wordLimit: z.number(),
  }),
  z.object({
    type: z.literal('project'),
    description: z.string(),
    deadline: z.date(),
  }),
])
```

---

## 12.3 Form Patterns & Examples

### 12.3.1 Login Form

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      // Redirect to dashboard
      window.location.href = '/student/dashboard'
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="student@southville8b.edu"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          className={errors.password ? 'border-red-500' : ''}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  )
}
```

---

### 12.3.2 Multi-Step Form

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Step 1 schema
const step1Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
})

// Step 2 schema
const step2Schema = z.object({
  phone: z.string().regex(/^\d{11}$/, 'Invalid phone number'),
  address: z.string().min(5, 'Address is required'),
})

// Step 3 schema
const step3Schema = z.object({
  grade: z.enum(['7', '8', '9', '10']),
  section: z.string().min(1, 'Section is required'),
})

// Combined schema for final submission
const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema)

type FullFormData = z.infer<typeof fullSchema>

export function MultiStepForm() {
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FullFormData>({
    resolver: zodResolver(fullSchema),
    mode: 'onChange',
  })

  const nextStep = async () => {
    let fieldsToValidate: (keyof FullFormData)[] = []

    if (step === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'email']
    } else if (step === 2) {
      fieldsToValidate = ['phone', 'address']
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const onSubmit = async (data: FullFormData) => {
    console.log('Final submission:', data)
    // Submit to API
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded ${
              s <= step ? 'bg-school-blue' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Personal Information</h2>

            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...register('firstName')} />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...register('lastName')} />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <Button type="button" onClick={nextStep} className="w-full">
              Next
            </Button>
          </div>
        )}

        {/* Step 2: Contact Info */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Contact Information</h2>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" {...register('phone')} placeholder="09123456789" />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register('address')} />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={prevStep} variant="outline" className="flex-1">
                Back
              </Button>
              <Button type="button" onClick={nextStep} className="flex-1">
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Academic Info */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Academic Information</h2>

            <div>
              <Label htmlFor="grade">Grade Level</Label>
              <select id="grade" {...register('grade')} className="w-full border rounded p-2">
                <option value="">Select grade</option>
                <option value="7">Grade 7</option>
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
              </select>
              {errors.grade && (
                <p className="text-sm text-red-500">{errors.grade.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="section">Section</Label>
              <Input id="section" {...register('section')} />
              {errors.section && (
                <p className="text-sm text-red-500">{errors.section.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={prevStep} variant="outline" className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Submit
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
```

---

### 12.3.3 File Upload Form

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X } from 'lucide-react'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

const fileUploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  file: z
    .any()
    .refine((files) => files?.length > 0, 'File is required')
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      'File size must be less than 5MB'
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Only JPG, PNG, WebP, and PDF files are accepted'
    ),
})

type FileUploadFormData = z.infer<typeof fileUploadSchema>

export function FileUploadForm() {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FileUploadFormData>({
    resolver: zodResolver(fileUploadSchema),
  })

  const fileList = watch('file')

  // Update preview when file changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const clearFile = () => {
    setValue('file', null)
    setPreview(null)
  }

  const onSubmit = async (data: FileUploadFormData) => {
    const formData = new FormData()
    formData.append('title', data.title)
    if (data.description) formData.append('description', data.description)
    formData.append('file', data.file[0])

    try {
      // Simulate upload progress
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      console.log('Upload successful')
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title')} />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Input id="description" {...register('description')} />
      </div>

      <div>
        <Label htmlFor="file">File</Label>
        <div className="mt-2">
          {!fileList?.length ? (
            <label
              htmlFor="file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload</p>
              <p className="text-xs text-gray-500">JPG, PNG, WebP, or PDF (max 5MB)</p>
              <Input
                id="file"
                type="file"
                className="hidden"
                {...register('file')}
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="relative">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-600">{fileList[0]?.name}</p>
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={clearFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        {errors.file && (
          <p className="text-sm text-red-500 mt-1">{errors.file.message as string}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Uploading...' : 'Upload'}
      </Button>
    </form>
  )
}
```

---

### 12.3.4 Quiz Builder Form

Real-world example from the Southville 8B system:

```tsx
'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus } from 'lucide-react'

const quizQuestionSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  type: z.enum(['multiple-choice', 'true-false', 'essay']),
  choices: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  points: z.number().min(1, 'Points must be at least 1'),
})

const quizSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  timeLimit: z.number().min(1, 'Time limit must be at least 1 minute'),
  questions: z.array(quizQuestionSchema).min(1, 'At least one question required'),
})

type QuizFormData = z.infer<typeof quizSchema>

export function QuizBuilderForm() {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      questions: [
        {
          question: '',
          type: 'multiple-choice',
          choices: ['', '', '', ''],
          points: 1,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  })

  const onSubmit = (data: QuizFormData) => {
    console.log('Quiz data:', data)
    // Submit to API
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Quiz Header */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Quiz Title</Label>
          <Input id="title" {...register('title')} />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description (optional)</Label>
          <Input id="description" {...register('description')} />
        </div>

        <div>
          <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
          <Input
            id="timeLimit"
            type="number"
            {...register('timeLimit', { valueAsNumber: true })}
          />
          {errors.timeLimit && (
            <p className="text-sm text-red-500">{errors.timeLimit.message}</p>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Questions</h3>
          <Button
            type="button"
            onClick={() =>
              append({
                question: '',
                type: 'multiple-choice',
                choices: ['', '', '', ''],
                points: 1,
              })
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Question {index + 1}</h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div>
              <Label>Question Text</Label>
              <Input {...register(`questions.${index}.question`)} />
              {errors.questions?.[index]?.question && (
                <p className="text-sm text-red-500">
                  {errors.questions[index]?.question?.message}
                </p>
              )}
            </div>

            <div>
              <Label>Type</Label>
              <select
                {...register(`questions.${index}.type`)}
                className="w-full border rounded p-2"
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="essay">Essay</option>
              </select>
            </div>

            <div>
              <Label>Points</Label>
              <Input
                type="number"
                {...register(`questions.${index}.points`, { valueAsNumber: true })}
              />
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full">
        Create Quiz
      </Button>
    </form>
  )
}
```

---

## 12.4 Error Handling & UX

### 12.4.1 Field-Level Errors

#### Basic Error Display

```tsx
<div>
  <Input {...register('email')} />
  {errors.email && (
    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
  )}
</div>
```

#### Error with Icon

```tsx
import { AlertCircle } from 'lucide-react'

<div className="space-y-2">
  <Input
    {...register('email')}
    className={errors.email ? 'border-red-500' : ''}
  />
  {errors.email && (
    <div className="flex items-center gap-2 text-sm text-red-500">
      <AlertCircle className="w-4 h-4" />
      <p>{errors.email.message}</p>
    </div>
  )}
</div>
```

#### Reusable Error Component

```tsx
interface FormFieldErrorProps {
  error?: { message?: string }
}

export function FormFieldError({ error }: FormFieldErrorProps) {
  if (!error?.message) return null

  return (
    <div className="flex items-center gap-2 mt-1 text-sm text-red-500">
      <AlertCircle className="w-4 h-4" />
      <p>{error.message}</p>
    </div>
  )
}

// Usage
<div>
  <Input {...register('email')} />
  <FormFieldError error={errors.email} />
</div>
```

---

### 12.4.2 Form-Level Errors

#### Server Error Handling

```tsx
export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null)

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {serverError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Form fields */}
    </form>
  )
}
```

#### Multiple Errors

```tsx
const [errors, setErrors] = useState<string[]>([])

// Display multiple errors
{errors.length > 0 && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Please fix the following errors:</AlertTitle>
    <AlertDescription>
      <ul className="list-disc list-inside mt-2">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </AlertDescription>
  </Alert>
)}
```

---

### 12.4.3 Loading States

#### Button Loading State

```tsx
export function FormWithLoading() {
  const { handleSubmit, formState: { isSubmitting } } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit'
        )}
      </Button>
    </form>
  )
}
```

#### Full Form Loading Overlay

```tsx
export function FormWithOverlay() {
  const { handleSubmit, formState: { isSubmitting } } = useForm()

  return (
    <div className="relative">
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-school-blue" />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </div>
  )
}
```

---

### 12.4.4 Success Feedback

#### Success Message

```tsx
export function FormWithSuccess() {
  const [showSuccess, setShowSuccess] = useState(false)

  const onSubmit = async (data: FormData) => {
    // Submit logic
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div>
      {showSuccess && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your form has been submitted successfully.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </div>
  )
}
```

#### Toast Notification

```tsx
import { toast } from 'sonner'

const onSubmit = async (data: FormData) => {
  try {
    await submitForm(data)
    toast.success('Form submitted successfully!')
  } catch (error) {
    toast.error('Failed to submit form')
  }
}
```

---

### 12.4.5 Form Reset & Dirty State

#### Reset Form After Submission

```tsx
export function ResettableForm() {
  const { register, handleSubmit, reset } = useForm()

  const onSubmit = async (data: FormData) => {
    await submitForm(data)
    reset() // Clear all fields
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} />

      <div className="flex gap-2">
        <Button type="submit">Submit</Button>
        <Button type="button" variant="outline" onClick={() => reset()}>
          Clear
        </Button>
      </div>
    </form>
  )
}
```

#### Unsaved Changes Warning

```tsx
export function FormWithUnsavedWarning() {
  const { formState: { isDirty } } = useForm()

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  return (
    <form>
      {isDirty && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes.
          </AlertDescription>
        </Alert>
      )}

      {/* Form fields */}
    </form>
  )
}
```

---

## Forms Best Practices Summary

### ✅ Do

- **Use Zod schemas** for all form validation
- **Show clear error messages** with helpful guidance
- **Disable submit button** while submitting
- **Provide loading feedback** during async operations
- **Reset forms** after successful submission
- **Validate on submit** by default, on change for better UX
- **Use TypeScript types** inferred from Zod schemas
- **Handle server errors** gracefully
- **Provide success feedback** after submission
- **Warn users** about unsaved changes

### ❌ Don't

- **Don't use any type** - always use proper TypeScript types
- **Don't validate on every keystroke** - it's annoying to users
- **Don't show errors before user interaction** - wait for blur or submit
- **Don't forget loading states** - users need feedback
- **Don't ignore server errors** - always handle and display them
- **Don't use uncontrolled inputs** when you need the value during typing
- **Don't over-validate** - balance UX with security
- **Don't forget accessibility** - use proper labels and ARIA attributes

---

## Form Patterns Quick Reference

```tsx
// Basic form with Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const form = useForm({
  resolver: zodResolver(schema),
})

// Multi-step form
const nextStep = async () => {
  const isValid = await trigger(['field1', 'field2'])
  if (isValid) setStep(step + 1)
}

// File upload
const file = watch('file')
const fileUrl = file?.[0] ? URL.createObjectURL(file[0]) : null

// Dynamic fields
const { fields, append, remove } = useFieldArray({
  control,
  name: 'items',
})

// Server errors
const [serverError, setServerError] = useState<string | null>(null)
try {
  await submit()
} catch (error) {
  setServerError(error.message)
}

// Success feedback
toast.success('Submitted successfully!')
```

---

## Navigation

- [← Previous: State Management](./11-state-management.md)
- [Next: TypeScript Guidelines →](./13-typescript-guidelines.md)
- [↑ Back to Volume 3 Index](./README.md)
- [↑↑ Back to Manual Index](../README.md)
