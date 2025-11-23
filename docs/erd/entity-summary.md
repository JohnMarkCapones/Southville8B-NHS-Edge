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

- `domains` (5 columns): `id`, `type`, `name`, `created_at`, `created_by`
- `domain_roles` (4 columns): `id`, `created_at`, `domain_id`, `name`
- `domain_role_permissions` (5 columns): `id`, `created_at`, `domain_role_id`, `permission_id`, `allowed`
- `user_domain_roles` (4 columns): `id`, `created_at`, `user_id`, `domain_role_id`
- `positions` (7 columns): `id`, `role_id`, `name`, `description`, `key`, `created_at`, `updated_at`

### Academic Structure (5 entities)

- `departments` (7 columns): `id`, `department_name`, `description`, `head_id`, `created_at`, `updated_at`, `is_active`
- `departments_information` (9 columns): `id`, `department_id`, `office_name`, `contact_person`, `description`, `email`, `contact_number`, `created_at`, `updated_at`
- `subjects` (13 columns): `id`, `subject_name`, `description`, `grade_level`, `department_id`, `color_hex`, `created_at`, `updated_at`, `code`, `status`, `visibility`, `grade_levels`, `is_deleted`
- `sections` (10 columns): `id`, `name`, `grade_level`, `teacher_id`, `created_at`, `updated_at`, `room_id`, `building_id`, `floor_id`, `status`
- `section_modules` (6 columns): `id`, `section_id`, `module_id`, `visible`, `assigned_at`, `assigned_by`

### Scheduling (5 entities)

- `schedules` (19 columns): `id`, `subject_id`, `teacher_id`, `section_id`, `room_id`, `building_id`, `day_of_week`, `start_time`, `end_time`, `school_year`, `semester`, `created_at`, `updated_at`, `status`, `is_published`, `published_at`, `recurring_rule`, `version`, `grading_period`
- `schedule_templates` (8 columns): `id`, `name`, `description`, `grade_level`, `payload`, `created_by`, `created_at`, `updated_at`
- `schedule_audit` (6 columns): `id`, `schedule_id`, `action`, `actor_id`, `diff`, `created_at`
- `schedules_audit_log` (9 columns): `id`, `schedule_id`, `actor_user_id`, `action`, `changed_fields`, `before`, `after`, `note`, `created_at`
- `student_schedule` (4 columns): `id`, `schedule_id`, `student_id`, `created_at`

### Quiz System (21 entities)

