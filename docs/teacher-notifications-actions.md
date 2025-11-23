# Teacher Notifications - User Actions

This document defines all actions that should trigger notifications for teachers.

## Current Implementation Status

### ✅ Already Implemented (Working)

1. **Quiz Submission Received** (`handleQuizSubmitted`)
   - **Trigger**: When a student submits a quiz
   - **Notification**: "Quiz Submission Received - Student {name} has submitted quiz: {title}"
   - **Type**: INFO
   - **Category**: ACADEMIC
   - **Location**: `quiz-attempts.service.ts` → `submitAttempt()` → line 762
   - **Target**: Specific teacher who created the quiz

2. **New Schedule Created** (`handleScheduleCreated`)
   - **Trigger**: When a class schedule is created for a teacher's section
   - **Notification**: "New Schedule Created - A new class schedule has been created: {details}"
   - **Type**: INFO
   - **Category**: ACADEMIC
   - **Location**: `schedules.service.ts` → `create()` → line 157
   - **Target**: Teacher assigned to the schedule

3. **Schedule Updated** (`handleScheduleUpdated`)
   - **Trigger**: When a class schedule is updated
   - **Notification**: "Schedule Updated - A class schedule has been updated: {details}"
   - **Type**: INFO
   - **Category**: ACADEMIC
   - **Location**: `schedules.service.ts` → `update()` → line 280
   - **Target**: Teacher assigned to the schedule

4. **Schedule Deleted** (`handleScheduleDeleted`)
   - **Trigger**: When a class schedule is deleted
   - **Notification**: "Schedule Deleted - A class schedule has been deleted: {details}"
   - **Type**: WARNING
   - **Category**: ACADEMIC
   - **Location**: `schedules.service.ts` → `remove()` → line 313
   - **Target**: Teacher assigned to the schedule

5. **Club Form Submission** (Club Form Responses)
   - **Trigger**: When a student submits a club form that requires teacher review
   - **Notification**: "New Form Submission - A new submission for "{formName}" in "{clubName}" requires your review."
   - **Type**: INFO
   - **Category**: COMMUNICATION
   - **Location**: `club-form-responses.service.ts` → `submitResponse()` → line 213
   - **Target**: Club advisor/co-advisor teachers

6. **News Article Approval/Rejection** (`handleNewsApproved`, `handleNewsRejected`)
   - **Trigger**: When a news article is approved or rejected
   - **Notification**: "News Article Approved/Rejected - Your news article "{title}" has been {approved/rejected}."
   - **Type**: SUCCESS (approved) or WARNING (rejected)
   - **Category**: COMMUNICATION
   - **Location**: `news-approval.service.ts` → `approveArticle()` / `rejectArticle()`
   - **Target**: Article author (if teacher)

### ❌ Not Implemented (Needs Implementation)

7. **Grade Entry Confirmation** (For Students)
   - **Trigger**: When a teacher enters a grade for a student
   - **Current**: Only student is notified (`handleGradeEntered`)
   - **Missing**: Teacher confirmation notification
   - **Action Needed**: Optional - may not be needed if teacher is the one entering

8. **Student Assignment Submission**
   - **Trigger**: When a student submits an assignment
   - **Notification**: "Assignment Submitted - Student {name} has submitted assignment: {title}"
   - **Type**: INFO
   - **Category**: ACADEMIC
   - **Location**: Assignment service (if exists)
   - **Action Needed**: Check if assignment system exists

9. **Parent/Guardian Contact Request**
   - **Trigger**: When a parent requests to contact a teacher
   - **Notification**: "Contact Request - Parent {name} has requested to contact you regarding {student}"
   - **Type**: INFO
   - **Category**: COMMUNICATION
   - **Location**: Contact/communication service (if exists)
   - **Action Needed**: Check if parent contact system exists

10. **Advisory Section Activity**
    - **Trigger**: When activities occur in a teacher's advisory section
    - **Examples**: 
      - New student added to advisory section
      - Student removed from advisory section
      - Advisory meeting scheduled
      - Advisory announcement posted
    - **Notification**: "Advisory Activity - {description}"
    - **Type**: INFO
    - **Category**: ACADEMIC
    - **Location**: Various services (students, schedules, announcements)
    - **Action Needed**: Implement advisory-specific notifications
    - **⚠️ IMPORTANT**: These should NOT be sent to admins (teacher-specific operational notifications)

11. **Quiz Results Available**
    - **Trigger**: When quiz grading is completed and results are available
    - **Notification**: "Quiz Results Ready - Results for quiz "{title}" are now available for review."
    - **Type**: INFO
    - **Category**: ACADEMIC
    - **Location**: Quiz grading service (if auto-grading exists)
    - **Action Needed**: Check if auto-grading system exists

