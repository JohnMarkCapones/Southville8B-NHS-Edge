# Academic Calendar API Integration Guide

## Overview

This guide explains how to integrate the academic calendar UI with the existing Events API backend.

## ✅ Completed Steps

### 1. Database Setup ✅
**File**: `core-api-layer/southville-nhs-school-portal-api-layer/event_tags_calendar_categories_migration.sql`

Created tables:
- `event_tags` - Stores tag definitions
- `event_tag_associations` - Links events to tags

Predefined calendar category tags:
- School Holiday (red)
- Academic Event (green)
- School Event (blue)
- Professional Development (yellow)
- No Class Day (purple)
- Important Deadline (orange)

**Action Required**: Run this SQL migration in your Supabase database.

```sql
-- Run this file in Supabase SQL editor
\i event_tags_calendar_categories_migration.sql
```

### 2. Frontend API Client ✅
**File**: `frontend-nextjs/lib/api/endpoints/events.ts`

Added calendar-specific functions:
- `getEventsForMonth(year, month)` - Get all events for a specific month
- `getEventsForDate(date)` - Get events for a specific date
- `mapCategoryToTagName(category)` - Convert UI category to tag name
- `mapTagNameToCategory(tagName)` - Convert tag name to UI category
- `getCalendarCategory(event)` - Extract calendar category from event
- `getCalendarCategoryStyle(category)` - Get colors/styles for category

### 3. Custom Hook ✅
**File**: `frontend-nextjs/hooks/useAcademicCalendar.ts`

Hook provides:
- Month navigation (previous, next, go to today)
- Event loading with automatic refetch on month change
- CRUD operations (create, update, delete, duplicate)
- Category filtering
- Loading and error states
- Toast notifications

## 🚧 Next Steps: Update the Academic Calendar Page

### Current State
The academic calendar page (`frontend-nextjs/app/superadmin/academic-calendar/page.tsx`) currently uses mock data.

### Integration Steps

#### Step 1: Import the Hook and API Functions

At the top of the page component:

```typescript
import { useAcademicCalendar } from '@/hooks/useAcademicCalendar';
import { getCalendarCategoryStyle } from '@/lib/api/endpoints/events';
import { useSession } from 'next-auth/react'; // For getting user ID
```

#### Step 2: Replace State with Hook

Remove these lines:
```typescript
const [events, setEvents] = useState(mockCalendarEvents);
const [currentDate, setCurrentDate] = useState(new Date());
```

Replace with:
```typescript
const { data: session } = useSession();
const {
  year,
  month,
  events,
  loading,
  error,
  previousMonth,
  nextMonth,
  goToToday,
  getEventsForDate,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  duplicateCalendarEvent,
  filterByCategory,
} = useAcademicCalendar();
```

#### Step 3: Update Month Navigation

Replace:
```typescript
const previousMonth = () => {
  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
};

const nextMonth = () => {
  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
};

const goToToday = () => {
  setCurrentDate(new Date());
};
```

These functions are now provided by the hook!

#### Step 4: Update getDaysInMonth

Replace:
```typescript
const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  // ...
```

With:
```typescript
const getDaysInMonth = () => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  return { daysInMonth, startingDayOfWeek, year, month: month - 1 };
};
```

#### Step 5: Update getEventsForDate

Replace:
```typescript
const getEventsForDate = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0];
  return events.filter((event) => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const checkDate = new Date(dateStr);
    return checkDate >= eventStart && checkDate <= eventEnd;
  });
};
```

With:
```typescript
// Use the hook's getEventsForDate function directly!
// It's already available from the hook
```

#### Step 6: Update handleAddEvent

Replace:
```typescript
const handleAddEvent = () => {
  if (!validateForm()) {
    toast({
      title: "Validation Error",
      description: "Please fill in all required fields",
      variant: "destructive",
    });
    return;
  }

  const newEvent = {
    id: `${Date.now()}`,
    ...formData,
    isMultiDay: formData.startDate !== formData.endDate,
    highlights: highlights.filter((h) => h.text.trim()).map((h) => h.text),
    schedule: schedule.filter((s) => s.time && s.title.trim()),
    faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
    additionalInfo: additionalInfo.filter((a) => a.text.trim()).map((a) => a.text),
  };

  setEvents((prev) => [...prev, newEvent]);
  // ...
};
```

With:
```typescript
const handleAddEvent = async () => {
  if (!validateForm()) {
    toast({
      title: "Validation Error",
      description: "Please fill in all required fields",
      variant: "destructive",
    });
    return;
  }

  if (!session?.user?.id) {
    toast({
      title: "Authentication Error",
      description: "You must be logged in to create events",
      variant: "destructive",
    });
    return;
  }

  try {
    await createCalendarEvent({
      title: formData.title,
      description: formData.description,
      category: formData.category as any,
      date: formData.startDate,
      time: "09:00", // Default time or add time picker to form
      location: formData.location,
      notes: formData.notes,
      highlights: highlights.filter((h) => h.text.trim()).map((h) => h.text),
      schedule: schedule.filter((s) => s.time && s.title.trim()),
      faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
      additionalInfo: additionalInfo.filter((a) => a.text.trim()).map((a) => a.text),
      organizerId: session.user.id,
    });

    setAddEventModal(false);
    resetForm();
  } catch (error) {
    // Error already handled by hook with toast
    console.error('Failed to create event:', error);
  }
};
```

