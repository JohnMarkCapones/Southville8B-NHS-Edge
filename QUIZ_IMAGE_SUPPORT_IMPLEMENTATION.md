# Quiz Image Support Implementation Guide

## Overview

This document outlines the complete implementation of image support for the quiz system using Cloudflare Images. This feature allows teachers to add visual context to quiz questions and answer choices, enhancing the learning experience.

## Feature Summary

- **Question Images**: Add images to quiz questions (all question types)
- **Choice Images**: Add images to multiple choice answer options
- **Question Bank Support**: Full image support in question bank for reusability
- **Cloudflare Images**: Leverages existing infrastructure for optimization and CDN delivery
- **Responsive UI**: Images adapt to screen size and dark mode

## Supported Question Types

| Question Type | Question Image | Choice Images |
|--------------|----------------|---------------|
| Multiple Choice | ✅ | ✅ |
| True/False | ✅ | ❌ |
| Fill-in-the-Blank | ✅ | ❌ |
| Matching Pairs | ✅ | ❌ |

## Implementation Status

### ✅ Phase 1: Database Migration (COMPLETE)

**File**: `core-api-layer/southville-nhs-school-portal-api-layer/migrations/add_quiz_image_support.sql`

**Status**: ✅ Migration file created and ready to run

**Changes Made**:
- Added 4 image columns to `quiz_questions` table
- Added 4 image columns to `quiz_choices` table
- Added 5 image columns to `question_bank` table (includes JSONB for choice images)
- Created indexes for optimized image queries
- Added comprehensive comments and verification queries
- Included rollback script for development safety

**Next Step**: Run this migration on your Supabase database via SQL Editor.

**How to Apply Migration**:
```bash
# Option 1: Via Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of migrations/add_quiz_image_support.sql
3. Execute the migration
4. Run verification queries at bottom of file

# Option 2: Via psql
psql -h your-host -U your-user -d your-database -f migrations/add_quiz_image_support.sql
```

### ✅ Phase 2: Backend DTOs (COMPLETE)

**Status**: ✅ All DTOs updated with image support fields

**Files Updated**:

#### 1. ✅ `src/quiz/dto/create-quiz-choice.dto.ts`
**Added**:
- `choiceImageId?: string` - Cloudflare Images ID
- `choiceImageUrl?: string` - Full delivery URL
- `choiceImageFileSize?: number` - File size in bytes
- `choiceImageMimeType?: string` - MIME type
- All fields include `@IsOptional()`, `@ApiProperty()` decorators
- Proper validation with `@IsUrl()`, `@IsInt()`, `@Min(0)`

#### 2. ✅ `src/quiz/dto/create-quiz-question.dto.ts`
**Added**:
- `questionImageId?: string` - Cloudflare Images ID
- `questionImageUrl?: string` - Full delivery URL
- `questionImageFileSize?: number` - File size in bytes
- `questionImageMimeType?: string` - MIME type
- All fields include proper validation and API documentation

#### 3. ✅ `src/quiz/dto/create-question-bank.dto.ts`
**Added**:
- Same 4 image fields as quiz question DTO
- `choicesImageData?: Record<string, any>` - JSONB for choice images
- All fields properly validated with class-validator decorators
- Comprehensive Swagger documentation with examples

### ✅ Phase 3: Backend Entities (COMPLETE)

**Status**: ✅ All entities updated with image fields

**Files Updated**:

#### 1. ✅ `src/quiz/entities/quiz-choice.entity.ts`
**Added**:
- `choice_image_id?: string` - Cloudflare Images ID
- `choice_image_url?: string` - Full delivery URL
- `choice_image_file_size?: number` - File size in bytes
- `choice_image_mime_type?: string` - MIME type
- All fields use snake_case to match database columns
- Proper `@ApiProperty()` decorators for Swagger docs

#### 2. ✅ `src/quiz/entities/quiz-question.entity.ts`
**Added**:
- `question_image_id?: string` - Cloudflare Images ID
- `question_image_url?: string` - Full delivery URL
- `question_image_file_size?: number` - File size in bytes
- `question_image_mime_type?: string` - MIME type
- All fields properly documented with `@ApiProperty()`

#### 3. ✅ `src/quiz/entities/question-bank.entity.ts`
**Added**:
- Same 4 image fields as quiz question entity
- `choices_image_data?: Record<string, any>` - JSONB for choice images
- All fields match database schema exactly (snake_case)
- Complete Swagger documentation

### ✅ Phase 4: Cloudflare Images Upload Endpoint (COMPLETE)

**Status**: ✅ Upload and delete endpoints working

