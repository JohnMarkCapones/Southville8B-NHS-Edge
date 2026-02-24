# 17. Supabase Integration

**Last Updated:** January 10, 2026
**Status:** ✅ Complete

---

## Table of Contents

- [17.1 Supabase Setup](#171-supabase-setup)
- [17.2 Client Configuration](#172-client-configuration)
- [17.3 Database Operations](#173-database-operations)
- [17.4 Real-time Features](#174-real-time-features)
- [17.5 Authentication](#175-authentication)

---

## 17.1 Supabase Setup

### 17.1.1 Project Configuration

#### Environment Variables

```bash
# .env.local (Next.js Frontend)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# .env (NestJS Backend)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Critical:**
- `NEXT_PUBLIC_*` variables are exposed to the browser
- Never expose `SERVICE_ROLE_KEY` to frontend
- Service role key bypasses all RLS policies

---

### 17.1.2 Database Schema

#### Core Tables

```sql
-- Users are managed by Supabase Auth
-- auth.users table is automatic

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  grade_level INTEGER CHECK (grade_level BETWEEN 7 AND 10),
  section_id UUID REFERENCES sections(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sections table
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  school_year TEXT NOT NULL,
  adviser_id UUID REFERENCES teachers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  subject_id UUID REFERENCES subjects(id),
  teacher_id UUID REFERENCES teachers(id),
  section_id UUID REFERENCES sections(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grades table
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id),
  quarter INTEGER CHECK (quarter BETWEEN 1 AND 4),
  score DECIMAL(5,2) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### 17.1.3 Row-Level Security Policies

#### Students Table RLS

```sql
-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Students can view their own data
CREATE POLICY "students_select_own"
ON students FOR SELECT
USING (auth.uid() = user_id);

-- Students can update their own data (limited fields)
CREATE POLICY "students_update_own"
ON students FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND user_id = OLD.user_id  -- Can't change user_id
);

-- Teachers can view students in their sections
CREATE POLICY "teachers_select_students"
ON students FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM teachers t
    JOIN sections s ON s.adviser_id = t.id
    WHERE t.user_id = auth.uid()
    AND s.id = students.section_id
  )
);

-- Admins can view all students
CREATE POLICY "admins_select_all"
ON students FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
);

-- Service role can do anything (bypasses RLS)
-- No policy needed - service role key bypasses RLS
```

#### Grades Table RLS

```sql
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Students can view their own grades
CREATE POLICY "students_view_own_grades"
ON grades FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM students
    WHERE students.id = grades.student_id
    AND students.user_id = auth.uid()
  )
);

-- Teachers can view grades for their subjects
CREATE POLICY "teachers_view_subject_grades"
ON grades FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM assignments a
    WHERE a.subject_id = grades.subject_id
    AND a.teacher_id IN (
      SELECT id FROM teachers WHERE user_id = auth.uid()
    )
  )
);

-- Teachers can insert/update grades for their subjects
CREATE POLICY "teachers_manage_grades"
ON grades FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM assignments a
    WHERE a.subject_id = grades.subject_id
    AND a.teacher_id IN (
      SELECT id FROM teachers WHERE user_id = auth.uid()
    )
  )
);
```

---

## 17.2 Client Configuration

### 17.2.1 Server-Side Client (Next.js)

Used in Server Components for data fetching during SSR.

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component can't set cookies
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component can't remove cookies
          }
        },
      },
    }
  )
}
```

**Usage in Server Component:**

```typescript
// app/student/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createClient()

  // Get authenticated user
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/guess/login')
  }

  // Fetch student data (RLS automatically filters)
  const { data: student } = await supabase
    .from('students')
    .select('*, sections(*)')
    .eq('user_id', user.id)
    .single()

  return (
    <div>
      <h1>Welcome, {student?.first_name}!</h1>
      <p>Section: {student?.sections?.name}</p>
    </div>
  )
}
```

---

### 17.2.2 Client-Side Client (Next.js)

Used in Client Components for interactive features.

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Usage in Client Component:**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function GradesList() {
  const [grades, setGrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchGrades() {
      const { data } = await supabase
        .from('grades')
        .select('*, subjects(name)')
        .order('created_at', { ascending: false })

      setGrades(data || [])
      setLoading(false)
    }

    fetchGrades()
  }, [supabase])

  if (loading) return <div>Loading...</div>

  return (
    <ul>
      {grades.map((grade) => (
        <li key={grade.id}>
          {grade.subjects.name}: {grade.score}
        </li>
      ))}
    </ul>
  )
}
```

---

### 17.2.3 Service Role Client (NestJS Backend)

Used in backend for admin operations that bypass RLS.

