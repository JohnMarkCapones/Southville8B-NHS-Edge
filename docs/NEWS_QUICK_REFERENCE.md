# News System - Quick Reference Card

Fast reference for developers working with the News/Journalism system.

---

## 🚀 Quick Start

### 1. Database Setup (One-Time)

```bash
psql -h <host> -U postgres -d postgres -f news_system_migration.sql
psql -h <host> -U postgres -d postgres -f news_system_rls_policies.sql
```

### 2. Verify Backend Running

```bash
cd core-api-layer/southville-nhs-school-portal-api-layer
npm run start:dev
# Visit: http://localhost:3000/api/docs
```

### 3. Test User Setup

Create users with these positions:
- Adviser (teacher) → Can approve/reject/publish
- Writer (student) → Can create articles
- Member (student) → Cannot publish

---

## 📡 API Endpoints Cheat Sheet

**Base URL**: `http://localhost:3000/api/v1`

### Public (No Auth)
```bash
GET  /news/public                    # Published articles
GET  /news/public/slug/:slug         # Article by slug
GET  /news-categories/public         # All categories
```

### Articles (Auth Required)
```bash
POST   /news                         # Create article
POST   /news/upload-image            # Upload image to R2
GET    /news                         # Get articles (filtered)
GET    /news/my-articles             # My articles
GET    /news/pending-approval        # Pending (Advisers only)
GET    /news/:id                     # Get by ID
PATCH  /news/:id                     # Update
DELETE /news/:id                     # Delete (soft)
```

### Workflow
```bash
POST /news/:id/submit                # Submit for approval
POST /news/:id/approve               # Approve (Advisers)
POST /news/:id/reject                # Reject (Advisers)
POST /news/:id/publish               # Publish (Advisers)
GET  /news/:id/approval-history      # Approval history
```

### Co-Authors
```bash
POST   /news/:id/co-authors          # Add co-author
DELETE /news/:id/co-authors/:userId  # Remove co-author
```

### Categories
```bash
POST   /news-categories              # Create (Advisers)
GET    /news-categories              # Get all
PATCH  /news-categories/:id          # Update (Advisers)
DELETE /news-categories/:id          # Delete (Advisers)
```

---

## 🔑 Authentication Header

```bash
curl -H "Authorization: Bearer <jwt-token>" \
     http://localhost:3000/api/v1/news/my-articles
```

---

## 📝 Create Article Example

```bash
curl -X POST http://localhost:3000/api/v1/news \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Breaking News",
    "articleJson": { "type": "doc", "content": [...] },
    "articleHtml": "<p>Article content...</p>",
    "categoryId": "uuid-here",
    "tags": ["news", "important"],
    "visibility": "public",
    "featuredImageUrl": "https://r2.../image.jpg"
  }'
```

---

## 🖼️ Upload Image Example

```bash
curl -X POST http://localhost:3000/api/v1/news/upload-image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/image.jpg"

# Response: { "url": "https://...", "fileName": "...", "fileSize": 12345 }
```

---

## 🔄 Workflow States

```
draft → pending_approval → approved → published
         ↓                    ↓
      rejected ─────→ draft ──┘
```

**Status Meanings:**
- `draft` - Being written (editable by author)
- `pending_approval` - Submitted, awaiting review (editable by Advisers)
- `approved` - Approved by Adviser (editable by Advisers)
- `published` - Live (IMMUTABLE)
- `rejected` - Rejected with feedback (back to draft)

---

## 👥 Permissions Quick Ref

| Position | Can Create | Can Approve | Can Publish |
|----------|-----------|-------------|-------------|
| Member | ❌ | ❌ | ❌ |
| Writer | ✅ | ❌ | ❌ |
| Publisher | ✅ | ❌ | ❌ |
| EIC | ✅ | ❌ | ❌ |
| Co-EIC | ✅ | ❌ | ❌ |
| Adviser | ✅ | ✅ | ✅ |
| Co-Adviser | ✅ | ✅ | ✅ |

---

## 🗄️ Database Tables

- `news` - Articles
- `news_categories` - Categories (10 pre-seeded)
- `tags` - Auto-created tags
- `news_tags` - Article-tag junction
- `news_co_authors` - Co-authors junction
- `news_approval` - Approval history

