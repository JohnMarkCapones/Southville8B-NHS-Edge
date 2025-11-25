# Notification Delivery Matrix

This document lists every implemented notification that currently reaches the Admin and Teacher desktop applications and the Southville Mobile student app. Each entry references the backend source of truth to keep the list aligned with the actual code paths under `core-api-layer/southville-nhs-school-portal-api-layer`.

---

## Desktop App

### Admin Notifications

- **New user account created** – `src/users/users.service.ts#createUser` calls `ActivityMonitoringService.handleUserCreated`, which fans out `New User Created` notifications to every admin via `NotificationService.notifyUsersByRole`.
- **User account deactivated** – `src/users/users.service.ts#remove` invokes `ActivityMonitoringService.handleUserDeleted`, generating `User Deleted` notifications for the admin role.
- **New club registered** – `src/clubs/clubs.service.ts#create` triggers `ActivityMonitoringService.handleClubCreated`, letting admins know whenever a club record is added.
- **Bulk import completion (students/teachers)** – `users.service.ts#importStudentsFromCsv` and `users.service.ts#importTeachersFromCsv` both call `NotificationService.notifyBulkOperationComplete` so the initiating admin receives a success/failure summary.
- **Announcements targeting admins** – `src/announcements/announcements.service.ts#create` uses `notifyUsersByRolesAndSections`; when `targetRoleIds` includes the admin role ID the admin desktop receives the `New Announcement` entry.
- **Event lifecycle updates** – `src/events/events.service.ts` notifies the audience returned by `getTargetUsersForEvent`. Public events include every active user (admins, teachers, students). Private events with no `club_id` fall back to the admin role only.
- **Personal account & security events** – Admin users also see the generic notifications emitted by `NotificationService` helpers:
  - `notifyAccountCreated` during onboarding.
  - `notifyAccountStatusChanged` from `users.service.ts#updateUserStatus`.
  - `notifyUser('Account Deactivated')` when their account is disabled.
  - `notifyPasswordReset` / `notifyUser('Password Changed')` from `auth.service.ts` when passwords are reset or changed.
  - `notifyUser('Profile Updated')` whenever `users.service.ts#update` changes their profile.

### Teacher Notifications

- **Class schedule created/updated/deleted** – `src/schedules/schedules.service.ts` gathers the assigned teacher user ID plus every student in the section and emits `New Class Schedule`, `Schedule Updated`, or `Schedule Deleted`. `ActivityMonitoringService.handleSchedule*` mirrors the same events for audit logging.
- **Quiz submission received** – `src/quiz/services/quiz-attempts.service.ts#submitAttempt` notifies the quiz owner teacher (`Quiz Submission`) and also passes through `ActivityMonitoringService.handleQuizSubmitted`.
- **Quiz review workflow (advisers)** – `src/news/services/news-approval.service.ts#submitForApproval` notifies all journalism advisers/co-advisers that an article needs review. Approval and rejection paths also fire `notifyApprovalStatus` to the author (teacher or student) and `ActivityMonitoring` hooks for traceability.
- **Club advisor assignments** – `src/clubs/clubs.service.ts#create` notifies the advisor/co-advisor (`New Club Created`) whenever they are assigned to a new club.
- **New club member joined / membership change** – `src/clubs/clubs.service.ts#joinClub` notifies advisors, and `src/clubs/services/club-memberships.service.ts#create` calls `ActivityMonitoringService.handleMembershipChanged` so club officers/advisors see membership joins/leaves.
- **Club form submissions awaiting review** – `src/clubs/services/club-form-responses.service.ts#submitResponse` sends `New Form Submission` alerts to advisors when auto-approval is disabled.
- **Advisory section activity** – `src/students/students.service.ts#create`/`update` invoke `ActivityMonitoringService.handleAdvisoryActivity` (student added/removed, announcements, meetings) which targets only the advisory teacher with `expectedRole: 'Teacher'`.
- **Student performance alerts** – `src/gwa/gwa.service.ts#createGwaEntry` raises `ActivityMonitoringService.handlePerformanceAlert` when GWA drops below 75 so the subject/advisory teacher receives a `Student Performance Alert`.
- **Club application approvals** – When advisors approve or reject a club form (`club-form-responses.service.ts#reviewResponse`), applicants get the result. Advisors receive the initial submission notification described above.
- **Announcements & events targeting teachers** – Teachers are in the audience whenever `announcements.service.ts` includes their role or when `events.service.ts#getTargetUsersForEvent` selects their user IDs (public events, club events where they are members/advisors).
- **Account & security notifications** – Just like admins, teachers get per-user notifications for account creation, profile updates, status changes, password resets/changes, and account deactivation via the helpers in `notification.service.ts`.

---

## Southville Mobile

### Student Notifications

- **Account onboarding & status** – Students see:
  - `Account Created` from `users.service.ts#createStudent`.
  - `Account Status Changed` (`updateUserStatus`).
  - `Account Deactivated` (`users.service.ts#remove`).
  - Password reset / password changed alerts from `auth.service.ts`.
  - `Profile Updated` when admins edit their profile.
- **Advisory & scheduling** – `schedules.service.ts` (and the matching activity-monitoring hooks) send `New Class Schedule`, `Schedule Updated`, and `Schedule Deleted` to every enrolled student in the section.
- **Quiz availability** – `src/quiz/services/quiz.service.ts` emits:
  - `New Quiz` when published to sections.
  - `Quiz Scheduled` when future availability is set.
  - `Quiz Assigned` when sections are explicitly assigned.
- **Grades & GWA** – `src/gwa/gwa.service.ts` and `ActivityMonitoringService.handleGradeEntered` create:
  - `Grade Entered` when new GWA data lands.
  - `GWA Recorded`, `GWA Updated`, and `GWA Record Deleted` for audit changes.
- **Club application outcomes** – `src/clubs/services/club-form-responses.service.ts#reviewResponse` calls `notifyApprovalStatus`, giving students an approval/rejection message for each club application.
- **News article decisions** – Student authors receive `News Article Approved/Rejected` via `news-approval.service.ts`, in addition to the matching activity monitoring hook.
- **Announcements targeting students** – `announcements.service.ts` routes `New Announcement` entries whenever `targetRoleIds` or `sectionIds` include student roles/sections.
- **Events** – `events.service.ts` notifies students when:
  - An event is public (every active user, including students, is targeted).
  - A club event is scheduled/updated/cancelled for clubs they belong to.
- **Club onboarding** – When a student’s form submission is pending manual review, they do **not** receive a notification until approval/rejection. If their application auto-approves they join silently (no notification).
- **General security notifications** – Password resets, password changes, and account deactivations reuse the helpers in `notification.service.ts`, so students also see the same entries surfaced in the mobile notifications screen.

---

These lists only include notifications that currently call into `NotificationService` with real recipients. Global alerts (`AlertsService`) remain separate and do not appear in the per-user notifications table.
