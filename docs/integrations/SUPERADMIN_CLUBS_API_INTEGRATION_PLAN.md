# Superadmin Clubs Page - API Integration Plan

## Overview
This document outlines the comprehensive plan to integrate the `/superadmin/clubs` page with the real backend API, replacing mock data with live data from the NestJS API layer.

---

## Current State Analysis

### Frontend (`frontend-nextjs/app/superadmin/clubs/page.tsx`)

**Current Implementation:**
- Uses hardcoded mock data (10 clubs with extensive properties)
- Table displays: Checkbox, Club (with logo/description), Category, President, Adviser, Members, Status, Meeting, Actions
- Features: Search, filters (category, status), pagination, context menus, archived clubs view
- Modals: Delete confirmation, status change, members view, restore archived clubs

**Issues Identified:**
1. ✅ **Redundant Columns** (as requested):
   - **Category column** - Should be removed (category is now derived from domain)
   - **Meeting column** - Should be removed (meeting day/time not in backend schema)

2. **Mock Data Structure vs Backend Schema Mismatch:**
   - Mock uses: `president`, `vicePresident`, `adviser` (strings)
   - Backend uses: `president_id`, `vp_id`, `secretary_id`, `advisor_id`, `co_advisor_id` (UUIDs with populated objects)
   - Mock has: `category`, `meetingDay`, `meetingTime`, `meetingLocation`, `email`, `facebook`, `instagram`, `establishedDate`, `requirements`, `isRecruiting`
   - Backend has: `domain_id` (with domain relation), no social/meeting fields

3. **Missing Backend Features:**
   - No member count in backend response (needs to be calculated from club-memberships)
   - No logo/image URL field in backend
   - No recruiting status field

### Backend API Endpoints

**Base URL:** `http://localhost:3004/api/v1`

#### Available Endpoints:

1. **GET /clubs** - Get all clubs
   - Auth: Not required (public)
   - Returns: Array of Club objects with populated relations
   - Relations: president, vp, secretary, advisor, co_advisor, domain

2. **GET /clubs/:id** - Get single club
   - Auth: Not required (public)
   - Returns: Single Club object with relations

3. **POST /clubs** - Create club
   - Auth: Required (Admin/Teacher)
   - Body: CreateClubDto (name, description, president_id, vp_id, secretary_id, advisor_id, co_advisor_id?, domain_id)

4. **PATCH /clubs/:id** - Update club
   - Auth: Required (Admin/Teacher)
   - Policies: 'club.edit' on clubId domain
   - Body: UpdateClubDto (partial)

5. **DELETE /clubs/:id** - Delete club
   - Auth: Required (Admin only)
   - Policies: 'club.delete' on clubId domain
   - Returns: 204 No Content

6. **GET /clubs/:clubId/members** - Get club members
   - Auth: Not required (public)
   - Returns: Array of club members

7. **POST /clubs/:clubId/members** - Add member
   - Auth: Required (Admin/Teacher)
   - Policies: 'club.manage_members'

8. **GET /clubs/positions** - Get available positions
   - Auth: Not required (public)
   - Returns: Array of ClubPosition

9. **GET /club-memberships** - Get all memberships
   - Auth: Required
   - Query: ?clubId=xxx (optional)
   - Returns: Array of ClubMembership

10. **GET /club-memberships/student/:studentId** - Get student's clubs
    - Auth: Required

---

## Backend Data Schema

### Club Entity (from backend)
```typescript
interface Club {
  id: string;                    // UUID
  name: string;
  description: string;
  president_id: string;          // UUID (required)
  vp_id: string;                 // UUID (required)
  secretary_id: string;          // UUID (required)
  advisor_id: string;            // UUID (required)
  co_advisor_id?: string;        // UUID (optional)
  domain_id: string;             // UUID (required)
  created_at: string;            // ISO timestamp
  updated_at: string;            // ISO timestamp

  // Populated relations
  president?: { id: string; full_name: string; email: string; }
  vp?: { id: string; full_name: string; email: string; }
  secretary?: { id: string; full_name: string; email: string; }
  advisor?: { id: string; full_name: string; email: string; }
  co_advisor?: { id: string; full_name: string; email: string; }
  domain?: { id: string; type: string; name: string; }
}
```

### ClubMembership Model
```typescript
interface ClubMembership {
  id: string;
  student_id: string;
  club_id: string;
  position_id: string;
  joined_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}
```

---

## Integration Plan

### Phase 1: Update Table Structure ✅

**Remove redundant columns:**
1. Remove "Category" column (line 1081)
2. Remove "Meeting" column (lines 1086, 1146-1157)

