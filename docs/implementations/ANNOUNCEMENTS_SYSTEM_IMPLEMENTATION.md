# Announcements System Implementation Complete

## Overview

The announcements system has been fully implemented with two main components:
1. **School Announcements** - Full-featured announcement management for admins/teachers
2. **Banner Notifications** - Top-of-page banner alerts for important messages

---

## What Was Created

### 1. SQL Migration Script

**File**: `core-api-layer/southville-nhs-school-portal-api-layer/announcements_system_migration.sql`

**Tables Created**:
- `announcements` - Main announcements table
- `announcement_targets` - Role targeting (many-to-many with roles)
- `announcement_tags` - Tag association (many-to-many with tags)
- `banner_notifications` - Banner alerts table
- `announcement_views` - View tracking/analytics

**Features**:
- Row-Level Security (RLS) policies enabled
- Full-text search on announcement content
- Helper functions for common queries
- Proper indexing for performance
- Data validation constraints

---

### 2. Banner Notifications Module (NEW)

**Location**: `core-api-layer/southville-nhs-school-portal-api-layer/src/banner-notifications/`

**Files Created**:
```
banner-notifications/
├── banner-notifications.module.ts
├── banner-notifications.controller.ts
├── banner-notifications.service.ts
├── dto/
│   ├── create-banner.dto.ts
│   └── update-banner.dto.ts
└── entities/
    └── banner.entity.ts
```

---

## API Endpoints

### Announcements Endpoints (Already Existed)

**Base URL**: `/api/v1/announcements`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Admin/Teacher | Create announcement |
| GET | `/` | Public | Get all announcements (paginated) |
| GET | `/my-announcements` | Authenticated | Get user-specific announcements |
| GET | `/:id` | Public | Get single announcement |
| PATCH | `/:id` | Admin/Owner | Update announcement |
| DELETE | `/:id` | Admin | Delete announcement |
| POST | `/tags` | Admin | Create tag |
| GET | `/tags` | Public | Get all tags |
| PATCH | `/tags/:id` | Admin | Update tag |
| DELETE | `/tags/:id` | Admin | Delete tag |

### Banner Notifications Endpoints (NEW)

**Base URL**: `/api/v1/banner-notifications`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Admin | Create banner |
| GET | `/` | Admin | Get all banners (paginated) |
| GET | `/active` | **Public** | Get currently active banners |
| GET | `/:id` | Admin | Get single banner |
| PATCH | `/:id` | Admin | Update banner |
| PATCH | `/:id/toggle` | Admin | Toggle banner active status |
| DELETE | `/:id` | Admin | Delete banner |

---

## Database Schema

### Announcements Table

```sql
announcements (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  title varchar(255),
  content text,
  created_at timestamptz,
  updated_at timestamptz,
  expires_at timestamptz,
  type varchar(50),
  visibility varchar(50) -- 'public' or 'private'
)
```

### Banner Notifications Table

```sql
banner_notifications (
  id uuid PRIMARY KEY,
  message text,
  short_message varchar(255),
  type varchar(50), -- 'info', 'success', 'warning', 'destructive'
  is_active boolean,
  is_dismissible boolean,
  has_action boolean,
  action_label varchar(100),
  action_url varchar(500),
  start_date timestamptz,
  end_date timestamptz,
  created_by uuid REFERENCES users(id),
  template varchar(100),
  created_at timestamptz,
  updated_at timestamptz
)
```

---

## Next Steps - Integration

### 1. Run the SQL Migration

Execute the migration script in your Supabase database:

```sql
-- Run this in Supabase SQL Editor
\i announcements_system_migration.sql
```

Or copy-paste the contents of `announcements_system_migration.sql` into the Supabase SQL editor.

### 2. Start the API Server

```bash
cd core-api-layer/southville-nhs-school-portal-api-layer
npm run start:dev
```

The API will be available at: `http://localhost:3000/api/v1`

Swagger docs: `http://localhost:3000/api/docs`

### 3. Frontend Integration

You need to create API endpoint functions and hooks in the frontend.

#### Create API Endpoints File

**File**: `frontend-nextjs/lib/api/endpoints/announcements.ts`

```typescript
import { apiClient } from '../client'

export const announcementsApi = {
  // Announcements
  getAll: (params?: any) => apiClient.get('/announcements', { params }),
  getById: (id: string) => apiClient.get(`/announcements/${id}`),
  create: (data: any) => apiClient.post('/announcements', data),
  update: (id: string, data: any) => apiClient.patch(`/announcements/${id}`, data),
  delete: (id: string) => apiClient.delete(`/announcements/${id}`),

  // Tags
  getTags: () => apiClient.get('/announcements/tags'),
  createTag: (data: any) => apiClient.post('/announcements/tags', data),
  updateTag: (id: string, data: any) => apiClient.patch(`/announcements/tags/${id}`, data),
  deleteTag: (id: string) => apiClient.delete(`/announcements/tags/${id}`),
}
```

**File**: `frontend-nextjs/lib/api/endpoints/banners.ts`

```typescript
import { apiClient } from '../client'

export const bannersApi = {
  getAll: (params?: any) => apiClient.get('/banner-notifications', { params }),
  getActive: () => apiClient.get('/banner-notifications/active'),
  getById: (id: string) => apiClient.get(`/banner-notifications/${id}`),
  create: (data: any) => apiClient.post('/banner-notifications', data),
  update: (id: string, data: any) => apiClient.patch(`/banner-notifications/${id}`, data),
  toggle: (id: string) => apiClient.patch(`/banner-notifications/${id}/toggle`),
  delete: (id: string) => apiClient.delete(`/banner-notifications/${id}`),
}
```

