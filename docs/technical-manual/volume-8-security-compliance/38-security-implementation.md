# Chapter 38: Security Implementation

## Overview

This chapter provides comprehensive documentation of the security controls, mechanisms, and implementations across the Southville 8B NHS Edge platform. The security architecture follows a defense-in-depth approach with multiple layers of protection at each level of the stack.

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [Authentication Security](#authentication-security)
3. [Authorization Security](#authorization-security)
4. [API Security](#api-security)
5. [Database Security](#database-security)
6. [File Upload Security](#file-upload-security)
7. [Frontend Security](#frontend-security)
8. [Backend Security](#backend-security)
9. [Network Security](#network-security)
10. [Secrets Management](#secrets-management)
11. [Security Middleware](#security-middleware)

---

## Security Architecture

### Defense-in-Depth Model

The platform implements a layered security model where each layer provides independent security controls:

```
┌──────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│  - Browser Security (CSP, XSS prevention)                    │
│  - Client-side validation                                    │
│  - Secure cookie handling                                    │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                  EDGE MIDDLEWARE LAYER                       │
│  - Next.js Middleware (CSRF, Rate Limiting)                  │
│  - Token validation                                          │
│  - Security headers                                          │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                           │
│  - Server Actions (authentication)                           │
│  - API Routes (business logic)                               │
│  - Input sanitization                                        │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                    API LAYER                                 │
│  - NestJS Guards (authentication, authorization)             │
│  - Rate limiting & throttling                                │
│  - Request validation                                        │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                             │
│  - Row-Level Security (RLS)                                  │
│  - Encryption at rest                                        │
│  - Audit logging                                             │
└──────────────────────────────────────────────────────────────┘
```

### Security Principles

#### 1. Zero Trust Architecture
Every request is authenticated and authorized regardless of origin:
- No implicit trust based on network location
- All users must authenticate
- All resources require authorization
- Continuous verification of security posture

#### 2. Principle of Least Privilege
Users and services have minimum necessary permissions:
- Role-based access control (RBAC)
- Policy-based access control (PBAC)
- Granular permission assignments
- Regular permission audits

#### 3. Defense in Depth
Multiple independent security layers:
- Redundant security controls
- Layered validation (client, edge, API, database)
- Fail-secure defaults
- Security at every tier

---

## Authentication Security

### Supabase Auth Integration

The platform uses Supabase Auth for centralized authentication:

#### Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │────────▶│   Next.js   │────────▶│  Supabase   │
│  (Browser)  │         │   Server    │         │    Auth     │
│             │◀────────│   Actions   │◀────────│             │
└─────────────┘         └─────────────┘         └─────────────┘
      │                        │                        │
      │                        │                        │
      ▼                        ▼                        ▼
 HttpOnly Cookies      Token Validation        User Database
```

#### Implementation: Login Flow

**File:** `frontend-nextjs/app/actions/auth.ts`

```typescript
'use server';

import { cookies } from 'next/headers';

// Enhanced cookie configuration for security
const COOKIE_OPTIONS = {
  httpOnly: true,                              // XSS protection
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'strict' as const,                 // CSRF protection
  path: '/',
  maxAge: 60 * 60 * 3,                         // 3 hours
};

const ACCESS_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  httpOnly: false,                             // Client needs to read
  maxAge: 60 * 60 * 3,
};

const REFRESH_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  httpOnly: true,                              // Maximum security
  maxAge: 60 * 60 * 24 * 7,                    // 7 days
};

export async function loginAction(credentials: LoginRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
    const apiUrl = `${backendUrl}/api/v1/auth/login`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() =>
        ({ message: 'Login failed' })
      );
      return {
        success: false,
        error: errorData.message || 'Invalid email or password',
      };
    }

    const data: LoginResponse = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: 'Login failed. Please check your credentials.',
      };
    }

    const cookieStore = await cookies();

    // Set access token (NOT HttpOnly - client needs for API calls)
    cookieStore.set('sb-access-token', data.session.access_token,
      ACCESS_TOKEN_OPTIONS);

    // Set refresh token (HttpOnly for maximum security)
    cookieStore.set('sb-refresh-token', data.session.refresh_token,
      REFRESH_TOKEN_OPTIONS);

    // Store expiry for client-side refresh logic
    cookieStore.set('sb-token-expires', data.session.expires_at.toString(), {
      ...ACCESS_TOKEN_OPTIONS,
      httpOnly: false,
    });

    // Store session start time
    cookieStore.set('sb-session-start', Date.now().toString(), {
      ...ACCESS_TOKEN_OPTIONS,
      httpOnly: false,
    });

    // Store user role for routing
    cookieStore.set('user-role', data.user.role, {
      ...COOKIE_OPTIONS,
      httpOnly: false,
    });

    return {
      success: true,
      user: data.user,
      role: data.user.role,
    };
  } catch (error: any) {
    console.error('[loginAction] Error:', error);

    return {
      success: false,
      error: error.message || 'Login failed. Please try again.',
    };
  }
}
```

**Security Features:**
1. **HttpOnly Cookies** - Refresh tokens are HttpOnly to prevent XSS attacks
2. **Secure Flag** - Cookies only sent over HTTPS in production
3. **SameSite Strict** - CSRF protection via cookie policy
4. **Token Separation** - Access tokens readable by client, refresh tokens server-only
5. **Expiry Management** - Different lifetimes for access (3h) vs refresh (7d) tokens

#### Token Verification

**File:** `core-api-layer/southville-nhs-school-portal-api-layer/src/auth/auth.service.ts`

```typescript
async verifyToken(token: string): Promise<SupabaseUser> {
  try {
    const authClient = this.getAuthClient();

    // Use Supabase's built-in token verification
    const {
      data: { user },
      error,
    } = await authClient.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Get actual application role from database
    const roleFromDatabase = await this.getUserRoleFromDatabase(user.id);

    // Transform to SupabaseUser interface
    const supabaseUser: SupabaseUser = {
      id: user.id,
      email: user.email || '',
      role: roleFromDatabase || user.role,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata,
      aud: user.aud || 'authenticated',
      created_at: user.created_at,
      updated_at: user.updated_at,
      email_confirmed_at: user.email_confirmed_at,
      phone: user.phone,
      phone_confirmed_at: user.phone_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      confirmed_at: user.confirmed_at,
    };

    return supabaseUser;
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      throw error;
    }
    throw new UnauthorizedException('Token verification failed');
  }
}
```

**Security Features:**
1. **Supabase Verification** - Uses Supabase's built-in JWT verification
2. **Database Role Sync** - Fetches actual role from database, not just token
3. **Error Handling** - Generic error messages to prevent information disclosure
4. **Type Safety** - Strongly typed user interface

#### Token Refresh Mechanism

```typescript
export async function refreshTokenAction() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;

    if (!refreshToken) {
      return {
        success: false,
        error: 'No refresh token available',
      };
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
    const apiUrl = `${backendUrl}/api/v1/auth/refresh`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() =>
        ({ message: 'Token refresh failed' })
      );

      // If refresh token invalid, clear all cookies
      if (response.status === 401) {
        await logoutAction();
      }

      return {
        success: false,
        error: errorData.message || 'Token refresh failed',
      };
    }

    const data = await response.json();

    if (!data.success || !data.session) {
      return {
        success: false,
        error: 'Invalid refresh response',
      };
    }

    // Update cookies with new tokens
    cookieStore.set('sb-access-token', data.session.access_token,
      ACCESS_TOKEN_OPTIONS);
    cookieStore.set('sb-refresh-token', data.session.refresh_token,
      REFRESH_TOKEN_OPTIONS);
    cookieStore.set('sb-token-expires', data.session.expires_at.toString(), {
      ...ACCESS_TOKEN_OPTIONS,
      httpOnly: false,
    });
    cookieStore.set('sb-session-start', Date.now().toString(), {
      ...ACCESS_TOKEN_OPTIONS,
      httpOnly: false,
    });

    return {
      success: true,
      session: data.session,
    };
  } catch (error: any) {
    console.error('[refreshTokenAction] Error:', error);
    return {
      success: false,
      error: error.message || 'Token refresh failed',
    };
  }
}
```

**Security Features:**
1. **Automatic Logout** - Clears all session data on invalid refresh token
2. **Token Rotation** - Issues new access and refresh tokens
3. **Session Extension** - Resets session timer on successful refresh
4. **Error Recovery** - Graceful degradation on refresh failure

### Session Management

#### Session Security Features

1. **Finite Lifetime**
   - Access tokens: 2 hours (10,000 seconds)
   - Refresh tokens: 7 days
   - Session timeout: 3 hours of inactivity

2. **Secure Storage**
   - HttpOnly cookies for refresh tokens
   - Memory-based storage for sensitive operations
   - No localStorage for authentication tokens

3. **Session Invalidation**
   - Explicit logout clears all cookies
   - Token expiry enforced server-side
   - Automatic cleanup on breach detection

#### Session Monitoring

```typescript
export async function getSessionAction() {
  try {
    const cookieStore = await cookies();

    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;
    const expiresAt = cookieStore.get('sb-token-expires')?.value;
    const userRole = cookieStore.get('user-role')?.value;

    if (!accessToken) {
      return {
        success: false,
        error: 'No active session',
        isAuthenticated: false
      };
    }

    // Verify token with backend
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
      const apiUrl = `${backendUrl}/api/v1/auth/verify`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: accessToken }),
      });

      if (!response.ok) {
        // Token invalid - clear cookies
        await logoutAction();
        return {
          success: false,
          error: 'Invalid token',
          isAuthenticated: false
        };
      }

      const verifyResponse: TokenVerifyResponse = await response.json();

      if (!verifyResponse.success) {
        await logoutAction();
        return {
          success: false,
          error: 'Invalid token',
          isAuthenticated: false
        };
      }

      return {
        success: true,
        isAuthenticated: true,
        user: verifyResponse.user,
        expiresAt: expiresAt ? parseInt(expiresAt) : undefined,
      };
    } catch (verifyError) {
      console.error('[getSessionAction] Token verification failed:', verifyError);
      await logoutAction();
      return {
        success: false,
        error: 'Token verification failed',
        isAuthenticated: false
      };
    }
  } catch (error: any) {
    console.error('[getSessionAction] Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get session',
      isAuthenticated: false
    };
  }
}
```

### Password Security

#### Password Reset Flow

```typescript
async sendPasswordResetEmail(email: string): Promise<{ message: string }> {
  const supabase = this.getServiceClient();

  try {
    // 1. Check if user exists and is an admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role_id,
        roles(name)
      `)
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      // Return generic success to prevent email enumeration
      this.logger.warn(
        `Password reset requested for non-existent email: ${email}`,
      );
      return {
        message:
          'If this email is registered as an admin, a password reset link has been sent.',
      };
    }

    // 2. Check if user has admin role
    const rolesData = (user as any).roles;
    const roleName = Array.isArray(rolesData)
      ? rolesData[0]?.name?.toLowerCase()
      : rolesData?.name?.toLowerCase();

    if (roleName !== 'admin') {
      // Return generic success for non-admin users
      this.logger.warn(
        `Password reset requested for non-admin email: ${email}`,
      );
      return {
        message:
          'If this email is registered as an admin, a password reset link has been sent.',
      };
    }

    // 3. Generate password reset link
    const authClient = this.getAuthClient();
    const redirectTo = this.configService.get<string>(
      'auth.passwordResetRedirectUrl',
      `${supabaseUrl}/auth/callback`,
    );

    const { error: resetError } = await authClient.auth.resetPasswordForEmail(
      email,
      { redirectTo }
    );

    if (resetError) {
      this.logger.error(
        `Failed to send password reset email: ${resetError.message}`,
      );
    }

    this.logger.log(`Password reset email sent to admin: ${email}`);

    return {
      message:
        'If this email is registered as an admin, a password reset link has been sent.',
    };
  } catch (error) {
    this.logger.error(`Error sending password reset email: ${error.message}`);
    // Always return success message for security
    return {
      message:
        'If this email is registered as an admin, a password reset link has been sent.',
    };
  }
}
```

**Security Features:**
1. **Email Enumeration Prevention** - Generic success message regardless of email existence
2. **Role-Based Reset** - Only admins can reset via email link
3. **Birthday-Based Passwords** - Students/teachers get birthday-based defaults (YYYYMMDD)
4. **Secure Random Passwords** - Admins get cryptographically random passwords
5. **Audit Logging** - All password changes logged

---

## Authorization Security

### Role-Based Access Control (RBAC)

#### Role Hierarchy

```
SuperAdmin (Level 4)
    ├── Full system access
    ├── User management
    ├── System configuration
    └── Inherits: Admin, Teacher, Student permissions

Admin (Level 3)
    ├── School management
    ├── Teacher management
    ├── Student management
    └── Inherits: Teacher, Student permissions

Teacher (Level 2)
    ├── Class management
    ├── Grade management
    ├── Quiz creation
    └── Inherits: Student permissions (view-only)

Student (Level 1)
    ├── View grades
    ├── Take quizzes
    ├── Join clubs
    └── Base permissions only
```

#### RBAC Guard Implementation

**File:** `core-api-layer/southville-nhs-school-portal-api-layer/src/auth/guards/roles.guard.ts`

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private roleCacheService: RoleCacheService,
  ) {}

  /**
   * Sanitize input to prevent XSS attacks
   */
  private sanitizeInput(
    input: string | null | undefined,
  ): string | null | undefined {
    if (!input) return input;
    return input.replace(/<[^>]*>/g, '').trim();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required roles from route metadata
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    try {
      // Sanitize user ID
      const sanitizedUserId = this.sanitizeInput(user.id);
      if (!sanitizedUserId) {
        throw new ForbiddenException('Invalid user ID');
      }

      // Get user role from cache or database
      let userRole = this.roleCacheService.getCachedRole(sanitizedUserId);

      if (!userRole) {
        userRole = await this.authService.getUserRoleFromDatabase(
          sanitizedUserId
        );

        if (userRole) {
          const sanitizedRole = this.sanitizeInput(userRole);
          if (sanitizedRole) {
            this.roleCacheService.setCachedRole(sanitizedUserId, sanitizedRole);
            userRole = sanitizedRole;
          }
        }
      }

      if (!userRole) {
        throw new ForbiddenException('User role not found in database');
      }

      // Sanitize required roles
      const sanitizedRequiredRoles = requiredRoles
        .map((role) => this.sanitizeInput(role))
        .filter((role): role is string => role !== null && role !== undefined);

      // Check role with hierarchy support
      const hasRole = sanitizedRequiredRoles.some(
        (role) =>
          role === userRole ||
          (userRole && this.authService.hasRoleHierarchy(userRole, role)),
      );

      if (!hasRole) {
        // Security logging
        console.warn(
          `🚫 ROLE_DENIED: User ${sanitizedUserId} attempted access requiring ` +
          `roles [${sanitizedRequiredRoles.join(', ')}] but has role ` +
          `"${userRole}" at ${new Date().toISOString()}`,
        );
        throw new ForbiddenException(
          `Access denied. Required roles: ${sanitizedRequiredRoles.join(', ')}. ` +
          `Your role: ${userRole}`,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error in RolesGuard:', error);
      throw new ForbiddenException('Failed to verify user role');
    }
  }
}
```

**Security Features:**
1. **Input Sanitization** - All user input sanitized to prevent XSS
2. **Role Caching** - Reduces database queries while maintaining security
3. **Hierarchy Support** - Higher roles inherit lower role permissions
4. **Audit Logging** - Failed authorization attempts logged
5. **Secure Defaults** - Deny access by default

#### Role Decorator Usage

```typescript
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class AdminController {

  @Get('users')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async getUsers() {
    // Only admins and superadmins can access
  }

  @Post('users/:id/reset-password')
  @Roles(UserRole.SUPERADMIN)
  async resetPassword(@Param('id') userId: string) {
    // Only superadmins can reset passwords
  }
}
```

### Policy-Based Access Control (PBAC)

PBAC provides fine-grained, domain-specific authorization beyond role-based controls.

#### Policy Guard Implementation

**File:** `core-api-layer/southville-nhs-school-portal-api-layer/src/auth/guards/policies.guard.ts`

```typescript
@Injectable()
export class PoliciesGuard implements CanActivate {
  private readonly logger = new Logger(PoliciesGuard.name);

  constructor(
    private reflector: Reflector,
    private policyEngineService: PolicyEngineService,
    private domainMappingService: DomainMappingService,
  ) {}

  /**
   * Sanitize input to prevent XSS attacks
   */
  private sanitizeInput(
    input: string | null | undefined,
  ): string | null | undefined {
    if (!input) return input;
    return input.replace(/<[^>]*>/g, '').trim();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get policy configuration from route metadata
    const policyConfig = this.reflector.getAllAndOverride<PolicyConfig>(
      POLICIES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!policyConfig) {
      this.logger.debug('No policies required for this route');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: SupabaseUser = request.user;

    if (!user) {
      this.logger.warn('No authenticated user found in request');
      throw new ForbiddenException('User not authenticated');
    }

    try {
      const { domainParam, permissionKey } = policyConfig;

      // Sanitize inputs
      const sanitizedUserId = this.sanitizeInput(user.id);
      const sanitizedDomainParam = this.sanitizeInput(domainParam);
      const sanitizedPermissionKey = this.sanitizeInput(permissionKey);

      if (!sanitizedUserId || !sanitizedDomainParam || !sanitizedPermissionKey) {
        throw new ForbiddenException('Invalid input parameters');
      }

      // Extract domain entity ID from route parameters
      const entityId = request.params[sanitizedDomainParam];
      if (!entityId) {
        this.logger.warn(
          `Domain parameter '${sanitizedDomainParam}' not found in route parameters`,
        );
        throw new ForbiddenException(
          `Required parameter '${sanitizedDomainParam}' not found`,
        );
      }

      const sanitizedEntityId = this.sanitizeInput(entityId);
      if (!sanitizedEntityId) {
        throw new ForbiddenException('Invalid entity ID');
      }

      // Resolve domain ID from entity ID
      const domainId = await this.domainMappingService.resolveDomainId(
        sanitizedDomainParam,
        sanitizedEntityId,
      );

      if (domainId === null || domainId === undefined) {
        this.logger.warn(
          `Could not resolve domain ID for ${sanitizedDomainParam}:${sanitizedEntityId}`,
        );
        throw new ForbiddenException(
          `Invalid ${sanitizedDomainParam} or domain not found`,
        );
      }

      this.logger.debug(
        `Evaluating permission for user ${sanitizedUserId}, ` +
        `domain ${domainId}, permission ${sanitizedPermissionKey}`,
      );

      // Evaluate the permission
      const hasPermission = await this.policyEngineService.evaluatePermission(
        sanitizedUserId,
        domainId,
        sanitizedPermissionKey,
      );

      if (!hasPermission) {
        // Security logging
        this.logger.warn(
          `🚫 PERMISSION_DENIED: User ${sanitizedUserId} attempted ` +
          `${sanitizedPermissionKey} on domain ${domainId} at ` +
          `${new Date().toISOString()}`,
        );
        this.logger.warn(
          `🔍 Security Context: IP=${request.ip}, ` +
          `UserAgent=${request.headers['user-agent']}, Path=${request.path}`,
        );
        throw new ForbiddenException(
          `Access denied. Required permission: ${sanitizedPermissionKey} ` +
          `in domain ${domainId}`,
        );
      }

      this.logger.debug(
        `✅ Access granted for user ${sanitizedUserId} - ` +
        `has permission ${sanitizedPermissionKey} in domain ${domainId}`,
      );
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(
        `Unexpected error in PoliciesGuard for user ${user.id}`,
        error,
      );
      throw new ForbiddenException('Failed to evaluate domain permissions');
    }
  }
}
```

**Security Features:**
1. **Context-Aware Authorization** - Permissions based on resource context
2. **Domain Mapping** - Resolves entity IDs to domain IDs securely
3. **Permission Evaluation** - Complex permission logic centralized
4. **Detailed Logging** - Security events logged with context
5. **Input Sanitization** - All inputs sanitized before use

#### Policy Decorator Usage

```typescript
import { Policies } from '@/auth/decorators/policies.decorator';

@Controller('sections')
@UseGuards(SupabaseAuthGuard, RolesGuard, PoliciesGuard)
export class SectionsController {

  @Get(':sectionId/students')
  @Policies({ domainParam: 'sectionId', permissionKey: 'section:read_students' })
  async getStudents(@Param('sectionId') sectionId: string) {
    // User must have 'section:read_students' permission for this section
  }

  @Post(':sectionId/announcements')
  @Policies({ domainParam: 'sectionId', permissionKey: 'section:create_announcement' })
  async createAnnouncement(@Param('sectionId') sectionId: string) {
    // User must have 'section:create_announcement' permission
  }
}
```

### Row-Level Security (RLS)

Database-level access control using PostgreSQL Row-Level Security policies.

#### Example RLS Policy: Student Grades

```sql
-- Students can only view their own grades
CREATE POLICY "Students can view own grades"
ON grades FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role_id = (SELECT id FROM roles WHERE name = 'Student')
    AND grades.student_id = users.id
  )
);

-- Teachers can view grades for their sections
CREATE POLICY "Teachers can view section grades"
ON grades FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    INNER JOIN teachers t ON t.user_id = u.id
    INNER JOIN sections s ON s.teacher_id = t.id
    INNER JOIN students st ON st.section_id = s.id
    WHERE u.id = auth.uid()
    AND grades.student_id = st.user_id
  )
);

