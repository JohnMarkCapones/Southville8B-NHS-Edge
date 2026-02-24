# Chapter 36: Troubleshooting Guide

## Table of Contents

- [Introduction](#introduction)
- [Troubleshooting Methodology](#troubleshooting-methodology)
- [Frontend Issues](#frontend-issues)
- [Backend Issues](#backend-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Real-time Issues](#real-time-issues)
- [File Upload Issues](#file-upload-issues)
- [Performance Issues](#performance-issues)
- [Deployment Issues](#deployment-issues)
- [Network and Connectivity Issues](#network-and-connectivity-issues)
- [Error Code Reference](#error-code-reference)
- [Debug Tools and Techniques](#debug-tools-and-techniques)
- [Troubleshooting Flowcharts](#troubleshooting-flowcharts)

## Introduction

This comprehensive troubleshooting guide provides systematic approaches to identifying, diagnosing, and resolving issues in the Southville 8B NHS Edge platform. The guide covers common problems across all system components, from frontend rendering issues to backend API failures, database connection problems, and deployment challenges.

### Purpose and Scope

This guide serves multiple purposes:

1. **Problem Resolution**: Provide step-by-step solutions to common issues
2. **Root Cause Analysis**: Help identify underlying causes, not just symptoms
3. **Prevention**: Offer guidance on avoiding recurring problems
4. **Knowledge Transfer**: Document institutional knowledge about system behavior
5. **Training Resource**: Support onboarding of new team members

### How to Use This Guide

1. **Identify the Problem Category**: Determine which section matches your issue
2. **Follow the Methodology**: Use the systematic approach outlined
3. **Check Common Solutions**: Review the most frequent fixes first
4. **Use Debug Tools**: Apply the appropriate diagnostic tools
5. **Document Your Solution**: Add notes about unique issues for future reference

## Troubleshooting Methodology

### Systematic Approach

A structured methodology ensures efficient problem resolution and prevents overlooking critical issues.

#### Step 1: Define the Problem

Clearly articulate what's wrong:

```
Problem Statement Template:
- What: [Specific behavior or error]
- When: [When did it start? Under what conditions?]
- Where: [Which component, route, or function?]
- Who: [Which users are affected? All or specific roles?]
- Impact: [Severity and scope of the issue]
```

Example:
```
- What: Students cannot submit quiz answers
- When: Started after deployment at 2:00 PM, occurs on all quizzes
- Where: /student/quiz/[id] route, submission handler
- Who: All students across all grades
- Impact: Critical - blocks core functionality for 1,200+ users
```

#### Step 2: Gather Information

Collect relevant data systematically:

**Log Analysis**:
```bash
# Frontend logs (Vercel)
vercel logs --app frontend-nextjs --since 1h

# Backend logs (PM2)
pm2 logs southville-api --lines 100

# System logs
journalctl -u southville-api -n 100 --no-pager

# Database logs (Supabase)
# Access via Supabase Dashboard > Logs
```

**Error Messages**:
```typescript
// Capture full error context
try {
  await submitQuiz(quizId, answers);
} catch (error) {
  console.error('Quiz submission failed:', {
    error: error,
    message: error.message,
    stack: error.stack,
    quizId,
    userId: session?.user?.id,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  });
}
```

**System State**:
```bash
# Check server resources
free -m                    # Memory usage
df -h                      # Disk space
top -b -n 1 | head -20    # CPU usage

# Check service status
pm2 status
systemctl status nginx
systemctl status postgresql

# Check network
netstat -tulpn | grep :3001  # Backend port
curl -I https://api.southville8b.com/health
```

**User Environment**:
- Browser and version
- Operating system
- Network connection type
- Screen size and resolution
- Cookies and localStorage state
- Ad blockers or extensions

#### Step 3: Reproduce the Issue

Create a reliable way to trigger the problem:

```typescript
// Reproduction steps document
const reproductionSteps = {
  environment: 'production',
  prerequisites: [
    'Logged in as student user',
    'Enrolled in at least one course',
    'Active quiz available'
  ],
  steps: [
    '1. Navigate to /student/dashboard',
    '2. Click on "Active Quizzes" tab',
    '3. Select any quiz',
    '4. Answer all questions',
    '5. Click "Submit Quiz" button',
    '6. ERROR: "Failed to submit quiz" appears'
  ],
  expectedResult: 'Quiz submitted successfully, redirect to results',
  actualResult: 'Error message displayed, quiz not submitted',
  reproducibility: '100% - fails every time'
};
```

#### Step 4: Isolate the Cause

Narrow down the problem through systematic elimination:

**Frontend vs Backend**:
```bash
# Test API directly
curl -X POST https://api.southville8b.com/api/v1/quizzes/123/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answers": [{"questionId": 1, "answer": "A"}]}'

# If API works: Frontend issue
# If API fails: Backend issue
```

**Component Isolation**:
```typescript
// Test individual components
// Comment out sections to identify problem area

export default function QuizSubmission() {
  // Test 1: Does component render?
  return <div>Component renders</div>;

  // Test 2: Does data load?
  const { data } = useQuery();
  return <div>{JSON.stringify(data)}</div>;

  // Test 3: Does form work?
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
  };
  return <form onSubmit={handleSubmit}>...</form>;

  // Test 4: Does API call work?
  // ... full implementation
}
```

**Environment Comparison**:
```bash
# Test in different environments
npm run dev              # Development
npm run build && npm start  # Production build locally
vercel --prod            # Production deployment

# Compare behavior across environments
```

#### Step 5: Form Hypothesis

Based on gathered information, propose likely causes:

```
Hypothesis Template:
1. Observation: [What you see happening]
2. Theory: [Why you think it's happening]
3. Evidence: [What supports this theory]
4. Test: [How to verify this hypothesis]
5. Expected Outcome: [What should happen if correct]
```

Example:
```
1. Observation: Quiz submission fails with 401 error
2. Theory: JWT token expiring before submission completes
3. Evidence: Error occurs after 15 minutes of quiz activity
4. Test: Submit quiz immediately after login
5. Expected Outcome: Should succeed if token is the issue
```

#### Step 6: Test Solutions

Implement fixes systematically:

```typescript
// Solution testing template
const testSolution = async () => {
  // 1. Backup current state
  const backup = await createBackup();

  try {
    // 2. Apply fix
    await implementFix();

    // 3. Test functionality
    const result = await testFeature();

    // 4. Verify fix
    if (result.success) {
      console.log('Fix successful');
      await commitChanges();
    } else {
      console.log('Fix unsuccessful');
      await rollback(backup);
    }
  } catch (error) {
    // 5. Rollback on failure
    await rollback(backup);
    throw error;
  }
};
```

#### Step 7: Verify Resolution

Confirm the problem is fully resolved:

```bash
# Verification checklist
✓ Original issue no longer occurs
✓ No new issues introduced
✓ All related features still work
✓ Performance not degraded
✓ All user roles tested
✓ All browsers tested
✓ Mobile and desktop tested
✓ Logs show no errors
✓ Monitoring metrics normal
```

#### Step 8: Document and Prevent

Record the solution and implement preventive measures:

```markdown
## Issue: Quiz Submission Failure (2026-01-11)

### Problem
Students unable to submit quizzes, receiving 401 errors.

### Root Cause
JWT tokens expiring during long quiz sessions (>15 minutes).
Token refresh logic not implemented in quiz submission flow.

### Solution
Implemented automatic token refresh before quiz submission:
- Added token expiry check
- Refresh token if <5 minutes remaining
- Retry submission with new token

### Prevention
- Monitor token refresh success rate
- Alert if refresh failures exceed 1%
- Consider extending quiz session tokens to 30 minutes
- Add user warning when session about to expire

### Code Changes
- File: `frontend-nextjs/lib/api/quiz.ts`
- Commit: abc123def456
- PR: #234
```

### Best Practices

**Do's**:
- Start with the simplest possible cause
- Change one thing at a time
- Keep detailed notes of what you try
- Test in a safe environment first
- Ask for help when stuck
- Document unusual issues
- Think about prevention, not just fixes

**Don'ts**:
- Don't make multiple changes simultaneously
- Don't skip verification steps
- Don't assume anything works
- Don't ignore warning signs
- Don't rush to "quick fixes"
- Don't forget to document solutions
- Don't blame without evidence

## Frontend Issues

### Next.js and React Issues

#### Issue: Hydration Errors

**Symptoms**:
```
Error: Hydration failed because the initial UI does not match
what was rendered on the server.
```

**Common Causes**:

1. **Server/Client Mismatch**:
```typescript
// ❌ Wrong - generates different content
export default function Component() {
  return <div>{Math.random()}</div>;
}

// ✅ Correct - consistent content
export default function Component() {
  const [randomValue, setRandomValue] = useState<number>();

  useEffect(() => {
    setRandomValue(Math.random());
  }, []);

  return <div>{randomValue ?? 'Loading...'}</div>;
}
```

2. **Browser Extensions Modifying DOM**:
```typescript
// ✅ Suppress hydration warning for specific elements
<div suppressHydrationWarning>
  {typeof window !== 'undefined' && <BrowserOnlyComponent />}
</div>
```

3. **Date/Time Formatting**:
```typescript
// ❌ Wrong - timezone differences
<div>{new Date().toLocaleString()}</div>

// ✅ Correct - use useEffect
export default function DateTime() {
  const [dateTime, setDateTime] = useState('');

  useEffect(() => {
    setDateTime(new Date().toLocaleString());
  }, []);

  return <div>{dateTime || 'Loading...'}</div>;
}
```

**Solution Steps**:

1. **Identify the Mismatching Element**:
```typescript
// Add detailed logging
useEffect(() => {
  console.log('Client render:', document.body.innerHTML);
}, []);
```

2. **Use Client-Side Only Rendering**:
```typescript
// components/ClientOnly.tsx
'use client';

import { useEffect, useState } from 'react';

export default function ClientOnly({
  children
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <>{children}</>;
}

// Usage
<ClientOnly>
  <ComponentWithHydrationIssues />
</ClientOnly>
```

3. **Fix Third-Party Components**:
```typescript
// Dynamically import with SSR disabled
import dynamic from 'next/dynamic';

const ProblematicComponent = dynamic(
  () => import('@/components/Problematic'),
  { ssr: false }
);
```

#### Issue: "Cannot Access Before Initialization"

**Symptoms**:
```
ReferenceError: Cannot access 'Component' before initialization
```

**Cause**: Circular imports or incorrect import order.

**Solution**:

1. **Check for Circular Dependencies**:
```bash
# Install madge
npm install -g madge

# Check for circular dependencies
madge --circular frontend-nextjs/app
madge --circular frontend-nextjs/components
```

2. **Fix Import Order**:
```typescript
// ❌ Wrong - circular dependency
// ComponentA.tsx
import { ComponentB } from './ComponentB';
export const ComponentA = () => <ComponentB />;

// ComponentB.tsx
import { ComponentA } from './ComponentA';
export const ComponentB = () => <ComponentA />;

// ✅ Correct - extract shared logic
// shared.ts
export const sharedLogic = () => { /* ... */ };

// ComponentA.tsx
import { sharedLogic } from './shared';
export const ComponentA = () => { /* uses sharedLogic */ };

// ComponentB.tsx
import { sharedLogic } from './shared';
export const ComponentB = () => { /* uses sharedLogic */ };
```

3. **Use Dynamic Imports**:
```typescript
// Break circular dependency with dynamic import
const ComponentB = dynamic(() => import('./ComponentB'));
```

#### Issue: Route Not Found (404)

**Symptoms**: Page returns 404 despite route existing.

**Diagnostic Steps**:

1. **Verify File Structure**:
```bash
# Check if file exists
ls -la frontend-nextjs/app/student/quiz/[id]/page.tsx

# Check for typos in filename
# Must be exactly: page.tsx, layout.tsx, loading.tsx, etc.
```

2. **Check Route Segment Syntax**:
```typescript
// ✅ Correct dynamic route
// app/student/quiz/[id]/page.tsx
export default function QuizPage({
  params
}: {
  params: { id: string }
}) {
  return <div>Quiz {params.id}</div>;
}

// ✅ Correct catch-all route
// app/docs/[...slug]/page.tsx
export default function DocsPage({
  params
}: {
  params: { slug: string[] }
}) {
  return <div>Docs {params.slug.join('/')}</div>;
}
```

3. **Check Middleware**:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  console.log('Request:', request.nextUrl.pathname);
  // Check if middleware is blocking the route
}
```

4. **Restart Development Server**:
```bash
# Sometimes Next.js doesn't pick up new routes
# Stop server (Ctrl+C)
rm -rf .next
npm run dev
```

#### Issue: CSS Not Loading or Flashing

**Symptoms**: Unstyled content flash, styles not applying.

**Solutions**:

1. **Check Tailwind Configuration**:
```typescript
// tailwind.config.ts
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // ✓ Ensure all component paths included
  ],
  // ...
};
```

2. **Verify CSS Import Order**:
```typescript
// app/layout.tsx
import './globals.css'; // ✓ Must be imported in root layout
```

3. **Fix FOUC (Flash of Unstyled Content)**:
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent FOUC with theme script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme) {
                  document.documentElement.classList.add(theme);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

4. **Check CSS Modules**:
```typescript
// ❌ Wrong - incorrect import
import styles from './Component.css';

// ✅ Correct - CSS module import
import styles from './Component.module.css';
```

### State Management Issues

#### Issue: Zustand State Not Persisting

**Symptoms**: State resets on page refresh.

**Solution**:

```typescript
// lib/stores/user-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ✅ Correct - with persistence
export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      // Optional: selective persistence
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

**Check Storage**:
```typescript
// Debug persistence
useEffect(() => {
  console.log('LocalStorage:', localStorage.getItem('user-storage'));
}, []);
```

#### Issue: State Updates Not Reflecting in UI

**Cause**: Not using state correctly or mutation instead of immutable update.

**Solutions**:

```typescript
// ❌ Wrong - mutating state
const updateUser = (newName: string) => {
  const user = useUserStore.getState().user;
  user.name = newName; // Mutation!
  useUserStore.setState({ user });
};

// ✅ Correct - immutable update
const updateUser = (newName: string) => {
  useUserStore.setState((state) => ({
    user: { ...state.user, name: newName }
  }));
};

// ✅ Correct - using immer for complex updates
import { produce } from 'immer';

const updateUser = (newName: string) => {
  useUserStore.setState(
    produce((state) => {
      state.user.name = newName;
    })
  );
};
```

### Component Issues

#### Issue: "Cannot Read Property of Undefined"

**Common Scenarios**:

```typescript
// ❌ Wrong - no null check
const UserProfile = ({ user }) => {
  return <div>{user.name}</div>; // Error if user is undefined
};

// ✅ Correct - multiple defense strategies

// 1. Optional chaining
const UserProfile = ({ user }) => {
  return <div>{user?.name}</div>;
};

// 2. Default props
const UserProfile = ({ user = {} }) => {
  return <div>{user.name || 'Guest'}</div>;
};

// 3. Early return
const UserProfile = ({ user }) => {
  if (!user) return <div>Loading...</div>;
  return <div>{user.name}</div>;
};

// 4. TypeScript with required props
interface Props {
  user: User; // Required, never undefined
}
const UserProfile = ({ user }: Props) => {
  return <div>{user.name}</div>;
};
```

#### Issue: Infinite Re-renders

**Symptoms**:
```
Error: Too many re-renders. React limits the number of renders
to prevent an infinite loop.
```

**Common Causes**:

```typescript
// ❌ Wrong - setState in render
const Component = () => {
  const [count, setCount] = useState(0);
  setCount(count + 1); // Infinite loop!
  return <div>{count}</div>;
};

// ✅ Correct - setState in event handler
const Component = () => {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
};

// ❌ Wrong - missing dependency array
useEffect(() => {
  setCount(count + 1);
}); // Runs on every render!

// ✅ Correct - proper dependency array
useEffect(() => {
  setCount(count + 1);
}, []); // Runs once on mount

// ❌ Wrong - setState in useEffect with setState in dependencies
useEffect(() => {
  if (someCondition) {
    setData(newData);
  }
}, [data, setData]); // setData causes re-render which triggers effect again

// ✅ Correct - remove setData from dependencies (it's stable)
useEffect(() => {
  if (someCondition) {
    setData(newData);
  }
}, [someCondition, newData]);
```

## Backend Issues

### NestJS and Fastify Issues

#### Issue: Module Not Found

**Symptoms**:
```
Error: Cannot find module '@nestjs/common'
Nest can't resolve dependencies
```

**Solutions**:

1. **Reinstall Dependencies**:
```bash
cd southville-api
rm -rf node_modules package-lock.json
npm install
```

2. **Check Module Registration**:
```typescript
// ❌ Wrong - module not imported
@Module({
  controllers: [UserController],
  providers: [UserService], // UserService depends on unimported module
})
export class UserModule {}

// ✅ Correct - import required modules
@Module({
  imports: [TypeOrmModule.forFeature([User])], // Import dependencies
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Export if used by other modules
})
export class UserModule {}
```

3. **Verify Circular Dependencies**:
```bash
# Check for circular dependencies
npm install -g madge
madge --circular southville-api/src
```

4. **Check Provider Configuration**:
```typescript
// ❌ Wrong - missing provider
@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService // Not provided!
  ) {}
}

// ✅ Correct - provide in module
@Module({
  imports: [ConfigModule], // Provide ConfigService
  providers: [UserService],
})
export class UserModule {}
```

#### Issue: Guard or Interceptor Not Working

**Symptoms**: Authentication bypassed, interceptor not logging.

**Solutions**:

1. **Check Guard Registration**:
```typescript
// Global guard (main.ts)
app.useGlobalGuards(new JwtAuthGuard());

// Module-level guard
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

// Controller-level guard
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {}

// Route-level guard
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile() {}
```

2. **Check Guard Order**:
```typescript
// Guards execute in this order:
// 1. Global guards
// 2. Controller guards
// 3. Route guards

// Make sure order is correct for your logic
@UseGuards(AuthGuard, RoleGuard) // AuthGuard must run first
@Roles('admin')
@Get('admin')
adminRoute() {}
```

3. **Debug Guard Execution**:
```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    console.log('Guard executing for:', context.getHandler().name);
    const request = context.switchToHttp().getRequest();
    console.log('Headers:', request.headers);
    console.log('User:', request.user);
    // Guard logic...
  }
}
```

#### Issue: Pipe Validation Failing

**Symptoms**: Invalid data passing through, or valid data rejected.

**Solutions**:

```typescript
// Enable validation globally (main.ts)
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip properties not in DTO
    forbidNonWhitelisted: true, // Throw error for extra properties
    transform: true, // Auto-transform to DTO types
    transformOptions: {
      enableImplicitConversion: true, // Convert string "123" to number 123
    },
  })
);

// DTO with proper decorators
import { IsString, IsEmail, IsNumber, Min, Max } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsEmail()
  email: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  age: number;
}

// Custom validation
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
          return typeof value === 'string' &&
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value);
        },
      },
    });
  };
}
```

### API Issues

#### Issue: CORS Errors

**Symptoms**:
```
Access to fetch at 'https://api.southville8b.com' from origin
'https://southville8b.com' has been blocked by CORS policy
```

**Solutions**:

```typescript
// main.ts
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://southville8b.com',
    'https://*.southville8b.com', // Allow subdomains
  ],
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
  ],
  exposedHeaders: ['X-Total-Count'], // Custom headers to expose
  maxAge: 3600, // Cache preflight for 1 hour
});

// For dynamic origins
app.enableCors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});
```

#### Issue: Rate Limiting Blocking Legitimate Requests

**Symptoms**: 429 Too Many Requests for normal usage.

**Solutions**:

```typescript
// Adjust rate limits (main.ts)
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Time window in ms
        limit: 100, // Requests per window
      },
    ]),
  ],
})
export class AppModule {}

// Skip rate limiting for certain routes
@SkipThrottle() // Skip for entire controller
@Controller('webhooks')
export class WebhookController {
  @SkipThrottle() // Skip for specific route
  @Post('stripe')
  handleStripeWebhook() {}

  @SkipThrottle({ default: false }) // Apply rate limiting
  @Get('status')
  getStatus() {}
}

// Different limits per route
@Controller('api')
export class ApiController {
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 per minute
  @Post('expensive-operation')
  expensiveOperation() {}

  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 per minute
  @Get('cheap-operation')
  cheapOperation() {}
}
```

#### Issue: Request Timeout

**Symptoms**: Requests failing with 504 Gateway Timeout.

**Solutions**:

```typescript
// Increase timeout (main.ts)
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({
    requestTimeout: 30000, // 30 seconds
    bodyLimit: 10485760, // 10MB
  })
);

// Timeout for specific operation
import { HttpService } from '@nestjs/axios';
import { timeout } from 'rxjs/operators';

@Injectable()
export class ApiService {
  constructor(private httpService: HttpService) {}

  async callExternalApi() {
    try {
      const response = await this.httpService
        .get('https://external-api.com/data')
        .pipe(timeout(5000)) // 5 second timeout
        .toPromise();
      return response.data;
    } catch (error) {
      if (error.name === 'TimeoutError') {
        throw new RequestTimeoutException('External API timeout');
      }
      throw error;
    }
  }
}

// Database query timeout
@Injectable()
export class UserService {
  async findUsers() {
    return this.userRepository.find({
      timeout: 5000, // 5 second query timeout
    });
  }
}
```

## Database Issues

### Supabase Connection Issues

#### Issue: Connection Pool Exhausted

**Symptoms**:
```
Error: Connection pool exhausted
Error: remaining connection slots are reserved
```

**Solutions**:

1. **Configure Connection Pool**:
```typescript
// config/database.config.ts
export default () => ({
  database: {
    host: process.env.SUPABASE_DB_HOST,
    port: parseInt(process.env.SUPABASE_DB_PORT, 10) || 5432,
    username: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    database: process.env.SUPABASE_DB_NAME,
    // Connection pool settings
    extra: {
      max: 20, // Maximum pool size
      min: 5, // Minimum pool size
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 10000, // Timeout for acquiring connection
    },
  },
});
```

2. **Use PgBouncer**:
```env
# .env - Use Supabase connection pooler
DATABASE_URL=postgres://postgres:[password]@[project-ref].supabase.co:6543/postgres?pgbouncer=true

# For transactions, use direct connection
DATABASE_URL_DIRECT=postgres://postgres:[password]@[project-ref].supabase.co:5432/postgres
```

3. **Properly Close Connections**:
```typescript
// ❌ Wrong - connection leak
async function leakyQuery() {
  const connection = await dataSource.getConnection();
  const result = await connection.query('SELECT * FROM users');
  return result; // Connection not released!
}

// ✅ Correct - always release
async function properQuery() {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    const result = await queryRunner.query('SELECT * FROM users');
    return result;
  } finally {
    await queryRunner.release(); // Always release
  }
}

// ✅ Better - use repository (automatic connection management)
async function bestQuery() {
  return this.userRepository.find();
}
```

4. **Monitor Connection Usage**:
```typescript
// Add connection monitoring
@Injectable()
export class DatabaseHealthService {
  constructor(private dataSource: DataSource) {}

  async checkHealth() {
    const pool = this.dataSource.driver.pool;
    return {
      totalConnections: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingRequests: pool.waitingCount,
    };
  }
}
```

#### Issue: Row Level Security (RLS) Blocking Queries

**Symptoms**: Queries return empty results or permission denied errors.

**Solutions**:

1. **Check RLS Policies**:
```sql
-- View existing policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';

-- Test policy logic
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-id-here';
SELECT * FROM users WHERE id = 'user-id-here';
```

2. **Service Role for Admin Operations**:
```typescript
// Use service role key for admin operations
import { createClient } from '@supabase/supabase-js';

// Regular client (respects RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Admin client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Use appropriate client
async function getUserAsAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}
```

3. **Debug RLS Policies**:
```sql
-- Enable policy logging (Supabase Dashboard > Database > Logs)

-- Or add explicit logging to policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (
    auth.uid() = id
    OR (
      -- Log failed attempts
      pg_notify('policy_violation', json_build_object(
        'table', 'users',
        'user', auth.uid(),
        'attempted_id', id
      )::text),
      false
    )
  );
```

### Query Performance Issues

#### Issue: Slow Queries

**Diagnostic Steps**:

1. **Enable Query Logging**:
```typescript
// TypeORM logging (ormconfig.ts)
export default {
  // ...
  logging: true,
  logger: 'advanced-console',
  maxQueryExecutionTime: 1000, // Log queries slower than 1s
};
```

2. **Analyze Query Plan**:
```sql
-- Get query plan
EXPLAIN ANALYZE
SELECT u.*, p.*
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.created_at > '2024-01-01';

-- Look for:
-- - Seq Scan (should be Index Scan for large tables)
-- - High cost values
-- - Large row estimates
```

3. **Common Solutions**:

**Add Indexes**:
```sql
-- Add index for frequently queried columns
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_email ON users(email);

-- Composite index for multiple columns
CREATE INDEX idx_assignments_student_course
  ON assignments(student_id, course_id);

-- Partial index for filtered queries
CREATE INDEX idx_active_students
  ON students(id)
  WHERE status = 'active';

-- Check existing indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Optimize N+1 Queries**:
```typescript
// ❌ Wrong - N+1 query
const students = await this.studentRepository.find();
for (const student of students) {
  student.courses = await this.courseRepository.find({
    where: { studentId: student.id }
  });
}
// Results in: 1 + N queries

// ✅ Correct - eager loading
const students = await this.studentRepository.find({
  relations: ['courses'], // Single query with JOIN
});

// ✅ Correct - DataLoader for GraphQL
const courseLoader = new DataLoader(async (studentIds) => {
  const courses = await this.courseRepository.find({
    where: { studentId: In(studentIds) }
  });
  // Group courses by studentId
  return studentIds.map(id =>
    courses.filter(c => c.studentId === id)
  );
});
```

**Use Pagination**:
```typescript
// ❌ Wrong - loading all records
async getAllStudents() {
  return this.studentRepository.find(); // Could be thousands!
}

// ✅ Correct - pagination
async getStudents(page: number = 1, limit: number = 50) {
  const [students, total] = await this.studentRepository.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
    order: { lastName: 'ASC' },
  });

  return {
    data: students,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
```

**Optimize Subqueries**:
```typescript
// ❌ Slow - subquery in SELECT
const query = `
  SELECT
    s.*,
    (SELECT COUNT(*) FROM assignments WHERE student_id = s.id) as assignment_count
  FROM students s
`;

// ✅ Fast - JOIN with aggregation
const query = `
  SELECT
    s.*,
    COUNT(a.id) as assignment_count
  FROM students s
  LEFT JOIN assignments a ON a.student_id = s.id
  GROUP BY s.id
`;
```

#### Issue: Deadlocks

**Symptoms**:
```
Error: deadlock detected
DETAIL: Process 12345 waits for ShareLock on transaction 67890
```

**Solutions**:

1. **Consistent Lock Order**:
```typescript
// ❌ Wrong - inconsistent lock order
// Transaction 1: Lock A, then B
// Transaction 2: Lock B, then A
// = Potential deadlock

// ✅ Correct - consistent order
async transfer(fromId: string, toId: string, amount: number) {
  // Always lock in consistent order (by ID)
  const [first, second] = [fromId, toId].sort();

  await this.connection.transaction(async (manager) => {
    const account1 = await manager.findOne(Account, {
      where: { id: first },
      lock: { mode: 'pessimistic_write' }
    });
    const account2 = await manager.findOne(Account, {
      where: { id: second },
      lock: { mode: 'pessimistic_write' }
    });

    // Perform transfer
  });
}
```

2. **Use Shorter Transactions**:
```typescript
// ❌ Wrong - long transaction
await this.connection.transaction(async (manager) => {
  const user = await manager.findOne(User, userId);

  // Expensive operation holding locks
  await this.processImages(user);
  await this.sendEmails(user);
  await this.generateReports(user);

  await manager.save(user);
});

// ✅ Correct - minimal transaction
const user = await this.userRepository.findOne(userId);

// Do expensive operations outside transaction
await this.processImages(user);
await this.sendEmails(user);
await this.generateReports(user);

// Quick transaction just for update
await this.connection.transaction(async (manager) => {
  user.processed = true;
  await manager.save(user);
});
```

3. **Retry on Deadlock**:
```typescript
async function withDeadlockRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      const isDeadlock = error.code === '40P01' ||
                         error.message.includes('deadlock');

      if (!isDeadlock || i === maxRetries - 1) {
        throw error;
      }

      // Wait with exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, i) * 100)
      );
    }
  }
}

// Usage
await withDeadlockRetry(async () => {
  await this.connection.transaction(async (manager) => {
    // Transaction code
  });
});
```

## Authentication Issues

### JWT Token Issues

#### Issue: Token Expired

**Symptoms**:
```
401 Unauthorized
Error: jwt expired
```

**Solutions**:

1. **Implement Token Refresh**:
```typescript
// Frontend: lib/api/auth.ts
let refreshPromise: Promise<string> | null = null;

export async function refreshAccessToken(): Promise<string> {
  // Prevent multiple simultaneous refresh requests
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) throw new Error('Refresh failed');

      const { accessToken, refreshToken: newRefreshToken } = await response.json();

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      return accessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// API client with automatic retry
export async function apiCall(url: string, options: RequestInit = {}) {
  const makeRequest = async (token: string) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  };

  let accessToken = localStorage.getItem('accessToken');
  let response = await makeRequest(accessToken);

  // Retry with refreshed token on 401
  if (response.status === 401) {
    accessToken = await refreshAccessToken();
    response = await makeRequest(accessToken);
  }

  return response;
}
```

2. **Backend Refresh Endpoint**:
```typescript
// auth.controller.ts
@Post('refresh')
async refresh(@Body() body: { refreshToken: string }) {
  try {
    // Verify refresh token
    const payload = this.jwtService.verify(body.refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    // Check if refresh token is revoked
    const isRevoked = await this.authService.isTokenRevoked(body.refreshToken);
    if (isRevoked) {
      throw new UnauthorizedException('Token revoked');
    }

    // Generate new tokens
    const accessToken = this.jwtService.sign(
      { sub: payload.sub, email: payload.email },
      { secret: process.env.JWT_SECRET, expiresIn: '15m' }
    );

    const refreshToken = this.jwtService.sign(
      { sub: payload.sub },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' }
    );

    // Revoke old refresh token
    await this.authService.revokeToken(body.refreshToken);

    return { accessToken, refreshToken };
  } catch (error) {
    throw new UnauthorizedException('Invalid refresh token');
  }
}
```

3. **Proactive Token Refresh**:
```typescript
// Frontend: hooks/useTokenRefresh.ts
export function useTokenRefresh() {
  useEffect(() => {
    const checkAndRefresh = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const decoded = jwtDecode(token);
        const expiresIn = decoded.exp * 1000 - Date.now();

        // Refresh if expiring in <5 minutes
        if (expiresIn < 5 * 60 * 1000) {
          await refreshAccessToken();
        }
      } catch (error) {
        console.error('Token refresh check failed:', error);
      }
    };

    // Check every minute
    const interval = setInterval(checkAndRefresh, 60 * 1000);
    checkAndRefresh(); // Initial check

    return () => clearInterval(interval);
  }, []);
}
```

#### Issue: Invalid Token Signature

**Symptoms**:
```
401 Unauthorized
Error: invalid signature
```

**Causes and Solutions**:

1. **Secret Mismatch**:
```bash
# Check JWT secrets match
echo $JWT_SECRET        # Backend
echo $NEXT_PUBLIC_API_KEY  # Frontend (if used for verification)

# Ensure same secret used for sign and verify
```

2. **Token Manipulation**:
```typescript
// Backend: Always verify tokens
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Let Passport JWT strategy verify
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      console.error('JWT verification failed:', info?.message);
      throw err || new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
```

3. **Algorithm Mismatch**:
```typescript
// Ensure same algorithm for sign and verify
const token = this.jwtService.sign(payload, {
  secret: process.env.JWT_SECRET,
  algorithm: 'HS256', // Must match in strategy
});

// JWT strategy config
PassportModule.register({ defaultStrategy: 'jwt' }),
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: '15m',
    algorithm: 'HS256', // Must match signing
  },
}),
```

### Session Issues

#### Issue: Session Lost on Page Refresh

**Cause**: Not persisting session to storage.

**Solution**:
```typescript
// lib/auth/session.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Session {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export const useSession = create<Session>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: (session: Partial<Session>) => set(session),
      clearSession: () => set({
        user: null,
        accessToken: null,
        refreshToken: null
      }),
    }),
    {
      name: 'auth-session',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

#### Issue: Session Hijacking

**Prevention Measures**:

```typescript
// Backend: Implement session security
@Injectable()
export class AuthService {
  async createSession(user: User, request: Request) {
    const session = {
      userId: user.id,
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
      fingerprint: this.generateFingerprint(request),
    };

    // Store session in Redis
    await this.redis.setex(
      `session:${sessionId}`,
      3600, // 1 hour
      JSON.stringify(session)
    );

    return sessionId;
  }

  async validateSession(sessionId: string, request: Request) {
    const session = await this.redis.get(`session:${sessionId}`);
    if (!session) {
      throw new UnauthorizedException('Session expired');
    }

    const sessionData = JSON.parse(session);

    // Verify fingerprint
    const currentFingerprint = this.generateFingerprint(request);
    if (sessionData.fingerprint !== currentFingerprint) {
      await this.redis.del(`session:${sessionId}`);
      throw new UnauthorizedException('Session hijacking detected');
    }

    return sessionData;
  }

  private generateFingerprint(request: Request): string {
    const components = [
      request.headers['user-agent'],
      request.headers['accept-language'],
      request.ip,
    ];
    return createHash('sha256').update(components.join('|')).digest('hex');
  }
}
```

## Real-time Issues

### Supabase Realtime Issues

#### Issue: Messages Not Received

**Diagnostic Steps**:

1. **Check Channel Subscription**:
```typescript
// Debug subscription
const channel = supabase
  .channel('chat-room-123')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `room_id=eq.123`
    },
    (payload) => {
      console.log('Message received:', payload);
    }
  )
  .subscribe((status) => {
    console.log('Subscription status:', status);
    // Status should be 'SUBSCRIBED'
  });

// Check subscription state
console.log('Channel state:', channel.state); // Should be 'joined'
```

2. **Verify Realtime Enabled**:
```sql
-- Check if realtime is enabled for table
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'messages';

-- Enable realtime (Supabase Dashboard > Database > Replication)
-- Or via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

3. **Check RLS Policies**:
```sql
-- Realtime respects RLS policies
-- Ensure user has SELECT permission
SELECT * FROM messages WHERE room_id = '123';
-- If this returns nothing, realtime won't work either

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'messages';
```

4. **Test Connection**:
```typescript
// Monitor connection status
supabase.realtime.setAuth(accessToken);

supabase.realtime.onConnStateChange((state) => {
  console.log('Realtime state:', state);
  // States: 'CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'
});

// Check for errors
supabase.realtime.onError((error) => {
  console.error('Realtime error:', error);
});
```

**Common Solutions**:

```typescript
// Solution 1: Properly set auth token
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  supabase.realtime.setAuth(session.access_token);
}