#### Create React Query Hooks

**File**: `frontend-nextjs/hooks/useAnnouncements.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementsApi } from '@/lib/api/endpoints/announcements'

export const useAnnouncements = (params?: any) => {
  return useQuery({
    queryKey: ['announcements', params],
    queryFn: () => announcementsApi.getAll(params),
  })
}

export const useAnnouncementMutations = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: announcementsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      announcementsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: announcementsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
  })

  return { createMutation, updateMutation, deleteMutation }
}
```

**File**: `frontend-nextjs/hooks/useBanners.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bannersApi } from '@/lib/api/endpoints/banners'

export const useBanners = (params?: any) => {
  return useQuery({
    queryKey: ['banners', params],
    queryFn: () => bannersApi.getAll(params),
  })
}

export const useActiveBanners = () => {
  return useQuery({
    queryKey: ['banners', 'active'],
    queryFn: bannersApi.getActive,
    refetchInterval: 60000, // Refresh every minute
  })
}

export const useBannerMutations = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: bannersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      bannersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: bannersApi.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: bannersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] })
    },
  })

  return { createMutation, updateMutation, toggleMutation, deleteMutation }
}
```

#### Update Frontend Pages

Replace mock data in:
- `frontend-nextjs/app/superadmin/announcements/page.tsx`
- `frontend-nextjs/app/superadmin/announcements/create/page.tsx`

Use the hooks instead:

```typescript
// In page.tsx
import { useAnnouncements } from '@/hooks/useAnnouncements'
import { useBanners } from '@/hooks/useBanners'

const { data: announcementsData, isLoading } = useAnnouncements({ page: 1, limit: 10 })
const { data: bannersData } = useBanners()
```

---

## Features Implemented

### Announcements Features
- ✅ Create/Read/Update/Delete announcements
- ✅ Role-based targeting (announcements for specific roles)
- ✅ Tag management and association
- ✅ Expiration dates
- ✅ Public/Private visibility
- ✅ Full-text search on content
- ✅ Pagination and filtering
- ✅ User-specific announcements endpoint
- ✅ View tracking/analytics
- ✅ Row-Level Security (RLS) policies

### Banner Features
- ✅ Create/Read/Update/Delete banners
- ✅ Active/Inactive toggle
- ✅ Date range scheduling (start/end dates)
- ✅ Multiple banner types (info, success, warning, destructive)
- ✅ Dismissible banners option
- ✅ Action buttons with custom labels and URLs
- ✅ Public endpoint for active banners
- ✅ Template support
- ✅ Auto-expire based on date range
- ✅ Caching for performance

---

## Security Features

### Authentication & Authorization
- **Admin only** can create/update/delete banners
- **Admin & Teachers** can create announcements
- **Teachers** can only update their own announcements
- **Public** can view public announcements and active banners
- **Authenticated users** can view role-targeted announcements

### Data Validation
- Title length: 3-255 characters
- Content length: 10-10,000 characters (announcements)
- Message length: 10-5,000 characters (banners)
- Date validation (end date must be after start date)
- HTML sanitization on announcement content
- Action URL validation for banners

### Row-Level Security (RLS)
- All tables have RLS policies enabled
- Fine-grained access control
- Service role bypasses RLS for admin operations

---

## Performance Optimizations

- ✅ Caching with TTL (5 minutes default)
- ✅ Database indexes on frequently queried fields
- ✅ Full-text search indexes
- ✅ Pagination for large datasets
- ✅ Efficient foreign key relationships

---

## Testing the API

### Test Announcements

```bash
# Get all announcements
curl http://localhost:3000/api/v1/announcements

# Get active banners (public endpoint)
curl http://localhost:3000/api/v1/banner-notifications/active

# Create announcement (requires auth)
curl -X POST http://localhost:3000/api/v1/announcements \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Announcement",
    "content": "This is a test announcement content.",
    "visibility": "public",
    "targetRoleIds": ["role-uuid-here"]
  }'

# Create banner (Admin only)
curl -X POST http://localhost:3000/api/v1/banner-notifications \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Important: School will be closed tomorrow due to weather.",
    "shortMessage": "School Closure Alert",
    "type": "warning",
    "isActive": true,
    "isDismissible": true,
    "startDate": "2024-01-15T08:00:00Z",
    "endDate": "2024-01-15T18:00:00Z"
  }'
```

---

## Migration Checklist

- [ ] Run SQL migration in Supabase
- [ ] Verify tables created successfully
- [ ] Test API endpoints with Swagger docs
- [ ] Create frontend API endpoint files
- [ ] Create React Query hooks
- [ ] Update frontend pages to use real API
- [ ] Test announcements CRUD operations
- [ ] Test banner CRUD operations
- [ ] Test role-based targeting
- [ ] Test banner active/inactive toggle
- [ ] Test public endpoints
- [ ] Verify RLS policies work correctly

---

## Documentation Links

- **Swagger API Docs**: `http://localhost:3000/api/docs`
- **Announcements Controller**: `src/announcements/announcements.controller.ts`
- **Banner Controller**: `src/banner-notifications/banner-notifications.controller.ts`
- **SQL Migration**: `announcements_system_migration.sql`

---

## Support

If you encounter any issues:

1. Check Supabase SQL editor for migration errors
2. Check API logs: `npm run start:dev`
3. Verify environment variables are set correctly
4. Check Swagger docs for endpoint details
5. Verify JWT token is valid and user has correct role

---

**Status**: ✅ Backend Implementation Complete
**Next**: Frontend Integration Required
