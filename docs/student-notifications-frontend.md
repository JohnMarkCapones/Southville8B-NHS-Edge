# Student Notifications - Frontend-NextJS Integration Guide

This document lists all important notifications that students receive in the frontend-nextjs application, organized by the pages they affect.

## Student Navigation Pages

### Dashboard

- `/student` - Main dashboard

### Academics Section

- `/student/courses` - My Subjects
- `/student/quiz` - Quiz Central
- `/student/schedule` - Class Schedule
- `/student/grades` - Grades
- `/student/calendar` - Academic Calendar

### Documents Section

- `/student/certificates` - Certificates

### Student Life Section

- `/student/clubs` - My Clubs
- `/student/clubs/applications` - My Applications
- `/student/clubs/discover` - Discover Clubs
- `/student/events` - School Events
- `/student/news` - School News

### Publisher Section

- `/student/publisher/journalist` - Journalist
- `/student/publisher` - My Articles
- `/student/publisher/create` - Write Article

### Tools Section

- `/student/notes` - Notes
- `/student/todo` - Todo List
- `/student/goals` - Goals
- `/student/pomodoro` - Pomodoro Timer
- `/student/settings` - Settings
- `/student/profile` - Profile

---

## Important Notifications for Students

### High Priority (Academic & Time-Sensitive)

#### 1. Quiz Notifications

**Pages:** `/student/quiz`, `/student` (dashboard)

**Notifications:**

- **New Quiz Published**

  - Trigger: When a quiz is published to student's section
  - Title: "New Quiz Published"
  - Message: "A new quiz has been published: {quizTitle}"
  - Type: INFO
  - Category: ACADEMIC
  - Source: `quiz.service.ts#publishQuiz` → `ActivityMonitoringService.handleQuizPublished`

- **Quiz Scheduled**

  - Trigger: When a quiz is scheduled for future availability
  - Title: "Quiz Scheduled: {quizTitle}"
  - Message: "A quiz '{quizTitle}' has been scheduled and will be available starting {startDate}."
  - Type: INFO
  - Category: ACADEMIC
  - Source: `quiz.service.ts#scheduleQuiz` → Direct notification

- **Quiz Assigned**
  - Trigger: When a quiz is explicitly assigned to student's section
  - Title: "Quiz Assigned: {quizTitle}"
  - Message: "A quiz '{quizTitle}' has been assigned to your section."
  - Type: INFO
  - Category: ACADEMIC
  - Source: `quiz.service.ts#assignQuizToSections` → Direct notification

---

#### 2. Class Schedule Notifications

**Pages:** `/student/schedule`, `/student/calendar`, `/student` (dashboard)

**Notifications:**

- **New Schedule Created**

  - Trigger: When a new class schedule is created for student's section
  - Title: "New Schedule Created"
  - Message: "A new class schedule has been created: {subjectName} - {dayOfWeek} {startTime}-{endTime}"
  - Type: INFO
  - Category: ACADEMIC
  - Source: `schedules.service.ts#create` → `ActivityMonitoringService.handleScheduleCreated`

- **Schedule Updated**

  - Trigger: When an existing schedule is updated
  - Title: "Schedule Updated"
  - Message: "A class schedule has been updated: {scheduleDetails}"
  - Type: INFO
  - Category: ACADEMIC
  - Source: `schedules.service.ts#update` → `ActivityMonitoringService.handleScheduleUpdated`

- **Schedule Deleted**
  - Trigger: When a schedule is deleted
  - Title: "Schedule Deleted"
  - Message: "A class schedule has been deleted: {scheduleDetails}"
  - Type: WARNING
  - Category: ACADEMIC
  - Source: `schedules.service.ts#remove` → `ActivityMonitoringService.handleScheduleDeleted`

---

#### 3. Grades & GWA Notifications

**Pages:** `/student/grades`, `/student` (dashboard)

**Notifications:**

- **Grade Entered**

  - Trigger: When a new grade/GWA is entered for the student
  - Title: "Grade Entered"
  - Message: "A new grade has been entered for {subject}: {grade}"
  - Type: INFO
  - Category: ACADEMIC
  - Source: `gwa.service.ts#createGwaEntry` → `ActivityMonitoringService.handleGradeEntered`

