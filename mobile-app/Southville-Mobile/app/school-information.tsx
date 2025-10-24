import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrentUser } from '@/hooks/use-current-user';

export default function SchoolInformationScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  
  // Fetch current user data
  const { user, loading: userLoading, error: userError } = useCurrentUser();

  if (userLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#1976D2" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>School Information</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading school information...</Text>
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
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#1976D2" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>School Information</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load school information: {userError}</Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: '#F5F5F5' }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1976D2" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>School Information</Text>
          <View style={styles.placeholder} />
        </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        
        {/* School Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.schoolLogo}>
            <Ionicons name="school" size={48} color="#1976D2" />
          </View>
          <Text style={styles.schoolName}>Southville 8B</Text>
          <Text style={styles.schoolType}>National High School</Text>
          <Text style={styles.schoolDescription}>
            A premier educational institution committed to academic excellence and student development.
          </Text>
        </View>

        {/* Student Information */}
        {user?.student && (
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Your Academic Information</Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="school-outline" size={20} color="#1976D2" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Grade Level</Text>
                <Text style={styles.detailValue}>{user.student.grade_level || 'Not specified'}</Text>
              </View>
            </View>

            {user.student.section?.name && (
              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={20} color="#1976D2" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Section</Text>
                  <Text style={styles.detailValue}>{user.student.section.name}</Text>
                </View>
              </View>
            )}

            <View style={styles.detailRow}>
              <Ionicons name="id-card-outline" size={20} color="#1976D2" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Student ID</Text>
                <Text style={styles.detailValue}>{user.student.student_id || 'Not available'}</Text>
              </View>
            </View>

            {user.student.lrn_id && (
              <View style={styles.detailRow}>
                <Ionicons name="card-outline" size={20} color="#1976D2" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>LRN</Text>
                  <Text style={styles.detailValue}>{user.student.lrn_id}</Text>
                </View>
              </View>
            )}

            {user.student.honor_status && (
              <View style={styles.detailRow}>
                <Ionicons name="trophy-outline" size={20} color="#1976D2" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Honor Status</Text>
                  <Text style={styles.detailValue}>{user.student.honor_status}</Text>
                </View>
              </View>
            )}

            {user.student.rank && (
              <View style={styles.detailRow}>
                <Ionicons name="medal-outline" size={20} color="#1976D2" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Class Rank</Text>
                  <Text style={styles.detailValue}>#{user.student.rank}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* School Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>School Details</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color="#1976D2" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailValue}>Southville 8B, Philippines</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={20} color="#1976D2" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Contact</Text>
              <Text style={styles.detailValue}>Contact school administration</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color="#1976D2" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Academic Year</Text>
              <Text style={styles.detailValue}>2024-2025</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color="#1976D2" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>School Hours</Text>
              <Text style={styles.detailValue}>7:00 AM - 5:00 PM</Text>
            </View>
          </View>
        </View>

        {/* Programs and Services */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Programs & Services</Text>
          
          <View style={styles.programList}>
            <View style={styles.programItem}>
              <Ionicons name="book-outline" size={20} color="#1976D2" />
              <Text style={styles.programText}>Academic Excellence Program</Text>
            </View>
            <View style={styles.programItem}>
              <Ionicons name="people-outline" size={20} color="#1976D2" />
              <Text style={styles.programText}>Student Organizations</Text>
            </View>
            <View style={styles.programItem}>
              <Ionicons name="trophy-outline" size={20} color="#1976D2" />
              <Text style={styles.programText}>Sports & Athletics</Text>
            </View>
            <View style={styles.programItem}>
              <Ionicons name="musical-notes-outline" size={20} color="#1976D2" />
              <Text style={styles.programText}>Arts & Culture</Text>
            </View>
            <View style={styles.programItem}>
              <Ionicons name="library-outline" size={20} color="#1976D2" />
              <Text style={styles.programText}>Library Services</Text>
            </View>
            <View style={styles.programItem}>
              <Ionicons name="medical-outline" size={20} color="#1976D2" />
              <Text style={styles.programText}>Health Services</Text>
            </View>
          </View>
        </View>
        
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
    backgroundColor: '#FFFFFF',
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
    color: '#1A1A1A',
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
  
  // School Overview Card
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  schoolLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  schoolName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  schoolType: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '600',
    marginBottom: 16,
  },
  schoolDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Details Cards
  detailsCard: {
    backgroundColor: '#FFFFFF',
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
    color: '#1A1A1A',
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
    color: '#666666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  
  // Programs List
  programList: {
    gap: 12,
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  programText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
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
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
});
