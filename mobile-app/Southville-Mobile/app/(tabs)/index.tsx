import { useRouter, type Href } from 'expo-router';
import { useMemo, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, ActivityIndicator, Image, Text, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withDelay,
  withTiming,
  withRepeat,
  Easing
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAnnouncements } from '@/hooks/use-announcements';
import { useMySchedule, formatTime } from '@/hooks/use-my-schedule';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useUpcomingEvents } from '@/hooks/use-upcoming-events';
import { ReusableHeader } from '@/components/ui/reusable-header';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { formatAnnouncementContent } from '@/utils/html-utils';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Fetch announcements
  const { announcements, loading: announcementsLoading, error: announcementsError } = useAnnouncements({
    page: 1,
    limit: 5,
    includeExpired: false,
  });

  // Fetch schedule
  const { todaysSchedules, loading: scheduleLoading, error: scheduleError, hasStudentProfile } = useMySchedule();

  // Fetch current user
  const { user, loading: userLoading, error: userError } = useCurrentUser();

  // Fetch upcoming events
  const { events, loading: eventsLoading, error: eventsError } = useUpcomingEvents();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlertOverlay, setShowAlertOverlay] = useState(false);
  const [showBirthdayPopup, setShowBirthdayPopup] = useState(false);

  // Animation values
  const alertScale = useSharedValue(0);
  const alertOpacity = useSharedValue(0);
  const alertRotation = useSharedValue(-10);

  // Birthday popup animation values
  const birthdayScale = useSharedValue(0);
  const birthdayOpacity = useSharedValue(0);
  const birthdayRotation = useSharedValue(-5);


  // Animation effect
  useEffect(() => {
    if (showAlertOverlay) {
      // Dramatic bounce-in animation
      alertScale.value = withSequence(
        withTiming(0.3, { duration: 200, easing: Easing.out(Easing.quad) }),
        withSpring(1.1, { damping: 8, stiffness: 100 }),
        withSpring(0.95, { damping: 10, stiffness: 150 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
      
      alertOpacity.value = withTiming(1, { duration: 300 });
      
      alertRotation.value = withSequence(
        withTiming(-15, { duration: 200 }),
        withSpring(5, { damping: 8, stiffness: 100 }),
        withSpring(-2, { damping: 10, stiffness: 150 }),
        withSpring(0, { damping: 12, stiffness: 200 })
      );
    } else {
      // Reset animation values
      alertScale.value = withTiming(0, { duration: 200 });
      alertOpacity.value = withTiming(0, { duration: 200 });
      alertRotation.value = withTiming(-10, { duration: 200 });
    }
  }, [showAlertOverlay]);

  // Birthday popup animation effect
  useEffect(() => {
    if (showBirthdayPopup) {
      // Gentle bounce-in animation for birthday popup
      birthdayScale.value = withSequence(
        withTiming(0.5, { duration: 300, easing: Easing.out(Easing.quad) }),
        withSpring(1.05, { damping: 10, stiffness: 120 }),
        withSpring(1, { damping: 12, stiffness: 150 })
      );
      
      birthdayOpacity.value = withTiming(1, { duration: 400 });
      
      birthdayRotation.value = withSequence(
        withTiming(-8, { duration: 300 }),
        withSpring(3, { damping: 10, stiffness: 120 }),
        withSpring(0, { damping: 12, stiffness: 150 })
      );

    } else {
      // Reset animation values
      birthdayScale.value = withTiming(0, { duration: 300 });
      birthdayOpacity.value = withTiming(0, { duration: 300 });
      birthdayRotation.value = withTiming(-5, { duration: 300 });
    }
  }, [showBirthdayPopup]);

  // Check if today is user's birthday
  const isBirthdayToday = useMemo(() => {
    if (!user?.student?.birthday) return false;
    
    const today = new Date();
    const birthday = new Date(user.student.birthday);
    
    return today.getMonth() === birthday.getMonth() && 
           today.getDate() === birthday.getDate();
  }, [user?.student?.birthday]);

  // Auto-show birthday popup if it's user's birthday
  useEffect(() => {
    if (isBirthdayToday && user && !showBirthdayPopup) {
      // Small delay to ensure user sees the home screen first
      const timer = setTimeout(() => {
        setShowBirthdayPopup(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isBirthdayToday, user, showBirthdayPopup]);

  // Animated styles
  const alertAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: alertScale.value },
        { rotate: `${alertRotation.value}deg` }
      ],
      opacity: alertOpacity.value,
    };
  });

  const birthdayAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: birthdayScale.value },
        { rotate: `${birthdayRotation.value}deg` }
      ],
      opacity: birthdayOpacity.value,
    };
  });


  // Helper function to get appropriate style for quick links
  const getQuickLinkStyle = (index: number) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    return { backgroundColor: colors[index] };
  };

  // Helper function to get appropriate icon for quick links
  const getQuickLinkIcon = (label: string): string => {
    switch (label) {
      case 'Schedule': return 'calendar-outline';
      case 'Announcements': return 'megaphone-outline';
      case 'Grades': return 'school-outline';
      case 'Profile': return 'person-outline';
      default: return 'ellipse-outline';
    }
  };

  // Helper function to get subject image
  const getSubjectImage = (subjectName: string) => {
    const subject = subjectName?.toLowerCase() || '';
    if (subject.includes('math')) return require('@/assets/subjects/MATH.png');
    if (subject.includes('english')) return require('@/assets/subjects/English.png');
    if (subject.includes('science')) return require('@/assets/subjects/Science.png');
    if (subject.includes('filipino')) return require('@/assets/subjects/Filipino.png');
    if (subject.includes('esp') || subject.includes('edukasyon')) return require('@/assets/subjects/ESP.png');
    return require('@/assets/subjects/Spider.png'); // default
  };

  // Helper function to get card colors
  const getSubjectCardColor = (index: number) => {
    const colors = ['#FFB6C1', '#B0E0E6', '#DDA0DD', '#98FB98', '#FFD700', '#FFA07A'];
    return colors[index % colors.length];
  };

  // Helper function to detect announcement type and get styling
  const getAnnouncementType = (announcement: string) => {
    const text = announcement.toLowerCase();
    if (text.includes('urgent') || text.includes('emergency') || text.includes('immediate')) {
      return { type: 'urgent', color: '#FF3B30', icon: 'warning', bgColor: '#FFF5F5' };
    }
    if (text.includes('exam') || text.includes('test') || text.includes('grade') || text.includes('academic')) {
      return { type: 'academic', color: '#007AFF', icon: 'school', bgColor: '#F0F8FF' };
    }
    return { type: 'general', color: '#34C759', icon: 'information-circle', bgColor: '#F0FFF4' };
  };

  // Transform API events data to match UI expectations
  const transformedEvents = useMemo(
    () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      // Filter for upcoming events (published status and future dates)
      const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return event.status === 'published' && eventDate >= today;
      });
      
      // Sort by date (earliest first) and take first 2
      return upcomingEvents
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 2)
        .map(event => ({
          id: event.id,
          title: event.title.toUpperCase(),
          date: new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          description: event.description.length > 100 
            ? event.description.substring(0, 100) + '...'
            : event.description,
          additionalInfo: event.additionalInfo?.[0]?.content || 'More info coming soon',
          additionalInfoColor: event.tags?.[0]?.color || '#007AFF',
          image: event.eventImage 
            ? { uri: event.eventImage }
            : require('@/assets/subjects/Spider.png'), // fallback
          tag: event.tags?.[0]?.name || 'EVENT',
        }));
    },
    [events]
  );

  // Helper function to get current week data
  const getCurrentWeek = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1);
    
    const week = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 6; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      
      week.push({
        dayName: dayNames[i],
        date: day.getDate().toString(),
        isToday: day.toDateString() === today.toDateString(),
        fullDate: day
      });
    }
    
    return week;
  };

  // Helper function to get date for a specific day of the week
  const getDateForDayOfWeek = (dayOfWeek: string): { date: string; dayName: string } => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const dayMap: { [key: string]: number } = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
    };
    
    const targetDay = dayMap[dayOfWeek];
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    
    return {
      date: targetDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      dayName: dayOfWeek
    };
  };

  const quickLinks = useMemo<{ label: string; route: Href }[]>(
    () => [
      { label: 'Schedule', route: '/(tabs)/schedule' },
      { label: 'Announcements', route: '/(tabs)/announcements' },
      { label: 'Grades', route: '/(tabs)/grades' },
      { label: 'Profile', route: '/(tabs)/profile' },
    ],
    [],
  );

  const nextClasses = useMemo(
    () => todaysSchedules.map((schedule, index) => {
      const { date, dayName } = getDateForDayOfWeek(schedule.dayOfWeek);
      return {
        time: `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`,
        title: schedule.subject?.subject_name || 'Unknown Subject',
        room: schedule.room?.room_number || 'TBA',
        date: date,
        dayName: dayName,
        teacher: schedule.teacher ? `${schedule.teacher.first_name} ${schedule.teacher.last_name}` : 'Teacher',
        cardColor: getSubjectCardColor(index),
      };
    }),
    [todaysSchedules],
  );

  const headlineAnnouncements = useMemo(
    () => announcements.map(announcement => announcement.title),
    [announcements],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
    
    {/* Reusable Header */}
    <ReusableHeader title="Home" showWelcomeSection={true} />

    {/* Creative Search Bar */}
    <View style={styles.searchSection}>
      <View style={styles.searchCard}>
        <View style={styles.searchContent}>
          <View style={styles.searchTextContainer}>
            <Text style={styles.searchTitle}>Let's</Text>
            <Text style={styles.searchSubtitle}>Start your Journey</Text>
          </View>
        </View>
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color="#666666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="search...."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options-outline" size={16} color="#666666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Floating Illustration - Outside Container */}
      <View style={styles.floatingIllustration}>
        <Image
          source={require('@/assets/teacherHP.png')}
          style={styles.illustrationImage}
          resizeMode="contain"
        />
      </View>
    </View>

    {/* Creative Calendar Widget */}
    <View style={styles.calendarSection}>
      <View style={styles.calendarCard}>
        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarMonth}>
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <View style={styles.streakContainer}>
            <Text style={styles.streakText}>Streak: 5</Text>
            <Text style={styles.flameEmoji}>🔥</Text>
          </View>
        </View>

        {/* Week View */}
        <View style={styles.weekContainer}>
          {getCurrentWeek().map((day, index) => (
            <View key={index} style={styles.dayColumn}>
              <Text style={[
                styles.dayName,
                day.isToday && styles.todayDayName
              ]}>
                {day.dayName}
              </Text>
              <View style={[
                styles.dateContainer,
                day.isToday && styles.todayDateContainer
              ]}>
                <Text style={[
                  styles.dateNumber,
                  day.isToday && styles.todayDateNumber
                ]}>
                  {day.date}
                </Text>
                {day.isToday && (
                  <View style={styles.starIcon}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Timeline Separator */}
        <View style={styles.timelineContainer}>
          <View style={styles.timelineLine} />
          <View style={styles.timelineHandle} />
        </View>
      </View>
    </View>

      {/* Creative Quick Links Section */}
      <View style={styles.quickLinksSection}>
        <Text style={styles.quickLinksTitle}>Quick Access</Text>
        <View style={styles.quickLinksGrid}>
          {quickLinks.map(({ label, route }, index) => (
            <TouchableOpacity
              key={label}
              style={[styles.quickLinkCard, getQuickLinkStyle(index)]}
              onPress={() => router.push(route)}
              activeOpacity={0.7}
              delayPressIn={50}>
              <View style={styles.quickLinkIcon}>
                <Ionicons 
                  name={getQuickLinkIcon(label) as any} 
                  size={24} 
                  color="#FFFFFF" 
                />
              </View>
              <Text style={styles.quickLinkText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Upcoming classes</ThemedText>
        {scheduleLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.icon} />
            <ThemedText type="default" style={styles.loadingText}>
              Loading schedule...
            </ThemedText>
            </View>
        ) : scheduleError ? (
          <View style={[styles.listCard, { borderColor: colors.icon }]}>
            <ThemedText type="default" style={styles.errorText}>
              {scheduleError}
            </ThemedText>
            {!hasStudentProfile && (
              <ThemedText type="default" style={styles.errorHint}>
                Contact your administrator to set up your student profile.
              </ThemedText>
            )}
            {scheduleError.includes('database configuration') && (
              <ThemedText type="default" style={styles.errorHint}>
                Note: There may be a backend database table naming issue that needs to be resolved.
              </ThemedText>
            )}
          </View>
        ) : nextClasses.length > 0 ? (
          nextClasses.map(({ time, title, room, date, dayName, teacher, cardColor }, index) => (
            <View key={`${title}-${time}-${date}`} style={[styles.classCard, { backgroundColor: cardColor }]}>
              {/* Room Badge */}
              <View style={styles.roomBadge}>
                <Ionicons name="calculator-outline" size={16} color="#000000" />
                <Text style={styles.roomBadgeText}>Room {room}</Text>
              </View>
              
              {/* Subject Title */}
              <Text style={styles.classTitle}>{title}</Text>
              
              {/* Time */}
              <Text style={styles.classTime}>{time}</Text>
              
              {/* Teacher Info */}
              <View style={styles.teacherInfo}>
                <Text style={styles.teacherName}>{teacher}</Text>
          </View>
              
              {/* Subject Illustration */}
              <View style={styles.subjectIllustration}>
                <Image
                  source={getSubjectImage(title)}
                  style={styles.subjectImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.listCard, { borderColor: colors.icon }]}>
            <ThemedText type="default" style={styles.emptyText}>
              No classes scheduled for today
            </ThemedText>
          </View>
        )}
      </ThemedView>

      {/* Unique Creative Announcements Section */}
      <View style={styles.announcementsSection}>
        <View style={styles.announcementsHeader}>
          <View style={styles.announcementsHeaderIcon}>
            <Ionicons name="notifications-outline" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.announcementsTitle}>School Updates</Text>
          <View style={styles.announcementsHeaderAccent} />
        </View>

        {announcementsLoading ? (
          <View style={styles.announcementLoadingContainer}>
            <View style={styles.announcementLoadingSpinner}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
            <Text style={styles.announcementLoadingText}>Loading updates...</Text>
          </View>
        ) : announcementsError ? (
          <View style={styles.announcementErrorContainer}>
            <View style={styles.announcementErrorIcon}>
              <Ionicons name="alert-circle" size={32} color="#FF3B30" />
            </View>
            <Text style={styles.announcementErrorText}>
              Unable to load announcements
            </Text>
            <Text style={styles.announcementErrorSubtext}>
              Please check your connection
            </Text>
          </View>
        ) : headlineAnnouncements.length > 0 ? (
          headlineAnnouncements.map((announcement, index) => {
            const announcementType = getAnnouncementType(announcement);
            return (
              <View key={announcement} style={styles.announcementWrapper}>
                {/* Type Badge */}
                <View style={[styles.announcementTypeBadge, { backgroundColor: announcementType.color }]}>
                  <Ionicons name={announcementType.icon as any} size={16} color="#FFFFFF" />
                  <Text style={styles.announcementTypeText}>{announcementType.type.toUpperCase()}</Text>
                </View>

                {/* Main Card */}
                <View style={[styles.announcementCard, { backgroundColor: announcementType.bgColor }]}>
                  <View style={styles.announcementCardContent}>
                    <View style={styles.announcementCardHeader}>
                      <View style={[styles.announcementCardIcon, { backgroundColor: announcementType.color }]}>
                        <Ionicons name={announcementType.icon as any} size={20} color="#FFFFFF" />
                      </View>
                      <View style={styles.announcementCardInfo}>
                        <Text style={styles.announcementCardTitle}>
                          {announcementType.type === 'urgent' ? 'URGENT NOTICE' : 
                           announcementType.type === 'academic' ? 'ACADEMIC UPDATE' : 'GENERAL ANNOUNCEMENT'}
                        </Text>
                        <Text style={styles.announcementCardTime}>
                          {new Date().toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.announcementCardText}>
                      {formatAnnouncementContent(announcement)}
                    </Text>
                    
                    <View style={styles.announcementCardFooter}>
                      <View style={styles.announcementCardActions}>
                        <Ionicons name="eye-outline" size={16} color={announcementType.color} />
                        <Text style={[styles.announcementCardActionText, { color: announcementType.color }]}>
                          Read More
                        </Text>
                      </View>
                      <View style={[styles.announcementCardPriority, { backgroundColor: announcementType.color }]}>
                        <Text style={styles.announcementCardPriorityText}>
                          {announcementType.type === 'urgent' ? 'HIGH' : 
                           announcementType.type === 'academic' ? 'MEDIUM' : 'LOW'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.announcementEmptyContainer}>
            <View style={styles.announcementEmptyIcon}>
              <Ionicons name="newspaper-outline" size={48} color="#C7C7CC" />
            </View>
            <Text style={styles.announcementEmptyTitle}>No Updates Yet</Text>
            <Text style={styles.announcementEmptyText}>
              Check back later for school announcements
            </Text>
          </View>
        )}
      </View>

      {/* Events Section */}
      <View style={styles.eventsSection}>
        <View style={styles.eventsHeader}>
          <Ionicons name="calendar-outline" size={24} color="#007AFF" />
          <Text style={styles.eventsTitle}>Events</Text>
          <View style={styles.eventsHeaderLine} />
        </View>

        {eventsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : eventsError ? (
          <View style={[styles.listCard, { borderColor: colors.icon }]}>
            <Text style={styles.errorText}>Failed to load events</Text>
          </View>
        ) : transformedEvents.length > 0 ? (
          transformedEvents.map((event) => (
            <View key={event.id} style={styles.eventContainer}>
              {/* Main Event Card (Container 1) */}
              <View style={styles.eventCard}>
                <View style={styles.eventImageContainer}>
                  <Image source={event.image} style={styles.eventImage} resizeMode="cover" />
                  <View style={styles.eventTag}>
                    <Text style={styles.eventTagText}>{event.tag}</Text>
                  </View>
                </View>
                
                <View style={styles.eventContent}>
                  <View style={styles.eventTitleRow}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.eventDateTag}>
                      <Text style={styles.eventDateText}>{event.date}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.eventDescription}>{event.description}</Text>
                </View>
              </View>

              {/* Additional Info Bar (Container 2 - Behind) */}
              <View style={[styles.eventAdditionalInfo, { backgroundColor: event.additionalInfoColor }]}>
                <Text style={styles.eventAdditionalInfoText}>{event.additionalInfo}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.listCard, { borderColor: colors.icon }]}>
            <Text style={styles.emptyText}>No upcoming events</Text>
          </View>
        )}
      </View>

      {/* Test Trigger Buttons */}
      <TouchableOpacity 
        style={styles.testAlertButton}
        onPress={() => setShowAlertOverlay(true)}
      >
        <Text style={styles.testAlertButtonText}>Test Alert</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.testBirthdayButton}
        onPress={() => setShowBirthdayPopup(true)}
      >
        <Text style={styles.testBirthdayButtonText}>
          Test Birthday {isBirthdayToday ? '(Today!)' : ''}
        </Text>
        {user?.student?.birthday && (
          <Text style={styles.debugText}>
            Birthday: {user.student.birthday}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>

      {/* Creative Alert Overlay */}
      {showAlertOverlay && (
        <View style={styles.alertOverlay}>
          <Animated.View style={[styles.alertContainer, alertAnimatedStyle]}>
            {/* Alert Header */}
            <View style={styles.alertHeader}>
              <View style={styles.alertHeaderIcon}>
                <Ionicons name="warning" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.alertHeaderContent}>
                <Text style={styles.alertHeaderTitle}>URGENT NOTICE</Text>
                <Text style={styles.alertHeaderSubtitle}>Weather Alert</Text>
              </View>
              <TouchableOpacity 
                style={styles.alertCloseButton}
                onPress={() => setShowAlertOverlay(false)}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Alert Content */}
            <View style={styles.alertContent}>
              {/* Main Alert Card */}
              <View style={styles.alertMainCard}>
                <View style={styles.alertIconContainer}>
                  <View style={styles.alertIconBackground}>
                    <Ionicons name="rainy" size={40} color="#FF6B35" />
                  </View>
                </View>
                
                <View style={styles.alertTextContainer}>
                  <Text style={styles.alertMainTitle}>Early Dismissal</Text>
                  <Text style={styles.alertMainMessage}>
                    Classes will end at 2:00 PM due to heavy rainfall
                  </Text>
                  <Text style={styles.alertSecondaryMessage}>
                    Stay safe and warm!
                  </Text>
                </View>
              </View>

              {/* Action Section */}
              <View style={styles.alertActionSection}>
                <Text style={styles.alertActionIntro}>
                  For more updates, follow our official page
                </Text>
                
                <TouchableOpacity style={styles.alertActionButton}>
                  <View style={styles.alertActionButtonContent}>
                    <Ionicons name="logo-facebook" size={20} color="#FFFFFF" />
                    <Text style={styles.alertActionButtonText}>
                      Southville 8B NHS Official Page
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Alert Footer */}
              <View style={styles.alertFooter}>
                <View style={styles.alertFooterIcon}>
                  <Ionicons name="shield-checkmark" size={16} color="#34C759" />
                </View>
                <Text style={styles.alertFooterText}>
                  Your safety is our priority
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Birthday Popup */}
      {showBirthdayPopup && (
        <View style={styles.birthdayOverlay}>
          <Animated.View style={[styles.birthdayContainer, birthdayAnimatedStyle]}>
            {/* Birthday Cake Illustration */}
            <View style={styles.birthdayCakeContainer}>
              <View style={styles.birthdayCake}>
                <View style={styles.birthdayCakeBase} />
                <View style={styles.birthdayCakeTop} />
                <View style={styles.birthdayCandle}>
                  <View style={styles.birthdayFlame} />
                </View>
              </View>
            </View>

            {/* Birthday Content */}
            <View style={styles.birthdayContent}>
              <Text style={styles.birthdayTitle}>
                Happy Birthday, {user?.student?.first_name || 'Student'}!
              </Text>
              
              <Text style={styles.birthdayMessage}>
                We hope your day is filled with laughter, good vibes, and awesome memories. Enjoy your special day!
              </Text>
              
              <Text style={styles.birthdaySender}>
                From Southville 8B Family
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity 
              style={styles.birthdayCloseButton}
              onPress={() => setShowBirthdayPopup(false)}
            >
              <Text style={styles.birthdayCloseButtonText}>Back</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
      
      {/* Loading Overlay */}
      <LoadingOverlay visible={announcementsLoading || scheduleLoading || userLoading || eventsLoading} variant="heart" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 24,
  },
  // New Creative Header Styles
  headerSection: {
    marginBottom: 20,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 50,
    alignItems: 'flex-start',
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333333',
   
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  notificationContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  notificationBell: {
    width: 40,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  welcomeSection: {
    gap: 8,
  },
  welcomeRow: {
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
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  // Creative Search Bar Styles
  searchSection: {
    marginBottom: 20,
    position: 'relative',
  },
  searchCard: {
    backgroundColor: '#2196F3',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 0,
    marginHorizontal: 0,
  },
  searchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  searchTextContainer: {
    flex: 1,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  searchSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  floatingIllustration: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 230,
    height: 230,
    zIndex: 10,
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  searchBarContainer: {
    alignItems: 'flex-start',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '85%',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  filterButton: {
    marginLeft: 8,
  },
  // Creative Calendar Widget Styles
  calendarSection: {
    marginBottom: 0,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF4444',
  },
  flameEmoji: {
    fontSize: 16,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 4,
  },
  todayDayName: {
    color: '#333333',
    fontWeight: '600',
  },
  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  todayDateContainer: {
    backgroundColor: '#E3F2FD',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  dateNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  todayDateNumber: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  starIcon: {
    position: 'absolute',
    top: -6,
    zIndex: 10,
  },
  timelineContainer: {
    position: 'relative',
    height: 20,
    alignItems: 'center',
  },
  timelineLine: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  timelineHandle: {
    position: 'absolute',
    left: 0,
    top: 6,
    width: 8,
    height: 8,
    backgroundColor: '#2196F3',
    borderRadius: 2,
  },
  // Creative Quick Links Styles
  quickLinksSection: {
    marginBottom: 20,
  },
  quickLinksTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickLinkCard: {
    width: '48%',
    aspectRatio: 1.2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 100,
    minWidth: 120,
  },
  quickLinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // Creative Class Cards Styles
  classCard: {
    borderRadius: 20,
    padding: 10,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 160,
    maxHeight: 220,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  roomBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  classTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 12,
    marginBottom: 4,
  },
  classTime: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  teacherName: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  subjectIllustration: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    width: 180,
    height: 180,
    maxWidth: 180,
    maxHeight: 180,
    minWidth: 120,
    minHeight: 120,
  },
  subjectImage: {
    width: '100%',
    height: '100%',
  },
  greetingCard: {
    padding: 20,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
  },
  section: {
    gap: 16,
  },
  listCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listCardDetails: {
    gap: 4,
  },
  listCardDetail: {
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  loadingText: {
    opacity: 0.7,
  },
  errorText: {
    color: '#ff6b6b',
    opacity: 0.8,
  },
  errorHint: {
    color: '#ff6b6b',
    opacity: 0.6,
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyText: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  // Events Section Styles
  eventsSection: {
    marginTop: 24,
    gap: 20,
  },
  eventsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  eventsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  eventsHeaderLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#007AFF',
    borderRadius: 1,
  },
  eventContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    minHeight: 120,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 2,
  },
  eventImageContainer: {
    position: 'relative',
    width: 100,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  eventTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventContent: {
    flex: 1,
    gap: 6,
    height: 120,
    justifyContent: 'space-between',
  },
  eventTitleRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    flexWrap: 'wrap',
    lineHeight: 20,
  },
  eventDateTag: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  eventDateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventDescription: {
    fontSize: 12,
    color: '#333333',
    lineHeight: 16,
  },
  eventAdditionalInfo: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: -8,
    marginHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1,
  },
  eventAdditionalInfoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Unique Creative Announcements Section Styles
  announcementsSection: {
    marginTop: 24,
    gap: 20,
  },
  announcementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  announcementsHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  announcementsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    flex: 1,
  },
  announcementsHeaderAccent: {
    width: 60,
    height: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  announcementWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  announcementTypeBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  announcementTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  announcementCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  announcementCardContent: {
    gap: 16,
  },
  announcementCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
  },
  announcementCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  announcementCardInfo: {
    flex: 1,
    gap: 4,
  },
  announcementCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    letterSpacing: 0.5,
  },
  announcementCardTime: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  announcementCardText: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 22,
    fontWeight: '400',
  },
  announcementCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  announcementCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  announcementCardActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  announcementCardPriority: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  announcementCardPriorityText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  announcementLoadingContainer: {
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  announcementLoadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementLoadingText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  announcementErrorContainer: {
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  announcementErrorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementErrorText: {
    fontSize: 18,
    color: '#FF3B30',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  announcementErrorSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  announcementEmptyContainer: {
    alignItems: 'center',
    padding: 60,
    gap: 20,
  },
  announcementEmptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementEmptyTitle: {
    fontSize: 20,
    color: '#1C1C1E',
    fontWeight: 'bold',
  },
  announcementEmptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Creative Alert Overlay Styles
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 25,
    overflow: 'hidden',
  },
  alertHeader: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  alertHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertHeaderContent: {
    flex: 1,
    gap: 2,
  },
  alertHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  alertHeaderSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  alertCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    padding: 24,
    gap: 20,
  },
  alertMainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFF8F5',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFE5E0',
  },
  alertIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertIconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  alertTextContainer: {
    flex: 1,
    gap: 8,
  },
  alertMainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  alertMainMessage: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
  },
  alertSecondaryMessage: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  alertActionSection: {
    gap: 12,
  },
  alertActionIntro: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
  },
  alertActionButton: {
    backgroundColor: '#1877F2',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#1877F2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  alertActionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  alertActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  alertFooterIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0FFF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertFooterText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  testAlertButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  testAlertButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testBirthdayButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  testBirthdayButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  // Birthday Popup Styles
  birthdayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  birthdayContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    marginHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    maxWidth: 320,
  },
  birthdayCakeContainer: {
    marginBottom: 20,
  },
  birthdayCake: {
    alignItems: 'center',
    position: 'relative',
  },
  birthdayCakeBase: {
    width: 80,
    height: 50,
    backgroundColor: '#87CEEB',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4682B4',
  },
  birthdayCakeTop: {
    width: 70,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    marginTop: -5,
    borderWidth: 2,
    borderColor: '#4682B4',
  },
  birthdayCandle: {
    width: 4,
    height: 20,
    backgroundColor: '#FFB6C1',
    borderRadius: 2,
    marginTop: -15,
    alignItems: 'center',
  },
  birthdayFlame: {
    width: 6,
    height: 8,
    backgroundColor: '#FFD700',
    borderRadius: 3,
    marginTop: -2,
  },
  birthdayContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  birthdayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
  },
  birthdayMessage: {
    fontSize: 16,
    color: '#1E3A8A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  birthdaySender: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    textAlign: 'center',
  },
  birthdayCloseButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  birthdayCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
