# Learning Materials Integration Guide

## 📋 Summary of Changes

This document outlines all changes made to the Learning Materials & Modules system, including UI updates, backend modifications, and integration steps.

---

## ✅ Completed Changes

### 1. Frontend UI Modifications (`/superadmin/learning-materials`)

#### Table Structure Changes

**Removed Columns:**
- ❌ Type (Video, Interactive, Simulation, etc.)
- ❌ Difficulty (Beginner, Intermediate, Advanced)
- ❌ Duration (e.g., "45 min")
- ❌ Rating (e.g., 4.8 stars)

**Modified/Added Columns:**
- ✅ Subject Name (previously just "Subject")
- ✅ **Uploaded By** (NEW - displays uploader's full name with UserCog icon)

**Current Table Columns:**
1. Checkbox (selection)
2. Module Title
3. Subject Name
4. **Uploaded By** (NEW)
5. Grade Levels
6. Views
7. Downloads
8. Status (Active, Draft, Archived)
9. Visibility (Public, Restricted)
10. Actions (dropdown menu)

#### Filter Section Updates

**Removed:**
- Type filter dropdown
- Difficulty filter dropdown

**Remaining Filters (3 columns):**
- Subject (all subjects dropdown)
- Status (Active, Draft, Archived)
- Sort by (Newest, Oldest, Title, Views, **Downloads**)

#### Statistics Cards

**Updated:**
- Total Modules (Blue) ✅
- Active Modules (Green) ✅
- Total Downloads (Purple) ✅
- **Total Views** (Orange) ✅ NEW (replaced Average Rating)

#### Search Functionality

- **Enhanced**: Now searches across title, subject, AND author
- **Placeholder**: "Search by title, subject, or author..."

#### Code Changes

**File**: `frontend-nextjs/app/superadmin/learning-materials/page.tsx`

- Added `UserCog` import from `lucide-react`
- Removed `selectedType` and `selectedDifficulty` state
- Updated filter logic to include author search
- Changed sort options to include downloads
- Updated statistics calculation (totalViews instead of averageRating)
- Modified table colspan from 13 to 9
- Changed grid layout from 5 columns to 3 columns

---

### 2. Backend Database Changes

#### New Migration File

**File**: `core-api-layer/southville-nhs-school-portal-api-layer/add_subject_id_to_teacher_folders_migration.sql`

**Changes:**
```sql
-- Add subject_id column to teacher_folders table
ALTER TABLE public.teacher_folders
ADD COLUMN subject_id uuid;

-- Add foreign key constraint
ALTER TABLE public.teacher_folders
ADD CONSTRAINT teacher_folders_subject_id_fkey
FOREIGN KEY (subject_id)
REFERENCES public.subjects(id)
ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_teacher_folders_subject_id
ON public.teacher_folders(subject_id);
```

**Status**: ⚠️ **NOT YET APPLIED** - You need to run this migration on your Supabase database

---

### 3. Backend Entity Updates

#### TeacherFolder Entity

**File**: `core-api-layer/southville-nhs-school-portal-api-layer/src/teacher-files/entities/teacher-folder.entity.ts`

**Added:**
```typescript
@ApiPropertyOptional({
  description: 'Subject ID for folder organization',
  example: '123e4567-e89b-12d3-a456-426614174000',
})
subject_id?: string;
```

**Added to TeacherFolderWithChildren:**
```typescript
subject?: {
  id: string;
  name: string;
};
```

---

### 4. Backend DTO Updates

#### CreateFolderDto

**File**: `core-api-layer/southville-nhs-school-portal-api-layer/src/teacher-files/dto/create-folder.dto.ts`

**Added:**
```typescript
@ApiPropertyOptional({
  description: 'Subject ID for folder organization',
  example: '123e4567-e89b-12d3-a456-426614174000',
})
@IsOptional()
@IsUUID()
subject_id?: string;
```

#### UpdateFolderDto

**File**: `core-api-layer/southville-nhs-school-portal-api-layer/src/teacher-files/dto/update-folder.dto.ts`

**Added:**
```typescript
@ApiPropertyOptional({
  description: 'Subject ID for folder organization',
  example: '123e4567-e89b-12d3-a456-426614174000',
})
@IsOptional()
@IsUUID()
subject_id?: string;
```

---

### 5. Frontend API Types

**File**: `frontend-nextjs/lib/api/endpoints/learning-materials.ts`

**Updated LearningMaterialFolder interface:**
```typescript
export interface LearningMaterialFolder {
  // ... existing fields
  subject_id?: string;  // NEW
  subject?: {           // NEW
    id: string;
    name: string;
  };
}
```

**Updated DTOs:**
```typescript
export interface CreateFolderDto {
  name: string;
  description?: string;
  parent_id?: string;
  subject_id?: string;  // NEW
}

export interface UpdateFolderDto {
  name?: string;
  description?: string;
  subject_id?: string;  // NEW
}
```

---

### 6. Custom Hook

**File**: `frontend-nextjs/hooks/useLearningMaterials.ts`

✅ **Already exists** with comprehensive functionality:
- Folder management (CRUD)
- File management (CRUD)
- Download functionality
- Search and filtering
- Pagination
- Auto-refetch support

---

## 🚀 Next Steps for Integration

### Step 1: Apply Database Migration

**IMPORTANT**: Run the migration SQL file on your Supabase database

```bash
# Option A: Via Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Go to SQL Editor
4. Copy content from: add_subject_id_to_teacher_folders_migration.sql
5. Execute the SQL

# Option B: Via Supabase CLI
supabase db push
```

### Step 2: Update Backend Service to Include Subject

You'll need to update the folder service to fetch subject information when retrieving folders.

**File to modify**: `core-api-layer/southville-nhs-school-portal-api-layer/src/teacher-files/services/folder.service.ts`

Look for the folder query and add subject join:

```typescript
// Example SQL join (adjust based on your service implementation)
.select(`
  *,
  subject:subjects!subject_id (
    id,
    name
  )
`)
```

### Step 3: Replace Mock Data in Learning Materials Page

**File**: `frontend-nextjs/app/superadmin/learning-materials/page.tsx`

#### Current Implementation (Mock Data):
```typescript
const [modules, setModules] = useState(mockModules)
```

#### New Implementation (Real API):
```typescript
import { useLearningMaterials } from '@/hooks/useLearningMaterials';

export default function LearningMaterialsPage() {
  const {
    files,
    folders,
    loading,
    error,
    pagination,
    setPage,
    setLimit,
    setSearchQuery,
    uploadFile,
    updateFile,
    deleteFile,
    downloadFile,
  } = useLearningMaterials({
    initialFileParams: {
      page: 1,
      limit: 10,
    },
  });

  // Map files to modules format
  const modules = files.map(file => ({
    id: file.id,
    title: file.title,
    subject: file.folder?.subject?.name || file.folder?.name || 'N/A',
    author: file.uploader?.full_name || 'Unknown',
    views: 0, // Note: Add views tracking to backend if needed
    downloads: file.download_count || 0,
    status: file.is_deleted ? 'archived' : 'active',
    visibility: 'public', // Note: Add visibility field to backend if needed
    gradeLevels: [], // Note: Add grade levels to backend if needed
    createdDate: file.created_at,
  }));
}
```

### Step 4: Handle File Uploads

Update the upload modal to use real API:

```typescript
const handleUploadSubmit = async () => {
  if (!uploadedFile) return;

  try {
    // Get or create folder (you'll need folder selection UI)
    const folderId = 'some-folder-id'; // Replace with actual folder selection

    await uploadFile(folderId, uploadedFile, {
      title: uploadForm.title,
      description: uploadForm.description,
    });

    setUploadModalOpen(false);
    // Reset form
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Step 5: Add Subject-Folder Mapping

**Option A: Manual Folder Creation**

Create folders for each subject:
```sql
INSERT INTO teacher_folders (name, description, subject_id)
VALUES
  ('Mathematics Materials', 'All mathematics teaching materials', (SELECT id FROM subjects WHERE name = 'Mathematics')),
  ('Science Materials', 'All science teaching materials', (SELECT id FROM subjects WHERE name = 'Science')),
  ('English Materials', 'All English teaching materials', (SELECT id FROM subjects WHERE name = 'English'));
```

**Option B: Update Existing Folders**

Match existing folders to subjects by name:
```sql
UPDATE teacher_folders
SET subject_id = (SELECT id FROM subjects WHERE name = 'Mathematics' LIMIT 1)
WHERE name ILIKE '%math%';

UPDATE teacher_folders
SET subject_id = (SELECT id FROM subjects WHERE name = 'Science' LIMIT 1)
WHERE name ILIKE '%science%';
```

### Step 6: Update Subject Filter

Modify the subject filter to work with real subjects from the database:

```typescript
// Fetch subjects from API
const [subjects, setSubjects] = useState([]);

useEffect(() => {
  // Fetch subjects
  fetch('/api/subjects')
    .then(res => res.json())
    .then(data => setSubjects(data));
}, []);

// In the filter dropdown
<SelectContent>
  <SelectItem value="all">All Subjects</SelectItem>
  {subjects.map(subject => (
    <SelectItem key={subject.id} value={subject.id}>
      {subject.name}
    </SelectItem>
  ))}
</SelectContent>
```

### Step 7: Add Missing Features to Backend (Optional)

#### Views Tracking
Add a `views_count` field to track how many times a file has been viewed.

#### Visibility Field
Add a `visibility` enum field to `teacher_files` table:
```sql
ALTER TABLE teacher_files
ADD COLUMN visibility VARCHAR(20) DEFAULT 'public'
CHECK (visibility IN ('public', 'restricted'));
```

#### Grade Levels
Create a junction table to link files to grade levels:
```sql
CREATE TABLE teacher_file_grade_levels (
  file_id uuid REFERENCES teacher_files(id),
  grade_level integer,
  PRIMARY KEY (file_id, grade_level)
);
```

---

## 🧪 Testing Checklist

Once integration is complete, test the following:

### UI Testing
- [ ] Table displays all columns correctly
- [ ] Search works for title, subject, and author
- [ ] Filter by subject works
- [ ] Filter by status works
- [ ] Sorting by all options works
- [ ] Statistics cards show correct totals
- [ ] Pagination works
- [ ] File upload modal works
- [ ] Grade level assignment works

### Backend Testing
- [ ] Migration applied successfully
- [ ] Folders can be created with subject_id
- [ ] Folders return subject information
- [ ] Files return uploader information
- [ ] Files return folder and subject information
- [ ] Download URLs generate correctly
- [ ] Soft delete works for files
- [ ] Search and filtering work

### Integration Testing
- [ ] Upload file → appears in table
- [ ] Edit file → changes reflect immediately
- [ ] Delete file → removed from table
- [ ] Download file → presigned URL opens
- [ ] Filter by subject → shows only matching files
- [ ] Search by author → finds files by uploader

---

## 📊 Backend API Reference

### Folder Endpoints

```
GET    /api/teacher-files/folders              - Get folder hierarchy
POST   /api/teacher-files/folders              - Create folder
GET    /api/teacher-files/folders/:id          - Get folder by ID
PUT    /api/teacher-files/folders/:id          - Update folder
DELETE /api/teacher-files/folders/:id          - Delete folder (soft)
POST   /api/teacher-files/folders/:id/restore  - Restore deleted folder
```

### File Endpoints

```
GET    /api/teacher-files/files                    - Get files (paginated)
POST   /api/teacher-files/files                    - Upload file
GET    /api/teacher-files/files/:id                - Get file by ID
PUT    /api/teacher-files/files/:id                - Update file metadata
POST   /api/teacher-files/files/:id/replace        - Replace file content
DELETE /api/teacher-files/files/:id                - Delete file (soft)
POST   /api/teacher-files/files/:id/restore        - Restore deleted file
GET    /api/teacher-files/files/:id/download-url   - Get presigned download URL
```

### Analytics Endpoints

```
GET    /api/teacher-files/analytics/overview   - Get analytics overview
GET    /api/teacher-files/analytics/popular    - Get popular files
```

---

## 🎯 Summary

**Files Modified:**
- ✅ `frontend-nextjs/app/superadmin/learning-materials/page.tsx`
- ✅ `frontend-nextjs/lib/api/endpoints/learning-materials.ts`
- ✅ `core-api-layer/southville-nhs-school-portal-api-layer/src/teacher-files/entities/teacher-folder.entity.ts`
- ✅ `core-api-layer/southville-nhs-school-portal-api-layer/src/teacher-files/dto/create-folder.dto.ts`
- ✅ `core-api-layer/southville-nhs-school-portal-api-layer/src/teacher-files/dto/update-folder.dto.ts`

**Files Created:**
- ✅ `core-api-layer/southville-nhs-school-portal-api-layer/add_subject_id_to_teacher_folders_migration.sql`
- ✅ `LEARNING_MATERIALS_INTEGRATION_GUIDE.md` (this file)

**Files Already Exist (Ready to Use):**
- ✅ `frontend-nextjs/hooks/useLearningMaterials.ts`

**Status:**
- ✅ Frontend UI: **COMPLETE**
- ✅ Backend Schema Updates: **COMPLETE** (migration ready)
- ✅ Backend DTOs/Entities: **COMPLETE**
- ⚠️ Database Migration: **PENDING** (needs to be applied)
- ⚠️ Backend Service Updates: **PENDING** (add subject joins)
- ⚠️ Frontend Integration: **PENDING** (replace mock data)

---

## 🆘 Troubleshooting

### Issue: "UserCog is not defined"
**Solution**: Already fixed by adding `UserCog` to lucide-react imports

### Issue: Migration fails
**Check**:
- subjects table exists
- UUID extension is enabled
- No duplicate indexes

### Issue: Subject not appearing in folders
**Check**:
- Migration was applied
- Backend service includes subject join in query
- subject_id is populated in folders

### Issue: Uploader name shows "Unknown"
**Check**:
- Backend includes uploader join
- Users table has full_name field populated

---

**Last Updated**: 2025-01-26
**Author**: Claude Code
**Status**: Ready for Integration Testing
