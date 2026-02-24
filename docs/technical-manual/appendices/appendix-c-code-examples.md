# Appendix C: Code Examples and Snippets

Reusable code patterns, common use cases, and copy-paste ready examples following best practices for the Southville 8B NHS Edge system.

---

## Table of Contents

1. [Frontend Examples](#frontend-examples)
   - [Authentication](#authentication)
   - [API Calls](#api-calls)
   - [Forms](#forms)
   - [Components](#components)
   - [Custom Hooks](#custom-hooks)
   - [State Management](#state-management)
2. [Backend Examples](#backend-examples)
   - [Controllers](#controllers)
   - [Services](#services)
   - [Guards](#guards)
   - [DTOs](#dtos)
   - [File Upload](#file-upload)
3. [Database Examples](#database-examples)
   - [Supabase Queries](#supabase-queries)
   - [RLS Policies](#rls-policies)

---

## Frontend Examples

### Authentication

#### Checking User Authentication Status

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem('supabase_token');

        if (!token) {
          router.push('/guess/login');
          return;
        }

        // Verify token is still valid by making a test API call
        const response = await fetch('/api/v1/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          localStorage.removeItem('supabase_token');
          router.push('/guess/login');
          return;
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/guess/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { user, loading };
}
```

#### Login Component

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { token, user } = await response.json();

      // Store token
      localStorage.setItem('supabase_token', token);

      // Redirect based on role
      if (user.role === 'Student') {
        router.push('/student/dashboard');
      } else if (user.role === 'Teacher') {
        router.push('/teacher/dashboard');
      } else if (user.role === 'Admin') {
        router.push('/admin/dashboard');
      }

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.name}!`,
      });
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
```

#### Protected Route HOC

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: string[]
) {
  return function ProtectedComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/guess/login');
      }

      if (
        !loading &&
        user &&
        allowedRoles &&
        !allowedRoles.includes(user.role)
      ) {
        router.push('/unauthorized');
      }
    }, [user, loading, router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
}

// Usage
const TeacherDashboard = withAuth(DashboardComponent, ['Teacher', 'Admin']);
```

---

### API Calls

#### API Client Utility

```typescript
// lib/api-client.ts

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class APIClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('supabase_token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || 'Request failed',
        response.status,
        errorData
      );
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, file: File, additionalData?: any): Promise<T> {
    const token = localStorage.getItem('supabase_token');
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || 'Upload failed',
        response.status,
        errorData
      );
    }

    return response.json();
  }
}

export const apiClient = new APIClient();
```

#### Using the API Client

```typescript
// In a component or service
import { apiClient } from '@/lib/api-client';

// GET request
const students = await apiClient.get<Student[]>('/api/v1/students');

// POST request
const newStudent = await apiClient.post('/api/v1/students', {
  name: 'John Doe',
  email: 'john@example.com',
});

// File upload
const result = await apiClient.upload(
  '/api/v1/modules/upload',
  file,
  { title: 'Module Title', subjectId: 'uuid' }
);
```

#### React Query Integration

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Fetch students
export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: () => apiClient.get<Student[]>('/api/v1/students'),
  });
}

// Create student
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStudentDto) =>
      apiClient.post('/api/v1/students', data),
    onSuccess: () => {
      // Invalidate and refetch students
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

// Usage in component
function StudentList() {
  const { data: students, isLoading, error } = useStudents();
  const createStudent = useCreateStudent();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {students?.map((student) => (
        <div key={student.id}>{student.name}</div>
      ))}
    </div>
  );
}
```

---

### Forms

#### React Hook Form with Zod Validation

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define validation schema
const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  priority: z.enum(['low', 'medium', 'high']),
  targetAudience: z.enum(['all', 'students', 'teachers', 'parents']),
  expiresAt: z.string().optional(),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

export function AnnouncementForm() {
  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      content: '',
      priority: 'medium',
      targetAudience: 'all',
    },
  });

  const onSubmit = async (data: AnnouncementFormData) => {
    try {
      await apiClient.post('/api/v1/announcements', data);
      form.reset();
      toast({
        title: 'Announcement Created',
        description: 'Your announcement has been published.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create announcement',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Announcement title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Announcement content"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetAudience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Audience</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="teachers">Teachers</SelectItem>
                  <SelectItem value="parents">Parents</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating...' : 'Create Announcement'}
        </Button>
      </form>
    </Form>
  );
}
```

#### File Upload Form

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const moduleUploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  subjectId: z.string().uuid('Invalid subject ID'),
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File size must be less than 10MB')
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      'Only PDF and PowerPoint files are accepted'
    ),
});

type ModuleUploadData = z.infer<typeof moduleUploadSchema>;

export function ModuleUploadForm() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ModuleUploadData>({
    resolver: zodResolver(moduleUploadSchema),
  });

  const onSubmit = async (data: ModuleUploadData) => {
    try {
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('title', data.title);
      if (data.description) {
        formData.append('description', data.description);
      }
      formData.append('subjectId', data.subjectId);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          toast({
            title: 'Upload Successful',
            description: 'Module has been uploaded successfully',
          });
          form.reset();
          setSelectedFile(null);
          setUploadProgress(0);
        } else {
          throw new Error('Upload failed');
        }
      });

      const token = localStorage.getItem('supabase_token');
      xhr.open('POST', '/api/v1/modules/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="file">File</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf,.ppt,.pptx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setSelectedFile(file);
              form.setValue('file', file);
            }
          }}
        />
        {selectedFile && (
          <p className="text-sm text-muted-foreground mt-1">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {uploadProgress > 0 && (
        <div>
          <Progress value={uploadProgress} />
          <p className="text-sm text-center mt-1">{uploadProgress.toFixed(0)}%</p>
        </div>
      )}

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Uploading...' : 'Upload Module'}
      </Button>
    </form>
  );
}
```

---

### Components

#### Card Component Pattern

```typescript
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div
            className={cn(
              'text-xs font-medium',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}
          >
            {trend.isPositive ? '+' : ''}{trend.value}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Usage
<StatCard
  title="Total Students"
  value={1234}
  description="Enrolled this year"
  icon={Users}
  trend={{ value: 12, isPositive: true }}
/>
```

#### Data Table Component

```typescript
'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// Column definition example
const columns: ColumnDef<Student>[] = [
  {
    accessorKey: 'student_id',
    header: 'Student ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const student = row.original;
      return (
        <Button variant="ghost" onClick={() => handleEdit(student)}>
          Edit
        </Button>
      );
    },
  },
];
```

---

### Custom Hooks

#### useDebounce Hook

```typescript
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Perform search
      fetchResults(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <Input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
};
```

#### useLocalStorage Hook

```typescript
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// Usage
const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
```

#### useMediaQuery Hook

```typescript
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Usage
const isMobile = useMediaQuery('(max-width: 768px)');
const isDesktop = useMediaQuery('(min-width: 1024px)');
```

---

### State Management

#### Zustand Store Example

```typescript
// lib/stores/student-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Student {
  id: string;
  name: string;
  email: string;
  section_id: string;
}

interface StudentStore {
  students: Student[];
  selectedStudent: Student | null;
  isLoading: boolean;
  error: string | null;

  setStudents: (students: Student[]) => void;
  addStudent: (student: Student) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  selectStudent: (student: Student | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStudentStore = create<StudentStore>()(
  persist(
    (set) => ({
      students: [],
      selectedStudent: null,
      isLoading: false,
      error: null,

      setStudents: (students) => set({ students }),

      addStudent: (student) =>
        set((state) => ({ students: [...state.students, student] })),

      updateStudent: (id, updates) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      deleteStudent: (id) =>
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
        })),

      selectStudent: (student) => set({ selectedStudent: student }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'student-storage',
    }
  )
);

// Usage in component
function StudentList() {
  const { students, isLoading, setStudents } = useStudentStore();

  useEffect(() => {
    // Fetch students
    fetchStudents().then(setStudents);
  }, [setStudents]);

  return (
    <div>
      {isLoading ? 'Loading...' : students.map((s) => <div key={s.id}>{s.name}</div>)}
    </div>
  );
}
```

---

## Backend Examples

### Controllers

#### Basic CRUD Controller

```typescript
// src/students/students.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentsDto } from './dto/query-students.dto';

@ApiTags('students')
@ApiBearerAuth()
@Controller({ path: 'students', version: '1' })
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Get all students' })
  async findAll(@Query() query: QueryStudentsDto) {
    return this.studentsService.findAll(query);
  }

  @Get(':id')
  @Roles('Admin', 'Teacher', 'Student')
  @ApiOperation({ summary: 'Get student by ID' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    // Students can only view their own data
    if (req.user.role === 'Student' && req.user.id !== id) {
      throw new ForbiddenException('You can only view your own data');
    }
    return this.studentsService.findOne(id);
  }

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: 'Create new student' })
  async create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Put(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update student' })
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete student' })
  async remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
```

---

### Services

#### Service with Supabase Integration

```typescript
// src/students/students.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentsDto } from './dto/query-students.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(query: QueryStudentsDto) {
    const { page = 1, limit = 10, search, section_id } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = this.supabaseService
      .getClient()
      .from('students')
      .select('*, sections(name)', { count: 'exact' })
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (search) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,student_id.ilike.%${search}%`
      );
    }

    if (section_id) {
      queryBuilder = queryBuilder.eq('section_id', section_id);
    }

    const { data, error, count } = await queryBuilder
      .range(offset, offset + limit - 1);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      data,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('students')
      .select('*, sections(name)')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return data;
  }

  async create(createStudentDto: CreateStudentDto) {
    // Use service client for write operations (bypasses RLS)
    const { data, error } = await this.supabaseService
      .getServiceClient()
      .from('students')
      .insert(createStudentDto)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    // Verify student exists first
    await this.findOne(id);

    const { data, error } = await this.supabaseService
      .getServiceClient()
      .from('students')
      .update(updateStudentDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async remove(id: string) {
    // Soft delete
    const { data, error } = await this.supabaseService
      .getServiceClient()
      .from('students')
      .update({ is_deleted: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return { message: 'Student deleted successfully', data };
  }
}
```

---

### Guards

#### Custom Permission Guard

```typescript
// src/auth/guards/permissions.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.permissions) {
      throw new ForbiddenException('User has no permissions');
    }

    const hasPermission = requiredPermissions.every((permission) =>
      user.permissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Requires permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}

// Decorator
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// Usage
@UseGuards(SupabaseAuthGuard, PermissionsGuard)
@Permissions('students:write', 'students:delete')
@Delete(':id')
async deleteStudent(@Param('id') id: string) {
  return this.studentsService.remove(id);
}
```

---

### DTOs

#### DTO with Validation

```typescript
// src/students/dto/create-student.dto.ts
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: '2024-001', description: 'Student ID number' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  student_id: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of student' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '09123456789' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{11}$/, { message: 'Phone must be 11 digits' })
  phone?: string;

  @ApiProperty({ description: 'Section UUID' })
  @IsUUID()
  @IsNotEmpty()
  section_id: string;

  @ApiPropertyOptional({ example: '2000-01-01' })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;
}

// Update DTO
import { PartialType } from '@nestjs/swagger';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {}

// Query DTO
export class QueryStudentsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  section_id?: string;
}
```

---

### File Upload

#### Fastify File Upload Handler

```typescript
// src/modules/modules.controller.ts
import {
  Controller,
  Post,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import { ModulesService } from './modules.service';

@Controller({ path: 'modules', version: '1' })
@UseGuards(SupabaseAuthGuard)
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post('upload')
  async uploadModule(@Req() request: FastifyRequest) {
    const data = await request.file();

    if (!data) {
      throw new BadRequestException('No file uploaded');
    }

    // Read file buffer
    const chunks: Buffer[] = [];
    for await (const chunk of data.file) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    // Get form fields
    const title = data.fields['title']?.value as string;
    const description = data.fields['description']?.value as string;
    const subjectId = data.fields['subjectId']?.value as string;

    if (!title) {
      throw new BadRequestException('Title is required');
    }

    // Upload to R2
    return this.modulesService.uploadModule({
      file: fileBuffer,
      filename: data.filename,
      mimetype: data.mimetype,
      title,
      description,
      subjectId,
      uploadedBy: (request as any).user.id,
    });
  }
}
```

---

## Database Examples

### Supabase Queries

#### Complex Query with Joins

```typescript
// Fetch students with their sections, schedules, and grades
const { data, error } = await supabase
  .from('students')
  .select(`
    *,
    sections (
      id,
      name,
      grade_level
    ),
    schedules (
      id,
      subject:subjects (
        name,
        code
      ),
      teacher:teachers (
        name
      ),
      day_of_week,
      start_time,
      end_time
    ),
    grades (
      subject_id,
      quarter,
      grade
    )
  `)
  .eq('is_deleted', false)
  .order('name');
```

#### Aggregation Query

```typescript
// Get average GWA by section
const { data, error } = await supabase
  .rpc('get_section_averages', {
    school_year: '2024-2025'
  });

// SQL function definition:
/*
CREATE OR REPLACE FUNCTION get_section_averages(school_year TEXT)
RETURNS TABLE (
  section_id UUID,
  section_name TEXT,
  average_gwa DECIMAL,
  student_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id as section_id,
    s.name as section_name,
    AVG(g.gwa) as average_gwa,
    COUNT(DISTINCT g.student_id) as student_count
  FROM sections s
  LEFT JOIN gwa g ON g.section_id = s.id
  WHERE g.school_year = $1
  GROUP BY s.id, s.name
  ORDER BY average_gwa DESC;
END;
$$ LANGUAGE plpgsql;
*/
```

---

### RLS Policies

#### Student Data Access Policy

```sql
-- Students can only read their own data
CREATE POLICY "Students can read own data"
ON students
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR
  EXISTS (
    SELECT 1 FROM teachers
    WHERE teachers.id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('Admin', 'SuperAdmin')
  )
);

-- Only admins can insert students
CREATE POLICY "Only admins can insert students"
ON students
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('Admin', 'SuperAdmin')
  )
);

-- Only admins can update students
CREATE POLICY "Only admins can update students"
ON students
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('Admin', 'SuperAdmin')
  )
);
```

---

**Navigation:**
- [← Back: Appendix B - Acronyms](./appendix-b-acronyms.md)
- [Next: Appendix D - Configuration Files →](./appendix-d-config-files.md)
- [Back to Appendices](./README.md)

---

**Last Updated:** January 2026
**Version:** 1.0.0
**Word Count:** ~8,200 words