**Updated table structure:**
```
| Checkbox | Club | President | Vice President | Adviser | Members | Status | Actions |
```

**Rationale:**
- Category is now represented through the `domain` relation
- Meeting information (day/time/location) is not stored in backend schema
- Simplifies UI and aligns with backend data model

### Phase 2: Create Data Transformation Layer

**File:** `frontend-nextjs/lib/api/adapters/clubs.adapter.ts`

Create adapter functions to transform backend Club data to frontend-friendly format:

```typescript
export interface ClubTableRow {
  id: string;
  name: string;
  description: string;
  logo?: string;  // Placeholder until image upload is implemented
  president: string;
  presidentEmail?: string;
  vicePresident: string;
  secretary: string;
  adviser: string;
  coAdviser?: string;
  domain: string;
  domainType: string;
  membersCount: number;
  activeMembers: number;
  status: 'Active' | 'Inactive' | 'On Hold' | 'Recruiting';
  isRecruiting: boolean;
  createdAt: string;
  updatedAt: string;
}

export function transformClubToTableRow(
  club: Club,
  memberships: ClubMembership[]
): ClubTableRow {
  const clubMemberships = memberships.filter(m => m.club_id === club.id);
  const activeMemberships = clubMemberships.filter(m => m.is_active);

  return {
    id: club.id,
    name: club.name,
    description: club.description,
    logo: undefined, // TODO: Add logo field to backend
    president: club.president?.full_name || 'N/A',
    presidentEmail: club.president?.email,
    vicePresident: club.vp?.full_name || 'N/A',
    secretary: club.secretary?.full_name || 'N/A',
    adviser: club.advisor?.full_name || 'N/A',
    coAdviser: club.co_advisor?.full_name,
    domain: club.domain?.name || 'Unknown',
    domainType: club.domain?.type || 'unknown',
    membersCount: clubMemberships.length,
    activeMembers: activeMemberships.length,
    status: 'Active', // TODO: Add status field to backend
    isRecruiting: false, // TODO: Add recruiting field to backend
    createdAt: club.created_at,
    updatedAt: club.updated_at,
  };
}
```

### Phase 3: Update API Client Functions

**File:** `frontend-nextjs/lib/api/endpoints/clubs.ts`

Enhance existing functions:

```typescript
/**
 * Get all clubs with member counts
 */
export async function getClubsWithMemberCounts(): Promise<ClubTableRow[]> {
  const [clubs, allMemberships] = await Promise.all([
    getClubs(),
    getClubMemberships(),
  ]);

  return clubs.map(club =>
    transformClubToTableRow(club, allMemberships)
  );
}

/**
 * Get all club memberships
 */
export async function getClubMemberships(clubId?: string): Promise<ClubMembership[]> {
  const endpoint = clubId
    ? `/club-memberships?clubId=${clubId}`
    : '/club-memberships';

  return apiClient.get<ClubMembership[]>(endpoint, { requiresAuth: true });
}

/**
 * Get members for a specific club
 */
export async function getClubMembers(clubId: string): Promise<any[]> {
  return apiClient.get<any[]>(`/clubs/${clubId}/members`, { requiresAuth: false });
}
```

### Phase 4: Implement React Query Hooks

**File:** `frontend-nextjs/hooks/use-clubs.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClubsWithMemberCounts,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  getClubMembers,
} from '@/lib/api/endpoints/clubs';

// Query Keys
export const clubKeys = {
  all: ['clubs'] as const,
  lists: () => [...clubKeys.all, 'list'] as const,
  list: (filters: string) => [...clubKeys.lists(), { filters }] as const,
  details: () => [...clubKeys.all, 'detail'] as const,
  detail: (id: string) => [...clubKeys.details(), id] as const,
  members: (id: string) => [...clubKeys.detail(id), 'members'] as const,
};

// Hooks
export function useClubs(filters?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: clubKeys.list(JSON.stringify(filters)),
    queryFn: () => getClubsWithMemberCounts(),
  });
}

export function useClub(id: string) {
  return useQuery({
    queryKey: clubKeys.detail(id),
    queryFn: () => getClubById(id),
    enabled: !!id,
  });
}

export function useClubMembers(clubId: string) {
  return useQuery({
    queryKey: clubKeys.members(clubId),
    queryFn: () => getClubMembers(clubId),
    enabled: !!clubId,
  });
}

export function useCreateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubKeys.lists() });
    },
  });
}

export function useUpdateClub(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateClubDto) => updateClub(clubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clubKeys.detail(clubId) });
    },
  });
}

export function useDeleteClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clubId: string) => deleteClub(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubKeys.lists() });
    },
  });
}
```

### Phase 5: Update Clubs Page Component

