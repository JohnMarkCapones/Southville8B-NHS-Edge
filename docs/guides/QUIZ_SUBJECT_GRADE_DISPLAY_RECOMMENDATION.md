# Quiz Subject & Grade Display - Recommendation

**Date:** 2025-01-06
**Topic:** How to handle Subject & Grade columns in teacher quiz list
**Status:** 📋 RECOMMENDATION

---

## 📊 Current State Analysis

### What We Have Now:

**Backend Data (quiz entity):**
- `subject_id` (UUID, optional) - Reference to subjects table
- `title` (string, required)
- `status` (draft/published/scheduled)
- NO `grade` field directly

**Frontend Display (hardcoded):**
```typescript
{
  subject: quiz.subject_id || "General", // Shows UUID, not name!
  grade: "Grade 8", // HARDCODED - same for all quizzes
}
```

**Problem:**
1. Subject shows UUID instead of name
2. Grade is hardcoded to "Grade 8" for ALL quizzes
3. No distinction between draft/published/scheduled

---

## 🎯 My Recommendation

### **Option A: Show Subject & Grade for ALL Quiz Types (Recommended)**

**Why:**
- ✅ Consistent UI across all statuses
- ✅ Helps teachers organize drafts by subject/grade
- ✅ Clear at-a-glance information
- ✅ Matches teacher's mental model

**How to Handle Each Status:**

#### **Draft Quizzes:**
```
| Title                    | Subject      | Grade        | Status | Actions |
|--------------------------|--------------|--------------|--------|---------|
| Math Quiz - Algebra      | Mathematics  | Not Set      | Draft  | [...]   |
| Science Test (WIP)       | Science      | Grade 10, 11 | Draft  | [...]   |
| Untitled Quiz            | Not Set      | Not Set      | Draft  | [...]   |
```

**Display Logic:**
- **Subject**: Show name if `subject_id` exists, else "Not Set"
- **Grade**: Check if quiz has section assignments
  - If assigned: Show grade levels (e.g., "Grade 10, 11")
  - If not assigned: Show "Not Set" or "-"
- **Visual Indicator**: Maybe add dim/gray text for "Not Set"

#### **Published/Active Quizzes:**
```
| Title                    | Subject      | Grade        | Status    | Actions |
|--------------------------|--------------|--------------|-----------|---------|
| Math Quiz - Algebra      | Mathematics  | Grade 10     | Published | [...]   |
| Science Midterm Exam     | Science      | Grade 10, 11 | Published | [...]   |
```

**Display Logic:**
- **Subject**: MUST exist (validation prevents publishing without subject)
- **Grade**: MUST exist (we now require section assignments before publishing)
- **Badge**: Green "LIVE" indicator

#### **Scheduled Quizzes:**
```
| Title                    | Subject      | Grade        | Status    | Actions |
|--------------------------|--------------|--------------|-----------|---------|
| Final Exam - Math        | Mathematics  | Grade 10     | Scheduled | [...]   |
| Biology Quiz - Cells     | Biology      | Grade 11     | Scheduled | [...]   |
```

**Display Logic:**
- **Subject**: MUST exist
- **Grade**: MUST exist (from section assignments)
- **Badge**: Purple "SCHEDULED" with countdown timer

---

## 🔧 Implementation Plan

### Step 1: Fetch Subject Name

**Add to quiz API response or join:**
```typescript
// Backend: Include subject relationship
const quiz = await supabase
  .from('quizzes')
  .select(`
    *,
    subjects:subject_id (
      subject_id,
      name
    )
  `)
```

**Frontend: Transform to include subject name:**
```typescript
const transformedBackendQuizzes = backendQuizzes.map((quiz: any) => ({
  ...quiz,
  subject: quiz.subjects?.name || quiz.subject_id || "Not Set",
  subjectId: quiz.subject_id,
}))
```

### Step 2: Calculate Grade from Section Assignments

**Add helper function:**
```typescript
/**
 * Get grade levels from quiz's assigned sections
 */
const getQuizGradeLevels = async (quizId: string): Promise<string[]> => {
  try {
    const sections = await quizApi.teacher.getAssignedSections(quizId)
    const grades = sections
      .map(s => s.grade_level)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i) // unique
      .sort()
    return grades
  } catch (error) {
    return []
  }
}

/**
 * Format grades for display
 */
const formatGrades = (grades: string[]): string => {
  if (grades.length === 0) return "Not Set"
  if (grades.length === 1) return `Grade ${grades[0]}`
  if (grades.length <= 3) return grades.map(g => `Grade ${g}`).join(", ")
  return `Grade ${grades[0]}-${grades[grades.length - 1]}` // e.g., "Grade 10-12"
}
```

**Usage in table:**
```typescript
// Display in table cell
<TableCell>
  <Badge variant={quiz.grade === "Not Set" ? "secondary" : "outline"}>
    {quiz.grade}
  </Badge>
</TableCell>
```

### Step 3: Add Visual Indicators

**For Draft Quizzes with Missing Data:**
```tsx
<TableCell>
  {quiz.subject === "Not Set" ? (
    <div className="flex items-center gap-1 text-gray-400">
      <AlertCircle className="w-3 h-3" />
      <span className="text-sm">Not Set</span>
    </div>
  ) : (
    <Badge variant="outline">{quiz.subject}</Badge>
  )}
</TableCell>
```

**For Published Quizzes (Should Always Have Data):**
```tsx
<TableCell>
  <Badge className="bg-blue-100 text-blue-700">
    {quiz.subject}
  </Badge>
</TableCell>
```

---

## 📋 Alternative: Option B - Hide Columns Based on Status

**Show columns conditionally:**

