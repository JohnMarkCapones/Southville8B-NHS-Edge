# Naming Conventions Guide: snake_case vs camelCase

## Overview

This document explains how the codebase handles the naming convention mismatch between the database (snake_case) and the application layer (camelCase).

---

## The Pattern

### ✅ Correct Data Flow

```
Frontend (camelCase)
    ↓
Backend API/DTO (camelCase)
    ↓
Backend Service (converts to snake_case)
    ↓
Supabase Database (snake_case)
```

---

## Layer-by-Layer Breakdown

### 1. Frontend (Next.js/React)
**Convention:** camelCase

```typescript
// frontend-nextjs/lib/api/endpoints/quiz.ts
submitFlag: async (
  attemptId: string,
  data: {
    flagType: string,      // ✅ camelCase
    metadata?: any;
  }
): Promise<{ success: boolean; message: string }> => {
  return apiClient.post(`/quiz-sessions/${attemptId}/flag`, data);
}
```

---

### 2. Backend DTOs (NestJS)
**Convention:** camelCase (matches frontend)

```typescript
// core-api-layer/.../dto/create-flag.dto.ts
export class CreateFlagDto {
  @ApiProperty()
  @IsEnum(FlagType)
  flagType: FlagType;  // ✅ camelCase (receives from frontend)

  @IsOptional()
  metadata?: any;      // ✅ camelCase
}
```

**Why camelCase?**
- TypeScript/JavaScript convention
- Matches frontend data structure
- Clean API contracts
- class-validator expects camelCase

---

### 3. Backend Services (NestJS)
**Convention:** Converts camelCase → snake_case for database

```typescript
// core-api-layer/.../services/session-management.service.ts

// ✅ CORRECT: Method receives camelCase parameters
async createFlag(
  attemptId: string,      // camelCase in TypeScript
  studentId: string,      // camelCase in TypeScript
  flagType: string,       // camelCase in TypeScript
  severity: 'info' | 'warning' | 'critical',
  metadata?: any,
  autoResolved?: boolean,
): Promise<void> {
  const supabase = this.supabaseService.getServiceClient();

  // ✅ CORRECT: Convert to snake_case for database
  const flagData: any = {
    attempt_id: attemptId,     // snake_case in database
    student_id: studentId,     // snake_case in database
    flag_type: flagType,       // snake_case in database
    severity,                  // same in both
    metadata: metadata || {},  // same in both
    auto_resolved: autoResolved || false,  // snake_case in database
  };

  await supabase.from('quiz_flags').insert(flagData);
}
```

---

### 4. Database Queries (Supabase)
**Convention:** snake_case (PostgreSQL convention)

```typescript
// Reading from database (snake_case comes back)
const { data: device } = await supabase
  .from('quiz_device_sessions')
  .select('*')
  .eq('session_id', sessionId)  // ✅ snake_case column name
  .single();

// ✅ CORRECT: Map snake_case to camelCase for API response
return {
  deviceFingerprint: device.device_fingerprint,  // Conversion
  deviceType: device.device_type,                // Conversion
  ipAddress: device.ip_address,                  // Conversion
  userAgent: device.user_agent,                  // Conversion
  firstSeenAt: device.first_seen_at,             // Conversion
  lastSeenAt: device.last_seen_at,               // Conversion
  isCurrent: device.is_current,                  // Conversion
};
```

---

## Real-World Examples

### Example 1: Device History Endpoint

**Frontend Request:**
```typescript
// Frontend calls API
const deviceHistory = await quizApi.teacher.getDeviceHistory(attemptId);
```

**Backend Service (Reading):**
```typescript
// Service reads from database with snake_case
const { data: deviceSessions } = await supabase
  .from('quiz_device_sessions')
  .select('*')
  .eq('session_id', session.session_id)  // snake_case
  .order('first_seen_at', { ascending: true });

// ✅ Convert to camelCase for API response
return deviceSessions.map((device) => ({
  deviceFingerprint: device.device_fingerprint,
  deviceType: device.device_type,
  ipAddress: device.ip_address,
  userAgent: device.user_agent,
  firstSeenAt: device.first_seen_at,
  lastSeenAt: device.last_seen_at,
  isCurrent: device.is_current,
}));
```

