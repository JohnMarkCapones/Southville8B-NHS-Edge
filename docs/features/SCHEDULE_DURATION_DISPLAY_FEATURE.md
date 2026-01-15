# Event Schedule Duration Display Feature

## Summary
Added visual indicators showing time elapsed from the start of the event for each schedule item, making it easier to plan and visualize event timelines.

## What It Does

Shows users how much time has passed from the first schedule item (event start) for every subsequent item.

## Visual Display Examples

### Schedule Item #1 (First item)
```
Time: 9:00 AM
⏱️ Event starts  ← Blue indicator
Description: Registration
```

### Schedule Item #2
```
Time: 10:30 AM
Must be after 9:00 AM  ← Gray helper text
📍 1h 30m from start  ← Green duration indicator
Description: Opening ceremony
```

### Schedule Item #3
```
Time: 2:00 PM
Must be after 10:30 AM
📍 5h 0m from start  ← Shows total time since start
Description: Main event
```

### Schedule Item #4
```
Time: 2:45 PM
Must be after 2:00 PM
📍 5h 45m from start
Description: Awards ceremony
```

## Complete Example Timeline

```
⏱️ 9:00 AM - Event starts
   📍 Registration opens

⏰ 10:30 AM - 1h 30m from start
   📍 Opening ceremony

⏰ 12:00 PM - 3h 0m from start
   📍 Lunch break

⏰ 1:00 PM - 4h 0m from start
   📍 Workshop sessions

⏰ 3:30 PM - 6h 30m from start
   📍 Closing ceremony
```

## Duration Format

The system intelligently formats durations:

- **Just minutes**: `45m`
- **Just hours**: `2h`
- **Hours and minutes**: `2h 30m`, `1h 45m`, etc.

### Examples:
- 9:00 AM → 9:15 AM = `15m`
- 9:00 AM → 10:00 AM = `1h`
- 9:00 AM → 11:30 AM = `2h 30m`
- 9:00 AM → 5:45 PM = `8h 45m`

## Color Coding

🔵 **Blue** - "Event starts" (first item)
⚫ **Gray** - "Must be after" constraint
🟢 **Green** - Duration from start

## Benefits

### 1. **Easy Event Planning**
See at a glance how long your event runs:
- "Oh, this is a 6-hour event"
- "The main activity starts 2 hours in"

### 2. **Better Pacing**
Identify if activities are too close or too far apart:
- First item: 9:00 AM
- Second item: 4:30 PM (📍 7h 30m from start) ← Might be too long!

### 3. **Realistic Scheduling**
Helps organizers plan realistically:
- Registration: 9:00 AM
- Lunch: 12:00 PM (📍 3h from start) ✓ Good timing
- Finals: 1:00 PM (📍 4h from start) ✓ Makes sense

### 4. **Professional Look**
Shows attention to detail and careful planning

## User Experience

### As User Types:

1. **Adds first item at 9:00 AM**
   - Shows: ⏱️ Event starts

2. **Adds second item at 10:30 AM**
   - Automatically calculates: 📍 1h 30m from start
   - Updates in real-time

3. **Changes first item to 8:00 AM**
   - All durations automatically recalculate
   - Second item now shows: 📍 2h 30m from start

4. **Adds third item at 2:00 PM**
   - Shows: 📍 6h 0m from start (from new start time)

Everything updates dynamically! ⚡

## Technical Implementation

### Duration Calculation Function:
```typescript
const calculateDuration = (startTime: string, endTime: string): string => {
  // Convert HH:MM to total minutes
  const startMinutes = hours * 60 + minutes
  const endMinutes = hours * 60 + minutes

  // Calculate difference
  const diffMinutes = endMinutes - startMinutes

  // Format: "2h 30m", "45m", or "3h"
  return formatDuration(diffMinutes)
}
```

### Display Logic:
```typescript
// First item (index 0)
if (index === 0 && item.time) {
  show "⏱️ Event starts"
}

// Subsequent items
if (index > 0 && item.time && firstItem.time) {
  const duration = calculateDuration(firstItem.time, item.time)
  show "📍 {duration} from start"
}
```

## Edge Cases Handled

✅ **First item has no duration** - Shows "Event starts" instead
✅ **Empty times** - Duration not shown until time is entered
✅ **Invalid order** - Duration still calculates (shows red error separately)
✅ **Single item** - Only shows "Event starts", no duration needed
✅ **Real-time updates** - Changes to first item recalculate all durations

## Complete Schedule Display Example

```
📋 Basketball Tournament Schedule

Item #1
Time: 9:00 AM
⏱️ Event starts
Description: Registration and team check-in

Item #2
Time: 9:30 AM
Must be after 9:00 AM
📍 30m from start
Description: Opening ceremony and rules briefing

Item #3
Time: 10:00 AM
Must be after 9:30 AM
📍 1h 0m from start
Description: First round matches begin

Item #4
Time: 12:00 PM
Must be after 10:00 AM
📍 3h 0m from start
Description: Lunch break

Item #5
Time: 1:00 PM
Must be after 12:00 PM
📍 4h 0m from start
Description: Semi-finals

Item #6
Time: 3:00 PM
Must be after 1:00 PM
📍 6h 0m from start
Description: Finals

Item #7
Time: 4:30 PM
Must be after 3:00 PM
📍 7h 30m from start
Description: Awards ceremony

Total event duration: 7.5 hours ✓
```

## Combined Features

This works together with:
1. ✅ AM/PM time display
2. ✅ Chronological order validation
3. ✅ "Must be after" constraints
4. ✅ Real-time validation

## Files Modified

- `frontend-nextjs/app/teacher/clubs/[id]/events/create/page.tsx`
  - Added `calculateDuration()` function
  - Added duration display in schedule section
  - Added "Event starts" indicator for first item

## Result

Users can now:
- ✅ See how long their event runs
- ✅ Understand timing between activities
- ✅ Plan better event schedules
- ✅ Spot timing issues at a glance

The schedule section is now much more informative and professional! 🎯
