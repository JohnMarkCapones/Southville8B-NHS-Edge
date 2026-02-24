# 13. TypeScript Guidelines

**Last Updated:** January 10, 2026
**Status:** ✅ Complete

---

## Table of Contents

- [13.1 TypeScript Configuration](#131-typescript-configuration)
- [13.2 Type Safety Best Practices](#132-type-safety-best-practices)
- [13.3 Common Patterns & Conventions](#133-common-patterns--conventions)
- [13.4 Advanced TypeScript Features](#134-advanced-typescript-features)
- [13.5 Type Organization](#135-type-organization)

---

## 13.1 TypeScript Configuration

### 13.1.1 Project Configuration

The project uses **TypeScript 5.x** with Next.js 15 optimizations configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    // Language Features
    "target": "ES2017",                    // Modern JavaScript features
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",                     // Next.js handles JSX transformation
    "module": "esnext",
    "moduleResolution": "bundler",         // Next.js 15 module resolution

    // Type Checking
    "strict": true,                        // Enable all strict type-checking options
    "noUncheckedIndexedAccess": true,      // Index signatures require undefined check
    "noImplicitAny": true,                 // Error on implicit any
    "strictNullChecks": true,              // Null and undefined are distinct
    "strictFunctionTypes": true,           // Strict function type checking
    "strictBindCallApply": true,           // Strict bind/call/apply
    "strictPropertyInitialization": true,  // Class properties must be initialized
    "noImplicitThis": true,                // Error on 'this' with implicit 'any'
    "alwaysStrict": true,                  // Parse in strict mode

    // Linting
    "noUnusedLocals": true,                // Error on unused local variables
    "noUnusedParameters": true,            // Error on unused parameters
    "noImplicitReturns": true,             // Error on code paths without return
    "noFallthroughCasesInSwitch": true,    // Error on fallthrough cases
    "forceConsistentCasingInFileNames": true,

    // Module Resolution
    "resolveJsonModule": true,             // Import JSON files
    "isolatedModules": true,               // Each file can be transpiled independently
    "allowImportingTsExtensions": true,    // Import .ts files directly
    "esModuleInterop": true,               // CommonJS/ES6 interop
    "skipLibCheck": true,                  // Skip type checking of .d.ts files

    // Output
    "noEmit": true,                        // Next.js handles compilation
    "incremental": true,                   // Incremental compilation

    // Path Mapping
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],                  // Absolute imports from src/
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"]
    },

    // Next.js specific
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### 13.1.2 Key Configuration Options Explained

#### Strict Mode Options

```typescript
// strict: true enables ALL of these:

// 1. noImplicitAny - No implicit 'any' types
function greet(name: string) {  // ✅ Explicit type
  return `Hello, ${name}!`
}

function greet(name) {  // ❌ Error: Parameter 'name' has implicit 'any'
  return `Hello, ${name}!`
}

// 2. strictNullChecks - Null/undefined must be explicitly handled
function getLength(str: string): number {
  return str.length  // ✅ Safe
}

function getLength(str: string | null): number {
  return str.length  // ❌ Error: Object is possibly 'null'
}

function getLength(str: string | null): number {
  return str?.length ?? 0  // ✅ Safe with null check
}

// 3. strictFunctionTypes - Contravariance for function parameters
interface Animal { name: string }
interface Dog extends Animal { breed: string }

let assignAnimal: (animal: Animal) => void
let assignDog: (dog: Dog) => void

assignAnimal = assignDog  // ❌ Error with strictFunctionTypes
assignDog = assignAnimal  // ✅ OK

// 4. noImplicitThis - 'this' context must be typed
function setName(name: string) {
  this.name = name  // ❌ Error: 'this' implicitly has type 'any'
}

function setName(this: { name: string }, name: string) {
  this.name = name  // ✅ Explicit 'this' type
}
```

#### Module Resolution

```typescript
// baseUrl and paths enable absolute imports

// ❌ Relative imports (hard to maintain)
import { Button } from '../../../components/ui/button'
import { formatDate } from '../../../lib/utils'

// ✅ Absolute imports (clean and maintainable)
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
```

---

## 13.2 Type Safety Best Practices

### 13.2.1 Avoid `any` Type

The `any` type defeats the purpose of TypeScript. **Always use proper types.**

#### ❌ Bad Examples

```typescript
// Generic 'any' - loses all type safety
function processData(data: any) {
  return data.map((item: any) => item.value)
}

// Implicit 'any' in catch blocks
try {
  // ...
} catch (error) {  // Error is 'any' by default
  console.error(error.message)  // Unsafe
}

// 'any' in event handlers
function handleClick(event: any) {
  console.log(event.target.value)
}
```

#### ✅ Good Examples

```typescript
// Use proper types
interface DataItem {
  value: string
  id: number
}

function processData(data: DataItem[]) {
  return data.map((item) => item.value)
}

// Type errors in catch blocks
try {
  // ...
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message)  // Safe
  } else {
    console.error('Unknown error', error)
  }
}

// Typed event handlers
function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
  console.log(event.currentTarget.value)
}
```

#### When `unknown` is Better

```typescript
// Use 'unknown' when you don't know the type
function processResponse(response: unknown) {
  // Must narrow type before use
  if (typeof response === 'object' && response !== null) {
    if ('data' in response) {
      return response.data
    }
  }
  throw new Error('Invalid response')
}

// Type guard for API responses
function isValidUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data &&
    typeof (data as User).email === 'string'
  )
}

const response: unknown = await fetchUser()
if (isValidUser(response)) {
  console.log(response.email)  // Safe - type narrowed to User
}
```

---

### 13.2.2 Use Type Inference

TypeScript's type inference is powerful. **Don't over-annotate.**

#### ❌ Unnecessary Type Annotations

```typescript
// Redundant - type is obvious
const count: number = 5
const isActive: boolean = true
const name: string = 'John'
const items: string[] = ['a', 'b', 'c']

// Function return type is inferred
function add(a: number, b: number): number {
  return a + b
}
```

#### ✅ Let TypeScript Infer

```typescript
// Type inferred as number
const count = 5

// Type inferred as boolean
const isActive = true

// Type inferred as string
const name = 'John'

// Type inferred as string[]
const items = ['a', 'b', 'c']

// Return type inferred as number
function add(a: number, b: number) {
  return a + b
}
```

#### When to Add Explicit Types

```typescript
// 1. Function parameters - ALWAYS type these
function greet(name: string, age: number) {
  return `${name} is ${age} years old`
}

// 2. Empty arrays - need explicit type
const students: Student[] = []  // Can't infer from empty array

// 3. Complex object types - for clarity
const config: AppConfiguration = {
  apiUrl: process.env.API_URL,
  timeout: 5000,
  retries: 3,
}

// 4. Public API boundaries - explicit return types
export function calculateGrade(score: number): Grade {
  // Implementation
}

// 5. When inference is wrong or ambiguous
const value = getSomeValue() as string  // Override inference
```

---

### 13.2.3 Null and Undefined Handling

With `strictNullChecks` enabled, handle null/undefined explicitly.

#### Optional Properties vs Null vs Undefined

```typescript
interface Student {
  id: string
  name: string
  email?: string           // May be undefined (not provided)
  middleName: string | null  // May be null (explicitly no value)
  phone: string | undefined  // Same as optional, but explicit
}

// Using optional properties
const student1: Student = {
  id: '1',
  name: 'John',
  middleName: null,
  // email is omitted - that's OK
}

// Accessing optional properties
function getEmail(student: Student): string {
  return student.email ?? 'No email provided'  // Safe with ??
}
```

#### Null Checks

```typescript
// ❌ Unsafe
function getLength(str: string | null): number {
  return str.length  // Error: Object is possibly 'null'
}

// ✅ Safe with optional chaining
function getLength(str: string | null): number {
  return str?.length ?? 0
}

// ✅ Safe with explicit check
function getLength(str: string | null): number {
  if (str === null) {
    return 0
  }
  return str.length
}

// ✅ Safe with type guard
function getLength(str: string | null): number {
  if (!str) return 0
  return str.length
}
```

#### Nullish Coalescing

```typescript
// ❌ Using || (treats 0, '', false as falsy)
const count = user.score || 0  // Wrong if score is 0

// ✅ Using ?? (only null/undefined are nullish)
const count = user.score ?? 0  // Correct - only replaces null/undefined

// Examples
const value1 = null ?? 'default'      // 'default'
const value2 = undefined ?? 'default' // 'default'
const value3 = 0 ?? 'default'         // 0 (not replaced!)
const value4 = '' ?? 'default'        // '' (not replaced!)
const value5 = false ?? 'default'     // false (not replaced!)
```

---

### 13.2.4 Array Type Safety

```typescript
// ❌ Unsafe array access
function getFirstStudent(students: Student[]): Student {
  return students[0]  // Error with noUncheckedIndexedAccess
}

// ✅ Safe array access
function getFirstStudent(students: Student[]): Student | undefined {
  return students[0]  // Returns Student | undefined
}

// ✅ With assertion
function getFirstStudent(students: Student[]): Student {
  const first = students[0]
  if (!first) {
    throw new Error('No students found')
  }
  return first
}

// ✅ Using Array methods
function getFirstStudent(students: Student[]): Student | undefined {
  return students.at(0)  // Built-in safe access
}
```

---

## 13.3 Common Patterns & Conventions

### 13.3.1 Component Props Typing

```typescript
// ✅ Interface with Props suffix
interface StudentCardProps {
  student: Student
  onEdit?: (id: string) => void
  className?: string
}

export function StudentCard({ student, onEdit, className }: StudentCardProps) {
  // Implementation
}

// ✅ With children
interface CardProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={className}>
      <h2>{title}</h2>
      {children}
    </div>
  )
}

// ✅ Generic props
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}
```

### 13.3.2 API Response Typing

```typescript
// Base response type
interface ApiResponse<T> {
  data: T
  error: string | null
  status: number
}

// Success response
interface SuccessResponse<T> extends ApiResponse<T> {
  data: T
  error: null
  status: 200
}

// Error response
interface ErrorResponse extends ApiResponse<null> {
  data: null
  error: string
  status: number
}

// Type guard
function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is SuccessResponse<T> {
  return response.error === null && response.data !== null
}

// Usage
async function fetchStudent(id: string): Promise<Student> {
  const response: ApiResponse<Student> = await fetch(`/api/students/${id}`)
    .then(res => res.json())

  if (isSuccessResponse(response)) {
    return response.data  // Type: Student
  }

  throw new Error(response.error)  // Type: string
}
```

### 13.3.3 Event Handler Typing

```typescript
// Form events
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault()
  // ...
}

// Input events
function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  const value = event.target.value
  // ...
}

// Click events
function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
  console.log(event.currentTarget.name)
  // ...
}

// Keyboard events
function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') {
    // ...
  }
}

// Generic handler with specific element
type InputChangeHandler = React.ChangeEventHandler<HTMLInputElement>

const handleChange: InputChangeHandler = (event) => {
  console.log(event.target.value)
}
```

### 13.3.4 Zustand Store Typing

```typescript
import { create } from 'zustand'

// Define state interface
interface SidebarState {
  isOpen: boolean
  toggle: () => void
  setOpen: (open: boolean) => void
  close: () => void
}

// Create typed store
export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  close: () => set({ isOpen: false }),
}))

// With immer middleware
import { immer } from 'zustand/middleware/immer'

interface TodoState {
  todos: Todo[]
  addTodo: (todo: Todo) => void
  removeTodo: (id: string) => void
}

export const useTodoStore = create<TodoState>()(
  immer((set) => ({
    todos: [],
    addTodo: (todo) =>
      set((state) => {
        state.todos.push(todo)
      }),
    removeTodo: (id) =>
      set((state) => {
        state.todos = state.todos.filter((t) => t.id !== id)
      }),
  }))
)
```

### 13.3.5 Custom Hook Typing

```typescript
// Simple custom hook
function useToggle(initialValue = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback(() => setValue(v => !v), [])
  return [value, toggle]
}

// With explicit return type
interface UseCounterReturn {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

function useCounter(initialCount = 0): UseCounterReturn {
  const [count, setCount] = useState(initialCount)

  const increment = useCallback(() => setCount(c => c + 1), [])
  const decrement = useCallback(() => setCount(c => c - 1), [])
  const reset = useCallback(() => setCount(initialCount), [initialCount])

  return { count, increment, decrement, reset }
}

// Generic hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initialValue
  })

  const updateValue = useCallback((newValue: T) => {
    setValue(newValue)
    localStorage.setItem(key, JSON.stringify(newValue))
  }, [key])

  return [value, updateValue] as const
}

// Usage
const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light')
```

---

## 13.4 Advanced TypeScript Features

### 13.4.1 Utility Types

TypeScript provides built-in utility types for common transformations.

#### Partial & Required

```typescript
interface Student {
  id: string
  name: string
  email: string
  phone: string
}

// Make all properties optional
type PartialStudent = Partial<Student>
// { id?: string; name?: string; email?: string; phone?: string }

// Usage: Update operations
function updateStudent(id: string, updates: Partial<Student>) {
  // Only need to provide fields to update
}

updateStudent('123', { email: 'new@email.com' })  // ✅ OK

// Make all properties required
interface PartialConfig {
  apiUrl?: string
  timeout?: number
}

type CompleteConfig = Required<PartialConfig>
// { apiUrl: string; timeout: number }
```

#### Pick & Omit

```typescript
interface Student {
  id: string
  name: string
  email: string
  password: string
  createdAt: Date
}

// Pick specific properties
type StudentPreview = Pick<Student, 'id' | 'name' | 'email'>
// { id: string; name: string; email: string }

// Omit specific properties
type StudentWithoutPassword = Omit<Student, 'password'>
// { id: string; name: string; email: string; createdAt: Date }

// Usage: API responses
interface ApiStudent extends Omit<Student, 'password'> {
  // All Student properties except password
}
```

#### Record

```typescript
// Create object type with specific keys
type Role = 'student' | 'teacher' | 'admin'

type Permissions = Record<Role, string[]>
// {
//   student: string[]
//   teacher: string[]
//   admin: string[]
// }

const permissions: Permissions = {
  student: ['read:courses', 'submit:assignments'],
  teacher: ['read:courses', 'write:courses', 'grade:assignments'],
  admin: ['read:*', 'write:*', 'delete:*'],
}

// Dynamic keys
type StudentGrades = Record<string, number>

const grades: StudentGrades = {
  'Math': 95,
  'Science': 88,
  'English': 92,
}
```

#### ReturnType & Parameters

```typescript
// Extract return type from function
function getStudent(id: string) {
  return {
    id,
    name: 'John Doe',
    email: 'john@example.com',
  }
}

type Student = ReturnType<typeof getStudent>
// { id: string; name: string; email: string }

// Extract parameter types
function createStudent(name: string, email: string, age: number) {
  // ...
}

type CreateStudentParams = Parameters<typeof createStudent>
// [name: string, email: string, age: number]

// Get first parameter
type FirstParam = Parameters<typeof createStudent>[0]
// string
```

---

### 13.4.2 Conditional Types

```typescript
// Basic conditional type
type IsString<T> = T extends string ? true : false

type A = IsString<string>  // true
type B = IsString<number>  // false

// Practical example: Non-nullable type
type NonNullable<T> = T extends null | undefined ? never : T

type C = NonNullable<string | null>  // string
type D = NonNullable<number | undefined>  // number

// Extract array element type
type ArrayElement<T> = T extends (infer U)[] ? U : never

type E = ArrayElement<string[]>  // string
type F = ArrayElement<number[]>  // number

// Async function return type
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

async function fetchStudent() {
  return { id: '1', name: 'John' }
}

type StudentData = UnwrapPromise<ReturnType<typeof fetchStudent>>
// { id: string; name: string }
```

---

### 13.4.3 Mapped Types

```typescript
// Make all properties readonly
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

interface Student {
  id: string
  name: string
}

type ReadonlyStudent = Readonly<Student>
// {
//   readonly id: string
//   readonly name: string
// }

// Make all properties optional (how Partial is implemented)
type Partial<T> = {
  [P in keyof T]?: T[P]
}

// Add prefix to keys
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}${Capitalize<string & K>}`]: T[K]
}

interface User {
  name: string
  age: number
}

type PrefixedUser = Prefixed<User, 'user'>
// {
//   userName: string
//   userAge: number
// }

// Filter properties by type
type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P]
}

