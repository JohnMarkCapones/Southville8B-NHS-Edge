# Review Status Column - Documentation

## Overview

The `review_status` column has been added to the `news` table to provide a more granular review workflow for articles. This column works alongside the existing `status` column to provide better tracking of article review states.

## Database Schema

### Column Definition

```sql
review_status VARCHAR(50) DEFAULT 'pending' 
CHECK (review_status IN ('pending', 'in_review', 'approved', 'rejected', 'needs_revision'))
```

### Possible Values

| Value | Description | Use Case |
|-------|-------------|----------|
| `pending` | Article is waiting for review | New articles, articles submitted for review |
| `in_review` | Article is currently being reviewed | Article is being actively reviewed by an adviser |
| `approved` | Article has been approved for publication | Article passed review and is ready to publish |
| `rejected` | Article has been rejected | Article failed review and needs major changes |
| `needs_revision` | Article needs minor revisions | Article needs small changes before approval |

## Relationship with Status Column

The `review_status` and `status` columns work together:

| Status | Typical Review Status | Description |
|--------|----------------------|-------------|
| `draft` | `pending` | Article is being written |
| `pending_approval` | `in_review` | Article submitted for review |
| `approved` | `approved` | Article approved by adviser |
| `published` | `approved` | Article is live |
| `rejected` | `rejected` | Article rejected |
| `archived` | `rejected` | Article archived |

## API Integration

### Create Article

```typescript
// Optional field in CreateNewsDto
const createDto: CreateNewsDto = {
  title: "My Article",
  articleJson: { /* Tiptap content */ },
  articleHtml: "<p>Content</p>",
  reviewStatus: "pending", // Optional, defaults to "pending"
  // ... other fields
};
```

### Update Article

```typescript
// Optional field in UpdateNewsDto
const updateDto: UpdateNewsDto = {
  reviewStatus: "in_review", // Can be updated
  // ... other fields
};
```

### Response Format

```typescript
interface NewsArticle {
  id: string;
  title: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'rejected' | 'archived';
  reviewStatus: 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_revision';
  // ... other fields
}
```

## Backend Implementation

### Entity Update

```typescript
@Entity('news')
export class News {
  // ... existing fields ...
  
  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending',
    nullable: true,
  })
  review_status?: 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_revision' | null;
  
  // ... other fields ...
}
```

### Service Layer

The `NewsService` has been updated to:

1. **Create**: Set `review_status` from DTO or default to `'pending'`
2. **Update**: Allow updating `review_status` field
3. **Map**: Include `review_status` in response mapping with fallback to `'pending'`

### Database Migration

The migration script (`ADD_REVIEW_STATUS_COLUMN.sql`) safely adds the column:

1. Adds column as nullable with default value
2. Updates existing records based on current status
3. Creates performance index
4. Includes rollback instructions

## Frontend Integration

### Superadmin Portal

The superadmin portal can now:

- Filter articles by `review_status`
- Update `review_status` when managing articles
- Display review status in article lists
- Use review status for workflow management

### Teacher Portal

Teachers (Advisers) can:

- See articles by review status
- Update review status during approval process
- Filter pending reviews by status

### Student Portal

Students can:

- See the review status of their articles
- Understand where their articles are in the review process

## Usage Examples

### Filtering Articles by Review Status

```typescript
// Get articles pending review
const pendingArticles = await newsService.findAll({
  reviewStatus: 'pending',
  status: 'pending_approval'
});

// Get articles in review
const inReviewArticles = await newsService.findAll({
  reviewStatus: 'in_review'
});
```

### Updating Review Status

```typescript
// Move article to in-review
await newsService.update(articleId, {
  reviewStatus: 'in_review'
}, userId);

// Approve article
await newsService.update(articleId, {
  reviewStatus: 'approved',
  status: 'approved'
}, userId);
```

## Migration Instructions

### 1. Run Database Migration

```bash
# Execute in Supabase SQL Editor
psql -h <host> -U postgres -d postgres -f scripts/ADD_REVIEW_STATUS_COLUMN.sql
```

### 2. Deploy Backend Changes

The backend code has been updated to support the new column:

- Entity updated with new field
- DTOs include `reviewStatus` field
- Service layer handles the new field
- API responses include `review_status`

### 3. Update Frontend (Optional)

Frontend components can be updated to use the new field:

```typescript
// Example: Display review status
const ReviewStatusBadge = ({ reviewStatus }: { reviewStatus: string }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_review: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    needs_revision: 'bg-orange-100 text-orange-800'
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[reviewStatus]}`}>
      {reviewStatus.replace('_', ' ')}
    </span>
  );
};
```

## Backward Compatibility

This change is **fully backward compatible**:

- ✅ Existing articles will have `review_status` set based on their current `status`
- ✅ API responses include the new field with sensible defaults
- ✅ Frontend components will work without changes (field is optional)
- ✅ Database queries continue to work
- ✅ No breaking changes to existing functionality

## Testing

### Test Cases

1. **Create Article**: Verify `review_status` defaults to `'pending'`
2. **Update Article**: Verify `review_status` can be updated
3. **Existing Articles**: Verify existing articles have correct `review_status`
4. **API Responses**: Verify API includes `review_status` field
5. **Database Queries**: Verify queries work with new column

### Test Script

```typescript
describe('Review Status Column', () => {
  it('should create article with default review_status', async () => {
    const article = await newsService.create({
      title: 'Test Article',
      articleJson: { type: 'doc' },
      articleHtml: '<p>Test</p>'
    }, userId);
    
    expect(article.review_status).toBe('pending');
  });
  
  it('should update review_status', async () => {
    await newsService.update(articleId, {
      reviewStatus: 'in_review'
    }, userId);
    
    const updated = await newsService.findById(articleId);
    expect(updated.review_status).toBe('in_review');
  });
});
```

## Rollback Instructions

If you need to rollback this change:

```sql
-- Remove the column
ALTER TABLE news DROP COLUMN IF EXISTS review_status;

-- Remove the index
DROP INDEX IF EXISTS idx_news_review_status;
```

Then revert the backend code changes.

## Future Enhancements

Potential future enhancements:

1. **Review Comments**: Add a `review_comments` column for feedback
2. **Reviewer Tracking**: Track who reviewed the article
3. **Review History**: Track review status changes over time
4. **Automated Workflows**: Auto-update status based on review_status
5. **Notifications**: Notify users when review_status changes

## Support

For questions or issues with the `review_status` column:

1. Check the migration script output
2. Verify database column exists: `SELECT column_name FROM information_schema.columns WHERE table_name = 'news' AND column_name = 'review_status';`
3. Test API endpoints with the new field
4. Check backend logs for any errors

---

**Migration Date**: 2025-01-27  
**Version**: 1.0  
**Status**: ✅ Ready for Production
