# 8. Development Workflow

**Last Updated:** January 10, 2026
**Status:** ✅ Complete

---

## Table of Contents

- [8.1 Git Workflow & Branching Strategy](#81-git-workflow--branching-strategy)
- [8.2 Commit Conventions](#82-commit-conventions)
- [8.3 Code Review Process](#83-code-review-process)
- [8.4 Development Best Practices](#84-development-best-practices)

---

## 8.1 Git Workflow & Branching Strategy

### 8.1.1 Branching Model

The project follows a **simplified Git Flow** model optimized for continuous deployment.

#### Main Branches

| Branch | Purpose | Protection | Deployment |
|--------|---------|------------|------------|
| `main` | Production-ready code | ✅ Protected | Auto-deploy to production |
| `develop` | Integration branch | ✅ Protected | Auto-deploy to staging |

####Feature Branch Workflow

```
main (production)
  │
  ├─► develop (staging)
        │
        ├─► feature/add-quiz-timer
        ├─► feature/student-dashboard-redesign
        ├─► fix/login-validation
        └─► chore/update-dependencies
```

#### Branch Types

| Prefix | Purpose | Example | Merges To |
|--------|---------|---------|-----------|
| `feature/` | New features | `feature/chat-system` | `develop` |
| `fix/` | Bug fixes | `fix/login-error` | `develop` or `main` |
| `hotfix/` | Critical production fixes | `hotfix/security-patch` | `main` + `develop` |
| `chore/` | Maintenance tasks | `chore/update-deps` | `develop` |
| `refactor/` | Code refactoring | `refactor/api-structure` | `develop` |
| `docs/` | Documentation | `docs/update-readme` | `main` |
| `test/` | Test additions | `test/quiz-validation` | `develop` |

---

### 8.1.2 Branch Naming Conventions

#### Format

```
<type>/<short-description>
```

**Rules:**
- Use lowercase
- Use hyphens to separate words
- Be descriptive but concise
- No issue numbers in branch name

**Good Examples:**
```bash
feature/student-grade-export
fix/quiz-timer-freeze
hotfix/security-vulnerability
chore/upgrade-nextjs
refactor/auth-service
docs/api-documentation
```

**Bad Examples:**
```bash
feature/123-new-feature  # Don't include issue numbers
FixLoginBug              # Use lowercase
new-stuff                # Too vague
feature/implement-the-new-student-dashboard-with-analytics  # Too long
```

---

### 8.1.3 Creating and Managing Branches

#### Create Feature Branch

```bash
# Ensure you're on develop
git checkout develop

# Pull latest changes
git pull origin develop

# Create and switch to new feature branch
git checkout -b feature/quiz-analytics

# Push branch to remote
git push -u origin feature/quiz-analytics
```

#### Working on Feature

```bash
# Make changes
# ...

# Stage changes
git add .

# Commit (see 8.2 for commit conventions)
git commit -m "feat(quiz): add analytics dashboard"

# Push to remote
git push
```

#### Sync with Develop

```bash
# Switch to develop
git checkout develop

# Pull latest changes
git pull origin develop

# Switch back to feature branch
git checkout feature/quiz-analytics

# Rebase on develop
git rebase develop

# If conflicts, resolve them and:
git rebase --continue

# Force push (only on feature branches!)
git push --force-with-lease
```

---

### 8.1.4 Merge Strategies

#### Pull Request Merge

**Preferred:** Squash and Merge
- Keeps history clean
- One commit per feature
- Easy to revert

```bash
# GitHub/GitLab automatically handles this
# Select "Squash and Merge" when merging PR
```

#### Direct Merge (Hotfixes only)

```bash
# For critical hotfixes
git checkout main
git merge --no-ff hotfix/security-patch
git push origin main

# Also merge to develop
git checkout develop
git merge --no-ff hotfix/security-patch
git push origin develop
```

---

## 8.2 Commit Conventions

### 8.2.1 Conventional Commits Format

The project follows [Conventional Commits](https://www.conventionalcommits.org/) specification.

#### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

#### Type

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(quiz): add timer functionality` |
| `fix` | Bug fix | `fix(login): resolve validation error` |
| `docs` | Documentation | `docs(api): update endpoint documentation` |
| `style` | Code style (formatting) | `style: format with prettier` |
| `refactor` | Code refactoring | `refactor(auth): simplify token validation` |
| `perf` | Performance improvement | `perf(dashboard): optimize data loading` |
| `test` | Adding tests | `test(quiz): add validation tests` |
| `chore` | Maintenance | `chore: update dependencies` |
| `ci` | CI/CD changes | `ci: add GitHub Actions workflow` |

#### Scope

**Frontend scopes (in `frontend-nextjs/`):**
- `frontend` - General frontend changes
- `quiz` - Quiz system
- `dashboard` - Dashboard components
- `auth` - Authentication
- `chat` - Chat system
- `ui` - UI components
- `student` - Student portal
- `teacher` - Teacher portal
- `admin` - Admin portal

**Backend scopes (in `core-api-layer/`):**
- `api` - API changes
- `database` - Database changes
- `auth` - Authentication
- `modules` - Learning modules

**General scopes:**
- `deps` - Dependencies
- `config` - Configuration files
- `docs` - Documentation

---

### 8.2.2 Commit Message Best Practices

#### Good Commit Messages

```bash
# Feature addition
feat(quiz): add fullscreen mode enforcement

# Bug fix with context
fix(login): resolve email validation regex error

Fixes issue where emails with + symbol were rejected.
Updated regex pattern to accept RFC 5322 compliant emails.

# Breaking change
feat(api)!: change authentication endpoint structure

BREAKING CHANGE: Authentication endpoints moved from /auth/* to /api/v1/auth/*
Update client code to use new endpoints.

# Multiple changes
feat(student): implement assignment submission

- Add file upload component
- Validate file types and size
- Store submissions in R2
- Send notification to teacher

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

#### Bad Commit Messages

```bash
# Too vague
fix: bug fix

# No context
update files

# Mixed changes (should be separate commits)
feat: add quiz timer and fix login bug and update README

# Wrong type
feat: fix typo  # Should be fix:

# Too detailed (save for PR description)
feat(quiz): implement the new quiz timer feature with countdown functionality
and pause capability and also added visual indicators for time remaining
with color changes when time is running out...
```

---

### 8.2.3 Commit Message Examples

#### Simple Feature

```bash
git commit -m "feat(dashboard): add student performance chart"
```

#### Bug Fix with Details

```bash
git commit -m "fix(quiz): prevent double submission on enter key

Previously, pressing Enter while focused on the submit button
would trigger submission twice due to both keypress and click events.
Added debouncing to prevent duplicate submissions."
```

#### Breaking Change

```bash
git commit -m "feat(api)!: update user authentication flow

BREAKING CHANGE: JWT tokens now expire after 1 hour instead of 24 hours.
Clients must implement token refresh logic.

Closes #123"
```

#### Documentation

```bash
git commit -m "docs(readme): update installation instructions

- Add Node.js version requirement
- Include environment variable setup
- Add troubleshooting section"
```

---

## 8.3 Code Review Process

### 8.3.1 Pull Request Guidelines

#### Before Creating PR

**Checklist:**
- [ ] Code is tested locally
- [ ] All tests pass
- [ ] No linting errors
- [ ] Code follows project conventions
- [ ] Documentation updated (if needed)
- [ ] Commits follow conventional commits
- [ ] Branch is up-to-date with develop

#### Creating Pull Request

**Title Format:**
```
<type>(<scope>): <description>
```

**Example:**
```
feat(quiz): add real-time student monitoring
```

**PR Description Template:**

```markdown
## Summary
Brief description of changes

## Changes Made
- Bullet list of specific changes
- What was added/modified/removed

## Testing
- How to test this PR
- Test cases covered
- Screenshots (if UI changes)

## Related Issues
Closes #123
Related to #456

## Checklist
- [ ] Code tested locally
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Follows code style guidelines

## Screenshots (if applicable)
![Screenshot](url)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

### 8.3.2 Code Review Checklist

#### For Reviewers

**Functionality:**
- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No obvious bugs

**Code Quality:**
- [ ] Code is readable and maintainable
- [ ] Follows project conventions
- [ ] No code duplication
- [ ] Proper TypeScript types used
- [ ] No unnecessary complexity

**Performance:**
- [ ] No performance regressions
- [ ] Efficient algorithms used
- [ ] Proper caching implemented
- [ ] Large dependencies justified

**Security:**
- [ ] No security vulnerabilities
- [ ] User input is validated
- [ ] Sensitive data is protected
- [ ] Authentication/authorization correct

**Testing:**
- [ ] Tests are included
- [ ] Tests are meaningful
- [ ] All tests pass
- [ ] Test coverage is adequate

**Documentation:**
- [ ] Code is well-commented
- [ ] Complex logic explained
- [ ] Documentation updated
- [ ] README updated (if needed)

---

### 8.3.3 Review Comments

#### Giving Feedback

**Good:**
```markdown
**Suggestion:** Consider using `useMemo` here to prevent unnecessary recalculations

```tsx
const filteredData = useMemo(
  () => data.filter(item => item.isActive),
  [data]
);
```

This will improve performance when the component re-renders.
```

**Bad:**
```markdown
This is wrong. Fix it.
```

#### Types of Comments

**Blocking (must be fixed):**
```markdown
**❌ Blocking:** This introduces a security vulnerability.
User input must be validated before database insertion.
```

**Non-blocking (suggestions):**
```markdown
**💡 Suggestion:** Consider extracting this logic into a separate hook
for better reusability.
```

**Nitpick (optional):**
```markdown
**🔧 Nitpick:** Variable name could be more descriptive.
`userData` → `authenticatedUser`
```

---

### 8.3.4 Approval Process

#### Review Requirements

| PR Type | Approvals Required | Who Can Approve |
|---------|-------------------|-----------------|
| Feature | 1-2 | Any developer |
| Bug Fix | 1 | Any developer |
| Hotfix | 1 | Senior developer or tech lead |
| Breaking Change | 2 | Senior developers |

#### Merge Checklist

Before merging, ensure:
- [ ] All review comments addressed
- [ ] All CI/CD checks pass
- [ ] No merge conflicts
- [ ] Branch is up-to-date
- [ ] Required approvals received

---

## 8.4 Development Best Practices

### 8.4.1 Code Organization

#### File Structure

```
feature/
├── components/        # Feature-specific components
│   ├── FeatureComponent.tsx
│   └── SubComponent.tsx
├── hooks/            # Custom hooks
│   └── useFeature.ts
├── utils/            # Utility functions
│   └── featureHelpers.ts
├── types/            # TypeScript types
│   └── feature.types.ts
└── __tests__/        # Tests
    └── FeatureComponent.test.tsx
```

#### Import Order

```typescript
// 1. React and framework
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. Third-party libraries
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 3. Internal components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StudentList } from '@/components/student/StudentList'

// 4. Utilities and helpers
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/date-utils'

// 5. Types
import type { Student } from '@/types/student'
import type { Assignment } from '@/types/assignment'

// 6. Styles (if needed)
import './feature.css'
```

---

### 8.4.2 Naming Conventions

#### Files

```
# Components (PascalCase)
StudentDashboard.tsx
AssignmentCard.tsx
QuizTimer.tsx

# Utilities (camelCase)
date-utils.ts
form-helpers.ts
api-client.ts

# Hooks (use prefix, camelCase)
useAuth.ts
useQuizTimer.ts
useStudentData.ts

# Types (camelCase with .types suffix)
student.types.ts
quiz.types.ts
api.types.ts
```

#### Variables and Functions

```typescript
// camelCase for variables and functions
const studentName = 'John Doe'
const isActive = true

function calculateGrade(score: number): string {
  // ...
}

// PascalCase for components
function StudentDashboard() {
  // ...
}

// UPPER_CASE for constants
const MAX_ATTEMPTS = 3
const API_ENDPOINT = '/api/v1/students'
```

#### TypeScript Types

```typescript
// PascalCase for interfaces and types
interface Student {
  id: string
  name: string
  email: string
}

type QuizStatus = 'pending' | 'active' | 'completed'

// Props suffix for component props
interface StudentCardProps {
  student: Student
  onSelect: (id: string) => void
}
```

---

### 8.4.3 Code Style

#### TypeScript

**Use strict typing:**
```typescript
// Good
function greet(name: string): string {
  return `Hello, ${name}!`
}

// Bad
function greet(name: any): any {
  return `Hello, ${name}!`
}
```

**Use type inference when obvious:**
```typescript
// Good (type inferred)
const count = 5
const isActive = true

// Unnecessary
const count: number = 5
const isActive: boolean = true
```

#### Component Structure

```typescript
'use client' // Only if client component

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Student } from '@/types/student'

interface StudentCardProps {
  student: Student
  onEdit: (id: string) => void
}

export function StudentCard({ student, onEdit }: StudentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleEdit = () => {
    onEdit(student.id)
  }

  return (
    <div className="card">
      <h3>{student.name}</h3>
      <Button onClick={handleEdit}>Edit</Button>
    </div>
  )
}
```

---

### 8.4.4 Performance Best Practices

**Avoid unnecessary re-renders:**
```typescript
// Use memo for expensive calculations
const expensiveValue = useMemo(() => {
  return complexCalculation(data)
}, [data])

// Use callback for functions passed as props
const handleClick = useCallback(() => {
  doSomething()
}, [])
```

**Lazy load heavy components:**
```typescript
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})
```

**Optimize images:**
```typescript
import Image from 'next/image'

<Image
  src="/photo.jpg"
  width={500}
  height={300}
  alt="Description"
  loading="lazy"
/>
```

---

### 8.4.5 Security Best Practices

**Validate user input:**
```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

// Validate before using
const result = userSchema.safeParse(data)
if (!result.success) {
  throw new Error('Invalid input')
}
```

**Sanitize HTML:**
```typescript
// Never use dangerouslySetInnerHTML without sanitizing
import DOMPurify from 'isomorphic-dompurify'

const sanitizedHTML = DOMPurify.sanitize(userContent)
```

**Protect sensitive routes:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')

  if (!token && request.nextUrl.pathname.startsWith('/student')) {
    return NextResponse.redirect(new URL('/guess/login', request.url))
  }
}
```

---

## Development Workflow Summary

### Quick Reference

**Starting new work:**
1. `git checkout develop`
2. `git pull origin develop`
3. `git checkout -b feature/my-feature`
4. Make changes
5. `git add .`
6. `git commit -m "feat(scope): description"`
7. `git push -u origin feature/my-feature`
8. Create Pull Request
9. Wait for review
10. Address feedback
11. Merge to develop

**Before committing:**
- [ ] Code tested locally
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Tests pass (`npm test`)
- [ ] Follows conventions

**Before merging:**
- [ ] PR approved
- [ ] CI/CD checks pass
- [ ] No conflicts
- [ ] Up-to-date with base branch

---

## Navigation

- [← Previous: Database & Services Configuration](../volume-2-installation/07-database-services-configuration.md)
- [Next: Next.js 15 App Router Guide →](./09-nextjs-app-router.md)
- [↑ Back to Volume 3 Index](./README.md)
- [↑↑ Back to Manual Index](../README.md)