**Frontend Receives:**
```typescript
// Frontend receives camelCase
interface DeviceHistory {
  deviceFingerprint: string;  // ✅ camelCase
  deviceType: string;         // ✅ camelCase
  ipAddress: string;          // ✅ camelCase
  firstSeenAt: string;        // ✅ camelCase
  isCurrent: boolean;         // ✅ camelCase
}
```

---

### Example 2: Flag Submission Flow

**1. Frontend submits data:**
```typescript
// hooks/useQuizFlags.ts
await quizApi.student.submitFlag(attemptId, {
  flagType: 'tab_switch',  // ✅ camelCase
  metadata: { count: 3 }   // ✅ camelCase
});
```

**2. Backend DTO receives:**
```typescript
// dto/create-flag.dto.ts
export class CreateFlagDto {
  flagType: FlagType;  // ✅ camelCase (from frontend)
  metadata?: any;      // ✅ camelCase (from frontend)
}
```

**3. Controller passes to service:**
```typescript
// controllers/session-management.controller.ts
async submitFlag(
  @Param('attemptId') attemptId: string,
  @Body() flagDto: CreateFlagDto,  // ✅ camelCase
  @AuthUser() user: SupabaseUser,
) {
  return this.sessionManagementService.submitClientFlag(
    attemptId,
    user.id,
    flagDto.flagType,  // ✅ camelCase
    flagDto.metadata,  // ✅ camelCase
  );
}
```

**4. Service converts for database:**
```typescript
// services/session-management.service.ts
async createFlag(
  attemptId: string,   // camelCase parameter
  studentId: string,   // camelCase parameter
  flagType: string,    // camelCase parameter
  severity: 'info' | 'warning' | 'critical',
  metadata?: any,
) {
  const flagData = {
    attempt_id: attemptId,    // ✅ Convert to snake_case
    student_id: studentId,    // ✅ Convert to snake_case
    flag_type: flagType,      // ✅ Convert to snake_case
    severity,
    metadata: metadata || {},
  };

  await supabase.from('quiz_flags').insert(flagData);
}
```

**5. Database stores:**
```sql
-- quiz_flags table (snake_case columns)
CREATE TABLE quiz_flags (
  attempt_id UUID,      -- ✅ snake_case
  student_id UUID,      -- ✅ snake_case
  flag_type VARCHAR,    -- ✅ snake_case
  severity VARCHAR,     -- ✅ snake_case
  metadata JSONB,       -- ✅ snake_case
  created_at TIMESTAMP  -- ✅ snake_case
);
```

---

## Why This Pattern?

### Benefits

1. **Clean API Surface**
   - Frontend and backend API use JavaScript/TypeScript conventions
   - DTOs follow language idioms
   - Swagger documentation looks natural

2. **Database Convention Compliance**
   - PostgreSQL standard is snake_case
   - Maintains database best practices
   - Works with existing database tools

3. **Type Safety**
   - TypeScript interfaces use camelCase naturally
   - Type checking works correctly
   - IDE autocomplete works as expected

4. **Clear Boundaries**
   - Conversion happens at service layer
   - DTOs are pure data carriers
   - Services handle business logic + conversion

---

## Common Patterns

### Pattern 1: Database Insert

```typescript
// ✅ CORRECT
const data = {
  attempt_id: attemptId,        // Convert
  student_id: studentId,        // Convert
  current_question_index: index, // Convert
  questions_answered: answered,  // Convert
};
await supabase.from('quiz_participants').insert(data);
```

### Pattern 2: Database Select + Map

```typescript
// ✅ CORRECT
const { data: sessions } = await supabase
  .from('quiz_active_sessions')
  .select('*')
  .eq('student_id', studentId);  // snake_case in query

// Map to camelCase for response
return sessions.map(s => ({
  sessionId: s.session_id,           // Convert
  attemptId: s.attempt_id,           // Convert
  isActive: s.is_active,             // Convert
  lastHeartbeat: s.last_heartbeat,   // Convert
}));
```

