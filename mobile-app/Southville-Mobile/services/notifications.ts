import { Notification } from '@/lib/types/notification';

// Mock data matching the design
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: 'user-1',
    title: 'Class Suspension Notice !',
    message: 'All classes for All levels are suspended today at 8:00 AM due to heavy rain.',
    type: 'announcement',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user-1',
    title: 'Class Schedule Notice',
    message: 'Incoming class subject English 8-00, Room 302 with sir Richard',
    type: 'class_schedule',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    userId: 'user-1',
    title: 'Class Schedule Notice',
    message: 'Incoming class subject Mathematics 10-00, Room 205 with sir Johnson',
    type: 'class_schedule',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '4',
    userId: 'user-1',
    title: 'School Event Notice',
    message: 'Incoming event that you are interested! ML Tournament 2025',
    type: 'school_event',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '5',
    userId: 'user-1',
    title: 'Grade Posted',
    message: 'Your grade for Mathematics Midterm Exam has been posted. Check your grades section.',
    type: 'grade',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const notificationsService = {
  // Mock functions - ready to replace with real API calls
  async getNotifications(): Promise<Notification[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockNotifications]), 500);
    });
  },

  async markAsRead(id: string): Promise<void> {
    const notif = mockNotifications.find(n => n.id === id);
    if (notif) notif.read = true;
  },

  async markAllAsRead(): Promise<void> {
    mockNotifications.forEach(n => n.read = true);
  },

  async deleteNotification(id: string): Promise<void> {
    const index = mockNotifications.findIndex(n => n.id === id);
    if (index > -1) mockNotifications.splice(index, 1);
  },
};

// TODO: Replace with real API calls when backend is ready:
// - GET /api/v1/notifications
// - PATCH /api/v1/notifications/:id/read
// - DELETE /api/v1/notifications/:id
