import { useRouter, type Href } from "expo-router";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  RefreshControl,
  Keyboard,
  AppState,
  InteractionManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { useAnnouncements } from "@/hooks/use-announcements";
import { useMySchedule, formatTime } from "@/hooks/use-my-schedule";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useUpcomingEvents } from "@/hooks/use-upcoming-events";
import { useAlerts } from "@/hooks/use-alerts";
import { useLoginStreak } from "@/hooks/use-login-streak";
import { Event } from "@/lib/types/event";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useAuthErrorHandler } from "@/hooks/use-auth-error-handler";
import { ReusableHeader } from "@/components/ui/reusable-header";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { AlertModal } from "@/components/alerts/AlertModal";
import { formatAnnouncementContent } from "@/utils/html-utils";
import { useSearchSuggestions } from "@/hooks/use-search-suggestions";
import { SearchSuggestions } from "@/components/search/SearchSuggestions";
import { getSubjectAsset } from "@/lib/subject-images";
import { useNetworkRefetch } from "@/hooks/use-network-refetch";
import { ModalDialog } from "@/components/ui/ModalDialog";

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];

  // Fetch announcements
  const {
    announcements,
    loading: announcementsLoading,
    error: announcementsError,
    refetch: refetchAnnouncements,
  } = useAnnouncements({
    page: 1,
    limit: 5,
    includeExpired: false,
  });

  // Fetch schedule
  const {
    todaysSchedules,
    loading: scheduleLoading,
    error: scheduleError,
    hasStudentProfile,
    refetch: refetchSchedule,
  } = useMySchedule();

  // Fetch current user
  const {
    user,
    loading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useCurrentUser();

  // Fetch upcoming events
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
  } = useUpcomingEvents();

  // Fetch alerts - filters by user ID if available, or shows whole school alerts
  const { activeAlert, markAsRead, isInitialized } = useAlerts({
    recipient_id: user?.id || null,
  });

  // Fetch login streak
  const { streak, refetch: refetchStreak } = useLoginStreak();

  // Auth session for detecting first login
  const { status: authStatus } = useAuthSession();

  // Auth error handling
  const { handleAuthError } = useAuthErrorHandler();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const deactivateTimerRef = useRef<null | ReturnType<typeof setTimeout>>(null);
  const appStateRef = useRef(AppState.currentState);
  // Debug: track keyboard visibility and search active state
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e: any) => {
      console.log("[Home][Keyboard] didShow", {
        height: e?.endCoordinates?.height,
      });
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      console.log("[Home][Keyboard] didHide");
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    console.log("[Home][Search] active state changed", { searchActive });
  }, [searchActive]);

  // Network connectivity monitoring
  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    // Get initial network state
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Auto-refetch data when network connectivity is restored
  useNetworkRefetch([
    refetchAnnouncements,
    refetchSchedule,
    refetchUser,
    refetchEvents,
    refetchStreak,
  ]);
  // Search suggestions
  const {
    data: suggestData,
    loading: suggestLoading,
    recent: recentSearches,
    saveRecent,
  } = useSearchSuggestions(searchQuery);

  const handleSubmitSearch = useCallback(
    (q: string) => {
      const term = q.trim();
      if (!term) return;
      saveRecent(term);
      // Default: navigate to announcements tab with query for now
      router.push({
        pathname: "/(tabs)/announcements",
        params: { query: term } as any,
      } as any);
    },
    [router, saveRecent]
  );

  const handleSelectSuggestion = useCallback(
    (item: { id: string; kind: string; title: string }) => {
      console.log("[Home][Search] onSelect", item);
      // Dismiss keyboard and mark search inactive before navigating
      Keyboard.dismiss();
      setSearchActive(false);
      // Optionally reflect selection in the input
      setSearchQuery(item.title);
      saveRecent(searchQuery.trim());
      switch (item.kind) {
        case "announcement":
          {
            const path = `/(tabs)/announcements?query=${encodeURIComponent(
              item.title
            )}`;
            console.log("[Home][Search] navigating to", path);
            InteractionManager.runAfterInteractions(() => {
              router.push(path as any);
            });
          }
          break;
        case "event":
          {
            const path = `/(tabs)/events?query=${encodeURIComponent(
              item.title
            )}`;
            console.log("[Home][Search] navigating to", path);
            InteractionManager.runAfterInteractions(() => {
              router.push(path as any);
            });
          }
          break;
        case "schedule":
          {
            const path = `/(tabs)/schedule?query=${encodeURIComponent(
              item.title
            )}`;
            console.log("[Home][Search] navigating to", path);
            InteractionManager.runAfterInteractions(() => {
              router.push(path as any);
            });
          }
          break;
        default:
          break;
      }
    },
    [router, saveRecent, searchQuery]
  );
  const [showBirthdayPopup, setShowBirthdayPopup] = useState(false);
  const [selectedEventDate, setSelectedEventDate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [showPasswordChangePrompt, setShowPasswordChangePrompt] =
    useState(false);

  // Birthday popup animation values
  const birthdayScale = useSharedValue(0);
  const birthdayOpacity = useSharedValue(0);
  const birthdayRotation = useSharedValue(-5);

  // Handle alert dismissal
  const handleAlertDismiss = useCallback(async () => {
    if (activeAlert) {
      await markAsRead(activeAlert.id);
    }
  }, [activeAlert, markAsRead]);

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
  }, [showBirthdayPopup, birthdayOpacity, birthdayRotation, birthdayScale]);

  // Check if today is user's birthday
  const isBirthdayToday = useMemo(() => {
    if (!user?.student?.birthday) return false;

    const today = new Date();
    const birthday = new Date(user.student.birthday);

    return (
      today.getMonth() === birthday.getMonth() &&
      today.getDate() === birthday.getDate()
    );
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

  // Auto-redirect to login on authentication errors
  useEffect(() => {
    console.log("[INDEX][AUTO-REDIRECT] Checking for auth errors", {
      hasErrors: {
        announcements: !!announcementsError,
        schedule: !!scheduleError,
        user: !!userError,
        events: !!eventsError,
      },
    });

    // Check for authentication errors using centralized handler
    const errors = [announcementsError, scheduleError, userError, eventsError];

    for (const error of errors) {
      if (error) {
        const wasRedirected = handleAuthError(error);
        if (wasRedirected) {
          console.log(
            "[INDEX][AUTO-REDIRECT] Auth error handled - redirecting to login"
          );
          break; // Stop checking other errors once redirect is triggered
        }
      }
    }
  }, [
    announcementsError,
    scheduleError,
    userError,
    eventsError,
    handleAuthError,
  ]);

  // Check for first-time login and show password change prompt
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const checkFirstTimeLogin = async () => {
      // Only check if user is authenticated and user data is loaded
      if (authStatus !== "authenticated" || !user?.id || userLoading) {
        return;
      }

      try {
        const flagKey = `@password_change_prompt_shown_${user.id}`;
        const hasSeenPrompt = await AsyncStorage.getItem(flagKey);

        if (!hasSeenPrompt) {
          // Small delay to ensure home screen is visible first
          timeoutId = setTimeout(() => {
            setShowPasswordChangePrompt(true);
          }, 1500);
        }
      } catch (error) {
        console.error("Error checking password change prompt:", error);
      }
    };

    checkFirstTimeLogin();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [authStatus, user?.id, userLoading]);

  // Handle app state changes to reset modal states when app resumes
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && appStateRef.current === "background") {
        // App resumed from background - reset modal states to prevent invisible overlays
        console.log(
          "[HomeScreen] App resumed from background - resetting modals"
        );
        setShowPasswordChangePrompt(false);
        setShowBirthdayPopup(false);
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Animated styles
  const birthdayAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: birthdayScale.value },
        { rotate: `${birthdayRotation.value}deg` },
      ],
      opacity: birthdayOpacity.value,
    };
  });

  // Helper function to get events for a specific date
  const getEventsForDate = useCallback(
    (date: Date) => {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      return events.filter((event) => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return (
          eventDate.getTime() === targetDate.getTime() &&
          event.status === "published"
        );
      });
    },
    [events]
  );

  // Helper function to check if a date has events
  const hasEventsOnDate = useCallback(
    (date: Date) => {
      return getEventsForDate(date).length > 0;
    },
    [getEventsForDate]
  );

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchAnnouncements(),
        refetchSchedule(),
        refetchUser(),
        refetchEvents(),
        refetchStreak(),
      ]);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  }, [
    refetchAnnouncements,
    refetchSchedule,
    refetchUser,
    refetchEvents,
    refetchStreak,
  ]);

  // Helper function to get appropriate style for quick links
  const getQuickLinkStyle = (index: number) => {
    const lightColors = [
      "rgba(255, 107, 107, 0.8)",
      "rgba(78, 205, 196, 0.8)",
      "rgba(69, 183, 209, 0.8)",
      "rgba(150, 206, 180, 0.8)",
    ];
    const darkColors = [
      "rgba(255, 107, 107, 0.6)",
      "rgba(78, 205, 196, 0.6)",
      "rgba(69, 183, 209, 0.6)",
      "rgba(150, 206, 180, 0.6)",
    ];
    return { backgroundColor: isDark ? darkColors[index] : lightColors[index] };
  };

  // Helper function to get appropriate icon for quick links
  const getQuickLinkIcon = (label: string): string => {
    switch (label) {
      case "Schedule":
        return "calendar-outline";
      case "Announcements":
        return "megaphone-outline";
      case "Grades":
        return "school-outline";
      case "Profile":
        return "person-outline";
      default:
        return "ellipse-outline";
    }
  };

  // Helper function (delegates to centralized mapper)
  const getSubjectImage = (subjectName: string) => getSubjectAsset(subjectName);

  // Helper function to get card colors
  const getSubjectCardColor = (index: number) => {
    const colors = [
      "#FFB6C1",
      "#B0E0E6",
      "#DDA0DD",
      "#98FB98",
      "#FFD700",
      "#FFA07A",
    ];
    return colors[index % colors.length];
  };

  // Helper function to detect announcement type and get styling
  const getAnnouncementType = (announcement: string) => {
    const text = announcement.toLowerCase();
    if (
      text.includes("urgent") ||
      text.includes("emergency") ||
      text.includes("immediate")
    ) {
      return {
        type: "urgent",
        color: "#FF3B30",
        icon: "warning",
        bgColor: "#FFF5F5",
      };
    }
    if (
      text.includes("exam") ||
      text.includes("test") ||
      text.includes("grade") ||
      text.includes("academic")
    ) {
      return {
        type: "academic",
        color: "#007AFF",
        icon: "school",
        bgColor: "#F0F8FF",
      };
    }
    return {
      type: "general",
      color: "#34C759",
      icon: "information-circle",
      bgColor: "#F0FFF4",
    };
  };

  // Transform API events data to match UI expectations
  const transformedEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    // Filter for upcoming events (published status and future dates)
    const upcomingEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return event.status === "published" && eventDate >= today;
    });

    // Sort by date (earliest first) and take first 2
    return upcomingEvents
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 2)
      .map((event) => ({
        id: event.id,
        title: event.title.toUpperCase(),
        date: new Date(event.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        description:
          event.description.length > 100
            ? event.description.substring(0, 100) + "..."
            : event.description,
        additionalInfo:
          event.additionalInfo?.[0]?.content || "More info coming soon",
        additionalInfoColor: event.tags?.[0]?.color || "#007AFF",
        image: event.eventImage
          ? { uri: event.eventImage }
          : require("@/assets/subjects/Spider.png"), // fallback
        tag: event.tags?.[0]?.name || "EVENT",
      }));
  }, [events]);

  // Helper function to get current week data (same logic as schedule screen)
  const getCurrentWeek = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
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

    const week = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);

      week.push({
        dayName: dayNames[i],
        date: day.getDate().toString(),
        isToday: day.toDateString() === today.toDateString(),
        fullDate: day,
      });
    }

    return week;
  };

  // Helper function to get date for a specific day of the week
  const getDateForDayOfWeek = (
    dayOfWeek: string
  ): { date: string; dayName: string } => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const dayMap: { [key: string]: number } = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const targetDay = dayMap[dayOfWeek];
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);

    return {
      date: targetDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      dayName: dayOfWeek,
    };
  };

  const quickLinks = useMemo<{ label: string; route: Href }[]>(
    () => [
      { label: "Schedule", route: "/(tabs)/schedule" },
      { label: "Announcements", route: "/(tabs)/announcements" },
      { label: "Grades", route: "/(tabs)/grades" },
      { label: "Profile", route: "/(tabs)/profile" },
    ],
    []
  );

  const nextClasses = useMemo(
    () =>
      todaysSchedules.map((schedule, index) => {
        const { date, dayName } = getDateForDayOfWeek(schedule.dayOfWeek);
        return {
          time: `${formatTime(schedule.startTime)} - ${formatTime(
            schedule.endTime
          )}`,
          title: schedule.subject?.subject_name || "Unknown Subject",
          room: schedule.room?.room_number || "TBA",
          date: date,
          dayName: dayName,
          teacher: schedule.teacher
            ? `${schedule.teacher.first_name} ${schedule.teacher.last_name}`
            : "Teacher",
          cardColor: getSubjectCardColor(index),
        };
      }),
    [todaysSchedules]
  );

  // Keep full announcement objects for date access
  const headlineAnnouncements = useMemo(() => announcements, [announcements]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Network Connectivity Indicator */}
      {isConnected === false && (
        <View style={styles.networkIndicator}>
          <Ionicons name="wifi-outline" size={16} color="#FFFFFF" />
          <Text style={styles.networkIndicatorText}>
            No Internet Connection
          </Text>
        </View>
      )}
      <ScrollView
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
        {/* Reusable Header */}
        <ReusableHeader title="Home" showWelcomeSection={true} />

        {/* Creative Search Bar */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchCard,
              { backgroundColor: isDark ? "#2A2A2A" : "#2196F3" },
            ]}
          >
            <View style={styles.searchContent}>
              <View style={styles.searchTextContainer}>
                <Text style={styles.searchTitle}>Let&apos;s</Text>
                <Text style={styles.searchSubtitle}>Start your Journey</Text>
              </View>
            </View>
            <View style={styles.searchBarContainer}>
              <View
                style={[
                  styles.searchBar,
                  { backgroundColor: isDark ? "#404040" : "#FFFFFF" },
                ]}
              >
                <Ionicons
                  name="search"
                  size={16}
                  color={isDark ? "#FFFFFF" : "#666666"}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={[
                    styles.searchInput,
                    { color: isDark ? "#FFFFFF" : "#333333" },
                  ]}
                  placeholder="Search announcements"
                  placeholderTextColor={isDark ? "#CCCCCC" : "#999999"}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => {
                    if (deactivateTimerRef.current) {
                      clearTimeout(deactivateTimerRef.current);
                      deactivateTimerRef.current = null;
                    }
                    setSearchActive(true);
                  }}
                />
                <TouchableOpacity style={styles.filterButton}>
                  <Ionicons
                    name="options-outline"
                    size={16}
                    color={isDark ? "#FFFFFF" : "#666666"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Floating Illustration - Outside Container */}
          <View style={styles.floatingIllustration}>
            <Image
              source={require("@/assets/teacherHP.png")}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>
        </View>
        {
          // Render suggestions dropdown overlayed under the search bar
          <SearchSuggestions
            query={searchQuery}
            suggestions={suggestData}
            loading={suggestLoading}
            recent={recentSearches}
            onSelect={handleSelectSuggestion}
            onSubmit={handleSubmitSearch}
            active={searchActive}
            onBeginSelect={() => {
              // Prevent blur timer from hiding suggestions before press
              if (deactivateTimerRef.current) {
                console.log(
                  "[Home][Search] cancel blur deactivation due to selection"
                );
                clearTimeout(deactivateTimerRef.current);
                deactivateTimerRef.current = null;
              }
            }}
          />
        }

        {/* Creative Calendar Widget */}
        <View style={styles.calendarSection}>
          <View
            style={[
              styles.calendarCard,
              { backgroundColor: colors.background },
            ]}
          >
            {/* Calendar Header */}
            <View style={styles.calendarHeader}>
              <Text style={[styles.calendarMonth, { color: colors.tint }]}>
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <View style={styles.streakContainer}>
                <Text style={styles.streakText}>Streak: {streak}</Text>
                <Text style={styles.flameEmoji}>🔥</Text>
              </View>
            </View>

            {/* Week View */}
            <View style={styles.weekContainer}>
              {getCurrentWeek().map((day, index) => {
                const hasEvents = hasEventsOnDate(day.fullDate);
                const isSelected =
                  selectedEventDate?.toDateString() ===
                  day.fullDate.toDateString();

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.dayColumn}
                    onPress={() => {
                      if (hasEvents) {
                        setSelectedEventDate(isSelected ? null : day.fullDate);
                      }
                    }}
                    disabled={!hasEvents}
                  >
                    <Text
                      style={[
                        styles.dayName,
                        { color: colors.icon },
                        day.isToday && styles.todayDayName,
                      ]}
                    >
                      {day.dayName}
                    </Text>
                    <View
                      style={[
                        styles.dateContainer,
                        day.isToday && [
                          styles.todayDateContainer,
                          {
                            backgroundColor: isDark ? "#2A2A2A" : "#E3F2FD",
                            shadowColor: colors.tint,
                          },
                        ],
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateNumber,
                          { color: colors.text },
                          day.isToday && [
                            styles.todayDateNumber,
                            { color: colors.tint },
                          ],
                        ]}
                      >
                        {day.date}
                      </Text>
                      {day.isToday && (
                        <View style={styles.starIcon}>
                          <Ionicons name="star" size={12} color="#FFD700" />
                        </View>
                      )}
                      {hasEvents && <View style={styles.eventDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Timeline Separator */}
            <View style={styles.timelineContainer}>
              <View
                style={[styles.timelineLine, { backgroundColor: colors.icon }]}
              />
              <View
                style={[
                  styles.timelineHandle,
                  { backgroundColor: colors.tint },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Event Dropdown */}
        {selectedEventDate && (
          <View
            style={[
              styles.eventDropdown,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.eventDropdownHeader}>
              <Text style={[styles.eventDropdownTitle, { color: colors.text }]}>
                Events on{" "}
                {selectedEventDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              <TouchableOpacity onPress={() => setSelectedEventDate(null)}>
                <Ionicons name="close-circle" size={20} color={colors.icon} />
              </TouchableOpacity>
            </View>

            {getEventsForDate(selectedEventDate).map((event: Event) => (
              <View
                key={event.id}
                style={[styles.eventDropdownItem, { borderColor: colors.icon }]}
              >
                <View style={styles.eventDropdownDot} />
                <View style={styles.eventDropdownContent}>
                  <Text
                    style={[
                      styles.eventDropdownItemTitle,
                      { color: colors.text },
                    ]}
                  >
                    {event.title}
                  </Text>
                  <Text
                    style={[
                      styles.eventDropdownItemDate,
                      { color: colors.icon },
                    ]}
                  >
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Creative Quick Links Section */}
        <View style={styles.quickLinksSection}>
          <Text style={[styles.quickLinksTitle, { color: colors.text }]}>
            Quick Access
          </Text>
          <View style={styles.quickLinksGrid}>
            {quickLinks.map(({ label, route }, index) => (
              <TouchableOpacity
                key={label}
                style={[styles.quickLinkCard, getQuickLinkStyle(index)]}
                onPress={() => router.push(route)}
                activeOpacity={0.7}
                delayPressIn={50}
              >
                <View
                  style={[
                    styles.quickLinkIcon,
                    {
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.15)"
                        : "rgba(255, 255, 255, 0.2)",
                    },
                  ]}
                >
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
              {scheduleError.includes("database configuration") && (
                <ThemedText type="default" style={styles.errorHint}>
                  Note: There may be a backend database table naming issue that
                  needs to be resolved.
                </ThemedText>
              )}
            </View>
          ) : nextClasses.length > 0 ? (
            nextClasses.map(
              (
                { time, title, room, date, dayName, teacher, cardColor },
                index
              ) => (
                <View
                  key={`${title}-${time}-${date}`}
                  style={[styles.classCard, { backgroundColor: cardColor }]}
                >
                  {/* Room Badge */}
                  <View style={styles.roomBadge}>
                    <Ionicons
                      name="calculator-outline"
                      size={16}
                      color="#000000"
                    />
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
              )
            )
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
              <Ionicons
                name="notifications-outline"
                size={28}
                color="#FFFFFF"
              />
            </View>
            <Text style={[styles.announcementsTitle, { color: colors.text }]}>
              School Updates
            </Text>
            <View style={styles.announcementsHeaderAccent} />
          </View>

          {announcementsLoading ? (
            <View style={styles.announcementLoadingContainer}>
              <View
                style={[
                  styles.announcementLoadingSpinner,
                  { backgroundColor: isDark ? "#2A2A2A" : "#F2F2F7" },
                ]}
              >
                <ActivityIndicator size="large" color={colors.tint} />
              </View>
              <Text
                style={[styles.announcementLoadingText, { color: colors.icon }]}
              >
                Loading updates...
              </Text>
            </View>
          ) : announcementsError ? (
            <View style={styles.announcementErrorContainer}>
              <View
                style={[
                  styles.announcementErrorIcon,
                  { backgroundColor: isDark ? "#2A2A2A" : "#FFF5F5" },
                ]}
              >
                <Ionicons name="alert-circle" size={32} color="#FF3B30" />
              </View>
              <Text style={styles.announcementErrorText}>
                Unable to load announcements
              </Text>
              <Text
                style={[
                  styles.announcementErrorSubtext,
                  { color: colors.icon },
                ]}
              >
                Please check your connection
              </Text>
            </View>
          ) : headlineAnnouncements.length > 0 ? (
            headlineAnnouncements.map((announcement, index) => {
              const announcementType = getAnnouncementType(announcement.title);
              const announcementDate = new Date(announcement.createdAt);
              const formattedDate = announcementDate.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });

              return (
                <View key={announcement.id} style={styles.announcementWrapper}>
                  {/* Type Badge */}
                  <View
                    style={[
                      styles.announcementTypeBadge,
                      { backgroundColor: announcementType.color },
                    ]}
                  >
                    <Ionicons
                      name={announcementType.icon as any}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.announcementTypeText}>
                      {announcementType.type.toUpperCase()}
                    </Text>
                  </View>

                  {/* Main Card */}
                  <View
                    style={[
                      styles.announcementCard,
                      {
                        backgroundColor: isDark
                          ? "#2A2A2A"
                          : announcementType.bgColor,
                        borderColor: isDark ? "#404040" : "rgba(0,0,0,0.05)",
                      },
                    ]}
                  >
                    <View style={styles.announcementCardContent}>
                      <View style={styles.announcementCardHeader}>
                        <View
                          style={[
                            styles.announcementCardIcon,
                            { backgroundColor: announcementType.color },
                          ]}
                        >
                          <Ionicons
                            name={announcementType.icon as any}
                            size={20}
                            color="#FFFFFF"
                          />
                        </View>
                        <View style={styles.announcementCardInfo}>
                          <Text
                            style={[
                              styles.announcementCardTitle,
                              { color: colors.text },
                            ]}
                          >
                            {announcementType.type === "urgent"
                              ? "URGENT NOTICE"
                              : announcementType.type === "academic"
                              ? "ACADEMIC UPDATE"
                              : "GENERAL ANNOUNCEMENT"}
                          </Text>
                          <Text
                            style={[
                              styles.announcementCardTime,
                              { color: colors.icon },
                            ]}
                          >
                            {formattedDate}
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={[
                          styles.announcementCardText,
                          { color: colors.text },
                        ]}
                      >
                        {formatAnnouncementContent(announcement.title)}
                      </Text>

                      <View style={styles.announcementCardFooter}>
                        <TouchableOpacity
                          style={styles.announcementCardActions}
                          onPress={() => router.push("/(tabs)/announcements")}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="eye-outline"
                            size={16}
                            color={announcementType.color}
                          />
                          <Text
                            style={[
                              styles.announcementCardActionText,
                              { color: announcementType.color },
                            ]}
                          >
                            Read More
                          </Text>
                        </TouchableOpacity>
                        <View
                          style={[
                            styles.announcementCardPriority,
                            { backgroundColor: announcementType.color },
                          ]}
                        >
                          <Text style={styles.announcementCardPriorityText}>
                            {announcementType.type === "urgent"
                              ? "HIGH"
                              : announcementType.type === "academic"
                              ? "MEDIUM"
                              : "LOW"}
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
              <View
                style={[
                  styles.announcementEmptyIcon,
                  { backgroundColor: isDark ? "#2A2A2A" : "#F2F2F7" },
                ]}
              >
                <Ionicons
                  name="newspaper-outline"
                  size={48}
                  color={colors.icon}
                />
              </View>
              <Text
                style={[styles.announcementEmptyTitle, { color: colors.text }]}
              >
                No Updates Yet
              </Text>
              <Text
                style={[styles.announcementEmptyText, { color: colors.icon }]}
              >
                Check back later for school announcements
              </Text>
            </View>
          )}
        </View>

        {/* Events Section */}
        <View style={styles.eventsSection}>
          <View style={styles.eventsHeader}>
            <Ionicons name="calendar-outline" size={24} color={colors.tint} />
            <Text style={[styles.eventsTitle, { color: colors.text }]}>
              Events
            </Text>
            <View
              style={[
                styles.eventsHeaderLine,
                { backgroundColor: colors.tint },
              ]}
            />
          </View>

          {eventsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.tint} />
              <Text style={[styles.loadingText, { color: colors.icon }]}>
                Loading events...
              </Text>
            </View>
          ) : eventsError ? (
            <View style={[styles.listCard, { borderColor: colors.icon }]}>
              <Text style={[styles.errorText, { color: "#ff6b6b" }]}>
                Failed to load events
              </Text>
            </View>
          ) : transformedEvents.length > 0 ? (
            transformedEvents.map((event) => (
              <View key={event.id} style={styles.eventContainer}>
                {/* Main Event Card (Container 1) */}
                <View
                  style={[
                    styles.eventCard,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <View style={styles.eventImageContainer}>
                    <Image
                      source={event.image}
                      style={styles.eventImage}
                      resizeMode="cover"
                    />
                    <View style={styles.eventTag}>
                      <Text style={styles.eventTagText}>{event.tag}</Text>
                    </View>
                  </View>

                  <View style={styles.eventContent}>
                    <View style={styles.eventTitleRow}>
                      <Text style={[styles.eventTitle, { color: colors.text }]}>
                        {event.title}
                      </Text>
                      <View style={styles.eventDateTag}>
                        <Text style={styles.eventDateText}>{event.date}</Text>
                      </View>
                    </View>

                    <Text
                      style={[styles.eventDescription, { color: colors.icon }]}
                    >
                      {event.description}
                    </Text>
                  </View>
                </View>

                {/* Additional Info Bar (Container 2 - Behind) */}
                <View
                  style={[
                    styles.eventAdditionalInfo,
                    { backgroundColor: event.additionalInfoColor },
                  ]}
                >
                  <Text style={styles.eventAdditionalInfoText}>
                    {event.additionalInfo}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={[styles.listCard, { borderColor: colors.icon }]}>
              <Text style={[styles.emptyText, { color: colors.icon }]}>
                No upcoming events
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Real-time Alert Modal */}
      {isInitialized && activeAlert && (
        <AlertModal
          alert={activeAlert}
          onDismiss={handleAlertDismiss}
          extraLink={undefined} // Desktop app doesn't have extra_link in CreateAlertDto, but we support it if added later
        />
      )}

      {/* Birthday Popup */}
      {showBirthdayPopup && (
        <View style={styles.birthdayOverlay}>
          <Animated.View
            style={[styles.birthdayContainer, birthdayAnimatedStyle]}
          >
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
                Happy Birthday, {user?.student?.first_name || "Student"}!
              </Text>

              <Text style={styles.birthdayMessage}>
                We hope your day is filled with laughter, good vibes, and
                awesome memories. Enjoy your special day!
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
      <LoadingOverlay
        visible={
          announcementsLoading ||
          scheduleLoading ||
          userLoading ||
          eventsLoading
        }
        variant="heart"
      />

      {/* Password Change Prompt Modal */}
      <ModalDialog
        visible={showPasswordChangePrompt}
        onClose={async () => {
          // Backdrop tap or close - do NOT set the flag
          // This ensures the prompt will show again on next login if user dismisses it
          setShowPasswordChangePrompt(false);
        }}
        title="Security Alert: Change Your Password"
        message="For security purposes, you need to change your password on first login."
        bullets={[
          "Go to Profile tab (bottom navigation)",
          "Tap on 'Account Security'",
          "Tap on 'Change Password' button",
          "Enter your current password",
          "Enter your new password (meets requirements below)",
          "Confirm your new password",
          "Tap 'Change Password' to save",
        ]}
        variant="info"
        primaryText="Change Password"
        secondaryText="Remind me later"
        onPrimary={async () => {
          // Navigate to change password screen
          // Flag will be set only when password is successfully changed
          setShowPasswordChangePrompt(false);
          router.push("/account-security/change-password");
        }}
        onSecondary={async () => {
          // "Remind me later" - explicitly do NOT set the flag
          // This ensures the prompt will show again on next login
          // The flag will only be set when password is successfully changed
          setShowPasswordChangePrompt(false);
        }}
        allowBackdropClose={true}
        colors={colors}
      />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 50,
    alignItems: "flex-start",
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1976D2",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#333333",

    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  notificationContainer: {
    width: 40,
    alignItems: "flex-end",
  },
  notificationBell: {
    width: 40,
    height: 40,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  welcomeSection: {
    gap: 8,
  },
  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  studentTag: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentTagText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  // Creative Search Bar Styles
  searchSection: {
    marginBottom: 20,
    position: "relative",
  },
  searchCard: {
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 0,
    marginHorizontal: 0,
  },
  searchContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  searchTextContainer: {
    flex: 1,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  searchSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    opacity: 0.9,
  },
  floatingIllustration: {
    position: "absolute",
    top: -60,
    right: -50,
    width: 230,
    height: 230,
    zIndex: 10,
  },
  illustrationImage: {
    width: "100%",
    height: "100%",
  },
  searchBarContainer: {
    alignItems: "flex-start",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "85%",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterButton: {
    marginLeft: 8,
  },
  // Creative Calendar Widget Styles
  calendarSection: {
    marginBottom: 0,
  },
  calendarCard: {
    borderRadius: 16,
    padding: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: "bold",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF4444",
  },
  flameEmoji: {
    fontSize: 16,
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dayColumn: {
    alignItems: "center",
    flex: 1,
  },
  dayName: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  todayDayName: {
    fontWeight: "600",
  },
  dateContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  todayDateContainer: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  dateNumber: {
    fontSize: 14,
    fontWeight: "500",
  },
  todayDateNumber: {
    fontWeight: "bold",
  },
  starIcon: {
    position: "absolute",
    top: -6,
    zIndex: 10,
  },
  timelineContainer: {
    position: "relative",
    height: 20,
    alignItems: "center",
  },
  timelineLine: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    height: 1,
  },
  timelineHandle: {
    position: "absolute",
    left: 0,
    top: 6,
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  // Creative Quick Links Styles
  quickLinksSection: {
    marginBottom: 20,
  },
  quickLinksTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  quickLinksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  quickLinkCard: {
    width: "48%",
    aspectRatio: 1.2,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  // Creative Class Cards Styles
  classCard: {
    borderRadius: 20,
    padding: 10,
    marginBottom: 12,
    position: "relative",
    overflow: "hidden",
    minHeight: 160,
    maxHeight: 220,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  roomBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
    gap: 4,
  },
  roomBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000000",
  },
  classTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 12,
    marginBottom: 4,
  },
  classTime: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 8,
  },
  teacherInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  teacherName: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  subjectIllustration: {
    position: "absolute",
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
    width: "100%",
    height: "100%",
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
    flexDirection: "row",
    justifyContent: "space-between",
  },
  listCardDetails: {
    gap: 4,
  },
  listCardDetail: {
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  loadingText: {
    opacity: 0.7,
  },
  errorText: {
    color: "#ff6b6b",
    opacity: 0.8,
  },
  errorHint: {
    color: "#ff6b6b",
    opacity: 0.6,
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
  emptyText: {
    opacity: 0.6,
    fontStyle: "italic",
  },
  // Events Section Styles
  eventsSection: {
    marginTop: 24,
    gap: 20,
  },
  eventsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  eventsTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  eventsHeaderLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  eventContainer: {
    position: "relative",
    marginBottom: 8,
  },
  eventCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    minHeight: 120,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 2,
  },
  eventImageContainer: {
    position: "relative",
    width: 100,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  eventTag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  eventTagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  eventContent: {
    flex: 1,
    gap: 8,
    justifyContent: "flex-start",
  },
  eventTitleRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flexWrap: "wrap",
    lineHeight: 20,
  },
  eventDateTag: {
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  eventDateText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  eventDescription: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
    marginTop: 4,
  },
  eventAdditionalInfo: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: -8,
    marginHorizontal: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1,
  },
  eventAdditionalInfoText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  // Unique Creative Announcements Section Styles
  announcementsSection: {
    marginTop: 24,
    gap: 20,
  },
  announcementsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  announcementsHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  announcementsTitle: {
    fontSize: 28,
    fontWeight: "bold",
    flex: 1,
  },
  announcementsHeaderAccent: {
    width: 60,
    height: 4,
    backgroundColor: "#007AFF",
    borderRadius: 2,
  },
  announcementWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  announcementTypeBadge: {
    position: "absolute",
    top: -8,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 3,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  announcementTypeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  announcementCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
  },
  announcementCardContent: {
    gap: 16,
  },
  announcementCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingTop: 8,
  },
  announcementCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
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
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  announcementCardTime: {
    fontSize: 12,
    fontWeight: "500",
  },
  announcementCardText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  },
  announcementCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  announcementCardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  announcementCardActionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  announcementCardPriority: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  announcementCardPriorityText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  announcementLoadingContainer: {
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  announcementLoadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  announcementLoadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  announcementErrorContainer: {
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  announcementErrorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  announcementErrorText: {
    fontSize: 18,
    color: "#FF3B30",
    fontWeight: "bold",
    textAlign: "center",
  },
  announcementErrorSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  announcementEmptyContainer: {
    alignItems: "center",
    padding: 60,
    gap: 20,
  },
  announcementEmptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  announcementEmptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  announcementEmptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  // Creative Alert Overlay Styles
  alertOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  alertContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 25,
    overflow: "hidden",
  },
  alertHeader: {
    backgroundColor: "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  alertHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  alertHeaderContent: {
    flex: 1,
    gap: 2,
  },
  alertHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  alertHeaderSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  alertCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  alertContent: {
    padding: 24,
    gap: 20,
  },
  alertMainCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#FFF8F5",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#FFE5E0",
  },
  alertIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  alertIconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6B35",
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
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  alertMainMessage: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 22,
  },
  alertSecondaryMessage: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },
  alertActionSection: {
    gap: 12,
  },
  alertActionIntro: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    fontWeight: "500",
  },
  alertActionButton: {
    backgroundColor: "#1877F2",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#1877F2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  alertActionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  alertActionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  alertFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  alertFooterIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F0FFF4",
    alignItems: "center",
    justifyContent: "center",
  },
  alertFooterText: {
    fontSize: 14,
    color: "#34C759",
    fontWeight: "600",
  },
  testAlertButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  testAlertButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  testBirthdayButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  testBirthdayButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  debugText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  // Birthday Popup Styles
  birthdayOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  birthdayContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    marginHorizontal: 40,
    alignItems: "center",
    shadowColor: "#000",
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
    alignItems: "center",
    position: "relative",
  },
  birthdayCakeBase: {
    width: 80,
    height: 50,
    backgroundColor: "#87CEEB",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4682B4",
  },
  birthdayCakeTop: {
    width: 70,
    height: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    marginTop: -5,
    borderWidth: 2,
    borderColor: "#4682B4",
  },
  birthdayCandle: {
    width: 4,
    height: 20,
    backgroundColor: "#FFB6C1",
    borderRadius: 2,
    marginTop: -15,
    alignItems: "center",
  },
  birthdayFlame: {
    width: 6,
    height: 8,
    backgroundColor: "#FFD700",
    borderRadius: 3,
    marginTop: -2,
  },
  birthdayContent: {
    alignItems: "center",
    marginBottom: 20,
  },
  birthdayTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3A8A",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 30,
  },
  birthdayMessage: {
    fontSize: 16,
    color: "#1E3A8A",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  birthdaySender: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E3A8A",
    textAlign: "center",
  },
  birthdayCloseButton: {
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    alignItems: "center",
  },
  birthdayCloseButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Event indicators and dropdown styles
  eventDot: {
    position: "absolute",
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FF3B30",
  },
  eventDropdown: {
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventDropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  eventDropdownTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  eventDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    gap: 12,
  },
  eventDropdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
  },
  eventDropdownContent: {
    flex: 1,
    gap: 4,
  },
  eventDropdownItemTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  eventDropdownItemDate: {
    fontSize: 12,
  },
  // Network Indicator
  networkIndicator: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "#E74C3C",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  networkIndicatorText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
