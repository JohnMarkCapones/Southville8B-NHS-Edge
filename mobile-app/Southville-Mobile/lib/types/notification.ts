export type NotificationType = 'class_schedule' | 'school_event' | 'announcement' | 'grade';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  inAppEnabled: boolean;
  scheduleEnabled: boolean;
  eventEnabled: boolean;
}
