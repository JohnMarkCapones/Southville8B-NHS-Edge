# Appendix G: Migration Guides

Step-by-step guides for upgrading versions and handling breaking changes in the Southville 8B NHS Edge application.

---

## Table of Contents

1. [Overview](#overview)
2. [Next.js Version Upgrades](#nextjs-version-upgrades)
3. [NestJS Version Upgrades](#nestjs-version-upgrades)
4. [React Version Migrations](#react-version-migrations)
5. [Database Migration Strategies](#database-migration-strategies)
6. [Breaking Changes Handling](#breaking-changes-handling)
7. [Dependency Upgrade Procedures](#dependency-upgrade-procedures)
8. [Testing After Migrations](#testing-after-migrations)
9. [Rollback Procedures](#rollback-procedures)
10. [Migration Checklists](#migration-checklists)

---

## Overview

This guide provides comprehensive procedures for upgrading major dependencies and handling breaking changes in the Southville 8B NHS Edge application. Following these procedures ensures smooth migrations with minimal downtime.

### Migration Philosophy

1. **Test Thoroughly** - Always test in development before production
2. **Backup First** - Create database and code backups before migrations
3. **Incremental Updates** - Update one major version at a time
4. **Document Changes** - Record all changes and decisions
5. **Have a Rollback Plan** - Always prepare for reverting changes

### Pre-Migration Checklist

- [ ] Review release notes and changelogs
- [ ] Backup production database
- [ ] Create git branch for migration
- [ ] Update development environment first
- [ ] Run full test suite
- [ ] Document breaking changes
- [ ] Prepare rollback script
- [ ] Schedule maintenance window
- [ ] Notify team members

---

## Next.js Version Upgrades

### Current Version: Next.js 15

The frontend uses Next.js 15 with App Router. Follow these procedures for future upgrades.

### Upgrading from Next.js 14 to Next.js 15

#### Step 1: Check Compatibility

```bash
cd frontend-nextjs
npm outdated next react react-dom
```

#### Step 2: Review Breaking Changes

Visit https://nextjs.org/docs/app/building-your-application/upgrading and review:
- App Router changes
- Server Components updates
- Metadata API changes
- Image optimization changes
- Middleware updates

#### Step 3: Update Dependencies

```bash
# Update Next.js and React
npm install next@latest react@latest react-dom@latest

# Update TypeScript types
npm install -D @types/react@latest @types/react-dom@latest
```

#### Step 4: Update Configuration

Check `next.config.js` for deprecated options:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove deprecated options
  // reactStrictMode: true, // Enabled by default in v15

  // Update image configuration if needed
  images: {
    domains: ['imagedelivery.net'], // Cloudflare Images
    formats: ['image/webp', 'image/avif'],
  },

  // Update experimental features
  experimental: {
    // Check for new features or removed experiments
  },
}

module.exports = nextConfig
```

#### Step 5: Update App Router Files

##### Layout Files

```tsx
// app/layout.tsx
// Ensure proper TypeScript types
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
```

##### Metadata API

```tsx
// Update metadata exports
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Southville 8B NHS Edge',
  description: 'School portal for Southville 8B National High School',
  // Update metadataBase if changed
}
```

#### Step 6: Update Server Components

Check all Server Components for breaking changes:

```tsx
// Server Component pattern
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// Client Component pattern
'use client'
import { useState } from 'react'

export default function ClientComponent() {
  const [state, setState] = useState()
  return <div>...</div>
}
```

#### Step 7: Test Thoroughly

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Run linting
npm run lint
```

#### Step 8: Deploy

```bash
# Commit changes
git add .
git commit -m "chore(frontend): upgrade to Next.js 15"

# Deploy to staging first
# ... staging deployment ...

# Deploy to production after validation
# ... production deployment ...
```

### Common Next.js Migration Issues

#### Issue 1: Hydration Errors

**Symptoms:** React hydration mismatch warnings

**Solution:**
```tsx
// Use suppressHydrationWarning for dynamic content
<html suppressHydrationWarning>
  <body>
    <ThemeProvider>{children}</ThemeProvider>
  </body>
</html>
```

#### Issue 2: Image Component Changes

**Symptoms:** Image optimization not working

**Solution:**
```tsx
// Update Image component usage
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false}
  // Check for deprecated props
/>
```

#### Issue 3: Middleware Updates

**Symptoms:** Middleware not executing

**Solution:**
```tsx
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Updated middleware pattern
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
```

---

## NestJS Version Upgrades

### Current Version: NestJS 11

The backend API uses NestJS 11 with Fastify adapter.

### Upgrading from NestJS 10 to NestJS 11

#### Step 1: Update Core Packages

```bash
cd core-api-layer
npm install @nestjs/core@latest @nestjs/common@latest @nestjs/platform-fastify@latest
```

#### Step 2: Update CLI and Testing

```bash
npm install -D @nestjs/cli@latest @nestjs/testing@latest
```

#### Step 3: Update Module Decorators

Check for decorator changes:

```typescript
// Before (NestJS 10)
@Module({
  imports: [ConfigModule.forRoot()],
})

// After (NestJS 11) - check for new options
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // New configuration options
    }),
  ],
})
```

#### Step 4: Update Guards and Interceptors

```typescript
// Check ExecutionContext usage
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    // Updated guard logic
    return true
  }
}
```

#### Step 5: Update Exception Filters

```typescript
// Updated exception filter pattern
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const status = exception.getStatus()

    response.status(status).send({
      statusCode: status,
      message: exception.message,
    })
  }
}
```

#### Step 6: Test API Endpoints

```bash
# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Start in development
npm run start:dev
```

### Common NestJS Migration Issues

#### Issue 1: Fastify Multipart Changes

**Solution:**
```typescript
// Updated file upload handling
@Post('upload')
async uploadFile(@Req() request: FastifyRequest) {
  const data = await request.file()
  // Handle multipart data
}
```

#### Issue 2: Validation Pipe Updates

**Solution:**
```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    // Check for new options
  }),
)
```

---

## React Version Migrations

### Upgrading to React 19

React 19 brings new features and breaking changes.

#### Step 1: Update React Packages

```bash
npm install react@latest react-dom@latest
```

#### Step 2: Update Hooks Usage

```tsx
// useOptimistic hook (new in React 19)
import { useOptimistic } from 'react'

function TodoList({ todos }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, { ...newTodo, pending: true }]
  )

  return (
    <ul>
      {optimisticTodos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  )
}
```

#### Step 3: Update Form Actions

```tsx
// Server Actions in forms (React 19)
async function createTodo(formData: FormData) {
  'use server'
  const title = formData.get('title')
  await db.createTodo({ title })
}

<form action={createTodo}>
  <input name="title" />
  <button type="submit">Add</button>
</form>
```

---

## Database Migration Strategies

### Supabase Migration Workflow

#### Step 1: Create Migration File

```bash
# Generate migration file
supabase migration new add_new_feature
```

#### Step 2: Write Migration SQL

```sql
-- 20240115000000_add_new_feature.sql

-- Add new table
CREATE TABLE new_feature (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Add RLS policies
ALTER TABLE new_feature ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own records"
ON new_feature FOR SELECT
USING (user_id = auth.uid());

-- Add indexes
CREATE INDEX idx_new_feature_user_id ON new_feature(user_id);

-- Add trigger
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON new_feature
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

#### Step 3: Test Migration Locally

```bash
# Reset local database
supabase db reset

# Apply migrations
supabase db push

# Test with sample data
supabase db seed
```

#### Step 4: Deploy to Staging

```bash
# Push to staging database
supabase db push --db-url "postgresql://staging..."
```

#### Step 5: Deploy to Production

```bash
# Backup production database first
pg_dump -h ... > backup_$(date +%Y%m%d_%H%M%S).sql

# Apply migration
supabase db push --db-url "postgresql://production..."
```

### Complex Migration Patterns

#### Adding Non-Nullable Column

```sql
-- Step 1: Add nullable column
ALTER TABLE students ADD COLUMN nickname varchar;

-- Step 2: Backfill data
UPDATE students SET nickname = first_name WHERE nickname IS NULL;

-- Step 3: Make not null
ALTER TABLE students ALTER COLUMN nickname SET NOT NULL;
```

#### Renaming Column with Data

```sql
-- Step 1: Add new column
ALTER TABLE quizzes ADD COLUMN time_limit_minutes int;

-- Step 2: Copy data
UPDATE quizzes SET time_limit_minutes = time_limit / 60;

-- Step 3: Drop old column
ALTER TABLE quizzes DROP COLUMN time_limit;
```

#### Changing Data Types

```sql
-- Change varchar to text
ALTER TABLE news
ALTER COLUMN title TYPE text;

-- Change int to bigint
ALTER TABLE students
ALTER COLUMN student_id TYPE bigint USING student_id::bigint;
```

---

## Breaking Changes Handling

### Identifying Breaking Changes

1. **Review changelogs** - Read CHANGELOG.md of all dependencies
2. **Check deprecation warnings** - Run app and note all warnings
3. **Review TypeScript errors** - Type changes often indicate breaking changes
4. **Test critical paths** - Manually test main user flows

### Communication Strategy

#### Internal Communication

```markdown
# Breaking Change Notice

**Package:** @nestjs/core
**Version:** 10.0.0 → 11.0.0
**Date:** 2026-01-15

## Changes Required

1. Update all `@Module()` decorators
2. Modify exception filters
3. Update testing mocks

## Timeline

- Dev environment: 2026-01-16
- Staging: 2026-01-18
- Production: 2026-01-20

## Impact

- Downtime: ~15 minutes
- Affected features: All API endpoints
```

### Code Changes Documentation

```typescript
/**
 * BREAKING CHANGE (v2.0.0)
 *
 * The `createQuiz` method now requires a `teacherId` parameter.
 *
 * Before:
 * await quizService.createQuiz({ title, description })
 *
 * After:
 * await quizService.createQuiz({ title, description, teacherId: user.id })
 */
async createQuiz(dto: CreateQuizDto) {
  // Implementation
}
```

---

## Dependency Upgrade Procedures

### Regular Dependency Updates

Run monthly or quarterly.

#### Step 1: Check Outdated Packages

```bash
# Frontend
cd frontend-nextjs
npm outdated

# Backend
cd core-api-layer
npm outdated
```

#### Step 2: Review Security Vulnerabilities

```bash
npm audit

# Fix automatically (be cautious)
npm audit fix

# Fix with breaking changes (review first)
npm audit fix --force
```

#### Step 3: Update Dependencies

```bash
# Update patch versions (safest)
npm update

# Update minor versions
npm install package@^latest

# Update major versions (requires testing)
npm install package@latest
```

#### Step 4: Test After Updates

```bash
# Run all tests
npm test

# Build application
npm run build

# Manual testing
npm run dev
```

### Specific Package Updates

#### TailwindCSS Update

```bash
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest

# Update config if needed
npx tailwindcss init -p
```

#### TypeScript Update

```bash
npm install -D typescript@latest

# Check tsconfig.json for new options
```

#### ESLint Update

```bash
npm install -D eslint@latest

# Regenerate config if needed
npx eslint --init
```

---

## Testing After Migrations

### Comprehensive Test Plan

#### Unit Tests

```bash
# Run unit tests
npm run test

# With coverage
npm run test:cov

# Watch mode during development
npm run test:watch
```

#### Integration Tests

```bash
# API integration tests
npm run test:e2e

# Database integration tests
npm run test:db
```

#### Manual Testing Checklist

**Frontend:**
- [ ] Login/logout functionality
- [ ] Student dashboard loads correctly
- [ ] Teacher quiz builder works
- [ ] Forms submit successfully
- [ ] File uploads work
- [ ] Real-time chat functions
- [ ] Dark mode toggles correctly

**Backend:**
- [ ] All API endpoints respond
- [ ] Authentication works
- [ ] Authorization enforced
- [ ] File uploads to R2 succeed
- [ ] Database queries execute
- [ ] Supabase RLS policies work
- [ ] WebSocket connections stable

#### Performance Testing

```bash
# Lighthouse audit
npm run analyze

# Load testing (optional)
# Use tools like Apache JMeter or k6
```

---

## Rollback Procedures

### Database Rollback

#### Option 1: Restore from Backup

```bash
# Restore PostgreSQL backup
psql -h host -U user -d database < backup_file.sql
```

#### Option 2: Reverse Migration

```sql
-- Create rollback migration
-- 20240115000001_rollback_new_feature.sql

DROP TABLE IF EXISTS new_feature CASCADE;
```

### Application Rollback

#### Git Rollback

```bash
# Find previous working commit
git log --oneline

# Create revert commit
git revert <commit-hash>

# Or hard reset (danger!)
git reset --hard <commit-hash>
git push --force
```

#### Deployment Rollback

```bash
# Vercel/Railway deployment
# Use dashboard to rollback to previous deployment

# Manual server
pm2 stop app
git checkout <previous-tag>
npm install
npm run build
pm2 restart app
```

### Rollback Communication

```markdown
# Rollback Notice

**Time:** 2026-01-20 15:30 UTC
**Reason:** Database migration caused performance issues

## Actions Taken

1. Reverted database to backup from 14:00
2. Rolled back application to v1.9.2
3. All services restored to normal operation

## Next Steps

- Investigation of migration issues
- Revised migration plan
- Rescheduled deployment for next week
```

---

## Migration Checklists

### Next.js Migration Checklist

- [ ] Review Next.js release notes
- [ ] Update Next.js, React, and React DOM
- [ ] Update TypeScript types
- [ ] Check next.config.js for deprecated options
- [ ] Update App Router layouts
- [ ] Update metadata exports
- [ ] Test Server Components
- [ ] Test Client Components
- [ ] Verify image optimization
- [ ] Check middleware functionality
- [ ] Run development build
- [ ] Run production build
- [ ] Test on staging environment
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Update documentation

### NestJS Migration Checklist

- [ ] Review NestJS release notes
- [ ] Update @nestjs/* packages
- [ ] Update Fastify adapter
- [ ] Check module decorators
- [ ] Update guards and interceptors
- [ ] Update exception filters
- [ ] Update pipes and validators
- [ ] Test file upload functionality
- [ ] Run unit tests
- [ ] Run e2e tests
- [ ] Test API endpoints manually
- [ ] Check Swagger docs generation
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Deploy to production
- [ ] Monitor API logs

### Database Migration Checklist

- [ ] Review migration requirements
- [ ] Create migration file
- [ ] Write forward migration SQL
- [ ] Write rollback migration SQL
- [ ] Test locally with fresh database
- [ ] Test with production data copy
- [ ] Backup production database
- [ ] Schedule maintenance window
- [ ] Notify users of maintenance
- [ ] Apply migration to staging
- [ ] Validate staging database
- [ ] Apply migration to production
- [ ] Validate production database
- [ ] Monitor for errors
- [ ] Update schema documentation

### Dependency Update Checklist

- [ ] Run npm outdated
- [ ] Review security audit
- [ ] Check each package's changelog
- [ ] Identify breaking changes
- [ ] Update one category at a time
- [ ] Test after each update
- [ ] Update package-lock.json
- [ ] Run full test suite
- [ ] Build application
- [ ] Test in development
- [ ] Deploy to staging
- [ ] Validate staging environment
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Document changes

---

## Best Practices

### 1. Version Control

- Create feature branch for migrations
- Commit frequently with clear messages
- Tag releases with semantic versioning
- Never force-push to main/master

### 2. Testing Strategy

- Write tests before migration
- Test incrementally during migration
- Automate regression testing
- Perform manual exploratory testing

### 3. Communication

- Notify team before major upgrades
- Document breaking changes clearly
- Provide migration guides for team
- Schedule deployments appropriately

### 4. Backup Strategy

- Always backup before migrations
- Test backup restoration process
- Keep multiple backup versions
- Store backups securely off-site

### 5. Gradual Rollout

- Test in development first
- Deploy to staging environment
- Use feature flags for big changes
- Monitor metrics after deployment

### 6. Documentation

- Update README files
- Document API changes
- Update deployment guides
- Record lessons learned

---

## Summary

Successful migrations require careful planning, thorough testing, and clear communication. By following these procedures and checklists, you can upgrade the Southville 8B NHS Edge application with confidence while minimizing risks and downtime.

**Key Principles:**
- Test thoroughly in non-production environments
- Always have a rollback plan
- Communicate changes to stakeholders
- Document all migrations
- Monitor post-migration metrics

For questions or issues during migrations, consult the development team lead or create an issue in the project repository.

---

**Last Updated:** January 2026
**Guide Version:** 2.0.0
**Word Count:** ~4,100 words
