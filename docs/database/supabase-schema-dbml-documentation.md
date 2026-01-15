# Supabase Schema - dbdiagram (dbml) Format Documentation

## Overview

This document describes the conversion of the Supabase PostgreSQL schema to dbdiagram (dbml) format. The converted schema file is `supabase-schema.dbml` and contains all tables, columns, relationships, and constraints from the original database.

## File Information

- **Source**: `supabase_public_tables.md` (PostgreSQL CREATE TABLE statements)
- **Output**: `supabase-schema.dbml` (dbdiagram format)
- **Total Tables**: 111
- **Total Relationships**: 173

## Type Conversions

The following PostgreSQL types were converted to dbdiagram types:

| PostgreSQL Type                 | dbdiagram Type | Notes                                      |
| ------------------------------- | -------------- | ------------------------------------------ |
| `uuid`                          | `uuid`         | Preserved as-is                            |
| `character varying` / `varchar` | `varchar`      | Standard string type                       |
| `text`                          | `text`         | Long text                                  |
| `integer`                       | `int`          | 32-bit integer                             |
| `bigint`                        | `bigint`       | 64-bit integer                             |
| `boolean`                       | `boolean`      | True/false                                 |
| `date`                          | `date`         | Date only                                  |
| `timestamp with time zone`      | `timestamp`    | Date and time                              |
| `timestamp without time zone`   | `timestamp`    | Date and time                              |
| `time without time zone`        | `time`         | Time only                                  |
| `jsonb` / `json`                | `json`         | JSON data                                  |
| `numeric`                       | `decimal`      | Decimal numbers                            |
| `inet`                          | `varchar`      | IP addresses (dbdiagram doesn't have inet) |
| `ARRAY`                         | `array`        | Array types                                |

## Constraint Mappings

### Primary Keys

- Single column PK: `[pk, not null]`
- Composite PK: Multiple columns marked with `[pk, not null]`
- Example: `alert_reads` table has composite PK on `alert_id` and `user_id`

### Foreign Keys

- Represented as `Ref:` statements at the end of the file
- Format: `Ref: table.column > ref_table.ref_column`
- Example: `Ref: students.user_id > users.id`

### Unique Constraints

- Marked with `[unique]` attribute
- Example: `email varchar [not null, unique]`

### NOT NULL Constraints

- Marked with `[not null]` attribute
- Implicit in dbdiagram (columns are nullable by default)

### Default Values

- Format: `[default: value]`
- Function calls: `[default: \`gen_random_uuid()\`]`or`[default: \`now()\`]`
- String literals: `[default: 'value']`
- Numeric/Boolean: `[default: 0]` or `[default: true]`

### CHECK Constraints

- Added as notes: `[note: "constraint description"]`
- Simplified for readability (full constraint logic may be truncated)

## Table Organization

Tables are organized into logical categories:

1. **Core**: Users, roles, profiles, permissions
2. **Students**: Student-related tables
3. **Teachers**: Teacher-related tables
4. **Admins**: Admin-related tables
5. **Academic**: Academic years, periods, calendar
6. **Subjects & Departments**: Subjects and department management
7. **Sections & Schedules**: Class sections and scheduling
8. **Buildings & Rooms**: Physical infrastructure
9. **Clubs**: Student clubs and organizations
10. **Events**: School events
11. **Announcements**: Announcement system
12. **News**: News and journalism
13. **Gallery**: Photo and media gallery
14. **Quiz System**: Comprehensive quiz/exam system
15. **Modules & Resources**: Learning materials
16. **Chat**: Messaging and conversations
17. **Alerts & Notifications**: Alert system
18. **Tags & Misc**: Tags and miscellaneous

## Relationships

All foreign key relationships are documented at the end of the file in the `// Relationships` section. Each relationship follows the pattern:

```
Ref: source_table.column > target_table.column
```

This indicates a one-to-many relationship from `target_table` to `source_table`.

## Special Cases

### Composite Primary Keys

Tables with composite primary keys have multiple columns marked with `[pk]`:

- `alert_reads`: `alert_id` and `user_id`
- `announcement_tags`: `announcement_id` and `tag_id`
- `announcement_targets`: `announcement_id` and `role_id`
- `conversation_participants`: `conversation_id` and `user_id`
- `event_tags`: `event_id` and `tag_id`
- `news_tags`: `news_id` and `tag_id`
- `quiz_sections`: Composite keys where applicable

### Self-Referencing Foreign Keys

Some tables reference themselves:

- `quizzes.parent_quiz_id > quizzes.quiz_id` (quiz versions)
- `teacher_folders.parent_id > teacher_folders.id` (folder hierarchy)
- `hotspots.link_to_location_id > locations.id` (location navigation)

### External References

Some foreign keys reference tables outside the `public` schema:

- `club_announcements.created_by` references `auth.users(id)` (not converted)
- `student_activities.student_user_id` references `auth.users(id)` (not converted)

These are noted in the original schema but may not appear in relationships if the target table is not in the public schema.

## Usage

### Viewing the Diagram

1. Go to [dbdiagram.io](https://dbdiagram.io)
2. Click "New Diagram"
3. Copy and paste the contents of `supabase-schema.dbml`
4. The diagram will be automatically generated

### Exporting

dbdiagram.io allows exporting to:

- PNG image
- PDF document
- SQL (PostgreSQL, MySQL, etc.)
- Other formats

## Notes

- Default values for functions like `gen_random_uuid()` and `now()` are preserved as function calls
- Complex CHECK constraints are simplified to notes for readability
- Some default values with type casts (e.g., `'value'::character varying`) are cleaned to just the value
- Array types are preserved as `array` but element types may not be specified
- Sequence-based defaults (e.g., `nextval()`) are omitted as they're database-specific

## Validation

The conversion script (`convert_to_dbml.py`) validates:

- All tables are parsed
- All foreign key relationships are extracted
- Primary keys are correctly identified
- Column types are properly converted
- Constraints are mapped appropriately

## Maintenance

If the source schema changes:

1. Update `supabase_public_tables.md` with the new schema
2. Run `python convert_to_dbml.py`
3. Review the generated `supabase-schema.dbml` file
4. Update this documentation if needed
