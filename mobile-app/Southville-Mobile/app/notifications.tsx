import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useCallback } from 'react';
// import { useNotifications } from '@/hooks/use-notifications';
import { Notification } from '@/lib/types/notification';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { useNavigationLoading } from '@/hooks/use-navigation-loading';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

export default function NotificationsScreen() {
  // const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { isLoading, navigateWithLoading, navigateBackWithLoading } = useNavigationLoading();
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const [refreshing, setRefreshing] = useState(false);
  
  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real implementation, this would call the notifications refetch function
      // await refetchNotifications();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);
  
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
        style={[
          styles.notificationCard, 
          { 
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#F0F0F0'
          },
          !notification.read && {
            backgroundColor: isDark ? 'rgba(25, 118, 210, 0.1)' : '#F8F9FF',
            borderColor: colors.tint
          }
        ]}
        onPress={() => markAsRead(notification.id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
          <Ionicons name={icon.name as any} size={24} color={icon.color} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]}>{notification.title}</Text>
            <Text style={[styles.timeAgo, { color: colors.icon }]}>{timeAgo}</Text>
          </View>
          <Text style={[styles.message, { color: colors.text }]}>{notification.message}</Text>
        </View>
        {!notification.read && <View style={[styles.unreadDot, { backgroundColor: colors.tint }]} />}
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { 
          backgroundColor: colors.background,
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#F0F0F0'
        }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
          <TouchableOpacity onPress={() => router.push('/notification-settings')}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.icon }]}>Loading notifications...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: colors.background,
        borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#F0F0F0'
      }]}>
        <TouchableOpacity onPress={() => navigateBackWithLoading()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity onPress={() => navigateWithLoading('/notification-settings')}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { 
        backgroundColor: colors.background,
        borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#F0F0F0'
      }]}>
        <TouchableOpacity style={styles.tab}>
          <Text style={[styles.tabText, { color: colors.icon }]}>Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabActive, { backgroundColor: isDark ? '#404040' : colors.tint }]}>
          <Text style={styles.tabTextActive}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={[styles.tabText, { color: colors.icon }]}>Unread</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={[styles.markAllRead, { color: colors.tint }]}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Image source={require('@/assets/subjects/Spider.png')} style={styles.emptyImage} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No notification yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
            Your notification will appear here once you've receive them.
          </Text>
          <Text style={[styles.emptyHint, { color: colors.icon }]}>Missing notification?</Text>
          <TouchableOpacity>
            <Text style={[styles.emptyLink, { color: colors.tint }]}>Go to material notification.</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.tint]}
              tintColor={colors.tint}
              progressBackgroundColor={colors.background}
            />
          }>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>Today</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
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
    borderRadius: 20,
  },
  tabText: {
    fontSize: 14,
  },
  tabTextActive: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  markAllRead: {
    fontSize: 14,
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
    marginTop: 16,
    marginBottom: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    flex: 1,
    marginRight: 8,
  },
  timeAgo: {
    fontSize: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  emptyHint: {
    fontSize: 14,
    marginBottom: 8,
  },
  emptyLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
});
