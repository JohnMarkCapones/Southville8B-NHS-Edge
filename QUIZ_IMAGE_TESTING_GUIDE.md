# Quiz Image Support - Testing Guide

**Purpose**: Manual testing checklist to verify quiz image functionality works end-to-end

**Test Environment**: Development/Staging
**Tester**: Manual verification required
**Estimated Time**: 30-45 minutes for complete testing

---

## Pre-Testing Setup

### 1. Database Migration
```sql
-- Run this in Supabase SQL Editor first
-- File: core-api-layer/southville-nhs-school-portal-api-layer/migrations/add_quiz_image_support.sql
```

**Verify Migration Success**:
- [ ] No SQL errors
- [ ] Tables have new columns: `question_image_id`, `question_image_url`, `question_image_file_size`, `question_image_mime_type`
- [ ] Tables have `choices_image_data` JSONB column (for question_bank)

### 2. Backend Server
```bash
cd core-api-layer/southville-nhs-school-portal-api-layer
npm run start:dev
```

**Verify Backend**:
- [ ] Server starts successfully
- [ ] CloudflareImagesService logs: "✅ Successfully connected to Cloudflare Images API"
- [ ] Routes mapped: `/api/quiz/images/upload` (POST) and `/api/quiz/images/:imageId` (DELETE)

### 3. Frontend Server
```bash
cd frontend-nextjs
npm run dev
```

**Verify Frontend**:
- [ ] Development server runs on http://localhost:3000
- [ ] No TypeScript compilation errors
- [ ] No build warnings

---

## Phase 1: Quiz Builder - Question Images

### Test Case 1.1: Upload Question Image
**Steps**:
1. Navigate to `/teacher/quiz/builder`
2. Create a new quiz or edit existing
3. Add a question
4. Click on "Question Image (Optional)" uploader
5. Select an image file (JPEG/PNG, under 10MB)

**Expected Results**:
- [ ] Upload progress indicator shows (0% → 100%)
- [ ] Success toast notification appears
- [ ] Image preview displays below uploader
- [ ] Hover shows "Remove" and "Replace" buttons

**Try with**:
- [ ] Small image (< 1MB)
- [ ] Large image (5-10MB)
- [ ] Different formats (JPEG, PNG, GIF, WebP)

### Test Case 1.2: Drag-and-Drop Question Image
**Steps**:
1. Drag image file from desktop
2. Drop onto question image uploader

**Expected Results**:
- [ ] Drop zone highlights blue during drag
- [ ] Upload starts automatically on drop
- [ ] Image preview displays after upload

### Test Case 1.3: Remove Question Image
**Steps**:
1. Upload a question image
2. Hover over image preview
3. Click "Remove" button

**Expected Results**:
- [ ] Image preview disappears
- [ ] Uploader returns to empty state
- [ ] Success toast: "Image removed"

### Test Case 1.4: Replace Question Image
**Steps**:
1. Upload a question image
2. Hover over image preview
3. Click "Replace" button
4. Select a different image

**Expected Results**:
- [ ] New image uploads successfully
- [ ] Old image replaced with new image
- [ ] New preview displays

### Test Case 1.5: Auto-Save with Image
**Steps**:
1. Add question with image
2. Wait for auto-save (watch for indicator)
3. Refresh page

**Expected Results**:
- [ ] Question still has image after refresh
- [ ] Image preview loads correctly

---

## Phase 2: Quiz Builder - Choice Images (Multiple-Choice)

### Test Case 2.1: Upload Choice Images
**Steps**:
1. Create multiple-choice question
2. Add 4 choices
3. Upload different image for each choice

**Expected Results**:
- [ ] Each choice has separate image uploader
- [ ] Label reads "Option N Image (Optional)"
- [ ] All 4 images upload successfully
- [ ] Each choice card shows its image

### Test Case 2.2: Mixed Content (Text + Images)
**Steps**:
1. Create multiple-choice question
2. Choice 1: Text only (no image)
3. Choice 2: Text + Image
4. Choice 3: Text only
5. Choice 4: Text + Image
6. Save quiz

**Expected Results**:
- [ ] Choices without images work normally
- [ ] Choices with images display correctly
- [ ] Mix of both saves successfully

### Test Case 2.3: Remove Choice with Image
**Steps**:
1. Create multiple-choice with 4 choices
2. Upload image to Choice 2
3. Click remove button on Choice 2

