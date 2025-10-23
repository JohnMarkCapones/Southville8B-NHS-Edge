# Teacher Student Materials - API Integration Plan

## Executive Summary

This document outlines the professional plan to integrate the Teacher Student Materials UI (`/teacher/student-materials`) with the existing Modules API endpoints in the core-api-layer.

**Current Status:**
- ✅ UI is fully implemented (1,713 lines) with upload, edit, share, and management features
- ✅ Backend Modules API exists with comprehensive CRUD operations
- ❌ UI currently uses hardcoded mock data (no API integration)
- ⚠️ GET `/api/v1/modules/admin` endpoint is **locked to ADMIN role only**

**Goal:**
1. Modify the `/admin` endpoint to also allow TEACHER role
2. Create frontend API client functions
3. Integrate API calls into the Student Materials UI
4. Replace mock data with real database data

---

## Phase 1: Backend API Modification

### Task 1.1: Update /admin Endpoint Role Restrictions

**File:** `core-api-layer/southville-nhs-school-portal-api-layer/src/modules/modules.controller.ts`

**Current Code (Line 451):**
```typescript
@Get('admin')
@Roles(UserRole.ADMIN)  // ❌ Only ADMIN
@ApiOperation({
  summary: 'Get all modules (Admin only)',
  description: 'Get all modules with full access for administrators.',
})
```

**Updated Code:**
```typescript
@Get('admin')
@Roles(UserRole.ADMIN, UserRole.TEACHER)  // ✅ Allow both ADMIN and TEACHER
@ApiOperation({
  summary: 'Get all modules (Admin & Teacher)',
  description: 'Get all modules with full access for administrators and teachers.',
})
```

**Why This Change:**
- Teachers need unrestricted access to view ALL modules in the system (not just their own)
- This allows teachers to:
  - See what other teachers have uploaded (for collaboration)
  - View global modules for all subjects
  - Access comprehensive module management features
- The existing `/api/v1/modules` GET endpoint already has role-based filtering:
  - Students: Only see modules assigned to their sections
  - Teachers: See their own modules + global modules
  - Admins: See ALL modules

**Testing:**
```bash
# Test as Teacher
curl -X GET "http://localhost:3000/api/v1/modules/admin?page=1&limit=20" \
  -H "Authorization: Bearer <TEACHER_JWT_TOKEN>"

# Should return 200 OK instead of 403 Forbidden
```

---

## Phase 2: Frontend API Client Implementation

### Task 2.1: Create Modules API Client

**File:** `frontend-nextjs/lib/api/endpoints/modules.ts` (NEW FILE)