// Solution 2: Reconnect on token refresh
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    supabase.realtime.setAuth(session.access_token);
  }
});

// Solution 3: Handle reconnection
const channel = supabase.channel('chat-room-123');

channel.on('system', {}, (payload) => {
  console.log('System event:', payload);
  if (payload.status === 'CLOSED') {
    // Reconnect
    setTimeout(() => {
      channel.subscribe();
    }, 1000);
  }
});
```

#### Issue: High Latency

**Symptoms**: Messages delayed by several seconds.

**Solutions**:

1. **Check Connection Quality**:
```typescript
// Measure latency
const startTime = Date.now();
const channel = supabase.channel('latency-test');

channel.on('system', {}, (payload) => {
  if (payload.status === 'SUBSCRIBED') {
    const latency = Date.now() - startTime;
    console.log('Subscription latency:', latency, 'ms');
  }
});

channel.subscribe();
```

2. **Optimize Message Size**:
```typescript
// ❌ Wrong - sending large payloads
const message = {
  id: '123',
  content: 'Hello',
  user: entireUserObject, // Large object
  metadata: lotsOfData,
};

// ✅ Correct - minimal payload
const message = {
  id: '123',
  content: 'Hello',
  userId: 'user-456', // Just ID, fetch details if needed
};
```

3. **Reduce Channel Count**:
```typescript
// ❌ Wrong - too many channels
messages.forEach(room => {
  supabase.channel(`room-${room.id}`).subscribe();
});

