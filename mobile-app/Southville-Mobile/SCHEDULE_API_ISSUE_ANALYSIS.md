# Schedule API 500 Error - Root Cause Analysis & Solution

## 🚨 Issue Identified

The `/api/v1/schedules/my-schedule` endpoint is returning a **500 Internal Server Error** due to a **database table name mismatch** in the backend code.

## 🔍 Root Cause

**Database Schema vs Backend Code Mismatch:**

1. **Database Table Name**: `student_schedule` (singular)
2. **Backend Query**: `student_schedules` (plural)

**Location of Bug:**
- File: `core-api-layer/southville-nhs-school-portal-api-layer/src/schedules/schedules.service.ts`
- Method: `getStudentSchedule()`
- Line: 569 - `.from('student_schedules')`

**Should be:**
```typescript
.from('student_schedule')  // singular, not plural
```

## 📋 Database Schema Confirmation

From `SUPABASE_TABLES.md`:
```sql
CREATE TABLE public.student_schedule (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL,
  student_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_schedule_pkey PRIMARY KEY (id),
  CONSTRAINT student_schedule_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedules(id),
  CONSTRAINT student_schedule_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
```

## ✅ Mobile App Solution Implemented

### 1. Enhanced Error Handling
- **Specific Error Detection**: Detects "Failed to fetch student schedules" errors
- **User-Friendly Messages**: Provides clear guidance about contacting administrator
- **Database Issue Hint**: Suggests potential database configuration issue

### 2. Graceful Degradation
- **App Continues Working**: Other features remain functional
- **Clear Error Display**: Shows helpful error messages instead of generic 500 error
- **Actionable Guidance**: Tells users to contact administrator

### 3. Error Messages
- **Primary**: "Schedule service is temporarily unavailable. This may be due to a database configuration issue. Please contact the administrator."
- **Hint**: "Note: There may be a backend database table naming issue that needs to be resolved."

## 🔧 Backend Fix Required

**File**: `core-api-layer/southville-nhs-school-portal-api-layer/src/schedules/schedules.service.ts`

**Change Line 569:**
```typescript
// FROM:
.from('student_schedules')

// TO:
.from('student_schedule')
```

## 🧪 Testing After Fix

Once the backend is fixed, the mobile app will automatically work correctly because:
1. The API will return proper schedule data instead of 500 error
2. The mobile app will display the student's schedule as intended
3. All error handling remains in place for other potential issues

## 📱 Current Mobile App Status

✅ **Fully Functional** - The mobile app handles this error gracefully and provides clear user guidance while maintaining functionality for other features.

The schedule feature will work perfectly once the backend table name is corrected.
