import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

import { ReusableHeader } from '@/components/ui/reusable-header';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { useAuthErrorHandler } from '@/hooks/use-auth-error-handler';
import { useAnnouncements } from '@/hooks/use-announcements';
import { formatAnnouncementContent } from '@/utils/html-utils';
import { useNetworkRefetch } from '@/hooks/use-network-refetch';
import { useCurrentUser } from '@/hooks/use-current-user';

// Separate component for announcement card to properly use hooks
function AnnouncementCard({
  announcement,
  announcementType,
  isExpanded,
  isHighlighted,
  highlightOpacity,
  colors,
  isDark,
  onExpand,
}: {
  announcement: {
    id: string;
    title: string;
    description: string;
    posted: string;
    priority: string;
    category: string;
  };
  announcementType: { type: string; color: string; icon: string };
  isExpanded: boolean;
  isHighlighted: boolean;
  highlightOpacity: Animated.SharedValue<number>;
  colors: any;
  isDark: boolean;
  onExpand: (id: string) => void;
}) {
  // Animated style for highlight border overlay - now properly called as a hook
  const highlightOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: isHighlighted ? highlightOpacity.value : 0,
      borderWidth: isHighlighted ? 3 : 0,
    };
  });

  return (
    <Animated.View style={{ position: 'relative' }}>
      <TouchableOpacity
        style={[
          styles.announcementCard,
          { 
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
            borderLeftColor: announcementType.color,
          },
        ]}
        onPress={() => onExpand(announcement.id)}
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
      {/* Highlight border overlay */}
      {isHighlighted && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: 16,
              borderWidth: 3,
              borderColor: colors.tint,
              pointerEvents: 'none',
            },
            highlightOverlayStyle,
          ]}
        />
      )}
    </Animated.View>
  );
}

