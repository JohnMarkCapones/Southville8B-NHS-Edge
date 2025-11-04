<!-- 8768b209-7dfc-44d5-8860-8d86ffd41fff bf7cb3b7-8ac9-48ff-baa4-4d1127429aad -->
# Fix SectionDto JSON Property Mapping

## Problem

The code logs `"Found 0 sections for teacher b4c3204d-1f85-4256-9b9d-cdbc9f768527"` even though the API response contains 2 sections with that `teacher_id`.

## Root Cause

In `SectionDto.cs`:

- Line 17: `[JsonPropertyName("teacherId")]` - expects camelCase
- Line 14: `[JsonPropertyName("gradeLevel")]` - expects camelCase

But the API returns snake_case:

- `"teacher_id": "b4c3204d-1f85-4256-9b9d-cdbc9f768527"`
- `"grade_level": "Grade 10"`

This causes JSON deserialization to set `TeacherId` to `null`, so the filter `Where(s => !string.IsNullOrEmpty(s.TeacherId))` excludes all sections.

## Solution

Update `JsonPropertyName` attributes in `SectionDto.cs` to match the API's snake_case format.

**File**: `desktop-app/Southville8BEdgeUI/Models/Api/SectionDto.cs`

**Changes**:

Line 14:

```csharp
// OLD:
[JsonPropertyName("gradeLevel")]

// NEW:
[JsonPropertyName("grade_level")]
```

Line 17:

```csharp
// OLD:
[JsonPropertyName("teacherId")]

// NEW:
[JsonPropertyName("teacher_id")]
```

Also check and fix other properties if needed (roomId, buildingId, etc.).

## Expected Result

After the fix:

- `TeacherId` will deserialize correctly from `teacher_id`
- The filter will find 2 sections
- Total Students will be calculated from those 2 sections (~10 students)

### To-dos

- [ ] Update NavigateToMyAnnouncements in TeacherShellViewModel to pass _userId