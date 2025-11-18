<!-- 37ee1293-3641-4f67-85bb-664961550bb8 8bba30e0-1c09-4a91-8eec-9495b58cb05a -->
# Desktop App Notification Integration Functions

Based on the navigation items in `AdminShellView.axaml` and `TeacherShellView.axaml`, here are all functions that need notification integration:

## ADMIN PORTAL NOTIFICATIONS

### 1. User Management (`NavigateToUserManagementCommand`)

**Functions needing notifications:**

- `CreateStudentAsync()` - Notify student when account is created
- `CreateTeacherAsync()` - Notify teacher when account is created  
- `CreateAdminAsync()` - Notify admin when account is created
- `UpdateUserStatusAsync()` - Notify user when status changes (active/inactive)
- `UpdateUserAsync()` - Notify user when profile is updated (if significant changes)
- `DeleteUserAsync()` - Notify user before deletion (if soft delete)
- `ResetPasswordAsync()` - Notify user when password is reset
- `AdminChangePasswordAsync()` - Notify user when admin changes their password
- `ImportStudentsCsvAsync()` - Notify admin when bulk import completes (success/failure summary)
- `ImportTeachersCsvAsync()` - Notify admin when bulk import completes (success/failure summary)

### 2. Building Management (`NavigateToBuildingManagementCommand`)

**Functions needing notifications:**

- `CreateBuildingAsync()` - Notify relevant admins when building is created
- `UpdateBuildingAsync()` - Notify relevant admins when building is updated
- `DeleteBuildingAsync()` - Notify relevant admins when building is deleted
- Room creation/update/delete operations - Notify affected teachers/students when room assignments change

### 3. Class Schedules (`NavigateToClassSchedulesCommand`)

**Functions needing notifications:**

- `CreateScheduleAsync()` - Notify teacher and students when schedule is created
- `UpdateScheduleAsync()` - Notify teacher and students when schedule is updated (time/room changes)
- `DeleteScheduleAsync()` - Notify teacher and students when schedule is deleted
- `BulkCreateSchedulesAsync()` - Notify affected users when bulk schedules are created
- `AssignStudentsToScheduleAsync()` - Notify students when assigned to a class
- `RemoveStudentsFromScheduleAsync()` - Notify students when removed from a class
- Schedule conflict detection - Notify admin/teacher when conflicts are detected

### 4. Events Dashboard (`NavigateToEventsDashboardCommand`)

**Functions needing notifications:**

- Event creation - Notify target audience when event is created
- Event update - Notify target audience when event details change
- Event deletion/cancellation - Notify target audience when event is cancelled
- Event approval/rejection - Notify event creator when event is approved/rejected
- Event status changes - Notify relevant users when event status changes (draft → published)

### 5. Alerts (`NavigateToAlertsCommand`)

**Functions needing notifications:**

- Alert creation - Notify target users when alert is created
- Alert update - Notify target users when alert is updated
- Alert deletion - Notify target users when alert is removed
- Alert expiration - Notify admin when alert is about to expire

### 7. Chat (`NavigateToChatCommand`)

**Functions needing notifications:**

- New message received - Notify recipient when message is sent (already covered in previous analysis)

---

## TEACHER PORTAL NOTIFICATIONS

### 1. Schedule Planner (`NavigateToSchedulePlannerCommand`)

**Functions needing notifications:**

- `CreateScheduleAsync()` - Notify students when teacher creates schedule
- `UpdateScheduleAsync()` - Notify students when schedule is updated
- `DeleteScheduleAsync()` - Notify students when schedule is deleted
- Schedule conflict detection - Notify teacher when conflicts are detected
- Schedule template save/load - Notify teacher when template operations complete

### 2. Grade Entry (`NavigateToGradeEntryCommand`)

**Functions needing notifications:**

- `CreateGwaEntryAsync()` - Notify student/parent when grade is entered
- `UpdateGwaEntryAsync()` - Notify student/parent when grade is updated
- `DeleteGwaEntryAsync()` - Notify student/parent when grade is deleted
- Bulk grade entry - Notify students/parents when bulk grades are entered
- Grade submission - Notify admin when grades are submitted for review
- Grade approval/rejection - Notify teacher when grades are approved/rejected by admin

### 3. My Announcements (`NavigateToMyAnnouncementsCommand`)

**Functions needing notifications:**

- Announcement creation - Notify target users when announcement is created
- Announcement update - Notify target users when announcement is updated
- Announcement deletion - Notify target users when announcement is deleted
- Announcement approval/rejection - Notify teacher when announcement is approved/rejected
- Announcement status changes - Notify teacher when announcement status changes

### 4. Messaging (`NavigateToMessagingCommand`)

**Functions needing notifications:**

- New message received - Notify recipient when message is sent (already covered in previous analysis)

---

## NOTIFICATION TYPES BY CATEGORY

### **User Account Notifications**

- Account created
- Account status changed
- Password reset
- Profile updated
- Account deleted

### **Academic Notifications**

- Schedule created/updated/deleted
- Grade entered/updated
- Module published/updated
- Assignment created

### **Event & Announcement Notifications**

- Event created/updated/cancelled
- Announcement created/updated/deleted
- Event/Announcement approved/rejected

### **System Notifications**

- Bulk operations completed
- Conflicts detected
- Access granted/revoked
- System alerts

### **Communication Notifications**

- New message received
- Chat conversation created

---

## INTEGRATION POINTS

1. **Backend API Layer** - Add notification creation after successful operations
2. **Chat Service** - Add notification creation when messages are sent
3. **Desktop App** - Poll or use real-time updates to fetch notifications
4. **Notification View** - Display notifications in `NotificationsView.axaml` for both Admin and Teacher

## NOTES

- Dashboard views typically don't need notifications (they display stats, not trigger actions)
- Notifications should be role-aware (Admin notifications vs Teacher notifications vs Student notifications)
- Some notifications may need to be batched (e.g., bulk operations)
- Consider notification preferences per user (opt-in/opt-out for certain types)