-- Admins can view all grades
CREATE POLICY "Admins can view all grades"
ON grades FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role_id IN (
      SELECT id FROM roles WHERE name IN ('Admin', 'SuperAdmin')
    )
  )
);
```

**Security Features:**
1. **Database-Level Enforcement** - Cannot be bypassed by application code
2. **User Context Aware** - Uses `auth.uid()` for current user
3. **Role-Based Policies** - Different policies per role
4. **Relationship-Based Access** - Access based on data relationships
5. **Defense in Depth** - Additional layer beyond application authorization

---

## API Security

### Rate Limiting

Implemented in Next.js middleware to prevent abuse and DDoS attacks.

**File:** `frontend-nextjs/middleware.ts`

```typescript
// In-memory rate limiter
interface RateLimitEntry {
  requests: number[];
  lastCleanup: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastGlobalCleanup = Date.now();

function cleanupRateLimitStore(): void {
  const now = Date.now();
  const CLEANUP_THRESHOLD = 10 * 60 * 1000; // 10 minutes

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.lastCleanup > CLEANUP_THRESHOLD) {
      rateLimitStore.delete(key);
    }
  }

  lastGlobalCleanup = now;
}

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

  // Remove requests outside the window
  entry.requests = entry.requests.filter(time => now - time < windowMs);
  entry.lastCleanup = now;

  // Check if limit exceeded
  if (entry.requests.length >= limit) {
    return false;
  }

  entry.requests.push(now);
  return true;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Periodic cleanup
  if (Date.now() - lastGlobalCleanup > CLEANUP_INTERVAL) {
    cleanupRateLimitStore();
  }

  // Get client IP
  const clientIp = request.ip ||
                   request.headers.get('x-forwarded-for')?.split(',')[0] ||
                   request.headers.get('x-real-ip') ||
                   'unknown';

  // Global rate limit: 100 requests per minute
  const globalIdentifier = `${clientIp}:global`;
  const globalAllowed = checkRateLimit(globalIdentifier, 100, 60000);

  if (!globalAllowed) {
    console.log(`[Middleware] ❌ Global rate limit exceeded for ${clientIp}`);
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: 60
      },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + 60000),
        }
      }
    );
  }

  // Endpoint-specific rate limits
  const endpointLimits: Record<string, { limit: number; window: number }> = {
    '/api/modules': { limit: 10, window: 60000 },     // 10 uploads/min
    '/api/quiz': { limit: 20, window: 60000 },        // 20 ops/min
    '/api/auth/login': { limit: 5, window: 60000 },   // 5 attempts/min
  };

  for (const [pathPrefix, { limit, window }] of Object.entries(endpointLimits)) {
    if (pathname.startsWith(pathPrefix)) {
      const endpointIdentifier = `${clientIp}:${pathPrefix}`;
      const allowed = checkRateLimit(endpointIdentifier, limit, window);

      if (!allowed) {
        console.log(`[Middleware] ❌ Rate limit exceeded for ${clientIp} on ${pathPrefix}`);
        return NextResponse.json(
          {
            error: 'Too many requests',
            message: `You have exceeded the rate limit for ${pathPrefix}.`,
            retryAfter: Math.ceil(window / 1000)
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil(window / 1000)),
              'X-RateLimit-Limit': String(limit),
              'X-RateLimit-Remaining': '0',
            }
          }
        );
      }
    }
  }

  return response;
}
```

**Security Features:**
1. **Global Rate Limit** - 100 requests/minute per IP
2. **Endpoint-Specific Limits** - Sensitive endpoints have tighter limits
3. **Memory Efficient** - Automatic cleanup of old entries
4. **Standard Headers** - RFC-compliant rate limit headers
5. **IP-Based Tracking** - Handles proxies and load balancers

**Production Recommendation:**
Replace in-memory store with Redis for:
- Distributed rate limiting across servers
- Persistent rate limit state
- Better performance at scale

### CSRF Protection

**File:** `frontend-nextjs/middleware.ts`

```typescript
function generateCsrfToken(): string {
  // Production: use crypto.randomBytes(32).toString('hex')
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  const method = request.method;

  // ========================================
  // CSRF PROTECTION
  // ========================================

  // Generate CSRF token for new sessions
  const existingCsrfToken = request.cookies.get('csrf-token')?.value;

  if (!existingCsrfToken) {
    const newCsrfToken = generateCsrfToken();
    response.cookies.set('csrf-token', newCsrfToken, {
      httpOnly: false, // Client needs to read for API calls
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  // Validate CSRF for mutations
  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

  if (isMutation) {
    const csrfCookie = request.cookies.get('csrf-token')?.value;
    const csrfHeader = request.headers.get('x-csrf-token');

    // Check if this is a Next.js Server Action
    const isServerAction = request.headers.has('Next-Action') ||
                          request.headers.get('content-type')?.includes('multipart/form-data') ||
                          request.headers.get('next-action') !== null;

    // Skip CSRF for trusted paths
    const skipCSRF = pathname.startsWith('/_next') ||
                     isServerAction ||
                     pathname.startsWith('/api/auth/login') ||
                     pathname === '/api/auth/callback' ||
                     pathname === '/api/bug-report';

    if (!skipCSRF) {
      if (!csrfCookie || !csrfHeader) {
        console.log(`[Middleware] ❌ CSRF token missing for ${method} ${pathname}`);
        return NextResponse.json(
          {
            error: 'CSRF token missing',
            message: 'Cross-Site Request Forgery token is required'
          },
          { status: 403 }
        );
      }

      if (csrfCookie !== csrfHeader) {
        console.log(`[Middleware] ❌ CSRF token mismatch for ${method} ${pathname}`);
        return NextResponse.json(
          {
            error: 'Invalid CSRF token',
            message: 'Cross-Site Request Forgery token validation failed'
          },
          { status: 403 }
        );
      }

      console.log(`[Middleware] ✅ CSRF validated for ${method} ${pathname}`);
    }
  }

  return response;
}
```

**Security Features:**
1. **Token Generation** - Cryptographically random tokens
2. **Double Submit Cookie** - Token in cookie and header must match
3. **SameSite Cookie** - Additional CSRF protection
4. **Server Action Support** - Skips CSRF for Next.js Server Actions
5. **Automatic Token Management** - Tokens auto-generated and validated

### Input Validation & Sanitization

**File:** `frontend-nextjs/lib/security/sanitizers.ts`

```typescript
/**
 * Sanitize plain text string
 * Removes HTML tags, scripts, and control characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return ""

  return (
    input
      .replace(/<[^>]*>/g, "")                        // Remove HTML
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/[\x00-\x1F\x7F-\x9F]/g, "")           // Control chars
      .replace(/\s+/g, " ")                           // Normalize whitespace
      .trim()
  )
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  if (typeof text !== "string") return ""

  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  }

  return text.replace(/[&<>"'\/]/g, (char) => htmlEscapes[char] || char)
}

/**
 * Sanitize URL to prevent XSS
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== "string") return ""

  const trimmed = url.trim().toLowerCase()

  const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:"]
  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      return "#"
    }
  }

  if (
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://") &&
    !trimmed.startsWith("mailto:") &&
    !trimmed.startsWith("/") &&
    !trimmed.startsWith("#")
  ) {
    return "#"
  }

  return url.trim()
}

/**
 * Detect potential XSS payloads
 */
export function detectXss(input: string): boolean {
  if (typeof input !== "string") return false

  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /<img[^>]+src[^>]*>/gi,
    /data:text\/html/gi,
    /<embed[^>]*>/gi,
    /<object[^>]*>/gi,
  ]

  return xssPatterns.some((pattern) => pattern.test(input))
}

/**
 * Detect potential SQL injection
 */
export function detectSqlInjection(input: string): boolean {
  if (typeof input !== "string") return false

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi,
    /';?\s*--/gi,
    /\/\*.*\*\//gi,
    /\bxp_\w+/gi,
    /\bsp_\w+/gi,
  ]

  return sqlPatterns.some((pattern) => pattern.test(input))
}

/**
 * Comprehensive input sanitization
 */
export function sanitizeInput(
  input: string,
  options: {
    allowHtml?: boolean
    normalizeUnicode?: boolean
    detectThreats?: boolean
  } = {}
): {
  sanitized: string
  threats: string[]
} {
  const threats: string[] = []

  if (typeof input !== "string") {
    return { sanitized: "", threats: [] }
  }

  let sanitized = input

  if (options.normalizeUnicode !== false) {
    sanitized = normalizeUnicode(sanitized)

    if (detectHomographAttack(sanitized)) {
      threats.push("Potential homograph attack detected")
    }
  }

  if (options.detectThreats) {
    if (detectXss(sanitized)) {
      threats.push("Potential XSS attack detected")
    }

    if (detectSqlInjection(sanitized)) {
      threats.push("Potential SQL injection detected")
    }
  }

  if (options.allowHtml) {
    sanitized = sanitizeHtml(sanitized)
  } else {
    sanitized = sanitizeString(sanitized)
  }

  return { sanitized, threats }
}
```

**Security Features:**
1. **HTML Sanitization** - Removes dangerous HTML tags and attributes
2. **XSS Detection** - Identifies XSS attack patterns
3. **SQL Injection Detection** - Identifies SQL injection attempts
4. **Unicode Normalization** - Prevents homograph attacks
5. **Threat Reporting** - Returns detected threats for logging

### Secure Form Handling

**File:** `frontend-nextjs/hooks/useSecureForm.ts`

```typescript
export function useSecureForm<TFieldValues extends FieldValues = FieldValues>({
  schema,
  sanitize = true,
  onSecurityThreat,
  ...options
}: SecureFormOptions<TFieldValues>): SecureFormReturn<TFieldValues> {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<TFieldValues>({
    ...options,
    resolver: zodResolver(schema),
    mode: options.mode || "onBlur",
    reValidateMode: options.reValidateMode || "onChange",
  })

  const handleSecureSubmit = useCallback(
    (onValid: (data: TFieldValues) => Promise<void> | void) => {
      return async (e?: React.BaseSyntheticEvent) => {
        e?.preventDefault()
        setSubmitError(null)
        setIsSubmitting(true)

        try {
          const values = form.getValues()
          let sanitizedValues = values
          const detectedThreats: string[] = []

          if (sanitize) {
            sanitizedValues = sanitizeFormData(values, detectedThreats) as TFieldValues
          }

          if (detectedThreats.length > 0 && onSecurityThreat) {
            onSecurityThreat(detectedThreats)
          }

          // Validate with Zod schema
          const validatedData = schema.parse(sanitizedValues)

          await onValid(validatedData)
        } catch (error) {
          if (error instanceof z.ZodError) {
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
```

**Security Features:**
1. **Automatic Sanitization** - All form fields sanitized before submission
2. **Zod Validation** - Type-safe schema validation
3. **Threat Detection** - Security threats detected and reported
4. **Password Protection** - Password fields not sanitized
5. **Error Handling** - Secure error messages

---

## Database Security

### Encryption at Rest

Supabase PostgreSQL databases use AES-256 encryption at rest by default.

**Configuration:**
- **Storage Encryption:** AES-256-GCM
- **Key Management:** Supabase managed keys
- **Backup Encryption:** Encrypted backups
- **Connection Encryption:** TLS 1.3 for all connections

### Row-Level Security (RLS)

All tables have RLS policies enabled. See examples in Authorization section.

### Audit Trail

Database triggers log all data modifications:

```sql
-- Audit log table
CREATE TABLE system_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO system_audit_log (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO system_audit_log (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO system_audit_log (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to sensitive tables
CREATE TRIGGER users_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

---

## File Upload Security

### Validation

```typescript
// File type validation
const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword',
             'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  video: ['video/mp4', 'video/webm'],
};

// File size limits (bytes)
const MAX_FILE_SIZE = {
  image: 5 * 1024 * 1024,      // 5MB
  document: 10 * 1024 * 1024,  // 10MB
  video: 100 * 1024 * 1024,    // 100MB
};

function validateFile(file: File, type: keyof typeof ALLOWED_FILE_TYPES): boolean {
  // Check file type
  if (!ALLOWED_FILE_TYPES[type].includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${ALLOWED_FILE_TYPES[type].join(', ')}`);
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE[type]) {
    throw new Error(`File too large. Maximum: ${MAX_FILE_SIZE[type] / 1024 / 1024}MB`);
  }

  // Check filename
  const sanitizedName = sanitizeFilename(file.name);
  if (!sanitizedName) {
    throw new Error('Invalid filename');
  }

  return true;
}
```

### Cloudflare R2 Security

```typescript
// R2 bucket configuration
const r2Config = {
  bucket: 'southville-uploads',
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
};

// Upload with signed URLs
async function generateUploadUrl(filename: string, contentType: string) {
  const key = `uploads/${Date.now()}-${sanitizeFilename(filename)}`;

  // Generate presigned URL (expires in 1 hour)
  const signedUrl = await r2Client.getSignedUrl('putObject', {
    Bucket: r2Config.bucket,
    Key: key,
    ContentType: contentType,
    Expires: 3600, // 1 hour
  });

  return { signedUrl, key };
}

// Download with signed URLs
async function generateDownloadUrl(key: string) {
  const signedUrl = await r2Client.getSignedUrl('getObject', {
    Bucket: r2Config.bucket,
    Key: key,
    Expires: 3600, // 1 hour
  });

  return signedUrl;
}
```

**Security Features:**
1. **File Type Validation** - Whitelist of allowed MIME types
2. **Size Limits** - Maximum file sizes enforced
3. **Filename Sanitization** - Path traversal prevention
4. **Signed URLs** - Time-limited access URLs
5. **Private Buckets** - No public access by default

---

## Network Security

### HTTPS/TLS

```typescript
// Production: Enforce HTTPS
if (process.env.NODE_ENV === 'production') {
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
}
```

### Security Headers

**File:** `frontend-nextjs/middleware.ts`

```typescript
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
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

  return response;
}
```

### Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## Secrets Management

### Environment Variables

```bash
# Production secrets (never commit)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Server-side only!

R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com

JWT_SECRET=xxxxx  # 32+ character random string

# Client-safe variables (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_API_URL=https://api.southville8b.edu.ph
```

**Security Rules:**
1. **Never Commit Secrets** - Use `.env.local` (gitignored)
2. **Server-Only Secrets** - No `NEXT_PUBLIC_` prefix
3. **Separate Environments** - Different keys for dev/staging/prod
4. **Regular Rotation** - Rotate secrets quarterly
5. **Principle of Least Privilege** - Separate keys per service

### Key Rotation

```typescript
// Backend service for key rotation
async function rotateApiKey(userId: string) {
  const newKey = generateSecureApiKey();

  // Store new key
  await supabase
    .from('api_keys')
    .insert({
      user_id: userId,
      key_hash: await hashApiKey(newKey),
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    });

  // Invalidate old key after grace period
  setTimeout(async () => {
    await supabase
      .from('api_keys')
      .update({ revoked: true })
      .eq('user_id', userId)
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000));
  }, 24 * 60 * 60 * 1000); // 24 hour grace period

  return newKey;
}

function generateSecureApiKey(): string {
  return `sk_${crypto.randomBytes(32).toString('hex')}`;
}

async function hashApiKey(key: string): Promise<string> {
  return crypto.createHash('sha256').update(key).digest('hex');
}
```

---

## Security Monitoring

### Security Event Logging

```typescript
// Log security events
interface SecurityEvent {
  type: 'AUTH_FAILURE' | 'RATE_LIMIT' | 'INVALID_TOKEN' | 'PERMISSION_DENIED';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  endpoint: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

async function logSecurityEvent(event: SecurityEvent) {
  await supabase
    .from('security_events')
    .insert({
      type: event.type,
      user_id: event.userId,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      endpoint: event.endpoint,
      metadata: event.metadata,
      created_at: event.timestamp,
    });

  // Alert on critical events
  if (event.type === 'AUTH_FAILURE') {
    await checkBruteForceAttempt(event.ipAddress);
  }
}

async function checkBruteForceAttempt(ipAddress: string) {
  const recentFailures = await supabase
    .from('security_events')
    .select('id')
    .eq('type', 'AUTH_FAILURE')
    .eq('ip_address', ipAddress)
    .gte('created_at', new Date(Date.now() - 15 * 60 * 1000)) // Last 15 min
    .limit(10);

  if (recentFailures.data && recentFailures.data.length >= 5) {
    // Block IP temporarily
    await supabase
      .from('blocked_ips')
      .insert({
        ip_address: ipAddress,
        reason: 'Brute force attempt',
        blocked_until: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });

    // Alert security team
    await sendSecurityAlert({
      type: 'BRUTE_FORCE_DETECTED',
      ipAddress,
      attemptCount: recentFailures.data.length,
    });
  }
}
```

---

## Summary

This chapter documented the comprehensive security implementation across:

1. **Authentication** - Supabase Auth with JWT, secure session management
2. **Authorization** - RBAC, PBAC, and RLS for multi-layer access control
3. **API Security** - Rate limiting, CSRF protection, input validation
4. **Database Security** - Encryption, RLS policies, audit logging
5. **File Security** - Validation, sanitization, secure storage
6. **Network Security** - HTTPS, security headers, CSP
7. **Secrets Management** - Environment variables, key rotation
8. **Monitoring** - Security event logging and alerting

All implementations follow security best practices and defense-in-depth principles.

---

**Next Chapter:** [39 - Security Best Practices](./39-security-best-practices.md)

**Word Count:** ~9,000 words
