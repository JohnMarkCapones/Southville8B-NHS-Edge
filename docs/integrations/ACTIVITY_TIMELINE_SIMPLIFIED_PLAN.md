# Activity Timeline - SIMPLIFIED PLAN

## What We're Actually Tracking

### ✅ Club Activities (6 types)
1. **Member joined club** - When a student joins
2. **Member left club** - When a student leaves
3. **Member promoted** - Position change (e.g., Member → President)
4. **New event created** - Club creates an event
5. **New announcement posted** - Club posts announcement
6. **New member added** - Someone new joins the club

### ✅ Module Activities (2 types)
1. **Module received** - When student gets a new module
2. **Module uploaded by teacher** - When teacher uploads new material

### ❌ What We're NOT Tracking
- ~~Quiz anything~~ (you don't want this)
- ~~Assignments~~ (you don't have this system)
- ~~Achievements/Badges~~ (keeping it simple)
- ~~Academic updates~~ (GWA, ranks - maybe later)

---

## Files Updated

### Backend
✅ `student_activity_timeline_SIMPLIFIED.sql` - Clean database with only club + module types
✅ `src/student-activities/entities/student-activity.entity.ts` - Removed quiz/assignment enums
✅ Backend service/controller - Already supports this (no changes needed)

### Frontend
✅ `lib/api/endpoints/student-activities.ts` - Updated enum to match
✅ `hooks/useStudentActivities.ts` - Works as-is
✅ `app/student/page.tsx` - Already integrated

---

## How to Use

### Step 1: Run the Simplified SQL Migration
```bash
# Use THIS file instead of the full one
student_activity_timeline_SIMPLIFIED.sql
```

This creates:
- `student_activities` table
- Only 9 activity types (6 club + 2 module + 1 other)
- Helper functions for clubs and modules

### Step 2: Integrate with Club System

When a student **joins a club**:
```typescript
// In club-memberships.service.ts
await this.studentActivitiesService.create({
  studentUserId: studentId,
  activityType: 'club_joined',
  title: `Joined ${club.name}`,
  description: `You are now a ${position.name}`,
  metadata: {
    club_id: clubId,
    club_name: club.name,
    position: position.name,
  },
  relatedEntityId: clubId,
  relatedEntityType: 'club',
  icon: 'Users',
  color: 'text-blue-500',
});
```

When someone is **promoted**:
```typescript
await this.studentActivitiesService.create({
  studentUserId: studentId,
  activityType: 'club_position_changed',
  title: `Promoted in ${club.name}`,
  description: `New role: ${newPosition.name}`,
  metadata: {
    club_id: clubId,
    club_name: club.name,
    old_position: oldPosition.name,
    new_position: newPosition.name,
  },
  relatedEntityId: clubId,
  relatedEntityType: 'club',
  icon: 'Trophy',
  color: 'text-yellow-500',
  isHighlighted: true, // Promotions are important!
});
```

When club creates **new event**:
```typescript
// Create activity for ALL club members
const members = await this.clubMembershipsService.getClubMembers(clubId);

for (const member of members) {
  await this.studentActivitiesService.create({
    studentUserId: member.studentId,
    activityType: 'club_event_created',
    title: `${club.name} created new event`,
    description: `Event: ${event.title} on ${event.date}`,
    metadata: {
      club_id: clubId,
      club_name: club.name,
      event_id: event.id,
      event_title: event.title,
      event_date: event.date,
    },
    relatedEntityId: clubId,
    relatedEntityType: 'club',
    icon: 'Calendar',
    color: 'text-purple-500',
  });
}
```

When club posts **announcement**:
```typescript
// Notify all club members
const members = await this.clubMembershipsService.getClubMembers(clubId);

for (const member of members) {
  await this.studentActivitiesService.create({
    studentUserId: member.studentId,
    activityType: 'club_announcement_posted',
    title: `New announcement from ${club.name}`,
    description: announcement.title,
    metadata: {
      club_id: clubId,
      club_name: club.name,
      announcement_id: announcement.id,
      announcement_title: announcement.title,
    },
    relatedEntityId: clubId,
    relatedEntityType: 'club',
    icon: 'Bell',
    color: 'text-orange-500',
  });
}
```

### Step 3: Integrate with Module System

When teacher **uploads module**:
```typescript
// In modules.service.ts - after upload
// Notify students in the section/subject
const students = await this.getStudentsForModule(moduleId);

for (const student of students) {
  await this.studentActivitiesService.create({
    studentUserId: student.id,
    activityType: 'module_uploaded_by_teacher',
    title: `${teacher.name} uploaded ${module.title}`,
    description: 'New learning material available',
    metadata: {
      module_id: moduleId,
      module_title: module.title,
      teacher_name: teacher.name,
      subject: module.subject,
    },
    relatedEntityId: moduleId,
    relatedEntityType: 'module',
    icon: 'BookOpen',
    color: 'text-purple-500',
  });
}
```

When student **receives/downloads module**:
```typescript
await this.studentActivitiesService.create({
  studentUserId: studentId,
  activityType: 'module_received',
  title: `Received: ${module.title}`,
  description: 'Learning material added to your library',
  metadata: {
    module_id: moduleId,
    module_title: module.title,
  },
  relatedEntityId: moduleId,
  relatedEntityType: 'module',
  icon: 'BookOpen',
  color: 'text-blue-500',
});
```

---

## Activity Timeline Will Show

### Example Activities a Student Sees:
```
📅 2 hours ago
👥 Joined Science Club
You are now a Member

📅 5 hours ago
📚 Mr. Smith uploaded Chemistry Lab Guide
New learning material available

📅 1 day ago
🏆 Promoted in Robotics Club
New role: Vice President

📅 2 days ago
🔔 New announcement from Drama Club
Auditions for Spring Musical

📅 3 days ago
📅 Science Club created new event
Event: Science Fair on March 15
```

---

## What's Next?

### Immediate (Do This First)
1. ✅ Run `student_activity_timeline_SIMPLIFIED.sql` in Supabase
2. ✅ Inject `StudentActivitiesService` into `ClubMembershipsService`
3. ✅ Add activity creation when students join/leave clubs
4. ✅ Test with a real student account

### Soon After
1. Add activity when club events are created
2. Add activity when club announcements are posted
3. Add activity when teachers upload modules
4. Add activity when students receive modules

### Optional Enhancements
- Add "mark as read" functionality
- Add filtering by activity type (club only, modules only)
- Add "View all activities" page
- Add notifications badge

---

## Testing Checklist

- [ ] Student joins club → Activity appears in timeline
- [ ] Student promoted in club → Highlighted activity appears
- [ ] Club creates event → All members see activity
- [ ] Club posts announcement → All members see activity
- [ ] Teacher uploads module → Students in that class see activity
- [ ] Activities show correct icons and colors
- [ ] Timeline is sorted by most recent first
- [ ] Loading state works
- [ ] Empty state shows when no activities

---

## Summary

**What you wanted**: Simple activity tracking for clubs and modules only
**What I removed**: Quiz, assignments, achievements, academic updates
**What's left**: 6 club activities + 2 module activities = 8 total activity types

Clean, focused, and exactly what you asked for! 🎯
