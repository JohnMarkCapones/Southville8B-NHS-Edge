# Foreign Key Relationship Fix

## Issue
After adding `deleted_by` columns to the `students`, `teachers`, and `events` tables, Supabase/PostgREST encountered ambiguity when querying relationships between `users` and these tables.

## Error
```
Could not embed because more than one relationship was found for 'users' and 'teachers'
```

## Root Cause
Multiple foreign key relationships between tables:
- `teachers.user_id` → `users.id` (existing)
- `teachers.deleted_by` → `users.id` (new)
- `students.user_id` → `users.id` (existing)  
- `students.deleted_by` → `users.id` (new)
- `events.organizerId` → `users.id` (existing)
- `events.deleted_by` → `users.id` (new)

## Solution
Updated Supabase queries to specify the exact foreign key relationship using the `!foreign_key_name` syntax.

## Changes Made

### Users Service (`src/users/users.service.ts`)
**Before:**
```typescript
let query = supabase.from('users').select(
  `
    *,
    role:roles(name),
    teacher:teachers(*),
    admin:admins(*),
    student:students(*)
  `,
  { count: 'exact' },
);
```

**After:**
```typescript
let query = supabase.from('users').select(
  `
    *,
    role:roles(name),
    teacher:teachers!teachers_user_id_fkey(*),
    admin:admins(*),
    student:students!students_user_id_fkey(*)
  `,
  { count: 'exact' },
);
```

## Foreign Key Names Used
- `teachers_user_id_fkey` - For the main user-teacher relationship
- `students_user_id_fkey` - For the main user-student relationship
- `events_organizer_id_fkey` - For the event organizer relationship (already correct)

## Verification
- ✅ Users service queries now specify exact relationships
- ✅ Events service already had correct relationship specification
- ✅ No other services affected
- ✅ All linting checks pass

## Prevention
When adding new foreign key relationships to existing tables, always:
1. Use descriptive foreign key names
2. Update Supabase queries to specify exact relationships
3. Test queries to ensure no ambiguity
4. Consider using views for complex relationships

## Related Files
- `src/users/users.service.ts` - Fixed relationship ambiguity
- `src/events/events.service.ts` - Already had correct relationships
- Database migration scripts - Added new foreign key constraints
