# Supabase Public Schema - Entity Summary

## Total Entities: **111 tables**

## Entity Breakdown by Category

### Academic Management (7 entities)

- `academic_calendar` (10 columns): `id`, `year`, `month_name`, `term`, `start_date`, `end_date`, `total_days`, `description`, `created_at`, `updated_at`
- `academic_calendar_days` (12 columns): `id`, `academic_calendar_id`, `date`, `day_of_week`, `week_number`, `is_weekend`, `is_holiday`, `is_current_day`, `marker_icon`, `marker_color`, `note`, `created_at`
- `academic_calendar_markers` (8 columns): `id`, `academic_calendar_id`, `academic_calendar_day_id`, `color`, `icon`, `label`, `order_priority`, `created_at`
- `academic_periods` (13 columns): `id`, `academic_year_id`, `period_name`, `period_order`, `start_date`, `end_date`, `is_grading_period`, `weight`, `description`, `created_at`, `updated_at`, `created_by`, `updated_by`
- `academic_year_settings` (7 columns): `id`, `setting_key`, `setting_value`, `description`, `created_at`, `updated_at`, `updated_by`
- `academic_year_templates` (9 columns): `id`, `template_name`, `structure`, `description`, `periods_config`, `is_default`, `created_at`, `updated_at`, `created_by`
- `academic_years` (12 columns): `id`, `year_name`, `start_date`, `end_date`, `structure`, `is_active`, `is_archived`, `description`, `created_at`, `updated_at`, `created_by`, `updated_by`

### User Management (9 entities)

- `users` (9 columns): `id`, `full_name`, `email`, `password_hash`, `role_id`, `created_at`, `updated_at`, `status`, `last_login_at`
- `profiles` (7 columns): `id`, `user_id`, `avatar`, `address`, `bio`, `phone_number`, `social_media_links`
- `students` (15 columns): `id`, `user_id`, `first_name`, `last_name`, `middle_name`, `student_id`, `lrn_id`, `grade_level`, `enrollment_year`, `honor_status`, `rank`, `section_id`, `age`, `birthday`, `deleted_at`
- `teachers` (13 columns): `id`, `user_id`, `first_name`, `last_name`, `middle_name`, `age`, `subject_specialization_id`, `department_id`, `advisory_section_id`, `created_at`, `updated_at`, `birthday`, `deleted_at`
- `admins` (6 columns): `id`, `user_id`, `role_description`, `name`, `email`, `phone_number`
- `roles` (4 columns): `id`, `name`, `created_at`, `updated_at`
- `permissions` (4 columns): `id`, `key`, `description`, `created_at`
- `user_positions` (4 columns): `id`, `user_id`, `position_id`, `assigned_at`
- `user_preferences` (8 columns): `id`, `user_id`, `web_theme`, `desktop_theme`, `language`, `created_at`, `updated_at`, `deleted_at`

### Domain & Access Control (5 entities)

- `domains` (5 columns)
- `domain_roles` (4 columns)
- `domain_role_permissions` (5 columns)
- `user_domain_roles` (4 columns)
- `positions` (7 columns)

### Academic Structure (5 entities)

- `departments` (7 columns)
- `departments_information` (9 columns)
- `subjects` (13 columns)
- `sections` (10 columns)
- `section_modules` (6 columns)

### Scheduling (4 entities)

- `schedules` (19 columns)
- `schedule_templates` (8 columns)
- `schedule_audit` (6 columns)
- `schedules_audit_log` (9 columns)
- `student_schedule` (4 columns)

### Quiz System (20 entities)

- `quizzes` (26 columns)
- `quiz_settings` (25 columns)
- `quiz_questions` (19 columns)
- `quiz_choices` (7 columns)
- `quiz_sections` (4 columns)
- `quiz_section_settings` (7 columns)
- `quiz_attempts` (14 columns)
- `quiz_student_answers` (14 columns)
- `quiz_student_summary` (12 columns)
- `quiz_participants` (15 columns)
- `quiz_active_sessions` (15 columns)
- `quiz_session_answers` (9 columns)
- `quiz_access_links` (15 columns)
- `quiz_access_logs` (10 columns)
- `quiz_device_sessions` (11 columns)
- `quiz_activity_logs` (9 columns)
- `quiz_analytics` (14 columns)
- `quiz_flags` (10 columns)
- `quiz_question_stats` (11 columns)
- `quiz_question_metadata` (5 columns)
- `question_bank` (18 columns)

### Clubs (12 entities)

- `clubs` (21 columns)
- `club_announcements` (8 columns)
- `club_benefits` (7 columns)
- `club_faqs` (7 columns)
- `club_goals` (6 columns)
- `club_positions` (6 columns)
- `student_club_memberships` (8 columns)
- `club_forms` (10 columns)
- `club_form_questions` (8 columns)
- `club_form_question_options` (6 columns)
- `club_form_responses` (9 columns)
- `club_form_answers` (6 columns)

### Events (7 entities)

- `events` (21 columns)
- `event_schedule` (6 columns)
- `event_highlights` (7 columns)
- `event_additional_info` (6 columns)
- `event_tags` (2 columns)
- `events_faq` (5 columns)

### News & Announcements (8 entities)

- `news` (22 columns)
- `news_categories` (6 columns)
- `news_tags` (2 columns)
- `news_co_authors` (5 columns)
- `news_approval` (6 columns)
- `news_review_comments` (8 columns)
- `announcements` (9 columns)
- `announcement_sections` (4 columns)
- `announcement_tags` (2 columns)
- `announcement_targets` (2 columns)

### Gallery (6 entities)

- `gallery_albums` (21 columns)
- `gallery_items` (29 columns)
- `gallery_tags` (8 columns)
- `gallery_item_tags` (5 columns)
- `gallery_views` (6 columns)
- `gallery_downloads` (7 columns)

### Messaging/Chat (3 entities)

- `conversations` (6 columns)
- `conversation_participants` (5 columns)
- `messages` (7 columns)

### Alerts & Notifications (3 entities)

- `alerts` (10 columns)
- `alert_reads` (5 columns)
- `banner_notifications` (15 columns)

### Facilities & Infrastructure (4 entities)

- `buildings` (6 columns)
- `floors` (6 columns)
- `rooms` (9 columns)
- `campus_facilities` (13 columns)
- `locations` (7 columns)
- `hotspots` (7 columns)

### Teacher Resources (3 entities)

- `teacher_folders` (11 columns)
- `teacher_files` (16 columns)
- `teacher_file_downloads` (7 columns)

### Learning Materials (2 entities)

- `modules` (15 columns)
- `module_download_logs` (7 columns)

### Student Activities & Performance (3 entities)

- `student_activities` (15 columns)
- `student_rankings` (9 columns)
- `students_gwa` (10 columns)

### Miscellaneous (4 entities)

- `tags` (5 columns)
- `faq` (5 columns)
- `emergency_contacts` (10 columns)
- `daily_logins` (4 columns)
- `user_push_tokens` (6 columns)

## Next Steps for ERD Creation

1. **Identify Core Entities**: Start with primary entities (users, students, teachers, admins)
2. **Map Relationships**: Identify foreign key relationships between entities
3. **Group by Domain**: Organize entities by functional domain (Academic, Quiz, Clubs, etc.)
4. **Create ERD Diagram**: Use Mermaid or your preferred diagramming tool
