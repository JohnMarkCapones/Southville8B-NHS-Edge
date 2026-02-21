# Club Announcements - Quick Reference Guide

## 📋 Overview
Simple CRUD system for club announcements. Teachers create announcements, everyone can view them.

## 🗄️ Database Setup

### Run Migration
```bash
# Execute this SQL file in your Supabase database
psql -U postgres -d your_database -f core-api-layer/southville-nhs-school-portal-api-layer/club_announcements_migration.sql
```

### Table Structure
```sql
club_announcements
├── id (UUID)
├── club_id (UUID) → clubs.id
├── title (VARCHAR 200)
├── content (TEXT)
├── priority ('low' | 'normal' | 'high' | 'urgent')
├── created_by (UUID) → auth.users.id
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 🔌 API Endpoints

Base URL: `http://localhost:3004/api/v1`

### 1️⃣ Create Announcement
```http
POST /club-announcements
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "club_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Welcome Meeting",
  "content": "Join us for our first meeting this Friday at 3 PM!",
  "priority": "high"
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "club_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Welcome Meeting",
  "content": "Join us for our first meeting this Friday at 3 PM!",
  "priority": "high",
  "created_by": "user-id-here",
  "created_at": "2025-03-20T10:30:00Z",
  "updated_at": "2025-03-20T10:30:00Z",
  "author": {
    "id": "user-id-here",
    "full_name": "John Doe",
    "email": "john.doe@teacher.com"
  }
}
```

### 2️⃣ Get All Announcements for a Club
```http
GET /club-announcements/club/:clubId
```

**Response:**
```json
[
  {
    "id": "...",
    "club_id": "...",
    "title": "Welcome Meeting",
    "content": "...",
    "priority": "high",
    "created_by": "...",
    "created_at": "2025-03-20T10:30:00Z",
    "updated_at": "2025-03-20T10:30:00Z",
    "author": {
      "id": "...",
      "full_name": "John Doe",
      "email": "john.doe@teacher.com"
    }
  }
]
```

### 3️⃣ Get Single Announcement
```http
GET /club-announcements/:id
```

### 4️⃣ Update Announcement
```http
PATCH /club-announcements/:id
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "title": "Updated Title",
  "priority": "urgent"
}
```

### 5️⃣ Delete Announcement
```http
DELETE /club-announcements/:id
Authorization: Bearer <your-jwt-token>
```

**Response:** `204 No Content`

## 🎨 Priority Levels

| Priority | Color | Use Case |
|----------|-------|----------|
| `low` | Gray | General information |
| `normal` | Blue | Regular updates |
| `high` | Orange | Important notices |
| `urgent` | Red | Critical/Time-sensitive |

## 🔐 Permissions

| Action | Who Can Do It |
|--------|---------------|
| **View** | Everyone (public) |
| **Create** | Teachers + Admins |
| **Update** | Creator or Admins |
| **Delete** | Creator or Admins |

## 💻 Frontend Usage

### Import API Functions
```typescript
import {
  getClubAnnouncements,
  createClubAnnouncement,
  updateClubAnnouncement,
  deleteClubAnnouncement,
  type ClubAnnouncement,
} from "@/lib/api/endpoints/clubs"
```

### Fetch Announcements
```typescript
const announcements = await getClubAnnouncements(clubId)
```

### Create Announcement
```typescript
const newAnnouncement = await createClubAnnouncement({
  club_id: clubId,
  title: "My Announcement",
  content: "Announcement details here",
  priority: "normal",
})
```

### Delete Announcement
```typescript
await deleteClubAnnouncement(announcementId)
```

## 🧪 Testing with cURL

### Create Announcement
```bash
curl -X POST http://localhost:3004/api/v1/club-announcements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "club_id": "your-club-id",
    "title": "Test Announcement",
    "content": "This is a test",
    "priority": "normal"
  }'
```

### Get Announcements
```bash
curl http://localhost:3004/api/v1/club-announcements/club/YOUR_CLUB_ID
```

### Delete Announcement
```bash
curl -X DELETE http://localhost:3004/api/v1/club-announcements/ANNOUNCEMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 Common Issues

### Issue: "Club not found"
**Solution**: Verify the `club_id` exists in the `clubs` table.

### Issue: "Forbidden - Not the creator"
**Solution**: Only the announcement creator or admins can update/delete. Check your JWT token and user role.

### Issue: "Invalid priority"
**Solution**: Priority must be one of: `low`, `normal`, `high`, `urgent`

### Issue: "Title/content too long"
**Solution**:
- Title max: 200 characters
- Content: No limit (TEXT field)

## 📊 Database Queries

### Get all announcements with author info
```sql
SELECT
  a.*,
  u.full_name,
  u.email
FROM club_announcements a
JOIN auth.users u ON a.created_by = u.id
WHERE a.club_id = 'your-club-id'
ORDER BY a.created_at DESC;
```

### Count announcements by priority
```sql
SELECT
  priority,
  COUNT(*) as count
FROM club_announcements
WHERE club_id = 'your-club-id'
GROUP BY priority;
```

## 🎯 UI Location

Navigate to: `/teacher/clubs/[clubId]` → Click **"Announcements"** tab

## ✨ Features

- ✅ Create, Read, Delete announcements
- ✅ Priority levels with color coding
- ✅ Author attribution
- ✅ Loading states
- ✅ Error handling
- ✅ Role-based access control
- ✅ Responsive UI
- ✅ Dark mode support

## 🚀 That's It!

You now have a fully functional club announcements system. Teachers can create announcements, and everyone can view them. The system is secure, performant, and easy to use.

For detailed implementation info, see `CLUB_ANNOUNCEMENTS_IMPLEMENTATION_COMPLETE.md`
