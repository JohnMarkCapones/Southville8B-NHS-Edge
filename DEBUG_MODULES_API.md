# 🔍 Debug Guide: Why Subject & Uploader Still Show N/A

## Quick Checklist

Follow these steps in order to diagnose the issue:

### ✅ Step 1: Verify Database Migration Ran

Run this in Supabase SQL Editor:

```sql
-- Check if foreign key constraints exist
SELECT
    constraint_name,
    table_name
FROM information_schema.table_constraints
WHERE table_name IN ('modules', 'section_modules')
AND constraint_type = 'FOREIGN KEY'
ORDER BY table_name;
```

**Expected Output**:
```
modules_uploaded_by_fkey    | modules
modules_subject_id_fkey     | modules
section_modules_module_id_fkey | section_modules
section_modules_section_id_fkey | section_modules
section_modules_assigned_by_fkey | section_modules
```

**If missing**: Run `modules_foreign_keys_migration.sql` again.

---

### ✅ Step 2: Check if Modules Have Data

```sql
-- Check if modules have subject_id and uploaded_by
SELECT
    id,
    title,
    subject_id,
    uploaded_by,
    is_deleted
FROM modules
LIMIT 5;
```

**What to look for**:
- ❌ If `subject_id` is `NULL` - Modules don't have subjects assigned
- ❌ If `uploaded_by` is `NULL` - Modules don't have uploaders assigned
- ✅ If both have UUID values - Data exists, issue is in API

**If NULL**: The modules were created without subject/uploader data. You need to update them or create new test modules.

---

### ✅ Step 3: Verify Foreign Keys Work

```sql
-- Test the joins manually
SELECT
    m.id,
    m.title,
    m.subject_id,
    s.subject_name,
    m.uploaded_by,
    u.full_name
FROM modules m
LEFT JOIN subjects s ON m.subject_id = s.id
LEFT JOIN users u ON m.uploaded_by = u.id
LIMIT 5;
```

**What to check**:
- ❌ If `subject_name` is `NULL` - The subject_id doesn't match any subject
- ❌ If `full_name` is `NULL` - The uploaded_by doesn't match any user
- ✅ If both show values - Database joins work correctly

**If NULL**: Check that the UUIDs in modules table actually exist in subjects/users tables.

---

### ✅ Step 4: Restart Backend Server

**CRITICAL**: You MUST restart the backend after code changes!

```bash
# Stop the current server (Ctrl+C)
cd core-api-layer/southville-nhs-school-portal-api-layer

# Restart in development mode
npm run start:dev
```

**Look for**:
- ✅ "Nest application successfully started" message
- ❌ Any errors during startup

---

### ✅ Step 5: Test API Directly

Open your browser's Developer Tools (F12) and go to the Network tab, or use curl:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/modules/admin?limit=1 \
  | jq '.'
```

**Expected Response**:
```json
{
  "modules": [
    {
      "id": "some-uuid",
      "title": "Module Title",
      "subject_id": "subject-uuid",
      "uploaded_by": "user-uuid",
      "uploader": {
        "id": "user-uuid",
        "full_name": "Ms. Garcia",
        "email": "garcia@school.edu"
      },
      "subject": {
        "id": "subject-uuid",
        "subject_name": "Mathematics",
        "description": "..."
      }
    }
  ]
}
```

**What to check**:
- ❌ If `uploader` is `null` - Backend query isn't working
- ❌ If `subject` is `null` - Backend query isn't working
- ✅ If both have objects - API is working, issue is in frontend

---

### ✅ Step 6: Check Frontend Console

Open browser Developer Tools (F12) → Console tab

**Add this temporary debug code** to the learning materials page:

```typescript
// In frontend-nextjs/app/superadmin/learning-materials/page.tsx
// Add after line 334 (inside the modules useMemo)

const modules = useMemo(() => {
  console.log('🔍 RAW modulesData:', modulesData); // ADD THIS

  return modulesData.map((module) => {
    console.log('📦 Processing module:', module.id);
    console.log('  - subject:', module.subject);
    console.log('  - uploader:', module.uploader);

    return {
      id: module.id,
      title: module.title,
      subject: module.subject?.subject_name || 'N/A',
      author: module.uploader?.full_name || 'Unknown',
      // ... rest
    }
  })
}, [modulesData])
```

**What the console should show**:
```
🔍 RAW modulesData: Array(10)
📦 Processing module: abc-123
  - subject: { id: "xyz", subject_name: "Mathematics", ... }
  - uploader: { id: "user-123", full_name: "Ms. Garcia", ... }