```typescript
// nestjs-backend/src/supabase/supabase.service.ts
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient
  private supabaseServiceRole: SupabaseClient

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY')
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')

    // Regular client (RLS-protected)
    this.supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Service role client (bypasses RLS)
    this.supabaseServiceRole = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }

  // Get RLS-protected client
  getClient(): SupabaseClient {
    return this.supabase
  }

  // Get service role client (bypasses RLS)
  getServiceClient(): SupabaseClient {
    return this.supabaseServiceRole
  }
}
```

**Usage in NestJS Service:**

```typescript
// students.service.ts
import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class StudentsService {
  constructor(private supabaseService: SupabaseService) {}

  // Read with RLS (only returns accessible data)
  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('students')
      .select('*')

    if (error) throw error
    return data
  }

  // Write with service role (bypasses RLS)
  async create(createStudentDto: CreateStudentDto) {
    const { data, error } = await this.supabaseService
      .getServiceClient()  // ← Use service client for writes!
      .from('students')
      .insert(createStudentDto)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
```

---

## 17.3 Database Operations

### 17.3.1 CRUD Operations

#### Create (INSERT)

```typescript
// Single insert
const { data, error } = await supabase
  .from('students')
  .insert({
    user_id: userId,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@school.edu',
    grade_level: 8
  })
  .select()
  .single()

// Multiple inserts
const { data, error } = await supabase
  .from('students')
  .insert([
    { first_name: 'John', last_name: 'Doe', email: 'john@school.edu' },
    { first_name: 'Jane', last_name: 'Smith', email: 'jane@school.edu' }
  ])
  .select()

// Upsert (insert or update if exists)
const { data, error } = await supabase
  .from('students')
  .upsert({
    email: 'john@school.edu',  // Unique key
    first_name: 'John',
    last_name: 'Doe Updated'
  }, {
    onConflict: 'email'  // Which column to check for conflicts
  })
  .select()
```

#### Read (SELECT)

```typescript
// Get all records
const { data, error } = await supabase
  .from('students')
  .select('*')

// Get with filters
const { data, error } = await supabase
  .from('students')
  .select('*')
  .eq('grade_level', 8)
  .gte('created_at', '2026-01-01')
  .order('last_name', { ascending: true })

// Get single record
const { data, error } = await supabase
  .from('students')
  .select('*')
  .eq('id', studentId)
  .single()

// Get with pagination
const { data, error } = await supabase
  .from('students')
  .select('*')
  .range(0, 9)  // First 10 records (0-indexed)

// Count records
const { count, error } = await supabase
  .from('students')
  .select('*', { count: 'exact', head: true })
  .eq('grade_level', 8)
```

#### Update

```typescript
// Update single record
const { data, error } = await supabase
  .from('students')
  .update({
    first_name: 'John Updated',
    updated_at: new Date().toISOString()
  })
  .eq('id', studentId)
  .select()
  .single()

// Update multiple records
const { data, error } = await supabase
  .from('students')
  .update({ grade_level: 9 })
  .eq('section_id', sectionId)
  .select()

// Partial update
const { data, error } = await supabase
  .from('students')
  .update({ email: 'new.email@school.edu' })
  .eq('id', studentId)
  .select()
```

#### Delete

```typescript
// Delete single record
const { error } = await supabase
  .from('students')
  .delete()
  .eq('id', studentId)

// Delete multiple records
const { error } = await supabase
  .from('students')
  .delete()
  .in('id', [id1, id2, id3])

// Soft delete (update is_deleted flag)
const { error } = await supabase
  .from('students')
  .update({ is_deleted: true })
  .eq('id', studentId)
```

---

### 17.3.2 Complex Queries

#### Joins & Relations

```typescript
// One-to-many (student with section)
const { data, error } = await supabase
  .from('students')
  .select(`
    *,
    sections (
      id,
      name,
      grade_level
    )
  `)
  .eq('grade_level', 8)

// Multiple relations
const { data, error } = await supabase
  .from('assignments')
  .select(`
    *,
    teacher:teachers (
      id,
      first_name,
      last_name
    ),
    subject:subjects (
      id,
      name
    ),
    section:sections (
      id,
      name
    )
  `)

// Many-to-many (students and their assignments)
const { data, error } = await supabase
  .from('students')
  .select(`
    *,
    student_assignments (
      assignment:assignments (
        id,
        title,
        due_date
      )
    )
  `)
  .eq('id', studentId)
```

#### Filtering & Operators

