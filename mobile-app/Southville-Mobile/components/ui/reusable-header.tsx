import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useTheme } from '@/contexts/theme-context';
import { useThemeColor } from '@/hooks/use-theme-color';
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
  const { isDark, toggleTheme } = useTheme();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
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
    <View style={[styles.headerSection, { backgroundColor }]}>
      {/* Top Header Row */}
      <View style={styles.topHeader}>
        {/* User Avatar */}
        <TouchableOpacity style={styles.avatarContainer} onPress={onAvatarPress}>
          <View style={[
            styles.avatarCircle,
            {
              backgroundColor: isDark ? '#404040' : '#E3F2FD',
              borderColor: isDark ? '#666666' : '#1976D2'
            }
          ]}>
            <Text style={[
              styles.avatarInitial,
              { color: isDark ? '#FFFFFF' : '#1976D2' }
            ]}>
              {userLoading ? '?' : (user?.full_name?.charAt(0) || 'S').toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Page Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.pageTitle, { color: textColor }]}>{title}</Text>
        </View>

        {/* Right Side Controls */}
        <View style={styles.rightControls}>
          {/* Dark Mode Toggle */}
          <TouchableOpacity style={styles.themeToggleContainer} onPress={toggleTheme}>
            <View style={[
              styles.themeToggleButton,
              { backgroundColor: isDark ? '#404040' : '#F5F5F5' }
            ]}>
              <Ionicons 
                name={isDark ? "sunny" : "moon"} 
                size={20} 
                color={iconColor} 
              />
            </View>
          </TouchableOpacity>

          {/* Notification Bell */}
          <TouchableOpacity style={styles.notificationContainer} onPress={handleNotificationPress}>
            <View style={[
              styles.notificationBell,
              { backgroundColor: isDark ? '#404040' : '#F5F5F5' }
            ]}>
              <Ionicons name="notifications-outline" size={20} color={iconColor} />
              {/* {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )} */}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Welcome Section - Only show if enabled */}
      {showWelcomeSection && (
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeLeft}>
            <Text style={[styles.welcomeText, { color: iconColor }]}>Welcome to Edge</Text>
            <View style={styles.studentTag}>
              <Text style={styles.studentTagText}>STUDENT</Text>
            </View>
          </View>
        </View>
      )}
      
      {/* Greeting Section - Only show if enabled */}
      {showWelcomeSection && (
        <View style={styles.greetingSection}>
          <Text style={[styles.greetingText, { color: textColor }]}>
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
    paddingTop: 32,
    paddingBottom: 16,
    paddingHorizontal: 20,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggleContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeToggleButton: {
    position: 'relative',
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'left',
  },
});
