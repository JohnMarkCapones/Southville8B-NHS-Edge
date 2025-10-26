import { useState, useMemo, useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, ActivityIndicator, Text, Image, Dimensions, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ReusableHeader } from '@/components/ui/reusable-header';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useAuthErrorHandler } from '@/hooks/use-auth-error-handler';
import { useMyGwa } from '@/hooks/use-my-gwa';
import { GradingPeriod, HonorStatus } from '@/lib/types/gwa';

const { width: screenWidth } = Dimensions.get('window');

export default function GradesScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  
  // Filter states
  const [selectedQuarter, setSelectedQuarter] = useState<GradingPeriod | 'All'>('All');
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(1);

  // Build filter params
  const filterParams = useMemo(() => {
    const params: any = {};
    if (selectedQuarter !== 'All') {
      params.grading_period = selectedQuarter;
    }
    if (selectedSchoolYear) {
      params.school_year = selectedSchoolYear;
    }
    console.log('[GradesScreen] Filter params updated:', params);
    return params;
  }, [selectedQuarter, selectedSchoolYear]);

  // Fetch GWA records
  const { gwaRecords, loading, error, refetch } = useMyGwa(filterParams);

  // Auth error handling
  const { handleAuthError } = useAuthErrorHandler();

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch(filterParams);
    } catch (error) {
      console.error('Error refreshing grades:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, filterParams]);

  // Auto-redirect to login on authentication errors
  useEffect(() => {
    console.log('[GRADES][AUTO-REDIRECT] Checking for auth errors', {
      hasError: !!error
    });
    
    // Check for authentication error using centralized handler
    if (error) {
      const wasRedirected = handleAuthError(error);
      if (wasRedirected) {
        console.log('[GRADES][AUTO-REDIRECT] Auth error handled - redirecting to login');
      }
    }
  }, [error, handleAuthError]);

  // Get unique school years for dropdown
  const schoolYears = useMemo(() => {
    const years = [...new Set(gwaRecords.map(record => record.school_year))];
    return years.sort().reverse(); // Most recent first
  }, [gwaRecords]);

  // Handle filter changes
  const handleQuarterChange = useCallback((quarter: GradingPeriod | 'All') => {
    console.log('[GradesScreen] Quarter changed to:', quarter);
    setSelectedQuarter(quarter);
  }, []);

  const handleSchoolYearChange = useCallback((year: string) => {
    console.log('[GradesScreen] School year changed to:', year);
    setSelectedSchoolYear(year);
  }, []);

  // Get honor status color
  const getHonorStatusColor = (honorStatus: HonorStatus) => {
    switch (honorStatus) {
      case HonorStatus.WITH_HIGHEST_HONORS:
        return '#FFD700'; // Gold
      case HonorStatus.WITH_HIGH_HONORS:
        return '#C0C0C0'; // Silver
      case HonorStatus.WITH_HONORS:
        return '#CD7F32'; // Bronze
      default:
        return colors.text;
    }
  };

  // Get GWA color based on score
  const getGwaColor = (gwa: number) => {
    if (gwa >= 95) return '#4CAF50'; // Green
    if (gwa >= 90) return '#8BC34A'; // Light Green
    if (gwa >= 85) return '#FFC107'; // Amber
    if (gwa >= 80) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  // Get creative gradient colors for cards
  const getCardGradient = (gwa: number) => {
    if (gwa >= 95) return ['#4CAF50', '#66BB6A']; // Green gradient
    if (gwa >= 90) return ['#8BC34A', '#AED581']; // Light green gradient
    if (gwa >= 85) return ['#FFC107', '#FFD54F']; // Amber gradient
    if (gwa >= 80) return ['#FF9800', '#FFB74D']; // Orange gradient
    return ['#F44336', '#EF5350']; // Red gradient
  };

  // Get emoji based on GWA score
  const getGwaEmoji = (gwa: number) => {
    if (gwa >= 95) return '🏆';
    if (gwa >= 90) return '🥇';
    if (gwa >= 85) return '🥈';
    if (gwa >= 80) return '🥉';
    return '📚';
  };

  // Get motivational message
  const getMotivationalMessage = (gwa: number) => {
    if (gwa >= 95) return "Outstanding! You're a star student! ⭐";
    if (gwa >= 90) return "Excellent work! Keep up the great performance! 🌟";
    if (gwa >= 85) return "Great job! You're doing really well! 💪";
    if (gwa >= 80) return "Good progress! Keep pushing forward! 🚀";
    return "Keep studying! You can do better! 💪";
  };

  // Handle card expansion
  const handleCardExpand = useCallback((cardId: string) => {
    setExpandedCardId(expandedCardId === cardId ? null : cardId);
  }, [expandedCardId]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ReusableHeader title="Grades" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.tint]}
            tintColor={colors.tint}
            progressBackgroundColor={colors.background}
          />
        }>
      
      {/* Creative Header Section */}
      <View style={[styles.creativeHeader, { 
        backgroundColor: isDark ? 'rgba(25, 118, 210, 0.1)' : 'rgba(227, 242, 253, 0.8)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
        borderWidth: isDark ? 1 : 0
      }]}>
        <View style={styles.headerIllustration}>
          <Ionicons name="school-outline" size={40} color={colors.tint} />
          <View style={styles.floatingStars}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.star}>🌟</Text>
            <Text style={styles.star}>✨</Text>
          </View>
        </View>
        <Text style={[styles.headerTitle, { color: colors.tint }]}>Your Academic Journey</Text>
        <Text style={[styles.headerSubtitle, { color: colors.icon }]}>
          Track your progress and celebrate your achievements! 🎓
        </Text>
      </View>

      {/* Creative Filter Section */}
      <View style={[styles.filterCard, { 
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1
      }]}>
        <View style={styles.filterHeader}>
          <Ionicons name="filter-outline" size={20} color={colors.tint} />
          <Text style={[styles.filterTitle, { color: colors.tint }]}>Filter Your Grades</Text>
        </View>
        
        {/* Quarter Filter */}
        <View style={styles.filterGroup}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>📅 Quarter:</Text>
          <View style={styles.chipContainer}>
            {(['All', GradingPeriod.Q1, GradingPeriod.Q2, GradingPeriod.Q3, GradingPeriod.Q4] as const).map((quarter) => (
              <TouchableOpacity
                key={quarter}
                style={[
                  styles.chip,
                  { 
                    backgroundColor: selectedQuarter === quarter ? (isDark ? '#404040' : colors.tint) : (isDark ? 'rgba(255, 255, 255, 0.1)' : '#F5F5F5'),
                    borderColor: selectedQuarter === quarter ? (isDark ? '#404040' : colors.tint) : (isDark ? 'rgba(255, 255, 255, 0.2)' : '#E0E0E0')
                  }
                ]}
                onPress={() => handleQuarterChange(quarter)}>
                <Text 
                  style={[
                    styles.chipText,
                    { color: selectedQuarter === quarter ? '#FFFFFF' : colors.text }
                  ]}>
                  {quarter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* School Year Filter */}
        <View style={styles.filterGroup}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>🎓 School Year:</Text>
          <View style={styles.chipContainer}>
            <TouchableOpacity
              style={[
                styles.chip,
                { 
                  backgroundColor: selectedSchoolYear === '' ? (isDark ? '#404040' : colors.tint) : (isDark ? 'rgba(255, 255, 255, 0.1)' : '#F5F5F5'),
                  borderColor: selectedSchoolYear === '' ? (isDark ? '#404040' : colors.tint) : (isDark ? 'rgba(255, 255, 255, 0.2)' : '#E0E0E0')
                }
              ]}
              onPress={() => handleSchoolYearChange('')}>
              <Text 
                style={[
                  styles.chipText,
                  { color: selectedSchoolYear === '' ? '#FFFFFF' : colors.text }
                ]}>
                All Years
              </Text>
            </TouchableOpacity>
            {schoolYears.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.chip,
                  { 
                    backgroundColor: selectedSchoolYear === year ? (isDark ? '#404040' : colors.tint) : (isDark ? 'rgba(255, 255, 255, 0.1)' : '#F5F5F5'),
                    borderColor: selectedSchoolYear === year ? (isDark ? '#404040' : colors.tint) : (isDark ? 'rgba(255, 255, 255, 0.2)' : '#E0E0E0')
                  }
                ]}
                onPress={() => handleSchoolYearChange(year)}>
                <Text 
                  style={[
                    styles.chipText,
                    { color: selectedSchoolYear === year ? '#FFFFFF' : colors.text }
                  ]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Content Section */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.icon }]}>
            Loading your amazing grades... ✨
          </Text>
        </View>
      ) : error ? (
        <View style={[styles.errorCard, { 
          backgroundColor: isDark ? 'rgba(255, 107, 107, 0.1)' : '#FFEBEE',
          borderColor: isDark ? 'rgba(255, 107, 107, 0.3)' : '#FFCDD2'
        }]}>
          <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
          <Text style={[styles.errorText, { color: '#F44336' }]}>
            Oops! Something went wrong 😅
          </Text>
          <Text style={[styles.errorSubtext, { color: colors.icon }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.tint }]}
            onPress={() => refetch()}>
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : gwaRecords.length > 0 ? (
        gwaRecords.map((record, index) => {
          const isExpanded = expandedCardId === record.id;
          const cardGradient = getCardGradient(record.gwa);
          const emoji = getGwaEmoji(record.gwa);
          const message = getMotivationalMessage(record.gwa);
          
          return (
            <Animated.View 
              key={record.id} 
              style={[
                styles.gwaCard,
                { 
                  backgroundColor: cardGradient[0],
                  opacity: isDark ? 0.6 : 0.7,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)',
                  borderWidth: 1,
                  height: isExpanded ? 280 : 200,
                }
              ]}>
              
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.quarterBadge}>
                  <Text style={styles.quarterText}>{record.grading_period}</Text>
                </View>
                <View style={styles.emojiContainer}>
                  <Text style={styles.emoji}>{emoji}</Text>
                </View>
              </View>
              
              {/* GWA Score Section */}
              <View style={styles.gwaScoreSection}>
                <View style={styles.scoreContainer}>
                  <Text style={styles.gwaNumber}>{record.gwa.toFixed(2)}</Text>
                  <Text style={styles.gwaLabel}>GWA</Text>
                </View>
                <View style={styles.schoolYearContainer}>
                  <Text style={styles.schoolYear}>{record.school_year}</Text>
                </View>
              </View>
              
              {/* Honor Status */}
              <View style={styles.honorStatusContainer}>
                <Text style={styles.honorText}>{record.honor_status}</Text>
              </View>
              
              {/* Motivational Message */}
              <Text style={styles.motivationalMessage}>{message}</Text>
              
              {/* Expand Button */}
              <TouchableOpacity
                style={[styles.expandButton, { 
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.5)'
                }]}
                onPress={() => handleCardExpand(record.id)}>
                <Text style={styles.expandButtonText}>
                  {isExpanded ? 'Show Less ↑' : 'View Details ↓'}
                </Text>
              </TouchableOpacity>
              
              {/* Expanded Content */}
              {isExpanded && (
                <Animated.View style={[styles.expandedContent, { 
                  borderTopColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.3)' 
                }]}>
                  <View style={styles.detailsRow}>
                    <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.detailText}>School Year: {record.school_year}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Ionicons name="trophy-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.detailText}>Status: {record.honor_status}</Text>
                  </View>
                  {record.remarks && (
                    <View style={styles.detailsRow}>
                      <Ionicons name="chatbubble-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.detailText}>Remarks: {record.remarks}</Text>
                    </View>
                  )}
                </Animated.View>
              )}
            </Animated.View>
          );
        })
      ) : (
        <View style={[styles.emptyCard, { 
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#E9ECEF'
        }]}>
          <Ionicons name="book-outline" size={64} color={colors.icon} />
          <Text style={[styles.emptyTitle, { color: colors.icon }]}>No Grades Yet 📚</Text>
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            No GWA records found for the selected filters.
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.icon }]}>
            Keep studying and your grades will appear here! 🌟
          </Text>
        </View>
      )}
      </ScrollView>
      
      {/* Loading Overlay */}
      <LoadingOverlay visible={loading} variant="heart" />
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
    gap: 20,
  },
  
  // Creative Header
  creativeHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 20,
    marginBottom: 10,
    position: 'relative',
  },
  headerIllustration: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  floatingStars: {
    position: 'absolute',
    top: -20,
    right: -25,
    flexDirection: 'row',
    gap: 6,
  },
  star: {
    fontSize: 16,
    opacity: 0.8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  
  // Filter Card
  filterCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 10,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Loading State
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Error State
  errorCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
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
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // GWA Cards
  gwaCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quarterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  quarterText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emojiContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  emoji: {
    fontSize: 24,
  },
  
  // GWA Score Section
  gwaScoreSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  gwaNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  gwaLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    opacity: 0.9,
  },
  schoolYearContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  schoolYear: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Honor Status
  honorStatusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  honorText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  
  // Motivational Message
  motivationalMessage: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
  },
  
  // Expand Button
  expandButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  expandButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Expanded Content
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.9,
  },
  
  // Empty State
  emptyCard: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});