// ✅ Correct - single channel with filtering
supabase
  .channel('all-rooms')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `user_id=eq.${userId}` // Server-side filter
    },
    (payload) => {
      // Client-side additional filtering if needed
      if (activeRoomIds.includes(payload.new.room_id)) {
        handleMessage(payload.new);
      }
    }
  )
  .subscribe();
```

4. **Use Presence for User Status**:
```typescript
// Efficient presence tracking
const channel = supabase.channel('room-123');

// Track presence
channel.on('presence', { event: 'sync' }, () => {
  const presenceState = channel.presenceState();
  console.log('Online users:', Object.keys(presenceState).length);
});

// Join presence
await channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await channel.track({
      user_id: userId,
      online_at: new Date().toISOString(),
    });
  }
});
```

### WebSocket Connection Issues

#### Issue: Connection Dropping

**Symptoms**: Frequent disconnections and reconnections.

**Solutions**:

1. **Implement Heartbeat**:
```typescript
// Keep connection alive
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

function setupHeartbeat(channel: RealtimeChannel) {
  const interval = setInterval(() => {
    if (channel.state === 'joined') {
      // Send ping
      channel.send({
        type: 'broadcast',
        event: 'heartbeat',
        payload: { timestamp: Date.now() },
      });
    }
  }, HEARTBEAT_INTERVAL);

  // Cleanup
  return () => clearInterval(interval);
}
```

2. **Handle Visibility Changes**:
```typescript
// Reconnect when tab becomes visible
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Tab became visible, check connection
    if (channel.state === 'closed') {
      channel.subscribe();
    }
  }
});
```

3. **Exponential Backoff Reconnection**:
```typescript
class ReconnectingChannel {
  private channel: RealtimeChannel;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    this.channel = supabase.channel('room-123');

