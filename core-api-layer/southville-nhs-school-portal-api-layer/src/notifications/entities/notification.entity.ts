export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
  ERROR = 'error',
  SYSTEM = 'system',
}

export enum NotificationCategory {
  USER_ACCOUNT = 'user_account',
  ACADEMIC = 'academic',
  EVENT_ANNOUNCEMENT = 'event_announcement',
  SYSTEM = 'system',
  COMMUNICATION = 'communication',
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  category?: NotificationCategory;
  related_entity_type?: string;
  related_entity_id?: string;
  is_read: boolean;
  read_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