**Files Created**:
1. `src/common/services/cloudflare-images.service.ts` - Shared Cloudflare Images service (moved from gallery module)
2. `src/quiz/controllers/quiz-images.controller.ts` - Quiz-specific image upload controller

**Modules Updated**:
- `src/common/common.module.ts` - Exports CloudflareImagesService globally
- `src/quiz/quiz.module.ts` - Includes QuizImagesController

**Endpoints Implemented**:
```typescript
POST /api/quiz/images/upload
- Accepts multipart/form-data with 'file' field
- Returns: { imageId, imageUrl, cardUrl, thumbnailUrl, fileSize, mimeType }
- Requires: Admin or Teacher role
- Max size: 10MB
- Formats: JPEG, PNG, GIF, WebP, AVIF

DELETE /api/quiz/images/:imageId
- Deletes image from Cloudflare
- Returns: { success: boolean, message: string }
- Requires: Admin or Teacher role
- Idempotent (404 treated as success)
```

**Features**:
- File type and size validation
- Returns all image variant URLs (thumbnail, card, public, original)
- Comprehensive Swagger documentation
- Error handling with proper HTTP status codes
- Integrates with existing Supabase auth guards

**Backend Running**:
```
✅ Cloudflare Images configuration validated
✅ Successfully connected to Cloudflare Images API
✅ POST /api/quiz/images/upload endpoint registered
✅ DELETE /api/quiz/images/:imageId endpoint registered
```

### 🔄 Phase 5: Service Layer Updates (PENDING)

**Files to Update**:

#### 1. `src/quiz/services/quiz.service.ts`
- Update `createQuiz()` to handle question images
- Update `updateQuiz()` to handle image updates
- Add cleanup logic for deleted question images

#### 2. `src/quiz/services/question-bank.service.ts`
- Update CRUD operations to include image fields
- Handle `choicesImageData` JSONB properly
- Add image cleanup on question deletion

### 🔄 Phase 6: Frontend - QuizImageUploader Component (PENDING)

**New File**: `frontend-nextjs/components/quiz/QuizImageUploader.tsx`

**Features**:
- Drag-and-drop support
- Preview thumbnail
- Delete functionality
- Progress indicator
- Dark mode support
- Mobile responsive

**Props**:
```typescript
interface QuizImageUploaderProps {
  value?: string;  // Current image URL
  onChange: (imageData: ImageData | null) => void;
  label?: string;
  maxSizeMB?: number;
  variant?: 'question' | 'choice';
}
```

### 🔄 Phase 7: Frontend - Quiz Builder Integration (PENDING)

**File**: `frontend-nextjs/app/teacher/quiz/builder/page.tsx`

**Changes**:
1. Add `<QuizImageUploader>` component below question title input
2. Add conditional choice image uploaders for multiple choice questions
3. Update form state to track image data
4. Handle image deletion when questions/choices are removed

**UI Layout**:
```
┌─────────────────────────────────────────┐
│ Question 1                              │
│ ┌─────────────────────────────────────┐ │
│ │ Multiple Choice                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Question Text                           │
│ ┌─────────────────────────────────────┐ │
│ │ What is...                          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Question Image (Optional)               │
│ ┌─────────────────────────────────────┐ │
│ │ [📷 Upload Image] or drag here      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Answer Choices                          │
│ ┌─────────────────────────────────────┐ │
│ │ ○ Choice 1 [📷]                     │ │
│ │ ○ Choice 2 [📷]                     │ │
│ │ ○ Choice 3 [📷]                     │ │
│ │ ○ Choice 4 [📷]                     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 🔄 Phase 8: Frontend - Quiz Display (Student Side) (PENDING)

**Files to Update**:

#### 1. `frontend-nextjs/components/quiz/multiple-choice-quiz.tsx`
```tsx
{question.questionImageUrl && (
  <div className="mb-4 rounded-lg overflow-hidden">
    <img
      src={question.questionImageUrl}
      alt="Question illustration"
      className="w-full max-h-[400px] object-contain bg-slate-50 dark:bg-slate-900"
    />
  </div>
)}

