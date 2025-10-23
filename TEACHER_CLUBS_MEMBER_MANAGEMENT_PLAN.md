# Teacher Clubs - Member Management Implementation Plan

## 📋 Overview

Comprehensive plan for implementing advanced member management in the Teacher Clubs detail page with:
- **Search-based member addition** (search all students in database)
- **Position assignment** when adding members
- **Bulk add** functionality (select multiple students)
- **Remove members** from club
- **Change member positions**
- **Smart badges** showing if student is already in THIS club

---

## 🔍 Backend API Analysis

### ✅ Available Endpoints:

1. **GET `/students`**
   - Query params: `search`, `gradeLevel`, `sectionId`, `page`, `limit`
   - Returns: Paginated students with full info
   - Auth: Required (Teacher/Admin)

2. **POST `/club-memberships`**
   - Body: `{ studentId, clubId, positionId, joinedAt?, isActive? }`
   - Creates new membership
   - Auth: Required (Advisor/Co-advisor/President)

3. **PATCH `/club-memberships/:id`**
   - Body: `{ positionId?, isActive? }`
   - Updates membership (change position)
   - Auth: Required

4. **DELETE `/club-memberships/:id`**
   - Removes member from club
   - Auth: Required

5. **`club_positions` table**
   - Stores positions: "Member", "Officer", "Treasurer", etc.
   - Global positions (not club-specific)

### ⚠️ Missing Endpoints (Need to check/create):

- `GET /club-positions` - Get all available positions
  - **SOLUTION**: We'll query directly or add this endpoint

---

## 🎯 Requirements Summary

### Core Features:

1. **Add Member Dialog**
   - Search input with real-time/debounced search
   - Shows: Student Name, Student ID, Grade Level, Section
   - Badge/Tag if student is **already in THIS specific club**
   - Select position dropdown
   - "Add" button per student
   - **Bulk select** - Select multiple students, add all at once

2. **Member List Table**
   - Show all current members
   - Display: Avatar/Icon, Name, Position, Status, Join Date
   - **Change Position** - Dropdown to change member's position
   - **Remove Member** - Button with confirmation dialog
   - Member count in tab title

3. **Business Rules**
   - ✅ Students can be in **multiple clubs** (not exclusive)
   - ✅ Show ALL students in search (even if in other clubs)
   - ✅ Badge/Disable if student is already in **THIS** club
   - ✅ New members auto-approved (status = "active")
   - ✅ Teacher selects position when adding

---

## 📐 Implementation Plan

### Phase 1: Backend Preparation

#### 1.1 Verify/Create Club Positions Endpoint

**Check if exists:**
```bash
GET /club-positions
```

**If not, create controller method:**
```typescript
// clubs.controller.ts or new club-positions.controller.ts
@Get('positions')
@ApiOperation({ summary: 'Get all club positions' })
async getPositions() {
  return this.clubsService.getPositions();
}
```

**Service method:**
```typescript
async getPositions() {
  const { data, error } = await supabase
    .from('club_positions')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) throw new InternalServerErrorException();
  return data;
}
```

---

### Phase 2: Frontend API Layer

#### 2.1 Update Students Endpoint (`lib/api/endpoints/students.ts`)

Add comprehensive student search function:

```typescript
export interface Student {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  student_id: string;
  lrn_id: string;
  grade_level?: string;
  section_id?: string;
  // Relations
  sections?: {
    id: string;
    name: string;
    grade_level?: string;
  };
}

export interface SearchStudentsParams {
  search?: string;
  gradeLevel?: string;
  sectionId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedStudentsResponse {
  data: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Search all students with filters
 */
export async function searchStudents(
  params: SearchStudentsParams = {}
): Promise<PaginatedStudentsResponse> {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.append('search', params.search);
  if (params.gradeLevel) queryParams.append('gradeLevel', params.gradeLevel);
  if (params.sectionId) queryParams.append('sectionId', params.sectionId);
  queryParams.append('page', String(params.page || 1));
  queryParams.append('limit', String(params.limit || 20));

  return apiClient.get<PaginatedStudentsResponse>(
    `/students?${queryParams.toString()}`,
    { requiresAuth: true }
  );
}
```

