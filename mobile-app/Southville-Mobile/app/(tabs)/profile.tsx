import { useRouter } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useAuthErrorHandler } from "@/hooks/use-auth-error-handler";
import { useCurrentUser } from "@/hooks/use-current-user";
import { clearAuthSession } from "@/services/auth";
import { useNetworkRefetch } from "@/hooks/use-network-refetch";
import { useStudentRanking } from "@/hooks/use-student-ranking";
import { useLoginStreak } from "@/hooks/use-login-streak";

export default function ProfileScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];
  const router = useRouter();
  const {
    isLoggingOut: globalLoggingOut,
    setIsLoggingOut: setGlobalLoggingOut,
    signOut,
  } = useAuthSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch current user data
  const {
    user,
    loading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useCurrentUser();

  // Fetch student ranking from Supabase
  const {
    ranking,
    loading: rankingLoading,
    refetch: refetchRanking,
  } = useStudentRanking(user?.student?.id);

  // Fetch login streak
  const { streak, refetch: refetchStreak } = useLoginStreak();

  // Auth error handling
  const { handleAuthError } = useAuthErrorHandler();

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchUser();
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchUser]);

  // Auto-redirect to login on authentication errors
  useEffect(() => {
    console.log("[PROFILE][AUTO-REDIRECT] Checking for auth errors", {
      isRedirecting,
      globalLoggingOut,
      hasError: !!userError,
    });

    // Skip if already redirecting OR if logout is in progress
    if (isRedirecting || globalLoggingOut) {
      console.log(
        "[PROFILE][AUTO-REDIRECT] Skipping - already redirecting or logging out"
      );
      return;
    }

    // Check for authentication error using centralized handler
    if (userError) {
      const wasRedirected = handleAuthError(userError);
      if (wasRedirected) {
        console.log(
          "[PROFILE][AUTO-REDIRECT] Auth error handled - redirecting to login"
        );
        setIsRedirecting(true);
      }
    }
  }, [userError, router, isRedirecting, globalLoggingOut, handleAuthError]);

  // Auto-refetch data when network connectivity is restored
  useNetworkRefetch([refetchUser, refetchRanking, refetchStreak]);

  const handleLogout = useCallback(async () => {
    // Prevent multiple logout attempts
    if (isLoggingOut) {
      console.log("[LOGOUT] Already logging out, skipping");
      return;
    }

    console.log("[LOGOUT] Starting logout process");

    // STEP 1: Immediately set auth status to unauthenticated (prevents API calls)
    signOut();

    // STEP 2: Set flags to prevent re-entry
    setIsLoggingOut(true);
    setGlobalLoggingOut(true);

    try {
      console.log("[LOGOUT] Clearing auth session");
      // STEP 3: Clear authentication session (tokens from storage)
      await clearAuthSession();

      console.log(
        "[LOGOUT] Auth session cleared, waiting for smooth transition"
      );
      // STEP 4: Small delay for better UX (loading overlay visible)
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("[LOGOUT] Navigating to login");
      // STEP 5: Navigate to login screen
      router.replace("/login");
      console.log("[LOGOUT] Navigation initiated");
    } catch (error) {
      console.error("[LOGOUT] Error:", error);
    } finally {
      // STEP 6: Always reset flags after a delay to prevent hanging
      setTimeout(() => {
        console.log("[LOGOUT] Resetting flags");
        setIsLoggingOut(false);
        setGlobalLoggingOut(false);
      }, 2000); // 2 second delay to ensure navigation completes
    }
  }, [isLoggingOut, router, setGlobalLoggingOut, signOut]);

  // Helper function to get avatar initial
  const getAvatarInitial = () => {
    if (user?.full_name) {
      return user.full_name.charAt(0).toUpperCase();
    }
    if (user?.student?.first_name) {
      return user.student.first_name.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Helper function to get display name
  const getDisplayName = () => {
    if (user?.full_name) {
      return user.full_name;
    }
    if (user?.student?.first_name && user?.student?.last_name) {
      return `${user.student.first_name} ${user.student.last_name}`;
    }
    return "User";
  };

  // Helper function to get section name
  const getSectionName = () => {
    // Check multiple possible paths for section data
    // Backend may return 'section' (singular) or 'sections' (plural, could be array or object)
    const section =
      user?.student?.section ||
      (Array.isArray(user?.student?.sections)
        ? user?.student?.sections[0]
        : user?.student?.sections);
    return section?.name || "N/A";
  };

  const getRankingPrimaryValue = () => {
    if (rankingLoading) {
      return "...";
    }

    if (!ranking?.rank) {
      return "N/A";
    }

    return `#${ranking.rank}`;
  };

  const getRankingCohortLabel = () => {
    if (rankingLoading) {
      return "Computing cohort...";
    }

    if (ranking?.total_students) {
      return `of ${ranking.total_students} students`;
    }

    return null;
  };

  const getRankingPeriodLabel = () => {
    if (!ranking) {
      return null;
    }

    const label = ranking.period_name ?? ranking.quarter ?? null;
    if (!label && !ranking.school_year) {
      return null;
    }

    if (!label) {
      return ranking.school_year;
    }

    if (!ranking.school_year) {
      return label;
    }

    return `${label} ${ranking.school_year}`;
  };

  // Navigation handlers
  const handlePersonalInfo = useCallback(() => {
    router.push("/personal-information");
  }, [router]);

  const handleAccountSecurity = useCallback(() => {
    router.push("/account-security");
  }, [router]);

  const handleSchoolInfo = useCallback(() => {
    router.push("/school-information");
  }, [router]);

  const rankingPrimaryValue = getRankingPrimaryValue();
  const rankingCohortLabel = getRankingCohortLabel();
  const rankingPeriodLabel = getRankingPeriodLabel();

  if (userLoading) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText
            type="default"
            style={[styles.loadingText, { color: colors.icon }]}
          >
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
        contentContainerStyle={styles.content}
      >
        <ThemedView
          style={[
            styles.errorCard,
            {
              backgroundColor: isDark ? "rgba(255, 107, 107, 0.1)" : "#FFEBEE",
              borderColor: isDark ? "rgba(255, 107, 107, 0.3)" : "#FFCDD2",
            },
          ]}
        >
          <ThemedText
            type="default"
            style={[styles.errorText, { color: "#F44336" }]}
          >
            Failed to load profile: {userError}
          </ThemedText>
        </ThemedView>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        {/* Blue Gradient Header Section */}
        <View
          style={[
            styles.headerSection,
            {
              backgroundColor: isDark ? "rgba(91, 163, 208, 0.8)" : "#5BA3D0",
              borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "transparent",
              borderWidth: isDark ? 1 : 0,
            },
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(255, 255, 255, 0.2)",
                    borderColor: isDark
                      ? "rgba(255, 255, 255, 0.3)"
                      : "rgba(255, 255, 255, 0.3)",
                  },
                ]}
              >
                <Text style={styles.avatarText}>{getAvatarInitial()}</Text>
              </View>
            </View>

            <View style={styles.headerInfo}>
              {/* Streak Badge */}
              <View
                style={[
                  styles.streakBadge,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(255, 255, 255, 0.2)",
                  },
                ]}
              >
                <Ionicons name="trophy-outline" size={16} color="#FFD700" />
                <Text style={styles.streakText}>Highest {streak} streak</Text>
              </View>

              {/* Name */}
              <Text style={styles.userName}>{getDisplayName()}</Text>

              {/* Email */}
              <Text style={styles.userEmail}>{user?.email || "No email"}</Text>

              {/* Student Role */}
              <Text
                style={[
                  styles.userRole,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(255, 255, 255, 0.2)",
                  },
                ]}
              >
                Student
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Cards Row */}
        <View
          style={[
            styles.statsContainer,
            {
              backgroundColor: isDark ? "#2A2A2A" : "#FFFFFF",
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(0, 0, 0, 0.1)",
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {user?.student?.grade_level || "10"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>
              Grade
            </Text>
          </View>
          <View
            style={[
              styles.statDivider,
              {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.2)"
                  : "#E0E0E0",
              },
            ]}
          />
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {getSectionName()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>
              Section
            </Text>
          </View>
          <View
            style={[
              styles.statDivider,
              {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.2)"
                  : "#E0E0E0",
              },
            ]}
          />
          <View style={[styles.statCard, styles.statCardRanking]}>
            <Text style={[styles.rankValue, { color: colors.text }]}>
              {rankingPrimaryValue}
            </Text>
            <Text style={[styles.rankLabel, { color: colors.icon }]}>Ranking</Text>
            {rankingCohortLabel && (
              <Text style={[styles.rankContextText, { color: colors.icon }]}>
                {rankingCohortLabel}
              </Text>
            )}
            {rankingPeriodLabel && (
              <Text style={[styles.rankPeriod, { color: colors.icon }]}>
                {rankingPeriodLabel}
              </Text>
            )}
          </View>
        </View>

        {/* Personal Section Container */}
        <View
          style={[
            styles.personalSection,
            {
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF",
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(0, 0, 0, 0.1)",
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Personal
          </Text>

          {/* Personal Information */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePersonalInfo}
          >
            <View
              style={[
                styles.menuIcon,
                {
                  backgroundColor: isDark
                    ? "rgba(25, 118, 210, 0.2)"
                    : "#E3F2FD",
                },
              ]}
            >
              <Ionicons name="person-outline" size={20} color={colors.tint} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>
                <Text style={[styles.menuTitleBlue, { color: colors.tint }]}>
                  Personal{" "}
                </Text>
                <Text style={[styles.menuTitleBlack, { color: colors.text }]}>
                  Information
                </Text>
              </Text>
              <Text style={[styles.menuSubtitle, { color: colors.icon }]}>
                Detail your personal data
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={colors.icon}
            />
          </TouchableOpacity>

          {/* Account Security */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleAccountSecurity}
          >
            <View
              style={[
                styles.menuIcon,
                {
                  backgroundColor: isDark
                    ? "rgba(25, 118, 210, 0.2)"
                    : "#E3F2FD",
                },
              ]}
            >
              <Ionicons name="shield-outline" size={20} color={colors.tint} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>
                <Text style={[styles.menuTitleBlue, { color: colors.tint }]}>
                  Account{" "}
                </Text>
                <Text style={[styles.menuTitleBlack, { color: colors.text }]}>
                  Security
                </Text>
              </Text>
              <Text style={[styles.menuSubtitle, { color: colors.icon }]}>
                Manage your account security
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={colors.icon}
            />
          </TouchableOpacity>

          {/* School Information */}
          <TouchableOpacity style={styles.menuItem} onPress={handleSchoolInfo}>
            <View
              style={[
                styles.menuIcon,
                {
                  backgroundColor: isDark
                    ? "rgba(25, 118, 210, 0.2)"
                    : "#E3F2FD",
                },
              ]}
            >
              <Ionicons name="school-outline" size={20} color={colors.tint} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>
                <Text style={[styles.menuTitleBlue, { color: colors.tint }]}>
                  School{" "}
                </Text>
                <Text style={[styles.menuTitleBlack, { color: colors.text }]}>
                  Information
                </Text>
              </Text>
              <Text style={[styles.menuSubtitle, { color: colors.icon }]}>
                Check school informations
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={colors.icon}
            />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: isDark ? "rgba(255, 107, 107, 0.8)" : "#FF6B6B",
              borderColor: isDark ? "rgba(255, 107, 107, 0.3)" : "transparent",
              borderWidth: isDark ? 1 : 0,
              opacity: isLoggingOut ? 0.6 : 1,
            },
          ]}
          onPress={handleLogout}
          accessibilityRole="button"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          )}
          <Text style={styles.logoutText}>
            {isLoggingOut ? "LOGGING OUT..." : "LOGOUT"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={userLoading || isLoggingOut || isRedirecting}
        variant="heart"
      />
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
    paddingTop: 50, // Account for status bar
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerInfo: {
    flex: 1,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: "flex-start",
    gap: 6,
  },
  streakText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  userEmail: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  userRole: {
    fontSize: 10,
    color: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontWeight: "600",
    alignSelf: "flex-start",
  },

  // Stats Cards Row
  statsContainer: {
    marginHorizontal: 20,
    marginTop: -30, // Pull up to overlap with blue header
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  statCardRanking: {
    alignItems: "flex-start",
    paddingHorizontal: 8,
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  statSubtitle: {
    fontSize: 10,
    fontWeight: "400",
    marginTop: 2,
    opacity: 0.7,
  },
  rankValue: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 2,
  },
  rankLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  rankContextText: {
    fontSize: 12,
    marginTop: 4,
  },
  rankPeriod: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.8,
  },

  // Personal Section Container
  personalSection: {
    marginHorizontal: 20,
    marginTop: 20, // Reduced margin since stats container overlaps
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  menuContent: {
    flex: 1,
    gap: 4,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  menuTitleBlue: {
    // color handled dynamically
  },
  menuTitleBlack: {
    // color handled dynamically
  },
  menuSubtitle: {
    fontSize: 14,
  },

  // Logout Button
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  // Loading and Error States
  loadingContainer: {
    alignItems: "center",
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
    alignItems: "center",
  },
  errorText: {
    textAlign: "center",
    opacity: 0.7,
  },
});
