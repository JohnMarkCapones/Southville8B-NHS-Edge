# Soft Delete Implementation

## Overview
Added soft delete functionality to the `students`, `teachers`, and `events` tables with `deleted_at` and `deleted_by` columns.

## Database Changes

### Tables Modified
1. **students** - Added `deleted_at` and `deleted_by` columns
2. **teachers** - Added `deleted_at` and `deleted_by` columns  
3. **events** - Added `deleted_at` and `deleted_by` columns

### Column Details
- `deleted_at`: TIMESTAMPTZ (nullable) - Timestamp when record was soft deleted
- `deleted_by`: UUID (nullable) - User ID who performed the soft delete operation
- Both columns are nullable (NULL = active record)

### Indexes Created
- `idx_students_deleted_at` - Partial index on students.deleted_at WHERE deleted_at IS NULL
- `idx_students_deleted_by` - Partial index on students.deleted_by WHERE deleted_by IS NOT NULL
- `idx_teachers_deleted_at` - Partial index on teachers.deleted_at WHERE deleted_at IS NULL
- `idx_teachers_deleted_by` - Partial index on teachers.deleted_by WHERE deleted_by IS NOT NULL
- `idx_events_deleted_at` - Partial index on events.deleted_at WHERE deleted_at IS NULL
- `idx_events_deleted_by` - Partial index on events.deleted_by WHERE deleted_by IS NOT NULL

## Helper Functions

### Soft Delete Functions
- `soft_delete_student(student_id UUID, deleted_by_user_id UUID)` - Soft delete a student
- `soft_delete_teacher(teacher_id UUID, deleted_by_user_id UUID)` - Soft delete a teacher
- `soft_delete_event(event_id UUID, deleted_by_user_id UUID)` - Soft delete an event

### Restore Functions
- `restore_student(student_id UUID)` - Restore a soft-deleted student
- `restore_teacher(teacher_id UUID)` - Restore a soft-deleted teacher
- `restore_event(event_id UUID)` - Restore a soft-deleted event

## Views Created
- `active_students` - View showing only non-deleted student records
- `active_teachers` - View showing only non-deleted teacher records
- `active_events` - View showing only non-deleted event records

## Backend Entity Updates

### Student Entity
```typescript
@ApiProperty({ description: 'Soft delete timestamp', required: false })
deleted_at?: string;

@ApiProperty({ description: 'User ID who performed soft delete', required: false })
deleted_by?: string;
```

### Teacher Entity
```typescript
@ApiProperty({ description: 'Soft delete timestamp', required: false })
deleted_at?: string;

@ApiProperty({ description: 'User ID who performed soft delete', required: false })
deleted_by?: string;
```

### Event Entity
```typescript
@ApiProperty({ description: 'Soft delete timestamp', required: false })
deleted_at?: string;

@ApiProperty({ description: 'User ID who performed soft delete', required: false })
deleted_by?: string;
```

## Usage Examples

### Soft Delete a Student
```sql
SELECT soft_delete_student('student-uuid', 'admin-user-uuid');
```

### Soft Delete a Teacher
```sql
SELECT soft_delete_teacher('teacher-uuid', 'admin-user-uuid');
```

### Soft Delete an Event
```sql
SELECT soft_delete_event('event-uuid', 'admin-user-uuid');
```

### Restore a Student
```sql
SELECT restore_student('student-uuid');
```

### Query Active Records Only
```sql
-- Using views
SELECT * FROM active_students;
SELECT * FROM active_teachers;
SELECT * FROM active_events;

-- Or using WHERE clause
SELECT * FROM students WHERE deleted_at IS NULL;
SELECT * FROM teachers WHERE deleted_at IS NULL;
SELECT * FROM events WHERE deleted_at IS NULL;
```

### Query Deleted Records
```sql
SELECT * FROM students WHERE deleted_at IS NOT NULL;
SELECT * FROM teachers WHERE deleted_at IS NOT NULL;
SELECT * FROM events WHERE deleted_at IS NOT NULL;
```

## Row-Level Security (RLS)
Updated RLS policies to exclude soft-deleted records from normal queries. All existing policies now include `AND deleted_at IS NULL` condition.

## Benefits
1. **Data Recovery** - Deleted records can be restored
2. **Audit Trail** - Track who deleted what and when
3. **Referential Integrity** - Maintains relationships with other tables
4. **Performance** - Partial indexes optimize queries for active records
5. **Compliance** - Meets data retention requirements

## Next Steps
1. Update application queries to use `WHERE deleted_at IS NULL` or active views
2. Implement soft delete functionality in service layers
3. Add soft delete/restore endpoints in controllers
4. Update frontend to handle soft delete operations
5. Consider implementing automatic cleanup of old soft-deleted records
