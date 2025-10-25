import { useState, useMemo, useCallback } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, ActivityIndicator, Text, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMyGwa } from '@/hooks/use-my-gwa';
import { GradingPeriod, HonorStatus } from '@/lib/types/gwa';

const { width: screenWidth } = Dimensions.get('window');

export default function GradesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  // Filter states
  const [selectedQuarter, setSelectedQuarter] = useState<GradingPeriod | 'All'>('All');
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  
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
        contentContainerStyle={styles.content}>
      
      {/* Creative Header Section */}
      <View style={styles.creativeHeader}>
        <View style={styles.headerIllustration}>
          <Ionicons name="school-outline" size={40} color="#1976D2" />
          <View style={styles.floatingStars}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.star}>🌟</Text>
            <Text style={styles.star}>✨</Text>
          </View>
        </View>
        <Text style={styles.headerTitle}>Your Academic Journey</Text>
        <Text style={styles.headerSubtitle}>
          Track your progress and celebrate your achievements! 🎓
        </Text>
      </View>

      {/* Creative Filter Section */}
      <View style={styles.filterCard}>
        <View style={styles.filterHeader}>
          <Ionicons name="filter-outline" size={20} color="#1976D2" />
          <Text style={styles.filterTitle}>Filter Your Grades</Text>
        </View>
        
        {/* Quarter Filter */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>📅 Quarter:</Text>
          <View style={styles.chipContainer}>
            {(['All', GradingPeriod.Q1, GradingPeriod.Q2, GradingPeriod.Q3, GradingPeriod.Q4] as const).map((quarter) => (
              <TouchableOpacity
                key={quarter}
                style={[
                  styles.chip,
                  { 
                    backgroundColor: selectedQuarter === quarter ? '#1976D2' : '#F5F5F5',
                    borderColor: selectedQuarter === quarter ? '#1976D2' : '#E0E0E0'
                  }
                ]}
                onPress={() => handleQuarterChange(quarter)}>
                <Text 
                  style={[
                    styles.chipText,
                    { color: selectedQuarter === quarter ? '#FFFFFF' : '#333333' }
                  ]}>
                  {quarter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* School Year Filter */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>🎓 School Year:</Text>
          <View style={styles.chipContainer}>
            <TouchableOpacity
              style={[
                styles.chip,
                { 
                  backgroundColor: selectedSchoolYear === '' ? '#1976D2' : '#F5F5F5',
                  borderColor: selectedSchoolYear === '' ? '#1976D2' : '#E0E0E0'
                }
              ]}
              onPress={() => handleSchoolYearChange('')}>
              <Text 
                style={[
                  styles.chipText,
                  { color: selectedSchoolYear === '' ? '#FFFFFF' : '#333333' }
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
                    backgroundColor: selectedSchoolYear === year ? '#1976D2' : '#F5F5F5',
                    borderColor: selectedSchoolYear === year ? '#1976D2' : '#E0E0E0'
                  }
                ]}
                onPress={() => handleSchoolYearChange(year)}>
                <Text 
                  style={[
                    styles.chipText,
                    { color: selectedSchoolYear === year ? '#FFFFFF' : '#333333' }
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
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>
            Loading your amazing grades... ✨
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>
            Oops! Something went wrong 😅
          </Text>
          <Text style={styles.errorSubtext}>
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
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
                style={styles.expandButton}
                onPress={() => handleCardExpand(record.id)}>
                <Text style={styles.expandButtonText}>
                  {isExpanded ? 'Show Less ↑' : 'View Details ↓'}
                </Text>
              </TouchableOpacity>
              
              {/* Expanded Content */}
              {isExpanded && (
                <Animated.View style={styles.expandedContent}>
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
        <View style={styles.emptyCard}>
          <Ionicons name="book-outline" size={64} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>No Grades Yet 📚</Text>
          <Text style={styles.emptyText}>
            No GWA records found for the selected filters.
          </Text>
          <Text style={styles.emptySubtext}>
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
    backgroundColor: 'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)',
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
    color: '#1976D2',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  
  // Filter Card
  filterCard: {
    backgroundColor: '#FFFFFF',
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
    color: '#1976D2',
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
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
    color: '#666666',
    textAlign: 'center',
  },
  
  // Error State
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: '#FFCDD2',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
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
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
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
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6C757D',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ADB5BD',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});