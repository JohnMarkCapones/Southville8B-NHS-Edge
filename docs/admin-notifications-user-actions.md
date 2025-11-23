# Admin Notifications - User Actions

This document defines all user management actions that should trigger notifications for admin users.

## Current Implementation Status

### ✅ Implemented (Already Working)

1. **User Created** (`handleUserCreated`)

   - **Trigger**: When a new user account is created (Student, Teacher, or Admin)
   - **Notification**: "New User Created - A new {role} account has been created: {email}"
   - **Type**: INFO
   - **Category**: USER_ACCOUNT
   - **Location**: `users.service.ts` → `createUser()` → line 514

2. **User Deleted** (`handleUserDeleted`)
   - **Trigger**: When a user account is soft-deleted (status changed to 'Inactive')
   - **Notification**: "User Deleted - User account has been deleted: {email}"
   - **Type**: WARNING
   - **Category**: USER_ACCOUNT
   - **Location**: `users.service.ts` → `remove()` → line 1141

### ⚠️ Partially Implemented (Needs Enhancement)

3. **User Updated** (`handleUserUpdated`)

   - **Current**: Only notifies the user about profile changes
   - **Missing**: Admin notification for significant changes (email, role, fullName)
   - **Location**: `users.service.ts` → `update()` → line 1091
   - **Action Needed**: Add admin notification when critical fields change

4. **User Status Changed** (`handleUserUpdated`)
   - **Current**: Only notifies the user about status change
   - **Missing**: Admin notification when status changes (Active → Inactive, Active → Suspended, etc.)
   - **Location**: `users.service.ts` → `updateUserStatus()` → line 1188
   - **Action Needed**: Add admin notification for status changes

### ❌ Not Implemented (Needs Implementation)

5. **User Suspended** (`suspendUser`)

   - **Trigger**: When a user is suspended with reason and duration
   - **Notification**: "User Suspended - User {email} has been suspended. Reason: {reason}, Duration: {duration} days"
   - **Type**: WARNING
   - **Category**: USER_ACCOUNT
   - **Location**: `users.service.ts` → `suspendUser()` → line 1207
   - **Action Needed**: Add activity monitoring hook

6. **Bulk User Creation** (`createBulkUsers`)

   - **Trigger**: When multiple users are created in bulk
   - **Notification**: "Bulk User Creation - {successCount} users created successfully, {failedCount} failed"
   - **Type**: INFO (if all succeed) or WARNING (if some fail)
   - **Category**: USER_ACCOUNT
   - **Location**: `users.service.ts` → `createBulkUsers()` → line 642
   - **Action Needed**: Add activity monitoring hook after bulk operation completes

7. **Student Import from CSV** (`importStudentsFromCsv`)

   - **Trigger**: When students are imported from CSV file
   - **Notification**: "Student Import Completed - {successCount} students imported successfully, {failedCount} failed"
   - **Type**: INFO (if all succeed) or WARNING (if some fail)
   - **Category**: USER_ACCOUNT
   - **Location**: `users.service.ts` → `importStudentsFromCsv()` → line 1691
   - **Action Needed**: Add activity monitoring hook after import completes

8. **Teacher Import from CSV** (`importTeachersFromCsv`)

   - **Trigger**: When teachers are imported from CSV file
   - **Notification**: "Teacher Import Completed - {successCount} teachers imported successfully, {failedCount} failed"
   - **Type**: INFO (if all succeed) or WARNING (if some fail)
   - **Category**: USER_ACCOUNT
   - **Location**: `users.service.ts` → `importTeachersFromCsv()` → line 1994
   - **Action Needed**: Add activity monitoring hook after import completes

9. **Domain Role Assigned** (`assignDomainRole`)

   - **Trigger**: When a domain role is assigned to a user
   - **Notification**: "Domain Role Assigned - User {email} has been assigned domain role: {roleName}"
   - **Type**: INFO
   - **Category**: USER_ACCOUNT
   - **Location**: `users.service.ts` → `assignDomainRole()` → line 1839
   - **Action Needed**: Add activity monitoring hook

10. **Domain Role Removed** (`removeDomainRole`)
    - **Trigger**: When a domain role is removed from a user
    - **Notification**: "Domain Role Removed - Domain role {roleName} has been removed from user {email}"
    - **Type**: WARNING
    - **Category**: USER_ACCOUNT
    - **Location**: `users.service.ts` → `removeDomainRole()` → line 1935
    - **Action Needed**: Add activity monitoring hook

## Summary

### Total User Actions: 10

- ✅ **Implemented**: 2 (20%)
- ⚠️ **Partially Implemented**: 2 (20%)
- ❌ **Not Implemented**: 6 (60%)

## Implementation Priority

### High Priority (Security & Critical Operations)

1. User Suspended - Security concern
2. User Status Changed (Admin notification) - Important for tracking
3. User Updated (Admin notification for critical changes) - Audit trail

### Medium Priority (Bulk Operations)

4. Bulk User Creation - Important for large-scale operations
5. Student Import from CSV - Common operation
6. Teacher Import from CSV - Common operation

### Low Priority (Role Management)

7. Domain Role Assigned - Less frequent operation
8. Domain Role Removed - Less frequent operation

## Notes

- All notifications should be sent to users with the "Admin" role
- Notifications should include relevant context (user email, role, reason, etc.)
- Use appropriate notification types (INFO, WARNING, ERROR) based on severity
- Set appropriate expiration (7-30 days) based on importance
- Activity monitoring should not fail the main operation (use try-catch)

## Security & Role-Based Filtering

### Current System Architecture

The notification system uses **user-specific targeting** with role validation:

1. **User-Specific Targeting**: Each notification has a `user_id` field and is created for specific users
2. **API Filtering**: The `GET /notifications/my` endpoint filters by `user_id` - users can only see their own notifications
3. **Role Validation**: The `NotificationService` includes optional role validation to ensure notifications are sent to the correct role
4. **Role-Based Creation**: Notifications are created using:
   - `notifyUsersByRole([adminRoleId], ...)` for admin notifications (automatically validates role)
   - `notifyUser(teacherId, ..., { expectedRole: 'Teacher' })` for teacher-specific notifications
   - `notifyUsers([specificUserIds], ..., { expectedRole: 'Admin' })` for targeted admin notifications

### Security Guarantees

- ✅ **Admins cannot see teacher notifications**: Teacher operational notifications (quiz submissions, advisory activities) are created with `expectedRole: 'Teacher'` and only sent to teacher user IDs
- ✅ **Teachers cannot see admin notifications**: Admin notifications are created using `notifyUsersByRole([adminRoleId], ...)` which only targets admin users
- ✅ **User-specific filtering**: The API endpoint filters by `user_id`, ensuring users can only access their own notifications
- ✅ **Role validation warnings**: If a notification is sent to a user with the wrong role, a warning is logged (fail-open approach to prevent breaking existing functionality)

### Implementation Details

- Role validation is **optional** and **non-blocking** (fail-open with warnings)
- This ensures existing functionality continues to work while providing visibility into potential configuration issues
- All teacher-specific notifications (advisory activities, performance alerts) explicitly set `expectedRole: 'Teacher'` to ensure they are not sent to admins
