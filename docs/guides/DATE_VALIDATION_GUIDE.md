# 📅 Date Validation System - Complete Guide

## ✅ What Was Added

**Backend validation** to prevent:
1. ❌ **Past dates** - Cannot create schedules for dates that have already passed
2. ❌ **End before start** - End date must be after start date
3. ✅ **Automatic validation** - Happens on every API request

**Frontend utilities** for consistent validation across forms.

---

## 🎯 Backend Validation (Automatic)

### Location
`core-api-layer/src/banner-notifications/dto/create-banner.dto.ts`

### Validators Added

#### 1. **IsNotPastDateConstraint** - Prevents Past Dates
```typescript
// Prevents creating banners with start dates in the past
@Validate(IsNotPastDateConstraint)
startDate: string;
```

**Examples:**
- ✅ Today's date → VALID
- ✅ Future date → VALID
- ❌ Yesterday → REJECTED with error: "Start date cannot be in the past"
- ❌ Last week → REJECTED

#### 2. **IsEndDateAfterStartDateConstraint** - Prevents Invalid Ranges
```typescript
// Ensures end date comes after start date
@Validate(IsEndDateAfterStartDateConstraint)
endDate: string;
```

**Examples:**
- ✅ Start: Jan 25, End: Jan 27 → VALID
- ✅ Start: Jan 25, End: Jan 26 → VALID
- ❌ Start: Jan 27, End: Jan 26 → REJECTED with error: "End date must be after start date"
- ❌ Start: Jan 25, End: Jan 24 → REJECTED

---

## 🧪 Testing the Validation

### Test Case 1: Past Start Date (Should FAIL)

```bash
curl -X POST http://localhost:3004/api/v1/banner-notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Test Banner",
    "shortMessage": "Test",
    "type": "info",
    "isActive": true,
    "isDismissible": true,
    "startDate": "2024-10-24T08:00:00Z",
    "endDate": "2024-10-26T18:00:00Z"
  }'
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": [
    "Start date cannot be in the past. Please select today or a future date."
  ],
  "error": "Bad Request"
}
```

### Test Case 2: End Date Before Start Date (Should FAIL)

```bash
curl -X POST http://localhost:3004/api/v1/banner-notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Test Banner",
    "shortMessage": "Test",
    "type": "info",
    "isActive": true,
    "isDismissible": true,
    "startDate": "2024-10-27T08:00:00Z",
    "endDate": "2024-10-26T18:00:00Z"
  }'
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": [
    "End date must be after start date. Please select a later date."
  ],
  "error": "Bad Request"
}
```

### Test Case 3: Valid Date Range (Should SUCCEED)

```bash
curl -X POST http://localhost:3004/api/v1/banner-notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Test Banner - Valid Dates",
    "shortMessage": "Test",
    "type": "success",
    "isActive": true,
    "isDismissible": true,
    "startDate": "2024-10-25T08:00:00Z",
    "endDate": "2024-10-27T18:00:00Z"
  }'
```

**Expected Response:**
```json
{
  "id": "uuid-here",
  "message": "Test Banner - Valid Dates",
  ...
}
```

---

## 💻 Frontend Validation Utilities

### Location
`frontend-nextjs/lib/utils/date-validation.ts`

### Available Functions

#### 1. `validateDateRange(startDate, endDate)`
Complete validation for date ranges.

```typescript
import { validateDateRange } from '@/lib/utils/date-validation'

const error = validateDateRange(startDate, endDate)
if (error) {
  console.error(error)
  // "Start date cannot be in the past"
  // OR "End date must be after start date"
}
```

#### 2. `isDateInPast(date)`
Check if a date is in the past.

```typescript
import { isDateInPast } from '@/lib/utils/date-validation'

if (isDateInPast('2024-10-24')) {
  console.log('This date has passed')
}
```

#### 3. `isEndDateAfterStartDate(startDate, endDate)`
Check if end date comes after start date.

```typescript
import { isEndDateAfterStartDate } from '@/lib/utils/date-validation'

if (!isEndDateAfterStartDate(start, end)) {
  console.log('End date must be after start date')
}
```

#### 4. `getMinDateTime()`
Get the minimum datetime for form inputs (now).

```typescript
import { getMinDateTime } from '@/lib/utils/date-validation'

<input
  type="datetime-local"
  min={getMinDateTime()} // Prevents selecting past dates
/>
```