**Expected Results**:
- [ ] Choice 2 deleted
- [ ] Remaining choices re-index correctly
- [ ] Choice 3 becomes Choice 2, Choice 4 becomes Choice 3
- [ ] Images stay with correct choices

---

## Phase 3: Student Quiz Taking

### Test Case 3.1: View Question Images (Multiple-Choice)
**Steps**:
1. Publish quiz with question images
2. Login as student
3. Navigate to quiz
4. Start taking quiz

**Expected Results**:
- [ ] Question images display below question text
- [ ] Images are responsive (scale on mobile)
- [ ] Images load with lazy loading
- [ ] Dark mode styling works

### Test Case 3.2: View Choice Images (Multiple-Choice)
**Steps**:
1. View multiple-choice question with choice images
2. Check all choices

**Expected Results**:
- [ ] Choice images display below choice text
- [ ] Images aligned with left margin (ml-9)
- [ ] Maximum width is `max-w-xs` (320px)
- [ ] Images don't break layout

### Test Case 3.3: True/False with Question Image
**Steps**:
1. View true/false question with image
2. Check image placement

**Expected Results**:
- [ ] Image displays after question text
- [ ] Image appears above True/False buttons
- [ ] Full-width responsive display

### Test Case 3.4: Fill-in-Blank with Question Image
**Steps**:
1. View fill-in-blank question with image
2. Check image placement

**Expected Results**:
- [ ] Image displays after description
- [ ] Image appears before sensitivity hints (if any)
- [ ] Image appears before blank inputs

### Test Case 3.5: Matching Pairs with Question Image
**Steps**:
1. View matching pairs question with image

**Expected Results**:
- [ ] Image displays after question text
- [ ] Image appears above matching columns

---

## Phase 4: Question Bank

### Test Case 4.1: Create Question Bank Item with Image
**Steps**:
1. Navigate to `/teacher/question-bank`
2. Click "Create Question"
3. Fill question text
4. Upload question image
5. Select "Multiple Choice" type
6. Add choices with images
7. Click "Create"

**Expected Results**:
- [ ] Question creates successfully
- [ ] Question card shows image thumbnail (128px height)
- [ ] Image thumbnail displays in grid view
- [ ] Object-cover maintains aspect ratio

### Test Case 4.2: Edit Question Bank Item with Image
**Steps**:
1. Click edit on question with image
2. Dialog loads with existing image
3. Replace question image
4. Add new choice image
5. Click "Update"

**Expected Results**:
- [ ] Existing image loads in uploader
- [ ] Can replace question image
- [ ] Can add/edit choice images
- [ ] Changes save successfully

### Test Case 4.3: View Question Bank List
**Steps**:
1. Create multiple questions with images
2. View question bank list

**Expected Results**:
- [ ] Image thumbnails display on cards
- [ ] Lazy loading works (images load as scrolled)
- [ ] Cards without images show no thumbnail
- [ ] Thumbnails maintain consistent height

---

## Phase 5: Quiz Results & Grading

### Test Case 5.1: View Results with Images
**Steps**:
1. Student completes quiz with images
2. Teacher views results at `/teacher/quiz/[id]/results`
3. Select student to view answers

**Expected Results**:
- [ ] Question images display in answer review cards
- [ ] Images appear after question text
- [ ] Images display alongside student/correct answers
- [ ] Full-width responsive display

### Test Case 5.2: Grade Essay with Question Image
**Steps**:
1. Student submits essay question with image
2. Teacher navigates to `/teacher/quiz/[id]/grade`
3. View essay question for grading

**Expected Results**:
- [ ] Question image displays after question text
- [ ] Image visible while grading
- [ ] Teacher can see image context for grading
- [ ] Image doesn't interfere with grading controls

### Test Case 5.3: View Auto-Graded Questions with Images
**Steps**:
1. View results for auto-graded multiple-choice
2. Check auto-graded question cards

**Expected Results**:
- [ ] Question images display in auto-graded cards
- [ ] Images show for both correct/incorrect answers

---

## Phase 6: Image Validation & Error Handling

### Test Case 6.1: Invalid File Type
**Steps**:
1. Try to upload .txt file
2. Try to upload .pdf file
3. Try to upload .docx file

**Expected Results**:
- [ ] Error toast: "Invalid file type"
- [ ] Message specifies accepted formats
- [ ] Upload doesn't proceed

### Test Case 6.2: File Too Large
**Steps**:
1. Try to upload image > 10MB

