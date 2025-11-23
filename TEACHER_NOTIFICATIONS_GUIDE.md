# Teacher Notifications - Complete Guide

## 🔔 Overview

The Southville NHS Edge system includes a comprehensive notification system that keeps teachers informed about important school activities, student submissions, and administrative updates.

## 📱 Accessing Notifications

### Location

Notifications are accessible from the **bell icon** (🔔) in the top-right corner of the teacher header on any page.

### Features

- **Real-time Badge**: Shows unread notification count
- **Auto-refresh**: Updates every 30 seconds
- **Dropdown Preview**: Click the bell to see recent notifications
- **Full Page View**: Click "View All" to manage all notifications

## 🎯 Notification Types

### 1. **Event Announcements** 📅

**When**: Admin creates school-wide events
**Example**: "📅 School Event: Sports Day 2024"
**Details**: Includes event date, time, and location
**Expiration**: 14 days (for advance planning)

### 2. **Article Submissions** 📝

**When**: Students submit news articles for review
**Example**: "📝 Article Submitted for Review"
**Details**: Article title and submission time
**Expiration**: 7 days
**Action**: Review and approve/reject the article

### 3. **Quiz Submissions** ✍️

**When**: Students complete quizzes you created
**Example**: "Student Completed Quiz: [Quiz Name]"
**Details**: Student name and completion status
**Action**: Review answers and provide feedback

### 4. **Form Responses** 📋

**When**: Students submit club or activity forms you manage
**Example**: "New Form Response Received"
**Details**: Form name and student details
**Action**: Review and process the response

### 5. **Club Updates** 🎭

**When**: Club activities require teacher oversight
**Example**: "Club Announcement Posted"
**Details**: Club name and announcement content

## 🎨 Notification Categories

Notifications are color-coded by category:

- **🔵 COMMUNICATION** - Articles, announcements, messages
- **🟢 ACADEMIC** - Quizzes, grades, academic events
- **🟡 EVENT_ANNOUNCEMENT** - School events, calendar items
- **🟣 USER_ACCOUNT** - Account updates, role changes

## 📊 Notification Status

### Types

- **INFO** ℹ️ - Informational updates
- **SUCCESS** ✅ - Successful actions
- **WARNING** ⚠️ - Important alerts
- **ERROR** ❌ - Issues requiring attention

### Priority Levels

- **HIGH** - Urgent items requiring immediate action
- **MEDIUM** - Important but not urgent
- **LOW** - Informational only

## 💡 How to Use

### Viewing Notifications

1. **Click the bell icon** in the header
2. **See unread count** in the red badge
3. **Click notification** to view details
4. **Click "View All"** for full notification page

### Managing Notifications

#### Mark as Read

- Click any notification to automatically mark it as read
- Or click the checkmark icon to mark without opening

#### Delete Notifications

- Click the trash icon to remove notifications
- Deleted notifications cannot be recovered

#### Filter by Category

- Use category tabs on the notifications page
- View only ACADEMIC, COMMUNICATION, or EVENT notifications

### Notification Page Features

The full notification page (`/teacher/notifications`) includes:

- **Tab Navigation**: Filter by category
- **Mark All as Read**: Bulk action button
- **Delete Button**: Remove individual notifications
- **Timestamp**: See when each notification was sent
- **Auto-scroll**: Newest notifications appear at top

## ⚙️ Technical Details

### Auto-Refresh Interval

- **Frontend**: Checks for new notifications every 30 seconds
- **Real-time**: Updates badge count automatically
- **Network Efficient**: Only fetches when tab is active

### Expiration

- Notifications auto-expire based on type:
  - Events: 14 days
  - Articles: 7 days
  - Quizzes: 30 days
  - Forms: 14 days

### Database

- All notifications stored in `notifications` table
- Linked to your user account via `user_id`
- Filterable by `read_status` and `category`

## 🔍 Common Scenarios

### Scenario 1: Student Submits Quiz

1. Notification appears: "Student Completed Quiz"
2. Badge shows "+1" unread count
3. Click to view student details
4. Navigate to quiz grading page
5. Notification marked as read

### Scenario 2: Admin Creates Event

1. Notification: "📅 School Event: Parent-Teacher Conference"
2. Message includes: Date, time, location
3. 14-day advance notice for planning
4. Check your calendar to mark the date

### Scenario 3: Article Needs Review

1. Notification: "📝 Article Submitted for Review"
2. Click to see article title
3. Navigate to news approval page
4. Review and approve/reject
5. Student gets notified of decision

## 🎯 Best Practices

### Daily Routine

1. **Check notifications** at start of day
2. **Address urgent items** first (HIGH priority)
3. **Review submissions** (quizzes, forms, articles)
4. **Mark as read** to keep inbox clean

### Managing Volume

- Use **categories** to filter by importance
- **Delete old notifications** after taking action
- **Mark all as read** when caught up
- Focus on **unread badge** for new items

### Staying Organized

- Check notifications **before planning lessons**
- Review **event notifications** for schedule conflicts
- Process **quiz submissions** promptly for student feedback
- **Archive or delete** completed notifications

## 🆘 Troubleshooting

### Not Receiving Notifications?

1. Check your **account status** is active
2. Verify you have **teacher role** assigned
3. Check **internet connection**
4. Refresh the page (F5)

### Badge Not Updating?

- Auto-refresh runs every 30 seconds
- Click bell icon to **force refresh**
- Check browser console for errors

### Missing Event Notifications?

- Events must be **public visibility** to notify all teachers
- Admin must create the event (not students)
- Check your **notification permissions**

## 📈 Notification Statistics

Current system metrics (as of implementation):

- **294 total notifications** across all users
- **8 teacher notifications** sent
- **286 student notifications** sent
- **73 students** receiving notifications
- **Multiple categories** in active use

## 🚀 Future Enhancements

Planned notification features:

- Email digest for unread notifications
- Mobile push notifications
- Custom notification preferences
- Advanced filtering and search
- Notification scheduling and reminders

## 📞 Support

For issues with notifications:

1. Check this guide first
2. Try refreshing the page
3. Clear browser cache
4. Contact system administrator
5. Report bugs via support portal

---

## Quick Reference Card

### Key Shortcuts

- **Bell Icon**: View notifications
- **Badge Number**: Unread count
- **Click Notification**: Mark as read
- **Trash Icon**: Delete
- **View All**: Full page

### Notification Lifecycle

```
Created → Sent → Delivered → Read → [Expired/Deleted]
         ↓
    Unread (Badge)
```

### Categories at a Glance

- 📝 **COMMUNICATION** - Messages, articles
- 🎓 **ACADEMIC** - Quizzes, grades
- 📅 **EVENT** - School events
- 👤 **ACCOUNT** - Profile updates

---

**Last Updated**: Implementation Complete
**System Version**: Southville NHS Edge v1.0
**Document Owner**: Development Team
