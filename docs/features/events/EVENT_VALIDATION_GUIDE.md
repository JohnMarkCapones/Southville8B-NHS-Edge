# Event Validation System Guide

## Overview

The Event Validation System provides comprehensive validation for event creation and editing in the Southville 8B NHS Edge portal. It prevents scheduling conflicts, enforces business rules, and guides users to create high-quality events.

## Validation Types

### 🚫 **Critical Validations** (Block Submission)

These validations prevent the event from being created and require the user to fix the issues before proceeding.

#### 1. Past Date Prevention
- **Rule**: Cannot create events for dates that have already passed
- **Example**: Today is Oct 25, 2025. User tries to create event for Oct 24, 2025 ❌
- **Message**: "Cannot create event in the past"
- **Details**: Shows how many days in the past the selected date is

#### 2. Same Date & Time Conflict (GRAVE ERROR)
- **Rule**: Cannot create multiple events with the exact same date and time
- **Example**: Event A at Oct 30, 2025 2:00 PM exists. User tries to create Event B at Oct 30, 2025 2:00 PM ❌
- **Message**: "CRITICAL: Event with same date and time already exists"
- **Details**: Shows the conflicting event name and exact time
- **Why Critical**: Impossible to have two events at exactly the same time - creates scheduling chaos

#### 3. Description Too Long
- **Rule**: Description cannot exceed 5000 characters
- **Message**: "Description is too long"
- **Details**: Shows current length and maximum allowed

---

### ⚠️ **Warning Validations** (Show Warning, Allow Override)

These validations show warnings but allow the user to proceed after reviewing the potential issues.

#### 1. Same Date Warning
- **Rule**: Warn when creating events on the same date (but different times)
- **Example**: Event A at Oct 30, 2025 2:00 PM exists. User creates Event B at Oct 30, 2025 5:00 PM ⚠️
- **Message**: "X other event(s) scheduled on this date"
- **Details**: Lists all events scheduled for that day
- **Can Proceed**: Yes, after reviewing
- **Why Warning**: Multiple events per day are allowed but should be reviewed for conflicts

#### 2. Minimum Lead Time
- **Rule**: Events should be created at least 2 hours in advance
- **Example**: Current time is 1:00 PM. User tries to create event for 2:30 PM same day ⚠️
- **Message**: "Events should be created at least 2 hours in advance"
- **Details**: Shows how many hours until the event
- **Can Proceed**: Yes (for urgent events)

#### 3. Venue Conflicts
- **Rule**: Same venue booked within 2-hour window
- **Example**: "Main Auditorium" booked for 2:00 PM. User tries to book same venue for 3:00 PM ⚠️
- **Message**: "Potential venue conflict detected"
- **Details**: Shows conflicting event and venue
- **Can Proceed**: Yes (user may have confirmed availability)

#### 4. Close Time Proximity
- **Rule**: Events within 2 hours of each other on same day
- **Example**: Event A ends at 3:00 PM. Event B starts at 3:30 PM ⚠️
- **Message**: "Events scheduled close together"
- **Details**: Shows time difference and adjacent event
- **Can Proceed**: Yes
- **Why Warning**: Ensures adequate time for setup/cleanup/transitions

#### 5. Duplicate Event Title
- **Rule**: Similar event title already exists
- **Example**: "Science Fair 2025" exists. User creates "Science Fair 2025" ⚠️
- **Message**: "Similar event title detected"
- **Details**: Shows existing event with similar name
- **Can Proceed**: Yes (may be intentional - recurring events)

#### 6. Description Too Short
- **Rule**: Description should be at least 50 characters
- **Message**: "Description is too short"
- **Details**: Shows current length and recommended minimum
- **Can Proceed**: Yes
- **Why Warning**: Encourages comprehensive event information

---

## Validation Flow

```
┌─────────────────────────────────┐
│  User Clicks "Create Event"     │
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│  Basic Form Validation          │
│  (Required fields, formats)     │
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│  Event Validation System        │
│  (Date/Time/Venue conflicts)    │
└───────────┬─────────────────────┘
            │
            ├─── Has Errors? ────────┐
            │                         ▼
            │              ┌──────────────────────┐
            │              │  🚫 ERROR MODAL      │
            │              │  Red border          │
            │              │  "Cannot Create"     │
            │              │  Only: "Go Back"     │
            │              └──────────────────────┘
            │
            ├─── Has Warnings? ──────┐
            │                         ▼
            │              ┌──────────────────────┐
            │              │  ⚠️ WARNING MODAL    │
            │              │  Amber border        │
            │              │  "Potential Issues"  │
            │              │  "Cancel" or         │
            │              │  "Proceed Anyway"    │
            │              └──────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│  Confirmation Modal             │
│  (Review before creating)       │
└─────────────────────────────────┘
```

## Validation Configuration

The validation system is configurable. See `app/superadmin/events/create/page.tsx`:

