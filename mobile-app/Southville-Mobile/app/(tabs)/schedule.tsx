import { useState, useMemo, useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, TouchableOpacity, Text, Image, Dimensions, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ReusableHeader } from '@/components/ui/reusable-header';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { useAuthErrorHandler } from '@/hooks/use-auth-error-handler';
import { useWeeklySchedule, formatTime } from '@/hooks/use-weekly-schedule';
import { Schedule, DayOfWeek } from '@/lib/types/schedule';
import { getSubjectAsset } from '@/lib/subject-images';
import { useNetworkRefetch } from '@/hooks/use-network-refetch';

const { width: screenWidth } = Dimensions.get('window');

interface CalendarDay {
  dayName: string;
  date: number;
  fullDate: Date;
  isToday: boolean;
  isSelected: boolean;
}

export default function ScheduleScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { query: initialQuery } = useLocalSearchParams<{ query?: string }>();
  const [searchFilter, setSearchFilter] = useState<string>((initialQuery || '').toString());

  // State management
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const translateY = useSharedValue(0);

  // Fetch weekly schedule data
  const { weeklySchedule, loading, error, hasStudentProfile, refetch: refetchSchedule } = useWeeklySchedule();

  // Auth error handling
  const { handleAuthError } = useAuthErrorHandler();

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchSchedule();
    } catch (error) {
      console.error('Error refreshing schedule:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchSchedule]);

  // Auto-redirect to login on authentication errors
  useEffect(() => {
    console.log('[SCHEDULE][AUTO-REDIRECT] Checking for auth errors', {
      hasError: !!error
    });
    
    // Check for authentication error using centralized handler
    if (error) {
      const wasRedirected = handleAuthError(error);
      if (wasRedirected) {
        console.log('[SCHEDULE][AUTO-REDIRECT] Auth error handled - redirecting to login');
      }
    }
  }, [error, handleAuthError]);

  // Auto-refetch data when network connectivity is restored
  useNetworkRefetch([refetchSchedule]);

  // Generate calendar week data
  const calendarWeek = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    
    // Fix: Ensure today is always included in the week view
    // If today is Sunday (0), go back 6 days to get Monday of current week
    // Otherwise, use standard calculation: go back (currentDay - 1) days
    if (currentDay === 0) {
      // Today is Sunday - go back 6 days to get Monday of current week
      monday.setDate(today.getDate() - 6);
    } else {
      // Existing logic for Mon-Sat
      monday.setDate(today.getDate() - currentDay + 1);
    }
    
    const week: CalendarDay[] = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      
      week.push({
        dayName: dayNames[i],
        date: day.getDate(),
        fullDate: day,
        isToday: day.toDateString() === today.toDateString(),
        isSelected: day.toDateString() === selectedDate.toDateString(),
      });
    }
    
    return week;
  }, [selectedDate]);

  // Get current month and year
  const currentMonthYear = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  }, [selectedDate]);

  // Flatten and filter schedules for selected date
  const filteredSchedulesBase = useMemo(() => {
    const allSchedules: Schedule[] = [];
    
    // Flatten all schedules from weeklySchedule
    weeklySchedule.forEach(daySchedule => {
      allSchedules.push(...daySchedule.schedules);
    });
    
    // Filter by selected date's day of week
    const selectedDayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek;
    
    return allSchedules
      .filter(schedule => schedule.dayOfWeek === selectedDayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [weeklySchedule, selectedDate]);

  // Apply optional search filter from query param (subject, teacher, room, day)
  const filteredSchedules = useMemo(() => {
    const term = (searchFilter || '').trim().toLowerCase();
    if (!term) return filteredSchedulesBase;

    return filteredSchedulesBase.filter((s) => {
      const subject = s.subject?.subject_name?.toLowerCase() || '';
      const teacherFirst = s.teacher?.first_name?.toLowerCase() || '';
      const teacherLast = s.teacher?.last_name?.toLowerCase() || '';
      const teacherFull = `${teacherFirst} ${teacherLast}`.trim();
      const room = s.room?.room_number?.toLowerCase() || '';
      const day = s.dayOfWeek?.toLowerCase() || '';
      return (
        subject.includes(term) ||
        teacherFirst.includes(term) ||
        teacherLast.includes(term) ||
        teacherFull.includes(term) ||
        room.includes(term) ||
        day.includes(term)
      );
    });
  }, [filteredSchedulesBase, searchFilter]);

  // Get subject image using centralized mapper
  const getSubjectImage = useCallback((subjectName: string) => {
    return getSubjectAsset(subjectName);
  }, []);

  // Subject-specific colors
  const getSubjectColor = useCallback((subjectName: string) => {
    const subject = subjectName.toLowerCase();
    
    if (subject.includes('english') || subject.includes('literature')) {
      return ['#FF6B9D', '#FF8E9B']; // Pink gradient for English
    } else if (subject.includes('math') || subject.includes('mathematics')) {
      return ['#4CAF50', '#66BB6A']; // Green gradient for Math
    } else if (subject.includes('science') || subject.includes('biology') || subject.includes('chemistry') || subject.includes('physics')) {
      return ['#2196F3', '#42A5F5']; // Blue gradient for Science
    } else if (subject.includes('filipino') || subject.includes('tagalog')) {
      return ['#FF9800', '#FFB74D']; // Orange gradient for Filipino
    } else if (subject.includes('esp') || subject.includes('values') || subject.includes('religion')) {
      return ['#9C27B0', '#BA68C8']; // Purple gradient for ESP
    } else if (subject.includes('history') || subject.includes('social studies')) {
      return ['#795548', '#A1887F']; // Brown gradient for History
    } else if (subject.includes('pe') || subject.includes('physical education') || subject.includes('sports')) {
      return ['#F44336', '#EF5350']; // Red gradient for PE
    } else if (subject.includes('art') || subject.includes('music') || subject.includes('drawing')) {
      return ['#E91E63', '#F06292']; // Pink gradient for Arts
    } else {
      return ['#607D8B', '#78909C']; // Default gray gradient for other subjects
    }
  }, []);

  // Get subject-specific academic icon
  const getSubjectIcon = useCallback((subjectName: string): string => {
    const subject = subjectName.toLowerCase();
    
    if (subject.includes('math') || subject.includes('mathematics')) {
      return 'calculator-outline';
    } else if (subject.includes('science') || subject.includes('biology') || subject.includes('chemistry') || subject.includes('physics')) {
      return 'flask-outline';
    } else if (subject.includes('english') || subject.includes('literature')) {
      return 'book-outline';
    } else if (subject.includes('filipino') || subject.includes('tagalog')) {
      return 'language-outline';
    } else if (subject.includes('pe') || subject.includes('physical education') || subject.includes('sports')) {
      return 'fitness-outline';
    } else if (subject.includes('art') || subject.includes('music') || subject.includes('drawing')) {
      return 'color-palette-outline';
    } else if (subject.includes('history') || subject.includes('social studies')) {
      return 'globe-outline';
    } else if (subject.includes('esp') || subject.includes('values') || subject.includes('religion')) {
      return 'heart-outline';
    } else {
      return 'school-outline';
    }
  }, []);

  // Handle calendar day selection
  const handleDaySelect = useCallback((day: CalendarDay) => {
    setSelectedDate(day.fullDate);
    setCurrentCardIndex(0);
    setExpandedCardId(null);
  }, []);

  // Handle card expansion
  const handleCardExpand = useCallback((cardId: string) => {
    setExpandedCardId(expandedCardId === cardId ? null : cardId);
  }, [expandedCardId]);

  // Auto-expand first match when a search filter is present
  useEffect(() => {
    const term = (searchFilter || '').trim();
    if (term && filteredSchedules.length > 0) {
      setExpandedCardId(filteredSchedules[0].id);
    }
  }, [searchFilter, filteredSchedules]);

  // Pan gesture handler
  const onGestureEvent = useCallback((event: any) => {
    'worklet';
    translateY.value = event.nativeEvent.translationY;
  }, [translateY]);

  const onGestureEnd = useCallback((event: any) => {
    'worklet';
    const { translationY, velocityY } = event.nativeEvent;
    
    if (Math.abs(translationY) > 50 || Math.abs(velocityY) > 500) {
      if (translationY < 0 && currentCardIndex < filteredSchedules.length - 1) {
        // Swipe up - next card jumps to front
        runOnJS(setCurrentCardIndex)(currentCardIndex + 1);
        // Add a bounce effect
        translateY.value = withSequence(
          withTiming(-20, { duration: 100 }),
          withSpring(0, { damping: 8, stiffness: 100 })
        );
      } else if (translationY > 0 && currentCardIndex > 0) {
        // Swipe down - previous card jumps to front
        runOnJS(setCurrentCardIndex)(currentCardIndex - 1);
        // Add a bounce effect
        translateY.value = withSequence(
          withTiming(20, { duration: 100 }),
          withSpring(0, { damping: 8, stiffness: 100 })
        );
      } else {
        // Reset to original position
        translateY.value = withSpring(0);
      }
    } else {
      // Small movement - just reset
      translateY.value = withSpring(0);
    }
  }, [currentCardIndex, filteredSchedules.length, translateY]);

  // Individual animated styles for each card position - ENHANCED VISIBILITY
  const card0AnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(0, [0, 1, 2, 3], [1, 0.95, 0.9, 0.85], Extrapolate.CLAMP);
    const translateYOffset = interpolate(0, [0, 1, 2, 3], [0, -15, -30, -45], Extrapolate.CLAMP);
    const opacity = interpolate(0, [0, 1, 2, 3], [1, 0.9, 0.8, 0.7], Extrapolate.CLAMP);
    
    return {
      transform: [
        { scale },
        { translateY: translateYOffset + translateY.value }
      ],
      opacity,
      zIndex: 4,
    };
  });

  const card1AnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(1, [0, 1, 2, 3], [1, 0.95, 0.9, 0.85], Extrapolate.CLAMP);
    const translateYOffset = interpolate(1, [0, 1, 2, 3], [0, -15, -30, -45], Extrapolate.CLAMP);
    const opacity = interpolate(1, [0, 1, 2, 3], [1, 0.9, 0.8, 0.7], Extrapolate.CLAMP);
    
    return {
      transform: [
        { scale },
        { translateY: translateYOffset }
      ],
      opacity,
      zIndex: 3,
    };
  });

  const card2AnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(2, [0, 1, 2, 3], [1, 0.95, 0.9, 0.85], Extrapolate.CLAMP);
    const translateYOffset = interpolate(2, [0, 1, 2, 3], [0, -15, -30, -45], Extrapolate.CLAMP);
    const opacity = interpolate(2, [0, 1, 2, 3], [1, 0.9, 0.8, 0.7], Extrapolate.CLAMP);
    
    return {
      transform: [
        { scale },
        { translateY: translateYOffset }
      ],
      opacity,
      zIndex: 2,
    };
  });

  const card3AnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(3, [0, 1, 2, 3], [1, 0.95, 0.9, 0.85], Extrapolate.CLAMP);
    const translateYOffset = interpolate(3, [0, 1, 2, 3], [0, -15, -30, -45], Extrapolate.CLAMP);
    const opacity = interpolate(3, [0, 1, 2, 3], [1, 0.9, 0.8, 0.7], Extrapolate.CLAMP);
    
    return {
      transform: [
        { scale },
        { translateY: translateYOffset }
      ],
      opacity,
      zIndex: 1,
    };
  });

  const card4AnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(4, [0, 1, 2, 3, 4, 5], [1, 0.95, 0.9, 0.85, 0.8, 0.75], Extrapolate.CLAMP);
    const translateYOffset = interpolate(4, [0, 1, 2, 3, 4, 5], [0, -15, -30, -45, -60, -75], Extrapolate.CLAMP);
    const opacity = interpolate(4, [0, 1, 2, 3, 4, 5], [1, 0.9, 0.8, 0.7, 0.6, 0.5], Extrapolate.CLAMP);
    
    return {
      transform: [
        { scale },
        { translateY: translateYOffset }
      ],
      opacity,
      zIndex: 1,
    };
  });

  const card5AnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(5, [0, 1, 2, 3, 4, 5], [1, 0.95, 0.9, 0.85, 0.8, 0.75], Extrapolate.CLAMP);
    const translateYOffset = interpolate(5, [0, 1, 2, 3, 4, 5], [0, -15, -30, -45, -60, -75], Extrapolate.CLAMP);
    const opacity = interpolate(5, [0, 1, 2, 3, 4, 5], [1, 0.9, 0.8, 0.7, 0.6, 0.5], Extrapolate.CLAMP);
    
    return {
      transform: [
        { scale },
        { translateY: translateYOffset }
      ],
      opacity,
      zIndex: 1,
    };
  });

  // Get animated style for card index
  const getCardAnimatedStyle = useCallback((index: number) => {
    switch (index) {
      case 0: return card0AnimatedStyle;
      case 1: return card1AnimatedStyle;
      case 2: return card2AnimatedStyle;
      case 3: return card3AnimatedStyle;
      case 4: return card4AnimatedStyle;
      case 5: return card5AnimatedStyle;
      default: return card0AnimatedStyle;
    }
  }, [card0AnimatedStyle, card1AnimatedStyle, card2AnimatedStyle, card3AnimatedStyle, card4AnimatedStyle, card5AnimatedStyle]);

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background }]}>
      <ReusableHeader title="Schedule" />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText type="default" style={[styles.loadingText, { color: colors.icon }]}>
            Loading your schedule...
              </ThemedText>
            </View>
      ) : error ? (
        <ThemedView style={[styles.errorCard, { borderColor: colors.icon }]}>
          <ThemedText type="default" style={[styles.errorText, { color: '#ff6b6b' }]}>
            {error}
          </ThemedText>
          {!hasStudentProfile && (
            <ThemedText type="default" style={[styles.errorHint, { color: '#ff6b6b' }]}>
              Contact your administrator to set up your student profile.
            </ThemedText>
          )}
          {error.includes('database configuration') && (
            <ThemedText type="default" style={[styles.errorHint, { color: '#ff6b6b' }]}>
              Note: There may be a backend database table naming issue that needs to be resolved.
            </ThemedText>
          )}
        </ThemedView>
      ) : (
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
          }
        >
          {/* Filter banner */}
          {searchFilter?.trim() ? (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: isDark ? '#2A2A2A' : '#F2F2F7',
              borderWidth: 1,
              borderColor: isDark ? '#3A3A3A' : 'rgba(0,0,0,0.06)',
              marginBottom: 12,
            }}>
              <Text style={{ color: colors.icon }}>
                Filtered by: &quot;{searchFilter}&quot; ({filteredSchedules.length} results)
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchFilter('');
                  setExpandedCardId(null);
                }}
                style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: isDark ? '#404040' : '#FFFFFF', borderWidth: 1, borderColor: isDark ? '#505050' : 'rgba(0,0,0,0.08)' }}
              >
                <Text style={{ color: colors.text }}>Clear</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {/* Calendar Week Strip */}
          <View style={styles.calendarSection}>
            <Text style={styles.monthYear}>{currentMonthYear}</Text>
            <View style={styles.calendarStrip}>
              {calendarWeek.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDay,
                    day.isSelected && styles.calendarDaySelected,
                    day.isToday && !day.isSelected && styles.calendarDayToday
                  ]}
                  onPress={() => handleDaySelect(day)}
                >
                  <Text style={[
                    styles.calendarDayName,
                    day.isSelected && styles.calendarDayNameSelected
                  ]}>
                    {day.dayName}
                  </Text>
                  <Text style={[
                    styles.calendarDayDate,
                    day.isSelected && styles.calendarDayDateSelected
                  ]}>
                    {day.date}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Section Title */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Scheduled Subject</Text>

          {/* Card Carousel */}
          {filteredSchedules.length > 0 ? (
            <View style={styles.carouselContainer}>
              <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onEnded={onGestureEnd}
              >
                <Animated.View style={styles.cardStack}>
                  {filteredSchedules.slice(currentCardIndex, currentCardIndex + 6).map((schedule, index) => {
                    const isExpanded = expandedCardId === schedule.id;
                    const subjectColor = getSubjectColor(schedule.subject?.subject_name || 'Unknown Subject');
                    
                    return (
                      <Animated.View
                        key={schedule.id}
                        style={[
                          styles.scheduleCard,
                          { 
                            backgroundColor: subjectColor[0],
                            opacity: isDark ? 0.9 : 1,
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)',
                            height: isExpanded ? 380 : 280,
                          },
                          getCardAnimatedStyle(index)
                        ]}
                      >
                        {/* Card Content */}
                        <View style={styles.cardContent}>
                          {/* Top Section */}
                          <View style={styles.cardTop}>
                            {/* Subject Thumbnail */}
                            <View style={[styles.subjectThumbnail, { 
                              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.2)' 
                            }]}>
                              <Image
                                source={getSubjectImage(schedule.subject?.subject_name || '')}
                                style={styles.thumbnailImage}
                                resizeMode="contain"
                              />
                            </View>
                            
                          </View>

                          {/* Center Content */}
                          <View style={styles.cardCenter}>
                            <Text style={styles.subjectName}>
                              {schedule.subject?.subject_name || 'Unknown Subject'}
                            </Text>
                            <Text style={styles.teacherName}>
                              {schedule.teacher ? 
                                `Mr. ${schedule.teacher.first_name} ${schedule.teacher.last_name}` : 
                                'Teacher TBA'
                              }
                            </Text>
                            <Text style={styles.scheduleTime}>
                              {schedule.dayOfWeek}
                            </Text>
                            <Text style={styles.scheduleTime}>
                              {formatTime(schedule.startTime)} — {formatTime(schedule.endTime)}
                            </Text>
                          </View>

                          {/* Bottom Section */}
                          <View style={styles.cardBottom}>
                            {/* Read More Button */}
                            <TouchableOpacity
                              style={[styles.readMoreButton, { 
                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#FFFFFF',
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)',
                                borderWidth: 1
                              }]}
                              onPress={() => handleCardExpand(schedule.id)}
                            >
                              <Text style={[styles.readMoreText, { 
                                color: isDark ? '#FFFFFF' : '#333333' 
                              }]}>
                                {isExpanded ? 'Show less ↑' : 'Read more →'}
                              </Text>
                            </TouchableOpacity>

                            {/* Academic Icon */}
                            <View style={styles.academicIllustration}>
                              <Ionicons 
                                name={getSubjectIcon(schedule.subject?.subject_name || '') as any} 
                                size={24} 
                                color="#FFFFFF" 
                                style={styles.illustrationIcon} 
                              />
                            </View>
                          </View>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <Animated.View style={[styles.expandedContent, { 
                              borderTopColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)' 
                            }]}>
                              <View style={styles.expandedRow}>
                                <Text style={styles.expandedLabel}>Room:</Text>
                                <Text style={styles.expandedValue}>
                                  {schedule.room?.room_number || 'TBA'}
                                </Text>
                              </View>
                              <View style={styles.expandedRow}>
                                <Text style={styles.expandedLabel}>Section:</Text>
                                <Text style={styles.expandedValue}>
                                  {schedule.section?.name || 'TBA'}
                                </Text>
                              </View>
                              <View style={styles.expandedRow}>
                                <Text style={styles.expandedLabel}>School Year:</Text>
                                <Text style={styles.expandedValue}>
                                  {schedule.schoolYear} - {schedule.semester} Semester
                                </Text>
                              </View>
                            </Animated.View>
                          )}
                        </View>
                      </Animated.View>
                    );
                  })}
                </Animated.View>
              </PanGestureHandler>

              {/* Scroll Indicators */}
              <View style={styles.scrollIndicators}>
                {/* Down Arrow - Show when not at first card */}
                {currentCardIndex > 0 && (
                  <View style={[styles.scrollIndicator, { 
                    backgroundColor: isDark ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)',
                    borderColor: isDark ? 'rgba(25, 118, 210, 0.3)' : 'rgba(25, 118, 210, 0.2)'
                  }]}>
                    <Ionicons name="chevron-down" size={24} color={colors.tint} />
                    <Text style={[styles.scrollIndicatorText, { color: colors.tint }]}>Previous</Text>
                  </View>
                )}
                
                {/* Up Arrow - Show when not at last card */}
                {currentCardIndex < filteredSchedules.length - 1 && (
                  <View style={[styles.scrollIndicator, { 
                    backgroundColor: isDark ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)',
                    borderColor: isDark ? 'rgba(25, 118, 210, 0.3)' : 'rgba(25, 118, 210, 0.2)'
                  }]}>
                    <Text style={[styles.scrollIndicatorText, { color: colors.tint }]}>Next</Text>
                    <Ionicons name="chevron-up" size={24} color={colors.tint} />
                  </View>
                )}
              </View>

              {/* Pagination Dots */}
              {filteredSchedules.length > 1 && (
                <View style={styles.paginationDots}>
                  {filteredSchedules.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        { backgroundColor: isDark ? '#404040' : '#E0E0E0' },
                        index === currentCardIndex && [styles.paginationDotActive, { backgroundColor: colors.tint }]
                      ]}
                    />
                  ))}
                </View>
              )}

              {/* Swipe Indicator */}
              {filteredSchedules.length > 1 && (
                <Text style={[styles.swipeIndicatorText, { color: colors.icon }]}>
                  Swipe up/down to navigate cards
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={colors.icon} />
              <Text style={[styles.emptyText, { color: colors.icon }]}>
                No classes scheduled for {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </Text>
            </View>
          )}
    </ScrollView>
      )}
      
      {/* Loading Overlay */}
      <LoadingOverlay visible={loading} variant="heart" />
    </GestureHandlerRootView>
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
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    opacity: 0.7,
  },
  errorCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 8,
    margin: 20,
  },
  errorText: {
    opacity: 0.8,
  },
  errorHint: {
    opacity: 0.6,
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  
  // Calendar Section
  calendarSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  monthYear: {
    fontSize: 16,
    color: '#89CFF0',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  calendarDay: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 40,
  },
  calendarDaySelected: {
    backgroundColor: '#1976D2',
  },
  calendarDayToday: {
    backgroundColor: '#E3F2FD',
  },
  calendarDayName: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 2,
  },
  calendarDayNameSelected: {
    color: '#FFFFFF',
  },
  calendarDayDate: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  calendarDayDateSelected: {
    color: '#FFFFFF',
  },

  // Section Title
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },

  // Card Carousel
  carouselContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  cardStack: {
    width: screenWidth * 0.9,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleCard: {
    position: 'absolute',
    width: '100%',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  // Card Top Section
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  subjectThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: 30,
    height: 30,
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Card Center Section
  cardCenter: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 16,
  },
  subjectName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    opacity: 0.9,
  },

  // Card Bottom Section
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  readMoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  academicIllustration: {
    flexDirection: 'row',
    gap: 8,
  },
  illustrationIcon: {
    opacity: 0.8,
  },

  // Expanded Content
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  expandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  expandedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  expandedValue: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    opacity: 0.8,
  },

  // Scroll Indicators
  scrollIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    gap: 20,
  },
  scrollIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  scrollIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Pagination Dots
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paginationDotActive: {
    // backgroundColor handled dynamically
  },
  // Swipe Indicator
  swipeIndicatorText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
    fontStyle: "italic",
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.8,
  },
});