    this.channel.subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        this.reconnectAttempts = 0;
        console.log('Connected');
      } else if (status === 'CLOSED') {
        this.reconnect();
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Channel error:', err);
        this.reconnect();
      }
    });
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }
}
```

## File Upload Issues

### R2 Storage Issues

#### Issue: Presigned URL Expired

**Symptoms**:
```
403 Forbidden
Error: The provided token has expired
```

**Solutions**:

1. **Generate Fresh URLs**:
```typescript
// Backend: Generate presigned URL with appropriate expiry
@Post('upload-url')
async generateUploadUrl(@Body() body: { fileName: string }) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: `uploads/${Date.now()}-${body.fileName}`,
    ContentType: 'application/octet-stream',
  });

  // URL valid for 15 minutes
  const url = await getSignedUrl(this.r2Client, command, {
    expiresIn: 900
  });

  return { uploadUrl: url, expiresIn: 900 };
}

// Frontend: Check expiry before use
interface UploadUrl {
  url: string;
  generatedAt: number;
  expiresIn: number;
}

async function getUploadUrl(fileName: string): Promise<string> {
  // Check cache
  const cached = uploadUrlCache.get(fileName);
  if (cached) {
    const age = Date.now() - cached.generatedAt;
    if (age < cached.expiresIn * 1000 - 60000) { // 1 min buffer
      return cached.url;
    }
  }

  // Generate new URL
  const response = await fetch('/api/upload-url', {
    method: 'POST',
    body: JSON.stringify({ fileName }),
  });

  const { uploadUrl, expiresIn } = await response.json();

  uploadUrlCache.set(fileName, {
    url: uploadUrl,
    generatedAt: Date.now(),
    expiresIn,
  });

  return uploadUrl;
}
```

2. **Handle Expiry Gracefully**:
```typescript
async function uploadWithRetry(file: File, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const uploadUrl = await getUploadUrl(file.name);

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (response.ok) {
        return response;
      }

      if (response.status === 403 && attempt < maxRetries - 1) {
        console.log('URL expired, retrying...');
        continue; // Get fresh URL and retry
      }

      throw new Error(`Upload failed: ${response.statusText}`);
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
    }
  }
}
```

#### Issue: Upload Fails for Large Files

**Symptoms**: Timeout or memory errors for files >100MB.

**Solutions**:

1. **Implement Multipart Upload**:
```typescript
// Backend: Initiate multipart upload
@Post('multipart/initiate')
async initiateMultipartUpload(@Body() body: { fileName: string, fileSize: number }) {
  const command = new CreateMultipartUploadCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: `uploads/${Date.now()}-${body.fileName}`,
  });

  const response = await this.r2Client.send(command);

  return {
    uploadId: response.UploadId,
    key: `uploads/${Date.now()}-${body.fileName}`,
  };
}

