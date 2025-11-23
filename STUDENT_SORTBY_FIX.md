# Student Search Sort Column Fix

## ❌ Error

```
[StudentsService] Error fetching students:
{
  code: '42703',
  details: null,
  hint: null,
  message: 'column students.created_at does not exist'
}
```

## 🔍 Root Cause

The `students` table in the database does **not have** `created_at` and `updated_at` columns, but:
1. The backend controller was defaulting to `sortBy = 'created_at'`
2. The frontend TypeScript interface included these non-existent fields

## ✅ Fix Applied

### Backend Changes

**File:** `core-api-layer/southville-nhs-school-portal-api-layer/src/students/students.controller.ts`

```typescript
// BEFORE (❌ Error - column doesn't exist)
@Query('sortBy') sortBy: string = 'created_at',
@Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',

@ApiQuery({
  name: 'sortBy',
  required: false,
  enum: ['created_at', 'first_name', 'last_name', 'student_id'],
})

// AFTER (✅ Fixed - use valid column)
@Query('sortBy') sortBy: string = 'student_id',
@Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',

@ApiQuery({
  name: 'sortBy',
  required: false,
  enum: ['first_name', 'last_name', 'student_id', 'grade_level'],
})
```

**Changes:**
- Default `sortBy` changed from `'created_at'` → `'student_id'`
- Default `sortOrder` changed from `'desc'` → `'asc'` (alphabetical)
- Removed `'created_at'` from allowed enum values
- Added `'grade_level'` to allowed enum values

### Frontend Changes

**File:** `frontend-nextjs/lib/api/endpoints/students.ts`

```typescript
// BEFORE (❌ Including non-existent fields)
export interface Student {
  id: string
  user_id: string
  first_name: string
  last_name: string
  // ... other fields ...
  created_at: string  // ❌ Column doesn't exist
  updated_at: string  // ❌ Column doesn't exist
  sections?: { ... }
}

// AFTER (✅ Removed non-existent fields)
export interface Student {
  id: string
  user_id: string
  first_name: string
  last_name: string
  // ... other fields ...
  // Removed created_at and updated_at
  sections?: { ... }
}
```

## 📋 Valid Sort Columns

The students table has these sortable columns:
- ✅ `first_name` - Student's first name
- ✅ `last_name` - Student's last name
- ✅ `student_id` - Student ID number (default)
- ✅ `grade_level` - Grade level (e.g., "Grade 10")

## 🧪 Testing

After the fix, the student search should work correctly:

```bash
# Test the endpoint
GET /api/v1/students?search=john&page=1&limit=20

# Should now return students sorted by student_id in ascending order
```

## 📝 Notes

- The service layer already had the correct default (`sortBy = 'student_id'`)
- The controller was overriding it with an invalid default
- This error only appeared when using the student search feature (e.g., in AddMemberDialog)

## ✅ Status

**Fixed and ready for testing!**

The student search in the Add Member dialog should now work without database errors.
