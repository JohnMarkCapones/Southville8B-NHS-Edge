# Choice Duplication Issue - Diagnosis & Fix

## Root Cause Found! 🎯

The backend was **deleting old choices WITHOUT checking for errors**. If the deletion failed silently (due to RLS policies, permissions, or other issues), it would continue to INSERT new choices, causing duplication every time you clicked Save.

### Code Location
`core-api-layer/southville-nhs-school-portal-api-layer/src/quiz/services/quiz.service.ts`

**Lines 844-847 (BEFORE FIX):**
```typescript
await supabase
  .from('quiz_choices')
  .delete()
  .eq('question_id', questionId);  // No error checking! 😱
```

**Lines 844-858 (AFTER FIX):**
```typescript
const { error: deleteError } = await supabase
  .from('quiz_choices')
  .delete()
  .eq('question_id', questionId);

if (deleteError) {
  this.logger.error('Error deleting old choices:', deleteError);
  throw new InternalServerErrorException(
    'Failed to delete old choices before update',
  );
}
```

## What Happened

1. **First Save**: Created question with choices ✅
2. **Second Save**: Tried to delete old choices → Delete FAILED silently → Inserted new choices → Now have DOUBLE choices
3. **Third Save**: Tried to delete old choices → Delete FAILED silently → Inserted new choices → Now have TRIPLE choices
4. **After 127 attempts**: You have 3000+ duplicate choices! 💥

## Fixes Applied ✅

### 1. Added Error Handling for Choice Deletion
- Now throws error if deletion fails
- Prevents silent duplication
- Shows error in backend logs

### 2. Fixed True/False Correct Answer Saving
- Frontend now sends True/False choices properly
- Backend won't auto-create if choices are provided

## Cleanup Steps

### Step 1: Run Diagnostic SQL
Open `CHECK_CHOICES_DUPLICATION.sql` in Supabase SQL Editor to see:
- How many questions you have
- How many choices per question
- Which choices are duplicated

### Step 2: Clean Up Duplicates
Open `CLEANUP_DUPLICATE_CHOICES.sql` and:
1. Run Step 1 to see current state
2. Run Step 2 to see which choices are duplicated
3. Uncomment and run Step 3 to DELETE duplicates (keeps oldest copy)
4. Run Step 4 to verify cleanup

### Step 3: Clear Browser Cache
Run in browser console:
```javascript
localStorage.removeItem("quizQuestions")
localStorage.removeItem("quizDetails")
location.reload()
```

### Step 4: Test the Fix
1. Reload the builder page
2. Create a new true/false question
3. Set correct answer to "True" or "False"
4. Click "Save Quiz"
5. Check backend logs - should see:
   - "Deleted old choices for question..."
   - "Question created successfully"
6. Save again - should NOT duplicate choices!

## Monitoring

After cleanup, watch the backend terminal when you click Save. You should see:
```
[QuizService] Deleted old choices for question abc-123, now inserting new ones
[QuizService] Question abc-123 updated in quiz xyz-456
```

If you see an error like:
```
[QuizService] Error deleting old choices: [error details]
```

That means there's a deeper issue (likely RLS policies) that needs to be fixed.

## Prevention

The fix ensures that:
- ✅ Deletions MUST succeed before insertions
- ✅ Errors are logged and thrown (not silent)
- ✅ True/False choices are properly managed
- ✅ No more silent duplication!