- `quizzes` (26 columns): `quiz_id`, `title`, `description`, `subject_id`, `teacher_id`, `type`, `grading_type`, `time_limit`, `start_date`, `end_date`, `status`, `version`, `parent_quiz_id`, `visibility`, `question_pool_size`, `questions_to_display`, `allow_retakes`, `allow_backtracking`, `shuffle_questions`, `shuffle_choices`, `total_points`, `passing_score`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`
- `quiz_settings` (25 columns): `id`, `quiz_id`, `lockdown_browser`, `anti_screenshot`, `disable_copy_paste`, `disable_right_click`, `require_fullscreen`, `track_tab_switches`, `track_device_changes`, `track_ip_changes`, `tab_switch_warning_threshold`, `created_at`, `secured_quiz`, `quiz_lockdown`, `lockdown_ui`, `question_pool`, `stratified_sampling`, `total_questions`, `pool_size`, `strict_time_limit`, `auto_save`, `backtracking_control`, `visibility`, `access_code`, `publish_mode`
- `quiz_questions` (23 columns): `question_id`, `quiz_id`, `question_text`, `question_type`, `order_index`, `points`, `allow_partial_credit`, `time_limit_seconds`, `is_pool_question`, `source_question_bank_id`, `created_at`, `updated_at`, `correct_answer`, `settings`, `description`, `is_required`, `is_randomize`, `case_sensitive`, `whitespace_sensitive`, `question_image_id`, `question_image_url`, `question_image_file_size`, `question_image_mime_type`
  (4 columns): `id`, `quiz_id`, `section_id`, `assigned_at`
- `quiz_section_settings` (7 columns): `id`, `quiz_id`, `section_id`, `start_date`, `end_date`, `time_limit_override`, `created_at`
- `quiz_attempts` (14 columns): `attempt_id`, `quiz_id`, `student_id`, `attempt_number`, `score`, `max_possible_score`, `status`, `terminated_by_teacher`, `termination_reason`, `started_at`, `submitted_at`, `time_taken_seconds`, `questions_shown`, `created_at`
- `quiz_student_answers` (14 columns): `answer_id`, `attempt_id`, `question_id`, `choice_id`, `choice_ids`, `answer_text`, `answer_json`, `points_awarded`, `is_correct`, `graded_by`, `graded_at`, `grader_feedback`, `time_spent_seconds`, `answered_at`
- `quiz_student_summary` (12 columns): `id`, `student_id`, `quiz_id`, `last_attempt_id`, `attempts_count`, `highest_score`, `lowest_score`, `latest_score`, `average_score`, `status`, `passed`, `last_updated`
- `quiz_participants` (15 columns): `id`, `session_id`, `quiz_id`, `student_id`, `status`, `progress`, `current_question_index`, `questions_answered`, `total_questions`, `start_time`, `end_time`, `flag_count`, `idle_time_seconds`, `created_at`, `updated_at`
- `quiz_active_sessions` (15 columns): `session_id`, `quiz_id`, `student_id`, `attempt_id`, `started_at`, `last_synced_at`, `is_active`, `initial_device_fingerprint`, `initial_ip_address`, `initial_user_agent`, `last_heartbeat`, `current_device_fingerprint`, `current_ip_address`, `current_user_agent`, `terminated_reason`
- `quiz_session_answers` (9 columns): `id`, `session_id`, `question_id`, `temporary_choice_id`, `temporary_choice_ids`, `temporary_answer_text`, `temporary_answer_json`, `last_updated`, `time_spent_seconds`
- `quiz_access_links` (15 columns): `link_id`, `quiz_id`, `access_token`, `link_type`, `is_active`, `expires_at`, `access_code`, `max_uses`, `use_count`, `requires_auth`, `is_revoked`, `revoked_at`, `created_by`, `created_at`, `last_used_at`
- `quiz_access_logs` (10 columns): `id`, `link_id`, `quiz_id`, `student_id`, `accessed_at`, `ip_address`, `user_agent`, `access_granted`, `denial_reason`, `metadata`
- `quiz_device_sessions` (11 columns): `id`, `session_id`, `device_fingerprint`, `ip_address`, `user_agent`, `screen_resolution`, `browser_info`, `device_type`, `first_seen_at`, `last_seen_at`, `is_current`
- `quiz_activity_logs` (9 columns): `id`, `participant_id`, `session_id`, `quiz_id`, `student_id`, `event_type`, `message`, `metadata`, `timestamp`
- `quiz_analytics` (14 columns): `id`, `quiz_id`, `total_attempts`, `total_students`, `completed_attempts`, `average_score`, `highest_score`, `lowest_score`, `median_score`, `pass_rate`, `average_time_taken_seconds`, `fastest_completion_seconds`, `slowest_completion_seconds`, `last_calculated_at`
- `quiz_flags` (10 columns): `id`, `participant_id`, `session_id`, `quiz_id`, `student_id`, `flag_type`, `message`, `severity`, `metadata`, `timestamp`
- `quiz_question_stats` (11 columns): `id`, `question_id`, `quiz_id`, `total_attempts`, `correct_count`, `incorrect_count`, `skipped_count`, `difficulty_score`, `average_time_spent_seconds`, `discrimination_index`, `last_calculated_at`
- `quiz_question_metadata` (5 columns): `id`, `question_id`, `metadata_type`, `metadata`, `created_at`
- `question_bank` (23 columns): `id`, `teacher_id`, `question_text`, `question_type`, `subject_id`, `topic`, `difficulty`, `tags`, `default_points`, `choices`, `correct_answer`, `allow_partial_credit`, `time_limit_seconds`, `created_at`, `updated_at`, `explanation`, `is_public`, `is_deleted`, `question_image_id`, `question_image_url`, `question_image_file_size`, `question_image_mime_type`, `choices_image_data`

### Clubs (12 entities)

- `clubs` (21 columns): `id`, `name`, `description`, `president_id`, `vp_id`, `secretary_id`, `advisor_id`, `domain_id`, `created_at`, `updated_at`, `co_advisor_id`, `mission_statement`, `mission_title`, `mission_description`, `email`, `championship_wins`, `benefits_title`, `benefits_description`, `club_image`, `r2_club_image_key`, `club_logo`
- `club_announcements` (8 columns): `id`, `club_id`, `title`, `content`, `priority`, `created_by`, `created_at`, `updated_at`
- `club_benefits` (7 columns): `id`, `club_id`, `title`, `description`, `order_index`, `created_at`, `updated_at`
- `club_faqs` (7 columns): `id`, `club_id`, `question`, `answer`, `order_index`, `created_at`, `updated_at`
- `club_goals` (6 columns): `id`, `club_id`, `goal_text`, `order_index`, `created_at`, `updated_at`
- `club_positions` (6 columns): `id`, `name`, `description`, `level`, `created_at`, `updated_at`
- `student_club_memberships` (8 columns): `id`, `student_id`, `club_id`, `position_id`, `joined_at`, `is_active`, `created_at`, `updated_at`
- `club_forms` (10 columns): `id`, `club_id`, `created_by`, `name`, `description`, `is_active`, `auto_approve`, `form_type`, `created_at`, `updated_at`
- `club_form_questions` (8 columns): `id`, `form_id`, `question_text`, `question_type`, `required`, `order_index`, `created_at`, `updated_at`
- `club_form_question_options` (6 columns): `id`, `question_id`, `option_text`, `option_value`, `order_index`, `created_at`
- `club_form_responses` (9 columns): `id`, `form_id`, `user_id`, `status`, `reviewed_by`, `reviewed_at`, `review_notes`, `created_at`, `updated_at`
- `club_form_answers` (6 columns): `id`, `response_id`, `question_id`, `answer_text`, `answer_value`, `created_at`

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
