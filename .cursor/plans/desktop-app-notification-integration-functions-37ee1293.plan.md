<!-- 37ee1293-3641-4f67-85bb-664961550bb8 57263661-d620-41fd-b8e2-edcf232adfae -->
# Student Notifications Frontend Implementation Plan

## Overview

Integrate the backend notification system into the frontend-nextjs student interface. Replace mock data with real API calls and create a comprehensive notification system that displays all student notifications based on the implemented activity monitoring.

## Implementation Steps

### 1. Create Notifications API Endpoint

**File:** `frontend-nextjs/lib/api/endpoints/notifications.ts`

- Create API functions for:
- `getMyNotifications(params?)` - Fetch student's notifications with pagination
- `markNotificationAsRead(id)` - Mark single notification as read
- `markAllNotificationsAsRead()` - Mark all as read
- `deleteNotification(id)` - Delete a notification
- `getUnreadNotificationCount()` - Get unread count
- Use `apiClient` from `lib/api/client.ts`
- Follow the pattern from `announcements.ts` endpoint file
- Define TypeScript interfaces matching backend response (snake_case)

### 2. Create Notification Types

**File:** `frontend-nextjs/lib/api/types/notifications.ts`

- Define `Notification` interface matching backend response
- Define `NotificationListResponse` interface
- Define query parameter types for filtering
- Map backend types to frontend types (snake_case → camelCase if needed)

### 3. Create Notifications Hook

**File:** `frontend-nextjs/hooks/useNotifications.ts`

- Create `useNotifications` hook similar to mobile app pattern
- Manage state: notifications, loading, error, unreadCount
- Implement functions: markAsRead, markAllAsRead, deleteNotification, refresh
- Auto-fetch on mount
- Handle pagination if needed

### 4. Update Notification System Component

**File:** `frontend-nextjs/components/header/notification-system.tsx`

- Replace mock data with `useNotifications` hook
- Update notification type mapping to match backend types
- Add proper error handling and loading states
- Integrate with real API calls
- Maintain existing UI/UX design

### 5. Integrate into Student Header

**File:** `frontend-nextjs/components/student/student-header.tsx`

- Replace mock notifications with real data from `useNotifications` hook
- Update notification click handlers to use real API calls
- Add unread count badge from hook
- Maintain existing UI design

### 6. Create Student Notifications Page (Optional)

**File:** `frontend-nextjs/app/student/notifications/page.tsx`

- Create dedicated notifications page for students
- Display all notifications with filtering by category
- Show unread/read status
- Allow bulk actions (mark all read, delete all)
- Add pagination for large notification lists
- Use same design patterns as other student pages

### 7. Add Notification Badge to Student Layout

**File:** `frontend-nextjs/components/student/student-layout.tsx`

- Add notification count indicator in header/sidebar
- Show unread count from `useNotifications` hook
- Link to notifications page

### 8. Update API Endpoints Index

**File:** `frontend-nextjs/lib/api/endpoints/index.ts`

- Export all notification functions
- Export notification types

## Technical Details

### API Endpoints to Use

- `GET /notifications/my?page=1&limit=50` - Fetch notifications
- `PATCH /notifications/{id}/read` - Mark as read
- `POST /notifications/mark-all-read` - Mark all as read
- `DELETE /notifications/{id}` - Delete notification
- `GET /notifications/unread-count` - Get unread count

### Notification Type Mapping

Backend types: `'info' | 'warning' | 'success' | 'error' | 'system'`
Frontend display: Map to appropriate UI colors and icons

### Notification Categories

- `ACADEMIC` - Quiz, schedule, grades
- `COMMUNICATION` - Club applications, news articles
- `EVENT_ANNOUNCEMENT` - Events and announcements
- `USER_ACCOUNT` - Account management

### Priority Implementation Order

1. API endpoint and types (foundation)
2. Hook (data layer)
3. Update existing components (quick win)
4. Optional notifications page (enhancement)

## Files to Create/Modify

### New Files

- `frontend-nextjs/lib/api/endpoints/notifications.ts`
- `frontend-nextjs/lib/api/types/notifications.ts`
- `frontend-nextjs/hooks/useNotifications.ts`
- `frontend-nextjs/app/student/notifications/page.tsx` (optional)

### Files to Modify

- `frontend-nextjs/components/header/notification-system.tsx`
- `frontend-nextjs/components/student/student-header.tsx`
- `frontend-nextjs/lib/api/endpoints/index.ts`
- `frontend-nextjs/components/student/student-layout.tsx` (optional)

## Testing Checklist

- [ ] Notifications fetch correctly from API
- [ ] Unread count displays accurately
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Delete notification works
- [ ] Error handling works (API failures)
- [ ] Loading states display correctly
- [ ] Empty state shows when no notifications
- [ ] Notification types display with correct colors/icons
- [ ] Categories filter correctly (if implemented)

### To-dos

- [ ] Replace notifyAll() in events.service.ts with user-specific notifications based on event visibility/targeting
- [ ] Replace notifyAll() in announcements.service.ts with user-specific notifications using targetRoleIds and sectionIds
- [ ] Add helper methods to NotificationService for notifying users by role/section
- [ ] Create ActivityMonitoringService with handlers for all user actions (create/update/delete)
- [ ] Create ActivityMonitoringModule and register it in app.module.ts
- [ ] Add activity monitoring hooks to users.service.ts (create/update/delete)
- [ ] Add activity monitoring hooks to schedules.service.ts
- [ ] Add activity monitoring hooks to quiz.service.ts and quiz-attempts.service.ts
- [ ] Add activity monitoring hooks to clubs.service.ts and club-memberships.service.ts
- [ ] Add activity monitoring hooks to news-approval.service.ts
- [ ] Add activity monitoring hooks to gwa.service.ts