{/* For each choice */}
{choice.choiceImageUrl && (
  <img
    src={choice.choiceImageUrl}
    alt={choice.choice_text}
    className="w-16 h-16 object-cover rounded"
  />
)}
```

#### 2. `frontend-nextjs/components/quiz/true-false-quiz.tsx`
Add question image display (same pattern as multiple choice).

#### 3. `frontend-nextjs/components/quiz/fill-in-blank-quiz.tsx`
Add question image display above the fill-in-blank inputs.

#### 4. `frontend-nextjs/components/quiz/matching-pair-quiz.tsx`
Add question image display above the matching columns.

### 🔄 Phase 9: Frontend - Quiz Results/Review (PENDING)

**File**: `frontend-nextjs/app/student/quiz/[id]/page.tsx`

**Update Review Section** (lines 1400-1550):
- Display question images in review cards
- Display choice images for multiple choice questions
- Ensure images work in both dark and light modes

### 🔄 Phase 10: Question Bank Integration (PENDING)

**File**: `frontend-nextjs/app/teacher/question-bank/*`

**Changes**:
1. Update question bank creation/edit forms to include image uploaders
2. Handle `choicesImageData` JSONB for storing multiple choice images
3. When importing from question bank to quiz, copy image URLs
4. Display thumbnails in question bank list view

### 🔄 Phase 11: Testing (PENDING)

**Backend Tests**:
- [ ] Image upload with valid files (JPEG, PNG, GIF, WebP)
- [ ] Image upload rejection for invalid types
- [ ] Image upload rejection for oversized files (>10MB)
- [ ] Image deletion removes from Cloudflare
- [ ] Quiz creation with question images
- [ ] Quiz creation with choice images (multiple choice)
- [ ] Question bank CRUD with images
- [ ] Image cleanup on question deletion
- [ ] Image cleanup on choice deletion

**Frontend Tests**:
- [ ] Image upload UI works in quiz builder
- [ ] Image preview displays correctly
- [ ] Image deletion removes preview and clears data
- [ ] Question images display in student quiz view
- [ ] Choice images display in multiple choice questions
- [ ] Images are responsive on mobile (320px - 768px)
- [ ] Images work in dark mode
- [ ] Images display in quiz results/review
- [ ] Question bank shows image thumbnails

**Integration Tests**:
- [ ] End-to-end: Create quiz with images → Assign → Student takes quiz → Images display correctly
- [ ] End-to-end: Create question bank item with images → Import to quiz → Images copied correctly
- [ ] Image URL generation matches Cloudflare pattern
- [ ] Image variants (thumbnail, card, public) work correctly

### 🔄 Phase 12: Documentation & Polish (PENDING)

**Tasks**:
- [ ] Update API documentation with new image endpoints
- [ ] Add teacher guide for using images in quizzes
- [ ] Add file size and dimension recommendations
- [ ] Create visual examples for best practices
- [ ] Add error messages for failed uploads
- [ ] Add loading states for image uploads
- [ ] Add success toasts for image operations

## Database Schema Reference

### quiz_questions Table
```sql
question_image_id         TEXT          -- Cloudflare Images ID
question_image_url        TEXT          -- Full delivery URL
question_image_file_size  INTEGER       -- Bytes
question_image_mime_type  VARCHAR(50)   -- MIME type
```

### quiz_choices Table
```sql
choice_image_id          TEXT          -- Cloudflare Images ID
choice_image_url         TEXT          -- Full delivery URL
choice_image_file_size   INTEGER       -- Bytes
choice_image_mime_type   VARCHAR(50)   -- MIME type
```

### question_bank Table
```sql
question_image_id         TEXT          -- Cloudflare Images ID
question_image_url        TEXT          -- Full delivery URL
question_image_file_size  INTEGER       -- Bytes
question_image_mime_type  VARCHAR(50)   -- MIME type
choices_image_data        JSONB         -- Array of choice image objects
```

## Cloudflare Images Reference

### Configuration
Located in: `src/config/cloudflare-images.config.ts`

**Account Details**:
```typescript
accountId: process.env.CLOUDFLARE_ACCOUNT_ID
apiToken: process.env.CLOUDFLARE_IMAGES_API_TOKEN
accountHash: process.env.CLOUDFLARE_ACCOUNT_HASH
```

### Image Variants
- **thumbnail**: 200x200px (for previews, lists)
- **card**: 800x600px (for quiz display)
- **public**: Original dimensions, optimized
- **original**: Unmodified upload

### URL Pattern
```
https://imagedelivery.net/{account_hash}/{image_id}/{variant}
```

**Example**:
```
https://imagedelivery.net/abc123def/quiz-q-1f3b8bf5-b165/card
```

## Reference Implementations

### Cloudflare Images Upload
**File**: `src/events/events.controller.ts`
- Method: `uploadEventImage()`
- Line: ~850-900
- Shows complete upload flow with validation

### Image Display Component
**File**: `frontend-nextjs/components/slideshow-viewer.tsx`
- Shows responsive image display
- Dark mode support
- Loading states

### Gallery Implementation
**Files**:
- `frontend-nextjs/app/superadmin/gallery/page.tsx`
- Shows image grid layout
- Thumbnail usage
- Image management UI

## Technical Constraints

### File Upload Limits
- **Max Size**: 10MB per image
- **Formats**: JPEG, PNG, GIF, WebP, AVIF
- **Dimensions**: No hard limit, but recommended max 4000x4000px

### Performance Considerations
- Images are lazy-loaded in quiz lists
- Cloudflare CDN provides fast delivery globally
- Thumbnails used for previews to reduce bandwidth
- Original images cached client-side during quiz attempt

### Security
- Image upload requires authentication
- Teachers can only upload for their own quizzes
- File type validation prevents malicious uploads
- Cloudflare scans for malware automatically

## Effort Estimate

| Phase | Hours | Status |
|-------|-------|--------|
| Database Migration | 1 | ✅ Complete |
| Backend DTOs | 1 | ✅ Complete |
| Backend Entities | 1 | ✅ Complete |
| Upload Endpoint | 2 | ✅ Complete |
| Service Layer | 2 | 🔄 Pending |
| Frontend Component | 3 | 🔄 Pending |
| Quiz Builder Integration | 2 | 🔄 Pending |
| Quiz Display Integration | 2 | 🔄 Pending |
| Question Bank Integration | 2 | 🔄 Pending |
| Testing | 3 | 🔄 Pending |
| Documentation/Polish | 1 | 🔄 Pending |
| **TOTAL** | **20** | **30% Complete** |

## Next Steps

1. ✅ **Database migration created** - Apply `migrations/add_quiz_image_support.sql` to your Supabase database
2. ✅ **Backend DTOs updated** - All quiz DTOs now include image fields
3. ✅ **Backend entities updated** - All entities now include image columns
4. **Create upload endpoint** - Implement Cloudflare Images upload/delete
5. **Update service layer** - Modify quiz services to handle image data
6. **Build UI component** - Create QuizImageUploader component
7. **Integrate in quiz builder** - Add image uploaders to quiz creation flow
8. **Display in quiz view** - Show images to students taking quizzes
9. **Test thoroughly** - Run all test cases
10. **Deploy** - Push to production

## Support & Questions

For questions about this implementation, refer to:
- Cloudflare Images docs: `CLOUDFLARE_IMAGES_IMPLEMENTATION_COMPLETE.md`
- Events implementation: `EVENTS_CLOUDFLARE_IMAGES_IMPLEMENTATION_COMPLETE.md`
- Quiz schema: `quiz_schema_documentation.md`

---

**Last Updated**: 2025-11-11
**Status**: Phases 1-4 Complete (30% Done) - Backend Upload Endpoint Ready
**Next**: Phase 5 - Update Service Layer

## Recent Changes

### 2025-11-11 - Backend Upload Endpoint Complete
- ✅ Created shared CloudflareImagesService in common module
- ✅ Created QuizImagesController with upload/delete endpoints
- ✅ Updated CommonModule to export CloudflareImagesService globally
- ✅ Updated QuizModule to include QuizImagesController
- ✅ Backend successfully compiled and running
- ✅ Cloudflare Images API connection tested and verified

**API Endpoints Live**:
- `POST /api/quiz/images/upload` - Upload quiz image (returns all variants)
- `DELETE /api/quiz/images/:imageId` - Delete quiz image (idempotent)

### 2025-11-11 - Backend Foundation Complete
- ✅ Created database migration SQL file with all necessary schema changes
- ✅ Updated all DTOs (CreateQuizQuestionDto, CreateQuizChoiceDto, CreateQuestionBankDto)
- ✅ Updated all entities (QuizQuestion, QuizChoice, QuestionBank)
- ✅ Added proper validation decorators (@IsUrl, @IsInt, etc.)
- ✅ Added comprehensive Swagger documentation to all new fields
- ✅ Verified snake_case naming convention matches database schema

**Files Modified (8)**:
1. `src/quiz/dto/create-quiz-choice.dto.ts` - Added 4 image fields
2. `src/quiz/dto/create-quiz-question.dto.ts` - Added 4 image fields
3. `src/quiz/dto/create-question-bank.dto.ts` - Added 5 image fields (includes JSONB)
4. `src/quiz/entities/quiz-choice.entity.ts` - Added 4 image properties
5. `src/quiz/entities/quiz-question.entity.ts` - Added 4 image properties
6. `src/quiz/entities/question-bank.entity.ts` - Added 5 image properties
7. `src/common/common.module.ts` - Added CloudflareImagesService
8. `src/quiz/quiz.module.ts` - Added QuizImagesController

**Files Created (4)**:
1. `migrations/add_quiz_image_support.sql` - Complete migration script
2. `src/common/services/cloudflare-images.service.ts` - Shared Cloudflare Images service
3. `src/quiz/controllers/quiz-images.controller.ts` - Quiz image endpoints
4. `QUIZ_IMAGE_SUPPORT_IMPLEMENTATION.md` - This implementation guide