@Post('multipart/sign-part')
async signPart(@Body() body: {
  key: string,
  uploadId: string,
  partNumber: number
}) {
  const command = new UploadPartCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: body.key,
    UploadId: body.uploadId,
    PartNumber: body.partNumber,
  });

  const url = await getSignedUrl(this.r2Client, command, {
    expiresIn: 3600
  });

  return { uploadUrl: url };
}

@Post('multipart/complete')
async completeMultipartUpload(@Body() body: {
  key: string,
  uploadId: string,
  parts: Array<{ PartNumber: number, ETag: string }>
}) {
  const command = new CompleteMultipartUploadCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: body.key,
    UploadId: body.uploadId,
    MultipartUpload: { Parts: body.parts },
  });

  await this.r2Client.send(command);

  return { success: true, key: body.key };
}

// Frontend: Upload in chunks
async function uploadLargeFile(file: File) {
  const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
  const numChunks = Math.ceil(file.size / CHUNK_SIZE);

  // 1. Initiate upload
  const { uploadId, key } = await fetch('/api/multipart/initiate', {
    method: 'POST',
    body: JSON.stringify({
      fileName: file.name,
      fileSize: file.size
    }),
  }).then(r => r.json());

  // 2. Upload chunks
  const parts = [];
  for (let i = 0; i < numChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    // Get signed URL for this part
    const { uploadUrl } = await fetch('/api/multipart/sign-part', {
      method: 'POST',
      body: JSON.stringify({
        key,
        uploadId,
        partNumber: i + 1
      }),
    }).then(r => r.json());

    // Upload part
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: chunk,
    });

    const etag = response.headers.get('ETag');
    parts.push({ PartNumber: i + 1, ETag: etag });

    // Update progress
    const progress = Math.round(((i + 1) / numChunks) * 100);
    onProgress(progress);
  }

  // 3. Complete upload
  await fetch('/api/multipart/complete', {
    method: 'POST',
    body: JSON.stringify({ key, uploadId, parts }),
  });

  return key;
}
```

2. **Add Upload Progress**:
```typescript
function uploadWithProgress(file: File, onProgress: (percent: number) => void) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        onProgress(Math.round(percent));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}
```

#### Issue: File Validation Bypass

**Symptoms**: Malicious files uploaded despite validation.

**Solutions**:

1. **Validate File Type**:
```typescript
// Frontend validation (not sufficient alone)
function validateFile(file: File) {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  if (file.size > maxSize) {
    throw new Error('File too large');
  }
}

