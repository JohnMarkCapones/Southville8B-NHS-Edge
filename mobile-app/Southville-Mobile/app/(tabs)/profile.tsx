import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useCurrentUser } from '@/hooks/use-current-user';

const { width: screenWidth } = Dimensions.get('window');

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { } = useAuthSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Fetch current user data
  const { user, loading: userLoading, error: userError } = useCurrentUser();

  const handleLogout = useCallback(async () => {
    // COMMENTED OUT: Prevent logout functionality
    console.log('Logout button pressed - functionality disabled');
    return;
    
    // if (isLoggingOut) {
    //   return;
    // }

    // try {
    //   setIsLoggingOut(true);
    //   await signOut();
    //   // Let the auth state change handle navigation automatically
    // } catch (error) {
    //   console.error('Logout error:', error);
    //   setIsLoggingOut(false);
    // }
  }, [isLoggingOut]);

  // Helper function to get avatar initial
  const getAvatarInitial = () => {
    if (user?.full_name) {
      return user.full_name.charAt(0).toUpperCase();
    }
    if (user?.student?.first_name) {
      return user.student.first_name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Helper function to get display name
  const getDisplayName = () => {
    if (user?.full_name) {
      return user.full_name;
    }
    if (user?.student?.first_name && user?.student?.last_name) {
      return `${user.student.first_name} ${user.student.last_name}`;
    }
    return 'User';
  };

  // Helper function to get student ID
  const getStudentId = () => {
    return user?.student?.student_id || 'Not available';
  };

  // Helper function to get contact info
  const getContactInfo = () => {
    return {
      email: user?.email || 'Not provided',
      mobile: user?.profile?.phone_number || 'Not provided',
      address: user?.profile?.address || 'Not provided',
    };
  };

  // Helper function to get section name
  const getSectionName = () => {
    // Use section name from nested object or fallback to placeholder
    return user?.student?.section?.name || 'Newton';
  };

  // Navigation handlers
  const handlePersonalInfo = useCallback(() => {
    router.push('/personal-information');
  }, [router]);

  const handleAccountSecurity = useCallback(() => {
    router.push('/account-security');
  }, [router]);

  const handleSchoolInfo = useCallback(() => {
    router.push('/school-information');
  }, [router]);

  if (userLoading) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText type="default" style={styles.loadingText}>
            Loading profile...
          </ThemedText>
        </View>
      </ScrollView>
    );
  }

  if (userError) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}>
        <ThemedView style={[styles.errorCard, { borderColor: colors.icon }]}>
          <ThemedText type="default" style={styles.errorText}>
            Failed to load profile: {userError}
          </ThemedText>
        </ThemedView>
      </ScrollView>
    );
  }

  const contactInfo = getContactInfo();

  return (
    <View style={[styles.container, { backgroundColor: '#F5F5F5' }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}>
        
        {/* Blue Gradient Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getAvatarInitial()}</Text>
              </View>
            </View>
            
            <View style={styles.headerInfo}>
              {/* Streak Badge */}
              <View style={styles.streakBadge}>
                <Ionicons name="trophy-outline" size={16} color="#FFD700" />
                <Text style={styles.streakText}>Highest 29 streak</Text>
              </View>
              
              {/* Name */}
              <Text style={styles.userName}>{getDisplayName()}</Text>
              
              {/* Email */}
              <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
              
              {/* Student Role */}
              <Text style={styles.userRole}>Student</Text>
            </View>
          </View>
        </View>

        {/* Stats Cards Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user?.student?.grade_level || '10'}</Text>
            <Text style={styles.statLabel}>Grade</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getSectionName()}</Text>
            <Text style={styles.statLabel}>Section</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user?.student?.rank || 'N/A'}</Text>
            <Text style={styles.statLabel}>Ranking</Text>
          </View>
        </View>

        {/* Personal Section Container */}
        <View style={styles.personalSection}>
          <Text style={styles.sectionTitle}>Personal</Text>
          
          {/* Personal Information */}
          <TouchableOpacity style={styles.menuItem} onPress={handlePersonalInfo}>
            <View style={styles.menuIcon}>
              <Ionicons name="person-outline" size={20} color="#1976D2" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>
                <Text style={styles.menuTitleBlue}>Personal </Text>
                <Text style={styles.menuTitleBlack}>Information</Text>
              </Text>
              <Text style={styles.menuSubtitle}>Detail your personal data</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#666666" />
          </TouchableOpacity>

          {/* Account Security */}
          <TouchableOpacity style={styles.menuItem} onPress={handleAccountSecurity}>
            <View style={styles.menuIcon}>
              <Ionicons name="shield-outline" size={20} color="#1976D2" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>
                <Text style={styles.menuTitleBlue}>Account </Text>
                <Text style={styles.menuTitleBlack}>Security</Text>
              </Text>
              <Text style={styles.menuSubtitle}>Manage your account security</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#666666" />
          </TouchableOpacity>

          {/* School Information */}
          <TouchableOpacity style={styles.menuItem} onPress={handleSchoolInfo}>
            <View style={styles.menuIcon}>
              <Ionicons name="school-outline" size={20} color="#1976D2" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>
                <Text style={styles.menuTitleBlue}>School </Text>
                <Text style={styles.menuTitleBlack}>Information</Text>
              </Text>
              <Text style={styles.menuSubtitle}>Check school informations</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { opacity: isLoggingOut ? 0.6 : 1 }]}
          onPress={handleLogout}
          accessibilityRole="button"
          disabled={isLoggingOut}>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>
        
      </ScrollView>
      
      {/* Loading Overlay */}
      <LoadingOverlay visible={userLoading} variant="heart" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  
  // Blue Gradient Header Section
  headerSection: {
    backgroundColor: '#5BA3D0',
    paddingTop: 50, // Account for status bar
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    gap: 6,
  },
  streakText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  userRole: {
    fontSize: 10,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  
  // Stats Cards Row
  statsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -30, // Pull up to overlap with blue header
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  
  // Personal Section Container
  personalSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20, // Reduced margin since stats container overlaps
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    gap: 4,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuTitleBlue: {
    color: '#1976D2',
  },
  menuTitleBlack: {
    color: '#1A1A1A',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  
  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  
  // Loading and Error States
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    opacity: 0.7,
  },
  errorCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