#### Step 7: Update handleEditEvent

Replace the mock update with:
```typescript
const handleEditEvent = async () => {
  if (!formData.title || !formData.startDate || !formData.endDate) {
    toast({
      title: "Validation Error",
      description: "Please fill in all required fields",
      variant: "destructive",
    });
    return;
  }

  try {
    await updateCalendarEvent(editEventModal.event.id, {
      title: formData.title,
      description: formData.description,
      date: formData.startDate,
      location: formData.location,
      notes: formData.notes,
    });

    setEditEventModal({ isOpen: false, event: null });
    resetForm();
  } catch (error) {
    console.error('Failed to update event:', error);
  }
};
```

#### Step 8: Update confirmDeleteEvent

Replace:
```typescript
const confirmDeleteEvent = () => {
  if (deleteConfirmation.event) {
    setEvents((prev) => prev.filter((e) => e.id !== deleteConfirmation.event.id));
    // ...
  }
};
```

With:
```typescript
const confirmDeleteEvent = async () => {
  if (deleteConfirmation.event) {
    try {
      await deleteCalendarEvent(deleteConfirmation.event.id);
      setDeleteConfirmation({ isOpen: false, event: null });
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  }
};
```

#### Step 9: Update handleDuplicateEvent

Replace:
```typescript
const handleDuplicateEvent = (event: any) => {
  const newEvent = {
    ...event,
    id: `${Date.now()}`,
    title: `${event.title} (Copy)`,
  };

  setEvents((prev) => [...prev, newEvent]);
  // ...
};
```

With:
```typescript
const handleDuplicateEvent = async (event: any) => {
  try {
    await duplicateCalendarEvent(event);
    closeContextMenu();
  } catch (error) {
    console.error('Failed to duplicate event:', error);
  }
};
```

#### Step 10: Update Category Filtering

The existing `selectedCategory` state and `filteredEvents` logic can use the hook's `filterByCategory` function:

```typescript
const filteredEvents = filterByCategory(selectedCategory);
```

#### Step 11: Update Month Display

Replace:
```typescript
{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
```

With:
```typescript
{new Date(year, month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
```

#### Step 12: Add Loading State

Add a loading spinner while events are being fetched:

```typescript
{loading && (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
)}
```

## Data Mapping

### Mock Event Format → API Event Format

| Mock Field | API Field | Notes |
|------------|-----------|-------|
| `id` | `id` | UUID from backend |
| `title` | `title` | Direct mapping |
| `description` | `description` | Direct mapping |
| `category` | Extract from `tags` | Use `getCalendarCategory(event)` |
| `startDate` | `date` | YYYY-MM-DD format |
| `endDate` | Not used | Events are single-day for now |
| `location` | `location` | Direct mapping |
| `notes` | Not directly stored | Can be part of description |
| `highlights` | `highlights[]` | Array of `{title, content}` |
| `schedule` | `schedule[]` | Array of `{activityTime, activityDescription}` |
| `faqs` | `faq[]` | Array of `{question, answer}` |
| `additionalInfo` | `additionalInfo[]` | Array of `{title, content}` |

### Category Colors

The `getCalendarCategoryStyle()` function returns the exact same colors used in the UI mock!

## Testing Checklist

- [ ] Run SQL migration in Supabase
- [ ] Create a test event from the calendar UI
- [ ] Edit the event
- [ ] Delete the event
- [ ] Duplicate an event
- [ ] Navigate months (previous, next, today)
- [ ] Filter by category
- [ ] Verify colors match for each category
- [ ] Check that highlights, schedule, FAQs display correctly
- [ ] Test on mobile/responsive view

## Troubleshooting

### Events not loading
- Check browser console for API errors
- Verify backend is running on http://localhost:3004
- Check Supabase connection
- Ensure JWT token is valid

### Events showing in wrong category
- Verify tags were created correctly in database
- Check `getCalendarCategory()` function
- Ensure tag names match exactly: "School Holiday", "Academic Event", etc.

### Create event fails
- Check user is authenticated
- Verify organizerId is valid user UUID
- Check backend logs for validation errors

## Future Enhancements

1. **Multi-day Events**: Extend events to span multiple days (would need end_date field)
2. **Recurring Events**: Add recurrence patterns (daily, weekly, monthly)
3. **Event Permissions**: Add RLS policies for viewing/editing based on roles
4. **Event Attachments**: Allow file uploads for events
5. **Event RSVP**: Track attendance and RSVPs
6. **Calendar Export**: Export to iCal format
7. **Email Notifications**: Send reminders for upcoming events

## API Endpoints Used

- `GET /events?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get events for date range
- `POST /events` - Create event
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `POST /events/:id/highlights` - Add highlight
- `POST /events/:id/schedule` - Add schedule item
- `POST /events/:id/faq` - Add FAQ
- `POST /events/:id/additional-info` - Add additional info

## Support

For questions or issues, check:
- Backend API docs: http://localhost:3004/api/docs
- Events controller: `core-api-layer/.../src/events/events.controller.ts`
- Events service: `core-api-layer/.../src/events/events.service.ts`
