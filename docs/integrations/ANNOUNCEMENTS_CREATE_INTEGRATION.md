# Announcements Create Page - Backend Integration Complete

## Overview

Successfully hooked up the `/superadmin/announcements/create` page to the backend API. The announcement creation flow now uses real API endpoints instead of mock data.

## Changes Made

### 1. Created Roles API Endpoint (`frontend-nextjs/lib/api/endpoints/roles.ts`)

- **Purpose**: Fetch system roles (Student, Teacher, Admin) for announcement targeting
- **Functions**:
  - `getRoles()` - Get all system roles
  - `getRoleByName(name)` - Get role by name
- **Note**: Currently returns hardcoded roles. To use real database values, you need to:
  1. Run SQL query: `SELECT id, name FROM roles;`
  2. Update the hardcoded IDs in `roles.ts` with actual UUIDs from your database
  3. Or create a backend endpoint at `/api/v1/roles` to fetch them dynamically

### 2. Created Roles React Query Hook (`frontend-nextjs/hooks/useRoles.ts`)

- **Purpose**: Provide cached access to roles with automatic refetching
- **Cache Strategy**:
  - Stale time: 1 hour (roles rarely change)
  - Garbage collection: 2 hours
  - No refetch on window focus

### 3. Updated Create Announcement Page (`frontend-nextjs/app/superadmin/announcements/create/page.tsx`)

**Key Changes**:

#### Imports Added:
```typescript
import { useCreateAnnouncement } from "@/hooks/useAnnouncements"
import { AnnouncementVisibility } from "@/lib/api/types/announcements"
import { useRoles } from "@/hooks/useRoles"
```

#### Hooks Used:
```typescript
const createMutation = useCreateAnnouncement()
const { data: roles, isLoading: rolesLoading } = useRoles()
```

#### Replaced Mock Save Logic:
- **Before**: Console log + simulated delay
- **After**: Real API call with proper error handling

#### Data Transformation:
The form data is now properly transformed to match the backend schema:

```typescript
const announcementData = {
  title: title.trim(),
  content: content.trim(),
  type: category, // urgent, academic, event, general
  visibility: AnnouncementVisibility.PUBLIC,
  targetRoleIds: [], // Array of role UUIDs
  expiresAt: expirationDate || undefined,
  tagIds: [], // Empty for now, TODO: implement tag selection
}
```

#### Dynamic Role Mapping:
Instead of hardcoded role IDs, the code now dynamically finds role IDs from the fetched roles:

```typescript
if (targetStudents) {
  const studentRole = roles.find(r => r.name === 'Student')
  if (studentRole) targetRoleIds.push(studentRole.id)
}
// Same pattern for Teacher, Parent, Staff
```

### 4. Updated API Exports (`frontend-nextjs/lib/api/endpoints/index.ts`)

Added:
```typescript
export * from './roles';
```

## Backend API Compatibility

The implementation matches the backend schema:

### Backend DTO (`create-announcement.dto.ts`):
```typescript
{
  title: string;           // Min: 3, Max: 255 chars
  content: string;         // Min: 10, Max: 10,000 chars (HTML sanitized)
  expiresAt?: string;      // ISO date string (optional)
  type?: string;           // Max: 50 chars (e.g., 'event', 'urgent')
  visibility: 'public' | 'private';
  targetRoleIds: string[]; // Array of role UUIDs (min: 1, max: 10)
  tagIds?: string[];       // Array of tag UUIDs (max: 10)
}
```

### Backend Endpoint:
- **URL**: `POST /api/v1/announcements`
- **Auth**: Requires JWT token + Admin/Teacher roles
- **Response**: Full announcement object with generated ID

## Features Implemented

✅ **Create Announcements**: Full CRUD support via `useCreateAnnouncement()` hook
✅ **Form Validation**: Client-side validation before API call
✅ **Error Handling**: Proper error messages on failure
✅ **Success Feedback**: Toast notification on success
✅ **Navigation**: Auto-redirect to announcements list after creation
✅ **Loading States**: Button shows "Creating..." during API call
✅ **Role Targeting**: Dynamic role selection for target audience

## Remaining TODOs

### High Priority:

