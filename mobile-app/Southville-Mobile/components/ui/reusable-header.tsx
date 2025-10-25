import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCurrentUser } from '@/hooks/use-current-user';
// import { useNotifications } from '@/hooks/use-notifications';
import { LoadingOverlay } from './loading-overlay';
import { useNavigationLoading } from '@/hooks/use-navigation-loading';

interface ReusableHeaderProps {
  title: string;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
  showWelcomeSection?: boolean;
}

export function ReusableHeader({ 
  title, 
  onNotificationPress, 
  onAvatarPress,
  showWelcomeSection = false
}: ReusableHeaderProps) {
  const { user, loading: userLoading } = useCurrentUser();
  // const { unreadCount } = useNotifications();
  const { isLoading, navigateWithLoading } = useNavigationLoading();

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      navigateWithLoading('/notifications');
    }
  };

  return (
    <View style={styles.headerSection}>
      {/* Top Header Row */}
      <View style={styles.topHeader}>
        {/* User Avatar */}
        <TouchableOpacity style={styles.avatarContainer} onPress={onAvatarPress}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {userLoading ? '?' : (user?.full_name?.charAt(0) || 'S').toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Page Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>{title}</Text>
        </View>

        {/* Notification Bell */}
        <TouchableOpacity style={styles.notificationContainer} onPress={handleNotificationPress}>
          <View style={styles.notificationBell}>
            <Ionicons name="notifications-outline" size={20} color="#000000" />
            {/* {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )} */}
          </View>
        </TouchableOpacity>
      </View>

      {/* Welcome Section - Only show if enabled */}
      {showWelcomeSection && (
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.welcomeText}>Welcome to Edge</Text>
            <View style={styles.studentTag}>
              <Text style={styles.studentTagText}>STUDENT</Text>
            </View>
          </View>
        </View>
      )}
      
      {/* Greeting Section - Only show if enabled */}
      {showWelcomeSection && (
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>
            Good {getGreeting()}, {user?.student?.first_name || 'Student'}
          </Text>
        </View>
      )}
      
      {/* Loading Overlay */}
      <LoadingOverlay visible={isLoading} variant="heart" />
    </View>
  );
}

// Helper function to get greeting based on time
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  headerSection: {
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1976D2',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  notificationContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBell: {
    position: 'relative',
    width: 32,
    height: 32,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  welcomeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  studentTag: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  studentTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  greetingSection: {
    alignItems: 'flex-start',
    marginTop: 4,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'left',
  },
});
