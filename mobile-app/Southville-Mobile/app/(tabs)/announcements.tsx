import { useMemo, useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Text, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ReusableHeader } from '@/components/ui/reusable-header';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useAuthErrorHandler } from '@/hooks/use-auth-error-handler';
import { useAnnouncements } from '@/hooks/use-announcements';
import { formatAnnouncementContent } from '@/utils/html-utils';

const { width: screenWidth } = Dimensions.get('window');

export default function AnnouncementsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch announcements from API
  const { announcements, loading: announcementsLoading, error: announcementsError, refetch: refetchAnnouncements } = useAnnouncements({
    page: 1,
    limit: 20, // Show more announcements in the dedicated screen
    includeExpired: false,
  });

  // Auth error handling
  const { handleAuthError } = useAuthErrorHandler();

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchAnnouncements();
    } catch (error) {
      console.error('Error refreshing announcements:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchAnnouncements]);

  // Auto-redirect to login on authentication errors
  useEffect(() => {
    console.log('[ANNOUNCEMENTS][AUTO-REDIRECT] Checking for auth errors', {
      hasError: !!announcementsError
    });
    
    // Check for authentication error using centralized handler
    if (announcementsError) {
      const wasRedirected = handleAuthError(announcementsError);
      if (wasRedirected) {
        console.log('[ANNOUNCEMENTS][AUTO-REDIRECT] Auth error handled - redirecting to login');
      }
    }
  }, [announcementsError, handleAuthError]);

  // Helper function to get announcement type and styling
  const getAnnouncementType = (title: string) => {
    const urgentKeywords = ['urgent', 'emergency', 'immediate', 'asap'];
    const academicKeywords = ['exam', 'grade', 'scholarship', 'library', 'study'];
    
    if (urgentKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
      return { type: 'urgent', color: '#FF6B6B', icon: 'warning-outline' };
    } else if (academicKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
      return { type: 'academic', color: '#4ECDC4', icon: 'school-outline' };
    } else {
      return { type: 'general', color: '#45B7D1', icon: 'megaphone-outline' };
    }
  };

  const handleCardExpand = (cardId: string) => {
    setExpandedCardId(expandedCardId === cardId ? null : cardId);
  };

  // Transform API announcements data to match UI expectations
  const transformedAnnouncements = useMemo(
    () => announcements.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      description: announcement.content,
      posted: new Date(announcement.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      priority: (announcement as any).priority || 'medium',
      category: (announcement as any).category || 'General',
    })),
    [announcements]
  );

  const reminders = useMemo(
    () => [
      {
        id: 'r1',
        text: 'Always bring your community ID when entering the campus.',
        icon: 'card-outline',
        color: '#FFA726',
      },
      {
        id: 'r2',
        text: 'Grades for the midterm period will be released on Friday at 5 PM.',
        icon: 'school-outline',
        color: '#66BB6A',
      },
      {
        id: 'r3',
        text: 'Check your Southville email for scholarship renewal documents.',
        icon: 'mail-outline',
        color: '#42A5F5',
      },
    ],
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ReusableHeader title="Announcements" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.tint]}
            tintColor={colors.tint}
            progressBackgroundColor={colors.background}
          />
        }>
        
        {/* Creative Header */}
        <View style={[styles.creativeHeader, { 
          backgroundColor: isDark ? 'rgba(102, 126, 234, 0.8)' : '#667eea',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
          borderWidth: isDark ? 1 : 0
        }]}>
          <View style={[styles.headerIllustration, { 
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.2)' 
          }]}>
            <Ionicons name="megaphone-outline" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>Stay Updated</Text>
          <Text style={styles.headerSubtitle}>Never miss important announcements</Text>
        </View>

        {/* Announcements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="newspaper-outline" size={24} color={colors.tint} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest Announcements</Text>
          </View>
          
          {announcementsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.tint} />
              <Text style={[styles.loadingText, { color: colors.icon }]}>Loading announcements...</Text>
            </View>
          ) : announcementsError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
              <Text style={[styles.errorText, { color: '#FF6B6B' }]}>Failed to load announcements</Text>
              <Text style={[styles.errorSubtext, { color: colors.icon }]}>Please check your connection and try again</Text>
            </View>
          ) : transformedAnnouncements.length > 0 ? (
            transformedAnnouncements.map((announcement) => {
            const announcementType = getAnnouncementType(announcement.title);
            const isExpanded = expandedCardId === announcement.id;
            
            return (
              <TouchableOpacity
                key={announcement.id}
                style={[
                  styles.announcementCard,
                  { 
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    borderLeftColor: announcementType.color 
                  }
                ]}
                onPress={() => handleCardExpand(announcement.id)}
                activeOpacity={0.8}>
                
                <View style={styles.announcementCardHeader}>
                  <View style={[styles.announcementIconContainer, { 
                    backgroundColor: isDark ? 'rgba(74, 144, 226, 0.2)' : 'rgba(74, 144, 226, 0.1)' 
                  }]}>
                    <Ionicons 
                      name={announcementType.icon as any} 
                      size={20} 
                      color={announcementType.color} 
                    />
                  </View>
                  <View style={styles.announcementHeaderContent}>
                    <Text style={[styles.announcementTitle, { color: colors.text }]}>{announcement.title}</Text>
                    <View style={styles.announcementMeta}>
                      <View style={[
                        styles.priorityBadge,
                        { backgroundColor: announcementType.color }
                      ]}>
                        <Text style={styles.priorityText}>{announcement.priority}</Text>
                      </View>
                      <Text style={[styles.announcementCategory, { color: colors.icon }]}>{announcement.category}</Text>
                    </View>
                  </View>
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={colors.icon} 
                  />
                </View>

                <View style={styles.announcementContent}>
                  <Text style={[styles.announcementDescription, { color: colors.text }]}>
                    {formatAnnouncementContent(announcement.description)}
                  </Text>
                  <Text style={[styles.announcementPosted, { color: colors.icon }]}>{announcement.posted}</Text>
                </View>

                {isExpanded && (
                  <View style={[styles.expandedContent, { 
                    borderTopColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#E0E0E0' 
                  }]}>
                    <View style={styles.expandedRow}>
                      <Ionicons name="time-outline" size={16} color={colors.icon} />
                      <Text style={[styles.expandedText, { color: colors.icon }]}>{announcement.posted}</Text>
                    </View>
                    <View style={styles.expandedRow}>
                      <Ionicons name="folder-outline" size={16} color={colors.icon} />
                      <Text style={[styles.expandedText, { color: colors.icon }]}>{announcement.category}</Text>
                    </View>
                    <View style={styles.expandedRow}>
                      <Ionicons name="flag-outline" size={16} color={colors.icon} />
                      <Text style={[styles.expandedText, { color: colors.icon }]}>Priority: {announcement.priority}</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="megaphone-outline" size={60} color={colors.icon} />
              <Text style={[styles.emptyTitle, { color: colors.icon }]}>No Announcements</Text>
              <Text style={[styles.emptyText, { color: colors.icon }]}>Check back later for updates</Text>
            </View>
          )}
        </View>

        {/* Reminders Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alarm-outline" size={24} color={colors.tint} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Important Reminders</Text>
          </View>
          
          {reminders.map((reminder) => (
            <View key={reminder.id} style={[styles.reminderCard, { 
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
              borderWidth: 1
            }]}>
              <View style={[styles.reminderIconContainer, { backgroundColor: reminder.color }]}>
                <Ionicons name={reminder.icon as any} size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.reminderText, { color: colors.text }]}>{reminder.text}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
      
      {/* Loading Overlay */}
      <LoadingOverlay visible={announcementsLoading} variant="heart" />
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 24,
  },
  
  // Creative Header
  creativeHeader: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  headerIllustration: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Section Styles
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  // Announcement Cards
  announcementCard: {
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  announcementCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  announcementIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  announcementHeaderContent: {
    flex: 1,
    gap: 6,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  announcementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  announcementCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  announcementContent: {
    gap: 8,
  },
  announcementDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  announcementPosted: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  
  // Expanded Content
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  expandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandedText: {
    fontSize: 13,
  },
  
  // Reminder Cards
  reminderCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  reminderIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  
  // Loading and Error States
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
