# Appendix H: Contributing Guidelines

Comprehensive guide for contributing to the Southville 8B NHS Edge project.

---

## Table of Contents

1. [Overview](#overview)
2. [Code of Conduct](#code-of-conduct)
3. [Getting Started](#getting-started)
4. [Development Workflow](#development-workflow)
5. [Code Style Guide](#code-style-guide)
6. [Git Workflow](#git-workflow)
7. [Pull Request Process](#pull-request-process)
8. [Code Review Guidelines](#code-review-guidelines)
9. [Testing Requirements](#testing-requirements)
10. [Documentation Standards](#documentation-standards)
11. [Issue Reporting](#issue-reporting)
12. [Security Policy](#security-policy)

---

## Overview

We welcome contributions to the Southville 8B NHS Edge project! This guide will help you understand our development process, coding standards, and contribution workflow.

### What Can You Contribute?

- **Bug fixes** - Fix issues reported in GitHub Issues
- **Features** - Implement new functionality
- **Documentation** - Improve guides, READMEs, and code comments
- **Tests** - Add or improve test coverage
- **Refactoring** - Improve code quality and performance
- **Design** - Enhance UI/UX

### Before You Start

- Read this contributing guide thoroughly
- Familiarize yourself with the codebase
- Check existing issues and pull requests
- Join our development discussions
- Set up your development environment

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background, identity, or experience level.

### Expected Behavior

- **Be Respectful** - Treat all contributors with respect and kindness
- **Be Collaborative** - Work together and help each other
- **Be Professional** - Maintain professionalism in all communications
- **Be Constructive** - Provide helpful, actionable feedback
- **Be Inclusive** - Welcome newcomers and diverse perspectives

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or insults
- Trolling or deliberately disruptive behavior
- Publishing others' private information
- Any conduct that creates an unsafe environment

### Reporting

Report violations to the project maintainers at [security@southville8b-nhs.edu.ph]. All reports will be handled confidentially.

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js 18+** (LTS version recommended)
- **npm 9+** (comes with Node.js)
- **Git 2.30+**
- **PostgreSQL 15+** (for local database)
- **Supabase CLI** (for database migrations)
- **Code Editor** (VS Code recommended)

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

```bash
git clone https://github.com/YOUR_USERNAME/Southville8B-NHS-Edge.git
cd Southville8B-NHS-Edge
```

3. **Add upstream remote**:

```bash
git remote add upstream https://github.com/JohnMarkCapones/Southville8B-NHS-Edge.git
```

### Install Dependencies

#### Frontend (Next.js)

```bash
cd frontend-nextjs
npm install
```

#### Backend (NestJS)

```bash
cd core-api-layer
npm install
```

### Environment Setup

1. Copy environment templates:

```bash
# Frontend
cp frontend-nextjs/.env.example frontend-nextjs/.env.local

# Backend
cp core-api-layer/.env.example core-api-layer/.env
```

2. Configure environment variables (see README files)

### Run Development Servers

```bash
# Frontend
cd frontend-nextjs
npm run dev

# Backend
cd core-api-layer
npm run start:dev
```

---

## Development Workflow

### 1. Create a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

**Branch Naming Convention:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/improvements
- `chore/` - Maintenance tasks

Examples:
- `feature/quiz-timer`
- `fix/login-redirect`
- `docs/api-endpoints`
- `refactor/student-dashboard`

### 2. Make Changes

- Write clean, readable code
- Follow established patterns
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run tests
npm run test

# Run linting
npm run lint

# Build to check for errors
npm run build
```

### 4. Commit Your Changes

Follow Conventional Commits format:

```bash
git add .
git commit -m "feat(frontend): add quiz timer feature"
```

**Commit Message Format:**
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code formatting (no logic changes)
- `refactor` - Code refactoring
- `test` - Adding/updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

**Examples:**
```
feat(frontend): add dark mode toggle to settings
fix(backend): resolve JWT token expiration issue
docs(readme): update installation instructions
refactor(quiz): simplify grading logic
test(api): add unit tests for auth service
```

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Code Style Guide

### TypeScript

#### Naming Conventions

```typescript
// Interfaces and Types - PascalCase
interface UserProfile {
  id: string
  name: string
}

type QuizStatus = 'draft' | 'published' | 'archived'

// Classes - PascalCase
class QuizService {
  // Private properties - camelCase with underscore prefix
  private _cache: Map<string, Quiz>

  // Public methods - camelCase
  async createQuiz(dto: CreateQuizDto): Promise<Quiz> {
    // Implementation
  }
}

// Functions and variables - camelCase
const calculateGrade = (score: number, total: number): number => {
  return (score / total) * 100
}

// Constants - UPPER_SNAKE_CASE
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024 // 10MB
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
```

#### Code Organization

```typescript
// 1. Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. Types/Interfaces
interface Props {
  quizId: string
  studentId: string
}

// 3. Component/Function
export default function QuizAttempt({ quizId, studentId }: Props) {
  // 4. Hooks
  const router = useRouter()
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)

  // 5. Effects
  useEffect(() => {
    fetchAttempt()
  }, [quizId])

  // 6. Handlers
  const handleSubmit = async () => {
    // Implementation
  }

  // 7. Render
  return <div>...</div>
}
```

#### Type Safety

```typescript
// ✅ Good - Explicit types
function createQuiz(title: string, teacherId: string): Promise<Quiz> {
  return api.post<Quiz>('/quizzes', { title, teacherId })
}

// ❌ Bad - Implicit any
function createQuiz(title, teacherId) {
  return api.post('/quizzes', { title, teacherId })
}

// ✅ Good - Type guards
function isStudent(user: User): user is Student {
  return user.role === 'Student'
}

// ✅ Good - Discriminated unions
type Response =
  | { success: true; data: Quiz }
  | { success: false; error: string }
```

### React Components

#### Functional Components

```tsx
// ✅ Good - Named export with proper types
interface QuizCardProps {
  quiz: Quiz
  onStart: (quizId: string) => void
}

export function QuizCard({ quiz, onStart }: QuizCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{quiz.description}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onStart(quiz.id)}>Start Quiz</Button>
      </CardFooter>
    </Card>
  )
}
```

#### Hooks Usage

```tsx
// ✅ Good - Custom hooks
function useQuizAttempt(quizId: string) {
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchAttempt(quizId)
      .then(setAttempt)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [quizId])

  return { attempt, loading, error }
}

// Usage
function QuizPage({ quizId }: { quizId: string }) {
  const { attempt, loading, error } = useQuizAttempt(quizId)

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  if (!attempt) return <NotFound />

  return <QuizInterface attempt={attempt} />
}
```

### CSS/Tailwind

```tsx
// ✅ Good - Use cn() for conditional classes
import { cn } from '@/lib/utils'

<Button
  className={cn(
    "base-classes",
    variant === 'primary' && "bg-school-blue",
    variant === 'secondary' && "bg-gray-200",
    disabled && "opacity-50 cursor-not-allowed",
    className
  )}
>
  Click me
</Button>

// ✅ Good - Consistent spacing
<div className="flex items-center justify-between gap-4 p-6">
  <h2 className="text-2xl font-bold">Title</h2>
  <Button size="sm">Action</Button>
</div>
```

### NestJS Backend

```typescript
// ✅ Good - Proper DTO validation
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator'

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsUUID()
  subjectId: string
}

// ✅ Good - Service pattern
@Injectable()
export class QuizService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly storage: R2StorageService,
  ) {}

  async createQuiz(dto: CreateQuizDto, teacherId: string): Promise<Quiz> {
    const { data, error } = await this.supabase
      .getServiceClient()
      .from('quizzes')
      .insert({ ...dto, teacher_id: teacherId })
      .select()
      .single()

    if (error) {
      throw new InternalServerErrorException(error.message)
    }

    return data
  }
}
```

---

## Git Workflow

### Branching Strategy

We use **Git Flow** with the following branches:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature branches
- `fix/*` - Hotfix branches
- `release/*` - Release preparation

### Commit Guidelines

**Do:**
- Write clear, concise commit messages
- Use present tense ("add feature" not "added feature")
- Reference issue numbers (#123)
- Keep commits focused and atomic

**Don't:**
- Commit unrelated changes together
- Use vague messages like "fix bug" or "update code"
- Commit commented-out code
- Include debug console.logs

**Good Examples:**
```
feat(quiz): add timer functionality to quiz attempts

- Add countdown timer component
- Display remaining time in header
- Auto-submit when time expires
- Add warning at 5 minutes remaining

Closes #234
```

```
fix(auth): prevent duplicate login redirects

The login page was redirecting twice on successful authentication,
causing URL flicker. Added redirect state check to prevent duplicate
navigation.

Fixes #456
```

### Syncing Your Fork

```bash
# Fetch upstream changes
git fetch upstream

# Merge into your main
git checkout main
git merge upstream/main

# Push to your fork
git push origin main

# Rebase your feature branch
git checkout feature/your-feature
git rebase main
```

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Linting passes without errors
- [ ] Documentation updated
- [ ] Self-review completed
- [ ] Commits are clean and atomic

### PR Title Format

Use Conventional Commits format:

```
feat(frontend): add quiz timer feature
fix(api): resolve authentication bug
docs(readme): update setup instructions
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123
Relates to #456

## Changes Made
- Added quiz timer component
- Updated quiz attempt logic
- Added unit tests for timer
- Updated documentation

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
```

### After Submission

- Monitor CI/CD checks
- Respond to review comments promptly
- Make requested changes
- Keep PR up-to-date with main branch

---

## Code Review Guidelines

### For Authors

- Keep PRs small and focused
- Provide context in description
- Respond to feedback professionally
- Don't take criticism personally
- Ask questions if feedback is unclear

### For Reviewers

#### What to Review

1. **Correctness** - Does it work as intended?
2. **Design** - Is the approach appropriate?
3. **Complexity** - Is it unnecessarily complex?
4. **Tests** - Are there adequate tests?
5. **Naming** - Are names clear and consistent?
6. **Comments** - Are complex parts documented?
7. **Style** - Does it follow guidelines?
8. **Documentation** - Is it updated?

#### How to Review

```markdown
✅ Good Review Comments:
"Consider extracting this logic into a separate function for better reusability."
"Great use of TypeScript types here! One suggestion: we could make this stricter by..."
"This works, but we could improve performance by caching the result."

❌ Poor Review Comments:
"This is wrong."
"Why did you do it this way?"
"Bad code."
```

#### Review Checklist

- [ ] Code is understandable
- [ ] Logic is correct
- [ ] Edge cases handled
- [ ] Error handling present
- [ ] No hardcoded values
- [ ] No sensitive data exposed
- [ ] Tests are comprehensive
- [ ] Documentation is clear
- [ ] No console.logs left behind
- [ ] Performance considerations addressed

---

## Testing Requirements

### Unit Tests

All new features must include unit tests.

```typescript
// Example: Quiz service test
describe('QuizService', () => {
  let service: QuizService
  let supabase: SupabaseService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile()

    service = module.get<QuizService>(QuizService)
    supabase = module.get<SupabaseService>(SupabaseService)
  })

  describe('createQuiz', () => {
    it('should create a quiz successfully', async () => {
      const dto = { title: 'Test Quiz', subjectId: 'uuid' }
      const result = await service.createQuiz(dto, 'teacher-id')

      expect(result).toBeDefined()
      expect(result.title).toBe('Test Quiz')
    })

    it('should throw error if database operation fails', async () => {
      jest.spyOn(supabase, 'getServiceClient').mockReturnValue({
        from: () => ({ insert: () => ({ error: new Error('DB Error') }) }),
      })

      await expect(
        service.createQuiz({ title: 'Test' }, 'teacher-id')
      ).rejects.toThrow()
    })
  })
})
```

### Integration Tests

Test API endpoints and database interactions.

```typescript
// Example: E2E test
describe('Quiz API (e2e)', () => {
  let app: INestApplication
  let authToken: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    // Get auth token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'teacher@test.com', password: 'password' })

    authToken = response.body.access_token
  })

  it('/quizzes (POST)', () => {
    return request(app.getHttpServer())
      .post('/quizzes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test Quiz', subjectId: 'uuid' })
      .expect(201)
      .expect((res) => {
        expect(res.body.title).toBe('Test Quiz')
      })
  })
})
```

### Test Coverage

- **Minimum:** 70% code coverage
- **Target:** 80%+ coverage
- **Critical paths:** 90%+ coverage

```bash
# Run with coverage
npm run test:cov

# View coverage report
open coverage/index.html
```

---

## Documentation Standards

### Code Comments

```typescript
/**
 * Calculates the final grade for a quiz attempt.
 *
 * Takes into account the scoring mode, partial credit settings,
 * and applies any grade curve configured for the quiz.
 *
 * @param attempt - The quiz attempt to grade
 * @param quiz - The quiz configuration
 * @returns The calculated grade as a percentage (0-100)
 *
 * @example
 * const grade = calculateGrade(attempt, quiz)
 * console.log(grade) // 85.5
 */
function calculateGrade(attempt: QuizAttempt, quiz: Quiz): number {
  // Implementation
}
```

### README Updates

Update relevant README files when making changes:

- `README.md` - Project overview
- `frontend-nextjs/README.md` - Frontend documentation
- `core-api-layer/README.md` - Backend documentation
- Feature-specific docs in `/docs`

### API Documentation

Update Swagger/OpenAPI documentation:

```typescript
@ApiTags('quizzes')
@Controller('quizzes')
export class QuizzesController {
  @Post()
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully', type: Quiz })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createQuiz(@Body() dto: CreateQuizDto): Promise<Quiz> {
    return this.quizService.createQuiz(dto)
  }
}
```

---

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Bug Description**
A clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable

**Environment**
- Browser: Chrome 120
- OS: Windows 11
- Version: 2.0.0

**Additional Context**
Any other relevant information
```

### Feature Requests

```markdown
**Feature Description**
Clear description of the proposed feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've considered

**Additional Context**
Screenshots, mockups, examples
```

---

## Security Policy

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead, email: security@southville8b-nhs.edu.ph

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours.

### Security Best Practices

- Never commit secrets or API keys
- Use environment variables
- Validate all user input
- Sanitize database queries
- Use HTTPS everywhere
- Implement rate limiting
- Follow OWASP guidelines

---

## Summary

Thank you for contributing to Southville 8B NHS Edge! By following these guidelines, you help maintain code quality, consistency, and collaboration within the project.

**Quick Reference:**
- Use conventional commits
- Write tests for new code
- Follow TypeScript/React best practices
- Keep PRs small and focused
- Respond to reviews promptly
- Update documentation

For questions, reach out to the maintainers or join our development discussions.

---

**Last Updated:** January 2026
**Guide Version:** 2.0.0
**Word Count:** ~3,100 words
