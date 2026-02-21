# Testing Review Comments System

## Step 1: Run SQL Migration

Execute the migration file in your Supabase SQL Editor:
```
core-api-layer/southville-nhs-school-portal-api-layer/news_review_comments_migration.sql
```

## Step 2: Verify Table Creation

Run this query in Supabase to check the table was created:
```sql
SELECT * FROM news_review_comments LIMIT 1;
```

## Step 3: Check Foreign Key

Verify the foreign key constraint name:
```sql
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name='news_review_comments'
  AND kcu.column_name='reviewer_id';
```

Expected result: Constraint name should be `news_review_comments_reviewer_id_fkey`

## Step 4: Restart Backend Server

```bash
cd core-api-layer/southville-nhs-school-portal-api-layer
npm run start:dev
```

## Step 5: Test API Endpoint

### Get Review Comments for an Article
```bash
# Replace YOUR_JWT_TOKEN and NEWS_ID with actual values
curl -X GET "http://localhost:3004/api/news/YOUR_NEWS_ID/review-comments" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:
```json
[
  {
    "id": "uuid",
    "news_id": "uuid",
    "reviewer_id": "uuid",
    "comment": "Test comment",
    "created_at": "2025-01-28T...",
    "updated_at": "2025-01-28T...",
    "deleted_at": null,
    "deleted_by": null,
    "reviewer": {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

### Add a Review Comment
```bash
curl -X POST "http://localhost:3004/api/news/YOUR_NEWS_ID/review-comments" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": "This is a test review comment"}'
```

## Step 6: Check Backend Logs

Look for this debug line in your backend console:
```
[NewsReviewCommentsService] Review comments data: [...]
```

This will show you exactly what the backend is returning.

## Troubleshooting

### Issue: "Unknown" showing as author name

**Possible causes:**
1. Foreign key join not returning data
2. `full_name` field is NULL in users table
3. Foreign key constraint name mismatch

**Solution:**
Check if the user who created the comment has a `full_name` in the users table:
```sql
SELECT id, email, full_name, role
FROM users
WHERE id = 'REVIEWER_ID_FROM_COMMENT';
```

If `full_name` is NULL, update it:
```sql
UPDATE users
SET full_name = 'John Doe'
WHERE id = 'USER_ID';
```

### Issue: "reviewer" field is null in API response

**Cause:** Foreign key join syntax issue

**Solution:**
I've updated the backend to use simpler join syntax:
- Old: `reviewer:users!news_review_comments_reviewer_id_fkey(...)`
- New: `reviewer:reviewer_id(...)`

The new syntax tells Supabase to follow the foreign key from the `reviewer_id` column automatically.