#### 2.2 Create Club Positions Endpoint (`lib/api/endpoints/clubs.ts`)

Add to existing `clubs.ts`:

```typescript
export interface ClubPosition {
  id: string;
  name: string;
}

/**
 * Get all available club positions
 */
export async function getClubPositions(): Promise<ClubPosition[]> {
  return apiClient.get<ClubPosition[]>('/clubs/positions', {
    requiresAuth: true,
  });
}
```

#### 2.3 Create Club Memberships Mutations (`lib/api/endpoints/clubs.ts`)

Add to existing `clubs.ts`:

```typescript
export interface CreateClubMembershipDto {
  studentId: string;
  clubId: string;
  positionId: string;
  joinedAt?: string;
  isActive?: boolean;
}

export interface UpdateClubMembershipDto {
  positionId?: string;
  isActive?: boolean;
}

/**
 * Add member to club
 */
export async function addClubMember(
  data: CreateClubMembershipDto
): Promise<ClubMembership> {
  return apiClient.post<ClubMembership>('/club-memberships', data, {
    requiresAuth: true,
  });
}

/**
 * Add multiple members to club (bulk add)
 */
export async function addClubMembersBulk(
  members: CreateClubMembershipDto[]
): Promise<ClubMembership[]> {
  // Call API for each member
  const promises = members.map((member) => addClubMember(member));
  return Promise.all(promises);
}

/**
 * Update club membership (change position)
 */
export async function updateClubMembership(
  membershipId: string,
  data: UpdateClubMembershipDto
): Promise<ClubMembership> {
  return apiClient.patch<ClubMembership>(
    `/club-memberships/${membershipId}`,
    data,
    { requiresAuth: true }
  );
}

/**
 * Remove member from club
 */
export async function removeClubMember(membershipId: string): Promise<void> {
  return apiClient.delete(`/club-memberships/${membershipId}`, {
    requiresAuth: true,
  });
}
```

---

### Phase 3: Custom Hooks

#### 3.1 Create useStudentSearch Hook (`hooks/useStudentSearch.ts`)

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { searchStudents, type SearchStudentsParams } from '@/lib/api/endpoints/students';
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