```typescript
// Equality
.eq('grade_level', 8)
.neq('status', 'inactive')

// Comparison
.gt('score', 80)     // greater than
.gte('score', 80)    // greater than or equal
.lt('score', 60)     // less than
.lte('score', 60)    // less than or equal

// Pattern matching
.like('email', '%@school.edu')
.ilike('name', '%john%')  // Case insensitive

// Range
.in('grade_level', [7, 8, 9])
.is('section_id', null)
.not('status', 'is', null)

// Text search
.textSearch('description', 'math homework')

// Multiple conditions (AND)
const { data } = await supabase
  .from('students')
  .select('*')
  .eq('grade_level', 8)
  .eq('section_id', sectionId)
  .gte('created_at', '2026-01-01')

// OR conditions
const { data } = await supabase
  .from('students')
  .select('*')
  .or('grade_level.eq.8,grade_level.eq.9')
```

#### Aggregation

```typescript
// Count
const { count } = await supabase
  .from('students')
  .select('*', { count: 'exact', head: true })
  .eq('grade_level', 8)

// Using SQL functions
const { data, error } = await supabase
  .rpc('get_student_count_by_grade')

// Custom RPC function in Supabase
CREATE OR REPLACE FUNCTION get_student_count_by_grade()
RETURNS TABLE (grade_level INT, student_count BIGINT)
LANGUAGE SQL
AS $$
  SELECT grade_level, COUNT(*) as student_count
  FROM students
  GROUP BY grade_level
  ORDER BY grade_level;
$$;
```

---

### 17.3.3 Transactions

Supabase doesn't support traditional transactions in the JavaScript client. Use RPC functions for complex multi-step operations:

```sql
-- Create a stored procedure for transaction
CREATE OR REPLACE FUNCTION transfer_student(
  p_student_id UUID,
  p_new_section_id UUID,
  p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update student section
  UPDATE students
  SET section_id = p_new_section_id
  WHERE id = p_student_id;

  -- Log the transfer
  INSERT INTO student_transfers (student_id, old_section_id, new_section_id, reason)
  VALUES (p_student_id, (SELECT section_id FROM students WHERE id = p_student_id), p_new_section_id, p_reason);

  -- If any step fails, entire transaction rolls back
END;
$$;
```

```typescript
// Call the stored procedure
const { data, error } = await supabase.rpc('transfer_student', {
  p_student_id: studentId,
  p_new_section_id: newSectionId,
  p_reason: 'Requested by parent'
})
```

---

## 17.4 Real-time Features

### 17.4.1 Realtime Subscriptions

#### Basic Subscription

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function RealtimeGrades() {
  const [grades, setGrades] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    async function fetchGrades() {
      const { data } = await supabase
        .from('grades')
        .select('*')

      setGrades(data || [])
    }

    fetchGrades()

    // Subscribe to changes
    const channel = supabase
      .channel('grades-changes')
      .on(
        'postgres_changes',
        {
          event: '*',  // All events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'grades'
        },
        (payload) => {
          console.log('Change received!', payload)

          if (payload.eventType === 'INSERT') {
            setGrades((current) => [...current, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setGrades((current) =>
              current.map((grade) =>
                grade.id === payload.new.id ? payload.new : grade
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setGrades((current) =>
              current.filter((grade) => grade.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <ul>
      {grades.map((grade) => (
        <li key={grade.id}>
          Subject: {grade.subject_id} - Score: {grade.score}
        </li>
      ))}
    </ul>
  )
}
```

#### Filtered Subscriptions

```typescript
// Only subscribe to changes for specific student
const channel = supabase
  .channel('student-grades')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'grades',
      filter: `student_id=eq.${studentId}`
    },
    (payload) => {
      toast.success('New grade posted!')
      setGrades((current) => [...current, payload.new])
    }
  )
  .subscribe()
```

#### Multiple Event Subscriptions

```typescript
const channel = supabase
  .channel('announcements-channel')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'announcements'
    },
    (payload) => {
      toast.info('New announcement!')
      addAnnouncement(payload.new)
    }
  )
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'announcements'
    },
    (payload) => {
      toast.info('Announcement updated')
      updateAnnouncement(payload.new)
    }
  )
  .subscribe()
```

---

### 17.4.2 Channel Management

#### Broadcast Messages

```typescript
// Send broadcast message
const channel = supabase.channel('room-1')

await channel.send({
  type: 'broadcast',
  event: 'test',
  payload: { message: 'Hello everyone!' }
})

// Receive broadcast messages
channel.on('broadcast', { event: 'test' }, (payload) => {
  console.log('Received:', payload)
})

channel.subscribe()
```

#### Channel States

```typescript
const channel = supabase.channel('my-channel')

channel
  .on('system', {}, (payload) => {
    // Handle system messages
    if (payload.extension === 'presence') {
      console.log('Presence state:', payload.payload.state)
    }
  })
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('Connected to channel')
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Channel error')
    } else if (status === 'TIMED_OUT') {
      console.error('Channel timed out')
    }
  })