interface MixedTypes {
  id: number
  name: string
  age: number
  email: string
}

type StringProperties = PickByType<MixedTypes, string>
// {
//   name: string
//   email: string
// }
```

---

### 13.4.4 Template Literal Types

```typescript
// String manipulation in types
type Greeting = `Hello, ${string}!`

const greet1: Greeting = 'Hello, World!'  // ✅ OK
const greet2: Greeting = 'Hi there'       // ❌ Error

// Combine with unions
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type ApiRoute = '/users' | '/posts' | '/comments'

type ApiEndpoint = `${HttpMethod} ${ApiRoute}`
// 'GET /users' | 'GET /posts' | 'GET /comments' |
// 'POST /users' | 'POST /posts' | ...

// CSS properties
type CSSProperty =
  | 'color'
  | 'background-color'
  | 'font-size'
  | 'margin'
  | 'padding'

type CSSValue = `${number}px` | `${number}%` | `${number}rem`

interface Styles {
  [K: CSSProperty]: string | CSSValue
}

const styles: Styles = {
  color: '#000',
  'font-size': '16px',  // ✅ OK
  margin: '2rem',       // ✅ OK
}

// Event names
type EventName<T extends string> = `on${Capitalize<T>}`

type ClickEvent = EventName<'click'>     // 'onClick'
type ChangeEvent = EventName<'change'>   // 'onChange'
type SubmitEvent = EventName<'submit'>   // 'onSubmit'
```

---

### 13.4.5 Type Guards & Narrowing

```typescript
// typeof type guard
function processValue(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase()  // TypeScript knows it's string
  } else {
    return value.toFixed(2)  // TypeScript knows it's number
  }
}