```typescript
import { apiClient } from '../client';

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface Module {
  id: string;
  title: string;
  description?: string;
  file_url?: string;
  uploaded_by?: string;
  r2_file_key?: string;
  file_size_bytes?: number;
  mime_type?: string;
  is_global: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
  subject_id?: string;
  created_at: string;
  updated_at: string;

  // Populated relations
  uploader?: {
    id: string;
    full_name: string;
    email: string;
  };
  subject?: {
    id: string;
    subject_name: string;
    description?: string;
  };
  sections?: Array<{
    id: string;
    name: string;
    grade_level?: string;
  }>;
  downloadStats?: {
    totalDownloads: number;
    uniqueUsers: number;
    successRate: number;
    lastDownloaded?: string;
  };
}

export interface ModuleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  subjectId?: string;
  sectionId?: string;
  isGlobal?: boolean;
  uploadedBy?: string;
  includeDeleted?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ModuleListResponse {
  modules: Module[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateModuleDto {
  title: string;
  description?: string;
  isGlobal?: boolean;
  subjectId?: string;
  sectionIds?: string[];
}

export interface UpdateModuleDto {
  title?: string;
  description?: string;
  isGlobal?: boolean;
  subjectId?: string;
  sectionIds?: string[];
  replaceFile?: boolean;
}

// ========================================
// API FUNCTIONS
// ========================================

/**
 * Get all modules (Admin & Teacher access)
 */
export async function getAllModules(
  params?: ModuleQueryParams
): Promise<ModuleListResponse> {
  const { data } = await apiClient.get<ModuleListResponse>(
    '/modules/admin',
    { params }
  );
  return data;
}

/**
 * Get accessible modules (role-based filtering)
 */
export async function getModules(
  params?: ModuleQueryParams
): Promise<ModuleListResponse> {
  const { data } = await apiClient.get<ModuleListResponse>(
    '/modules',
    { params }
  );
  return data;
}

/**
 * Get single module by ID
 */
export async function getModuleById(id: string): Promise<Module> {
  const { data } = await apiClient.get<Module>(`/modules/${id}`);
  return data;
}

/**
 * Create new module with file upload
 */
export async function createModule(
  moduleData: CreateModuleDto,
  file: File
): Promise<Module> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', moduleData.title);

  if (moduleData.description) {
    formData.append('description', moduleData.description);
  }
  if (moduleData.isGlobal !== undefined) {
    formData.append('isGlobal', String(moduleData.isGlobal));
  }
  if (moduleData.subjectId) {
    formData.append('subjectId', moduleData.subjectId);
  }
  if (moduleData.sectionIds && moduleData.sectionIds.length > 0) {
    formData.append('sectionIds', JSON.stringify(moduleData.sectionIds));
  }

  const { data } = await apiClient.post<Module>('/modules', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/**
 * Update module metadata
 */
export async function updateModule(
  id: string,
  moduleData: UpdateModuleDto
): Promise<Module> {
  const { data } = await apiClient.put<Module>(`/modules/${id}`, moduleData);
  return data;
}

/**
 * Upload/replace file for existing module
 */
export async function uploadModuleFile(
  id: string,
  file: File
): Promise<Module> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<Module>(
    `/modules/${id}/upload`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return data;
}

/**
 * Soft delete module
 */
export async function deleteModule(id: string): Promise<void> {
  await apiClient.delete(`/modules/${id}`);
}

/**
 * Generate presigned download URL
 */
export async function getModuleDownloadUrl(id: string): Promise<{ url: string }> {
  const { data } = await apiClient.post<{ url: string }>(
    `/modules/${id}/download`
  );
  return data;
}

/**
 * Assign module to sections
 */
export async function assignModuleToSections(
  id: string,
  sectionIds: string[],
  visible: boolean = true
): Promise<void> {
  await apiClient.post(`/modules/${id}/assign`, {
    sectionIds,
    visible,
  });
}

/**
 * Update module visibility for specific section
 */
export async function updateModuleSectionVisibility(
  moduleId: string,
  sectionId: string,
  visible: boolean
): Promise<void> {
  await apiClient.put(`/modules/${moduleId}/sections/${sectionId}`, {
    visible,
  });
}
```

---

## Phase 3: Frontend Hook Implementation

### Task 3.1: Create useModules Hook

**File:** `frontend-nextjs/hooks/useModules.ts` (NEW FILE)

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  uploadModuleFile,
  assignModuleToSections,
  type Module,
  type ModuleQueryParams,
  type CreateModuleDto,
  type UpdateModuleDto,
} from '@/lib/api/endpoints/modules';

export interface UseModulesOptions {
  enabled?: boolean;
  initialParams?: ModuleQueryParams;
  refetchInterval?: number;
}

export interface UseModulesReturn {
  modules: Module[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  loading: boolean;
  error: Error | null;

  // Filters & Pagination
  params: ModuleQueryParams;
  setParams: (params: Partial<ModuleQueryParams>) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;

  // CRUD Operations
  refetch: () => Promise<void>;
  createModule: (data: CreateModuleDto, file: File) => Promise<Module>;
  updateModule: (id: string, data: UpdateModuleDto) => Promise<Module>;
  deleteModule: (id: string) => Promise<void>;
  uploadFile: (id: string, file: File) => Promise<Module>;
  assignToSections: (id: string, sectionIds: string[]) => Promise<void>;
}

export function useModules(options: UseModulesOptions = {}): UseModulesReturn {
  const {
    enabled = true,
    initialParams = {},
    refetchInterval,
  } = options;

  const [modules, setModules] = useState<Module[]>([]);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParamsState] = useState<ModuleQueryParams>({
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'desc',
    ...initialParams,
  });

  const fetchModules = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      console.log('[useModules] Fetching modules with params:', params);
      const response = await getAllModules(params);

