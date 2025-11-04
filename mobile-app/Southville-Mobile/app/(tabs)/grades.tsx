import { useState, useMemo, useCallback, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";

import { ReusableHeader } from "@/components/ui/reusable-header";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { useAuthErrorHandler } from "@/hooks/use-auth-error-handler";
import { useMyGwa } from "@/hooks/use-my-gwa";
import { GradingPeriod } from "@/lib/types/gwa";
import { useNetworkRefetch } from "@/hooks/use-network-refetch";

export default function GradesScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];

  // Filter states
  const [selectedQuarter, setSelectedQuarter] = useState<GradingPeriod | "All">(
    "All"
  );
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  // Build filter params
  const filterParams = useMemo(() => {
    const params: any = {};
    if (selectedQuarter !== "All") {
      params.grading_period = selectedQuarter;
    }
    if (selectedSchoolYear) {
      params.school_year = selectedSchoolYear;
    }
    console.log("[GradesScreen] Filter params updated:", params);
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
      console.error("Error refreshing grades:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, filterParams]);

  // Auto-redirect to login on authentication errors
  useEffect(() => {
    console.log("[GRADES][AUTO-REDIRECT] Checking for auth errors", {
      hasError: !!error,
    });

    // Check for authentication error using centralized handler
    if (error) {
      const wasRedirected = handleAuthError(error);
      if (wasRedirected) {
        console.log(
          "[GRADES][AUTO-REDIRECT] Auth error handled - redirecting to login"
        );
      }
    }
  }, [error, handleAuthError]);

  // Auto-refetch data when network connectivity is restored
  useNetworkRefetch([() => refetch(filterParams)]);

  // Get unique school years for dropdown
  const schoolYears = useMemo(() => {
    const years = [...new Set(gwaRecords.map((record) => record.school_year))];
    return years.sort().reverse(); // Most recent first
  }, [gwaRecords]);

  // Handle filter changes
  const handleQuarterChange = useCallback((quarter: GradingPeriod | "All") => {
    console.log("[GradesScreen] Quarter changed to:", quarter);
    setSelectedQuarter(quarter);
  }, []);

  const handleSchoolYearChange = useCallback((year: string) => {
    console.log("[GradesScreen] School year changed to:", year);
    setSelectedSchoolYear(year);
  }, []);

  // Get creative gradient colors for cards
  const getCardGradient = (gwa: number) => {
    if (gwa >= 97) return ["#3498DB", "#5DADE2"]; // Blue gradient - Excellent / Outstanding
    if (gwa >= 95) return ["#27AE60", "#52BE80"]; // Green gradient - Very Good
    if (gwa >= 90) return ["#2ECC71", "#58D68D"]; // Light Green gradient - Good / Above Average
    if (gwa >= 80) return ["#F1C40F", "#F7DC6F"]; // Yellow gradient - Satisfactory / Average
    if (gwa >= 75) return ["#E67E22", "#EB984E"]; // Orange gradient - Fair / Below Average
    return ["#E74C3C", "#EC7063"]; // Red gradient - Failing / Needs Improvement
  };

  // Get emoji based on GWA score
  const getGwaEmoji = (gwa: number) => {
    if (gwa >= 97) return "🌟"; // Excellent / Outstanding
    if (gwa >= 95) return "🏆"; // Very Good
    if (gwa >= 90) return "🥇"; // Good / Above Average
    if (gwa >= 80) return "🥈"; // Satisfactory / Average
    if (gwa >= 75) return "📖"; // Fair / Below Average
    return "💪"; // Failing / Needs Improvement
  };

  // Get motivational message
  const getMotivationalMessage = (gwa: number) => {
    if (gwa >= 97) return "Outstanding! You're truly exceptional! 🌟";
    if (gwa >= 95) return "Very Good! You're doing amazing work! 🏆";
    if (gwa >= 90) return "Great job! Keep up the excellent performance! 🥇";
    if (gwa >= 80) return "Good progress! Keep pushing forward! 🥈";
    if (gwa >= 75) return "You're improving! Keep working hard! 📖";
    return "Don't give up! Keep studying and you'll get there! 💪";
  };

  // Get motivational quote
  const getMotivationalQuote = (gwa: number) => {
    if (gwa >= 97) return "Exceptional achievement! You're truly inspiring!";
    if (gwa >= 95) return "Outstanding! You're setting a high standard!";
    if (gwa >= 90) return "Excellent work! Your dedication shows!";
    if (gwa >= 80) return "You're doing great! Keep up the momentum!";
    if (gwa >= 75) return "Progress, not perfection. You're getting there!";
    return "Every expert was once a beginner. Keep going!";
  };

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
        }
      >
        {/* Creative Header Section */}
        <View
          style={[
            styles.creativeHeader,
            {
              backgroundColor: isDark
                ? "rgba(25, 118, 210, 0.1)"
                : "rgba(227, 242, 253, 0.8)",
              borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "transparent",
              borderWidth: isDark ? 1 : 0,
            },
          ]}
        >
          <View style={styles.headerIllustration}>
            <Ionicons name="school-outline" size={40} color={colors.tint} />
            <View style={styles.floatingStars}>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.star}>🌟</Text>
              <Text style={styles.star}>✨</Text>
            </View>
          </View>
          <Text style={[styles.headerTitle, { color: colors.tint }]}>
            Your Academic Journey
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.icon }]}>
            Track your progress and celebrate your achievements! 🎓
          </Text>
        </View>

        {/* Creative Filter Section */}
        <View
          style={[
            styles.filterCard,
            {
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF",
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(0, 0, 0, 0.1)",
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.filterHeader}>
            <Ionicons name="filter-outline" size={20} color={colors.tint} />
            <Text style={[styles.filterTitle, { color: colors.tint }]}>
              Filter Your Grades
            </Text>
          </View>

          {/* Quarter Filter */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>
              📅 Quarter:
            </Text>
            <View style={styles.chipContainer}>
              {(
                [
                  "All",
                  GradingPeriod.Q1,
                  GradingPeriod.Q2,
                  GradingPeriod.Q3,
                  GradingPeriod.Q4,
                ] as const
              ).map((quarter) => (
                <TouchableOpacity
                  key={quarter}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        selectedQuarter === quarter
                          ? isDark
                            ? "#404040"
                            : colors.tint
                          : isDark
                          ? "rgba(255, 255, 255, 0.1)"
                          : "#F5F5F5",
                      borderColor:
                        selectedQuarter === quarter
                          ? isDark
                            ? "#404040"
                            : colors.tint
                          : isDark
                          ? "rgba(255, 255, 255, 0.2)"
                          : "#E0E0E0",
                    },
                  ]}
                  onPress={() => handleQuarterChange(quarter)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color:
                          selectedQuarter === quarter ? "#FFFFFF" : colors.text,
                      },
                    ]}
                  >
                    {quarter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* School Year Filter */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>
              🎓 School Year:
            </Text>
            <View style={styles.chipContainer}>
              {schoolYears.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        selectedSchoolYear === year
                          ? isDark
                            ? "#404040"
                            : colors.tint
                          : isDark
                          ? "rgba(255, 255, 255, 0.1)"
                          : "#F5F5F5",
                      borderColor:
                        selectedSchoolYear === year
                          ? isDark
                            ? "#404040"
                            : colors.tint
                          : isDark
                          ? "rgba(255, 255, 255, 0.2)"
                          : "#E0E0E0",
                    },
                  ]}
                  onPress={() => handleSchoolYearChange(year)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color:
                          selectedSchoolYear === year ? "#FFFFFF" : colors.text,
                      },
                    ]}
                  >
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
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor: isDark
                  ? "rgba(255, 107, 107, 0.1)"
                  : "#FFEBEE",
                borderColor: isDark ? "rgba(255, 107, 107, 0.3)" : "#FFCDD2",
              },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
            <Text style={[styles.errorText, { color: "#F44336" }]}>
              Oops! Something went wrong 😅
            </Text>
            <Text style={[styles.errorSubtext, { color: colors.icon }]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.tint }]}
              onPress={() => refetch()}
            >
              <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : gwaRecords.length > 0 ? (
          gwaRecords.map((record, index) => {
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
                    borderColor: isDark
                      ? "rgba(255, 255, 255, 0.3)"
                      : "rgba(0, 0, 0, 0.1)",
                    borderWidth: 1,
                  },
                ]}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.quarterBadge}>
                    <Text style={styles.quarterText}>
                      {record.grading_period}
                    </Text>
                  </View>
                  <View style={styles.emojiContainer}>
                    <Text style={styles.emoji}>{emoji}</Text>
                  </View>
                </View>

                {/* GWA Score Section */}
                <View style={styles.gwaScoreSection}>
                  <View style={styles.scoreContainer}>
                    <Text style={styles.gwaNumber}>
                      {record.gwa.toFixed(2)}
                    </Text>
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

                {/* Motivational Quote */}
                <Text style={styles.motivationalQuote}>
                  {getMotivationalQuote(record.gwa)}
                </Text>

                {/* Remarks */}
                {record.remarks && (
                  <View style={styles.remarksContainer}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.remarksText}>
                      Remarks: {record.remarks}
                    </Text>
                  </View>
                )}
              </Animated.View>
            );
          })
        ) : (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "#F8F9FA",
                borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "#E9ECEF",
              },
            ]}
          >
            <Ionicons name="book-outline" size={64} color={colors.icon} />
            <Text style={[styles.emptyTitle, { color: colors.icon }]}>
              No Grades Yet 📚
            </Text>
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
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 20,
    marginBottom: 10,
    position: "relative",
  },
  headerIllustration: {
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  floatingStars: {
    position: "absolute",
    top: -20,
    right: -25,
    flexDirection: "row",
    gap: 6,
  },
  star: {
    fontSize: 16,
    opacity: 0.8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  // Filter Card
  filterCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 10,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    fontWeight: "600",
  },

  // Loading State
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
  },

  // Error State
  errorCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    gap: 16,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  // GWA Cards
  gwaCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 16,
    position: "relative",
    overflow: "visible",
    borderWidth: 1,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  quarterBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  quarterText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  emojiContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 8,
  },
  emoji: {
    fontSize: 24,
  },

  // GWA Score Section
  gwaScoreSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: "center",
  },
  gwaNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  gwaLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    opacity: 0.9,
  },
  schoolYearContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  schoolYear: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Honor Status
  honorStatusContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    alignSelf: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  honorText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Motivational Message
  motivationalMessage: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 6,
    opacity: 0.9,
  },
  // Motivational Quote
  motivationalQuote: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 10,
    opacity: 0.95,
    fontStyle: "italic",
    paddingHorizontal: 8,
    lineHeight: 18,
  },

  // Remarks
  remarksContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  remarksText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    opacity: 0.9,
    flex: 1,
  },

  // Empty State
  emptyCard: {
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    gap: 16,
    borderWidth: 2,
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
});