---

## 📝 Frontend Form Example

### Using React Hook Form with Zod

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { validateDateRange } from '@/lib/utils/date-validation'

const bannerSchema = z.object({
  message: z.string().min(10),
  shortMessage: z.string().min(5),
  type: z.enum(['info', 'success', 'warning', 'destructive']),
  startDate: z.string(),
  endDate: z.string(),
}).refine((data) => {
  const error = validateDateRange(data.startDate, data.endDate)
  return !error
}, {
  message: 'Invalid date range',
  path: ['endDate'],
})

const form = useForm({
  resolver: zodResolver(bannerSchema)
})
```

### HTML Input with Min Date

```tsx
import { getMinDateTime } from '@/lib/utils/date-validation'

<input
  type="datetime-local"
  min={getMinDateTime()}
  onChange={(e) => {
    const error = validateDateRange(startDate, e.target.value)
    if (error) {
      setError(error)
    }
  }}
/>
```

---

## 🎯 Real-World Scenarios

### Scenario 1: Creating a Weather Alert
**Date:** October 25, 2025 (Today)

**User tries:**
- Start: October 24 → ❌ REJECTED (past date)
- End: October 26 → N/A (start rejected first)

**Fix:**
- Start: October 25 → ✅ VALID (today)
- End: October 26 → ✅ VALID (after start)

### Scenario 2: Event Announcement
**Date:** October 25, 2025

**User tries:**
- Start: October 27 → ✅ VALID (future)
- End: October 26 → ❌ REJECTED (before start)

**Fix:**
- Start: October 27 → ✅ VALID
- End: October 30 → ✅ VALID (after start)

### Scenario 3: One-Day Event
**Date:** October 25, 2025

**User tries:**
- Start: October 26 8:00 AM → ✅ VALID
- End: October 26 6:00 PM → ✅ VALID (same day, later time)

**Result:** ✅ SUCCESS - Banner active for one day

---

## 🔧 Validation Rules Summary

| Rule | Description | Example (Today = Oct 25) |
|------|-------------|--------------------------|
| **No Past Dates** | Start date ≥ Today | ✅ Oct 25, ✅ Oct 26, ❌ Oct 24 |
| **End After Start** | End date > Start date | Start: Oct 25, ✅ End: Oct 27, ❌ End: Oct 24 |
| **Same Day Valid** | Can start and end same day | Start: Oct 26 8:00 AM, ✅ End: Oct 26 6:00 PM |

---

## 🚨 Error Messages

### Backend Errors (HTTP 400)
```json
{
  "statusCode": 400,
  "message": [
    "Start date cannot be in the past. Please select today or a future date."
  ],
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 400,
  "message": [
    "End date must be after start date. Please select a later date."
  ],
  "error": "Bad Request"
}
```

### Frontend Errors
```typescript
// From validateDateRange()
"Start date cannot be in the past. Please select today or a future date."
"End date must be after start date. Please select a later date."
```

---

## ✅ Testing Checklist

- [ ] Try creating banner with yesterday's date → Should FAIL
- [ ] Try creating banner with end before start → Should FAIL
- [ ] Try creating banner with today's date → Should SUCCEED
- [ ] Try creating banner with future dates → Should SUCCEED
- [ ] Try creating banner with same-day start and end → Should SUCCEED (if end time > start time)

---

## 📚 Additional Utilities

Other helpful functions in `date-validation.ts`:

- `formatDateForInput(date)` - Format Date for input fields
- `getMinDate()` - Get minimum date (today) for date inputs
- `isDateWithinRange(date, maxYears)` - Check if date is not too far in future
- `calculateDuration(start, end)` - Get number of days between dates

---

## 🎯 Summary

✅ **Backend:** Automatic validation on all banner creation/update requests
✅ **Frontend:** Reusable validation utilities for forms
✅ **Consistent:** Same validation rules on both sides
✅ **User-Friendly:** Clear error messages guide users

**No more:**
- ❌ Banners scheduled for past dates
- ❌ End dates before start dates
- ❌ Confusing date validation errors

**Now you have:**
- ✅ Automatic date validation
- ✅ Clear error messages
- ✅ Frontend utilities for real-time validation
- ✅ Consistent validation across the app