**Expected Results**:
- [ ] Error toast: "File too large"
- [ ] Shows current file size and max size
- [ ] Upload doesn't proceed

### Test Case 6.3: Network Error During Upload
**Steps**:
1. Start upload
2. Disconnect internet mid-upload
3. Reconnect internet

**Expected Results**:
- [ ] Error toast appears
- [ ] Progress resets to 0%
- [ ] Can retry upload after reconnect

### Test Case 6.4: Upload to Quiz Without Images
**Steps**:
1. Create quiz without uploading any images
2. Save and publish quiz

**Expected Results**:
- [ ] Quiz saves successfully
- [ ] No errors or warnings
- [ ] Backward compatibility maintained

---

## Phase 7: Image Cleanup (Backend)

### Test Case 7.1: Delete Question with Image
**Steps**:
1. Create question with question image
2. Note the Cloudflare image ID (from network tab or logs)
3. Delete the question
4. Check Cloudflare Images dashboard

**Expected Results**:
- [ ] Question deletes from database
- [ ] Backend logs: "Deleting question image from Cloudflare: [imageId]"
- [ ] Image removed from Cloudflare (verify in dashboard)
- [ ] No orphaned images

### Test Case 7.2: Delete Multiple-Choice with Choice Images
**Steps**:
1. Create multiple-choice with 4 choice images
2. Note all 4 Cloudflare image IDs
3. Delete the question
4. Check Cloudflare Images dashboard

**Expected Results**:
- [ ] All 4 choice images deleted from Cloudflare
- [ ] Backend logs show 4 deletion calls
- [ ] No orphaned images in Cloudflare

### Test Case 7.3: Update Question (Replace Image)
**Steps**:
1. Create question with image A
2. Replace with image B
3. Save
4. Check Cloudflare

**Expected Results**:
- [ ] Old image A potentially orphaned (current behavior)
- [ ] New image B stored and displayed
- [ ] Question displays image B

**Note**: Image replacement cleanup is not implemented. Old images may remain in Cloudflare. This is acceptable behavior (images are small, storage is cheap). Could be improved in future.

---

## Phase 8: Performance Testing

### Test Case 8.1: Image Loading Speed
**Steps**:
1. Create quiz with 10 questions, each with images
2. Open quiz as student
3. Monitor network tab

**Expected Results**:
- [ ] Images load with `loading="lazy"`
- [ ] Only visible images load initially
- [ ] Images below fold load as scrolled
- [ ] No blocking of page render

### Test Case 8.2: Multiple Concurrent Uploads
**Steps**:
1. Open quiz builder
2. Upload images to 5 questions simultaneously
3. Monitor progress

**Expected Results**:
- [ ] All uploads proceed
- [ ] Progress indicators update correctly
- [ ] No upload failures
- [ ] All images save successfully

### Test Case 8.3: CDN Delivery Performance
**Steps**:
1. Create quiz with images
2. Open browser DevTools → Network tab
3. Take quiz, observe image requests

**Expected Results**:
- [ ] Images served from Cloudflare CDN (`imagedelivery.net`)
- [ ] Images load fast (< 500ms)
- [ ] Proper caching headers
- [ ] Optimized image variants used

---

## Phase 9: Dark Mode & Responsive Testing

### Test Case 9.1: Dark Mode
**Steps**:
1. Toggle dark mode in settings
2. View quiz builder with images
3. View quiz taking interface with images
4. View results with images

**Expected Results**:
- [ ] All image borders use dark mode colors (`dark:border-gray-700`)
- [ ] Image backgrounds work in dark mode
- [ ] No visual glitches
- [ ] Images remain visible and clear

### Test Case 9.2: Mobile Responsive
**Steps**:
1. Open browser DevTools → Toggle device toolbar
2. Test on mobile viewport (375px width)
3. View quiz with images

**Expected Results**:
- [ ] Images scale down to fit mobile
- [ ] No horizontal scroll
- [ ] Image uploaders work on mobile
- [ ] Drag-and-drop still functional
- [ ] Touch interactions work

### Test Case 9.3: Tablet Responsive
**Steps**:
1. Test on tablet viewport (768px width)
2. View quiz builder with images

**Expected Results**:
- [ ] Images scale appropriately
- [ ] Upload UI adapts to tablet
- [ ] No layout breaks

---

## Phase 10: Cross-Browser Testing

### Test Case 10.1: Chrome/Edge
**Steps**:
1. Complete full test suite in Chrome
2. Repeat key tests in Edge