```

---

### 17.4.3 Presence Tracking

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function OnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: 'user-id'
        }
      }
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.values(state).flat()
        setOnlineUsers(users)
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences)
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track this user
          await channel.track({
            user_id: 'user-123',
            online_at: new Date().toISOString()
          })
        }
      })

    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div>
      <h3>Online Users: {onlineUsers.length}</h3>
      <ul>
        {onlineUsers.map((user, i) => (
          <li key={i}>{user.user_id}</li>
        ))}
      </ul>
    </div>
  )
}
```

---

## 17.5 Authentication

### 17.5.1 Sign Up / Sign In

#### Email/Password Sign Up

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: {
          role: 'student',
          grade_level: 8
        }
      }
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Check your email for confirmation link!')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSignUp}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  )
}
```

#### Email/Password Sign In

```typescript
async function handleSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw error
  }

  // data.user contains user info
  // data.session contains access_token and refresh_token
  return data
}
```

#### Sign Out

```typescript
async function handleSignOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
  } else {
    window.location.href = '/guess/login'
  }
}
```

---

### 17.5.2 Session Management

#### Get Current Session

```typescript
// Server Component
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()
const { data: { session } } = await supabase.auth.getSession()

if (!session) {
  redirect('/guess/login')
}

// Client Component
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const [session, setSession] = useState(null)

useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session)
  })

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session)
  })

  return () => subscription.unsubscribe()
}, [])
```

#### Refresh Session

```typescript
const { data, error } = await supabase.auth.refreshSession()
const { session, user } = data
```

#### Auth State Changes

```typescript
'use client'

useEffect(() => {
  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      console.log('User signed in:', session?.user)
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out')
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('Token refreshed')
    } else if (event === 'USER_UPDATED') {
      console.log('User updated')
    }
  })

  return () => subscription.unsubscribe()
}, [supabase])
```

---

### 17.5.3 User Metadata

```typescript
// Update user metadata
const { data, error } = await supabase.auth.updateUser({
  data: {
    display_name: 'John Doe',
    avatar_url: 'https://example.com/avatar.jpg',
    role: 'student',
    grade_level: 8
  }
})

// Access user metadata
const { data: { user } } = await supabase.auth.getUser()

console.log(user?.user_metadata?.display_name)
console.log(user?.user_metadata?.role)
```

---

### 17.5.4 Social Providers (Future)

```typescript
// Google Sign In
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${location.origin}/auth/callback`
  }
})

// GitHub Sign In
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github'
})
```

---

## Supabase Best Practices Summary

### ✅ Do

- **Use Server Components for initial data** - Better performance
- **Use service client for INSERT/UPDATE/DELETE** - Bypass RLS
- **Implement proper RLS policies** - Security at database level
- **Subscribe to realtime only when needed** - Avoid unnecessary connections
- **Unsubscribe from channels on cleanup** - Prevent memory leaks
- **Use typed responses** - TypeScript for database types
- **Handle errors gracefully** - Check for errors in responses
- **Use indexes on filtered columns** - Optimize query performance
- **Implement pagination** - Don't fetch all records at once
- **Use stored procedures for complex operations** - Atomic transactions

### ❌ Don't

- **Don't use regular client for writes** - Will fail with RLS
- **Don't expose service role key** - Backend only
- **Don't skip RLS policies** - Security is critical
- **Don't fetch unnecessary data** - Use select to specify fields
- **Don't forget to unsubscribe** - Memory leaks
- **Don't use `any` type** - Type your database responses
- **Don't skip error handling** - Always check for errors
- **Don't query in loops** - Batch operations instead
- **Don't forget indexes** - Slow queries without them
- **Don't store sensitive data in metadata** - Use separate table

---

## Quick Reference

```typescript
// Server Component data fetch
const { data } = await supabase.from('table').select('*')

// Client Component with realtime
const channel = supabase.channel('name')
  .on('postgres_changes', { event: '*', table: 'table' }, callback)
  .subscribe()

// Auth
await supabase.auth.signInWithPassword({ email, password })
await supabase.auth.signOut()
const { data: { user } } = await supabase.auth.getUser()

// Service client for writes (NestJS)
await supabaseService.getServiceClient().from('table').insert(data)
```

---

## Navigation

- [← Previous: API Architecture Overview](./16-api-architecture.md)
- [Next: NestJS Backend API →](./18-nestjs-backend.md)
- [↑ Back to Volume 5 Index](./README.md)
- [↑↑ Back to Manual Index](../README.md)