```

**If you see**:
- ❌ `subject: null` - API is not returning subject data
- ❌ `uploader: null` - API is not returning uploader data
- ❌ `subject: undefined` - API structure is different than expected

---

## Common Issues & Solutions

### Issue 1: Foreign Keys Don't Exist

**Symptom**: Step 1 shows no foreign keys

**Solution**:
```sql
-- Run the migration again
-- Copy-paste ALL of modules_foreign_keys_migration.sql into Supabase SQL Editor
```

---

### Issue 2: Modules Have No Subject/Uploader

**Symptom**: Step 2 shows NULL values

**Solution**: Update existing modules or create test data

```sql
-- Option A: Assign a default subject to all modules
UPDATE modules
SET subject_id = (SELECT id FROM subjects LIMIT 1)
WHERE subject_id IS NULL;

-- Option B: Create a test module with proper data
INSERT INTO modules (
    title,
    description,
    is_global,
    subject_id,
    uploaded_by
)
VALUES (
    'Test Module',
    'Test Description',
    true,
    (SELECT id FROM subjects WHERE subject_name = 'Mathematics' LIMIT 1),
    (SELECT id FROM users WHERE role = 'Teacher' LIMIT 1)
);
```

---

### Issue 3: Foreign Key Relationships Broken

**Symptom**: Step 3 shows NULL in joined columns

**Solution**: The UUIDs don't match. Fix the data:

```sql
-- Find modules with invalid subject_id
SELECT m.id, m.title, m.subject_id
FROM modules m
LEFT JOIN subjects s ON m.subject_id = s.id
WHERE m.subject_id IS NOT NULL
AND s.id IS NULL;

-- If any rows returned, these modules have invalid subject_ids
-- Fix by setting to a valid subject:
UPDATE modules
SET subject_id = (SELECT id FROM subjects LIMIT 1)
WHERE id IN (
    SELECT m.id
    FROM modules m
    LEFT JOIN subjects s ON m.subject_id = s.id
    WHERE m.subject_id IS NOT NULL
    AND s.id IS NULL
);
```

---

### Issue 4: Backend Not Restarted

**Symptom**: API still returns old structure

**Solution**:
```bash
# Kill all node processes (if needed)
# Windows:
taskkill /F /IM node.exe

# Then restart:
cd core-api-layer/southville-nhs-school-portal-api-layer
npm run start:dev
```

---

### Issue 5: API Response Format Different

**Symptom**: Frontend console shows unexpected structure

**Solution**: Check the actual API response format and update frontend types

```typescript
// If backend returns different field names:
subject: module.subject_data?.name || 'N/A',  // Example fix
```

---

## Testing Workflow

1. ✅ Run migration SQL
2. ✅ Verify foreign keys created (Step 1)
3. ✅ Check data exists (Step 2)
4. ✅ Test joins work (Step 3)
5. ✅ Restart backend server
6. ✅ Test API endpoint (Step 5)
7. ✅ Check frontend console (Step 6)
8. ✅ Refresh browser page

---

## Still Not Working?

If after all steps you still see N/A:

### Enable Debug Logging in Backend

Add this to `modules.service.ts` in the `findAll` method (after line 347):

```typescript
// After the queryBuilder.then(...) or await
const { data: modules, error, count } = await queryBuilder;

// ADD THIS DEBUG LOG
this.logger.log('🔍 MODULES QUERY RESULT:');
this.logger.log(`  - Total modules: ${count}`);
this.logger.log(`  - First module:`, JSON.stringify(modules?.[0], null, 2));
this.logger.log(`  - Has subject?: ${!!modules?.[0]?.subject}`);
this.logger.log(`  - Has uploader?: ${!!modules?.[0]?.uploader}`);

if (error) {
  this.logger.error('Error fetching modules:', error);
  // ...
}
```

**Check backend console** - it will show the actual database response.

---

## Quick Fix: Create Test Module

If you just want to test quickly:

```sql
-- Create a complete test module with all relationships
INSERT INTO modules (
    title,
    description,
    is_global,
    subject_id,
    uploaded_by,
    file_url,
    r2_file_key,
    file_size_bytes,
    mime_type
)
SELECT
    'Test Mathematics Module',
    'This is a test module to verify foreign keys work',
    true,
    (SELECT id FROM subjects WHERE subject_name LIKE '%Math%' LIMIT 1),
    (SELECT id FROM users WHERE role = 'Teacher' LIMIT 1),
    'https://example.com/test.pdf',
    'modules/test/test.pdf',
    1024,
    'application/pdf'
WHERE EXISTS (SELECT 1 FROM subjects)
AND EXISTS (SELECT 1 FROM users WHERE role = 'Teacher');

-- Verify it was created with relationships
SELECT
    m.id,
    m.title,
    s.subject_name,
    u.full_name
FROM modules m
LEFT JOIN subjects s ON m.subject_id = s.id
LEFT JOIN users u ON m.uploaded_by = u.id
WHERE m.title = 'Test Mathematics Module';
```

This should show the subject name and uploader name immediately.

---

## Contact Points

If issue persists, provide:
1. Result of Step 1 (foreign keys check)
2. Result of Step 2 (data check)
3. Result of Step 3 (join test)
4. Screenshot of Step 5 (API response)
5. Screenshot of Step 6 (frontend console)

This will help pinpoint exactly where the data flow is breaking.
