# Activity Timeline - Quick Setup Guide

## What This Does
Shows students their recent activities:
- 👥 Club activities (joined, promoted, events, announcements)
- 📚 Module uploads from teachers

No quiz stuff, no assignments, no RLS policies - just simple activity tracking.

---

## Step 1: Run the Database Migration

**File to run**: `student_activity_timeline_SIMPLIFIED.sql`

### Option A: Using psql Command Line
```bash
psql YOUR_DATABASE_URL -f student_activity_timeline_SIMPLIFIED.sql
```

### Option B: Using Supabase Dashboard
1. Go to your Supabase project
2. Click **SQL Editor**
3. Copy entire contents of `student_activity_timeline_SIMPLIFIED.sql`
4. Paste and click **Run**

### Option C: Using TablePlus/pgAdmin
1. Connect to your database
2. Open SQL query window
3. Paste the SQL file contents
4. Execute

**What this creates:**
- ✅ `student_activities` table
- ✅ Indexes for fast queries
- ✅ Helper functions for clubs and modules
- ✅ Auto-update timestamp trigger
- ❌ NO RLS policies (we handle permissions in backend)

---

## Step 2: Verify Backend Module is Loaded

The module is already wired up in `app.module.ts`. Just make sure these files exist:

```
src/student-activities/
├── entities/
│   └── student-activity.entity.ts ✅
├── dto/
│   ├── create-student-activity.dto.ts ✅
│   ├── query-student-activities.dto.ts ✅
│   └── update-student-activity.dto.ts ✅
├── student-activities.controller.ts ✅
├── student-activities.service.ts ✅
└── student-activities.module.ts ✅
```

**Check it's imported:**
```typescript
// In src/app.module.ts - should see this line:
import { StudentActivitiesModule } from './student-activities/student-activities.module';

// And in imports array:
imports: [
  // ... other modules
  StudentActivitiesModule, // ✅ Should be here
],
```

---

## Step 3: Test the Endpoints

### Start your backend
```bash
cd core-api-layer/southville-nhs-school-portal-api-layer
npm run start:dev
```

### Check Swagger docs
Go to: `http://localhost:3000/api/docs`

Look for **"Student Activities"** section. You should see:
- `POST /student-activities` - Create activity
- `GET /student-activities/my-activities` - Get student's activities
- `PATCH /student-activities/:id/visibility` - Hide/show activity
- `GET /student-activities/my-activities/statistics` - Get stats

### Test with curl (or Postman)
```bash
# Get activities (replace YOUR_JWT_TOKEN with real token)
curl -X GET "http://localhost:3000/api/student-activities/my-activities?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Should return:
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

---

## Step 4: Integrate with Club System

### A. Update ClubMembershipsModule
**File**: `src/clubs/clubs.module.ts`

```typescript
import { StudentActivitiesModule } from '../student-activities/student-activities.module';

@Module({
  imports: [
    // ... existing imports
    StudentActivitiesModule, // ⬅️ Add this
  ],
  // ... rest
})
export class ClubsModule {}
```

### B. Update ClubMembershipsService
**File**: `src/clubs/services/club-memberships.service.ts`

```typescript
import { StudentActivitiesService } from '../../student-activities/student-activities.service';

export class ClubMembershipsService {
  constructor(
    // ... existing dependencies
    private readonly studentActivitiesService: StudentActivitiesService, // ⬅️ Add this
  ) {}

  // When student joins club
  async createMembership(createDto: any): Promise<any> {
    // ... your existing code to create membership ...

    const membership = await this.create(createDto);
    const club = await this.getClub(createDto.clubId);

    // 🎯 CREATE ACTIVITY
    try {
      await this.studentActivitiesService.create({
        studentUserId: createDto.studentId,
        activityType: 'club_joined',
        title: `Joined ${club.name}`,
        description: `You are now a member of ${club.name}`,
        metadata: {
          club_id: club.id,
          club_name: club.name,
        },
        relatedEntityId: club.id,
        relatedEntityType: 'club',
        icon: 'Users',
        color: 'text-blue-500',
      });
    } catch (error) {
      // Don't fail if activity creation fails
      console.error('Failed to create activity:', error);
    }

    return membership;
  }
}
```

### C. Test It!
1. Have a student join a club through your app
2. Check the activity timeline at `/student`
3. Should see "Joined [Club Name]" activity

---

## Step 5: Integrate with Module System

### A. Update ModulesModule
**File**: `src/modules/modules.module.ts`

```typescript
import { StudentActivitiesModule } from '../student-activities/student-activities.module';

