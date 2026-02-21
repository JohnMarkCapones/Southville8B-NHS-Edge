# Roles System - Complete Explanation

## Overview

Your application uses a **two-tier role system**:
1. **Base Roles** (the `roles` table) - For general system-wide permissions
2. **Domain Roles** (the `domain_roles` table) - For specialized permissions within specific areas

---

## 1. Base Roles Table

### Schema:
```sql
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL UNIQUE,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
```

### Purpose:
These are the **main user roles** that define a user's primary access level in the system.

### The Three Base Roles:

| Role ID (UUID) | Role Name | Description | Typical Users |
|---------------|-----------|-------------|---------------|
| `<uuid-1>` | **Student** | Basic student access - Can view content, submit assignments, join clubs | All enrolled students |
| `<uuid-2>` | **Teacher** | Teaching staff - Can create content, grade, manage classes | Faculty members |
| `<uuid-3>` | **Admin** | Full system access - Can manage users, configure system, access all features | School administrators |

### How It Works:

1. **Every user has ONE base role**:
   ```sql
   SELECT
     u.id,
     u.email,
     r.name as role
   FROM users u
   LEFT JOIN roles r ON u.role_id = r.id;
   ```

2. **Role assignment happens at user creation**:
   - When a user signs up or is created, they're assigned a `role_id`
   - This `role_id` references one of the three base roles in the `roles` table

3. **Used for authorization**:
   - Backend uses `@Roles('Admin', 'Teacher')` decorator to restrict endpoints
   - Announcements use `targetRoleIds` to target specific roles

### For Announcements:

When creating an announcement, you select which **base roles** should see it:
- ✅ Students only
- ✅ Teachers only
- ✅ Admins only
- ✅ Any combination (e.g., Students + Teachers)

This is done by passing an array of role UUIDs:
```typescript
{
  targetRoleIds: [
    '<student-role-uuid>',
    '<teacher-role-uuid>'
  ]
}
```

---

## 2. Domain Roles Table

### Schema:
```sql
CREATE TABLE public.domain_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp NOT NULL DEFAULT now(),
  domain_id uuid REFERENCES domains(id),
  name text
);
```

### Purpose:
These are **specialized roles within specific domains** (areas of the application).

### What Are Domains?

Domains are functional areas of your application. Examples:

| Domain Type | Domain Name | Purpose |
|------------|-------------|---------|
| `journalism` | School Newspaper | Student journalism/news publishing |
| `club` | Math Club | Student club management |
| `club` | Drama Club | Student club management |
| `department` | Science Department | Departmental organization |

### Example Domain Roles:

#### Journalism Domain:
- **Adviser** (Teacher) - Full approval rights
- **Co-Adviser** (Teacher) - Approval rights
- **Editor-in-Chief** (Student) - Lead editor
- **Co-Editor-in-Chief** (Student) - Deputy editor
- **Publisher** (Student) - Publishing privileges
- **Writer** (Student) - Content creation
- **Member** (Student) - Basic member

#### Club Domain (e.g., Math Club):
- **President** (Student)
- **Vice President** (Student)
- **Treasurer** (Student)
- **Secretary** (Student)
- **Member** (Student)

### How Domain Roles Work:

1. **Users can have MULTIPLE domain roles**:
   - A student can be "Editor-in-Chief" in Journalism AND "President" in Math Club
   - A teacher can be "Adviser" in both Journalism and Drama Club

2. **Domain roles are assigned via `user_domain_roles` table**:
   ```sql
   CREATE TABLE user_domain_roles (
     id uuid PRIMARY KEY,
     user_id uuid REFERENCES users(id),
     domain_role_id uuid REFERENCES domain_roles(id)
   );
   ```

3. **Used for granular permissions**:
   - Only "Editor-in-Chief" can approve articles
   - Only "President" can modify club settings
   - Uses PBAC (Permission-Based Access Control) system

### Example Query:
```sql
-- Get all domain roles for a user
SELECT
  u.email,
  r.name as base_role,
  d.type as domain_type,
  d.name as domain_name,
  dr.name as domain_role
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN user_domain_roles udr ON u.id = udr.user_id
LEFT JOIN domain_roles dr ON udr.domain_role_id = dr.id
LEFT JOIN domains d ON dr.domain_id = d.id
WHERE u.email = 'student@example.com';
```

Result:
```
email               | base_role | domain_type | domain_name      | domain_role
--------------------|-----------|-------------|------------------|------------------
student@example.com | Student   | journalism  | School Newspaper | Editor-in-Chief
student@example.com | Student   | club        | Math Club        | President
```

---

## 3. Relationship Diagram

