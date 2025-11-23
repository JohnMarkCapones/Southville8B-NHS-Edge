# Notification System Backend API Specification

## Overview

This document outlines the required backend API endpoints for the notification system integration. The mobile app currently uses mock data but is structured to easily swap to real API calls.

## Database Schema

```sql
-- Notifications table (already exists)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR NOT NULL, -- 'class_schedule', 'school_event', 'announcement', 'grade'
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User push tokens table (needs to be created)
CREATE TABLE user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  token TEXT NOT NULL,
  platform VARCHAR NOT NULL, -- 'ios', 'android', 'web'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Required API Endpoints

### 1. Get User Notifications

**Endpoint**: `GET /api/v1/notifications`

**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of notifications per page (default: 20)
- `read` (optional): Filter by read status ('true', 'false', or omit for all)
- `type` (optional): Filter by notification type

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "Class Suspension Notice !",
      "message": "All classes for All levels are suspended today at 8:00 AM due to heavy rain.",
      "type": "announcement",
      "read": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

### 2. Mark Notification as Read

**Endpoint**: `PATCH /api/v1/notifications/:id/read`

**Response**:
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### 3. Mark All Notifications as Read

**Endpoint**: `PATCH /api/v1/notifications/mark-all-read`

**Response**:
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### 4. Delete Notification

**Endpoint**: `DELETE /api/v1/notifications/:id`

**Response**:
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

### 5. Save User Push Token

**Endpoint**: `POST /api/v1/users/push-token`

**Request Body**:
```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "ios"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Push token saved"
}
```

## Push Notification Trigger Points

The backend should send push notifications for the following events:

### 1. New Announcement Posted
- **Trigger**: When admin/teacher creates a new announcement
- **Recipients**: All students or specific groups
- **Notification Type**: `announcement`

### 2. Class Schedule Change
- **Trigger**: When schedule is modified (time, room, teacher change)
- **Recipients**: Affected students
- **Notification Type**: `class_schedule`

### 3. Upcoming Class Reminder
- **Trigger**: 15 minutes before class starts
- **Recipients**: Students with upcoming classes
- **Notification Type**: `class_schedule`

### 4. New Event Published
- **Trigger**: When admin/teacher publishes a new event
- **Recipients**: All students or specific groups
- **Notification Type**: `school_event`

### 5. Grade Posted
- **Trigger**: When teacher posts grades for an assignment/exam
- **Recipients**: Students whose grades were posted
- **Notification Type**: `grade`

## Push Notification Payload Structure

```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Class Suspension Notice !",
  "body": "All classes for All levels are suspended today at 8:00 AM due to heavy rain.",
  "data": {
    "type": "announcement",
    "notificationId": "uuid",
    "action": "view_notification"
  },
  "sound": "default",
  "badge": 1
}
```

## Implementation Notes

### Mobile App Integration Points

1. **Replace Mock Service**: Update `services/notifications.ts` to use real API calls
2. **Error Handling**: Add proper error handling for network failures
3. **Offline Support**: Consider caching notifications for offline viewing
4. **Real-time Updates**: Implement WebSocket or polling for real-time notification updates

### Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Users can only access their own notifications
3. **Rate Limiting**: Implement rate limiting for push token registration
4. **Data Validation**: Validate all input data and sanitize content

### Performance Considerations

1. **Pagination**: Implement efficient pagination for large notification lists
2. **Indexing**: Add database indexes on `user_id`, `created_at`, and `read` columns
3. **Caching**: Consider Redis caching for frequently accessed notifications
4. **Batch Operations**: Support batch operations for marking multiple notifications as read

## Testing Strategy

1. **Unit Tests**: Test individual API endpoints
2. **Integration Tests**: Test notification flow from creation to delivery
3. **Push Notification Tests**: Test on physical devices (iOS/Android)
4. **Performance Tests**: Test with large datasets and concurrent users
5. **Error Handling Tests**: Test network failures and edge cases

## Migration from Mock Data

When ready to integrate with real backend:

1. Update `services/notifications.ts` to replace mock functions with API calls
2. Add proper error handling and loading states
3. Implement retry logic for failed requests
4. Add offline support and data persistence
5. Test thoroughly on physical devices for push notifications