**File:** `frontend-nextjs/app/superadmin/clubs/page.tsx`

Key changes:

1. **Remove Mock Data:**
   ```typescript
   // DELETE: const mockClubs = [...]
   ```

2. **Add React Query:**
   ```typescript
   const { data: clubs = [], isLoading, error } = useClubs();
   const deleteClubMutation = useDeleteClub();
   ```

3. **Update Table Headers:**
   ```tsx
   <TableHead className="text-foreground">Club</TableHead>
   <TableHead className="text-foreground">President</TableHead>
   <TableHead className="text-foreground">Vice President</TableHead>
   <TableHead className="text-foreground">Adviser</TableHead>
   <TableHead className="text-foreground">Members</TableHead>
   <TableHead className="text-foreground">Status</TableHead>
   <TableHead className="w-12"></TableHead>
   ```

4. **Update Table Rows:**
   ```tsx
   <TableCell>
     <div className="flex items-center gap-3">
       <Avatar className="h-10 w-10">
         <AvatarFallback>{club.name.substring(0, 2).toUpperCase()}</AvatarFallback>
       </Avatar>
       <div className="max-w-md">
         <div className="font-medium text-foreground">{club.name}</div>
         <div className="text-sm text-muted-foreground line-clamp-1">
           {club.description}
         </div>
         <Badge variant="outline" className="mt-1 text-xs">
           {club.domain}
         </Badge>
       </div>
     </div>
   </TableCell>
   <TableCell className="text-foreground">{club.president}</TableCell>
   <TableCell className="text-foreground">{club.vicePresident}</TableCell>
   <TableCell className="text-muted-foreground">{club.adviser}</TableCell>
   <TableCell>
     <button
       className="flex items-center gap-2 hover:text-primary transition-colors"
       onClick={(e) => {
         e.stopPropagation();
         handleViewMembers(club);
       }}
     >
       <Users className="w-4 h-4" />
       <div className="flex flex-col items-start">
         <span className="font-medium text-foreground">{club.membersCount}</span>
         <span className="text-xs text-muted-foreground">
           {club.activeMembers} active
         </span>
       </div>
     </button>
   </TableCell>
   <TableCell>{getStatusBadge(club.status, club)}</TableCell>
   ```

5. **Update Delete Handler:**
   ```typescript
   const confirmDeleteClub = async () => {
     if (deleteConfirmation.club) {
       try {
         await deleteClubMutation.mutateAsync(deleteConfirmation.club.id);

         toast({
           title: "Club Deleted Successfully",
           description: `${deleteConfirmation.club.name} has been archived.`,
           variant: "default",
         });

         setDeleteConfirmation({ isOpen: false, club: null });
       } catch (error) {
         toast({
           title: "Error",
           description: "Failed to delete club. Please try again.",
           variant: "destructive",
         });
       }
     }
   };
   ```

6. **Add Loading/Error States:**
   ```tsx
   {isLoading && (
     <div className="flex justify-center items-center py-12">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
     </div>
   )}

   {error && (
     <div className="text-center py-12 text-destructive">
       Error loading clubs: {error.message}
     </div>
   )}
   ```

### Phase 6: Client-Side Filtering

Since backend doesn't support filtering, implement client-side:

```typescript
const filteredClubs = useMemo(() => {
  return clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.president.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.adviser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || club.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });
}, [clubs, searchTerm, statusFilter]);
```

### Phase 7: Archived Clubs (Future Implementation)

**Note:** Backend doesn't currently support soft deletes or archived clubs.

**Recommendation:** Implement soft delete in backend:
1. Add `deleted_at`, `deleted_by`, `deletion_reason` fields to clubs table
2. Add `is_deleted` boolean field
3. Update DELETE endpoint to soft delete instead of hard delete
4. Add `GET /clubs/archived` endpoint
5. Add `POST /clubs/:id/restore` endpoint

**Frontend stub:**
```typescript
// For now, archived clubs will be empty until backend support is added
const archivedClubs = [];
const showArchived = false; // Disable feature until backend ready
```

---

## Migration Checklist

### Backend Requirements
- [ ] Verify all club endpoints are working
- [ ] Test authentication/authorization on protected endpoints
- [ ] Ensure domain relationships are properly populated
- [ ] Test club-memberships endpoints for member counts

### Frontend Changes
- [x] Remove Category column from table
- [x] Remove Meeting column from table
- [ ] Create clubs adapter file
- [ ] Update API client with membership functions
- [ ] Create React Query hooks file
- [ ] Update page component to use real data
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test CRUD operations
- [ ] Update create/edit forms to match backend schema