export function useStudentSearch(initialParams: SearchStudentsParams = {}) {
  const [params, setParams] = useState<SearchStudentsParams>({
    page: 1,
    limit: 20,
    ...initialParams,
  });

  const query = useQuery({
    queryKey: ['students-search', params],
    queryFn: () => searchStudents(params),
    enabled: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Debounced search update
  const updateSearch = useCallback(
    debounce((search: string) => {
      setParams((prev) => ({ ...prev, search, page: 1 }));
    }, 300),
    []
  );

  const updateFilters = (updates: Partial<SearchStudentsParams>) => {
    setParams((prev) => ({ ...prev, ...updates, page: 1 }));
  };

  const setPage = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  return {
    ...query,
    params,
    updateSearch,
    updateFilters,
    setPage,
  };
}
```

#### 3.2 Create useClubPositions Hook (`hooks/useClubPositions.ts`)

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { getClubPositions } from '@/lib/api/endpoints/clubs';

export function useClubPositions() {
  return useQuery({
    queryKey: ['club-positions'],
    queryFn: getClubPositions,
    staleTime: 10 * 60 * 1000, // 10 minutes (rarely changes)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
```

#### 3.3 Create useClubMembershipMutations Hook (`hooks/useClubMembershipMutations.ts`)

```typescript
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addClubMember,
  addClubMembersBulk,
  updateClubMembership,
  removeClubMember,
  type CreateClubMembershipDto,
  type UpdateClubMembershipDto,
} from '@/lib/api/endpoints/clubs';
import { useToast } from '@/hooks/use-toast';

export function useClubMembershipMutations(clubId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Add single member
  const addMember = useMutation({
    mutationFn: (data: CreateClubMembershipDto) => addClubMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-memberships', clubId] });
      toast({
        title: 'Success',
        description: 'Member added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to add member',
        variant: 'destructive',
      });
    },
  });

  // Add multiple members (bulk)
  const addMembersBulk = useMutation({
    mutationFn: (members: CreateClubMembershipDto[]) => addClubMembersBulk(members),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['club-memberships', clubId] });
      toast({
        title: 'Success',
        description: `${data.length} members added successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to add members',
        variant: 'destructive',
      });
    },
  });

  // Update member (change position)
  const updateMember = useMutation({
    mutationFn: ({
      membershipId,
      data,
    }: {
      membershipId: string;
      data: UpdateClubMembershipDto;
    }) => updateClubMembership(membershipId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-memberships', clubId] });
      toast({
        title: 'Success',
        description: 'Member updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update member',
        variant: 'destructive',
      });
    },
  });

  // Remove member
  const removeMember = useMutation({
    mutationFn: (membershipId: string) => removeClubMember(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-memberships', clubId] });
      toast({
        title: 'Success',
        description: 'Member removed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to remove member',
        variant: 'destructive',
      });
    },
  });

  return {
    addMember,
    addMembersBulk,
    updateMember,
    removeMember,
  };
}
```

#### 3.4 Update hooks/index.ts

```typescript
export { useStudentSearch } from './useStudentSearch';
export { useClubPositions } from './useClubPositions';
export { useClubMembershipMutations } from './useClubMembershipMutations';
```

---

### Phase 4: UI Components

#### 4.1 Create AddMemberDialog Component

**File**: `components/teacher/clubs/AddMemberDialog.tsx`

Features:
- Search input with debounced search
- Filter by grade level
- Student results list with:
  - Avatar/Icon
  - Name (first + last)
  - Student ID
  - Grade Level + Section
  - Position dropdown
  - "Already Member" badge if in THIS club
  - Checkbox for bulk selection
- "Add Selected" button for bulk add
- Pagination controls
- Loading states
- Empty states

```typescript
'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Loader2, Users, UserPlus } from 'lucide-react';
import { useStudentSearch } from '@/hooks/useStudentSearch';
import { useClubPositions } from '@/hooks/useClubPositions';
import { useClubMembershipMutations } from '@/hooks/useClubMembershipMutations';
import type { ClubMembership } from '@/lib/api/types/clubs';

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId: string;
  currentMembers: ClubMembership[];
}