### Pattern 3: DTO to Database

```typescript
// ✅ CORRECT
async updateProgress(
  attemptId: string,
  studentId: string,
  progressDto: UpdateProgressDto,  // camelCase DTO
): Promise<void> {
  await supabase
    .from('quiz_participants')
    .update({
      current_question_index: progressDto.currentQuestionIndex,  // Convert
      questions_answered: progressDto.questionsAnswered,         // Convert
      progress: progressDto.progress,                            // Same
      idle_time_seconds: progressDto.idleTimeSeconds || 0,      // Convert
      updated_at: new Date().toISOString(),                     // Convert
    })
    .eq('session_id', sessionId);
}
```

---

## Anti-Patterns (DON'T DO THIS)

### ❌ WRONG: Mixing conventions in DTOs

```typescript
// ❌ WRONG - Don't use snake_case in DTOs
export class CreateFlagDto {
  flag_type: string;  // ❌ WRONG - Use camelCase
  metadata?: any;
}
```

### ❌ WRONG: Not converting when querying

```typescript
// ❌ WRONG - Using camelCase in database query
const { data } = await supabase
  .from('quiz_flags')
  .eq('flagType', type);  // ❌ WRONG - Column is 'flag_type'
```

### ❌ WRONG: Returning snake_case to frontend

```typescript
// ❌ WRONG - Don't return raw database objects
async getDeviceHistory(attemptId: string) {
  const { data } = await supabase
    .from('quiz_device_sessions')
    .select('*');

  return data;  // ❌ WRONG - Contains snake_case fields
}

// ✅ CORRECT - Map to camelCase
async getDeviceHistory(attemptId: string) {
  const { data } = await supabase
    .from('quiz_device_sessions')
    .select('*');

  return data.map(d => ({
    deviceFingerprint: d.device_fingerprint,  // ✅ Convert
    deviceType: d.device_type,                // ✅ Convert
    // ... etc
  }));
}
```

---

## Quick Reference

### When to Use What

| Layer | Convention | Example |
|-------|-----------|---------|
| **Frontend Types/Interfaces** | camelCase | `deviceFingerprint` |
| **Frontend API Calls** | camelCase | `{ flagType: 'tab_switch' }` |
| **Backend DTOs** | camelCase | `@IsString() flagType: string` |
| **Backend Service Parameters** | camelCase | `createFlag(attemptId, studentId)` |
| **Database Inserts** | snake_case | `{ attempt_id, student_id }` |
| **Database Queries** | snake_case | `.eq('student_id', id)` |
| **Database Columns** | snake_case | `CREATE TABLE (flag_type VARCHAR)` |
| **API Responses** | camelCase | `return { deviceType: 'mobile' }` |

---

## Validation Checklist

When writing new code, verify:

- ✅ Frontend sends camelCase
- ✅ DTOs receive camelCase
- ✅ Service parameters use camelCase
- ✅ Database operations use snake_case
- ✅ API responses return camelCase
- ✅ Type definitions use camelCase

---

## Current Implementation Status

### Phase 3 Security Flags - All Correct ✅

**Frontend:**
- ✅ `useQuizFlags.ts` - Uses camelCase (`flagType`)
- ✅ `quiz.ts` API client - Sends camelCase

**Backend:**
- ✅ `CreateFlagDto` - Receives camelCase (`flagType`)
- ✅ `session-management.service.ts` - Converts to snake_case (`flag_type`)
- ✅ `session-management.controller.ts` - Uses camelCase in params

**Database:**
- ✅ `quiz_flags` table - Uses snake_case columns

**Compilation Status:**
- ✅ Backend: 0 errors
- ✅ Frontend hook: Ready for integration

---

## Conclusion

The codebase follows a **clean, consistent pattern**:
- **Application layer (frontend/backend API):** camelCase
- **Data layer (database):** snake_case
- **Conversion:** Happens transparently in backend services

This is the **correct approach** for a TypeScript/JavaScript application with a PostgreSQL database. The naming convention "mismatch" is actually proper separation of concerns.

---

**No changes needed** - The implementation is already correct! 🎉