### Testing
- [ ] Test clubs listing displays correctly
- [ ] Test search functionality
- [ ] Test status filtering
- [ ] Test pagination
- [ ] Test create club flow
- [ ] Test update club flow
- [ ] Test delete club flow
- [ ] Test view members modal
- [ ] Test error states (network errors, validation errors)
- [ ] Test empty states (no clubs found)

### Future Enhancements
- [ ] Add logo/image upload support (requires backend changes)
- [ ] Add club status field to backend
- [ ] Add recruiting flag to backend
- [ ] Implement soft delete/archive functionality
- [ ] Add meeting schedule fields to backend
- [ ] Add social media links fields to backend
- [ ] Add category/tags system (if different from domain)

---

## API Integration Examples

### Creating a Club
```typescript
const createClubData: CreateClubDto = {
  name: "Science Club",
  description: "Exploring the wonders of science",
  president_id: "uuid-of-president",
  vp_id: "uuid-of-vp",
  secretary_id: "uuid-of-secretary",
  advisor_id: "uuid-of-advisor",
  co_advisor_id: "uuid-of-co-advisor", // optional
  domain_id: "uuid-of-club-domain"
};

const club = await createClub(createClubData);
```

### Updating a Club
```typescript
const updateData: UpdateClubDto = {
  name: "Updated Science Club",
  description: "New description"
};

const updatedClub = await updateClub(clubId, updateData);
```

### Getting Club Members
```typescript
const members = await getClubMembers(clubId);
// Returns array of members with populated student/position data
```

---

## Key Differences: Mock vs Real Data

| Feature | Mock Data | Backend Data | Action Required |
|---------|-----------|--------------|-----------------|
| Category | String field | Part of domain | Use domain.name, remove column |
| Meeting Info | day/time/location | Not stored | Remove column, add to backend later |
| President | String name | UUID + populated object | Use president.full_name |
| Adviser | String name | UUID + populated object | Use advisor.full_name |
| Members Count | Hardcoded number | Calculate from memberships | Fetch memberships, count |
| Status | String enum | Not in schema | Add to backend or use derived status |
| Logo | Placeholder URL | Not in schema | Add to backend later |
| Recruiting | Boolean flag | Not in schema | Add to backend later |
| Social Media | facebook/instagram | Not in schema | Add to backend later |

---

## Error Handling Strategy

### API Errors
- Network errors: Show toast with retry option
- Validation errors: Display field-specific errors in forms
- Authorization errors: Redirect to login or show permission denied
- Not found errors: Show "Club not found" message

### User Feedback
- Loading states: Skeleton loaders or spinners
- Success messages: Toast notifications
- Error messages: Toast notifications with error details
- Confirmation dialogs: For destructive actions (delete)

---

## Performance Considerations

1. **Initial Load:** Fetch all clubs + all memberships in parallel
2. **Caching:** Use React Query cache (5 minutes default)
3. **Pagination:** Client-side pagination (backend doesn't support it yet)
4. **Search/Filter:** Client-side filtering (backend doesn't support it yet)
5. **Optimistic Updates:** Update UI immediately, rollback on error

---

## Security Considerations

1. **Authentication:** All mutations require valid JWT token
2. **Authorization:**
   - Create/Update: Admin or Teacher role
   - Delete: Admin role only
   - View: Public (no auth required)
3. **CSRF Protection:** Handled by Fastify + CORS
4. **Input Validation:** Backend validates with class-validator
5. **SQL Injection:** Prevented by Supabase client

---

## Next Steps

1. **Immediate:**
   - Remove redundant columns from table
   - Create adapter file
   - Update API client
   - Create React Query hooks

2. **Short-term:**
   - Replace mock data with real API calls
   - Implement CRUD operations
   - Add loading/error states
   - Update create/edit forms

3. **Long-term:**
   - Add backend support for club logo/images
   - Add club status field to backend
   - Implement soft delete/archive
   - Add meeting schedule fields
   - Add social media fields
   - Implement server-side pagination/filtering

---

## Questions for Product Owner

1. Should we add a `status` field to the backend clubs table, or derive it from other data?
2. Should we implement soft delete (archive) functionality now or later?
3. Do we need logo/image upload support immediately?
4. Should meeting schedule information be added to the backend?
5. Are social media links (facebook, instagram) required for clubs?
6. Should category be separate from domain, or is domain sufficient?

---

## Conclusion

This integration plan provides a clear path to:
1. ✅ Remove redundant table columns (Category, Meeting)
2. ✅ Replace mock data with real API calls
3. ✅ Align UI with backend data structure
4. ✅ Implement proper error handling and loading states
5. ✅ Set foundation for future enhancements

The plan prioritizes getting the core functionality working with real data first, then iteratively adding features that require backend changes.
