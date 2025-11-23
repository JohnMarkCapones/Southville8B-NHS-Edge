# News System - Testing Guide

Comprehensive guide for testing all aspects of the News/Journalism system.

---

## Table of Contents

1. [Setup](#setup)
2. [Test Data Preparation](#test-data-preparation)
3. [API Endpoint Testing](#api-endpoint-testing)
4. [Permission Testing](#permission-testing)
5. [Workflow Testing](#workflow-testing)
6. [Edge Cases & Error Scenarios](#edge-cases--error-scenarios)
7. [Automated Testing](#automated-testing)
8. [Postman Collection](#postman-collection)

---

## Setup

### Prerequisites

1. **Backend running**: `npm run start:dev` in `core-api-layer/`
2. **Database migrated**: Execute `news_system_migration.sql` and `news_system_rls_policies.sql`
3. **R2 configured**: Environment variables set in `.env`
4. **Supabase Auth configured**: Users can register/login

### Test Tools

- **Postman** or **Thunder Client** (VSCode extension)
- **cURL** for command-line testing
- **Swagger UI** at `http://localhost:3000/api/docs`
- **Supabase Dashboard** for database verification

### Base URL

```
http://localhost:3000/api/v1
```

---

## Test Data Preparation

### Step 1: Create Test Users

Create 5 test users in Supabase Auth:

1. **Adviser** (teacher) - `adviser@test.com`
2. **Co-Adviser** (teacher) - `coadviser@test.com`
3. **Editor-in-Chief** (student) - `eic@test.com`
4. **Writer** (student) - `writer@test.com`
5. **Member** (student, no publishing rights) - `member@test.com`

Register these users via Supabase Auth or your frontend registration page.

### Step 2: Assign Journalism Positions

After user registration, assign them to journalism domain with appropriate positions:

```sql
-- Get journalism domain ID
SELECT id FROM domains WHERE name = 'Journalism';
-- Let's say it's 'JOURNALISM_DOMAIN_UUID'

-- Get domain role IDs
SELECT id, name FROM domain_roles WHERE domain_id = 'JOURNALISM_DOMAIN_UUID';
-- Map positions: Adviser, Co-Adviser, EIC, Co-EIC, Publisher, Writer, Member

-- Assign users to positions (replace UUIDs with actual values)
INSERT INTO user_domain_roles (user_id, domain_id, domain_role_id)
VALUES
  ('adviser-user-uuid', 'journalism-domain-uuid', 'adviser-role-uuid'),
  ('coadviser-user-uuid', 'journalism-domain-uuid', 'coadviser-role-uuid'),
  ('eic-user-uuid', 'journalism-domain-uuid', 'eic-role-uuid'),
  ('writer-user-uuid', 'journalism-domain-uuid', 'writer-role-uuid'),
  ('member-user-uuid', 'journalism-domain-uuid', 'member-role-uuid');
```

### Step 3: Get Access Tokens

For each test user, login and get their JWT access token:

```bash
# Login via Supabase Auth
curl -X POST 'https://<supabase-project>.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: <supabase-anon-key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "adviser@test.com",
    "password": "test123456"
  }'

# Extract access_token from response
```

Save each user's access token for testing.

### Step 4: Verify Categories

Check that seed categories exist:

```bash
curl -X GET 'http://localhost:3000/api/v1/news-categories/public'
```

Expected: 10 categories (Academic, Events, Sports, etc.)

---

## API Endpoint Testing

### 1. Public Endpoints (No Auth)

#### GET /news/public - Get Published Articles

```bash
curl -X GET 'http://localhost:3000/api/v1/news/public?limit=10&offset=0'
```

**Expected**: Empty array initially (no published articles yet)

#### GET /news-categories/public - Get Categories

```bash
curl -X GET 'http://localhost:3000/api/v1/news-categories/public'
```

**Expected**: Array of 10 categories

### 2. Article Creation (Authenticated)

#### POST /news - Create Article (Writer)

```bash
curl -X POST 'http://localhost:3000/api/v1/news' \
  -H 'Authorization: Bearer <writer-access-token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Test Article by Writer",
    "articleJson": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "This is a test article with some content."
            }
          ]
        }
      ]
    },
    "articleHtml": "<p>This is a test article with some content.</p>",
    "categoryId": "<get-from-categories-endpoint>",
    "tags": ["test", "article"],
    "visibility": "public",
    "description": "A test article for testing purposes"
  }'
```

**Expected**:
- Status: 201
- Response: Article object with `status: 'draft'`, `slug` generated, `author_id` set

**Test Variations**:
- ✅ Without `description` (should auto-generate from HTML)
- ✅ Without `featuredImageUrl` (should use first image from article)
- ✅ With `visibility: 'journalism'`
- ✅ With multiple tags

#### POST /news - Create Article (Member - Should Fail)

```bash
curl -X POST 'http://localhost:3000/api/v1/news' \
  -H 'Authorization: Bearer <member-access-token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Test Article by Member",
    "articleJson": {},
    "articleHtml": "<p>Test</p>",
    "categoryId": "<category-id>",
    "visibility": "public"
  }'
```

**Expected**:
- Status: 403
- Error: "User does not have permission to publish news"

### 3. Image Upload

#### POST /news/upload-image - Upload Image

```bash
curl -X POST 'http://localhost:3000/api/v1/news/upload-image' \
  -H 'Authorization: Bearer <writer-access-token>' \
  -F 'image=@/path/to/test-image.jpg'
```

**Expected**:
- Status: 201
- Response: `{ url: "https://...", fileName: "...", fileSize: 12345 }`

**Test Variations**:
- ✅ Upload JPG, PNG, GIF, WebP, SVG
- ❌ Upload non-image file (should fail)
- ❌ Upload file >10MB (should fail)

### 4. Article Retrieval

#### GET /news - Get All Articles (Filtered)

```bash
# Get all articles
curl -X GET 'http://localhost:3000/api/v1/news' \
  -H 'Authorization: Bearer <writer-access-token>'

# Get by status
curl -X GET 'http://localhost:3000/api/v1/news?status=draft' \
  -H 'Authorization: Bearer <writer-access-token>'

# Get by category
curl -X GET 'http://localhost:3000/api/v1/news?categoryId=<category-id>' \
  -H 'Authorization: Bearer <writer-access-token>'
```

**Expected**: Filtered results based on query params

#### GET /news/my-articles - Get Current User's Articles

```bash
curl -X GET 'http://localhost:3000/api/v1/news/my-articles' \
  -H 'Authorization: Bearer <writer-access-token>'
```

**Expected**: Only articles authored by current user

#### GET /news/:id - Get Article by ID

```bash
curl -X GET 'http://localhost:3000/api/v1/news/<article-id>' \
  -H 'Authorization: Bearer <writer-access-token>'
```

**Expected**: Single article object

### 5. Article Updates

#### PATCH /news/:id - Update Article (Author)

```bash
curl -X PATCH 'http://localhost:3000/api/v1/news/<article-id>' \
  -H 'Authorization: Bearer <writer-access-token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Updated Title",
    "articleHtml": "<p>Updated content</p>",
    "articleJson": { ... }
  }'
```

**Expected**:
- Status: 200
- Article updated successfully

**Test Restrictions**:
- ✅ Author can update own draft/pending articles
- ❌ Author cannot update published articles (403)
- ❌ Non-author cannot update (403)
- ✅ Adviser can update any draft/pending/approved article

### 6. Article Deletion

#### DELETE /news/:id - Delete Article (Author, Draft Only)

```bash
curl -X DELETE 'http://localhost:3000/api/v1/news/<article-id>' \
  -H 'Authorization: Bearer <writer-access-token>'
```

**Expected**:
- Status: 204 (No Content)
- Article soft-deleted (`deleted_at` set)

**Test Restrictions**:
- ✅ Author can delete own drafts
- ❌ Author cannot delete pending/approved/published articles
- ✅ Adviser can delete any drafts

---

## Permission Testing

### Writer Permission Matrix

| Action | Draft (Own) | Draft (Others) | Pending | Approved | Published |
|--------|-------------|----------------|---------|----------|-----------|
| Create | ✅ | N/A | N/A | N/A | N/A |
| Read | ✅ | ❌ | ✅ | ✅ | ✅ |
| Update | ✅ | ❌ | ✅ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ | ❌ |
| Submit | ✅ | ❌ | ❌ | ❌ | ❌ |

### Adviser Permission Matrix

| Action | Any Draft | Any Pending | Any Approved | Any Published |
|--------|-----------|-------------|--------------|---------------|
| Create | ✅ | N/A | N/A | N/A |
| Read | ✅ | ✅ | ✅ | ✅ |
| Update | ✅ | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ |
| Approve | N/A | ✅ | N/A | N/A |
| Reject | N/A | ✅ | N/A | N/A |
| Publish | N/A | N/A | ✅ | N/A |

### Member (No Publishing Rights)

| Action | Result |
|--------|--------|
| Create | ❌ 403 |
| Read Published | ✅ (if public or journalism member) |
| Update | ❌ 403 |
| Delete | ❌ 403 |

### Test Each Permission

Create a test script to verify all permissions:

```bash
# Writer creates article
ARTICLE_ID=$(curl -s -X POST 'http://localhost:3000/api/v1/news' \
  -H 'Authorization: Bearer <writer-token>' \
  -H 'Content-Type: application/json' \
  -d '{ ... }' | jq -r '.id')

# Member tries to update (should fail)
curl -X PATCH "http://localhost:3000/api/v1/news/$ARTICLE_ID" \
  -H 'Authorization: Bearer <member-token>' \
  -H 'Content-Type: application/json' \
  -d '{ "title": "Hacked" }'
# Expected: 403

# Adviser updates article (should succeed)
curl -X PATCH "http://localhost:3000/api/v1/news/$ARTICLE_ID" \
  -H 'Authorization: Bearer <adviser-token>' \
  -H 'Content-Type: application/json' \
  -d '{ "title": "Fixed by Adviser" }'
# Expected: 200
```

---

## Workflow Testing

### Complete Article Lifecycle

```bash
#!/bin/bash
# Test complete article workflow

BASE_URL="http://localhost:3000/api/v1"
WRITER_TOKEN="<writer-access-token>"
ADVISER_TOKEN="<adviser-access-token>"
CATEGORY_ID="<category-id>"

echo "1. Writer creates draft article"
ARTICLE_ID=$(curl -s -X POST "$BASE_URL/news" \
  -H "Authorization: Bearer $WRITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Workflow Test Article",
    "articleJson": { "type": "doc", "content": [] },
    "articleHtml": "<p>Test article for workflow</p>",
    "categoryId": "'"$CATEGORY_ID"'",
    "visibility": "public"
  }' | jq -r '.id')

echo "Article ID: $ARTICLE_ID"
echo "Status: draft"

echo ""
echo "2. Writer submits for approval"
curl -s -X POST "$BASE_URL/news/$ARTICLE_ID/submit" \
  -H "Authorization: Bearer $WRITER_TOKEN" | jq '.'
echo "Status: pending_approval"

echo ""
echo "3. Adviser approves article"
curl -s -X POST "$BASE_URL/news/$ARTICLE_ID/approve" \
  -H "Authorization: Bearer $ADVISER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "remarks": "Looks good!" }' | jq '.'
echo "Status: approved"

echo ""
echo "4. Adviser publishes article"
curl -s -X POST "$BASE_URL/news/$ARTICLE_ID/publish" \
  -H "Authorization: Bearer $ADVISER_TOKEN" | jq '.'
echo "Status: published"

echo ""
echo "5. Verify article is public"
curl -s -X GET "$BASE_URL/news/public?limit=1" | jq '.'

echo ""
echo "6. View approval history"
curl -s -X GET "$BASE_URL/news/$ARTICLE_ID/approval-history" \
  -H "Authorization: Bearer $WRITER_TOKEN" | jq '.'
```

**Expected Output**:
- Article transitions: draft → pending_approval → approved → published
- Published article appears in `/news/public`
- Approval history shows approval record

### Rejection Workflow

```bash
echo "1. Writer creates draft"
ARTICLE_ID=$(curl -s -X POST "$BASE_URL/news" \
  -H "Authorization: Bearer $WRITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ ... }' | jq -r '.id')

echo "2. Writer submits for approval"
curl -s -X POST "$BASE_URL/news/$ARTICLE_ID/submit" \
  -H "Authorization: Bearer $WRITER_TOKEN"

echo "3. Adviser rejects article"
curl -s -X POST "$BASE_URL/news/$ARTICLE_ID/reject" \
  -H "Authorization: Bearer $ADVISER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "remarks": "Needs more content and better images" }' | jq '.'

echo "4. Writer can now edit and re-submit"
curl -s -X PATCH "$BASE_URL/news/$ARTICLE_ID" \
  -H "Authorization: Bearer $WRITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "articleHtml": "<p>Updated with more content</p>" }' | jq '.'

curl -s -X POST "$BASE_URL/news/$ARTICLE_ID/submit" \
  -H "Authorization: Bearer $WRITER_TOKEN"
```

**Expected**:
- Article status: draft → pending → rejected → draft → pending (re-submitted)
- Approval history shows rejection with remarks

---

## Edge Cases & Error Scenarios

### 1. Duplicate Slug Handling

```bash
# Create first article with title "Test Article"
curl -X POST 'http://localhost:3000/api/v1/news' \
  -H "Authorization: Bearer $WRITER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{ "title": "Test Article", ... }'
# Slug: "test-article"

# Create second article with same title
curl -X POST 'http://localhost:3000/api/v1/news' \
  -H "Authorization: Bearer $WRITER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{ "title": "Test Article", ... }'
# Expected: Slug "test-article-1" or similar
```

### 2. Missing Featured Image

```bash
# Create article without featured image and no images in content
curl -X POST 'http://localhost:3000/api/v1/news' \
  -H "Authorization: Bearer $WRITER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "No Images",
    "articleHtml": "<p>Text only content</p>",
    "articleJson": { ... },
    "categoryId": "...",
    "visibility": "public"
  }'
```

**Expected**:
- Status: 400
- Error: "Article must have at least one image"

### 3. Auto-Generated Description

```bash
# Create article without description
curl -X POST 'http://localhost:3000/api/v1/news' \
  -H "Authorization: Bearer $WRITER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Auto Description Test",
    "articleHtml": "<p>This is a long paragraph with lots of text that should be truncated to 200 characters...</p>",
    "articleJson": { ... },
    "categoryId": "...",
    "featuredImageUrl": "https://...",
    "visibility": "public"
  }'
```

**Expected**:
- `description` field auto-generated from first 200 characters of HTML

### 4. Tag Auto-Creation

```bash
# Create article with new tags
curl -X POST 'http://localhost:3000/api/v1/news' \
  -H "Authorization: Bearer $WRITER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Tag Test",
    "tags": ["newtag1", "newtag2", "existingtag"],
    ...
  }'
```

**Expected**:
- New tags created automatically in `tags` table
- Junction records created in `news_tags`

### 5. Published Article Immutability

```bash
# Try to update published article
curl -X PATCH 'http://localhost:3000/api/v1/news/<published-article-id>' \
  -H "Authorization: Bearer $WRITER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{ "title": "Hacked" }'
```

**Expected**:
- Status: 400
- Error: "Cannot edit published articles"

### 6. Co-Authors

```bash
# Add co-author
curl -X POST "http://localhost:3000/api/v1/news/$ARTICLE_ID/co-authors" \
  -H "Authorization: Bearer $WRITER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{ "coAuthorUserId": "<eic-user-id>" }'

# Expected: 201, co-author added

# Remove co-author
curl -X DELETE "http://localhost:3000/api/v1/news/$ARTICLE_ID/co-authors/<eic-user-id>" \
  -H "Authorization: Bearer $WRITER_TOKEN"

# Expected: 204, co-author removed
```

---

## Automated Testing

### Unit Tests (NestJS + Jest)

Create test files for each service:

**Example: `news.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './news.service';
import { SupabaseService } from '../supabase/supabase.service';
import { NewsImageService } from './news-image.service';
import { TagsService } from './tags.service';
import { NewsAccessService } from './news-access.service';

describe('NewsService', () => {
  let service: NewsService;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        {
          provide: SupabaseService,
          useValue: {
            getServiceClient: jest.fn(() => ({
              from: jest.fn().mockReturnThis(),
              insert: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              single: jest.fn(),
            })),
          },
        },
        {
          provide: NewsImageService,
          useValue: {
            validateAndGetFeaturedImage: jest.fn((url, html) => url || 'http://example.com/image.jpg'),
            generateDescriptionFromHtml: jest.fn((html) => 'Test description'),
          },
        },
        {
          provide: TagsService,
          useValue: {
            getOrCreate: jest.fn((name) => ({ id: 'tag-id', name })),
          },
        },
        {
          provide: NewsAccessService,
          useValue: {
            requirePublishingPermission: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a draft article', async () => {
      const createDto = {
        title: 'Test Article',
        articleJson: {},
        articleHtml: '<p>Test</p>',
        categoryId: 'cat-id',
        visibility: 'public' as const,
      };

      const mockInsert = jest.fn().mockResolvedValue({
        data: { id: 'article-id', ...createDto, status: 'draft' },
        error: null,
      });

      jest.spyOn(supabaseService.getServiceClient(), 'insert').mockReturnValue({
        select: () => ({ single: mockInsert }),
      } as any);

      const result = await service.create(createDto, 'user-id');

      expect(result).toBeDefined();
      expect(result.status).toBe('draft');
    });
  });
});
```

Run tests:
```bash
npm run test
npm run test:cov  # With coverage
```

### E2E Tests (End-to-End)

**Example: `news.e2e-spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('NewsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login and get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'writer@test.com', password: 'test123456' });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/news (POST) - Create article', () => {
    return request(app.getHttpServer())
      .post('/news')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'E2E Test Article',
        articleJson: {},
        articleHtml: '<p>Test</p>',
        categoryId: 'valid-category-id',
        visibility: 'public',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.status).toBe('draft');
      });
  });

  it('/news/public (GET) - Get published articles', () => {
    return request(app.getHttpServer())
      .get('/news/public')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
```

Run E2E tests:
```bash
npm run test:e2e
```

---

## Postman Collection

### Import Collection

Create a Postman collection with these requests:

**Collection Structure:**

```
News System API
├── Public
│   ├── Get Published Articles
│   ├── Get Article by Slug
│   └── Get Categories
├── Authentication
│   └── Login (Get Token)
├── Articles
│   ├── Create Article
│   ├── Get All Articles
│   ├── Get My Articles
│   ├── Get Article by ID
│   ├── Update Article
│   └── Delete Article
├── Workflow
│   ├── Submit for Approval
│   ├── Approve Article
│   ├── Reject Article
│   ├── Publish Article
│   └── Get Approval History
├── Images
│   └── Upload Image
├── Co-Authors
│   ├── Add Co-Author
│   └── Remove Co-Author
└── Categories
    ├── Create Category
    ├── Get Categories
    ├── Update Category
    └── Delete Category
```

**Environment Variables:**

```json
{
  "baseUrl": "http://localhost:3000/api/v1",
  "writerToken": "<writer-jwt-token>",
  "adviserToken": "<adviser-jwt-token>",
  "memberToken": "<member-jwt-token>",
  "categoryId": "<valid-category-uuid>",
  "articleId": "<test-article-uuid>"
}
```

**Example Request: Create Article**

```json
{
  "info": {
    "name": "Create Article",
    "request": {
      "method": "POST",
      "header": [
        {
          "key": "Authorization",
          "value": "Bearer {{writerToken}}"
        },
        {
          "key": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "mode": "raw",
        "raw": "{\n  \"title\": \"Test Article\",\n  \"articleJson\": {},\n  \"articleHtml\": \"<p>Test content</p>\",\n  \"categoryId\": \"{{categoryId}}\",\n  \"visibility\": \"public\"\n}"
      },
      "url": {
        "raw": "{{baseUrl}}/news",
        "host": ["{{baseUrl}}"],
        "path": ["news"]
      }
    }
  }
}
```

---

## Summary Checklist

### Database & Setup
- [ ] Migration SQL executed successfully
- [ ] RLS policies applied
- [ ] Test users created in Supabase Auth
- [ ] Users assigned to journalism positions
- [ ] Categories seeded (10 categories exist)

### Functionality Tests
- [ ] Public endpoints work without auth
- [ ] Image upload to R2 works
- [ ] Article creation with all fields
- [ ] Auto-generated slug (unique)
- [ ] Auto-generated description
- [ ] Featured image fallback (first article image)
- [ ] Tag auto-creation
- [ ] Co-authors add/remove

### Permission Tests
- [ ] Writer can create articles
- [ ] Member cannot create articles (403)
- [ ] Author can update own draft/pending
- [ ] Author cannot update published
- [ ] Adviser can update any draft/pending/approved
- [ ] Author can delete own drafts only
- [ ] Adviser can delete any drafts

### Workflow Tests
- [ ] Draft → Submit → Pending
- [ ] Pending → Approve → Approved
- [ ] Approved → Publish → Published
- [ ] Pending → Reject → Rejected
- [ ] Rejected → Update → Submit (re-submission)
- [ ] Published articles immutable

### Edge Cases
- [ ] Duplicate slug handling
- [ ] Missing featured image (error)
- [ ] Article without images (error)
- [ ] Large file upload (>10MB error)
- [ ] Invalid image type (error)
- [ ] Update published article (error)

### Automated Tests
- [ ] Unit tests pass (`npm run test`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Test coverage >80%

---

## Troubleshooting

### Common Issues

**Issue**: "User does not have permission to publish news"
- **Solution**: Verify user has correct journalism position assigned in `user_domain_roles`

**Issue**: "Article must have at least one image"
- **Solution**: Either provide `featuredImageUrl` OR include `<img>` tag in `articleHtml`

**Issue**: 403 on public endpoints
- **Solution**: Check RLS policies are correctly applied. Public endpoints should not require auth.

**Issue**: Image upload fails
- **Solution**: Verify R2 environment variables are set correctly. Test R2 connection with `npm run test:r2-connection`

**Issue**: Cannot update article
- **Solution**: Check article status. Published articles cannot be updated. Only draft/pending (by author) or draft/pending/approved (by adviser) can be updated.

### Debug Commands

```sql
-- Check user's journalism position
SELECT u.email, dr.name as position
FROM users u
JOIN user_domain_roles udr ON u.id = udr.user_id
JOIN domain_roles dr ON udr.domain_role_id = dr.id
JOIN domains d ON udr.domain_id = d.id
WHERE d.name = 'Journalism' AND u.id = '<user-uuid>';

-- Check article status
SELECT id, title, status, author_id, deleted_at FROM news WHERE id = '<article-uuid>';

-- Check approval history
SELECT * FROM news_approval WHERE news_id = '<article-uuid>' ORDER BY action_at DESC;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'news';
```

---

**Version:** 1.0
**Last Updated:** 2025-10-19
**Author:** Claude Code