// instanceof type guard
class Student {
  constructor(public name: string) {}
  study() { /* ... */ }
}

class Teacher {
  constructor(public name: string) {}
  teach() { /* ... */ }
}

function greet(person: Student | Teacher) {
  if (person instanceof Student) {
    person.study()  // TypeScript knows it's Student
  } else {
    person.teach()  // TypeScript knows it's Teacher
  }
}

// Custom type guard
interface Student {
  type: 'student'
  grade: number
}

interface Teacher {
  type: 'teacher'
  subject: string
}

type Person = Student | Teacher

function isStudent(person: Person): person is Student {
  return person.type === 'student'
}

function getInfo(person: Person) {
  if (isStudent(person)) {
    return `Grade: ${person.grade}`  // TypeScript knows it's Student
  } else {
    return `Subject: ${person.subject}`  // TypeScript knows it's Teacher
  }
}

// Discriminated unions
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; size: number }
  | { kind: 'rectangle'; width: number; height: number }

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2  // radius is available
    case 'square':
      return shape.size ** 2  // size is available
    case 'rectangle':
      return shape.width * shape.height  // width and height available
  }
}
```

---

## 13.5 Type Organization

### 13.5.1 File Structure

```
types/
├── index.ts              # Export all types
├── student.ts            # Student-related types
├── teacher.ts            # Teacher-related types
├── quiz.ts               # Quiz-related types
├── assignment.ts         # Assignment-related types
└── api.ts                # API response types
```

### 13.5.2 Type File Example

```typescript
// types/student.ts

