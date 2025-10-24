import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
// import { useNotifications } from '@/hooks/use-notifications';
import { Notification } from '@/lib/types/notification';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { useNavigationLoading } from '@/hooks/use-navigation-loading';

export default function NotificationsScreen() {
  // const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { isLoading, navigateWithLoading, navigateBackWithLoading } = useNavigationLoading();
  
  // Mock data for now
  const notifications: Notification[] = [
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
  ];
  
  const loading = false;
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: string) => {
    console.log('Mark as read:', id);
  };
  
  const markAllAsRead = () => {
    console.log('Mark all as read');
  };
  
  const deleteNotification = (id: string) => {
    console.log('Delete notification:', id);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'class_schedule': return { name: 'calendar', bg: '#E3F2FD', color: '#1976D2' };
      case 'school_event': return { name: 'megaphone', bg: '#F3E5F5', color: '#9C27B0' };
      case 'announcement': return { name: 'notifications', bg: '#FFEBEE', color: '#F44336' };
      case 'grade': return { name: 'school', bg: '#E8F5E9', color: '#4CAF50' };
      default: return { name: 'information-circle', bg: '#E8F5E9', color: '#4CAF50' };
    }
  };

  const getTimeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderNotificationCard = (notification: Notification) => {
    const icon = getNotificationIcon(notification.type);
    const timeAgo = getTimeAgo(notification.createdAt);

    return (
      <TouchableOpacity
        key={notification.id}
        style={[styles.notificationCard, !notification.read && styles.unreadCard]}
        onPress={() => markAsRead(notification.id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
          <Ionicons name={icon.name as any} size={24} color={icon.color} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{notification.title}</Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
          <Text style={styles.message}>{notification.message}</Text>
        </View>
        {!notification.read && <View style={styles.unreadDot} />}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(notification.id)}
        >
          <Ionicons name="trash" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity onPress={() => router.push('/notification-settings')}>
            <Ionicons name="settings-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateBackWithLoading()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={() => navigateWithLoading('/notification-settings')}>
          <Ionicons name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabActive}>
          <Text style={styles.tabTextActive}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Unread</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={styles.markAllRead}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Image source={require('@/assets/subjects/Spider.png')} style={styles.emptyImage} />
          <Text style={styles.emptyTitle}>No notification yet</Text>
          <Text style={styles.emptySubtitle}>
            Your notification will appear here once you've receive them.
          </Text>
          <Text style={styles.emptyHint}>Missing notification?</Text>
          <TouchableOpacity>
            <Text style={styles.emptyLink}>Go to material notification.</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <Text style={styles.sectionHeader}>Today</Text>
          {notifications.map(renderNotificationCard)}
        </ScrollView>
      )}
      
      {/* Loading Overlay */}
      <LoadingOverlay visible={isLoading} variant="notification" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  tabActive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#1976D2',
    borderRadius: 20,
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
  },
  tabTextActive: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  markAllRead: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
    marginLeft: 'auto',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCard: {
    backgroundColor: '#F8F9FF',
    borderColor: '#1976D2',
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  timeAgo: {
    fontSize: 12,
    color: '#666666',
  },
  message: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1976D2',
    marginTop: 8,
  },
  deleteButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 8,
  },
  emptyLink: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
});