**Expected Results**:
- [ ] All features work identically
- [ ] Images display correctly
- [ ] Uploads work

### Test Case 10.2: Firefox
**Steps**:
1. Test image upload
2. Test image display
3. Test drag-and-drop

**Expected Results**:
- [ ] All features work
- [ ] No Firefox-specific bugs

### Test Case 10.3: Safari (if available)
**Steps**:
1. Test on macOS Safari or iOS Safari
2. Test image upload and display

**Expected Results**:
- [ ] All features work
- [ ] No Safari-specific bugs

---

## Known Limitations & Expected Behavior

### 1. Image Replacement
- **Current Behavior**: When replacing an image, the old image remains in Cloudflare
- **Reason**: No image cleanup on update (only on delete)
- **Impact**: Minimal (images are small, Cloudflare storage is generous)
- **Future**: Could implement cleanup in future if needed

### 2. JSONB Storage for Choice Images
- **Current Behavior**: Choice images stored as JSONB in `choices_image_data` for question bank
- **Reason**: Flexible storage for variable number of choices
- **Impact**: None (works as expected)

### 3. Image Size Limit
- **Current Behavior**: 10MB max per image
- **Reason**: Cloudflare Images API limitation + reasonable file size
- **Impact**: Should be sufficient for quiz questions

### 4. Supported Formats
- **Current Behavior**: JPEG, PNG, GIF, WebP, AVIF
- **Reason**: Common web image formats
- **Not Supported**: SVG, TIFF, BMP, etc.

---

## Bug Reporting Template

If you find issues during testing, report using this format:

```markdown
### Bug: [Short Description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Result**:
What should happen

**Actual Result**:
What actually happened

**Environment**:
- Browser: [Chrome/Firefox/Safari]
- OS: [Windows/Mac/Linux]
- Screen Size: [Desktop/Tablet/Mobile]

**Screenshots**:
[Attach if applicable]

**Console Errors**:
[Copy any errors from browser console]
```

---

## Testing Completion Checklist

### Backend
- [ ] Database migration runs successfully
- [ ] Upload endpoint works (`POST /api/quiz/images/upload`)
- [ ] Delete endpoint works (`DELETE /api/quiz/images/:imageId`)
- [ ] Images stored in Cloudflare Images
- [ ] Image cleanup on question deletion works

### Frontend - Quiz Builder
- [ ] Question image upload works
- [ ] Choice image upload works (multiple-choice)
- [ ] Image preview displays
- [ ] Remove image works
- [ ] Replace image works
- [ ] Auto-save includes images
- [ ] Manual save includes images
- [ ] Publish includes images

### Frontend - Quiz Taking (Student)
- [ ] Question images display (multiple-choice)
- [ ] Question images display (true-false)
- [ ] Question images display (fill-in-blank)
- [ ] Question images display (matching-pairs)
- [ ] Choice images display (multiple-choice)
- [ ] Lazy loading works
- [ ] Responsive design works

### Frontend - Question Bank
- [ ] Create question with images
- [ ] Edit question with images
- [ ] Image thumbnails display in list
- [ ] JSONB storage for choice images works

### Frontend - Results & Grading
- [ ] Images display in results page
- [ ] Images display in grading interface (auto-graded)
- [ ] Images display in grading interface (essay)

### Error Handling
- [ ] Invalid file type rejected
- [ ] File too large rejected
- [ ] Network errors handled gracefully
- [ ] Success/error toasts display

### Performance
- [ ] Images load quickly (< 500ms)
- [ ] Lazy loading works
- [ ] No blocking of page render
- [ ] Multiple uploads work concurrently

### Cross-Cutting
- [ ] Dark mode works
- [ ] Mobile responsive works
- [ ] Tablet responsive works
- [ ] Cross-browser compatible

---

## Post-Testing Actions

After completing testing:

1. **Document Issues**: Create issues for any bugs found
2. **Update Status**: Mark Phase 11 as complete in `QUIZ_IMAGE_SUPPORT_STATUS.md`
3. **Proceed to Phase 12**: Polish and final documentation
4. **User Acceptance**: Get feedback from end users (teachers/students)

---

## Questions During Testing?

If you encounter issues or have questions:
1. Check browser console for errors
2. Check backend logs for errors
3. Verify database migration ran
4. Verify Cloudflare Images credentials are correct
5. Ask me for help debugging specific issues