/**
 * Student entity from database
 */
export interface Student {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  grade_level: number
  section_id: string | null
  created_at: string
  updated_at: string
}

/**
 * Student data for display (snake_case to camelCase)
 */
export interface StudentDisplay {
  id: string
  userId: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  gradeLevel: number
  sectionId: string | null
}

/**
 * Create student DTO
 */
export interface CreateStudentDto {
  firstName: string
  lastName: string
  email: string
  gradeLevel: number
  sectionId?: string
}

/**
 * Update student DTO (all fields optional)
 */
export type UpdateStudentDto = Partial<CreateStudentDto>

/**
 * Student with section information
 */
export interface StudentWithSection extends Student {
  section: {
    id: string
    name: string
    grade_level: number
  } | null
}

/**
 * Student grade information
 */
export interface StudentGrade {
  studentId: string
  subjectId: string
  subjectName: string
  grade: number
  remarks: string
}

/**
 * Student statistics
 */
export interface StudentStats {
  totalStudents: number
  activeStudents: number
  byGradeLevel: Record<number, number>
  averageGPA: number
}
```

### 13.5.3 Barrel Exports

```typescript
// types/index.ts

// Student types
export type {
  Student,
  StudentDisplay,
  CreateStudentDto,
  UpdateStudentDto,
  StudentWithSection,
  StudentGrade,
  StudentStats,
} from './student'

