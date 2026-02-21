# Teacher Clubs API Integration Plan

## Overview
This document outlines the comprehensive plan to integrate the Teacher Clubs page (`/teacher/clubs`) with the backend API, allowing teachers to view and manage clubs where they serve as advisor or co-advisor.

## Current State Analysis

### Frontend (`frontend-nextjs/app/teacher/clubs/page.tsx`)
- ✅ UI components fully implemented
- ❌ Using mock/hardcoded club data
- ❌ No API integration
- ❌ Create club functionality present (needs to be removed)

### Backend API
**Base URL**: `http://localhost:3004/api/v1`

#### Available Endpoints:
1. **GET `/clubs`** - Get all clubs
   - Returns: `Club[]` with populated advisor/co-advisor data
   - Auth: Not required (public endpoint)
   - Response includes: `advisor`, `co_advisor`, `president`, `vp`, `secretary`, `domain`

2. **GET `/clubs/:clubId`** - Get single club
   - Returns: `Club` with full details
   - Auth: Not required

3. **PATCH `/clubs/:clubId`** - Update club
   - Auth: Required (Teacher/Admin)
   - PBAC Policy: `club.edit` on clubId

4. **DELETE `/clubs/:clubId`** - Delete club
   - Auth: Required (Admin only)

5. **GET `/clubs/:clubId/members`** - Get club members
   - Returns: Member list
   - Auth: Not required

6. **GET `/club-memberships`** - Get all memberships
   - Query param: `clubId` (optional)
   - Auth: Required (Admin/Teacher/Student)

7. **GET `/club-memberships/student/:studentId`** - Get student memberships
   - Auth: Required (Admin/Teacher/Student)

### Data Structure

#### Club Entity
```typescript
interface Club {
  id: string;
  name: string;
  description: string;
  president_id: string;
  vp_id: string;
  secretary_id: string;
  advisor_id: string;        // ← Teacher user ID
  co_advisor_id?: string;    // ← Optional co-advisor user ID
  domain_id: string;
  created_at: string;
  updated_at: string;

  // Populated relations
  advisor?: User;
  co_advisor?: User;
  president?: User;
  vp?: User;
  secretary?: User;
  domain?: Domain;
}
```

#### User Entity
```typescript
interface User {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  status: UserStatus;
  role?: { name: UserRole };
  teacher?: Teacher;
  // ...
}
```

---

## Implementation Plan

### Phase 1: Setup & API Integration (Foundation)

#### 1.1 Create Custom Hooks

**File**: `frontend-nextjs/hooks/useTeacherClubs.ts`