12. **Class Attendance Alert**
    - **Trigger**: When attendance patterns require teacher attention
    - **Examples**:
      - High absence rate in a section
      - Student marked absent multiple days
    - **Notification**: "Attendance Alert - {description}"
    - **Type**: WARNING
    - **Category**: ACADEMIC
    - **Location**: Attendance service (if exists)
    - **Action Needed**: Check if attendance system exists

13. **Student Performance Alert**
    - **Trigger**: When a student's performance drops significantly
    - **Notification**: "Performance Alert - Student {name} performance has dropped in {subject}"
    - **Type**: WARNING
    - **Category**: ACADEMIC
    - **Location**: Grade/performance monitoring service
    - **Action Needed**: Implement performance monitoring

14. **Parent-Teacher Conference Scheduled**
    - **Trigger**: When a parent-teacher conference is scheduled
   - **Notification**: "Conference Scheduled - Parent-teacher conference scheduled for {date}"
    - **Type**: INFO
    - **Category**: COMMUNICATION
    - **Location**: Conference/scheduling service (if exists)
    - **Action Needed**: Check if conference system exists

## Summary

### Total Teacher Actions: 14
- ✅ **Implemented**: 6 (43%)
- ❌ **Not Implemented**: 8 (57%)

## Security & Access Control

### Current System Architecture

The notification system uses **user-specific targeting** with role validation:

1. **User-Specific Targeting**: Each notification has a `user_id` field and is created for specific users
2. **API Filtering**: The `GET /notifications/my` endpoint filters by `user_id` - users can only see their own notifications
3. **Role Validation**: The `NotificationService` includes optional role validation to ensure notifications are sent to the correct role
4. **Role-Based Creation**: Notifications are created using:
   - `notifyUsersByRole([adminRoleId], ...)` for admin notifications (automatically validates role)
   - `notifyUser(teacherId, ..., { expectedRole: 'Teacher' })` for teacher-specific notifications
   - `notifyUsers([specificUserIds], ..., { expectedRole: 'Teacher' })` for targeted teacher notifications

### Role-Based Notification Targeting

**Admin Notifications** (Should NOT be visible to teachers):
- User management actions (create, update, delete, suspend)
- System-wide alerts
- Bulk operations
- Domain role assignments
- **Implementation**: Uses `notifyUsersByRole([adminRoleId], ...)` which only targets admin users

**Teacher Notifications** (Should NOT be visible to admins):
- Quiz submissions from students
- Schedule changes for their classes
- Club form submissions (if advisor)
- **Advisory section activities** ⚠️ TEACHER-ONLY - NOT for admins
- Student performance alerts ⚠️ TEACHER-ONLY - NOT for admins
- Parent contact requests
- **Implementation**: Uses `notifyUser(teacherId, ..., { expectedRole: 'Teacher' })` with explicit role validation

**Shared Notifications** (Visible to both):
- System announcements
- Events (if applicable)
- News articles (if published)

### Security Guarantees

- ✅ **Admins cannot see teacher notifications**: Teacher operational notifications (advisory activities, performance alerts) are created with `expectedRole: 'Teacher'` and only sent to teacher user IDs
- ✅ **Teachers cannot see admin notifications**: Admin notifications are created using `notifyUsersByRole([adminRoleId], ...)` which only targets admin users
- ✅ **User-specific filtering**: The API endpoint filters by `user_id`, ensuring users can only access their own notifications
- ✅ **Role validation warnings**: If a notification is sent to a user with the wrong role, a warning is logged (fail-open approach to prevent breaking existing functionality)

### Implementation Details

- **Advisory Activity Notifications**: 
  - Triggered when students are added/removed from sections
  - Only sent to the advisory teacher for that section
  - Uses `expectedRole: 'Teacher'` to ensure admins do not receive these notifications
  - Location: `activity-monitoring.service.ts` → `handleAdvisoryActivity()`

- **Performance Alert Notifications**:
  - Triggered when student GWA drops below 75
  - Only sent to the advisory teacher for that student's section
  - Uses `expectedRole: 'Teacher'` to ensure admins do not receive these notifications
  - Location: `activity-monitoring.service.ts` → `handlePerformanceAlert()`

- Role validation is **optional** and **non-blocking** (fail-open with warnings)
- This ensures existing functionality continues to work while providing visibility into potential configuration issues

## Implementation Priority

### High Priority (Core Teaching Functions)
1. Advisory Section Activity - Critical for teacher workflow
2. Student Performance Alert - Important for early intervention
3. Class Attendance Alert - Important for student welfare

### Medium Priority (Communication)
4. Parent/Guardian Contact Request
5. Parent-Teacher Conference Scheduled

### Low Priority (Nice to Have)
6. Quiz Results Available (if auto-grading exists)
7. Student Assignment Submission (if assignment system exists)
8. Grade Entry Confirmation (may not be needed)