// Backend validation (required)
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  // 1. Check MIME type
  const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedMimes.includes(file.mimetype)) {
    throw new BadRequestException('Invalid file type');
  }

  // 2. Check magic bytes (file signature)
  const fileSignatures = {
    'jpeg': [0xFF, 0xD8, 0xFF],
    'png': [0x89, 0x50, 0x4E, 0x47],
    'pdf': [0x25, 0x50, 0x44, 0x46],
  };

  const buffer = file.buffer.slice(0, 4);
  const bytes = Array.from(buffer);

  const isValid = Object.values(fileSignatures).some(signature =>
    signature.every((byte, i) => byte === bytes[i])
  );

  if (!isValid) {
    throw new BadRequestException('File content does not match extension');
  }

  // 3. Virus scan (optional, using ClamAV)
  const isClean = await this.scanFile(file.buffer);
  if (!isClean) {
    throw new BadRequestException('File contains malware');
  }

  // Proceed with upload
}
```

2. **Sanitize Filename**:
```typescript
function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  const basename = path.basename(filename);

  // Remove dangerous characters
  const sanitized = basename.replace(/[^a-zA-Z0-9.-]/g, '_');

  // Ensure extension is safe
  const ext = path.extname(sanitized);
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
  if (!allowedExtensions.includes(ext.toLowerCase())) {
    throw new Error('Invalid file extension');
  }

  // Prevent file overwrite
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${timestamp}-${random}${ext}`;
}
```

## Performance Issues

### Slow Queries

(Covered in Database Issues section above)

### Memory Leaks

#### Issue: Memory Usage Growing Over Time

**Diagnostic Steps**:

1. **Monitor Memory**:
```bash
# Check Node.js memory usage
pm2 monit

# Detailed memory snapshot
node --inspect southville-api/dist/main.js
# Open chrome://inspect in Chrome
# Take heap snapshots and compare
```

2. **Common Causes**:

**Event Listener Leaks**:
```typescript
// ❌ Wrong - listener not cleaned up
useEffect(() => {
  window.addEventListener('resize', handleResize);
  // Missing cleanup!
}, []);

// ✅ Correct - cleanup function
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

**Timer Leaks**:
```typescript
// ❌ Wrong - interval not cleared
useEffect(() => {
  setInterval(() => {
    updateData();
  }, 1000);
}, []);