- **GWA Recorded**

  - Trigger: When GWA entry is created
  - Title: "GWA Recorded"
  - Message: "Your GWA for {gradingPeriod} {schoolYear} has been recorded. GWA: {gwa}, Honor Status: {honorStatus}"
  - Type: INFO
  - Category: ACADEMIC
  - Source: `gwa.service.ts#createGwaEntry` → Direct notification

- **GWA Updated**

  - Trigger: When GWA entry is updated
  - Title: "GWA Updated"
  - Message: "Your GWA for {gradingPeriod} {schoolYear} has been updated. {updatedFields}"
  - Type: INFO
  - Category: ACADEMIC
  - Source: `gwa.service.ts#updateGwaEntry` → Direct notification

- **GWA Record Deleted**
  - Trigger: When GWA entry is deleted
  - Title: "GWA Record Deleted"
  - Message: "Your GWA record has been deleted by your advisor."
  - Type: WARNING
  - Category: ACADEMIC
  - Source: `gwa.service.ts#deleteGwaEntry` → Direct notification

---

#### 4. Event Notifications

**Pages:** `/student/events`, `/student` (dashboard)

**Notifications:**

- **New Event**

  - Trigger: When a new event is created (public events or club events student belongs to)
  - Title: "New Event: {eventTitle}"
  - Message: "{first 100 characters of event description}..."
  - Type: INFO
  - Category: EVENT_ANNOUNCEMENT
  - Source: `events.service.ts#create` → `NotificationService.notifyUsers` (via `getTargetUsersForEvent`)

- **Event Updated**

  - Trigger: When an event is updated
  - Title: "Event Updated: {eventTitle}"
  - Message: "The event '{eventTitle}' has been updated."
  - Type: INFO
  - Category: EVENT_ANNOUNCEMENT
  - Source: `events.service.ts#update` → `NotificationService.notifyUsers`

- **Event Cancelled**
  - Trigger: When an event is cancelled/archived
  - Title: "Event Cancelled: {eventTitle}"
  - Message: "The event '{eventTitle}' has been cancelled."
  - Type: WARNING
  - Category: EVENT_ANNOUNCEMENT
  - Source: `events.service.ts#softDelete` → `NotificationService.notifyUsers`

---

### Medium Priority (Engagement & Status Updates)

#### 5. Club Application Notifications

**Pages:** `/student/clubs/applications`, `/student/clubs`

**Notifications:**

- **Club Application Approved**

  - Trigger: When club form application is approved
  - Title: "Club Application"
  - Message: "Your application for '{formName}' in '{clubName}' has been approved!"
  - Type: SUCCESS
  - Category: COMMUNICATION
  - Source: `club-form-responses.service.ts#reviewResponse` → `NotificationService.notifyApprovalStatus`

- **Club Application Rejected**
  - Trigger: When club form application is rejected
  - Title: "Club Application"
  - Message: "Your application for '{formName}' in '{clubName}' has been rejected."
  - Type: WARNING
  - Category: COMMUNICATION
  - Source: `club-form-responses.service.ts#reviewResponse` → `NotificationService.notifyApprovalStatus`

---

#### 6. News Article Notifications

**Pages:** `/student/publisher`, `/student/publisher/journalist`, `/student/news`

**Notifications:**

- **News Article Approved**

  - Trigger: When student's article is approved
  - Title: "News Article Approved"
  - Message: "Your news article '{articleTitle}' has been approved and published."
  - Type: SUCCESS
  - Category: COMMUNICATION
  - Source: `news-approval.service.ts#approveArticle` → `ActivityMonitoringService.handleNewsApproved` + `NotificationService.notifyApprovalStatus`

- **News Article Rejected**
  - Trigger: When student's article is rejected
  - Title: "News Article Rejected"
  - Message: "Your news article '{articleTitle}' has been rejected. {reason}"
  - Type: WARNING
  - Category: COMMUNICATION
  - Source: `news-approval.service.ts#rejectArticle` → `ActivityMonitoringService.handleNewsRejected` + `NotificationService.notifyApprovalStatus`

---

#### 7. Announcement Notifications

**Pages:** `/student` (dashboard), `/student/news`

**Notifications:**