```typescript
const validations = validateEvent(
  eventData,
  existingEvents,
  {
    allowPastDates: false,              // Block past dates
    minimumLeadTimeHours: 2,            // Warn if < 2 hours notice
    allowSameDateEvents: true,          // Allow but warn
    allowSameDateTimeEvents: false,     // Block same date & time
    checkVenueConflicts: true,          // Check venue availability
    warnOnWeekends: false,              // Don't warn (schools have weekend events)
    warnOnCloseProximity: true,         // Warn if events close together
    proximityThresholdHours: 2          // 2-hour proximity threshold
  },
  eventId
)
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `allowPastDates` | boolean | false | Allow creating events in the past |
| `minimumLeadTimeHours` | number | 2 | Minimum hours before event starts |
| `allowSameDateEvents` | boolean | true | Allow multiple events on same date |
| `allowSameDateTimeEvents` | boolean | false | Allow events at exact same time |
| `checkVenueConflicts` | boolean | true | Check for venue double-booking |
| `warnOnWeekends` | boolean | false | Warn when creating weekend events |
| `warnOnCloseProximity` | boolean | true | Warn when events are close together |
| `proximityThresholdHours` | number | 2 | Hours considered "close proximity" |

## Modal UI

### Error Modal (Red)
- **Border**: Red
- **Icon**: 🚫 XCircle
- **Title**: "Cannot Create Event"
- **Description**: "Please fix the following errors before proceeding"
- **Buttons**: Only "Go Back and Fix Errors"

### Warning Modal (Amber)
- **Border**: Amber/Yellow
- **Icon**: ⚠️ AlertTriangle
- **Title**: "Warning: Potential Conflicts"
- **Description**: "Please review the following warnings before proceeding"
- **Buttons**: "Cancel" and "Proceed Anyway"

### Validation Item Display
Each validation shows:
1. Numbered badge
2. Validation message (bold)
3. Detailed explanation
4. Conflicting events (if applicable) with:
   - Event title
   - Date and time
   - Location

## Examples

### Example 1: Past Date Error

**Scenario**: Today is October 25, 2025. User tries to create event for October 24, 2025.

**Modal Display**:
```
🚫 Cannot Create Event
Please fix the following errors before proceeding

────────────────────────────────────────
Critical Errors (1)

[1] Cannot create event in the past
    This event date is 1 day in the past. Please select
    a future date.

────────────────────────────────────────
[Go Back and Fix Errors]
```

### Example 2: Same Date & Time Conflict

**Scenario**: "Science Fair 2025" exists at Oct 30, 2025 2:00 PM. User tries to create "Math Competition" at same date and time.

**Modal Display**:
```
🚫 Cannot Create Event
Please fix the following errors before proceeding

────────────────────────────────────────
Critical Errors (1)

[1] CRITICAL: Event with same date and time already exists
    Another event "Science Fair 2025" is scheduled for
    exactly Wednesday, October 30, 2025 at 2:00 PM.
    You cannot create events with identical date and time.

    Conflicting Events:
    📅 Science Fair 2025
       🕐 Oct 30, 2025 at 14:00 | 📍 Main Auditorium

────────────────────────────────────────
[Go Back and Fix Errors]
```

### Example 3: Same Date Warning (Different Times)

**Scenario**: "Science Fair 2025" at Oct 30 2:00 PM exists. User creates "Math Competition" at Oct 30 5:00 PM.

**Modal Display**:
```
⚠️ Warning: Potential Conflicts
Please review the following warnings before proceeding

────────────────────────────────────────
Warnings (1)

[1] 1 other event scheduled on this date
    There is 1 event already scheduled for Wednesday,
    October 30, 2025. Please verify there are no conflicts.

    Conflicting Events:
    📅 Science Fair 2025
       🕐 Oct 30, 2025 at 14:00 | 📍 Main Auditorium

────────────────────────────────────────
[Cancel]  [Proceed Anyway]
```

### Example 4: Multiple Warnings

**Scenario**: Event created with short description, on same date as another event, and only 1.5 hours in advance.

**Modal Display**:
```
⚠️ Warning: Potential Conflicts
Please review the following warnings before proceeding

────────────────────────────────────────
Warnings (3)

[1] Events should be created at least 2 hours in advance
    This event is only 1.5 hours away. Consider scheduling
    events with more notice.

[2] 2 other events scheduled on this date
    There are 2 events already scheduled for Wednesday,
    October 30, 2025. Please verify there are no conflicts.

    Conflicting Events:
    📅 Science Fair 2025
       🕐 Oct 30, 2025 at 14:00 | 📍 Main Auditorium
    📅 Basketball Championship
       🕐 Oct 30, 2025 at 18:00 | 📍 School Gym

[3] Description is too short
    Event description should be at least 50 characters to
    provide adequate information. Current length: 35 characters.