export default function AnnouncementsScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { query: searchQuery } = useLocalSearchParams<{ query?: string }>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [highlightedAnnouncementId, setHighlightedAnnouncementId] = useState<string | null>(null);
  const highlightOpacity = useSharedValue(1);
  const previousSearchQueryRef = useRef<string>('');

  // Fetch current user data to get section information
  const { user, loading: userLoading } = useCurrentUser();
  // Try multiple paths for section ID (API returns section_id directly or sections object)
  const currentUserSectionId = user?.student?.section_id || 
                               user?.student?.sections?.id || 
                               user?.student?.section?.id || 
                               null;

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

  // Auto-refetch data when network connectivity is restored
  useNetworkRefetch([refetchAnnouncements]);

  // Function to handle search highlight and scroll
  const handleSearchHighlight = useCallback(() => {
    const currentQuery = typeof searchQuery === 'string' ? searchQuery.trim() : '';
    
    // Reset highlight when query is cleared
    if (!currentQuery) {
      setHighlightedAnnouncementId(null);
      highlightOpacity.value = 1;
      previousSearchQueryRef.current = '';
      return;
    }

    if (!matchingAnnouncementId || announcementsLoading) {
      return;
    }

    // Always process - allow re-trigger every time (especially when navigating back)
    // Update ref after processing to prevent duplicate triggers in same render cycle
    const shouldProcess = currentQuery !== previousSearchQueryRef.current || !highlightedAnnouncementId;
    
    if (!shouldProcess) {
      return;
    }

    // Update ref to track current query
    previousSearchQueryRef.current = currentQuery;

    // Reset any existing highlight first
    setHighlightedAnnouncementId(null);
    highlightOpacity.value = 1;

    // Small delay to ensure state is reset, then set highlight
    const initTimer = setTimeout(() => {
      // Set highlighted announcement
      setHighlightedAnnouncementId(matchingAnnouncementId);
      highlightOpacity.value = 1;
      
      // Reset and start fade timer after 4 seconds (between 3-5 seconds as requested)
      const fadeTimer = setTimeout(() => {
        highlightOpacity.value = withTiming(0, {
          duration: 1500, // 1.5 seconds fade
          easing: Easing.out(Easing.ease),
        });
        
        // Clear highlight after animation completes
        setTimeout(() => {
          setHighlightedAnnouncementId(null);
        }, 1600);
      }, 4000);

      // Scroll to matching announcement
      // Calculate approximate scroll position
      // Estimate: header section (~200px) + creative header (~150px) + section header (~60px) + previous announcements
      const estimatedCardHeight = 200; // Approximate height per announcement card including margin
      const headerOffset = 350; // Creative header + section header
      const announcementIndex = allAnnouncementsForSearch.findIndex(a => a.id === matchingAnnouncementId);
      const scrollY = headerOffset + (announcementIndex * estimatedCardHeight);
      
      // Small delay to ensure announcements are rendered
      const scrollTimer = setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, scrollY - 50), // Offset by 50px to show announcement better
          animated: true,
        });
      }, 300);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(scrollTimer);
      };
    }, 100);

    return () => {
      clearTimeout(initTimer);
    };
  }, [searchQuery, matchingAnnouncementId, allAnnouncementsForSearch, announcementsLoading, highlightOpacity, highlightedAnnouncementId]);

  // Reset search query ref when screen is focused (so it re-triggers every time)
  useFocusEffect(
    useCallback(() => {
      // Always reset ref when screen comes into focus to force re-trigger
      previousSearchQueryRef.current = '';
      
      // Handle search highlight when screen is focused
      handleSearchHighlight();
      
      return () => {
        // Reset ref when screen loses focus to allow re-trigger on next focus
        previousSearchQueryRef.current = '';
      };
    }, [handleSearchHighlight])
  );

  // Also handle when search query changes (for same-screen updates)
  useEffect(() => {
    // Reset ref when query changes to force re-trigger
    previousSearchQueryRef.current = '';
    handleSearchHighlight();
  }, [searchQuery, matchingAnnouncementId, handleSearchHighlight]);

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
    () => {
      const transformed = announcements.map(announcement => {
        const date = new Date(announcement.createdAt);
        // Format date and time properly using toLocaleString
        const formattedDate = date.toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        return {
          id: announcement.id,
          title: announcement.title,
          description: announcement.content,
          posted: formattedDate,
          priority: (announcement as any).priority || 'medium',
          category: (announcement as any).category || 'General',
          sections: announcement.sections || [], // Array of section objects from API
        };
      });

      // Debug logging (only if user data is loaded)
      if (!userLoading && user) {
        console.log('[ANNOUNCEMENTS] User Section ID:', currentUserSectionId);
        console.log('[ANNOUNCEMENTS] User student data:', {
          section_id: user?.student?.section_id,
          sections_id: user?.student?.sections?.id,
          section_id_from_obj: user?.student?.section?.id,
        });
      }
      console.log('[ANNOUNCEMENTS] Total announcements:', transformed.length);
      transformed.forEach((ann, idx) => {
        console.log(`[ANNOUNCEMENTS] Announcement ${idx + 1} (${ann.title}):`, {
          id: ann.id,
          sections: ann.sections,
          sectionsCount: ann.sections?.length || 0,
        });
      });

      return transformed;
    },
    [announcements, currentUserSectionId, user, userLoading]
  );

  // Separate announcements into general and section-specific
  // Only run separation after user data is loaded
  const { generalAnnouncements, sectionAnnouncements } = useMemo(() => {
    const general: typeof transformedAnnouncements = [];
    const section: typeof transformedAnnouncements = [];

    // If user is still loading, return empty arrays to avoid false negatives
    if (userLoading) {
      console.log('[ANNOUNCEMENTS] User data still loading, skipping separation');
      return { generalAnnouncements: [], sectionAnnouncements: [] };
    }

    transformedAnnouncements.forEach((announcement) => {
      // Check if announcement has sections assigned
      const hasSections = announcement.sections && 
                         Array.isArray(announcement.sections) && 
                         announcement.sections.length > 0;
      
      if (hasSections) {
        // Check if this announcement targets the user's section
        const targetsUserSection = announcement.sections.some((s: any) => {
          // Handle both section ID and section object
          const sectionId = typeof s === 'string' ? s : s?.id;
          return sectionId === currentUserSectionId;
        });

        if (targetsUserSection && currentUserSectionId) {
          section.push(announcement);
          console.log(`[ANNOUNCEMENTS] Added to section: ${announcement.title}`);
        } else {
          // Announcement has sections but not for current user - don't show in general
          console.log(`[ANNOUNCEMENTS] Skipped (has sections but not for user): ${announcement.title}`, {
            announcementSectionIds: announcement.sections.map((s: any) => typeof s === 'string' ? s : s?.id),
            userSectionId: currentUserSectionId,
          });
        }
      } else {
        // No sections assigned = general announcement
        general.push(announcement);
        console.log(`[ANNOUNCEMENTS] Added to general: ${announcement.title}`);
      }
    });

    console.log('[ANNOUNCEMENTS] Separation results:', {
      generalCount: general.length,
      sectionCount: section.length,
      userSectionId: currentUserSectionId,
      userLoaded: !userLoading,
    });

    return { generalAnnouncements: general, sectionAnnouncements: section };
  }, [transformedAnnouncements, currentUserSectionId, userLoading]);

  // Combine all announcements for search (both general and section-specific)
  const allAnnouncementsForSearch = useMemo(() => {
    return [...generalAnnouncements, ...sectionAnnouncements];
  }, [generalAnnouncements, sectionAnnouncements]);

  // Find matching announcement based on search query (for highlighting, but don't filter)
  const matchingAnnouncementId = useMemo(() => {
    if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.trim() === '') {
      return null;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const match = allAnnouncementsForSearch.find(announcement => {
      const titleMatch = announcement.title.toLowerCase().includes(query);
      const contentMatch = announcement.description.toLowerCase().includes(query);
      return titleMatch || contentMatch;
    });
    
    return match?.id || null;
  }, [allAnnouncementsForSearch, searchQuery]);

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
        ref={scrollViewRef}
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

        {/* Section-Specific Announcements */}
        {sectionAnnouncements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people-outline" size={24} color={colors.tint} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                My Section Announcements ({user?.student?.section?.name || 'Section'})
              </Text>
            </View>
            
            {sectionAnnouncements.map((announcement) => {
              const announcementType = getAnnouncementType(announcement.title);
              const isExpanded = expandedCardId === announcement.id;
              const isHighlighted = highlightedAnnouncementId === announcement.id;
              
              return (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  announcementType={announcementType}
                  isExpanded={isExpanded}
                  isHighlighted={isHighlighted}
                  highlightOpacity={highlightOpacity}
                  colors={colors}
                  isDark={isDark}
                  onExpand={handleCardExpand}
                />
              );
            })}
          </View>
        )}

        {/* General Announcements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="newspaper-outline" size={24} color={colors.tint} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>General Announcements</Text>
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
          ) : generalAnnouncements.length > 0 ? (
            generalAnnouncements.map((announcement) => {
            const announcementType = getAnnouncementType(announcement.title);
            const isExpanded = expandedCardId === announcement.id;
            const isHighlighted = highlightedAnnouncementId === announcement.id;
            
            return (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                announcementType={announcementType}
                isExpanded={isExpanded}
                isHighlighted={isHighlighted}
                highlightOpacity={highlightOpacity}
                colors={colors}
                isDark={isDark}
                onExpand={handleCardExpand}
              />
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
  emptySubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
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