      setModules(response.modules);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      });

      console.log('[useModules] Fetched', response.modules.length, 'modules');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch modules');
      console.error('[useModules] Error:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [enabled, params]);

  const setParams = useCallback((newParams: Partial<ModuleQueryParams>) => {
    setParamsState((prev) => ({
      ...prev,
      ...newParams,
      page: 1, // Reset to page 1 when filters change
    }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setParams({ search });
  }, [setParams]);

  const setPage = useCallback((page: number) => {
    setParamsState((prev) => ({ ...prev, page }));
  }, []);

  const handleCreateModule = useCallback(
    async (data: CreateModuleDto, file: File): Promise<Module> => {
      const newModule = await createModule(data, file);
      await fetchModules(); // Refetch to update list
      return newModule;
    },
    [fetchModules]
  );

  const handleUpdateModule = useCallback(
    async (id: string, data: UpdateModuleDto): Promise<Module> => {
      const updatedModule = await updateModule(id, data);
      await fetchModules(); // Refetch to update list
      return updatedModule;
    },
    [fetchModules]
  );

  const handleDeleteModule = useCallback(
    async (id: string): Promise<void> => {
      await deleteModule(id);
      await fetchModules(); // Refetch to update list
    },
    [fetchModules]
  );

  const handleUploadFile = useCallback(
    async (id: string, file: File): Promise<Module> => {
      const updatedModule = await uploadModuleFile(id, file);
      await fetchModules(); // Refetch to update list
      return updatedModule;
    },
    [fetchModules]
  );

  const handleAssignToSections = useCallback(
    async (id: string, sectionIds: string[]): Promise<void> => {
      await assignModuleToSections(id, sectionIds);
      await fetchModules(); // Refetch to update list
    },
    [fetchModules]
  );

  // Initial fetch
  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // Auto-refetch interval
  useEffect(() => {
    if (!enabled || !refetchInterval) return;

    const intervalId = setInterval(() => {
      console.log('[useModules] Auto-refreshing...');
      fetchModules();
    }, refetchInterval);

    return () => clearInterval(intervalId);
  }, [enabled, refetchInterval, fetchModules]);

  return {
    modules,
    pagination,
    loading,
    error,
    params,
    setParams,
    setSearch,
    setPage,
    refetch: fetchModules,
    createModule: handleCreateModule,
    updateModule: handleUpdateModule,
    deleteModule: handleDeleteModule,
    uploadFile: handleUploadFile,
    assignToSections: handleAssignToSections,
  };
}
```

---

## Phase 4: UI Integration

### Task 4.1: Update Student Materials Page

**File:** `frontend-nextjs/app/teacher/student-materials/page.tsx`

**Changes Required:**

#### A. Replace Mock Data with Hook

**Current (Lines 100-250):**
```typescript
const mockMaterials: StudentMaterial[] = [
  // ... hardcoded data
];
```

**Updated:**
```typescript
import { useModules } from '@/hooks/useModules';

// Inside component:
const {
  modules: apiModules,
  pagination,
  loading: modulesLoading,
  error: modulesError,
  params,
  setParams,
  setSearch: setApiSearch,
  setPage: setApiPage,
  createModule: createModuleApi,
  deleteModule: deleteModuleApi,
  refetch,
} = useModules({
  enabled: true,
  initialParams: {
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'desc',
  },
});
```

#### B. Transform API Data to UI Format

```typescript
// Transform API modules to StudentMaterial format
const materials: StudentMaterial[] = useMemo(() => {
  return apiModules.map((module) => ({
    id: module.id,
    title: module.title,
    description: module.description || '',
    fileUrl: module.file_url || '',
    fileName: module.file_url ? module.file_url.split('/').pop() || 'file' : 'file',
    fileType: getFileTypeFromMimeType(module.mime_type),
    fileSize: module.file_size_bytes || 0,
    subject: module.subject?.subject_name || 'Unknown',
    gradeLevel: extractGradeLevel(module.sections),
    topic: module.title, // Can be customized
    status: determineStatus(module),
    publishDate: module.created_at ? new Date(module.created_at) : null,
    expirationDate: null, // Not in API schema yet
    allowDownload: true, // Default
    assignedSections: module.sections?.map(s => s.name) || [],
    views: module.downloadStats?.uniqueUsers || 0,
    downloads: module.downloadStats?.totalDownloads || 0,
    uploadedAt: new Date(module.created_at),
    updatedAt: new Date(module.updated_at),
  }));
}, [apiModules]);

// Helper functions
function getFileTypeFromMimeType(mimeType?: string): StudentMaterial['fileType'] {
  if (!mimeType) return 'other';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'ppt';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'xls';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('video')) return 'video';
  return 'other';
}

function extractGradeLevel(sections?: Array<{ grade_level?: string }>): string {
  if (!sections || sections.length === 0) return 'All Grades';
  return sections[0].grade_level || 'Unknown';
}

function determineStatus(module: Module): StudentMaterial['status'] {
  if (module.is_deleted) return 'expired';
  // Can add more logic based on publish_date, expiration_date when added to schema
  return 'published';
}
```

#### C. Update Upload Handler

**Current:**
```typescript
const handleUpload = () => {
  // Mock upload with setTimeout
  console.log('[v0] Uploading material:', uploadForm);
  // ...
};
```

**Updated:**
```typescript
const handleUpload = async () => {
  if (uploadForm.files.length === 0) {
    setValidationAlert({
      isOpen: true,
      errors: ['Please select at least one file to upload'],
    });
    return;
  }

  try {
    setUploadProgress(0);
    const file = uploadForm.files[0]; // Upload first file

    // Prepare DTO
    const createDto: CreateModuleDto = {
      title: uploadForm.title,
      description: uploadForm.description,
      isGlobal: false, // Always section-specific for teachers
      sectionIds: uploadForm.assignedSections, // Need to map section names to UUIDs
    };

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    // Upload module
    await createModuleApi(createDto, file);

    clearInterval(progressInterval);
    setUploadProgress(100);

    // Success feedback
    toast({
      title: 'Material Uploaded',
      description: `"${uploadForm.title}" has been uploaded successfully.`,
    });

    // Reset and close
    setTimeout(() => {
      setUploadDialogOpen(false);
      setUploadProgress(0);
      resetUploadForm();
    }, 500);
  } catch (error) {
    console.error('[Upload] Error:', error);
    setValidationAlert({
      isOpen: true,
      errors: [error instanceof Error ? error.message : 'Upload failed'],
    });
    setUploadProgress(0);
  }
};
```

#### D. Update Delete Handler

```typescript
const handleDeleteMaterial = async (materialId: string) => {
  try {
    await deleteModuleApi(materialId);

    toast({
      title: 'Material Deleted',
      description: 'The material has been permanently deleted.',
    });

    setDeleteConfirmation({ isOpen: false, material: null });
  } catch (error) {
    console.error('[Delete] Error:', error);
    toast({
      title: 'Delete Failed',
      description: error instanceof Error ? error.message : 'Failed to delete material',
      variant: 'destructive',
    });
  }
};
```

#### E. Update Search/Filter Handlers

```typescript
// Search handler
const handleSearchChange = (value: string) => {
  setSearchQuery(value);
  setApiSearch(value); // Update API params
};

// Filter handlers
const handleSubjectChange = (value: string) => {
  setFilterSubject(value);
  // Need to map subject name to UUID - requires subjects API
  // For now, can filter client-side
};

// Similar for other filters
```

#### F. Update Pagination

```typescript
const totalPages = pagination?.totalPages || 1;
const currentPageNum = pagination?.page || 1;

// Pagination buttons
<Button onClick={() => setApiPage(currentPageNum - 1)} disabled={currentPageNum === 1}>
  Previous
</Button>
<Button onClick={() => setApiPage(currentPageNum + 1)} disabled={currentPageNum === totalPages}>
  Next
</Button>
```

---

## Phase 5: Additional Requirements

### Task 5.1: Section UUID Mapping

**Challenge:** UI uses section names ("Newton", "Einstein"), but API requires section UUIDs.

**Solution:** Create sections lookup hook

**File:** `frontend-nextjs/hooks/useSections.ts`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export interface Section {
  id: string;
  name: string;
  grade_level: string;
}

export function useSections(gradeLevel?: string) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const { data } = await apiClient.get<Section[]>('/sections', {
          params: gradeLevel ? { grade_level: gradeLevel } : {},
        });
        setSections(data);
      } catch (error) {
        console.error('Failed to fetch sections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [gradeLevel]);

  return { sections, loading };
}
```

**Usage in Upload Form:**
```typescript
const { sections: availableSections } = useSections(uploadForm.gradeLevel);

// Map section names to IDs
const sectionIds = uploadForm.assignedSections
  .map(name => availableSections.find(s => s.name === name)?.id)
  .filter(Boolean) as string[];
```

### Task 5.2: Subject UUID Mapping

**File:** `frontend-nextjs/hooks/useSubjects.ts`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export interface Subject {
  id: string;
  subject_name: string;
  description?: string;
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        // Assuming subjects endpoint exists
        const { data } = await apiClient.get<Subject[]>('/subjects');
        setSubjects(data);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  return { subjects, loading };
}
```

---

## Phase 6: Edit Page Integration

### Task 6.1: Update Edit Page

**File:** `frontend-nextjs/app/teacher/student-materials/edit/[id]/page.tsx`

**Changes:**

#### A. Fetch Module by ID

```typescript
import { useEffect, useState } from 'react';
import { getModuleById } from '@/lib/api/endpoints/modules';

export default function EditMaterialPage({ params }: { params: { id: string } }) {
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const data = await getModuleById(params.id);
        setModule(data);

        // Pre-populate form
        setEditForm({
          title: data.title,
          description: data.description || '',
          // ... map other fields
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load module'));
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [params.id]);
}
```

#### B. Update Save Handler

```typescript
const handleSave = async () => {
  try {
    setSaveProgress(0);

    const progressInterval = setInterval(() => {
      setSaveProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    // Update module metadata
    await updateModule(params.id, {
      title: editForm.title,
      description: editForm.description,
      // ... other fields
    });

    // If file was replaced
    if (newFile) {
      await uploadModuleFile(params.id, newFile);
    }

    clearInterval(progressInterval);
    setSaveProgress(100);

    toast({
      title: 'Changes Saved',
      description: 'Module has been updated successfully.',
    });

    setTimeout(() => {
      router.push('/teacher/student-materials');
    }, 500);
  } catch (error) {
    console.error('[Save] Error:', error);
    toast({
      title: 'Save Failed',
      description: error instanceof Error ? error.message : 'Failed to save changes',
      variant: 'destructive',
    });
    setSaveProgress(0);
  }
};
```

---

## Phase 7: Testing Strategy

### Task 7.1: Backend Testing

```bash
# 1. Test endpoint access as Teacher
curl -X GET "http://localhost:3000/api/v1/modules/admin?page=1&limit=10" \
  -H "Authorization: Bearer <TEACHER_JWT>" \
  -H "Content-Type: application/json"

# Expected: 200 OK (not 403)

# 2. Test module creation
curl -X POST "http://localhost:3000/api/v1/modules" \
  -H "Authorization: Bearer <TEACHER_JWT>" \
  -F "title=Test Module" \
  -F "description=Test description" \
  -F "file=@test-file.pdf" \
  -F "isGlobal=false" \
  -F "sectionIds=[\"section-uuid-1\"]"

# Expected: 201 Created

# 3. Test module update
curl -X PUT "http://localhost:3000/api/v1/modules/{id}" \
  -H "Authorization: Bearer <TEACHER_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'

# Expected: 200 OK

# 4. Test module deletion
curl -X DELETE "http://localhost:3000/api/v1/modules/{id}" \
  -H "Authorization: Bearer <TEACHER_JWT>"

# Expected: 200 OK
```

### Task 7.2: Frontend Testing Checklist

- [ ] Modules load from API on page load
- [ ] Search filters modules via API
- [ ] Filters update API query parameters
- [ ] Pagination works with server-side data
- [ ] Upload creates new module in database
- [ ] Upload progress shows correctly
- [ ] Edit page loads module data
- [ ] Save updates module in database
- [ ] Delete removes module (soft delete)
- [ ] Statistics cards show real data
- [ ] Download URLs generate correctly
- [ ] Section assignment works
- [ ] Error handling shows user-friendly messages
- [ ] Loading states display properly

---

## Phase 8: Database Schema Considerations

### Recommended Schema Extensions (Optional)

The current `modules` table may need additional fields to match UI features:

```sql
ALTER TABLE modules
ADD COLUMN publish_date TIMESTAMPTZ,
ADD COLUMN expiration_date TIMESTAMPTZ,
ADD COLUMN allow_download BOOLEAN DEFAULT true,
ADD COLUMN topic VARCHAR(255);
```

**Migration File:** `add_student_materials_fields.sql`

---

## Implementation Timeline

| Phase | Tasks | Estimated Time | Priority |
|-------|-------|---------------|----------|
| 1 | Backend API Modification | 30 minutes | HIGH |
| 2 | Frontend API Client | 1-2 hours | HIGH |
| 3 | Frontend Hook | 1 hour | HIGH |
| 4 | UI Integration - Main Page | 3-4 hours | HIGH |
| 5 | Additional Requirements (Sections/Subjects) | 2 hours | MEDIUM |
| 6 | Edit Page Integration | 2 hours | MEDIUM |
| 7 | Testing & QA | 2-3 hours | HIGH |
| 8 | Schema Extensions (Optional) | 1 hour | LOW |

**Total Estimated Time:** 12-16 hours

---

## Risk Assessment

### High Priority Risks

1. **Section/Subject UUID Mapping**
   - **Risk:** UI uses names, API uses UUIDs
   - **Mitigation:** Create lookup hooks, cache mappings

2. **File Upload Size Limits**
   - **Risk:** Large file uploads may timeout
   - **Mitigation:** Check R2 configuration, add client-side size validation

3. **Role Permissions**
   - **Risk:** Teachers might see other teachers' private materials
   - **Mitigation:** Verify RLS policies in Supabase

### Medium Priority Risks

4. **Download URL Expiration**
   - **Risk:** Presigned URLs expire after 1 hour
   - **Mitigation:** Regenerate URLs on download click

5. **Bulk Operations**
   - **Risk:** No bulk delete endpoint
   - **Mitigation:** Loop through deleteModule() or create new endpoint

---

## Success Criteria

✅ **Phase 1:** Teachers can access `/api/v1/modules/admin` endpoint (200 OK response)
✅ **Phase 2-4:** UI displays real modules from database instead of mock data
✅ **Phase 5:** Upload creates new module in database with file stored in R2
✅ **Phase 6:** Edit page updates existing module
✅ **Phase 7:** All CRUD operations work end-to-end
✅ **Phase 8:** No console errors, proper error handling

---

## Rollback Plan

If integration fails:
1. Revert backend endpoint change (remove TEACHER from @Roles)
2. Keep UI using mock data
3. Debug issues in development environment
4. Re-deploy when stable

---

## Post-Implementation

### Monitoring

- Track module upload success rate
- Monitor R2 storage usage
- Log download statistics
- Track API error rates

### Future Enhancements

1. Bulk operations (bulk delete, bulk assign)
2. File preview in browser
3. Module versioning (track file replacements)
4. Advanced analytics dashboard
5. Module sharing between teachers
6. Student-facing view/download page

---

## Appendix

### A. Key Endpoints Summary

| Endpoint | Method | Role | Purpose |
|----------|--------|------|---------|
| `/modules/admin` | GET | Admin, Teacher | Get all modules |
| `/modules` | GET | All | Get accessible modules |
| `/modules` | POST | Admin, Teacher | Create module |
| `/modules/:id` | GET | All | Get module details |
| `/modules/:id` | PUT | Admin, Teacher | Update module |
| `/modules/:id` | DELETE | Admin, Teacher | Delete module |
| `/modules/:id/upload` | POST | Admin, Teacher | Upload/replace file |
| `/modules/:id/download` | POST | All | Get download URL |
| `/modules/:id/assign` | POST | Admin, Teacher | Assign to sections |

### B. File Structure

```
frontend-nextjs/
├── app/teacher/student-materials/
│   ├── page.tsx (Main list page - UPDATE)
│   ├── edit/[id]/page.tsx (Edit page - UPDATE)
│   └── loading.tsx
├── lib/api/endpoints/
│   └── modules.ts (NEW - API client)
├── hooks/
│   ├── useModules.ts (NEW - Main hook)
│   ├── useSections.ts (NEW - Sections lookup)
│   └── useSubjects.ts (NEW - Subjects lookup)
└── types/
    └── modules.ts (Optional - Type definitions)
```

---

**Document Version:** 1.0
**Last Updated:** 2025-01-21
**Author:** AI Assistant (Claude)
**Status:** Ready for Implementation