- **New Announcement**
  - Trigger: When an announcement is created targeting students (by role or section)
  - Title: "New Announcement: {announcementTitle}"
  - Message: "{first 100 characters of announcement content}..."
  - Type: INFO
  - Category: EVENT_ANNOUNCEMENT
  - Source: `announcements.service.ts#create` → `NotificationService.notifyUsersByRolesAndSections`

---

### Low Priority (Account Management)

#### 8. Account & Security Notifications

**Pages:** `/student/profile`, `/student/settings`

**Notifications:**

- **Account Created**

  - Trigger: When student account is created
  - Title: "Account Created"
  - Message: "Your Student account has been successfully created. Welcome!"
  - Type: SUCCESS
  - Category: USER_ACCOUNT
  - Source: `users.service.ts#createStudent` → `NotificationService.notifyAccountCreated`

- **Account Status Changed**

  - Trigger: When account status changes
  - Title: "Account Status Changed"
  - Message: "Your account status has been changed to: {status}"
  - Type: SUCCESS (if active) or WARNING (if inactive/suspended)
  - Category: USER_ACCOUNT
  - Source: `users.service.ts#updateUserStatus` → `NotificationService.notifyAccountStatusChanged`

- **Account Deactivated**

  - Trigger: When account is deactivated
  - Title: "Account Deactivated"
  - Message: "Your account has been deactivated. Please contact the administrator if you believe this is an error."
  - Type: WARNING
  - Category: USER_ACCOUNT
  - Source: `users.service.ts#remove` → Direct notification

- **Password Reset**

  - Trigger: When password is reset by admin
  - Title: "Password Reset"
  - Message: "Your password has been reset. Please log in with your new password."
  - Type: INFO
  - Category: USER_ACCOUNT
  - Source: `auth.service.ts#resetPassword` → `NotificationService.notifyPasswordReset`

- **Password Changed**

  - Trigger: When student changes their own password
  - Title: "Password Changed"
  - Message: "Your password has been changed successfully."
  - Type: SUCCESS
  - Category: USER_ACCOUNT
  - Source: `auth.service.ts#changePassword` → Direct notification

- **Profile Updated**
  - Trigger: When profile information is updated
  - Title: "Profile Updated"
  - Message: "Your profile information has been updated."
  - Type: INFO
  - Category: USER_ACCOUNT
  - Source: `users.service.ts#update` → Direct notification

---

## API Integration

### Endpoint

- **GET** `/notifications/my?page=1&limit=50` - Fetch student's notifications
- **PATCH** `/notifications/{id}/read` - Mark notification as read
- **POST** `/notifications/mark-all-read` - Mark all notifications as read
- **DELETE** `/notifications/{id}` - Delete a notification
- **GET** `/notifications/unread-count` - Get unread notification count

### Response Format

```typescript
interface Notification {
  id: string;
  user_id: string;
  type: "info" | "warning" | "success" | "error" | "system";
  title: string;
  message: string;
  category: string | null; // 'ACADEMIC' | 'COMMUNICATION' | 'EVENT_ANNOUNCEMENT' | 'USER_ACCOUNT'
  related_entity_type: string | null;
  related_entity_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface NotificationListResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
```

---

## Notification Categories

- **ACADEMIC** - Quiz, schedule, and grade-related notifications
- **COMMUNICATION** - Club applications, news articles, general communications
- **EVENT_ANNOUNCEMENT** - Events and announcements
- **USER_ACCOUNT** - Account management and security notifications

---

## Implementation Notes

1. All notifications are user-specific (targeted to individual students via `user_id`)
2. Notifications use the `notifications` table (not `alerts` table)
3. Notifications are filtered by `user_id` in the API (`GET /notifications/my`)
4. Students only see notifications created for their `user_id`
5. The frontend should integrate with `GET /notifications/my` endpoint to fetch student notifications
6. Notification categories help with filtering and display organization
7. All notifications are currently implemented in the backend via `ActivityMonitoringService` and `NotificationService`

---

## Priority Summary

### High Priority (Must Implement)

1. Quiz Published/Scheduled/Assigned
2. Schedule Created/Updated/Deleted
3. Grade Entered/GWA Recorded
4. Event Created/Updated/Cancelled

### Medium Priority (Should Implement)

5. Club Application Approved/Rejected
6. News Article Approved/Rejected
7. New Announcement

### Low Priority (Nice to Have)

8. Account Status Changed
9. Password Reset/Changed
10. Profile Updated
