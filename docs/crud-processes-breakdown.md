# CRUD Process Breakdown for Southville 8B NHS Edge

**Last Updated:** January 2025  
**Project:** Southville 8B NHS Edge - System Documentation

## Overview

This document provides a comprehensive breakdown of all CRUD (Create, Read, Update, Delete) operations performed by the API services on Supabase database tables. The system consists of:

- **Core API Layer**: 40+ modules handling various system features
- **Chat Service**: Dedicated messaging service

**Total Database Tables**: 111 tables across multiple domains

---

## Table of Contents

1. [User Management](#1-user-management)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Students](#3-students)
4. [Teachers](#4-teachers)
5. [Academic Management](#5-academic-management)
6. [Quiz System](#6-quiz-system)
7. [News & Journalism](#7-news--journalism)
8. [Clubs](#8-clubs)
9. [Events](#9-events)
10. [Schedules](#10-schedules)
11. [Announcements](#11-announcements)
12. [Gallery](#12-gallery)
13. [Learning Materials (Modules)](#13-learning-materials-modules)
14. [Teacher Files](#14-teacher-files)
15. [Student Activities](#15-student-activities)
16. [GWA & Rankings](#16-gwa--rankings)
17. [Alerts & Notifications](#17-alerts--notifications)
18. [Facilities & Infrastructure](#18-facilities--infrastructure)
19. [Departments](#19-departments)
20. [Subjects](#20-subjects)
21. [Sections](#21-sections)
22. [Chat Service](#22-chat-service)
23. [Other Modules](#23-other-modules)

---

## 1. User Management

**Controller**: `UsersController`  
**Service**: `UsersService`  
**Module**: `UsersModule`

### Create Operations

- **`users`** (Supabase Auth + Public)

  - `createUser()` - Creates user in auth.users and public.users
  - `bulkCreateUsers()` - Bulk user creation
  - `importUsers()` - CSV import
  - `createAuthUser()` - Creates in Supabase Auth
  - `createPublicUser()` - Creates in public.users table

- **`teachers`**

  - `createTeacherRecord()` - Creates teacher profile
  - `createTeacher()` - Full teacher creation with user account
  - `importTeachersCsv()` - CSV import for teachers

- **`students`**

  - `createStudentRecord()` - Creates student profile
  - `createStudent()` - Full student creation with user account
  - `importStudentsCsv()` - CSV import for students

- **`admins`**

  - `createAdminRecord()` - Creates admin profile
  - `createAdmin()` - Full admin creation with user account

- **`profiles`**

  - Created automatically with user creation

- **`emergency_contacts`**

  - `createEmergencyContactRecord()` - Creates emergency contact for students

- **`daily_logins`**

  - `syncLastLogin()` - Upserts login tracking

- **`user_domain_roles`**

  - `assignDomainRole()` - Assigns domain roles to users

- **`user_positions`**
  - `assignPosition()` - Assigns positions to users

### Read Operations

- **`users`**

  - `findAll()` - List all users with filters
  - `findOne()` - Get user by ID with full profile
  - `findByEmail()` - Find user by email
  - `validateEmailUniqueness()` - Check email availability

- **`teachers`**

  - `findAll()` - List all teachers
  - `findOne()` - Get teacher by ID
  - `validateTeacherUniqueness()` - Check teacher uniqueness

- **`students`**

  - `findAll()` - List all students
  - `findOne()` - Get student by ID
  - `validateStudentUniqueness()` - Check student uniqueness (LRN + birthday)

- **`admins`**

  - `findAll()` - List all admins
  - `findOne()` - Get admin by ID

- **`profiles`**

  - Read via user.findOne() join

- **`roles`**

  - `getRoleIdByName()` - Get role ID by name
  - `findAll()` - List all roles

- **`sections`**

  - Read for student/teacher associations

- **`departments`**

  - Read for teacher associations

- **`subjects`**

  - Read for teacher specializations

- **`user_domain_roles`**

  - `getUserDomainRoles()` - Get user's domain roles
  - `getUserPrimaryDomainRole()` - Get primary domain role

- **`domain_roles`**

  - Read for role assignments

- **`user_positions`**

  - Read user position assignments

- **`daily_logins`**
  - Read login history

### Update Operations

- **`users`**

  - `updateUser()` - Update user details
  - `updateUserStatus()` - Update user status (Active/Suspended)
  - `suspendUser()` - Suspend user account
  - `updatePassword()` - Update user password

- **`teachers`**

  - `updateTeacher()` - Update teacher profile

- **`students`**

  - `updateStudent()` - Update student profile

- **`admins`**

  - `updateAdmin()` - Update admin profile

- **`profiles`**

  - `updateProfile()` - Update user profile

- **`user_preferences`**

  - `updatePreferences()` - Update user preferences (theme, language)

- **`user_domain_roles`**

  - `updateDomainRole()` - Update domain role assignment

- **`daily_logins`**
  - Upsert on login (via syncLastLogin)

### Delete Operations

- **`users`**

  - `deleteUser()` - Soft delete user (sets deleted_at)
  - `hardDeleteUser()` - Hard delete user (removes from auth and public)

- **`teachers`**

  - Soft delete via deleted_at column

- **`students`**

  - Soft delete via deleted_at column

- **`user_domain_roles`**
  - `removeDomainRole()` - Remove domain role assignment

---

## 2. Authentication & Authorization

**Controller**: `AuthController`  
**Service**: `AuthService`  
**Module**: `AuthModule`

### Create Operations

- **`users`** (Supabase Auth)

  - `login()` - Creates session via Supabase Auth
  - `register()` - Creates new user account

- **`daily_logins`**
  - `syncLastLogin()` - Tracks login events

### Read Operations

- **`users`**

  - `getUserRoleFromDatabase()` - Get user role
  - `validateToken()` - Validate JWT token
  - `getCurrentUser()` - Get authenticated user

- **`roles`**

  - Read for role-based access control

- **`permissions`**

  - Read for permission checks

- **`domain_roles`**

  - Read for domain-based access control

- **`user_domain_roles`**
  - Read for user domain role assignments

### Update Operations

- **`users`**
  - `syncLastLogin()` - Update last_login_at timestamp
  - `updatePassword()` - Update user password

### Delete Operations

- **`users`** (Supabase Auth)
  - `logout()` - Invalidates session

---

## 3. Students

**Controller**: `StudentsController`  
**Service**: `StudentsService`  
**Module**: `StudentsModule`

### Create Operations

- **`students`**

  - `create()` - Create student record
  - `bulkCreate()` - Bulk student creation

- **`student_activities`**

  - Created via StudentActivitiesService

- **`student_rankings`**

  - Created via ranking calculations

- **`students_gwa`**
  - Created via GWA calculations

### Read Operations

- **`students`**

  - `findAll()` - List all students with filters
  - `findOne()` - Get student by ID
  - `findBySection()` - Get students by section
  - `findByGradeLevel()` - Get students by grade level

- **`sections`**

  - Read for student-section associations

- **`users`**

  - Read for student user accounts

- **`student_activities`**

  - Read student activity timeline

- **`student_rankings`**

  - Read student rankings

- **`students_gwa`**
  - Read student GWA (General Weighted Average)

### Update Operations

- **`students`**
  - `update()` - Update student record
  - `updateSection()` - Update student section assignment
  - `updateGradeLevel()` - Update student grade level

### Delete Operations

- **`students`**
  - `delete()` - Soft delete student (sets deleted_at)

---

## 4. Teachers

**Controller**: `TeachersController` (via UsersController)  
**Service**: `UsersService` (teacher methods)  
**Module**: `UsersModule`

### Create Operations

- **`teachers`**
  - `createTeacher()` - Create teacher with user account
  - `createTeacherRecord()` - Create teacher profile only

### Read Operations

- **`teachers`**

  - `findAll()` - List all teachers
  - `findOne()` - Get teacher by ID
  - `findByDepartment()` - Get teachers by department
  - `findBySubject()` - Get teachers by subject specialization

- **`departments`**

  - Read for teacher-department associations

- **`subjects`**

  - Read for teacher subject specializations

- **`sections`**
  - Read for advisory section assignments

### Update Operations

- **`teachers`**
  - `updateTeacher()` - Update teacher profile
  - `updateDepartment()` - Update teacher department
  - `updateAdvisorySection()` - Update advisory section

### Delete Operations

- **`teachers`**
  - Soft delete via deleted_at column

---

## 5. Academic Management

### 5.1 Academic Years

**Controller**: `AcademicYearsController`  
**Service**: `AcademicYearsService`  
**Module**: `AcademicYearsModule`

#### Create Operations

- **`academic_years`**

  - `create()` - Create academic year

- **`academic_periods`**

  - `createPeriod()` - Create academic period

- **`academic_year_settings`**

  - `createSetting()` - Create academic year setting

- **`academic_year_templates`**
  - `createTemplate()` - Create academic year template

#### Read Operations

- **`academic_years`**

  - `findAll()` - List all academic years
  - `findOne()` - Get academic year by ID
  - `findActive()` - Get active academic year

- **`academic_periods`**

  - `findByAcademicYear()` - Get periods for academic year

- **`academic_year_settings`**
  - `findSettings()` - Get academic year settings

#### Update Operations

- **`academic_years`**

  - `update()` - Update academic year
  - `setActive()` - Set academic year as active

- **`academic_periods`**
  - `updatePeriod()` - Update academic period

#### Delete Operations

- **`academic_years`**
  - `delete()` - Archive academic year (sets is_archived)

### 5.2 Academic Calendar

**Controller**: `AcademicCalendarController`  
**Service**: `AcademicCalendarService`  
**Module**: `AcademicCalendarModule`

#### Create Operations

- **`academic_calendar`**

  - `create()` - Create academic calendar

- **`academic_calendar_days`**

  - `createDays()` - Create calendar days

- **`academic_calendar_markers`**
  - `createMarker()` - Create calendar marker

#### Read Operations

- **`academic_calendar`**

  - `findAll()` - List all calendars
  - `findOne()` - Get calendar by ID

- **`academic_calendar_days`**

  - `findByCalendar()` - Get days for calendar
  - `findByDateRange()` - Get days in date range

- **`academic_calendar_markers`**
  - `findByCalendar()` - Get markers for calendar

#### Update Operations

- **`academic_calendar`**

  - `update()` - Update calendar

- **`academic_calendar_days`**
  - `updateDay()` - Update calendar day

#### Delete Operations

- **`academic_calendar`**
  - `delete()` - Delete calendar

---

## 6. Quiz System

**Controller**: `QuizController`, `QuestionBankController`, `QuizAttemptsController`, `MonitoringController`, `GradingController`, `AnalyticsController`, `SessionManagementController`, `AccessControlController`  
**Service**: `QuizService`, `QuestionBankService`, `QuizAttemptsService`, `MonitoringService`, `GradingService`, `AnalyticsService`, `SessionManagementService`, `AccessControlService`  
**Module**: `QuizModule`

### Create Operations

- **`quizzes`**

  - `createQuiz()` - Create new quiz (draft status)
  - `publishQuiz()` - Publish quiz

- **`quiz_settings`**

  - `createQuizSettings()` - Create quiz security settings
  - Created automatically with quiz creation

- **`quiz_questions`**

  - `addQuestion()` - Add question to quiz
  - `addQuestionsFromBank()` - Import questions from question bank

- **`quiz_section_settings`**

  - `assignToSection()` - Assign quiz to section with custom settings

- **`quiz_attempts`**

  - `startAttempt()` - Start new quiz attempt
  - `submitAttempt()` - Submit quiz attempt

- **`quiz_student_answers`**

  - `saveAnswer()` - Save student answer
  - `submitAnswers()` - Submit all answers

- **`quiz_active_sessions`**

  - `createSession()` - Create active quiz session
  - `startSession()` - Start quiz session with device tracking

- **`quiz_session_answers`**

  - `saveTemporaryAnswer()` - Save temporary answer during quiz

- **`quiz_participants`**

  - `addParticipant()` - Add student to quiz session

- **`quiz_access_links`**

  - `createAccessLink()` - Create quiz access link

- **`quiz_access_logs`**

  - `logAccess()` - Log quiz access attempt

- **`quiz_device_sessions`**

  - `createDeviceSession()` - Create device session for tracking

- **`quiz_activity_logs`**

  - `logActivity()` - Log quiz activity events

- **`quiz_flags`**

  - `flagParticipant()` - Flag suspicious activity

- **`quiz_analytics`**

  - `calculateAnalytics()` - Calculate quiz analytics

- **`quiz_question_stats`**

  - `calculateQuestionStats()` - Calculate question statistics

- **`question_bank`**
  - `create()` - Create question in question bank
  - `importQuestions()` - Import questions to bank

### Read Operations

- **`quizzes`**

  - `findAllQuizzes()` - List all quizzes with filters
  - `findOne()` - Get quiz by ID
  - `findByTeacher()` - Get quizzes by teacher
  - `findBySubject()` - Get quizzes by subject
  - `findBySection()` - Get quizzes for section

- **`quiz_settings`**

  - Read via quiz.findOne() join

- **`quiz_questions`**

  - `getQuestions()` - Get quiz questions
  - `getQuestion()` - Get single question

- **`quiz_attempts`**

  - `getAttempts()` - Get student attempts
  - `getAttempt()` - Get single attempt
  - `getAttemptHistory()` - Get attempt history

- **`quiz_student_answers`**

  - `getAnswers()` - Get answers for attempt
  - `getAnswer()` - Get single answer

- **`quiz_student_summary`**

  - `getStudentSummary()` - Get student quiz summary

- **`quiz_active_sessions`**

  - `getActiveSessions()` - Get active quiz sessions
  - `getSession()` - Get session details

- **`quiz_participants`**

  - `getParticipants()` - Get quiz participants
  - `getParticipant()` - Get participant details

- **`quiz_analytics`**

  - `getAnalytics()` - Get quiz analytics

- **`quiz_question_stats`**

  - `getQuestionStats()` - Get question statistics

- **`question_bank`**

  - `findAll()` - List question bank items
  - `findOne()` - Get question by ID
  - `findByTeacher()` - Get teacher's question bank
  - `findBySubject()` - Get questions by subject

- **`students`**

  - Read for participant information

- **`users`**
  - Read for student/teacher information

### Update Operations

- **`quizzes`**

  - `updateQuiz()` - Update quiz details
  - `updateStatus()` - Update quiz status
  - `updateVisibility()` - Update quiz visibility

- **`quiz_settings`**

  - `updateSettings()` - Update quiz settings

- **`quiz_questions`**

  - `updateQuestion()` - Update question
  - `reorderQuestions()` - Reorder questions

- **`quiz_attempts`**

  - `updateAttempt()` - Update attempt details
  - `terminateAttempt()` - Terminate attempt by teacher

- **`quiz_student_answers`**

  - `updateAnswer()` - Update student answer
  - `gradeAnswer()` - Grade answer manually

- **`quiz_active_sessions`**

  - `updateSession()` - Update session (heartbeat, device tracking)
  - `terminateSession()` - Terminate session

- **`quiz_session_answers`**

  - `updateTemporaryAnswer()` - Update temporary answer

- **`quiz_participants`**

  - `updateParticipant()` - Update participant status

- **`quiz_analytics`**

  - `recalculateAnalytics()` - Recalculate analytics

- **`question_bank`**
  - `update()` - Update question bank item

### Delete Operations

- **`quizzes`**

  - `deleteQuiz()` - Soft delete quiz (sets deleted_at)

- **`quiz_questions`**

  - `deleteQuestion()` - Delete question from quiz

- **`quiz_attempts`**

  - `deleteAttempt()` - Delete attempt (rare, usually archived)

- **`question_bank`**
  - `delete()` - Soft delete question (sets is_deleted)

---

## 7. News & Journalism

**Controller**: `NewsController`, `NewsCategoriesController`, `JournalismMembershipController`, `NewsKpiController`  
**Service**: `NewsService`, `NewsCategoriesService`, `NewsApprovalService`, `TagsService`, `JournalismMembershipService`, `NewsKpiService`  
**Module**: `NewsModule`

### Create Operations

- **`news`**

  - `create()` - Create news article (draft status)
  - `publish()` - Publish article

- **`news_categories`**

  - `create()` - Create news category

- **`news_tags`**

  - `createTag()` - Auto-created when used in article

- **`news_co_authors`**

  - `addCoAuthor()` - Add co-author to article

- **`news_approval`**

  - `submitForApproval()` - Submit article for approval
  - `approve()` - Approve article
  - `reject()` - Reject article

- **`news_review_comments`**
  - `addComment()` - Add review comment

### Read Operations

- **`news`**

  - `findAll()` - List all articles with filters
  - `findOne()` - Get article by ID or slug
  - `findByCategory()` - Get articles by category
  - `findByAuthor()` - Get articles by author
  - `findPublished()` - Get published articles
  - `findPending()` - Get pending approval articles

- **`news_categories`**

  - `findAll()` - List all categories
  - `findOne()` - Get category by ID

- **`news_tags`**

  - `findByArticle()` - Get tags for article

- **`news_co_authors`**

  - `findByArticle()` - Get co-authors for article

- **`news_approval`**

  - `getApprovalHistory()` - Get approval history

- **`news_review_comments`**

  - `getComments()` - Get review comments

- **`domains`**

  - Read for journalism domain

- **`user_domain_roles`**
  - Read for journalism position permissions

### Update Operations

- **`news`**

  - `update()` - Update article
  - `updateStatus()` - Update article status
  - `updateReviewStatus()` - Update review status

- **`news_categories`**

  - `update()` - Update category

- **`news`**
  - `incrementViews()` - Increment view count

### Delete Operations

- **`news`**

  - `delete()` - Soft delete article (sets deleted_at)

- **`news_co_authors`**
  - `removeCoAuthor()` - Remove co-author

---

## 8. Clubs

**Controller**: `ClubsController`, `ClubFormsController`, `ClubMembershipsController`, `ClubAnnouncementsController`  
**Service**: `ClubsService`, `ClubFormsService`, `ClubFormResponsesService`, `ClubMembershipsService`, `ClubAnnouncementsService`, `ClubBenefitsService`, `ClubFaqsService`  
**Module**: `ClubsModule`

### Create Operations

- **`clubs`**

  - `create()` - Create new club

- **`club_goals`**

  - Created with club creation

- **`club_benefits`**

  - Created with club creation

- **`club_faqs`**

  - Created with club creation

- **`student_club_memberships`**

  - `joinClub()` - Student joins club
  - `createMembership()` - Create membership

- **`club_forms`**

  - `createForm()` - Create club application form

- **`club_form_questions`**

  - `addQuestion()` - Add question to form

- **`club_form_question_options`**

  - `addOption()` - Add option to question

- **`club_form_responses`**

  - `submitResponse()` - Submit form response

- **`club_form_answers`**

  - Created with form response

- **`club_announcements`**
  - `create()` - Create club announcement

### Read Operations

- **`clubs`**

  - `findAll()` - List all clubs
  - `findOne()` - Get club by ID
  - `findByDomain()` - Get clubs by domain

- **`club_goals`**

  - Read via club.findOne() join

- **`club_benefits`**

  - Read via club.findOne() join

- **`club_faqs`**

  - Read via club.findOne() join

- **`student_club_memberships`**

  - `findByClub()` - Get club members
  - `findByStudent()` - Get student memberships
  - `findActiveMemberships()` - Get active memberships

- **`club_forms`**

  - `findAll()` - List club forms
  - `findOne()` - Get form by ID

- **`club_form_responses`**

  - `findByForm()` - Get form responses
  - `findByStudent()` - Get student responses

- **`club_announcements`**

  - `findAll()` - List club announcements
  - `findByClub()` - Get announcements for club

- **`domains`**

  - Read for club domain associations

- **`users`**
  - Read for club officers (president, vp, secretary, advisor)

### Update Operations

- **`clubs`**

  - `update()` - Update club details
  - `updateOfficers()` - Update club officers

- **`student_club_memberships`**

  - `updateMembership()` - Update membership status
  - `updatePosition()` - Update member position

- **`club_forms`**

  - `updateForm()` - Update form

- **`club_form_responses`**

  - `reviewResponse()` - Review/approve form response
  - `updateStatus()` - Update response status

- **`club_announcements`**
  - `update()` - Update announcement

### Delete Operations

- **`clubs`**

  - `delete()` - Delete club

- **`student_club_memberships`**

  - `leaveClub()` - Remove membership (sets is_active = false)

- **`club_forms`**

  - `deleteForm()` - Delete form

- **`club_form_responses`**
  - `deleteResponse()` - Delete response

---

## 9. Events

**Controller**: `EventsController`  
**Service**: `EventsService`  
**Module**: `EventsModule`

### Create Operations

- **`events`**

  - `create()` - Create new event

- **`event_schedule`**

  - Created with event creation

- **`event_highlights`**

  - Created with event creation

- **`event_additional_info`**

  - Created with event creation

- **`event_tags`**

  - Auto-created when used

- **`events_faq`**
  - Created with event creation

### Read Operations

- **`events`**

  - `findAll()` - List all events with filters
  - `findOne()` - Get event by ID
  - `findUpcoming()` - Get upcoming events
  - `findByDateRange()` - Get events in date range

- **`event_schedule`**

  - Read via event.findOne() join

- **`event_highlights`**

  - Read via event.findOne() join

- **`event_tags`**
  - Read via event.findOne() join

### Update Operations

- **`events`**
  - `update()` - Update event details
  - `updateStatus()` - Update event status

### Delete Operations

- **`events`**
  - `delete()` - Soft delete event (sets deleted_at)

---

## 10. Schedules

**Controller**: `SchedulesController`  
**Service**: `SchedulesService`  
**Module**: `SchedulesModule`

### Create Operations

- **`schedules`**

  - `create()` - Create class schedule
  - `bulkCreate()` - Bulk schedule creation

- **`student_schedule`**

  - `addStudents()` - Add students to schedule
  - Created when students assigned to section

- **`schedule_templates`**

  - `createTemplate()` - Create schedule template

- **`schedules_audit_log`**
  - `logChange()` - Log schedule changes

### Read Operations

- **`schedules`**

  - `findAll()` - List all schedules with filters
  - `findOne()` - Get schedule by ID
  - `findBySection()` - Get schedules for section
  - `findByTeacher()` - Get schedules for teacher
  - `findBySubject()` - Get schedules for subject
  - `getStudentSchedule()` - Get student's schedule

- **`student_schedule`**

  - `findBySchedule()` - Get students in schedule
  - `findByStudent()` - Get student's schedules

- **`schedule_templates`**

  - `findAll()` - List templates
  - `findOne()` - Get template by ID

- **`schedules_audit_log`**

  - `getAuditLog()` - Get schedule change history

- **`subjects`**

  - Read for schedule-subject associations

- **`teachers`**

  - Read for schedule-teacher associations

- **`sections`**

  - Read for schedule-section associations

- **`rooms`**
  - Read for schedule-room associations

### Update Operations

- **`schedules`**

  - `update()` - Update schedule details
  - `updateStatus()` - Update schedule status
  - `publish()` - Publish schedule

- **`student_schedule`**

  - `updateStudents()` - Update student assignments

- **`schedule_templates`**
  - `updateTemplate()` - Update template

### Delete Operations

- **`schedules`**

  - `delete()` - Delete schedule

- **`student_schedule`**
  - `removeStudents()` - Remove students from schedule

---

## 11. Announcements

**Controller**: `AnnouncementsController`  
**Service**: `AnnouncementsService`  
**Module**: `AnnouncementsModule`

### Create Operations

- **`announcements`**

  - `create()` - Create announcement

- **`announcement_sections`**

  - Created with announcement (section targeting)

- **`announcement_tags`**

  - Auto-created when used

- **`announcement_targets`**
  - Created with announcement (target audience)

### Read Operations

- **`announcements`**

  - `findAll()` - List all announcements
  - `findOne()` - Get announcement by ID
  - `findBySection()` - Get announcements for section
  - `findByTarget()` - Get announcements by target

- **`announcement_sections`**

  - Read via announcement.findOne() join

- **`announcement_tags`**
  - Read via announcement.findOne() join

### Update Operations

- **`announcements`**
  - `update()` - Update announcement
  - `updateStatus()` - Update announcement status

### Delete Operations

- **`announcements`**
  - `delete()` - Delete announcement

---

## 12. Gallery

**Controller**: `GalleryController`, `GalleryTagsController`  
**Service**: `GalleryItemsService`, `GalleryAlbumsService`, `GalleryTagsService`, `GalleryViewTrackerService`, `GalleryDownloadLoggerService`  
**Module**: `GalleryModule`

### Create Operations

- **`gallery_albums`**

  - `createAlbum()` - Create gallery album

- **`gallery_items`**

  - `createItem()` - Create gallery item
  - `uploadItem()` - Upload item with file

- **`gallery_tags`**

  - `createTag()` - Create tag
  - Auto-created when used

- **`gallery_item_tags`**

  - `addTag()` - Add tag to item

- **`gallery_views`**

  - `trackView()` - Track item view

- **`gallery_downloads`**
  - `logDownload()` - Log item download

### Read Operations

- **`gallery_albums`**

  - `findAll()` - List all albums
  - `findOne()` - Get album by ID

- **`gallery_items`**

  - `findAll()` - List all items with filters
  - `findOne()` - Get item by ID
  - `findByAlbum()` - Get items in album
  - `findByTag()` - Get items by tag

- **`gallery_tags`**

  - `findAll()` - List all tags
  - `findByItem()` - Get tags for item

- **`gallery_views`**

  - `getViewCount()` - Get item view count

- **`gallery_downloads`**
  - `getDownloadCount()` - Get item download count

### Update Operations

- **`gallery_albums`**

  - `updateAlbum()` - Update album

- **`gallery_items`**
  - `updateItem()` - Update item

### Delete Operations

- **`gallery_albums`**

  - `deleteAlbum()` - Delete album

- **`gallery_items`**
  - `deleteItem()` - Delete item

---

## 13. Learning Materials (Modules)

**Controller**: `ModulesController`  
**Service**: `ModulesService`  
**Module**: `ModulesModule`

### Create Operations

- **`modules`**

  - `create()` - Create module record
  - `createWithFile()` - Create module with file upload

- **`section_modules`**

  - `assignToSection()` - Assign module to section

- **`module_download_logs`**
  - `logDownload()` - Log module download

### Read Operations

- **`modules`**

  - `findAll()` - List all modules with filters
  - `findOne()` - Get module by ID
  - `findBySubject()` - Get modules by subject
  - `findBySection()` - Get modules for section
  - `findGlobal()` - Get global modules

- **`section_modules`**

  - `findBySection()` - Get modules assigned to section
  - `findByModule()` - Get sections with module

- **`module_download_logs`**

  - `getDownloadStats()` - Get download statistics

- **`subjects`**
  - Read for module-subject associations

### Update Operations

- **`modules`**

  - `update()` - Update module details

- **`section_modules`**
  - `updateVisibility()` - Update module visibility for section

### Delete Operations

- **`modules`**

  - `delete()` - Soft delete module (sets deleted_at)

- **`section_modules`**
  - `unassignFromSection()` - Remove module from section

---

## 14. Teacher Files

**Controller**: `TeacherFilesController`  
**Service**: `TeacherFilesService`, `FolderService`, `FileStorageService`, `FileDownloadLoggerService`  
**Module**: `TeacherFilesModule`

### Create Operations

- **`teacher_folders`**

  - `createFolder()` - Create folder

- **`teacher_files`**

  - `uploadFile()` - Upload file
  - `createFile()` - Create file record

- **`teacher_file_downloads`**
  - `logDownload()` - Log file download

### Read Operations

- **`teacher_folders`**

  - `findAll()` - List folders
  - `findOne()` - Get folder by ID
  - `findByTeacher()` - Get teacher's folders
  - `findBySubject()` - Get folders by subject

- **`teacher_files`**

  - `findAll()` - List files
  - `findOne()` - Get file by ID
  - `findByFolder()` - Get files in folder
  - `findByTeacher()` - Get teacher's files

- **`teacher_file_downloads`**

  - `getDownloadStats()` - Get download statistics

- **`subjects`**
  - Read for folder-subject associations

### Update Operations

- **`teacher_folders`**

  - `updateFolder()` - Update folder

- **`teacher_files`**
  - `updateFile()` - Update file details

### Delete Operations

- **`teacher_folders`**

  - `deleteFolder()` - Delete folder

- **`teacher_files`**
  - `deleteFile()` - Delete file

---

## 15. Student Activities

**Controller**: `StudentActivitiesController`  
**Service**: `StudentActivitiesService`  
**Module**: `StudentActivitiesModule`

### Create Operations

- **`student_activities`**
  - `create()` - Create activity record
  - Called by other services (quiz, news, etc.) to log activities

### Read Operations

- **`student_activities`**
  - `findAll()` - List activities with filters
  - `findByStudent()` - Get activities for student
  - `findByType()` - Get activities by type
  - `findByDateRange()` - Get activities in date range
  - `getTimeline()` - Get student activity timeline

### Update Operations

- **`student_activities`**
  - `update()` - Update activity
  - `updateVisibility()` - Update activity visibility

### Delete Operations

- **`student_activities`**
  - `delete()` - Delete activity

---

## 16. GWA & Rankings

**Controller**: `GwaController`, `GwaPublicController`, `TopPerformersController`  
**Service**: `GwaService`, `TopPerformersService`  
**Module**: `GwaModule`, `TopPerformersModule`

### Create Operations

- **`students_gwa`**

  - `calculateGWA()` - Calculate General Weighted Average

- **`student_rankings`**
  - `calculateRankings()` - Calculate student rankings

### Read Operations

- **`students_gwa`**

  - `findAll()` - List all GWAs
  - `findByStudent()` - Get student GWA
  - `findByGradeLevel()` - Get GWAs by grade level

- **`student_rankings`**
  - `findAll()` - List rankings
  - `findByStudent()` - Get student ranking
  - `findTopPerformers()` - Get top performers

### Update Operations

- **`students_gwa`**

  - `recalculateGWA()` - Recalculate GWA

- **`student_rankings`**
  - `recalculateRankings()` - Recalculate rankings

### Delete Operations

- None (calculated data, not manually deleted)

---

## 17. Alerts & Notifications

### 17.1 Alerts

**Controller**: `AlertsController`  
**Service**: `AlertsService`  
**Module**: `AlertsModule`

#### Create Operations

- **`alerts`**

  - `create()` - Create alert

- **`alert_reads`**
  - `markAsRead()` - Mark alert as read

#### Read Operations

- **`alerts`**

  - `findAll()` - List all alerts
  - `findOne()` - Get alert by ID
  - `findUnread()` - Get unread alerts for user

- **`alert_reads`**
  - `findByUser()` - Get read alerts for user

#### Update Operations

- **`alerts`**
  - `update()` - Update alert

#### Delete Operations

- **`alerts`**
  - `delete()` - Delete alert

### 17.2 Banner Notifications

**Controller**: `BannerNotificationsController`  
**Service**: `BannerNotificationsService`  
**Module**: `BannerNotificationsModule`

#### Create Operations

- **`banner_notifications`**
  - `create()` - Create banner notification

#### Read Operations

- **`banner_notifications`**
  - `findAll()` - List all banners
  - `findActive()` - Get active banners

#### Update Operations

- **`banner_notifications`**
  - `update()` - Update banner
  - `updateStatus()` - Update banner status

#### Delete Operations

- **`banner_notifications`**
  - `delete()` - Delete banner

---

## 18. Facilities & Infrastructure

### 18.1 Buildings

**Controller**: `BuildingsController`  
**Service**: `BuildingsService`  
**Module**: `BuildingsModule`

#### Create Operations

- **`buildings`**
  - `create()` - Create building

#### Read Operations

- **`buildings`**
  - `findAll()` - List all buildings
  - `findOne()` - Get building by ID

#### Update Operations

- **`buildings`**
  - `update()` - Update building

#### Delete Operations

- **`buildings`**
  - `delete()` - Delete building

### 18.2 Floors

**Controller**: `FloorsController`  
**Service**: `FloorsService`  
**Module**: `FloorsModule`

#### Create Operations

- **`floors`**
  - `create()` - Create floor

#### Read Operations

- **`floors`**
  - `findAll()` - List all floors
  - `findByBuilding()` - Get floors for building

#### Update Operations

- **`floors`**
  - `update()` - Update floor

#### Delete Operations

- **`floors`**
  - `delete()` - Delete floor

### 18.3 Rooms

**Controller**: `RoomsController`  
**Service**: `RoomsService`  
**Module**: `RoomsModule`

#### Create Operations

- **`rooms`**
  - `create()` - Create room

#### Read Operations

- **`rooms`**
  - `findAll()` - List all rooms
  - `findOne()` - Get room by ID
  - `findByFloor()` - Get rooms for floor
  - `findByBuilding()` - Get rooms for building

#### Update Operations

- **`rooms`**
  - `update()` - Update room

#### Delete Operations

- **`rooms`**
  - `delete()` - Delete room

### 18.4 Campus Facilities

**Controller**: `CampusFacilitiesController`  
**Service**: `CampusFacilitiesService`  
**Module**: `CampusFacilitiesModule`

#### Create Operations

- **`campus_facilities`**
  - `create()` - Create campus facility

#### Read Operations

- **`campus_facilities`**
  - `findAll()` - List all facilities
  - `findOne()` - Get facility by ID

#### Update Operations

- **`campus_facilities`**
  - `update()` - Update facility

#### Delete Operations

- **`campus_facilities`**
  - `delete()` - Delete facility

### 18.5 Locations & Hotspots

**Controller**: `LocationsController`, `HotspotsController`  
**Service**: `LocationsService`, `HotspotsService`  
**Module**: `LocationsModule`, `HotspotsModule`

#### Create Operations

- **`locations`**

  - `create()` - Create location

- **`hotspots`**
  - `create()` - Create hotspot

#### Read Operations

- **`locations`**

  - `findAll()` - List all locations
  - `findOne()` - Get location by ID

- **`hotspots`**
  - `findAll()` - List all hotspots
  - `findByLocation()` - Get hotspots for location

#### Update Operations

- **`locations`**

  - `update()` - Update location

- **`hotspots`**
  - `update()` - Update hotspot

#### Delete Operations

- **`locations`**

  - `delete()` - Delete location

- **`hotspots`**
  - `delete()` - Delete hotspot

---

## 19. Departments

**Controller**: `DepartmentsController`, `DepartmentsInformationController`  
**Service**: `DepartmentsService`, `DepartmentsInformationService`  
**Module**: `DepartmentsModule`, `DepartmentsInformationModule`

### Create Operations

- **`departments`**

  - `create()` - Create department

- **`departments_information`**
  - `create()` - Create department information

### Read Operations

- **`departments`**

  - `findAll()` - List all departments
  - `findOne()` - Get department by ID
  - `findActive()` - Get active departments

- **`departments_information`**
  - `findByDepartment()` - Get information for department

### Update Operations

- **`departments`**

  - `update()` - Update department
  - `updateStatus()` - Update department status

- **`departments_information`**
  - `update()` - Update department information

### Delete Operations

- **`departments`**
  - `delete()` - Soft delete department (sets is_active = false)

---

## 20. Subjects

**Controller**: `SubjectsController`  
**Service**: `SubjectsService`  
**Module**: `SubjectsModule`

### Create Operations

- **`subjects`**
  - `create()` - Create subject

### Read Operations

- **`subjects`**
  - `findAll()` - List all subjects with filters
  - `findOne()` - Get subject by ID
  - `findByGradeLevel()` - Get subjects by grade level
  - `findByDepartment()` - Get subjects by department

### Update Operations

- **`subjects`**
  - `update()` - Update subject
  - `updateStatus()` - Update subject status

### Delete Operations

- **`subjects`**
  - `delete()` - Soft delete subject (sets is_deleted)

---

## 21. Sections

**Controller**: `SectionsController`  
**Service**: `SectionsService`  
**Module**: `SectionsModule`

### Create Operations

- **`sections`**
  - `create()` - Create section

### Read Operations

- **`sections`**
  - `findAll()` - List all sections
  - `findOne()` - Get section by ID
  - `findByGradeLevel()` - Get sections by grade level
  - `findByTeacher()` - Get sections by teacher (advisory)

### Update Operations

- **`sections`**
  - `update()` - Update section
  - `updateStatus()` - Update section status
  - `updateTeacher()` - Update advisory teacher

### Delete Operations

- **`sections`**
  - `delete()` - Soft delete section (sets status)

---

## 22. Chat Service

**Controller**: `ChatController`  
**Service**: `ChatService`  
**Module**: `ChatModule`

### Create Operations

- **`conversations`**

  - `createDirectConversation()` - Create direct conversation (Admin↔Admin, Teacher↔Admin, Teacher↔Teacher)
  - `getOrCreateSectionGroupChat()` - Create or get section group chat

- **`conversation_participants`**

  - Created automatically with conversation creation
  - `addParticipant()` - Add participant to conversation

- **`messages`**
  - `sendMessage()` - Send message in conversation

### Read Operations

- **`conversations`**

  - `getConversations()` - Get user's conversations (paginated)
  - `getConversation()` - Get conversation by ID

- **`conversation_participants`**

  - Read via conversation queries
  - `getParticipants()` - Get conversation participants

- **`messages`**

  - `getMessages()` - Get messages for conversation (paginated)
  - `getUnreadCount()` - Get unread message count

- **`users`**

  - Read for user role checks (canChat validation)
  - Read for participant information

- **`sections`**

  - Read for section group chat creation
  - Read for section validation

- **`students`**
  - Read for section group chat participants

### Update Operations

- **`conversations`**

  - `update()` - Update conversation (updated_at on new message)

- **`conversation_participants`**
  - `markAsRead()` - Update last_read_at timestamp

### Delete Operations

- **`conversations`**

  - `deleteConversation()` - Delete conversation (cascades to participants and messages)

- **`conversation_participants`**
  - `removeParticipant()` - Remove participant from conversation

---

## 23. Other Modules

### 23.1 Domains

**Controller**: `DomainsController`  
**Service**: `DomainsService`  
**Module**: `DomainsModule`

- **Create**: `domains` - Create domain
- **Read**: `domains`, `domain_roles` - List domains and roles
- **Update**: `domains` - Update domain
- **Delete**: `domains` - Delete domain

### 23.2 FAQ

**Controller**: `FaqController`  
**Service**: `FaqService`  
**Module**: `FaqModule`

- **Create**: `faq` - Create FAQ
- **Read**: `faq` - List FAQs
- **Update**: `faq` - Update FAQ
- **Delete**: `faq` - Delete FAQ

### 23.3 Search

**Controller**: `SearchController`  
**Service**: `SearchService`  
**Module**: `SearchModule`

- **Read**: Multiple tables - Global search across system

### 23.4 Admin Dashboard

**Controller**: `AdminDashboardController`  
**Service**: `AdminDashboardService`  
**Module**: `AdminDashboardModule`

- **Read**: Multiple tables - Dashboard statistics and analytics

### 23.5 Desktop Sidebar

**Controller**: `DesktopSidebarController`  
**Service**: `DesktopSidebarService`  
**Module**: `DesktopSidebarModule`

- **Read**: Multiple tables - Sidebar menu data

### 23.6 Teacher Activity

**Controller**: `TeacherActivityController`  
**Service**: `TeacherActivityService`  
**Module**: `TeacherActivityModule`

- **Create**: Teacher activity tracking
- **Read**: Teacher activity logs

---

## Summary Statistics

### Total CRUD Operations by Type

- **Create Operations**: ~200+ methods across all modules
- **Read Operations**: ~300+ methods across all modules
- **Update Operations**: ~150+ methods across all modules
- **Delete Operations**: ~80+ methods across all modules

### Database Tables with Most Activity

1. **`users`** - 50+ operations (create, read, update across multiple modules)
2. **`quizzes`** - 40+ operations (complex quiz system)
3. **`quiz_attempts`** - 30+ operations
4. **`quiz_questions`** - 25+ operations
5. **`news`** - 20+ operations
6. **`schedules`** - 20+ operations
7. **`students`** - 20+ operations
8. **`clubs`** - 15+ operations
9. **`conversations`** - 10+ operations (chat service)
10. **`messages`** - 10+ operations (chat service)

### Cross-Module Dependencies

Many modules read from shared tables:

- **`users`** - Read by almost all modules
- **`roles`** - Read for authorization
- **`sections`** - Read for student/teacher associations
- **`subjects`** - Read for academic associations
- **`domains`** - Read for domain-based access control

---

## Notes

1. **Soft Deletes**: Many tables use soft delete (deleted_at column) instead of hard deletes
2. **Audit Logs**: Several modules maintain audit logs (schedules, news approval)
3. **Caching**: Some read operations use caching (quiz cache, role cache)
4. **RLS (Row Level Security)**: Supabase RLS policies enforce data access at database level
5. **File Storage**: File uploads go to Cloudflare R2, metadata stored in database
6. **Real-time**: Chat service uses Supabase Realtime for instant updates

---

**Document Version**: 1.0  
**Last Updated**: January 2025