export function AddMemberDialog({
  open,
  onOpenChange,
  clubId,
  currentMembers,
}: AddMemberDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [studentPositions, setStudentPositions] = useState<Record<string, string>>({});

  const { data: students, isLoading: loadingStudents, updateSearch } = useStudentSearch();
  const { data: positions = [], isLoading: loadingPositions } = useClubPositions();
  const { addMember, addMembersBulk } = useClubMembershipMutations(clubId);

  // Get default "Member" position
  const defaultPosition = useMemo(
    () => positions.find((p) => p.name.toLowerCase() === 'member'),
    [positions]
  );

  // Check if student is already in THIS club
  const isAlreadyMember = (studentId: string) => {
    return currentMembers.some((m) => m.student_id === studentId);
  };

  // Handle search input
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    updateSearch(value);
  };

  // Handle position change for a student
  const handlePositionChange = (studentId: string, positionId: string) => {
    setStudentPositions((prev) => ({ ...prev, [studentId]: positionId }));
  };

  // Handle single add
  const handleAddSingle = async (studentId: string) => {
    const positionId = studentPositions[studentId] || defaultPosition?.id;
    if (!positionId) return;

    await addMember.mutateAsync({
      studentId,
      clubId,
      positionId,
      isActive: true,
    });

    // Clear selection
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      next.delete(studentId);
      return next;
    });
  };

  // Handle bulk add
  const handleAddBulk = async () => {
    const membersToAdd = Array.from(selectedStudents).map((studentId) => ({
      studentId,
      clubId,
      positionId: studentPositions[studentId] || defaultPosition?.id!,
      isActive: true,
    }));

    await addMembersBulk.mutateAsync(membersToAdd);

    // Clear selections
    setSelectedStudents(new Set());
    setStudentPositions({});
  };

  // Toggle student selection
  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });

    // Set default position if not set
    if (!studentPositions[studentId] && defaultPosition) {
      handlePositionChange(studentId, defaultPosition.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Members to Club</DialogTitle>
          <DialogDescription>
            Search for students and add them to your club
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search students by name or student ID..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selected Count */}
        {selectedStudents.size > 0 && (
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {selectedStudents.size} student{selectedStudents.size !== 1 ? 's' : ''} selected
            </span>
            <Button size="sm" onClick={handleAddBulk} disabled={addMembersBulk.isPending}>
              {addMembersBulk.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Selected
                </>
              )}
            </Button>
          </div>
        )}

        {/* Student List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {loadingStudents ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : students?.data.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No students found</p>
            </div>
          ) : (
            students?.data.map((student) => {
              const alreadyMember = isAlreadyMember(student.id);
              const isSelected = selectedStudents.has(student.id);

              return (
                <div
                  key={student.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                    alreadyMember
                      ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/30 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Checkbox */}
                  {!alreadyMember && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                  )}

                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {student.first_name} {student.last_name}
                      </p>
                      {alreadyMember && (
                        <Badge variant="secondary" className="text-xs">
                          Already Member
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {student.student_id} • {student.grade_level || 'N/A'} • {student.sections?.name || 'No Section'}
                    </p>
                  </div>

                  {/* Position Selector */}
                  {!alreadyMember && (
                    <Select
                      value={studentPositions[student.id] || defaultPosition?.id}
                      onValueChange={(value) => handlePositionChange(student.id, value)}
                      disabled={loadingPositions}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((position) => (
                          <SelectItem key={position.id} value={position.id}>
                            {position.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Add Button */}
                  {!alreadyMember && !isSelected && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddSingle(student.id)}
                      disabled={addMember.isPending || !studentPositions[student.id]}
                    >
                      {addMember.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Add'
                      )}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination (if needed) */}
        {students && students.pagination.totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-sm text-gray-500">
              Page {students.pagination.page} of {students.pagination.totalPages}
            </span>
            {/* Add pagination controls here */}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

#### 4.2 Update Club Detail Page - Members Tab

**File**: `app/teacher/clubs/[clubId]/page.tsx`

Update the Members tab to include:
- "Add Member" button → Opens AddMemberDialog
- Enhanced member list with:
  - Change position dropdown
  - Remove button
  - Confirmation dialog for removal

```typescript
// In the Members TabsContent:

<TabsContent value="members" className="mt-6">
  <Card className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg dark:text-gray-100">
          Club Members ({memberships.length})
        </CardTitle>
        <Button
          onClick={() => setShowAddMemberDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      {/* Enhanced Member List */}
      {isLoadingMembers ? (
        <Loader2 />
      ) : memberships.length === 0 ? (
        <EmptyState />
      ) : (
        <MemberList
          memberships={memberships}
          clubId={clubId}
          positions={positions}
          onRemove={handleRemove}
          onChangePosition={handleChangePosition}
        />
      )}
    </CardContent>
  </Card>

  {/* Add Member Dialog */}
  <AddMemberDialog
    open={showAddMemberDialog}
    onOpenChange={setShowAddMemberDialog}
    clubId={clubId}
    currentMembers={memberships}
  />
</TabsContent>
```

---

### Phase 5: Testing & Validation

#### Test Scenarios:

1. **Search Functionality**
   - ✅ Search by student name
   - ✅ Search by student ID
   - ✅ Real-time/debounced search works
   - ✅ Filter by grade level
   - ✅ Pagination works

2. **Add Member**
   - ✅ Single add works
   - ✅ Bulk add works
   - ✅ Position selection works
   - ✅ "Already Member" badge shows correctly
   - ✅ Success toast displays
   - ✅ Member list refreshes

3. **Remove Member**
   - ✅ Confirmation dialog shows
   - ✅ Remove works
   - ✅ Success toast displays
   - ✅ Member list refreshes

4. **Change Position**
   - ✅ Dropdown shows all positions
   - ✅ Update works
   - ✅ Success toast displays
   - ✅ UI updates immediately

5. **Edge Cases**
   - ✅ No positions available
   - ✅ No students found
   - ✅ API errors handled
   - ✅ Loading states
   - ✅ Network errors

---

## 📁 File Structure

```
frontend-nextjs/
├── app/
│   └── teacher/
│       └── clubs/
│           └── [clubId]/
│               └── page.tsx                    # ← UPDATE (add member management)
├── components/
│   └── teacher/
│       └── clubs/
│           ├── AddMemberDialog.tsx             # ← CREATE
│           ├── MemberList.tsx                  # ← CREATE
│           └── RemoveMemberConfirmation.tsx    # ← CREATE
├── hooks/
│   ├── index.ts                                # ← UPDATE
│   ├── useStudentSearch.ts                     # ← CREATE
│   ├── useClubPositions.ts                     # ← CREATE
│   └── useClubMembershipMutations.ts           # ← CREATE
├── lib/
│   └── api/
│       └── endpoints/
│           ├── students.ts                     # ← UPDATE
│           └── clubs.ts                        # ← UPDATE
└── backend/
    └── clubs/
        ├── clubs.controller.ts                 # ← UPDATE (add positions endpoint)
        └── clubs.service.ts                    # ← UPDATE
```

---

## 🚀 Implementation Checklist

### Backend:
- [ ] Verify `GET /students` with search works
- [ ] Verify `club_positions` table has data
- [ ] Create `GET /clubs/positions` endpoint (if missing)
- [ ] Test club-memberships CRUD endpoints

### Frontend - API Layer:
- [ ] Update `students.ts` - add `searchStudents()`
- [ ] Update `clubs.ts` - add positions & membership mutations
- [ ] Test API calls

### Frontend - Hooks:
- [ ] Create `useStudentSearch` hook
- [ ] Create `useClubPositions` hook
- [ ] Create `useClubMembershipMutations` hook
- [ ] Update `hooks/index.ts`

### Frontend - Components:
- [ ] Create `AddMemberDialog` component
- [ ] Create `MemberList` component
- [ ] Create `RemoveMemberConfirmation` dialog
- [ ] Update club detail page

### Testing:
- [ ] Test search functionality
- [ ] Test add single member
- [ ] Test bulk add
- [ ] Test remove member
- [ ] Test change position
- [ ] Test error handling
- [ ] Test loading states

---

## 💡 Best Practices

1. **Debounce Search**: Use 300ms debounce for search input
2. **Optimistic Updates**: Consider optimistic UI updates for better UX
3. **Loading States**: Show skeleton loaders while fetching
4. **Error Handling**: User-friendly error messages with retry options
5. **Accessibility**: Keyboard navigation, ARIA labels, focus management
6. **Mobile Responsive**: Test on mobile devices
7. **Bulk Operations**: Confirm before bulk add (show preview)

---

## 🔮 Future Enhancements

1. **Advanced Filters**: Filter by section, enrollment year
2. **Export Members**: Export member list to CSV
3. **Member History**: Track when members joined/left
4. **Attendance Tracking**: Mark attendance for meetings
5. **Role Permissions**: Different permissions based on position
6. **Student Invitations**: Send invites to students

---

**Status**: Ready for Implementation
**Estimated Time**: 8-12 hours
**Priority**: High