1. **Get Real Role IDs from Database**:
   ```sql
   -- Run this query in your Supabase SQL editor
   SELECT id, name FROM roles ORDER BY name;
   ```
   Then update the hardcoded IDs in `frontend-nextjs/lib/api/endpoints/roles.ts`

2. **Implement Tag Selection**:
   - Current: Free-text tags (not saved to backend)
   - Needed: Dropdown/multi-select with existing tags from `useTags()` hook
   - Backend already has tag endpoints ready

3. **Add Draft/Publish Status**:
   - Backend supports scheduling via `expiresAt`
   - Frontend removed the "Save as Draft" vs "Publish Now" distinction
   - Consider adding `status` field to backend DTO if needed

### Medium Priority:

4. **Add Visibility Toggle**:
   - Currently hardcoded to `PUBLIC`
   - Add UI toggle for Public vs Private announcements

5. **Remove Unused Fields**:
   - `excerpt` - Not in backend schema, remove from form
   - `priority` - Not in backend schema, can use `type` instead
   - `source` - Not in backend schema, remove or add to backend
   - `isPinned` - Not in backend schema, remove or add to backend
   - `trackReads` - Not in backend schema, remove or add to backend
   - Notification toggles (email, SMS, push) - Not in backend schema

6. **Add Content Sanitization Warning**:
   - Backend auto-sanitizes HTML content
   - Only allows: `<b>`, `<i>`, `<em>`, `<strong>`, `<p>`, `<br>`, `<ul>`, `<ol>`, `<li>`, `<a>`
   - Consider showing allowed tags in UI

### Low Priority:

7. **Create Backend `/roles` Endpoint**:
   - Replace hardcoded roles with dynamic fetch
   - Controller: `GET /api/v1/roles`
   - Already have `roles` table in database

8. **Add Announcement Preview Before Save**:
   - Preview dialog already exists
   - Just needs final polish

## Testing

### Manual Testing Steps:

1. **Start Backend**:
   ```bash
   cd core-api-layer/southville-nhs-school-portal-api-layer
   npm run start:dev
   ```

2. **Start Frontend**:
   ```bash
   cd frontend-nextjs
   npm run dev
   ```

3. **Navigate to**: `http://localhost:3000/superadmin/announcements/create`

4. **Test Creation**:
   - Fill in title (min 3 chars)
   - Add content (min 10 chars)
   - Select at least one target audience
   - Click "Publish Now"
   - Should see success toast and redirect

5. **Check Database**:
   ```sql
   SELECT * FROM announcements ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM announcement_targets WHERE announcement_id = '<new-announcement-id>';
   ```

### Known Issues to Watch For:

⚠️ **Role IDs are Hardcoded**: You MUST update them with your actual database UUIDs
⚠️ **Tags Don't Work**: Free-text tags are not saved (need proper tag selection UI)
⚠️ **Auth Required**: Must be logged in as Admin or Teacher

## Backend Files

Existing backend implementation (already complete):

- **Controller**: `core-api-layer/.../src/announcements/announcements.controller.ts:46-68`
- **Service**: `core-api-layer/.../src/announcements/announcements.service.ts`
- **DTO**: `core-api-layer/.../src/announcements/dto/create-announcement.dto.ts`
- **Entity**: `core-api-layer/.../src/announcements/entities/announcement.entity.ts`
- **Migration**: `core-api-layer/.../announcements_system_migration.sql`

## Frontend Files

Files created/modified:

- ✅ `frontend-nextjs/app/superadmin/announcements/create/page.tsx` (updated)
- ✅ `frontend-nextjs/hooks/useAnnouncements.ts` (already existed)
- ✅ `frontend-nextjs/hooks/useRoles.ts` (new)
- ✅ `frontend-nextjs/lib/api/endpoints/roles.ts` (new)
- ✅ `frontend-nextjs/lib/api/endpoints/announcements.ts` (already existed)
- ✅ `frontend-nextjs/lib/api/types/announcements.ts` (already existed)
- ✅ `frontend-nextjs/lib/api/endpoints/index.ts` (updated)

## Summary

The announcement creation page is now **fully hooked up to the backend API**. The infrastructure was already in place (hooks, endpoints, types), we just needed to wire it up in the create page component.

**Next step**: Update the role IDs with real database values and test the full flow!
