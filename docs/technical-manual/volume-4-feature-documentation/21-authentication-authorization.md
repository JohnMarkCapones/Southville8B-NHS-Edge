# Chapter 21: Authentication & Authorization

## Table of Contents
- [Overview](#overview)
- [Authentication Architecture](#authentication-architecture)
- [JWT Token Management](#jwt-token-management)
- [Middleware Protection](#middleware-protection)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Protected Routes](#protected-routes)
- [Session Management](#session-management)
- [CSRF Protection](#csrf-protection)
- [Rate Limiting](#rate-limiting)
- [Server Actions](#server-actions)
- [Client-Side Auth Utilities](#client-side-auth-utilities)
- [Authentication Flow](#authentication-flow)
- [Security Best Practices](#security-best-practices)
- [Common Pitfalls](#common-pitfalls)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Southville 8B NHS Edge application implements a comprehensive authentication and authorization system built on **Supabase Auth**, **JWT tokens**, **Next.js 15 middleware**, and **server-side cookie management**. This chapter provides an in-depth exploration of how users are authenticated, how access is controlled, and how security is maintained throughout the application.

### Key Features

- **JWT-based authentication** with access and refresh tokens
- **HttpOnly cookie storage** for enhanced security
- **Next.js middleware** for route protection and token validation
- **Role-Based Access Control (RBAC)** with Student, Teacher, and Admin roles
- **CSRF protection** on all mutation requests
- **Rate limiting** to prevent abuse
- **Automatic token refresh** for seamless sessions
- **Session timeout warnings** for user experience
- **Server Actions** for secure cookie management
- **Social media crawler support** for Open Graph tags

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Authentication Provider | Supabase Auth | User authentication and session management |
| Token Format | JWT (JSON Web Token) | Stateless authentication |
| Cookie Management | Next.js Server Actions | Secure HttpOnly cookie handling |
| Route Protection | Next.js Middleware | Server-side access control |
| API Client | Custom apiClient | Token injection and refresh |
| Security | CSRF tokens, Rate limiting | Attack prevention |

---

## Authentication Architecture

### System Overview

The authentication system follows a **layered security approach**:

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Request                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Middleware                           │
│  • CSRF Validation                                               │
│  • Rate Limiting                                                 │
│  • Token Verification                                            │
│  • Public Path Check                                             │
│  • Social Crawler Detection                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌─────────────────┐          ┌─────────────────┐
    │  Public Route   │          │ Protected Route │
    │  (Allow Access) │          │  (Verify Auth)  │
    └─────────────────┘          └────────┬────────┘
                                          │
                             ┌────────────┴────────────┐
                             │                         │
                             ▼                         ▼
                  ┌─────────────────┐      ┌─────────────────┐
                  │ Valid Token     │      │ Invalid/Expired │
                  │ (Allow Access)  │      │ (Redirect Login)│
                  └─────────────────┘      └─────────────────┘
```

### Authentication Layers

#### Layer 1: Middleware (Edge Runtime)
**File:** `middleware.ts`

The middleware runs on **every request** before reaching the application:

```typescript
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname, searchParams } = request.nextUrl;
  const method = request.method;

  // 1. CSRF Protection (mutations only)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfCookie = request.cookies.get('csrf-token')?.value;
    const csrfHeader = request.headers.get('x-csrf-token');

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }

  // 2. Rate Limiting
  const clientIp = request.ip || 'unknown';
  const globalAllowed = checkRateLimit(`${clientIp}:global`, 100, 60000);

  if (!globalAllowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // 3. Token Validation (protected routes only)
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  if (!isPublicPath) {
    const token = request.cookies.get('sb-access-token')?.value;

    if (!token) {
      // Redirect to login
      return NextResponse.redirect(new URL('/guess/portal', request.url));
    }

    // Check token expiry
    const tokenExpiresAt = request.cookies.get('sb-token-expires')?.value;
    if (tokenExpiresAt && parseInt(tokenExpiresAt) <= Math.floor(Date.now() / 1000)) {
      return NextResponse.redirect(new URL('/guess/portal', request.url));
    }
  }

  return response;
}
```

**Key Responsibilities:**
- ✅ CSRF token validation on mutations
- ✅ Rate limiting (100 req/min global, endpoint-specific)
- ✅ Token presence and expiry check
- ✅ Public path allowlist
- ✅ Social media crawler detection
- ✅ Security headers (X-Frame-Options, CSP, etc.)

#### Layer 2: Server Actions (Cookie Management)
**File:** `app/actions/auth.ts`

Server Actions provide the **only secure way** to set HttpOnly cookies in Next.js 15:

```typescript
'use server';

import { cookies } from 'next/headers';
import type { LoginRequest, LoginResponse } from '@/lib/api/types';

const ACCESS_TOKEN_OPTIONS = {
  httpOnly: false, // Client needs to read for Authorization header
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 3, // 3 hours
};

const REFRESH_TOKEN_OPTIONS = {
  httpOnly: true, // Maximum security - server-side only
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export async function loginAction(credentials: LoginRequest) {
  try {
    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
    const response = await fetch(`${backendUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
      return { success: false, error: errorData.message };
    }

    const data: LoginResponse = await response.json();
    const cookieStore = await cookies();

    // Set cookies with enhanced security
    cookieStore.set('sb-access-token', data.session.access_token, ACCESS_TOKEN_OPTIONS);
    cookieStore.set('sb-refresh-token', data.session.refresh_token, REFRESH_TOKEN_OPTIONS);
    cookieStore.set('sb-token-expires', data.session.expires_at.toString(), {
      ...ACCESS_TOKEN_OPTIONS,
      httpOnly: false,
    });
    cookieStore.set('user-role', data.user.role, {
      ...ACCESS_TOKEN_OPTIONS,
      httpOnly: false,
    });

    return {
      success: true,
      user: data.user,
      role: data.user.role,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();

  cookieStore.delete('sb-access-token');
  cookieStore.delete('sb-refresh-token');
  cookieStore.delete('sb-token-expires');
  cookieStore.delete('user-role');

  return { success: true };
}
```

**Cookie Security Strategy:**

| Cookie | HttpOnly | Purpose | Expiry |
|--------|----------|---------|--------|
| `sb-access-token` | ❌ No | Client needs for API calls | 3 hours |
| `sb-refresh-token` | ✅ Yes | Server-side only, max security | 7 days |
| `sb-token-expires` | ❌ No | Client needs for refresh logic | 3 hours |
| `user-role` | ❌ No | Client needs for routing | 3 hours |
| `csrf-token` | ❌ No | Client needs to send in headers | 24 hours |

#### Layer 3: API Client (Token Injection)
**File:** `lib/api/client.ts`

The API client automatically injects JWT tokens into requests:

```typescript
class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Read from cookie (not HttpOnly)
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('sb-access-token='));

    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }

    return null;
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = true } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Inject JWT token
    if (requiresAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Attempt token refresh
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry original request with new token
        return this.request<T>(endpoint, options);
      }

      // Redirect to login
      window.location.href = '/guess/portal';
      throw new Error('Authentication required');
    }

    return response.json();
  }
}
```

#### Layer 4: Route-Level Protection
**File:** `components/auth/RequireAuth.tsx`

Client-side route guards for additional protection:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';

interface RequireAuthProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function RequireAuth({ children, requiredRoles }: RequireAuthProps) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useUser();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (isError || !user) {
      router.push('/guess/portal');
      return;
    }

    // Check role-based access
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      router.push('/unauthorized');
      return;
    }

    setAuthorized(true);
  }, [user, isLoading, isError, requiredRoles, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
```

---

## JWT Token Management

### Token Structure

JWT tokens follow the standard **Header.Payload.Signature** format:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzNCIsInJvbGUiOiJTdHVkZW50IiwiZXhwIjoxNzA5MjQwMDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Decoded Payload:**
```json
{
  "user_id": "1234",
  "role": "Student",
  "email": "student@example.com",
  "iat": 1709230000,
  "exp": 1709240000
}
```

### Token Lifecycle

```
User Login
    │
    ▼
┌─────────────────────────────────────┐
│ Backend generates JWT tokens:       │
│ • Access Token (2.78 hours)         │
│ • Refresh Token (7 days)            │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ Server Action sets cookies:         │
│ • sb-access-token (not HttpOnly)    │
│ • sb-refresh-token (HttpOnly)       │
│ • sb-token-expires (timestamp)      │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ Client stores in cookies            │
│ Middleware validates on each request│
└────────────────┬────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
Token Valid          Token Expires (< 5 min)
    │                         │
    ▼                         ▼
Continue         Middleware sets header:
                 X-Token-Refresh-Required
                          │
                          ▼
                  Client calls refreshToken()
                          │
                          ▼
              ┌────────────────────────┐
              │ Use refresh_token to   │
              │ get new access_token   │
              └───────────┬────────────┘
                          │
                          ▼
                  Update cookies
                  Continue session
```

### Automatic Token Refresh

The middleware detects expiring tokens and signals refresh:

```typescript
// middleware.ts
const tokenExpiresAt = request.cookies.get('sb-token-expires')?.value;
if (tokenExpiresAt) {
  const expiryTimestamp = parseInt(tokenExpiresAt);
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = expiryTimestamp - now;

  // Token expiring in < 5 minutes
  if (timeUntilExpiry < 5 * 60) {
    response.headers.set('X-Token-Refresh-Required', 'true');
  }
}
```

Client-side refresh handler:

```typescript
useEffect(() => {
  const checkTokenRefresh = async () => {
    const response = await fetch('/api/check-auth');
    const refreshRequired = response.headers.get('X-Token-Refresh-Required');

    if (refreshRequired === 'true') {
      await refreshTokenAction();
    }
  };

  const interval = setInterval(checkTokenRefresh, 60000); // Check every minute
  return () => clearInterval(interval);
}, []);
```

---

## Middleware Protection

### Public Path Configuration

**Public routes** that don't require authentication:

```typescript
const publicPaths = [
  '/guess',           // Guest pages
  '/guess/news',      // News articles (must be public for OG tags)
  '/_next',           // Next.js internals
  '/api/auth',        // Auth endpoints
  '/api/bug-report',  // Public bug reporting
  '/favicon.ico',
  '/videos',
  '/images',
];
```

### Social Media Crawler Support

Critical for **Open Graph meta tags** to work:

```typescript
const userAgent = request.headers.get('user-agent') || '';
const isSocialCrawler =
  userAgent.includes('facebookexternalhit') ||
  userAgent.includes('Facebot') ||
  userAgent.includes('Twitterbot') ||
  userAgent.includes('LinkedInBot') ||
  userAgent.includes('WhatsApp');

// Allow social crawlers to access pages for metadata
if (isSocialCrawler || pathname.startsWith('/guess/news')) {
  return response; // Skip auth check
}
```

**Why this matters:**
- Social platforms need to read Open Graph tags
- OG tags are server-rendered in `<head>`
- Authentication would block crawlers
- News pages must be publicly accessible

### Security Headers

Middleware applies comprehensive security headers:

```typescript
response.headers.set('X-Content-Type-Options', 'nosniff');
response.headers.set('X-Frame-Options', 'DENY');
response.headers.set('X-XSS-Protection', '1; mode=block');
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

if (process.env.NODE_ENV === 'production') {
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
}
```

---

## Role-Based Access Control (RBAC)

### Role Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                     SuperAdmin                          │
│  • Full system access                                   │
│  • User management                                      │
│  • System configuration                                 │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌───────────────────┐          ┌───────────────────┐
│      Admin        │          │      Teacher      │
│  • School mgmt    │          │  • Class mgmt     │
│  • Content mgmt   │          │  • Grading        │
│  • Reports        │          │  • Assignments    │
└───────────────────┘          └─────────┬─────────┘
                                         │
                                         ▼
                               ┌───────────────────┐
                               │      Student      │
                               │  • View content   │
                               │  • Assignments    │
                               │  • Grades         │
                               └───────────────────┘
```

### Role-Based Route Protection

**Layout-level protection:**

```typescript
// app/student/layout.tsx
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth requiredRoles={['Student']}>
      {children}
    </RequireAuth>
  );
}

// app/teacher/layout.tsx
export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth requiredRoles={['Teacher']}>
      {children}
    </RequireAuth>
  );
}

// app/admin/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth requiredRoles={['Admin', 'SuperAdmin']}>
      {children}
    </RequireAuth>
  );
}
```

### API-Level Authorization

Backend enforces role checks:

```typescript
// Backend: Check role in API handler
export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await verifyToken(token);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Role-based access
  if (user.role !== 'Teacher' && user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Proceed with authorized action
  return NextResponse.json({ data: 'Success' });
}
```

---

## Protected Routes

### Route Structure

```
/
├── guess/               (Public - No Auth)
│   ├── portal/         (Login page)
│   ├── news/           (Public news)
│   ├── events/         (Public events)
│   └── ...
│
├── student/            (Protected - Student Role)
│   ├── dashboard/
│   ├── assignments/
│   ├── grades/
│   └── ...
│
├── teacher/            (Protected - Teacher Role)
│   ├── dashboard/
│   ├── classes/
│   ├── grading/
│   └── ...
│
└── admin/              (Protected - Admin Role)
    ├── dashboard/
    ├── users/
    ├── settings/
    └── ...
```

### Middleware Route Matching

```typescript
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|ogg|mp3|wav|pdf|woff|woff2|ttf|otf)$).*)',
  ],
};
```

---

## Session Management

### Session Timeout

**Configuration:**
- Access token: **2.78 hours** (10,000 seconds)
- Refresh token: **7 days**
- Cookie maxAge: **3 hours** (safety margin)

### Session Timeout Warning

Display warning before session expires:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/dialog';

export function SessionTimeoutWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const checkSession = () => {
      const expiresAt = document.cookie
        .split(';')
        .find(c => c.trim().startsWith('sb-token-expires='))
        ?.split('=')[1];

      if (!expiresAt) return;

      const expiry = parseInt(expiresAt);
      const now = Math.floor(Date.now() / 1000);
      const remaining = expiry - now;

      // Show warning 5 minutes before expiry
      if (remaining > 0 && remaining < 5 * 60) {
        setShowWarning(true);
        setTimeRemaining(remaining);
      }
    };

    const interval = setInterval(checkSession, 30000); // Check every 30s
    checkSession(); // Check immediately

    return () => clearInterval(interval);
  }, []);

  if (!showWarning) return null;

  return (
    <Dialog open={showWarning}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session Expiring Soon</DialogTitle>
        </DialogHeader>
        <p>Your session will expire in {Math.floor(timeRemaining / 60)} minutes.</p>
        <DialogFooter>
          <Button onClick={async () => {
            await refreshTokenAction();
            setShowWarning(false);
          }}>
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## CSRF Protection

### CSRF Token Generation

Middleware generates CSRF tokens:

```typescript
function generateCsrfToken(): string {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// In middleware
const existingCsrfToken = request.cookies.get('csrf-token')?.value;

if (!existingCsrfToken) {
  const newCsrfToken = generateCsrfToken();
  response.cookies.set('csrf-token', newCsrfToken, {
    httpOnly: false, // Client needs to read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}
```

### CSRF Validation

Middleware validates on mutations:

```typescript
const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

if (isMutation) {
  const csrfCookie = request.cookies.get('csrf-token')?.value;
  const csrfHeader = request.headers.get('x-csrf-token');

  // Skip CSRF for Next.js Server Actions (built-in protection)
  const isServerAction = request.headers.has('Next-Action');

  if (!isServerAction) {
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }
}
```

### Client-Side CSRF Injection

API client includes CSRF token:

```typescript
class ApiClient {
  private getCsrfToken(): string | null {
    if (typeof window === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(c => c.trim().startsWith('csrf-token='));

    return csrfCookie ? csrfCookie.split('=')[1] : null;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add CSRF token for mutations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET')) {
      const csrfToken = this.getCsrfToken();
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }
    }

    return fetch(`${this.baseURL}${endpoint}`, { ...options, headers });
  }
}
```

---

## Rate Limiting

### Rate Limit Implementation

In-memory rate limiting (production should use Redis):

```typescript
interface RateLimitEntry {
  requests: number[];
  lastCleanup: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();

  let entry = rateLimitStore.get(identifier);
  if (!entry) {
    entry = { requests: [], lastCleanup: now };
    rateLimitStore.set(identifier, entry);
  }

  // Remove old requests outside window
  entry.requests = entry.requests.filter(time => now - time < windowMs);
  entry.lastCleanup = now;

  if (entry.requests.length >= limit) {
    return false; // Rate limit exceeded
  }

  entry.requests.push(now);
  return true;
}
```

### Rate Limit Configuration

```typescript
// Global rate limit
const globalAllowed = checkRateLimit(`${clientIp}:global`, 100, 60000); // 100 req/min

// Endpoint-specific limits
const endpointLimits: Record<string, { limit: number; window: number }> = {
  '/api/modules': { limit: 10, window: 60000 },      // 10 uploads/min
  '/api/quiz': { limit: 20, window: 60000 },         // 20 quiz ops/min
  '/api/auth/login': { limit: 5, window: 60000 },    // 5 login attempts/min
};
```

### Rate Limit Response

```typescript
if (!allowed) {
  return NextResponse.json(
    {
      error: 'Too many requests',
      retryAfter: 60
    },
    {
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
      }
    }
  );
}
```

---

## Server Actions

### Login Server Action

```typescript
'use server';

export async function loginAction(credentials: LoginRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
    const response = await fetch(`${backendUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      return { success: false, error: 'Invalid credentials' };
    }

    const data: LoginResponse = await response.json();
    const cookieStore = await cookies();

    // Set cookies
    cookieStore.set('sb-access-token', data.session.access_token, ACCESS_TOKEN_OPTIONS);
    cookieStore.set('sb-refresh-token', data.session.refresh_token, REFRESH_TOKEN_OPTIONS);
    cookieStore.set('sb-token-expires', data.session.expires_at.toString(), {
      ...ACCESS_TOKEN_OPTIONS,
      httpOnly: false,
    });

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: 'Login failed' };
  }
}
```

### Logout Server Action

```typescript
export async function logoutAction() {
  const cookieStore = await cookies();

  cookieStore.delete('sb-access-token');
  cookieStore.delete('sb-refresh-token');
  cookieStore.delete('sb-token-expires');
  cookieStore.delete('user-role');

  return { success: true };
}
```

### Refresh Token Server Action

```typescript
export async function refreshTokenAction() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;

    if (!refreshToken) {
      return { success: false, error: 'No refresh token' };
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
    const response = await fetch(`${backendUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      // Refresh token expired - logout
      await logoutAction();
      return { success: false, error: 'Session expired' };
    }

    const data = await response.json();

    // Update cookies with new tokens
    cookieStore.set('sb-access-token', data.session.access_token, ACCESS_TOKEN_OPTIONS);
    cookieStore.set('sb-refresh-token', data.session.refresh_token, REFRESH_TOKEN_OPTIONS);
    cookieStore.set('sb-token-expires', data.session.expires_at.toString(), {
      ...ACCESS_TOKEN_OPTIONS,
      httpOnly: false,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Refresh failed' };
  }
}
```

---

## Client-Side Auth Utilities

### useUser Hook

```typescript
import useSWR from 'swr';
import { getCurrentUser } from '@/lib/api/endpoints/auth';

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/user/me',
    getCurrentUser,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  return {
    data: data?.user,
    isLoading,
    isError: error,
    mutate,
  };
}
```

### Auth Context Provider

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction, logoutAction } from '@/app/actions/auth';

interface AuthContextValue {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user has valid token
    const token = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('sb-access-token='));

    setIsAuthenticated(!!token);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const result = await loginAction(credentials);

    if (result.success) {
      setIsAuthenticated(true);
      router.push(`/${result.role?.toLowerCase()}/dashboard`);
    } else {
      throw new Error(result.error || 'Login failed');
    }
  };

  const logout = async () => {
    await logoutAction();
    setIsAuthenticated(false);
    router.push('/guess/portal');
  };

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

---

## Authentication Flow

### Login Flow

```
1. User enters credentials
   ↓
2. Client calls loginAction() (Server Action)
   ↓
3. Server Action fetches backend /api/v1/auth/login
   ↓
4. Backend validates credentials
   ↓
5. Backend generates JWT tokens (access + refresh)
   ↓
6. Backend returns tokens + user data
   ↓
7. Server Action sets HttpOnly cookies
   ↓
8. Client redirects to role-based dashboard
   ↓
9. Middleware validates token on next request
```

### Token Refresh Flow

```
1. Client detects token expiring (< 5 min)
   ↓
2. Client calls refreshTokenAction() (Server Action)
   ↓
3. Server Action reads refresh_token from HttpOnly cookie
   ↓
4. Server Action fetches backend /api/v1/auth/refresh
   ↓
5. Backend validates refresh_token
   ↓
6. Backend generates new access_token + refresh_token
   ↓
7. Server Action updates cookies
   ↓
8. Client continues session seamlessly
```

### Logout Flow

```
1. User clicks logout
   ↓
2. Client calls logoutAction() (Server Action)
   ↓
3. Server Action deletes all auth cookies
   ↓
4. Client redirects to /guess/portal
   ↓
5. Middleware blocks access to protected routes
```

---

## Security Best Practices

### ✅ Do's

1. **Always use Server Actions for cookie management**
   ```typescript
   // ✅ CORRECT
   'use server';
   export async function setAuthCookie() {
     const cookieStore = await cookies();
     cookieStore.set('token', value, { httpOnly: true });
   }
   ```

2. **Use HttpOnly for sensitive tokens**
   ```typescript
   // ✅ CORRECT - Refresh token is HttpOnly
   cookieStore.set('sb-refresh-token', token, { httpOnly: true });
   ```

3. **Validate tokens in middleware**
   ```typescript
   // ✅ CORRECT - Middleware checks token on every request
   if (!token && !isPublicPath) {
     return NextResponse.redirect('/login');
   }
   ```

4. **Implement CSRF protection**
   ```typescript
   // ✅ CORRECT - CSRF token in header matches cookie
   if (csrfCookie !== csrfHeader) {
     return NextResponse.json({ error: 'CSRF' }, { status: 403 });
   }
   ```

5. **Use rate limiting**
   ```typescript
   // ✅ CORRECT - Limit login attempts
   if (!checkRateLimit(ip + ':login', 5, 60000)) {
     return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
   }
   ```

### ❌ Don'ts

1. **Don't store tokens in localStorage**
   ```typescript
   // ❌ WRONG - Vulnerable to XSS
   localStorage.setItem('token', accessToken);
   ```

2. **Don't make refresh tokens accessible to client**
   ```typescript
   // ❌ WRONG - Refresh token should be HttpOnly
   cookieStore.set('refresh-token', token, { httpOnly: false });
   ```

3. **Don't skip CSRF protection**
   ```typescript
   // ❌ WRONG - Always validate CSRF on mutations
   // (middleware automatically skips this - BAD)
   ```

4. **Don't trust client-side auth checks alone**
   ```typescript
   // ❌ WRONG - Client-side only
   if (user.role === 'Admin') {
     // Show admin panel
   }

   // ✅ CORRECT - Also validate on server
   export async function GET() {
     const user = await verifyToken();
     if (user.role !== 'Admin') {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
     }
   }
   ```

5. **Don't expose sensitive data in JWT payload**
   ```typescript
   // ❌ WRONG - Password in JWT
   const token = jwt.sign({ user_id, password }, secret);

   // ✅ CORRECT - Only non-sensitive data
   const token = jwt.sign({ user_id, role }, secret);
   ```

---

## Common Pitfalls

### 1. Hydration Errors with Auth State

**Problem:** Client and server render different auth states.

**Solution:**
```typescript
'use client';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return <>{children}</>;
}
```

### 2. Token Refresh Race Conditions

**Problem:** Multiple requests try to refresh token simultaneously.

**Solution:**
```typescript
let refreshPromise: Promise<any> | null = null;

async function refreshToken() {
  if (refreshPromise) {
    return refreshPromise; // Reuse existing refresh
  }

  refreshPromise = refreshTokenAction();

  try {
    const result = await refreshPromise;
    return result;
  } finally {
    refreshPromise = null;
  }
}
```

### 3. Middleware Blocking Static Assets

**Problem:** Middleware runs on static files, causing slow loads.

**Solution:**
```typescript
export const config = {
  matcher: [
    // Exclude static files
    '/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif)$).*)',
  ],
};
```

### 4. CORS Issues with Auth

**Problem:** Cross-origin requests fail with 401.

**Solution:**
```typescript
// Backend CORS config
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true, // Allow cookies
}));

// Frontend fetch
fetch(url, {
  credentials: 'include', // Send cookies
});
```

---

## Troubleshooting

### Issue: "Invalid CSRF token" on form submission

**Symptoms:** POST requests return 403 Forbidden.

**Diagnosis:**
```bash
# Check if CSRF token exists in cookies
document.cookie.split(';').find(c => c.includes('csrf-token'))

# Check if header is set
fetch(url, { headers: { 'x-csrf-token': token } })
```

**Solutions:**
1. Ensure middleware generates CSRF token
2. Verify client reads and sends token
3. Check CSRF is not validated on Server Actions

### Issue: Token expired unexpectedly

**Symptoms:** User logged out after short time.

**Diagnosis:**
```bash
# Check token expiry
const expiresAt = parseInt(document.cookie.match(/sb-token-expires=(\d+)/)?.[1] || '0');
const now = Math.floor(Date.now() / 1000);
console.log('Expires in:', (expiresAt - now) / 60, 'minutes');
```

**Solutions:**
1. Verify backend sends correct `expires_at` timestamp
2. Check cookie `maxAge` is longer than JWT expiry
3. Implement automatic token refresh

### Issue: Middleware redirects to login on public pages

**Symptoms:** News pages require login.

**Diagnosis:**
```typescript
console.log('Path:', pathname);
console.log('Is public?', publicPaths.some(p => pathname.startsWith(p)));
```

**Solutions:**
1. Add path to `publicPaths` array
2. Check social crawler detection
3. Verify middleware matcher excludes path

### Issue: 401 on API requests after login

**Symptoms:** API calls fail despite valid token.

**Diagnosis:**
```bash
# Check if token is sent
const token = request.headers.get('Authorization');
console.log('Token:', token);
```

**Solutions:**
1. Verify apiClient injects token
2. Check token format is `Bearer <token>`
3. Ensure backend validates JWT correctly

---

## Summary

The Southville 8B NHS Edge authentication system implements **enterprise-grade security** with:

- ✅ **JWT-based stateless authentication**
- ✅ **HttpOnly cookies for refresh tokens**
- ✅ **Next.js middleware for route protection**
- ✅ **CSRF protection on all mutations**
- ✅ **Rate limiting to prevent abuse**
- ✅ **Automatic token refresh**
- ✅ **Role-based access control**
- ✅ **Session timeout warnings**
- ✅ **Secure Server Actions for cookie management**

This multi-layered approach ensures that user data remains secure while providing a seamless user experience.

---

## Navigation

- **Previous Chapter:** [Chapter 20: Backend Integration Patterns](../volume-3-backend-integration/20-realtime-subscriptions.md)
- **Next Chapter:** [Chapter 22: Student Portal](./22-student-portal.md)
- **Volume Index:** [Volume 4: Feature Documentation](./README.md)
- **Main Index:** [Technical Manual Home](../README.md)
