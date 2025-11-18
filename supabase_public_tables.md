// ============================================================================
// SUPABASE DATABASE SCHEMA - dbdiagram (dbml) Format
// Southville 8B NHS Edge - Database Schema Documentation
// ============================================================================
// This schema is organized by domain/feature modules for better readability
// and documentation purposes, following capstone manuscript best practices.
// ============================================================================

// ============================================================================
// SECTION 1: CORE / USER MANAGEMENT & AUTHENTICATION
// ============================================================================
// Core user management, authentication, authorization, and user preferences

Table users {
id uuid [pk, default: `gen_random_uuid()`]
full_name varchar
email varchar [unique]
password_hash varchar
role_id uuid
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
status varchar [default: 'Active']
last_login_at timestamp
}

Table roles {
id uuid [pk, default: `gen_random_uuid()`]
name varchar [unique]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table profiles {
id uuid [pk, default: `gen_random_uuid()`]
user_id uuid [unique]
avatar varchar
address varchar
bio text
phone_number varchar
social_media_links json
}

Table user_preferences {
id uuid [pk, default: `gen_random_uuid()`]
user_id uuid [unique]
web_theme varchar [default: 'light']
desktop_theme varchar [default: 'light']
language varchar [default: 'en']
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
deleted_at timestamp
}

Table user_positions {
id uuid [pk, default: `gen_random_uuid()`]
user_id uuid
position_id uuid
assigned_at timestamp [default: `now()`]
}

Table user_domain_roles {
id uuid [pk, default: `gen_random_uuid()`]
created_at timestamp [default: `now()`]
user_id uuid
domain_role_id uuid
}

Table permissions {
id uuid [pk, default: `gen_random_uuid()`]
key text [unique]
description text
created_at timestamp [default: `now()`]
}

Table domain_roles {
id uuid [pk, default: `gen_random_uuid()`]
created_at timestamp [default: `now()`]
domain_id uuid
name text
}

Table domains {
id uuid [pk, default: `gen_random_uuid()`]
type text
name text
created_at timestamp [default: `now()`]
created_by uuid
}

Table domain_role_permissions {
id decimal [pk]
created_at timestamp [default: `now()`]
domain_role_id uuid
permission_id uuid
allowed boolean
}

Table positions {
id uuid [pk, default: `gen_random_uuid()`]
role_id uuid
name varchar
description varchar
key varchar [unique]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table user_push_tokens {
id uuid [pk, default: `gen_random_uuid()`]
user_id uuid
token text
platform array [note: "Allowed values: 'ios'::text, 'android'::text, 'web'::text"]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table daily_logins {
id uuid [pk, default: `gen_random_uuid()`]
user_id uuid
login_date date [default: `CURRENT_DATE`]
created_at timestamp [default: `now()`]
}

// ============================================================================
// SECTION 2: STUDENT MANAGEMENT
// ============================================================================
// Student profiles, activities, rankings, grades, and emergency contacts

Table students {
id uuid [pk, default: `gen_random_uuid()`]
user_id uuid [unique]
first_name text
last_name text
middle_name text
student_id text
lrn_id text
grade_level text
enrollment_year int
honor_status text
rank int
section_id uuid
age int
birthday date
deleted_at timestamp
}

Table student_activities {
id uuid [pk, default: `gen_random_uuid()`]
student_user_id uuid
activity_type varchar
title varchar
description text
metadata json [default: '{}']
related_entity_id uuid
related_entity_type varchar
icon varchar
color varchar
is_highlighted boolean [default: false]
is_visible boolean [default: true]
activity_timestamp timestamp [default: `now()`]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table student_club_memberships {
id uuid [pk, default: `gen_random_uuid()`]
student_id uuid
club_id uuid
position_id uuid
joined_at date [default: `now()`]
is_active boolean [default: true]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table student_rankings {
id uuid [pk, default: `gen_random_uuid()`]
student_id uuid
grade_level varchar
rank int [note: "Range: 1 to "]
honor_status varchar
quarter varchar
school_year varchar
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table student_schedule {
id uuid [pk, default: `gen_random_uuid()`]
schedule_id uuid
student_id uuid
created_at timestamp [default: `now()`]
}

Table students_gwa {
id uuid [pk, default: `gen_random_uuid()`]
student_id uuid
gwa decimal [note: "Range: 50.00 to "]
grading_period array [note: "Allowed values: 'Q1'::character varying, 'Q2'::character varying, 'Q3'::character varying, 'Q4'::character varying"]
school_year varchar
remarks varchar
honor_status varchar [default: 'None']
recorded_by uuid
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table emergency_contacts {
id uuid [pk, default: `gen_random_uuid()`]
student_id uuid
guardian_name varchar
relationship varchar
phone_number varchar
email varchar
address varchar
is_primary boolean [default: false]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

// ============================================================================
// SECTION 3: TEACHER MANAGEMENT
// ============================================================================
// Teacher profiles and information

Table teachers {
id uuid [pk, default: `gen_random_uuid()`]
user_id uuid [unique]
first_name varchar
last_name varchar
middle_name varchar
age int
subject_specialization_id uuid
department_id uuid
advisory_section_id uuid
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
birthday date
deleted_at timestamp
}

// ============================================================================
// SECTION 4: ADMIN MANAGEMENT
// ============================================================================
// Administrator profiles and information

Table admins {
id uuid [pk, default: `gen_random_uuid()`]
user_id uuid [unique]
role_description text
name varchar
email varchar [unique]
phone_number varchar
}

// ============================================================================
// SECTION 5: ACADEMIC MANAGEMENT
// ============================================================================
// Academic years, periods, calendar, and academic settings

Table academic_years {
id uuid [pk, default: `gen_random_uuid()`]
year_name varchar [unique]
start_date date
end_date date
structure array [default: 'quarters', note: "Allowed values: 'quarters'::character varying, 'semesters'::character varying, 'trimesters'::character varying, 'cus"]
is_active boolean [default: false]
is_archived boolean [default: false]
description text
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
created_by uuid
updated_by uuid
}

Table academic_periods {
id uuid [pk, default: `gen_random_uuid()`]
academic_year_id uuid
period_name varchar
period_order int
start_date date
end_date date
is_grading_period boolean [default: true]
weight decimal [default: 1.00, note: "Range: 0::numeric to "]
description text
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
created_by uuid
updated_by uuid
}

Table academic_year_settings {
id uuid [pk, default: `gen_random_uuid()`]
setting_key varchar [unique]
setting_value json
description text
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
updated_by uuid
}

Table academic_year_templates {
id uuid [pk, default: `gen_random_uuid()`]
template_name varchar [unique]
structure array [note: "Allowed values: 'quarters'::character varying, 'semesters'::character varying, 'trimesters'::character varying"]
description text
periods_config json
is_default boolean [default: false]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
created_by uuid
}

Table academic_calendar {
id uuid [pk, default: `gen_random_uuid()`]
year varchar
month_name varchar
term varchar
start_date date
end_date date
total_days int
description text
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table academic_calendar_days {
id bigint [pk]
academic_calendar_id uuid
date date [unique]
day_of_week varchar
week_number int
is_weekend boolean [default: false]
is_holiday boolean [default: false]
is_current_day boolean [default: false]
marker_icon varchar
marker_color varchar
note text
created_at timestamp [default: `now()`]
}

Table academic_calendar_markers {
id bigint [pk]
academic_calendar_id uuid
academic_calendar_day_id bigint
color varchar
icon varchar
label varchar
order_priority int [default: 0]
created_at timestamp [default: `now()`]
}

// ============================================================================
// SECTION 6: SUBJECT & DEPARTMENT MANAGEMENT
// ============================================================================
// Subject catalog, departments, and department information

Table subjects {
id uuid [pk, default: `gen_random_uuid()`]
subject_name varchar
description text
grade_level int
department_id uuid
color_hex varchar
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
code varchar [unique]
status varchar [default: 'inactive']
visibility varchar [default: 'public']
grade_levels array [default: '{}']
is_deleted boolean [default: false]
}

Table departments {
id uuid [pk, default: `gen_random_uuid()`]
department_name varchar [unique]
description text
head_id uuid
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
is_active boolean [default: true]
}

Table departments_information {
id uuid [pk, default: `gen_random_uuid()`]
department_id uuid
office_name varchar
contact_person varchar
description text
email varchar
contact_number varchar
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

// ============================================================================
// SECTION 7: SCHEDULE & SECTION MANAGEMENT
// ============================================================================
// Class sections, schedules, schedule templates, and audit logs

Table sections {
id uuid [pk, default: `gen_random_uuid()`]
name varchar
grade_level varchar
teacher_id uuid
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
room_id uuid
building_id uuid
floor_id uuid
status array [default: 'active', note: "Allowed values: 'active'::character varying, 'inactive'::character varying, 'archived'::character varying"]
}

Table schedules {
id uuid [pk, default: `gen_random_uuid()`]
subject_id uuid
teacher_id uuid
section_id uuid
room_id uuid
building_id uuid
day_of_week array [note: "Allowed values: 'Monday'::character varying, 'Tuesday'::character varying, 'Wednesday'::character varying, 'Thursday"]
start_time time
end_time time
school_year varchar [note: "Pattern validation"]
semester array [note: "Allowed values: '1st'::character varying, '2nd'::character varying"]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
status array [default: 'published', note: "Allowed values: 'draft'::text, 'published'::text, 'archived'::text"]
is_published boolean [default: true]
published_at timestamp
recurring_rule text
version int [default: 1]
grading_period array [note: "Allowed values: 'Q1'::character varying, 'Q2'::character varying, 'Q3'::character varying, 'Q4'::character varying"]
}

Table schedule_audit {
id bigint [pk]
schedule_id uuid
action array [note: "Allowed values: 'create'::text, 'update'::text, 'delete'::text, 'publish'::text, 'rollback'::text"]
actor_id uuid
diff json
created_at timestamp [default: `now()`]
}

Table schedule_templates {
id uuid [pk, default: `gen_random_uuid()`]
name text
description text
grade_level text
payload json
created_by uuid
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table schedules_audit_log {
id uuid [pk, default: `gen_random_uuid()`]
schedule_id uuid
actor_user_id uuid
action array [note: "Allowed values: 'create'::text, 'update'::text, 'delete'::text, 'publish'::text, 'unpublish'::text"]
changed_fields json
before json
after json
note text
created_at timestamp [default: `now()`]
}

// ============================================================================
// SECTION 8: BUILDING & ROOM MANAGEMENT
// ============================================================================
// Buildings, floors, rooms, campus facilities, and location management

Table buildings {
id uuid [pk, default: `gen_random_uuid()`]
building_name varchar
code varchar [unique]
capacity int
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table floors {
id uuid [pk, default: `gen_random_uuid()`]
building_id uuid
name varchar
number int
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table rooms {
id uuid [pk, default: `gen_random_uuid()`]
floor_id uuid
name varchar
room_number varchar
capacity int
status array [default: 'Available', note: "Allowed values: 'Available'::character varying, 'Occupied'::character varying, 'Maintenance'::character varying"]
display_order int
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table campus_facilities {
id uuid [pk, default: `gen_random_uuid()`]
name varchar
image_url varchar
description text
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
building_id uuid
floor_id uuid
capacity int [note: "capacity IS NULL OR capacity >= 0"]
type array [note: "Allowed values: 'Library'::character varying, 'Laboratory'::character varying, 'Auditorium'::character varying, 'Gym"]
status array [default: 'Available', note: "Allowed values: 'Available'::character varying, 'Occupied'::character varying, 'Maintenance'::character varying, 'Cl"]
domain_id uuid
created_by uuid
}

Table locations {
id uuid [pk, default: `gen_random_uuid()`]
name varchar
description text
image_type array [note: "Allowed values: 'panoramic'::character varying, 'regular'::character varying"]
image_url text
preview_image_url text
created_at timestamp [default: `now()`]
}

Table hotspots {
id uuid [pk, default: `gen_random_uuid()`]
location_id uuid
label varchar
x_position decimal [note: "Range: 0::numeric to "]
y_position decimal [note: "Range: 0::numeric to "]
link_to_location_id uuid
created_at timestamp [default: `now()`]
}

// ============================================================================
// SECTION 9: CLUB MANAGEMENT
// ============================================================================
// Student clubs, memberships, forms, announcements, and club-related data

Table clubs {
id uuid [pk, default: `gen_random_uuid()`]
name varchar
description text
president_id uuid
vp_id uuid
secretary_id uuid
advisor_id uuid
domain_id uuid
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
co_advisor_id uuid
mission_statement varchar
mission_title varchar
mission_description text
email varchar [note: "Pattern validation"]
championship_wins int [default: 0]
benefits_title varchar
benefits_description text
club_image text
r2_club_image_key text
club_logo text
}

Table club_announcements {
id uuid [pk, default: `gen_random_uuid()`]
club_id uuid
title varchar [note: "length(TRIM(BOTH FROM title"]
content text [note: "length(TRIM(BOTH FROM content"]
priority array [default: 'normal', note: "Allowed values: 'low'::character varying, 'normal'::character varying, 'high'::character varying, 'urgent'::characte"]
created_by uuid
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table club_benefits {
id uuid [pk, default: `gen_random_uuid()`]
club_id uuid
title varchar
description varchar
order_index int [default: 0, note: "order_index >= 0"]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table club_faqs {
id uuid [pk, default: `gen_random_uuid()`]
club_id uuid
question varchar
answer varchar
order_index int [default: 0, note: "order_index >= 0"]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table club_forms {
id uuid [pk, default: `gen_random_uuid()`]
club_id uuid
created_by uuid
name varchar
description text
is_active boolean [default: true]
auto_approve boolean [default: false]
form_type varchar [default: 'member_registration']
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table club_form_questions {
id uuid [pk, default: `gen_random_uuid()`]
form_id uuid
question_text text
question_type array [default: 'text', note: "Allowed values: 'text'::character varying, 'textarea'::character varying, 'dropdown'::character varying, 'radio'::ch"]
required boolean [default: true]
order_index int [default: 0]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table club_form_question_options {
id uuid [pk, default: `gen_random_uuid()`]
question_id uuid
option_text text
option_value text
order_index int [default: 0]
created_at timestamp [default: `now()`]
}

Table club_form_answers {
id uuid [pk, default: `gen_random_uuid()`]
response_id uuid
question_id uuid
answer_text text
answer_value text
created_at timestamp [default: `now()`]
}

Table club_form_responses {
id uuid [pk, default: `gen_random_uuid()`]
form_id uuid
user_id uuid
status array [default: 'pending', note: "Allowed values: 'pending'::character varying, 'approved'::character varying, 'rejected'::character varying"]
reviewed_by uuid
reviewed_at timestamp
review_notes text
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table club_goals {
id uuid [pk, default: `gen_random_uuid()`]
club_id uuid
goal_text varchar
order_index int [default: 0, note: "order_index >= 0"]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table club_positions {
id uuid [pk, default: `gen_random_uuid()`]
name varchar [unique]
description text
level int [default: 0]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

// ============================================================================
// SECTION 10: EVENT MANAGEMENT
// ============================================================================
// School events, event details, schedules, and FAQs

Table events {
id uuid [pk, default: `gen_random_uuid()`]
title varchar
description text
date date
time time
location varchar
organizer_id uuid
event_image varchar
status array [default: 'draft', note: "Allowed values: 'draft'::character varying, 'published'::character varying, 'cancelled'::character varying, 'complet"]
visibility array [default: 'public', note: "Allowed values: 'public'::character varying, 'private'::character varying"]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
full_description text
is_featured boolean [default: false]
deleted_at timestamp
cf_image_id text
cf_image_url text
image_file_size int [default: 0]
image_mime_type varchar
deleted_by uuid
club_id uuid
}

Table event_additional_info {
id uuid [pk, default: `gen_random_uuid()`]
event_id uuid
title varchar
content text
order_index int [default: 0]
created_at timestamp [default: `now()`]
}

Table event_highlights {
id uuid [pk, default: `gen_random_uuid()`]
event_id uuid
title varchar
content text
image_url varchar
order_index int [default: 0]
created_at timestamp [default: `now()`]
}

Table event_schedule {
id uuid [pk, default: `gen_random_uuid()`]
event_id uuid
activity_time time
activity_description text
order_index int [default: 0]
created_at timestamp [default: `now()`]
}

Table event_tags {
event_id uuid [pk]
tag_id uuid [pk]
}

Table events_faq {
id uuid [pk, default: `gen_random_uuid()`]
event_id uuid
question varchar
answer text
created_at timestamp [default: `now()`]
}

// ============================================================================
// SECTION 11: ANNOUNCEMENT MANAGEMENT
// ============================================================================
// School announcements, targeting, and visibility

Table announcements {
id uuid [pk, default: `gen_random_uuid()`]
user_id uuid
title varchar
content text
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
expires_at timestamp
type varchar
visibility array [default: 'public', note: "Allowed values: 'public'::character varying, 'private'::character varying"]
}

Table announcement_sections {
id uuid [pk, default: `gen_random_uuid()`]
announcement_id uuid
section_id uuid
created_at timestamp [default: `now()`]
}

Table announcement_tags {
announcement_id uuid [pk]
tag_id uuid [pk]
}

Table announcement_targets {
announcement_id uuid [pk]
role_id uuid [pk]
}

// ============================================================================
// SECTION 12: NEWS MANAGEMENT
// ============================================================================
// News articles, categories, approvals, and review system

Table news {
id uuid [pk, default: `gen_random_uuid()`]
title varchar
slug varchar [unique]
article_json json
article_html text
description text
featured_image text
status array [default: 'draft', note: "Allowed values: 'draft'::character varying, 'pending_approval'::character varying, 'approved'::character varying, 'p"]
visibility array [default: 'public', note: "Allowed values: 'public'::character varying, 'journalism'::character varying"]
published_date timestamp
author_id uuid
category_id uuid
views int [default: 0]
deleted_at timestamp
deleted_by uuid
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
r2_featured_image_key varchar
scheduled_date timestamp
author_name varchar
credits varchar
review_status array [default: 'pending', note: "Allowed values: 'pending'::character varying, 'in_review'::character varying, 'approved'::character varying, 'reject"]
}

Table news_approval {
id uuid [pk, default: `gen_random_uuid()`]
news_id uuid
approver_id uuid
status array [note: "Allowed values: 'approved'::character varying, 'rejected'::character varying"]
remarks text
action_at timestamp [default: `now()`]
}

Table news_categories {
id uuid [pk, default: `gen_random_uuid()`]
name varchar [unique]
slug varchar [unique]
description text
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table news_co_authors {
id uuid [pk, default: `gen_random_uuid()`]
news_id uuid
added_by uuid
created_at timestamp [default: `now()`]
co_author_name varchar
}

Table news_review_comments {
id uuid [pk, default: `gen_random_uuid()`]
news_id uuid
reviewer_id uuid
comment text
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
deleted_at timestamp
deleted_by uuid
}

Table news_tags {
news_id uuid [pk]
tag_id uuid [pk]
}

// ============================================================================
// SECTION 13: GALLERY MANAGEMENT
// ============================================================================
// Photo galleries, albums, items, tags, and media management

Table gallery_albums {
id uuid [pk, default: `gen_random_uuid()`]
title varchar [note: "char_length(title::text"]
description text
slug varchar [unique, note: "Pattern validation"]
category array [default: 'other', note: "Allowed values: 'events'::character varying, 'departments'::character varying, 'achievements'::character varying, 'c"]
cover_image_id uuid
color_theme varchar
visibility array [default: 'public', note: "Allowed values: 'public'::character varying, 'authenticated'::character varying, 'staff_only'::character varying, 'p"]
is_featured boolean [default: false]
featured_order int
event_date date
location varchar
items_count int [default: 0]
views_count int [default: 0]
created_by uuid
updated_by uuid
deleted_by uuid
is_deleted boolean [default: false]
deleted_at timestamp
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table gallery_items {
id uuid [pk, default: `gen_random_uuid()`]
original_filename varchar
file_size_bytes bigint [note: "file_size_bytes > 0"]
mime_type varchar
media_type array [note: "Allowed values: 'image'::character varying, 'video'::character varying"]
width int
height int
duration_seconds int
title varchar
caption text
alt_text varchar
display_order int [default: 0]
is_cover boolean [default: false]
is_featured boolean [default: false]
photographer_name varchar
photographer_credit text
taken_at timestamp
location varchar
views_count int [default: 0]
downloads_count int [default: 0]
uploaded_by uuid
updated_by uuid
deleted_by uuid
is_deleted boolean [default: false]
deleted_at timestamp
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
cf_image_id text
cf_image_url text
}

Table gallery_tags {
id uuid [pk, default: `gen_random_uuid()`]
name varchar [unique, note: "char_length(name::text"]
slug varchar [unique, note: "Pattern validation"]
description text
color varchar
usage_count int [default: 0]
created_by uuid
created_at timestamp [default: `now()`]
}

Table gallery_item_tags {
id uuid [pk, default: `gen_random_uuid()`]
item_id uuid
tag_id uuid
created_by uuid
created_at timestamp [default: `now()`]
}

Table gallery_views {
id uuid [pk, default: `gen_random_uuid()`]
viewable_type array [note: "Allowed values: 'album'::character varying, 'item'::character varying"]
viewable_id uuid
user_id uuid
ip_address varchar
viewed_at timestamp [default: `now()`]
}

Table gallery_downloads {
id uuid [pk, default: `gen_random_uuid()`]
item_id uuid
user_id uuid
ip_address varchar
user_agent text
success boolean [default: true]
downloaded_at timestamp [default: `now()`]
}

// ============================================================================
// SECTION 14: QUIZ SYSTEM
// ============================================================================
// Quiz management, questions, attempts, grading, monitoring, and analytics

Table quizzes {
quiz_id uuid [pk, default: `gen_random_uuid()`]
title varchar
description text
subject_id uuid
teacher_id uuid
type varchar [default: 'form']
grading_type varchar [default: 'auto']
time_limit int
start_date timestamp
end_date timestamp
status varchar [default: 'draft']
version int [default: 1]
parent_quiz_id uuid
visibility varchar [default: 'section_only']
question_pool_size int
questions_to_display int
allow_retakes boolean [default: false]
allow_backtracking boolean [default: true]
shuffle_questions boolean [default: false]
shuffle_choices boolean [default: false]
total_points decimal
passing_score decimal
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
deleted_at timestamp
deleted_by uuid
}

Table quiz_questions {
question_id uuid [pk, default: `gen_random_uuid()`]
quiz_id uuid
question_text text
question_type varchar
order_index int
points decimal [default: 1]
allow_partial_credit boolean [default: false]
time_limit_seconds int
is_pool_question boolean [default: false]
source_question_bank_id uuid
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
correct_answer json
settings json
description varchar
is_required boolean [default: false]
is_randomize boolean [default: false]
case_sensitive boolean [default: false]
whitespace_sensitive boolean [default: false]
question_image_id text
question_image_url text
question_image_file_size int
question_image_mime_type varchar [default: 'NULL']
}

Table quiz_choices {
choice_id uuid [pk, default: `gen_random_uuid()`]
question_id uuid
choice_text text
is_correct boolean [default: false]
order_index int
metadata json
created_at timestamp [default: `now()`]
choice_image_id text
choice_image_url text
choice_image_file_size int
choice_image_mime_type varchar [default: 'NULL']
}

Table quiz_attempts {
attempt_id uuid [pk, default: `gen_random_uuid()`]
quiz_id uuid
student_id uuid
attempt_number int
score decimal
max_possible_score decimal
status varchar [default: 'in_progress']
terminated_by_teacher boolean [default: false]
termination_reason text
started_at timestamp [default: `now()`]
submitted_at timestamp
time_taken_seconds int
questions_shown array
created_at timestamp [default: `now()`]
}

Table quiz_student_answers {
answer_id uuid [pk, default: `gen_random_uuid()`]
attempt_id uuid
question_id uuid
choice_id uuid
choice_ids array
answer_text text
answer_json json
points_awarded decimal [default: 0]
is_correct boolean
graded_by uuid
graded_at timestamp
grader_feedback text
time_spent_seconds int
answered_at timestamp [default: `now()`]
}

Table quiz_student_summary {
id uuid [pk, default: `gen_random_uuid()`]
student_id uuid
quiz_id uuid
last_attempt_id uuid
attempts_count int [default: 1]
highest_score decimal
lowest_score decimal
latest_score decimal
average_score decimal
status varchar [default: 'in_progress']
passed boolean
last_updated timestamp [default: `now()`]
}

Table quiz_settings {
id uuid [pk, default: `gen_random_uuid()`]
quiz_id uuid [unique]
lockdown_browser boolean [default: false]
anti_screenshot boolean [default: false]
disable_copy_paste boolean [default: false]
disable_right_click boolean [default: false]
require_fullscreen boolean [default: false]
track_tab_switches boolean [default: true]
track_device_changes boolean [default: true]
track_ip_changes boolean [default: true]
tab_switch_warning_threshold int [default: 3]
created_at timestamp [default: `now()`]
secured_quiz boolean [default: false]
quiz_lockdown boolean [default: false]
lockdown_ui boolean [default: false]
question_pool boolean [default: false]
stratified_sampling boolean [default: false]
total_questions int
pool_size int
strict_time_limit boolean [default: false]
auto_save boolean [default: true]
backtracking_control boolean [default: false]
visibility varchar [default: 'assigned']
access_code varchar
publish_mode varchar [default: 'immediate']
}

Table quiz_sections {
id uuid [pk, default: `gen_random_uuid()`]
quiz_id uuid
section_id uuid
assigned_at timestamp [default: `now()`]
}

Table quiz_section_settings {
id uuid [pk, default: `gen_random_uuid()`]
quiz_id uuid
section_id uuid
start_date timestamp
end_date timestamp
time_limit_override int
created_at timestamp [default: `now()`]
}

Table quiz_active_sessions {
session_id uuid [pk, default: `gen_random_uuid()`]
quiz_id uuid
student_id uuid
attempt_id uuid
started_at timestamp [default: `now()`]
last_synced_at timestamp [default: `now()`]
is_active boolean [default: true]
initial_device_fingerprint text
initial_ip_address varchar
initial_user_agent text
last_heartbeat timestamp
current_device_fingerprint text
current_ip_address varchar
current_user_agent text
terminated_reason text
}

Table quiz_participants {
id uuid [pk, default: `gen_random_uuid()`]
session_id uuid [unique]
quiz_id uuid
student_id uuid
status varchar [default: 'not_started']
progress int [default: 0]
current_question_index int [default: 0]
questions_answered int [default: 0]
total_questions int
start_time timestamp
end_time timestamp
flag_count int [default: 0]
idle_time_seconds int [default: 0]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table quiz_session_answers {
id uuid [pk, default: `gen_random_uuid()`]
session_id uuid
question_id uuid
temporary_choice_id uuid
temporary_choice_ids array
temporary_answer_text text
temporary_answer_json json
last_updated timestamp [default: `now()`]
time_spent_seconds int
}

Table quiz_analytics {
id uuid [pk, default: `gen_random_uuid()`]
quiz_id uuid [unique]
total_attempts int [default: 0]
total_students int [default: 0]
completed_attempts int [default: 0]
average_score decimal
highest_score decimal
lowest_score decimal
median_score decimal
pass_rate decimal
average_time_taken_seconds int
fastest_completion_seconds int
slowest_completion_seconds int
last_calculated_at timestamp [default: `now()`]
}

Table quiz_question_stats {
id uuid [pk, default: `gen_random_uuid()`]
question_id uuid [unique]
quiz_id uuid
total_attempts int [default: 0]
correct_count int [default: 0]
incorrect_count int [default: 0]
skipped_count int [default: 0]
difficulty_score decimal
average_time_spent_seconds int
discrimination_index decimal
last_calculated_at timestamp [default: `now()`]
}

Table quiz_question_metadata {
id uuid [pk, default: `gen_random_uuid()`]
question_id uuid [unique]
metadata_type varchar
metadata json
created_at timestamp [default: `now()`]
}

Table quiz_access_links {
link_id uuid [pk, default: `gen_random_uuid()`]
quiz_id uuid
access_token varchar [unique]
link_type varchar [default: 'link']
is_active boolean [default: true]
expires_at timestamp
access_code varchar
max_uses int
use_count int [default: 0]
requires_auth boolean [default: true]
is_revoked boolean [default: false]
revoked_at timestamp
created_by uuid
created_at timestamp [default: `now()`]
last_used_at timestamp
}

Table quiz_access_logs {
id uuid [pk, default: `gen_random_uuid()`]
link_id uuid
quiz_id uuid
student_id uuid
accessed_at timestamp [default: `now()`]
ip_address varchar
user_agent text
access_granted boolean [default: true]
denial_reason text
metadata json
}

Table quiz_activity_logs {
id uuid [pk, default: `gen_random_uuid()`]
participant_id uuid
session_id uuid
quiz_id uuid
student_id uuid
event_type varchar
message text
metadata json
timestamp timestamp [default: `now()`]
}

Table quiz_flags {
id uuid [pk, default: `gen_random_uuid()`]
participant_id uuid
session_id uuid
quiz_id uuid
student_id uuid
flag_type varchar
message text
severity varchar [default: 'info']
metadata json
timestamp timestamp [default: `now()`]
}

Table quiz_device_sessions {
id uuid [pk, default: `gen_random_uuid()`]
session_id uuid
device_fingerprint text
ip_address varchar
user_agent text
screen_resolution varchar
browser_info json
device_type varchar
first_seen_at timestamp [default: `now()`]
last_seen_at timestamp [default: `now()`]
is_current boolean [default: true]
}

Table question_bank {
id uuid [pk, default: `gen_random_uuid()`]
teacher_id uuid
question_text text
question_type varchar
subject_id uuid
topic varchar
difficulty varchar
tags array
default_points decimal [default: 1]
choices json
correct_answer json
allow_partial_credit boolean [default: false]
time_limit_seconds int
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
explanation text
is_public boolean [default: false]
is_deleted boolean [default: false]
question_image_id text
question_image_url text
question_image_file_size int
question_image_mime_type varchar [default: 'NULL']
choices_image_data json
}

// ============================================================================
// SECTION 15: LEARNING RESOURCES
// ============================================================================
// Learning modules, teacher files, folders, and download tracking

Table modules {
id uuid [pk, default: `gen_random_uuid()`]
title varchar
description text
file_url varchar
uploaded_by uuid
r2_file_key text
file_size_bytes bigint
mime_type varchar
is_global boolean [default: false]
is_deleted boolean [default: false]
deleted_at timestamp
deleted_by uuid
subject_id uuid
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table module_download_logs {
id uuid [pk, default: `gen_random_uuid()`]
module_id uuid
user_id uuid
downloaded_at timestamp [default: `now()`]
ip_address text
user_agent text
success boolean [default: true]
}

Table section_modules {
id uuid [pk, default: `gen_random_uuid()`]
section_id uuid
module_id uuid
visible boolean [default: true]
assigned_at timestamp [default: `now()`]
assigned_by uuid
}

Table teacher_files {
id uuid [pk, default: `gen_random_uuid()`]
folder_id uuid
title varchar
description text
file_url varchar
r2_file_key text [unique]
file_size_bytes bigint
mime_type varchar
original_filename varchar
is_deleted boolean [default: false]
deleted_at timestamp
deleted_by uuid
uploaded_by uuid
updated_by uuid
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table teacher_folders {
id uuid [pk, default: `gen_random_uuid()`]
name varchar
description text
parent_id uuid
is_deleted boolean [default: false]
deleted_at timestamp
deleted_by uuid
created_by uuid
updated_by uuid
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table teacher_file_downloads {
id uuid [pk, default: `gen_random_uuid()`]
file_id uuid
user_id uuid
downloaded_at timestamp [default: `now()`]
ip_address text
user_agent text
success boolean [default: true]
}

// ============================================================================
// SECTION 16: CHAT & MESSAGING
// ============================================================================
// Conversations, messages, and participant management

Table conversations {
id uuid [pk, default: `gen_random_uuid()`]
type array [note: "Allowed values: 'direct'::text, 'group_section'::text"]
title text
created_by uuid
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table conversation_participants {
conversation_id uuid [pk]
user_id uuid [pk]
role array [note: "Allowed values: 'admin'::text, 'teacher'::text, 'student'::text"]
last_read_at timestamp
joined_at timestamp [default: `now()`]
}

Table messages {
id uuid [pk, default: `gen_random_uuid()`]
conversation_id uuid
sender_id uuid
content text
message_type array [default: 'text', note: "Allowed values: 'text'::text, 'image'::text, 'file'::text"]
attachment_url text
created_at timestamp [default: `now()`]
}

// ============================================================================
// SECTION 17: ALERTS & NOTIFICATIONS
// ============================================================================
// User alerts, banner notifications, and read tracking

Table alerts {
id uuid [pk, default: `gen_random_uuid()`]
type array [note: "Allowed values: 'info'::character varying, 'warning'::character varying, 'success'::character varying, 'error'::char"]
title varchar
message text
created_by uuid
expires_at timestamp [default: `now()`]
created_at timestamp [default: `now()`]
recipient_id uuid
is_read boolean [default: false]
updated_at timestamp [default: `now()`]
}

Table alert_reads {
alert_id uuid [pk]
user_id uuid [pk]
read_at timestamp [default: `now()`]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

Table banner_notifications {
id uuid [pk, default: `gen_random_uuid()`]
message text
short_message varchar
type varchar [default: 'info']
is_active boolean [default: false]
is_dismissible boolean [default: true]
has_action boolean [default: false]
action_label varchar
action_url varchar
start_date timestamp
end_date timestamp
created_by uuid
template varchar
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

// ============================================================================
// SECTION 18: TAGS & MISCELLANEOUS
// ============================================================================
// Tags, FAQs, and other shared resources

Table tags {
id uuid [pk, default: `gen_random_uuid()`]
name varchar [unique]
color varchar
created_at timestamp [default: `now()`]
slug varchar [unique]
}

Table faq {
id uuid [pk, default: `gen_random_uuid()`]
question varchar
answer text
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
}

// ============================================================================
// RELATIONSHIPS
// ============================================================================
// Foreign key relationships between tables

// Academic Calendar Relationships
Ref: academic_calendar_days.academic_calendar_id > academic_calendar.id
Ref: academic_calendar_markers.academic_calendar_id > academic_calendar.id
Ref: academic_calendar_markers.academic_calendar_day_id > academic_calendar_days.id

// Academic Year Relationships
Ref: academic_periods.academic_year_id > academic_years.id
Ref: academic_periods.created_by > users.id
Ref: academic_periods.updated_by > users.id
Ref: academic_year_settings.updated_by > users.id
Ref: academic_year_templates.created_by > users.id
Ref: academic_years.created_by > users.id
Ref: academic_years.updated_by > users.id

// User & Role Relationships
Ref: admins.user_id > users.id
Ref: profiles.user_id > users.id
Ref: user_preferences.user_id > users.id
Ref: user_positions.user_id > users.id
Ref: user_positions.position_id > positions.id
Ref: user_domain_roles.user_id > users.id
Ref: user_domain_roles.domain_role_id > domain_roles.id
Ref: user_push_tokens.user_id > users.id
Ref: daily_logins.user_id > users.id
Ref: users.role_id > roles.id
Ref: positions.role_id > roles.id

// Domain & Permission Relationships
Ref: domain_role_permissions.domain_role_id > domain_roles.id
Ref: domain_role_permissions.permission_id > permissions.id
Ref: domain_roles.domain_id > domains.id
Ref: domains.created_by > users.id

// Student Relationships
Ref: students.user_id > users.id
Ref: students.section_id > sections.id
Ref: student_activities.student_user_id > users.id
Ref: student_club_memberships.student_id > students.id
Ref: student_club_memberships.club_id > clubs.id
Ref: student_club_memberships.position_id > club_positions.id
Ref: student_rankings.student_id > students.id
Ref: student_schedule.schedule_id > schedules.id
Ref: student_schedule.student_id > students.id
Ref: students_gwa.student_id > students.id
Ref: students_gwa.recorded_by > teachers.id
Ref: emergency_contacts.student_id > students.id

// Teacher Relationships
Ref: teachers.user_id > users.id
Ref: teachers.subject_specialization_id > subjects.id
Ref: teachers.department_id > departments.id
Ref: teachers.advisory_section_id > sections.id

// Department & Subject Relationships
Ref: subjects.department_id > departments.id
Ref: departments.head_id > users.id
Ref: departments_information.department_id > departments.id

// Section & Schedule Relationships
Ref: sections.teacher_id > users.id
Ref: sections.floor_id > floors.id
Ref: schedules.subject_id > subjects.id
Ref: schedules.teacher_id > teachers.id
Ref: schedules.section_id > sections.id
Ref: schedules.room_id > rooms.id
Ref: schedules.building_id > buildings.id
Ref: schedule_audit.schedule_id > schedules.id
Ref: schedule_audit.actor_id > users.id
Ref: schedule_templates.created_by > users.id
Ref: schedules_audit_log.schedule_id > schedules.id
Ref: schedules_audit_log.actor_user_id > users.id

// Building & Room Relationships
Ref: floors.building_id > buildings.id
Ref: rooms.floor_id > floors.id
Ref: campus_facilities.building_id > buildings.id
Ref: campus_facilities.floor_id > floors.id
Ref: campus_facilities.domain_id > domains.id
Ref: campus_facilities.created_by > users.id
Ref: hotspots.location_id > locations.id
Ref: hotspots.link_to_location_id > locations.id

// Club Relationships
Ref: clubs.president_id > users.id
Ref: clubs.vp_id > users.id
Ref: clubs.secretary_id > users.id
Ref: clubs.advisor_id > users.id
Ref: clubs.co_advisor_id > users.id
Ref: clubs.domain_id > domains.id
Ref: club_announcements.club_id > clubs.id
Ref: club_announcements.created_by > users.id
Ref: club_benefits.club_id > clubs.id
Ref: club_faqs.club_id > clubs.id
Ref: club_forms.club_id > clubs.id
Ref: club_forms.created_by > users.id
Ref: club_form_questions.form_id > club_forms.id
Ref: club_form_question_options.question_id > club_form_questions.id
Ref: club_form_answers.response_id > club_form_responses.id
Ref: club_form_answers.question_id > club_form_questions.id
Ref: club_form_responses.form_id > club_forms.id
Ref: club_form_responses.user_id > users.id
Ref: club_form_responses.reviewed_by > users.id
Ref: club_goals.club_id > clubs.id

// Event Relationships
Ref: events.organizer_id > users.id
Ref: events.deleted_by > users.id
Ref: events.club_id > clubs.id
Ref: event_additional_info.event_id > events.id
Ref: event_highlights.event_id > events.id
Ref: event_schedule.event_id > events.id
Ref: event_tags.event_id > events.id
Ref: event_tags.tag_id > tags.id
Ref: events_faq.event_id > events.id

// Announcement Relationships
Ref: announcements.user_id > users.id
Ref: announcement_sections.announcement_id > announcements.id
Ref: announcement_sections.section_id > sections.id
Ref: announcement_tags.announcement_id > announcements.id
Ref: announcement_tags.tag_id > tags.id
Ref: announcement_targets.announcement_id > announcements.id
Ref: announcement_targets.role_id > roles.id

// News Relationships
Ref: news.author_id > users.id
Ref: news.category_id > news_categories.id
Ref: news.deleted_by > users.id
Ref: news_approval.news_id > news.id
Ref: news_approval.approver_id > users.id
Ref: news_co_authors.news_id > news.id
Ref: news_co_authors.added_by > users.id
Ref: news_review_comments.news_id > news.id
Ref: news_review_comments.reviewer_id > users.id
Ref: news_review_comments.deleted_by > users.id
Ref: news_tags.news_id > news.id
Ref: news_tags.tag_id > tags.id

// Gallery Relationships
Ref: gallery_albums.cover_image_id > gallery_items.id
Ref: gallery_albums.created_by > users.id
Ref: gallery_albums.updated_by > users.id
Ref: gallery_albums.deleted_by > users.id
Ref: gallery_items.uploaded_by > users.id
Ref: gallery_items.updated_by > users.id
Ref: gallery_items.deleted_by > users.id
Ref: gallery_tags.created_by > users.id
Ref: gallery_item_tags.item_id > gallery_items.id
Ref: gallery_item_tags.tag_id > gallery_tags.id
Ref: gallery_item_tags.created_by > users.id
Ref: gallery_views.viewable_id > gallery_items.id
Ref: gallery_views.user_id > users.id
Ref: gallery_downloads.item_id > gallery_items.id
Ref: gallery_downloads.user_id > users.id

// Quiz Relationships
Ref: quizzes.subject_id > subjects.id
Ref: quizzes.teacher_id > teachers.id
Ref: quizzes.parent_quiz_id > quizzes.quiz_id
Ref: quizzes.deleted_by > users.id
Ref: quiz_questions.quiz_id > quizzes.quiz_id
Ref: quiz_questions.source_question_bank_id > question_bank.id
Ref: quiz_choices.question_id > quiz_questions.question_id
Ref: quiz_attempts.quiz_id > quizzes.quiz_id
Ref: quiz_attempts.student_id > students.id
Ref: quiz_student_answers.attempt_id > quiz_attempts.attempt_id
Ref: quiz_student_answers.question_id > quiz_questions.question_id
Ref: quiz_student_answers.choice_id > quiz_choices.choice_id
Ref: quiz_student_answers.graded_by > users.id
Ref: quiz_student_summary.student_id > students.id
Ref: quiz_student_summary.quiz_id > quizzes.quiz_id
Ref: quiz_student_summary.last_attempt_id > quiz_attempts.attempt_id
Ref: quiz_settings.quiz_id > quizzes.quiz_id
Ref: quiz_sections.quiz_id > quizzes.quiz_id
Ref: quiz_sections.section_id > sections.id
Ref: quiz_section_settings.quiz_id > quizzes.quiz_id
Ref: quiz_section_settings.section_id > sections.id
Ref: quiz_active_sessions.quiz_id > quizzes.quiz_id
Ref: quiz_active_sessions.student_id > students.id
Ref: quiz_active_sessions.attempt_id > quiz_attempts.attempt_id
Ref: quiz_participants.session_id > quiz_active_sessions.session_id
Ref: quiz_participants.quiz_id > quizzes.quiz_id
Ref: quiz_participants.student_id > students.id
Ref: quiz_session_answers.session_id > quiz_active_sessions.session_id
Ref: quiz_session_answers.question_id > quiz_questions.question_id
Ref: quiz_analytics.quiz_id > quizzes.quiz_id
Ref: quiz_question_stats.question_id > quiz_questions.question_id
Ref: quiz_question_stats.quiz_id > quizzes.quiz_id
Ref: quiz_question_metadata.question_id > quiz_questions.question_id
Ref: quiz_access_links.quiz_id > quizzes.quiz_id
Ref: quiz_access_links.created_by > users.id
Ref: quiz_access_logs.link_id > quiz_access_links.link_id
Ref: quiz_access_logs.quiz_id > quizzes.quiz_id
Ref: quiz_access_logs.student_id > students.id
Ref: quiz_activity_logs.participant_id > quiz_participants.id
Ref: quiz_activity_logs.session_id > quiz_active_sessions.session_id
Ref: quiz_activity_logs.quiz_id > quizzes.quiz_id
Ref: quiz_activity_logs.student_id > students.id
Ref: quiz_flags.participant_id > quiz_participants.id
Ref: quiz_flags.session_id > quiz_active_sessions.session_id
Ref: quiz_flags.quiz_id > quizzes.quiz_id
Ref: quiz_flags.student_id > students.id
Ref: quiz_device_sessions.session_id > quiz_active_sessions.session_id
Ref: question_bank.teacher_id > teachers.id
Ref: question_bank.subject_id > subjects.id

// Learning Resources Relationships
Ref: modules.uploaded_by > users.id
Ref: modules.deleted_by > users.id
Ref: modules.subject_id > subjects.id
Ref: module_download_logs.module_id > modules.id
Ref: module_download_logs.user_id > users.id
Ref: section_modules.section_id > sections.id
Ref: section_modules.module_id > modules.id
Ref: section_modules.assigned_by > users.id
Ref: teacher_files.folder_id > teacher_folders.id
Ref: teacher_files.deleted_by > users.id
Ref: teacher_files.uploaded_by > users.id
Ref: teacher_files.updated_by > users.id
Ref: teacher_folders.parent_id > teacher_folders.id
Ref: teacher_folders.deleted_by > users.id
Ref: teacher_folders.created_by > users.id
Ref: teacher_folders.updated_by > users.id
Ref: teacher_file_downloads.file_id > teacher_files.id
Ref: teacher_file_downloads.user_id > users.id

// Chat & Messaging Relationships
Ref: conversations.created_by > users.id
Ref: conversation_participants.conversation_id > conversations.id
Ref: conversation_participants.user_id > users.id
Ref: messages.conversation_id > conversations.id
Ref: messages.sender_id > users.id

// Alert & Notification Relationships
Ref: alerts.created_by > users.id
Ref: alerts.recipient_id > users.id
Ref: alert_reads.alert_id > alerts.id
Ref: alert_reads.user_id > users.id
Ref: banner_notifications.created_by > users.id