@Module({
  imports: [
    // ... existing imports
    StudentActivitiesModule, // ⬅️ Add this
  ],
  // ... rest
})
export class ModulesModule {}
```

### B. Update ModulesService
**File**: `src/modules/modules.service.ts`

```typescript
import { StudentActivitiesService } from '../student-activities/student-activities.service';

export class ModulesService {
  constructor(
    // ... existing dependencies
    private readonly studentActivitiesService: StudentActivitiesService, // ⬅️ Add this
  ) {}

  // When teacher uploads a module
  async uploadModule(createDto: any, teacherId: string): Promise<any> {
    // ... your existing upload logic ...

    const module = await this.create(createDto);
    const teacher = await this.getTeacher(teacherId);

    // Get all students who should receive this module
    const students = await this.getStudentsForModule(module.id);

    // 🎯 CREATE ACTIVITY FOR EACH STUDENT
    for (const student of students) {
      try {
        await this.studentActivitiesService.create({
          studentUserId: student.id,
          activityType: 'module_uploaded_by_teacher',
          title: `${teacher.name} uploaded ${module.title}`,
          description: 'New learning material available',
          metadata: {
            module_id: module.id,
            module_title: module.title,
            teacher_name: teacher.name,
          },
          relatedEntityId: module.id,
          relatedEntityType: 'module',
          icon: 'BookOpen',
          color: 'text-purple-500',
        });
      } catch (error) {
        console.error(`Failed to create activity for student ${student.id}:`, error);
      }
    }

    return module;
  }
}
```

---

## Step 6: Verify Frontend

The frontend is already set up! Just check:

```bash
cd frontend-nextjs
npm run dev
```

Go to: `http://localhost:3000/student`

Scroll to **Activity Timeline** section.

**If no activities:**
- Shows empty state: "No recent activities"

**If activities exist:**
- Shows timeline with icons, colors, and descriptions

---

## Troubleshooting

### "Table does not exist"
✅ Run the SQL migration file

### "Module not found"
✅ Check `StudentActivitiesModule` is imported in `app.module.ts`

### "Cannot inject StudentActivitiesService"
✅ Import `StudentActivitiesModule` in the module where you're using it

### Activities not showing in frontend
1. Check backend is running
2. Check you're logged in as a student
3. Check browser console for errors
4. Try creating a test activity manually:

```bash
curl -X POST "http://localhost:3000/api/student-activities" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentUserId": "STUDENT_UUID",
    "activityType": "club_joined",
    "title": "Test Activity",
    "description": "Testing the timeline",
    "icon": "Users",
    "color": "text-blue-500"
  }'
```

---

## Activity Types Reference

```typescript
// Club activities
'club_joined'              // Student joins club
'club_left'                // Student leaves club
'club_position_changed'    // Student promoted/demoted
'club_event_created'       // Club creates event
'club_announcement_posted' // Club posts announcement
'club_member_added'        // New member joins

// Module activities
'module_received'          // Student receives module
'module_uploaded_by_teacher' // Teacher uploads module
```

---

## Icons & Colors Guide

### Icons (Lucide React)
```typescript
'Users'       // Clubs
'Trophy'      // Promotions
'Calendar'    // Events
'Bell'        // Announcements
'BookOpen'    // Modules
```

### Colors (Tailwind)
```typescript
'text-blue-500'    // Club joined, general
'text-yellow-500'  // Promotions
'text-purple-500'  // Events
'text-orange-500'  // Announcements
'text-green-500'   // New members
```

---

## Summary

**What you need to do:**
1. ✅ Run SQL migration
2. ✅ Add `StudentActivitiesModule` to `ClubsModule`
3. ✅ Inject `StudentActivitiesService` in `ClubMembershipsService`
4. ✅ Call `create()` when students join clubs
5. ✅ Same for modules

**That's it!** Activity timeline will work automatically. 🎉

No RLS, no policies, just simple database inserts and queries handled by your backend.