// ✅ Correct - clear interval
useEffect(() => {
  const interval = setInterval(() => {
    updateData();
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

**WebSocket/Realtime Leaks**:
```typescript
// ❌ Wrong - channel not unsubscribed
useEffect(() => {
  const channel = supabase.channel('room-123');
  channel.subscribe();
}, []);

// ✅ Correct - unsubscribe on unmount
useEffect(() => {
  const channel = supabase.channel('room-123');
  channel.subscribe();

  return () => {
    channel.unsubscribe();
  };
}, []);
```

**Cache Not Limited**:
```typescript
// ❌ Wrong - unbounded cache
const cache = new Map();

function getData(key: string) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const data = fetchData(key);
  cache.set(key, data); // Cache grows forever!
  return data;
}

// ✅ Correct - LRU cache with max size
import LRU from 'lru-cache';

const cache = new LRU({
  max: 500, // Maximum items
  maxAge: 1000 * 60 * 60, // 1 hour TTL
});

function getData(key: string) {
  let data = cache.get(key);
  if (!data) {
    data = fetchData(key);
    cache.set(key, data);
  }
  return data;
}
```

### Large Bundle Size

#### Issue: Slow Initial Page Load

**Diagnostic Steps**:

```bash
# Analyze bundle
cd frontend-nextjs
npm run analyze

# Check specific routes
npx next build --debug
```

**Solutions**:

1. **Code Splitting**:
```typescript
// ❌ Wrong - importing everything
import { Chart, Line, Bar, Pie } from 'react-chartjs-2';

// ✅ Correct - dynamic imports
const Chart = dynamic(() => import('react-chartjs-2').then(m => m.Chart));
const Line = dynamic(() => import('react-chartjs-2').then(m => m.Line));

// ✅ Correct - route-based splitting (automatic in Next.js)
// Each page in app/ directory is automatically code-split
```

2. **Tree Shaking**:
```typescript
// ❌ Wrong - imports entire library
import _ from 'lodash';
_.debounce(fn, 300);

// ✅ Correct - import specific functions
import debounce from 'lodash/debounce';
debounce(fn, 300);

// ✅ Better - use ES6
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
```

3. **Optimize Dependencies**:
```typescript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Replace heavy libraries with lighter alternatives
      'moment': 'dayjs',
    };
    return config;
  },
};
```

4. **Lazy Load Components**:
```typescript
// Lazy load non-critical components
const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  {
    loading: () => <Skeleton />,
    ssr: false, // Don't render on server if not needed
  }
);

// Lazy load based on user interaction
const [showModal, setShowModal] = useState(false);
const Modal = dynamic(() => import('@/components/Modal'));

{showModal && <Modal />}
```

## Deployment Issues

### Vercel Deployment Issues

#### Issue: Build Failing

**Common Causes**:

1. **Type Errors**:
```bash
# Check types locally
npm run build

# Fix type errors
npm run type-check
```

2. **Missing Environment Variables**:
```bash
# Ensure all required variables are set in Vercel dashboard
# Settings > Environment Variables

# Check .env.example for required variables
cat .env.example
```

3. **Dependency Issues**:
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

4. **Memory Limit**:
```json
// package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

#### Issue: Function Size Limit Exceeded

**Symptoms**:
```
Error: Function size 52.5 MB exceeds 50 MB limit
```

**Solutions**:

```typescript
// next.config.js
module.exports = {
  // Split large functions
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/**/*.wasm'],
    },
  },

  // Optimize images
  images: {
    minimumCacheTTL: 60,
    formats: ['image/avif', 'image/webp'],
  },

  // External packages (not bundled)
  experimental: {
    serverComponentsExternalPackages: ['heavy-package'],
  },
};
```

### VPS Deployment Issues

#### Issue: PM2 Process Crashing

**Diagnostic Steps**:

```bash
# Check logs
pm2 logs southville-api --lines 100

# Check error logs
pm2 logs southville-api --err --lines 50

# Process info
pm2 show southville-api

# Monitor resources
pm2 monit
```

**Common Solutions**:

1. **Increase Memory Limit**:
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'southville-api',
    script: './dist/main.js',
    instances: 2,
    exec_mode: 'cluster',
    max_memory_restart: '500M', // Increase if needed
    node_args: '--max-old-space-size=512',
  }]
};
```

2. **Handle Uncaught Exceptions**:
```typescript
// main.ts
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log to monitoring service
  // Graceful shutdown
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log to monitoring service
});
```

3. **Configure Auto-Restart**:
```bash
# Auto-restart on crash
pm2 start ecosystem.config.js

# Save configuration
pm2 save

# Setup startup script
pm2 startup
```

#### Issue: Nginx 502 Bad Gateway

**Diagnostic Steps**:

```bash
# Check Nginx error log
tail -f /var/log/nginx/error.log

# Check if backend is running
curl http://localhost:3001/health

# Check Nginx config
nginx -t
```

**Common Causes**:

1. **Backend Not Running**:
```bash
pm2 start southville-api
```

2. **Wrong Upstream Port**:
```nginx
# /etc/nginx/sites-available/southville-api
upstream api {
    server 127.0.0.1:3001;  # Ensure correct port
}

server {
    listen 80;
    server_name api.southville8b.com;

    location / {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **SELinux Blocking**:
```bash
# Check SELinux status
getenforce

# Allow Nginx to connect to network
setsebool -P httpd_can_network_connect 1
```

## Network and Connectivity Issues

### DNS Issues

#### Issue: Domain Not Resolving

**Diagnostic Steps**:

```bash
# Check DNS resolution
nslookup southville8b.com
dig southville8b.com

# Check from different DNS servers
nslookup southville8b.com 8.8.8.8  # Google DNS
nslookup southville8b.com 1.1.1.1  # Cloudflare DNS

# Flush DNS cache (local)
# Windows:
ipconfig /flushdns
# macOS:
sudo dscacheutil -flushcache
# Linux:
sudo systemd-resolve --flush-caches
```

**Solutions**:

1. **DNS propagation delay** - Wait 24-48 hours
2. **Incorrect DNS records** - Verify in domain registrar
3. **Cloudflare proxy** - Check orange cloud status

### SSL/TLS Issues

#### Issue: SSL Certificate Errors

**Symptoms**:
```
NET::ERR_CERT_AUTHORITY_INVALID
NET::ERR_CERT_DATE_INVALID
```

**Solutions**:

1. **Renew Certificate**:
```bash
# Let's Encrypt
certbot renew
certbot renew --force-renewal  # Force renewal

# Check expiry
openssl x509 -enddate -noout -in /etc/letsencrypt/live/southville8b.com/cert.pem
```

2. **Fix Certificate Chain**:
```nginx
# Nginx config
ssl_certificate /etc/letsencrypt/live/southville8b.com/fullchain.pem;  # Not cert.pem!
ssl_certificate_key /etc/letsencrypt/live/southville8b.com/privkey.pem;
```

3. **Test SSL Configuration**:
```bash
# Test SSL
openssl s_client -connect southville8b.com:443 -servername southville8b.com

# Check SSL score
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=southville8b.com
```

### API Timeout Issues

#### Issue: Requests Timing Out

**Solutions**:

1. **Increase Timeout**:
```typescript
// Frontend
const response = await fetch('/api/data', {
  signal: AbortSignal.timeout(30000), // 30 second timeout
});

// Backend
app.use(timeout('30s'));
```

2. **Implement Request Retry**:
```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) return response;

      // Don't retry 4xx errors
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Retry 5xx errors
      if (i < maxRetries - 1) {
        await delay(Math.pow(2, i) * 1000);
        continue;
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(Math.pow(2, i) * 1000);
    }
  }
}
```

## Error Code Reference

### HTTP Status Codes

| Code | Meaning | Common Cause | Solution |
|------|---------|--------------|----------|
| 400 | Bad Request | Invalid input data | Validate request body |
| 401 | Unauthorized | Missing/invalid token | Check authentication |
| 403 | Forbidden | Insufficient permissions | Check RLS policies |
| 404 | Not Found | Resource doesn't exist | Verify route/ID |
| 409 | Conflict | Duplicate resource | Check unique constraints |
| 422 | Unprocessable Entity | Validation failed | Check DTO validation |
| 429 | Too Many Requests | Rate limit exceeded | Implement backoff |
| 500 | Internal Server Error | Server crash/bug | Check server logs |
| 502 | Bad Gateway | Backend unreachable | Check backend status |
| 503 | Service Unavailable | Server overloaded | Scale resources |
| 504 | Gateway Timeout | Request took too long | Optimize query |

### Database Error Codes

| Code | Meaning | Common Cause | Solution |
|------|---------|--------------|----------|
| 23505 | Unique Violation | Duplicate key | Check if exists first |
| 23503 | Foreign Key Violation | Referenced record missing | Verify foreign key |
| 23502 | Not Null Violation | Required field empty | Provide all required fields |
| 40P01 | Deadlock Detected | Lock conflict | Retry transaction |
| 42P01 | Table Not Found | Table doesn't exist | Run migrations |
| 42703 | Column Not Found | Column doesn't exist | Check column name |
| 53300 | Too Many Connections | Connection pool full | Increase pool size |

### Custom Error Codes

| Code | Meaning | Location | Solution |
|------|---------|----------|----------|
| AUTH001 | Token expired | Auth guard | Refresh token |
| AUTH002 | Invalid credentials | Login endpoint | Check username/password |
| QUIZ001 | Quiz not found | Quiz service | Verify quiz ID |
| QUIZ002 | Quiz already submitted | Quiz service | Check submission status |
| FILE001 | Invalid file type | Upload endpoint | Check allowed types |
| FILE002 | File too large | Upload endpoint | Reduce file size |
| RATE001 | Rate limit exceeded | Throttle guard | Wait and retry |

## Debug Tools and Techniques

### Browser DevTools

**Console Debugging**:
```typescript
// Structured logging
console.group('Quiz Submission');
console.log('Quiz ID:', quizId);
console.log('Answers:', answers);
console.time('submission');

