import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { useCurrentUser } from '@/hooks/use-current-user';

export default function PersonalInformationScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const router = useRouter();
  
  // Fetch current user data
  const { user, loading: userLoading, error: userError } = useCurrentUser();

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

  if (userLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { 
            backgroundColor: colors.background,
            borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
          }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.tint} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Personal Information</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.icon }]}>Loading personal information...</Text>
          </View>
        </View>
      </>
    );
  }

  if (userError) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { 
            backgroundColor: colors.background,
            borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
          }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.tint} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Personal Information</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: '#F44336' }]}>Failed to load personal information: {userError}</Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { 
          backgroundColor: colors.background,
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
        }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.tint} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Personal Information</Text>
          <View style={styles.placeholder} />
        </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        
        {/* Profile Card */}
        <View style={[styles.profileCard, { 
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
          borderWidth: isDark ? 1 : 0
        }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { 
              backgroundColor: isDark ? 'rgba(25, 118, 210, 0.2)' : '#E3F2FD',
              borderColor: colors.tint
            }]}>
              <Text style={[styles.avatarText, { color: colors.tint }]}>{getAvatarInitial()}</Text>
            </View>
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>{getDisplayName()}</Text>
          <Text style={[styles.profileRole, { 
            color: colors.icon,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F0F0F0'
          }]}>Student</Text>
        </View>

        {/* Personal Details */}
        <View style={[styles.detailsCard, { 
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
          borderWidth: isDark ? 1 : 0
        }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Personal Details</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={20} color={colors.tint} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.icon }]}>Full Name</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{getDisplayName()}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="id-card-outline" size={20} color={colors.tint} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.icon }]}>Student ID</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{user?.student?.student_id || 'Not available'}</Text>
            </View>
          </View>

          {user?.student?.lrn_id && (
            <View style={styles.detailRow}>
              <Ionicons name="card-outline" size={20} color={colors.tint} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.icon }]}>LRN</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{user.student.lrn_id}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={20} color={colors.tint} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.icon }]}>Email</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{user?.email || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={20} color={colors.tint} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.icon }]}>Phone Number</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{user?.profile?.phone_number || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color={colors.tint} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.icon }]}>Address</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{user?.profile?.address || 'Not provided'}</Text>
            </View>
          </View>
        </View>

        {/* Academic Information */}
        {user?.student && (
          <View style={[styles.detailsCard, { 
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
            borderWidth: isDark ? 1 : 0
          }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Academic Information</Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="school-outline" size={20} color={colors.tint} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.icon }]}>Grade Level</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{user.student.grade_level || 'Not specified'}</Text>
              </View>
            </View>

            {user.student.section?.name && (
              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={20} color={colors.tint} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.icon }]}>Section</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{user.student.section.name}</Text>
                </View>
              </View>
            )}

            {user.student.honor_status && (
              <View style={styles.detailRow}>
                <Ionicons name="trophy-outline" size={20} color={colors.tint} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.icon }]}>Honor Status</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{user.student.honor_status}</Text>
                </View>
              </View>
            )}

            {user.student.rank && (
              <View style={styles.detailRow}>
                <Ionicons name="medal-outline" size={20} color={colors.tint} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.icon }]}>Rank</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>#{user.student.rank}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Additional Profile Information */}
        {user?.profile && (
          <View style={[styles.detailsCard, { 
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
            borderWidth: isDark ? 1 : 0
          }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Additional Information</Text>
            
            {user.profile.birthday && (
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={20} color={colors.tint} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.icon }]}>Birthday</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {new Date(user.profile.birthday).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            )}

            {user.profile.gender && (
              <View style={styles.detailRow}>
                <Ionicons name="person-outline" size={20} color={colors.tint} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.icon }]}>Gender</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{user.profile.gender}</Text>
                </View>
              </View>
            )}
          </View>
        )}
        
      </ScrollView>
      </View>
    </>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  
  // Profile Card
  profileCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  
  // Details Cards
  detailsCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  detailContent: {
    flex: 1,
    gap: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
