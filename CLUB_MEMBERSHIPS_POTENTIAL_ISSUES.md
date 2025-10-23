# Club Memberships Service - Potential Issues

## Issues Found

### Issue 1: `created_at` column ordering
**Lines:** 170, 335

**Current Code:**
```typescript
.order('created_at', { ascending: false });
```

**Problem:** The `student_club_memberships` table might not have a `created_at` column.

**Potential Error:**
```
column student_club_memberships.created_at does not exist
```

**Fix:**
```typescript
.order('joined_at', { ascending: false });
```

---

### Issue 2: Mapping non-existent timestamp columns
**Lines:** 31-32

**Current Code:**
```typescript
private mapDbToDto(dbRecord: any): ClubMembership {
  return {
    // ...
    createdAt: dbRecord.created_at,  // ⚠️
    updatedAt: dbRecord.updated_at,  // ⚠️
  };
}
```

**Problem:** If these columns don't exist in the database, the values will be `undefined`.

**Impact:** Not critical but could cause confusion in frontend.

**Options:**
1. Remove these fields if columns don't exist
2. Add these columns to the database table
3. Use `joined_at` as a substitute

---

### Issue 3: Setting `updated_at` in update payload
**Line:** 229

**Current Code:**
```typescript
const updatePayload: any = {
  updated_at: new Date().toISOString(),
};
```

**Problem:** If `updated_at` column doesn't exist, update will fail.

**Potential Error:**
```
column "updated_at" of relation "student_club_memberships" does not exist
```

**Fix:** Remove this line if the column doesn't exist:
```typescript
const updatePayload: any = {};
// Remove: updated_at: new Date().toISOString(),
```

---

## Database Schema Check Needed

To verify which columns exist, run this query:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'student_club_memberships';
```

Expected columns:
- `id` (uuid)
- `student_id` (uuid)
- `club_id` (uuid)
- `position_id` (uuid)
- `joined_at` (timestamp)
- `is_active` (boolean)
- `created_at` (timestamp) - **VERIFY**
- `updated_at` (timestamp) - **VERIFY**

---

## Recommended Action

1. Check if `created_at` and `updated_at` columns exist in `student_club_memberships` table
2. If they **don't exist**:
   - Change `order('created_at')` to `order('joined_at')`
   - Remove `updated_at` from update payload
   - Either remove from DTO mapping or use `joined_at` as substitute
3. If they **do exist**: No changes needed

---

## Status

- ✅ Fixed: Role checking in `checkClubAccess`
- ⚠️ Pending verification: Timestamp columns existence