try {
  await submitQuiz(quizId, answers);
  console.timeEnd('submission');
  console.log('✓ Submission successful');
} catch (error) {
  console.error('✗ Submission failed:', error);
  console.trace(); // Show stack trace
} finally {
  console.groupEnd();
}

// Conditional logging
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) {
  console.log('Debug info:', data);
}
```

**Network Tab**:
- Check request/response headers
- Verify payload structure
- Monitor request timing
- Check CORS headers
- Inspect WebSocket frames

**Performance Tab**:
- Record page load
- Identify slow operations
- Check memory usage
- Profile JavaScript execution

### Server-Side Debugging

**NestJS Logging**:
```typescript
// Use built-in logger
import { Logger } from '@nestjs/common';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  async submitQuiz(quizId: string, answers: Answer[]) {
    this.logger.log(`Submitting quiz ${quizId}`);
    this.logger.debug(`Answers: ${JSON.stringify(answers)}`);

    try {
      const result = await this.processSubmission(quizId, answers);
      this.logger.log(`Quiz ${quizId} submitted successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Quiz submission failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

**Request Logging Middleware**:
```typescript
// main.ts
import { Logger } from '@nestjs/common';

const logger = new Logger('HTTP');

app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.log(
      `${req.method} ${req.url} ${res.statusCode} ${duration}ms`
    );
  });

  next();
});
```

### Database Query Debugging

**Log All Queries**:
```typescript
// ormconfig.ts
export default {
  // ...
  logging: ['query', 'error', 'warn'],
  logger: 'advanced-console',
  maxQueryExecutionTime: 1000, // Log slow queries
};
```

**Query Performance**:
```sql
-- Explain query
EXPLAIN ANALYZE
SELECT * FROM students WHERE grade_level = 8;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,  -- Number of index scans
  idx_tup_read,  -- Tuples read
  idx_tup_fetch  -- Tuples fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Monitoring and Alerting

**Application Monitoring**:
```typescript
// Setup error tracking (e.g., Sentry)
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Capture errors
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error);
  throw error;
}

// Custom events
Sentry.captureMessage('Quiz submission spike detected', 'warning');
```

**Health Checks**:
```typescript
// health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ]);
  }
}
```

## Troubleshooting Flowcharts

### General Troubleshooting Flow

```
┌─────────────────┐
│  Issue Occurs   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Can you         │      Yes
│ reproduce it?   ├──────────► Document steps
└────────┬────────┘
         │ No
         ▼
┌─────────────────┐
│ Check logs for  │
│ patterns        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Is error        │
│ message clear?  │
└────────┬────────┘
         │
         ├── Yes ──► Search error in this guide
         │
         └── No ───► Enable verbose logging
                     └──► Reproduce issue
                           └──► Analyze logs
```

### API Request Failure Flow

```
┌─────────────────┐
│ API Request     │
│ Fails           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check HTTP      │
│ Status Code     │
└────────┬────────┘
         │
         ├── 4xx ──► Client error
         │           ├── 401: Check authentication
         │           ├── 403: Check permissions
         │           ├── 404: Verify endpoint/ID
         │           └── 422: Check request body
         │
         ├── 5xx ──► Server error
         │           ├── Check server logs
         │           ├── Check database connection
         │           └── Check server resources
         │
         └── Timeout ──► Network/performance issue
                         ├── Check server status
                         ├── Optimize query
                         └── Check network
```

### Database Query Failure Flow

```
┌─────────────────┐
│ Query Fails     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check error     │
│ code            │
└────────┬────────┘
         │
         ├── 23505 ──► Unique violation
         │             └──► Check if record exists
         │
         ├── 23503 ──► Foreign key violation
         │             └──► Verify referenced record
         │
         ├── Connection error
         │   ├── Check database status
         │   ├── Check connection string
         │   └── Check firewall/security groups
         │
         └── Timeout
             ├── Run EXPLAIN ANALYZE
             ├── Check for missing indexes
             └── Optimize query
```

### Frontend Hydration Error Flow

```
┌─────────────────┐
│ Hydration Error │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Identify        │
│ mismatching     │
│ element         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Is it           │
│ dynamic data?   │
└────────┬────────┘
         │
         ├── Yes ──► Move to useEffect
         │           or use ClientOnly wrapper
         │
         ├── Date/Time ──► Format consistently
         │                 or render client-side
         │
         ├── Random value ──► Use useEffect
         │                    to set state
         │
         └── Third-party ──► Dynamic import
                             with ssr: false
```

---

## Summary

This troubleshooting guide provides a comprehensive resource for diagnosing and resolving issues across the Southville 8B NHS Edge platform. Key takeaways:

1. **Follow a Systematic Approach**: Define, gather, reproduce, isolate, hypothesize, test, verify, document
2. **Use Appropriate Tools**: Browser DevTools, server logs, database queries, monitoring
3. **Prevent Issues**: Implement error handling, logging, monitoring, and testing
4. **Document Solutions**: Record fixes for future reference and knowledge sharing
5. **Learn from Issues**: Use problems as opportunities to improve system resilience

Remember: Most issues follow patterns. As you resolve problems, update this guide with new solutions and patterns you discover. The troubleshooting process becomes faster and more effective with experience and good documentation.

For additional support, consult:
- Next.js documentation: https://nextjs.org/docs
- NestJS documentation: https://docs.nestjs.com
- Supabase documentation: https://supabase.com/docs
- Stack Overflow and community forums
- Team knowledge base and incident reports