| Status | Show Subject? | Show Grade? | Reasoning |
|--------|---------------|-------------|-----------|
| Draft | ✅ Yes | ❌ No | Grade comes from sections, drafts may not have them yet |
| Published | ✅ Yes | ✅ Yes | Complete quizzes have all info |
| Scheduled | ✅ Yes | ✅ Yes | Complete quizzes have all info |

**Implementation:**
```tsx
<TableHeader>
  <TableRow>
    <TableHead>Title</TableHead>
    <TableHead>Subject</TableHead>
    {selectedStatus !== 'draft' && <TableHead>Grade</TableHead>}
    <TableHead>Status</TableHead>
    <TableHead>Actions</TableHead>
  </TableRow>
</TableHeader>
```

**Pros:**
- ✅ Cleaner for drafts (no "Not Set" values)
- ✅ Emphasizes that drafts are incomplete

**Cons:**
- ❌ Inconsistent column layout (shifts when filtering)
- ❌ Can't sort drafts by grade
- ❌ Less helpful for organizing drafts

---

## 🎨 Visual Design Recommendations

### Status-Based Styling:

**Draft Quizzes:**
```tsx
<Badge variant="secondary" className="bg-gray-100 text-gray-600">
  {quiz.subject || "Not Set"}
</Badge>
<Badge variant="secondary" className="bg-gray-100 text-gray-600">
  {quiz.grade || "Not Set"}
</Badge>
```

**Published Quizzes:**
```tsx
<Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
  {quiz.subject}
</Badge>
<Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
  {quiz.grade}
</Badge>
```

**Scheduled Quizzes:**
```tsx
<Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-700">
  {quiz.subject}
</Badge>
<Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-700">
  {quiz.grade}
</Badge>
```

---

## 🚦 Validation Rules

### Before Publishing:

**Check if required fields are set:**
```typescript
const canPublish = (quiz: Quiz): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!quiz.subject_id) {
    errors.push("Subject is required")
  }

  if (!quiz.sections || quiz.sections.length === 0) {
    errors.push("At least one section must be assigned")
  }

  if (quiz.questions < 1) {
    errors.push("Quiz must have at least one question")
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

**Show validation errors:**
```tsx
{!canPublish(quiz).valid && (
  <Tooltip>
    <TooltipTrigger>
      <AlertCircle className="w-4 h-4 text-amber-500" />
    </TooltipTrigger>
    <TooltipContent>
      <ul className="text-xs">
        {canPublish(quiz).errors.map(error => (
          <li key={error}>• {error}</li>
        ))}
      </ul>
    </TooltipContent>
  </Tooltip>
)}
```

---

## 📊 Comparison Table

| Aspect | Option A (Show Always) | Option B (Hide for Drafts) |
|--------|------------------------|---------------------------|
| **Consistency** | ✅ Always same columns | ❌ Columns shift |
| **Information** | ✅ More info visible | ❌ Less info for drafts |
| **Sorting** | ✅ Can sort by all fields | ❌ Can't sort drafts by grade |
| **Clarity** | ⚠️ "Not Set" might look messy | ✅ Cleaner (no empty values) |
| **UX** | ✅ Predictable layout | ❌ Layout changes |
| **Implementation** | ⚠️ Medium (need fallbacks) | 🟢 Easy (conditional render) |

---

## ✅ My Final Recommendation

### **Go with Option A: Show Subject & Grade for ALL Quiz Types**

**Why:**
1. **Better UX**: Consistent, predictable layout
2. **More Helpful**: Teachers can organize drafts by subject/grade
3. **Scalable**: Works as quizzes move through statuses
4. **Clear Information**: Everything at a glance

**Implementation Priority:**

**Phase 1 (Quick Fix - 30 min):**
```typescript
// Show "Not Set" for missing data
const transformedBackendQuizzes = backendQuizzes.map((quiz: any) => ({
  subject: quiz.subjects?.name || "Not Set",
  grade: "Not Set", // TODO: Get from sections
  // ... rest
}))
```

**Phase 2 (Complete - 1-2 hours):**
- Fetch subject name from backend (add join)
- Calculate grades from assigned sections
- Add visual indicators (colors, icons)
- Add validation tooltips

**Phase 3 (Polish - 30 min):**
- Add "Incomplete Draft" badge if missing data
- Add hover tooltips explaining "Not Set"
- Add quick-edit links to fill missing data

---

## 🎯 Quick Example

### Draft Quiz (No Data):
```
┌────────────────────────────────────────────────────┐
│ Untitled Quiz                                      │
│ Subject: [Not Set]  Grade: [Not Set]  Status: Draft│
│ ⚠️ Complete subject and sections before publishing │
└────────────────────────────────────────────────────┘
```

### Draft Quiz (Partial Data):
```
┌────────────────────────────────────────────────────┐
│ Math Quiz - Algebra                                │
│ Subject: Mathematics  Grade: Grade 10  Status: Draft│
│ ✅ Ready to publish                                 │
└────────────────────────────────────────────────────┘
```

### Published Quiz:
```
┌────────────────────────────────────────────────────┐
│ Math Quiz - Algebra                                │
│ Subject: Mathematics  Grade: Grade 10, 11  [LIVE]  │
│ 45 attempts • Avg: 85%                             │
└────────────────────────────────────────────────────┘
```

---

## 🚀 Next Steps

**If you approve Option A:**
1. I'll implement the "Not Set" fallbacks immediately
2. Then add logic to fetch grades from sections
3. Add visual polish and validation indicators

**Want me to proceed?** 🎯

---

**Created:** 2025-01-06
**Author:** Claude Code
**Recommendation:** ✅ Option A - Show Subject & Grade for ALL quiz types