---

## 🔍 Useful SQL Queries

### Check User Position
```sql
SELECT u.full_name, dr.name as position
FROM users u
JOIN user_domain_roles udr ON u.id = udr.user_id
JOIN domain_roles dr ON udr.domain_role_id = dr.id
JOIN domains d ON dr.domain_id = d.id
WHERE d.name = 'Journalism' AND u.id = '<user-uuid>';
```

### Assign Journalism Position
```sql
INSERT INTO user_domain_roles (user_id, domain_id, domain_role_id)
VALUES (
  '<user-uuid>',
  (SELECT id FROM domains WHERE name = 'Journalism'),
  (SELECT id FROM domain_roles WHERE name = 'Writer' AND domain_id = (SELECT id FROM domains WHERE name = 'Journalism'))
);
```

### Get Pending Articles
```sql
SELECT n.id, n.title, u.full_name as author
FROM news n
JOIN users u ON n.author_id = u.id
WHERE n.status = 'pending_approval'
ORDER BY n.created_at ASC;
```

---

## 🛠️ Common Troubleshooting

### "Permission denied" error
→ Check user has journalism position assigned

### "Article must have image" error
→ Add featured image OR include `<img>` in article HTML

### Image upload fails
→ Verify R2 credentials in `.env`

### Cannot update published article
→ Expected! Published articles are immutable

### Duplicate slug
→ Automatic handling: slug becomes `title-1`, `title-2`, etc.

---

## 📦 File Locations

```
src/news/
├── controllers/
│   ├── news.controller.ts
│   └── news-categories.controller.ts
├── services/
│   ├── news.service.ts
│   ├── news-access.service.ts
│   ├── news-approval.service.ts
│   ├── news-categories.service.ts
│   ├── tags.service.ts
│   └── news-image.service.ts
├── dto/
├── entities/
└── news.module.ts
```

---

## 🔗 Documentation Links

- **Complete Docs**: `NEWS_SYSTEM_COMPLETE_DOCUMENTATION.md`
- **Frontend Guide**: `NEWS_FRONTEND_INTEGRATION_GUIDE.md`
- **Testing Guide**: `NEWS_TESTING_GUIDE.md`
- **Swagger UI**: `http://localhost:3000/api/docs`

---

## ⚡ Frontend Integration Snippet

```typescript
// Tiptap Editor - Dual Storage
const [articleJson, setArticleJson] = useState({});
const [articleHtml, setArticleHtml] = useState('');

<TiptapEditor
  onChange={(json, html) => {
    setArticleJson(json);  // ProseMirror JSON
    setArticleHtml(html);  // Rendered HTML
  }}
/>

// Create Article
const response = await fetch('http://localhost:3000/api/v1/news', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: 'My Article',
    articleJson,
    articleHtml,
    categoryId: 'uuid',
    visibility: 'public',
  }),
});
```

---

## 🎨 Status Badge Colors

```typescript
const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  published: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
};
```

---

## 📊 Quick Stats Queries

```sql
-- Total articles by status
SELECT status, COUNT(*) FROM news GROUP BY status;

-- Most viewed articles
SELECT title, views FROM news ORDER BY views DESC LIMIT 10;

-- Articles by category
SELECT nc.name, COUNT(n.id) as count
FROM news_categories nc
LEFT JOIN news n ON nc.id = n.category_id
GROUP BY nc.id, nc.name;

-- Most active authors
SELECT u.full_name, COUNT(n.id) as articles
FROM users u
JOIN news n ON u.id = n.author_id
GROUP BY u.id, u.full_name
ORDER BY articles DESC LIMIT 10;
```

---

## 🚨 Important Notes

⚠️ **Published articles are IMMUTABLE** - Cannot be edited once published
⚠️ **Images uploaded to R2** - Not base64, not Supabase Storage
⚠️ **Dual storage required** - Both JSON (editing) and HTML (display)
⚠️ **RLS enabled** - Row-level security on all tables
⚠️ **Service client for writes** - Backend uses correct Supabase client
⚠️ **Featured image required** - Either uploaded OR from article content

---

**Need help?** See full documentation in `NEWS_SYSTEM_COMPLETE_DOCUMENTATION.md`