// Teacher types
export type {
  Teacher,
  TeacherDisplay,
  CreateTeacherDto,
  UpdateTeacherDto,
} from './teacher'

// Quiz types
export type {
  Quiz,
  QuizQuestion,
  QuizAnswer,
  QuizResult,
} from './quiz'

// API types
export type {
  ApiResponse,
  SuccessResponse,
  ErrorResponse,
  PaginatedResponse,
} from './api'
```

Usage:
```typescript
// Single import for all types
import type { Student, Teacher, Quiz } from '@/types'
```

---

## TypeScript Best Practices Summary

### ✅ Do

- **Use strict mode** - Enable all strict type checking options
- **Type function parameters** - Always explicitly type parameters
- **Avoid `any`** - Use `unknown` or proper types instead
- **Use type inference** - Let TypeScript infer when obvious
- **Handle null/undefined** - Use optional chaining and nullish coalescing
- **Create type guards** - For discriminating union types
- **Use utility types** - `Partial`, `Pick`, `Omit`, `Record`, etc.
- **Organize types in separate files** - Keep types modular
- **Document complex types** - Add JSDoc comments
- **Use const assertions** - For readonly objects and tuples

### ❌ Don't

- **Don't use `any`** - It defeats TypeScript's purpose
- **Don't over-annotate** - Trust type inference when appropriate
- **Don't use `@ts-ignore`** - Fix the type error instead
- **Don't use type assertions carelessly** - Only when you know better than TypeScript
- **Don't make everything optional** - Be explicit about what's required
- **Don't use `Function` type** - Use proper function signatures
- **Don't ignore compiler errors** - They exist for a reason
- **Don't use `Object` or `{}` types** - Use proper interfaces/types

---

## Common TypeScript Patterns Quick Reference

```typescript
// 1. Component Props
interface Props {
  children: React.ReactNode
  onClick?: () => void
}

// 2. API Response
interface ApiResponse<T> {
  data: T
  error: string | null
}

// 3. Event Handler
const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {}

// 4. Zustand Store
interface Store {
  count: number
  increment: () => void
}
const useStore = create<Store>((set) => ({}))

// 5. Custom Hook
function useCustom<T>(initial: T): [T, (value: T) => void] {
  // ...
}

// 6. Type Guard
function isType(value: unknown): value is Type {
  return typeof value === 'object' && value !== null && 'prop' in value
}

// 7. Discriminated Union
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; size: number }

// 8. Generic Component
function List<T>({ items }: { items: T[] }) {}
```

---

## Navigation

- [← Previous: Forms & Validation](./12-forms-validation.md)
- [Next: Code Quality & Testing →](./14-code-quality-testing.md)
- [↑ Back to Volume 3 Index](./README.md)
- [↑↑ Back to Manual Index](../README.md)