────────────────────────────────────────
[Cancel]  [Proceed Anyway]
```

## Files Changed

### New Files Created
1. **`frontend-nextjs/lib/utils/event-validations.ts`**
   - Core validation logic
   - All validation functions
   - Helper utilities

2. **`frontend-nextjs/components/events/event-validation-modal.tsx`**
   - Modal component for displaying validations
   - Error and warning UI
   - Conflicting events display

### Modified Files
1. **`frontend-nextjs/app/superadmin/events/create/page.tsx`**
   - Added validation imports
   - Added validation state
   - Modified handleSubmit to run validations
   - Added EventValidationModal component

2. **`frontend-nextjs/lib/api/types/events.ts`**
   - Already had necessary types

## Usage in Other Pages

To add validation to other event forms:

```typescript
import { validateEvent, type ValidationResult } from '@/lib/utils/event-validations'
import { EventValidationModal } from '@/components/events/event-validation-modal'

// In component:
const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
const [showValidationModal, setShowValidationModal] = useState(false)

// Before submitting:
const validations = validateEvent(eventData, existingEvents, options)
const failedValidations = validations.filter(v => !v.isValid)

if (failedValidations.length > 0) {
  setValidationResults(failedValidations)
  setShowValidationModal(true)
  return
}

// In JSX:
<EventValidationModal
  isOpen={showValidationModal}
  onClose={() => setShowValidationModal(false)}
  onProceed={handleProceed}
  validationResults={validationResults}
/>
```

## Customization

### Add New Validation

1. **Create validation function** in `lib/utils/event-validations.ts`:

```typescript
export function validateNewRule(
  eventData: EventData,
  existingEvents: Event[]
): ValidationResult {
  // Your validation logic

  if (failsValidation) {
    return {
      isValid: false,
      severity: ValidationSeverity.WARNING, // or ERROR
      message: "Short message",
      details: "Detailed explanation"
    }
  }

  return {
    isValid: true,
    severity: ValidationSeverity.INFO,
    message: "Validation passed"
  }
}
```

2. **Add to `validateEvent` function**:

```typescript
export function validateEvent(...) {
  const results: ValidationResult[] = []

  // Existing validations...

  // Add your new validation
  results.push(validateNewRule(eventData, existingEvents))

  return results
}
```

### Modify Validation Options

Change the configuration in `handleSubmit`:

```typescript
const validations = validateEvent(
  eventData,
  existingEvents,
  {
    // Modify these values:
    minimumLeadTimeHours: 24,          // Require 24 hours notice
    warnOnWeekends: true,              // Warn on weekend events
    proximityThresholdHours: 3         // 3-hour proximity
  },
  eventId
)
```

## Testing Scenarios

### Test Case 1: Past Date
1. Set date to yesterday
2. Try to create event
3. Should show error modal with "Cannot create event in the past"

### Test Case 2: Same Date & Time
1. Create Event A at Oct 30 2:00 PM
2. Try to create Event B at Oct 30 2:00 PM
3. Should show error modal with "CRITICAL: Event with same date and time already exists"

### Test Case 3: Same Date, Different Time
1. Create Event A at Oct 30 2:00 PM
2. Try to create Event B at Oct 30 5:00 PM
3. Should show warning modal listing Event A
4. Should allow proceeding

### Test Case 4: Short Description
1. Enter description with less than 50 characters
2. Should show warning about short description
3. Should allow proceeding

### Test Case 5: Multiple Warnings
1. Create event with:
   - Same date as existing event
   - Short description
   - Less than 2 hours notice
2. Should show warning modal with all 3 warnings listed
3. Should allow proceeding

## Best Practices

1. **Always validate before submission** - Don't skip validations
2. **Show clear error messages** - Users need to understand what's wrong
3. **Provide actionable feedback** - Tell users how to fix issues
4. **Allow override for warnings** - Users may have valid reasons
5. **Never allow override for errors** - Critical issues must be fixed
6. **Log validation results** - Helps debugging and analytics
7. **Test edge cases** - Midnight events, date boundaries, etc.

## Future Enhancements

Potential additions to the validation system:

1. **Event Capacity Validation**
   - Warn if expected attendance exceeds venue capacity

2. **Holiday Detection**
   - Warn when creating events on public holidays

3. **Teacher/Staff Availability**
   - Check if required staff are available

4. **Resource Conflicts**
   - Validate equipment/room availability

5. **Budget Validation**
   - Warn if event cost exceeds budget

6. **Recurring Event Validation**
   - Special validation for recurring event series

7. **External Calendar Integration**
   - Check against external calendars (Google, Outlook)

8. **Smart Suggestions**
   - Suggest alternative dates/times when conflicts detected

## Support

For questions or issues with the validation system:
- Check console logs for detailed validation results
- Review validation configuration options
- Test with different scenarios
- Check existing events in database

---

**Last Updated**: October 25, 2025
**Version**: 1.0
**Author**: Event Management Team
