# Journalism Domain Fix Guide

## Problem

You're getting this error when trying to add journalism members:

```json
{
  "message": "Journalism domain not found. Please contact administrator.",
  "error": "Bad Request",
  "statusCode": 400
}
```

## Root Cause

The **journalism domain** wasn't created in your database when you ran the migration SQL. This can happen if:

1. The migration script failed silently when looking for admin users
2. The `users` table structure doesn't match what the migration expects
3. The migration was run partially or skipped

## Solution

Follow these steps **in order** in your **Supabase SQL Editor**:

---

### Step 1: Verify Current State

Run this SQL to check what exists:

**File**: `verify_journalism_domain.sql`

```bash
# Open Supabase Dashboard → SQL Editor → New Query
# Copy and paste the contents of verify_journalism_domain.sql
# Run the query
```

This will show you:
- ✅ What columns your `domains` table has
- ✅ Whether journalism domain exists
- ✅ What your users table structure looks like
- ✅ What domains currently exist

---

### Step 2: Create Journalism Domain

Run this SQL to create the journalism domain:

**File**: `create_journalism_domain_manual.sql`

```bash
# Open Supabase Dashboard → SQL Editor → New Query
# Copy and paste the contents of create_journalism_domain_manual.sql
# Run the query
```

**Expected Output**:
```
NOTICE: Successfully created journalism domain with ID: [some-uuid]
```

**What this does**:
- Creates a domain with `type = 'journalism'`
- Handles different database schemas automatically
- Uses your current logged-in user if no admin is found

---

### Step 3: Create Domain Roles

Run this SQL to create the 7 journalism positions:

**File**: `create_journalism_domain_roles.sql`

```bash
# Open Supabase Dashboard → SQL Editor → New Query
# Copy and paste the contents of create_journalism_domain_roles.sql
# Run the query
```

**Expected Output**:
```
NOTICE: Found journalism domain with ID: [uuid]
NOTICE: Journalism domain now has 7 roles
```

**What this does**:
- Creates 7 domain roles: Adviser, Co-Adviser, EIC, Co-EIC, Publisher, Writer, Member
- Links them to the journalism domain

---

### Step 4: Verify Setup

Run this query to confirm everything is set up:

```sql
-- Check journalism domain exists
SELECT * FROM domains WHERE type = 'journalism';

-- Check all 7 domain roles exist
SELECT
  dr.name,
  dr.description,
  d.name as domain_name
FROM domain_roles dr
JOIN domains d ON dr.domain_id = d.id
WHERE d.type = 'journalism'
ORDER BY dr.name;
```

**Expected Result**:
You should see:
- ✅ 1 domain with type 'journalism'
- ✅ 7 domain roles (Adviser, Co-Adviser, Editor-in-Chief, Co-Editor-in-Chief, Publisher, Writer, Member)

---

### Step 5: Test the API Again

Now retry your API call:

```bash
curl -X 'POST' \
  'http://localhost:3004/api/v1/journalism/members' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "userId": "b4c3204d-1f85-4256-9b9d-cdbc9f768527",
  "position": "Adviser"
}'
```

**Expected Response** (if you're an Admin):
```json
{
  "id": "some-uuid",
  "userId": "b4c3204d-1f85-4256-9b9d-cdbc9f768527",
  "userName": "John Doe",
  "userEmail": "user@example.com",
  "position": "Adviser",
  "addedBy": "your-user-id",
  "message": "Successfully added John Doe as Adviser"
}
```

---

## Troubleshooting

### Error: "Journalism domain already exists"

**Solution**: Skip Step 2 and go directly to Step 3.

### Error: "Table 'domains' does not exist"

**Solution**: You need to run the main migration SQL first:
1. Run `news_system_migration.sql` completely
2. Then come back to this guide

### Error: "Column 'created_by' does not exist in table domains"

**Solution**: The manual script handles this automatically. Just run `create_journalism_domain_manual.sql` as-is.

### Error: "Permission denied for table domains"

**Solution**: Make sure you're running these queries as a Supabase admin or using the service role in the SQL Editor (not through the API).

---

## What Happens After This?

Once the journalism domain and roles are created, you'll be able to:

1. ✅ Add members to journalism team
2. ✅ Assign positions (Adviser, Writer, etc.)
3. ✅ Create news articles (if you have a publishing position)
4. ✅ Submit articles for approval
5. ✅ Approve/reject/publish articles (if you're an Adviser)

---

## Quick Command Reference

```bash
# 1. Verify state
psql -f verify_journalism_domain.sql

# 2. Create domain
psql -f create_journalism_domain_manual.sql

# 3. Create roles
psql -f create_journalism_domain_roles.sql
```

Or run them directly in **Supabase SQL Editor** (recommended).

---

## Files Created

- ✅ `verify_journalism_domain.sql` - Check current database state
- ✅ `create_journalism_domain_manual.sql` - Create journalism domain
- ✅ `create_journalism_domain_roles.sql` - Create 7 journalism positions

---

## Need More Help?

If you're still getting errors after following these steps, share:
1. The output from `verify_journalism_domain.sql`
2. Any error messages from Steps 2 or 3
3. Your domains table structure