```
┌─────────────┐
│   users     │
├─────────────┤
│ id          │
│ email       │
│ role_id     │──────┐
└─────────────┘      │
       │             │
       │             ▼
       │      ┌─────────────┐
       │      │   roles     │  ◄── Base Roles (Student, Teacher, Admin)
       │      ├─────────────┤
       │      │ id          │
       │      │ name        │
       │      └─────────────┘
       │
       │
       │      ┌──────────────────┐
       └─────▶│ user_domain_roles│
              ├──────────────────┤
              │ user_id          │
              │ domain_role_id   │──────┐
              └──────────────────┘      │
                                        ▼
                                 ┌──────────────┐
                                 │ domain_roles │  ◄── Domain-Specific Roles
                                 ├──────────────┤
                                 │ id           │
                                 │ name         │
                                 │ domain_id    │──────┐
                                 └──────────────┘      │
                                                       ▼
                                                ┌──────────┐
                                                │ domains  │  ◄── Journalism, Clubs, etc.
                                                ├──────────┤
                                                │ id       │
                                                │ type     │
                                                │ name     │
                                                └──────────┘
```

---

## 4. How to Get Your Role IDs

### Step 1: Run this SQL in Supabase SQL Editor

```sql
-- Get all base roles with their UUIDs
SELECT id, name, created_at
FROM roles
ORDER BY name;
```

### Step 2: You'll see something like:

```
id                                   | name     | created_at
-------------------------------------|----------|----------------------
3c7d3e4f-5a6b-4c8d-9e0f-1a2b3c4d5e6f | Admin    | 2024-01-15 10:30:00
4d8e4f5g-6b7c-5d9e-0f1g-2b3c4d5e6f7g | Student  | 2024-01-15 10:30:00
5e9f5g6h-7c8d-6e0f-1g2h-3c4d5e6f7g8h | Teacher  | 2024-01-15 10:30:00
```

### Step 3: Update the Frontend Code

Replace the hardcoded UUIDs in `frontend-nextjs/lib/api/endpoints/roles.ts`:

```typescript
export async function getRoles(): Promise<Role[]> {
  return Promise.resolve([
    { id: '4d8e4f5g-6b7c-5d9e-0f1g-2b3c4d5e6f7g', name: 'Student' },  // ← Update this
    { id: '5e9f5g6h-7c8d-6e0f-1g2h-3c4d5e6f7g8h', name: 'Teacher' },  // ← Update this
    { id: '3c7d3e4f-5a6b-4c8d-9e0f-1a2b3c4d5e6f', name: 'Admin' },    // ← Update this
  ]);
}
```

---

## 5. Why Two Role Systems?

### Use Cases:

| Scenario | Role Type to Use |
|----------|------------------|
| **Restrict entire pages** (e.g., only teachers can access gradebook) | **Base Roles** |
| **Send announcements to all students** | **Base Roles** |
| **Allow only club presidents to delete events** | **Domain Roles** |
| **Give journalism advisers news approval rights** | **Domain Roles** |
| **Show different dashboards for Student/Teacher/Admin** | **Base Roles** |
| **Assign specific permissions within a club** | **Domain Roles** |

### Example:
A user with:
- **Base Role**: Student
- **Domain Roles**:
  - Editor-in-Chief (Journalism domain)
  - Treasurer (Math Club domain)

Can:
- ✅ Access student portal (base role)
- ✅ Approve news articles (domain role)
- ✅ Manage club finances (domain role)
- ❌ Access teacher gradebook (base role restriction)

---

## 6. For Your Announcement System

You're using **Base Roles** only, which is correct for announcements:

### Current Implementation:
```typescript
const targetRoleIds: string[] = [];
if (targetStudents) {
  const studentRole = roles.find(r => r.name === 'Student');
  if (studentRole) targetRoleIds.push(studentRole.id);
}
if (targetTeachers) {
  const teacherRole = roles.find(r => r.name === 'Teacher');
  if (teacherRole) targetRoleIds.push(teacherRole.id);
}
```

### Why Not Domain Roles?
Announcements are **system-wide broadcasts** that target broad user categories:
- "All Students"
- "All Teachers"
- "All Admins"

If you needed to send announcements to ONLY "Journalism Members", you'd need to add domain role targeting, but that's a future enhancement.

---

## 7. Quick Reference

### Get My User's Base Role:
```sql
SELECT u.email, r.name as role
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email = 'your-email@example.com';
```

### Get All Base Roles:
```sql
SELECT * FROM roles;
```

### Get All Domain Roles for Journalism:
```sql
SELECT dr.name, d.name as domain_name
FROM domain_roles dr
JOIN domains d ON dr.domain_id = d.id
WHERE d.type = 'journalism';
```

### Get All My Domain Roles:
```sql
SELECT
  dr.name as role_name,
  d.name as domain_name,
  d.type as domain_type
FROM user_domain_roles udr
JOIN domain_roles dr ON udr.domain_role_id = dr.id
JOIN domains d ON dr.domain_id = d.id
WHERE udr.user_id = '<your-user-uuid>';
```

---

## 8. Next Steps

1. ✅ Run `SELECT * FROM roles;` in Supabase
2. ✅ Copy the UUIDs
3. ✅ Update `frontend-nextjs/lib/api/endpoints/roles.ts`
4. ✅ Test announcement creation
5. ✅ Announcements will now target the correct roles!

---

## Summary

- **3 Base Roles**: Student, Teacher, Admin (system-wide)
- **Many Domain Roles**: Editor, President, Treasurer, etc. (domain-specific)
- **Announcements use Base Roles** for targeting
- **PBAC system uses Domain Roles** for granular permissions
- **Users have 1 Base Role + 0-N Domain Roles**
