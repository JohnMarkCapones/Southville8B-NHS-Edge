# Audit Logging Integration Guide

This guide shows how to integrate the system-wide audit logging into your controllers and services.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Using the @Audit Decorator (Automatic)](#using-the-audit-decorator-automatic)
3. [Manual Logging in Services](#manual-logging-in-services)
4. [Integration Examples](#integration-examples)
5. [Best Practices](#best-practices)

---

## Quick Start

The audit system is already registered globally in `app.module.ts`, so you can use it anywhere without importing the module.

### Two Ways to Log:

1. **Automatic (Recommended)**: Use `@Audit()` decorator on controller methods
2. **Manual**: Inject `AuditService` and call logging methods directly

---

## Using the @Audit Decorator (Automatic)

The easiest way to add audit logging is using the `@Audit()` decorator on controller methods.

### Basic Example

```typescript
import { Audit } from '../common/audit';
import { AuditEntityType } from '../common/audit/audit.types';

@Controller('news')
export class NewsController {

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Audit({
    entityType: AuditEntityType.NEWS,
    descriptionField: 'title',  // Use 'title' field for human-readable description
  })
  async create(@Body() dto: CreateNewsDto, @AuthUser() user: any) {
    return this.newsService.create(dto, user);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Audit({
    entityType: AuditEntityType.NEWS,
    descriptionField: 'title',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNewsDto,
    @AuthUser() user: any,
  ) {
    return this.newsService.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Audit({
    entityType: AuditEntityType.NEWS,
    descriptionField: 'title',
  })
  async delete(@Param('id') id: string, @AuthUser() user: any) {
    return this.newsService.delete(id, user);
  }
}
```

### What the Decorator Does Automatically

- **Detects the HTTP method** (POST → CREATE, PATCH/PUT → UPDATE, DELETE → DELETE)
- **Extracts user information** from the JWT token (actor ID, name, role)
- **Captures request metadata** (IP address, user agent, request ID)
- **Logs after successful response** (won't log if request fails)
- **Handles different response structures** (wrapped, arrays, direct entities)

### Advanced Decorator Options

```typescript
@Audit({
  entityType: AuditEntityType.QUIZ,
  idField: 'quiz_id',              // Custom ID field (default: 'id')
  descriptionField: 'title',       // Field to use for description
  excludeActions: ['create'],      // Don't audit creates, only updates/deletes
  detailed: true,                  // Include full request/response (future feature)
})
```

---

## Manual Logging in Services

For complex operations or custom actions (PUBLISH, APPROVE, etc.), use the `AuditService` directly.

### Inject AuditService

```typescript
import { Injectable } from '@nestjs/common';
import { AuditService } from '../common/audit';
import { AuditEntityType, AuditAction } from '../common/audit/audit.types';

@Injectable()
export class NewsService {
  constructor(
    private readonly auditService: AuditService,
    // ... other services
  ) {}
}
```

### Log CREATE Operation

```typescript
async create(dto: CreateNewsDto, user: any) {
  const news = await this.supabase
    .from('news')
    .insert({
      title: dto.title,
      content: dto.content,
      author_id: user.id,
      status: 'draft',
    })
    .select()
    .single();

  // Log the creation
  await this.auditService.logCreate(
    AuditEntityType.NEWS,
    news,
    {
      actorUserId: user.id,
      actorName: user.full_name,
      actorRole: user.role,
      ipAddress: user.ipAddress,  // Pass from request if available
      note: 'Article created via journalism portal',
    },
  );

  return news;
}
```

### Log UPDATE Operation

```typescript
async update(id: string, dto: UpdateNewsDto, user: any) {
  // Fetch BEFORE state
  const { data: before } = await this.supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();

  // Perform update
  const { data: after } = await this.supabase
    .from('news')
    .update({
      title: dto.title,
      content: dto.content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  // Log the update (automatically detects changed fields)
  await this.auditService.logUpdate(
    AuditEntityType.NEWS,
    before,    // State before update
    after,     // State after update
    {
      actorUserId: user.id,
      actorName: user.full_name,
      actorRole: user.role,
      note: 'Article content updated',
    },
  );

  return after;
}
```

### Log DELETE Operation

```typescript
async delete(id: string, user: any) {
  // Fetch the entity before deleting
  const { data: entity } = await this.supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();

  // Soft delete
  await this.supabase
    .from('news')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', id);

  // Log the deletion
  await this.auditService.logDelete(
    AuditEntityType.NEWS,
    entity,
    {
      actorUserId: user.id,
      actorName: user.full_name,
      actorRole: user.role,
      note: 'Article soft deleted by author',
    },
  );

  return { message: 'Article deleted successfully' };
}
```

### Log Custom Actions (PUBLISH, APPROVE, etc.)

```typescript
async publishArticle(id: string, user: any) {
  const { data: before } = await this.supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();

  const { data: after } = await this.supabase
    .from('news')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  // Log PUBLISH action
  await this.auditService.logCustomAction(
    AuditAction.PUBLISH,
    AuditEntityType.NEWS,
    after,
    {
      actorUserId: user.id,
      actorName: user.full_name,
      actorRole: user.role,
      beforeState: before,  // Optional: include before state
      note: 'Article published to public',
    },
  );

  return after;
}

async approveArticle(id: string, user: any, note: string) {
  const article = await this.supabase
    .from('news')
    .update({ approval_status: 'approved' })
    .eq('id', id)
    .select()
    .single();

  // Log APPROVE action
  await this.auditService.logCustomAction(
    AuditAction.APPROVE,
    AuditEntityType.NEWS,
    article.data,
    {
      actorUserId: user.id,
      actorName: user.full_name,
      actorRole: 'Adviser',
      note: note || 'Article approved for publication',
    },
  );

  return article.data;
}
```

---

## Integration Examples

### Example 1: News Controller (Full Integration)

```typescript
import { Controller, Post, Patch, Delete, UseGuards } from '@nestjs/common';
import { Audit } from '../common/audit';
import { AuditEntityType, AuditAction } from '../common/audit/audit.types';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { AuditService } from '../common/audit';

@Controller('news')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly auditService: AuditService,  // For custom actions
  ) {}

  // Automatic auditing via decorator
  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Audit({
    entityType: AuditEntityType.NEWS,
    descriptionField: 'title',
  })
  async create(@Body() dto: CreateNewsDto, @AuthUser() user: any) {
    return this.newsService.create(dto, user);
  }

  // Automatic auditing
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Audit({
    entityType: AuditEntityType.NEWS,
    descriptionField: 'title',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNewsDto,
    @AuthUser() user: any,
  ) {
    return this.newsService.update(id, dto, user);
  }

  // Automatic auditing
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Audit({
    entityType: AuditEntityType.NEWS,
    descriptionField: 'title',
  })
  async delete(@Param('id') id: string, @AuthUser() user: any) {
    return this.newsService.delete(id, user);
  }

  // Custom action - manual logging
  @Post(':id/publish')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async publish(@Param('id') id: string, @AuthUser() user: any) {
    const article = await this.newsService.publish(id, user);

    // Manual audit logging for PUBLISH action
    await this.auditService.logCustomAction(
      AuditAction.PUBLISH,
      AuditEntityType.NEWS,
      article,
      {
        actorUserId: user.id,
        actorName: user.full_name,
        actorRole: user.role,
        note: 'Article published to public',
      },
    );

    return article;
  }

  // Custom action - manual logging
  @Post(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async approve(
    @Param('id') id: string,
    @Body() dto: ApproveNewsDto,
    @AuthUser() user: any,
  ) {
    const article = await this.newsService.approve(id, user);

    await this.auditService.logCustomAction(
      AuditAction.APPROVE,
      AuditEntityType.NEWS,
      article,
      {
        actorUserId: user.id,
        actorName: user.full_name,
        actorRole: 'Adviser',
        note: dto.note || 'Article approved',
      },
    );

    return article;
  }
}
```

### Example 2: Quiz Controller (Custom ID Field)

```typescript
@Controller('quizzes')
export class QuizController {

  @Post()
  @Audit({
    entityType: AuditEntityType.QUIZ,
    idField: 'id',  // Quizzes use 'id' (this is default, but shown for clarity)
    descriptionField: 'title',
  })
  async create(@Body() dto: CreateQuizDto) {
    return this.quizService.create(dto);
  }

  @Post(':id/submit')
  async submitQuiz(@Param('id') id: string, @AuthUser() user: any) {
    const attempt = await this.quizService.submitAttempt(id, user);

    // Manual logging for quiz submission
    await this.auditService.logCreate(
      AuditEntityType.QUIZ_ATTEMPT,
      attempt,
      {
        actorUserId: user.id,
        actorName: user.full_name,
        note: `Quiz submitted with score: ${attempt.score}`,
        metadata: {
          quiz_id: id,
          score: attempt.score,
          time_taken: attempt.time_taken,
        },
      },
    );

    return attempt;
  }
}
```

### Example 3: User Management (Complex Operations)

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly auditService: AuditService) {}

  @Patch(':id/suspend')
  @Roles(UserRole.ADMIN)
  async suspendUser(
    @Param('id') id: string,
    @Body() dto: SuspendUserDto,
    @AuthUser() admin: any,
  ) {
    const before = await this.usersService.findOne(id);
    const after = await this.usersService.suspend(id, dto.reason);

    // Manual logging with custom note
    await this.auditService.logUpdate(
      AuditEntityType.USER,
      before,
      after,
      {
        actorUserId: admin.id,
        actorName: admin.full_name,
        actorRole: 'Admin',
        note: `User suspended. Reason: ${dto.reason}`,
        metadata: {
          suspension_reason: dto.reason,
          suspension_duration: dto.duration,
        },
      },
    );

    return after;
  }

  @Post('bulk-import')
  @Roles(UserRole.ADMIN)
  async bulkImport(@Body() dto: BulkImportDto, @AuthUser() admin: any) {
    const result = await this.usersService.bulkImport(dto.users);

    // Log bulk operation
    for (const user of result.created) {
      await this.auditService.logCreate(
        AuditEntityType.USER,
        user,
        {
          actorUserId: admin.id,
          actorName: admin.full_name,
          actorRole: 'Admin',
          note: 'User created via bulk import',
        },
      );
    }

    return result;
  }
}
```

---

## Best Practices

### 1. Use Decorators for Standard CRUD Operations

```typescript
// ✅ GOOD: Simple, clean, automatic
@Post()
@Audit({ entityType: AuditEntityType.NEWS, descriptionField: 'title' })
async create(@Body() dto: CreateNewsDto) {
  return this.newsService.create(dto);
}

// ❌ AVOID: Unnecessary manual logging for standard operations
@Post()
async create(@Body() dto: CreateNewsDto, @AuthUser() user: any) {
  const news = await this.newsService.create(dto);
  await this.auditService.logCreate(AuditEntityType.NEWS, news, { ... });
  return news;
}
```

### 2. Use Manual Logging for Custom Actions

```typescript
// ✅ GOOD: Custom actions need manual logging
@Post(':id/publish')
async publish(@Param('id') id: string, @AuthUser() user: any) {
  const article = await this.newsService.publish(id);
  await this.auditService.logCustomAction(
    AuditAction.PUBLISH,
    AuditEntityType.NEWS,
    article,
    { actorUserId: user.id, ... }
  );
  return article;
}
```

### 3. Always Include Descriptive Notes

```typescript
// ✅ GOOD: Clear, informative note
await this.auditService.logDelete(AuditEntityType.NEWS, article, {
  actorUserId: user.id,
  note: 'Article deleted due to policy violation',
});

// ❌ AVOID: No context
await this.auditService.logDelete(AuditEntityType.NEWS, article, {
  actorUserId: user.id,
});
```

### 4. Use Metadata for Additional Context

```typescript
// ✅ GOOD: Rich metadata for analysis
await this.auditService.logCreate(AuditEntityType.QUIZ_ATTEMPT, attempt, {
  actorUserId: user.id,
  note: 'Quiz completed',
  metadata: {
    quiz_id: quiz.id,
    quiz_title: quiz.title,
    score: attempt.score,
    total_questions: quiz.question_count,
    time_taken_seconds: attempt.duration,
    completion_percentage: (attempt.score / quiz.max_score) * 100,
  },
});
```

### 5. Don't Log Read Operations

```typescript
// ❌ AVOID: Don't audit GET requests
@Get()
@Audit({ entityType: AuditEntityType.NEWS })  // NO!
async findAll() {
  return this.newsService.findAll();
}

// ✅ GOOD: Only audit write operations (CREATE, UPDATE, DELETE)
```

### 6. Handle Errors Gracefully

The audit system is designed to **never break your application**. If audit logging fails:
- The original request continues successfully
- Errors are logged to console
- No exception is thrown to the client

But you can still add try-catch for critical operations:

```typescript
try {
  await this.auditService.logCustomAction(...);
} catch (error) {
  this.logger.error('Failed to log audit', error);
  // Continue processing - don't fail the request
}
```

---

## Entities Recommended for Auditing

### High Priority (Critical Data)
- ✅ `USER`, `STUDENT`, `TEACHER`, `ADMIN` - User management
- ✅ `SCHEDULE` - Class schedules (already has audit)
- ✅ `QUIZ`, `QUIZ_ATTEMPT`, `QUIZ_STUDENT_ANSWER` - Assessment system
- ✅ `NEWS` - News articles and journalism
- ✅ `GWA`, `STUDENT_RANKING` - Grade data

### Medium Priority
- ✅ `CLUB`, `CLUB_MEMBERSHIP` - Club management
- ✅ `ANNOUNCEMENT`, `EVENT` - School communications
- ✅ `GALLERY_ALBUM`, `GALLERY_ITEM` - Media management
- ✅ `MODULE` - Educational resources

### Lower Priority
- FAQ, locations, campus facilities (reference data)
- Tags, categories (low impact changes)

---

## Viewing Audit Logs

### API Endpoints

All audit log endpoints are protected and require Admin role:

#### 1. Search Audit Logs
```
GET /api/audit-logs
Query parameters:
  - entityType: Filter by entity (NEWS, USER, etc.)
  - action: Filter by action (CREATE, UPDATE, DELETE)
  - actorUserId: Filter by user
  - startDate: Date range start
  - endDate: Date range end
  - limit: Results per page (default: 50)
  - offset: Pagination offset
```

#### 2. Get Entity Audit Trail
```
GET /api/audit-logs/entity/:entityType/:entityId
Example: GET /api/audit-logs/entity/NEWS/123e4567-e89b-12d3-a456-426614174000
```

#### 3. Get Statistics
```
GET /api/audit-logs/statistics?days=30
```

#### 4. Export to CSV
```
GET /api/audit-logs/export?entityType=NEWS&startDate=2025-01-01
```

### Frontend Integration (Coming Next)

The superadmin panel will have a full audit log viewer at:
```
/superadmin/audit-logs
```

---

## Summary

1. **Use `@Audit()` decorator** for standard CRUD operations (easiest)
2. **Use `AuditService` directly** for custom actions (PUBLISH, APPROVE, etc.)
3. **Always include descriptive notes** for context
4. **Use metadata** for rich contextual data
5. **Don't audit read operations** (GET requests)
6. **Audit system won't break your app** - fails gracefully

The audit system is ready to use! Start adding `@Audit()` decorators to your controllers today.
