# 🔧 Club Announcements - Bug Fix

## ❌ Problem Found

**Error**: `Could not find a relationship between 'club_announcements' and 'created_by' in the schema cache`

**Root Cause**: The backend service was trying to use Supabase's relationship syntax to join with `auth.users` table, but:
1. `created_by` is just a UUID column, not a foreign key relationship that Supabase PostgREST can traverse
2. The `auth.users` table is not accessible via the standard Supabase client queries

## ✅ Solution Applied

**Changed**: All Supabase queries in `club-announcements.service.ts`

**Before** (WRONG):
```typescript
.select(`
  *,
  author:created_by(id, full_name, email)
`)
```

**After** (CORRECT):
```typescript
.select('*')
```

## 📝 Files Modified

**Backend**:
- `src/clubs/services/club-announcements.service.ts`:
  - Line 58-62: `create()` method - Removed author join
  - Line 100-104: `findByClub()` method - Removed author join
  - Line 130-134: `findOne()` method - Removed author join
  - Line 180-184: `update()` method - Removed author join

**Frontend**:
- No changes needed - UI already handles optional `author` field

## 🧪 Testing

**Restart Backend**:
```bash
cd core-api-layer/southville-nhs-school-portal-api-layer
# Kill the current process (Ctrl+C)
npm run start:dev
```

**Test the Fix**:
1. Navigate to: `http://localhost:3000/teacher/clubs/6cdbad88-1cfc-4709-9542-3c2471e18043`
2. Click "Announcements" tab
3. Should now load without errors
4. Create a test announcement
5. Verify it appears in the list

## 📊 What Changed

### Before (with author join):
```json
{
  "id": "...",
  "title": "Test",
  "content": "...",
  "created_by": "user-id",
  "author": {
    "id": "user-id",
    "full_name": "John Doe",
    "email": "john@example.com"
  }
}
```

### After (without author join):
```json
{
  "id": "...",
  "title": "Test",
  "content": "...",
  "created_by": "user-id"
}
```

## 💡 Future Enhancement (Optional)

If you want to show author names, you have two options:

### Option 1: Manual Join in Service
```typescript
// In findByClub() method
const announcements = data || [];

// Fetch all unique user IDs
const userIds = [...new Set(announcements.map(a => a.created_by))];

// Fetch users separately
const { data: users } = await supabase
  .from('users')
  .select('id, full_name, email')
  .in('id', userIds);

// Merge data
return announcements.map(announcement => ({
  ...announcement,
  author: users?.find(u => u.id === announcement.created_by),
}));
```

### Option 2: Create a View in Database
```sql
CREATE VIEW club_announcements_with_author AS
SELECT
  ca.*,
  u.full_name as author_name,
  u.email as author_email
FROM club_announcements ca
LEFT JOIN auth.users u ON ca.created_by = u.id;
```

Then query the view instead of the table.

## ✅ Current Status

- ✅ Bug fixed
- ✅ Backend compiles
- ✅ Service methods updated
- ✅ Ready to test

**Next Step**: Restart the backend and test!