```typescript
/**
 * Custom hook to fetch clubs where the teacher is advisor or co-advisor
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { getClubs } from '@/lib/api/endpoints/clubs';
import { useUser } from './useUser';
import type { Club } from '@/lib/api/types/clubs';

export function useTeacherClubs() {
  const { data: user, isLoading: isLoadingUser } = useUser();

  return useQuery<Club[], Error>({
    queryKey: ['teacher-clubs', user?.id],
    queryFn: async () => {
      // Fetch all clubs
      const allClubs = await getClubs();

      // Filter clubs where user is advisor or co-advisor
      if (!user?.id) return [];

      return allClubs.filter(
        (club) =>
          club.advisor_id === user.id ||
          club.co_advisor_id === user.id
      );
    },
    enabled: !!user?.id && !isLoadingUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

**File**: `frontend-nextjs/hooks/useClubMemberships.ts`

```typescript
/**
 * Hook to fetch club memberships for a specific club
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

interface ClubMembership {
  id: string;
  student_id: string;
  club_id: string;
  position_id: string;
  status: 'active' | 'pending' | 'inactive';
  joined_at: string;
  // Populated relations
  student?: any;
  position?: any;
}

async function getClubMemberships(clubId: string): Promise<ClubMembership[]> {
  return apiClient.get<ClubMembership[]>(
    `/club-memberships?clubId=${clubId}`,
    { requiresAuth: true }
  );
}

export function useClubMemberships(clubId?: string) {
  return useQuery<ClubMembership[], Error>({
    queryKey: ['club-memberships', clubId],
    queryFn: () => getClubMemberships(clubId!),
    enabled: !!clubId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}
```

**File**: `frontend-nextjs/hooks/index.ts` (update exports)
```typescript
// Add these exports
export { useTeacherClubs } from './useTeacherClubs';
export { useClubMemberships } from './useClubMemberships';
```

#### 1.2 Update Club Types (if needed)

**File**: `frontend-nextjs/lib/api/types/clubs.ts`

Ensure the following types exist (they already do, but verify):
- ✅ `Club` interface with advisor_id and co_advisor_id
- ✅ `User` interface for advisor data
- ✅ `Domain` interface
- Add if missing: `ClubMembership` type

---

### Phase 2: Update Teacher Clubs Main Page

**File**: `frontend-nextjs/app/teacher/clubs/page.tsx`

#### 2.1 Remove Create Club Functionality
- ❌ Remove "Create New Club" button
- ❌ Remove create club dialog
- ❌ Remove all create-related state and handlers

#### 2.2 Integrate API Data
Replace mock data with real API calls:

```typescript
'use client';

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/useUser"
import { useTeacherClubs } from "@/hooks/useTeacherClubs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Calendar,
  Search,
  Edit,
  Eye,
  Clock,
  MapPin,
  Filter,
  Trash2,
  BookOpen,
  Loader2,
} from "lucide-react"

export default function TeacherClubsPage() {
  const router = useRouter()
  const { data: user, isLoading: isLoadingUser } = useUser()
  const { data: clubs = [], isLoading, isError, error } = useTeacherClubs()

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Extract unique categories from clubs
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      clubs
        .map(club => club.domain?.name || 'Uncategorized')
    );
    return ['all', ...Array.from(uniqueCategories)];
  }, [clubs]);

  // Filter clubs
  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      const matchesSearch =
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        club.domain?.name === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [clubs, searchTerm, selectedCategory]);

  const handleViewClub = (clubId: string) => {
    router.push(`/teacher/clubs/${clubId}`)
  }

  // Loading state
  if (isLoadingUser || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Error loading clubs: {error?.message || 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            My Clubs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage clubs where you are the advisor or co-advisor
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clubs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 dark:bg-gray-800/50 dark:border-gray-600"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 dark:bg-gray-800/50 dark:border-gray-600">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800">
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClubs.map((club) => (
          <Card
            key={club.id}
            className="hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 group"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {club.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    >
                      {club.domain?.name || 'No Category'}
                    </Badge>
                    {club.co_advisor_id === user?.id && (
                      <Badge variant="secondary" className="text-xs">
                        Co-Advisor
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    onClick={() => handleViewClub(club.id)}
                    title="View Club Dashboard"
                  >
                    <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {club.description || 'No description available'}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium dark:text-gray-200">
                    View Members
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm dark:text-gray-300">
                    {new Date(club.created_at).getFullYear()}
                  </span>
                </div>
              </div>

              <div
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg transition-all duration-200"
                onClick={() => handleViewClub(club.id)}
              >
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  Click to manage this club
                  <Eye className="w-4 h-4 ml-2 transition-transform group-hover:scale-110" />
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredClubs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No clubs found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {clubs.length === 0
              ? "You are not assigned as an advisor to any clubs yet."
              : "Try adjusting your search terms or filters."}
          </p>
        </div>
      )}
    </div>
  )
}
```

---

### Phase 3: Create Club Detail Page

**File**: `frontend-nextjs/app/teacher/clubs/[clubId]/page.tsx` (new file)

This page will show:
1. Club details with edit capability
2. Member list
3. Club forms and applications
4. Club statistics

```typescript
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClubById, updateClub, deleteClub } from '@/lib/api/endpoints/clubs';
import { useClubMemberships } from '@/hooks/useClubMemberships';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  FileText,
  Calendar,
  Settings,
} from 'lucide-react';
import type { Club } from '@/lib/api/types/clubs';

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clubId = params.clubId as string;
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  // Fetch club data
  const {
    data: clubData,
    isLoading,
    isError,
    error,
  } = useQuery<{ data: Club }, Error>({
    queryKey: ['club', clubId],
    queryFn: () => getClubById(clubId),
  });

  const club = clubData?.data;

  // Fetch memberships
  const {
    data: memberships = [],
    isLoading: isLoadingMembers,
  } = useClubMemberships(clubId);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteClub(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-clubs'] });
      router.push('/teacher/clubs');
    },
  });

  const handleEdit = () => {
    router.push(`/teacher/clubs/${clubId}/edit`);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync();
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !club) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Error loading club: {error?.message || 'Club not found'}
          </p>
        </div>
      </div>
    );
  }

  // Check if user is advisor (not just co-advisor) for delete permission
  const isAdvisor = club.advisor_id === user?.id;

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {club.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {club.domain?.name || 'No Category'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {isAdvisor && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Club</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this club? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleteMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Club Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Club Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-1">
              Description
            </h3>
            <p className="text-gray-900 dark:text-gray-100">
              {club.description || 'No description available'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-1">
                Advisor
              </h3>
              <p className="text-gray-900 dark:text-gray-100">
                {club.advisor?.full_name || 'Not assigned'}
              </p>
            </div>

            {club.co_advisor && (
              <div>
                <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Co-Advisor
                </h3>
                <p className="text-gray-900 dark:text-gray-100">
                  {club.co_advisor.full_name}
                </p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-1">
                President
              </h3>
              <p className="text-gray-900 dark:text-gray-100">
                {club.president?.full_name || 'Not assigned'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-1">
                Vice President
              </h3>
              <p className="text-gray-900 dark:text-gray-100">
                {club.vp?.full_name || 'Not assigned'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-1">
                Secretary
              </h3>
              <p className="text-gray-900 dark:text-gray-100">
                {club.secretary?.full_name || 'Not assigned'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Members ({memberships.length})
          </TabsTrigger>
          <TabsTrigger value="forms">
            <FileText className="h-4 w-4 mr-2" />
            Forms
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="h-4 w-4 mr-2" />
            Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Club Members</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMembers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : memberships.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No members yet
                </p>
              ) : (
                <div className="space-y-2">
                  {memberships.map((membership) => (
                    <div
                      key={membership.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">
                            {membership.student?.full_name || 'Unknown Student'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {membership.position?.name || 'Member'}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={membership.status === 'active' ? 'default' : 'secondary'}
                      >
                        {membership.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                Forms management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Club Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                Events management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

### Phase 4: Testing & Validation

#### 4.1 Test Scenarios

1. **Authentication**
   - ✅ Teacher can log in
   - ✅ User data is fetched correctly
   - ✅ Teacher ID is available

2. **Club List Page**
   - ✅ Clubs are fetched from API
   - ✅ Only shows clubs where teacher is advisor/co-advisor
   - ✅ Search works correctly
   - ✅ Category filter works
   - ✅ Empty state displays when no clubs
   - ✅ Loading state displays correctly
   - ✅ Error state displays correctly

3. **Club Detail Page**
   - ✅ Club details load correctly
   - ✅ Members list displays
   - ✅ Edit button navigates to edit page
   - ✅ Delete button works (advisor only)
   - ✅ Back button works

4. **Data Integrity**
   - ✅ Advisor names display correctly
   - ✅ Co-advisor badge shows correctly
   - ✅ Domain/category displays correctly
   - ✅ Member count is accurate

#### 4.2 Error Handling

- ❌ Network errors
- ❌ 401 Unauthorized (redirect to login)
- ❌ 404 Not Found (club doesn't exist)
- ❌ 500 Server Error
- ❌ Empty data scenarios

---

### Phase 5: Future Enhancements (Optional)

1. **Backend Enhancement** - Add dedicated endpoint:
   ```
   GET /clubs/my-advised-clubs
   ```
   - Returns clubs filtered server-side
   - More efficient than client-side filtering
   - Reduces data transfer

2. **Club Edit Page**
   - Create `/teacher/clubs/[clubId]/edit` page
   - Form for editing club details
   - Update mutation

3. **Member Management**
   - Add/remove members
   - Change member positions
   - Approve/reject applications

4. **Forms Management**
   - Create application forms
   - Review form submissions
   - Approve/reject applications

5. **Events Management**
   - Create club events
   - Track attendance
   - Event calendar

6. **Statistics Dashboard**
   - Member growth over time
   - Attendance tracking
   - Activity metrics

---

## File Structure

```
frontend-nextjs/
├── app/
│   └── teacher/
│       └── clubs/
│           ├── page.tsx                    # ← UPDATE (main list page)
│           ├── [clubId]/
│           │   ├── page.tsx                # ← CREATE (detail page)
│           │   └── edit/
│           │       └── page.tsx            # ← CREATE (edit page - future)
│           └── loading.tsx                 # ← CREATE (optional)
├── hooks/
│   ├── index.ts                            # ← UPDATE (add exports)
│   ├── useTeacherClubs.ts                  # ← CREATE
│   └── useClubMemberships.ts               # ← CREATE
├── lib/
│   └── api/
│       ├── endpoints/
│       │   └── clubs.ts                    # ← VERIFY (already exists)
│       └── types/
│           └── clubs.ts                    # ← VERIFY (already exists)
└── components/
    └── teacher/
        └── clubs/                          # ← CREATE (optional components)
            ├── ClubCard.tsx
            ├── ClubEditForm.tsx
            └── MemberList.tsx
```

---

## Implementation Checklist

### Phase 1: Setup
- [ ] Create `useTeacherClubs.ts` hook
- [ ] Create `useClubMemberships.ts` hook
- [ ] Update `hooks/index.ts` exports
- [ ] Verify club types in `lib/api/types/clubs.ts`

### Phase 2: Main Page
- [ ] Remove "Create Club" button and dialog
- [ ] Replace mock data with `useTeacherClubs()`
- [ ] Add loading state
- [ ] Add error handling
- [ ] Update search/filter logic
- [ ] Test with real data

### Phase 3: Detail Page
- [ ] Create `[clubId]/page.tsx`
- [ ] Implement club details display
- [ ] Integrate member list
- [ ] Add edit navigation
- [ ] Add delete functionality (advisor only)
- [ ] Create tabs for different sections

### Phase 4: Testing
- [ ] Test authentication flow
- [ ] Test club filtering logic
- [ ] Test search and filters
- [ ] Test detail page navigation
- [ ] Test error states
- [ ] Test empty states

### Phase 5: Polish
- [ ] Add loading skeletons
- [ ] Optimize re-renders
- [ ] Add toast notifications
- [ ] Improve responsive design
- [ ] Add animations/transitions

---

## API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/clubs` | No | Get all clubs |
| GET | `/clubs/:clubId` | No | Get single club |
| PATCH | `/clubs/:clubId` | Yes (Teacher/Admin) | Update club |
| DELETE | `/clubs/:clubId` | Yes (Admin only) | Delete club |
| GET | `/clubs/:clubId/members` | No | Get club members |
| GET | `/club-memberships?clubId=X` | Yes | Get memberships by club |
| GET | `/club-memberships/student/:id` | Yes | Get student memberships |

---

## Notes

1. **No Create Functionality**: As requested, the create club feature is removed. Club creation should be handled by admins.

2. **Client-Side Filtering**: Currently filtering clubs on the client side. For better performance with many clubs, consider adding a backend endpoint.

3. **Permissions**: Edit is available to teachers who are advisors. Delete is admin-only (based on RBAC).

4. **Co-Advisor Badge**: Shows a badge when teacher is co-advisor (not main advisor).

5. **Future API Enhancement**: Consider adding `GET /clubs/my-advised-clubs` endpoint to the backend for server-side filtering.

---

## Questions to Address

Before implementation, confirm:
1. ✅ Should delete be admin-only or also available to advisors?
2. ✅ Should co-advisors have edit permissions?
3. ✅ What meeting schedule/location data should come from? (Not in current club entity)
4. ✅ Should we show upcoming events on the club card? (Needs integration with events API)
5. ✅ Member count - should we calculate client-side or add to API response?

---

**Last Updated**: 2025-10-21
**Status**: Ready for Implementation
