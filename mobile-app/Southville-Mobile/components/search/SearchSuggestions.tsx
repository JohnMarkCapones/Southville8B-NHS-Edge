import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import { Colors } from "@/constants/theme";
import type {
  SuggestResponse,
  SuggestItem,
} from "@/hooks/use-search-suggestions";

type Props = {
  query: string;
  suggestions: SuggestResponse | null;
  loading: boolean;
  recent: string[];
  onSelect: (item: SuggestItem) => void;
  onSubmit: (q: string) => void;
  active?: boolean;
  onBeginSelect?: () => void;
};

export const SearchSuggestions = memo(function SearchSuggestions({
  query,
  suggestions,
  loading,
  recent,
  onSelect,
  onSubmit,
  active = true,
  onBeginSelect,
}: Props) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];

  const showRecent = (!query || query.trim().length < 2) && recent.length > 0;

  const hasAnyResults = useMemo(() => {
    if (!suggestions) return false;
    const { announcements, events, schedules } = suggestions;
    return (
      (announcements && announcements.length > 0) ||
      (events && events.length > 0) ||
      (schedules && schedules.length > 0)
    );
  }, [suggestions]);

  if (!active) return null;

  const Section = ({
    title,
    icon,
    items,
  }: {
    title: string;
    icon: any;
    items: SuggestItem[];
  }) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name={icon} size={14} color={colors.icon} />
          <Text style={[styles.sectionTitle, { color: colors.icon }]}>
            {title}
          </Text>
        </View>
        {items.map((it) => (
          <TouchableOpacity
            key={`${it.kind}-${it.id}`}
            style={styles.row}
            onPressIn={() => {
              onBeginSelect?.();
            }}
            onPress={() => {
              console.log("[SearchSuggestions] Row pressed", {
                id: it.id,
                kind: it.kind,
                title: it.title,
              });
              onSelect(it);
            }}
          >
            <Ionicons name={icon} size={16} color={colors.icon} />
            <View style={styles.rowText}>
              <Text
                style={[styles.rowTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {it.title}
              </Text>
              {it.subtitle ? (
                <Text
                  style={[styles.rowSubtitle, { color: colors.icon }]}
                  numberOfLines={1}
                >
                  {it.subtitle}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: isDark ? "#2A2A2A" : "#E5E7EB",
        },
      ]}
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={colors.icon} />
        </View>
      ) : (
        <ScrollView keyboardShouldPersistTaps="always" style={styles.scroll}>
          {showRecent && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={14} color={colors.icon} />
                <Text style={[styles.sectionTitle, { color: colors.icon }]}>
                  Recent
                </Text>
              </View>
              {recent.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={styles.row}
                  onPress={() => onSubmit(r)}
                >
                  <Ionicons name="search" size={16} color={colors.icon} />
                  <Text
                    style={[styles.rowTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {suggestions ? (
            <>
              <Section
                title="Announcements"
                icon="megaphone-outline"
                items={suggestions.announcements}
              />
              <Section
                title="Events"
                icon="calendar-outline"
                items={suggestions.events}
              />
              <Section
                title="My Schedule"
                icon="book-outline"
                items={suggestions.schedules}
              />
            </>
          ) : null}
          {!loading && !showRecent && !suggestions && (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.icon }]}>
                Start typing to search…
              </Text>
            </View>
          )}
          {!loading && !showRecent && suggestions && !hasAnyResults && (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.icon }]}>
                No results found
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
    marginHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    maxHeight: 320,
    overflow: "hidden",
  },
  scroll: { paddingVertical: 8 },
  loading: { padding: 12, alignItems: "center" },
  section: { paddingVertical: 6 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  sectionTitle: { fontSize: 12, color: "#666", fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 14, color: "#111" },
  rowSubtitle: { fontSize: 12, color: "#666", marginTop: 2 },
  empty: { padding: 12, alignItems: "center" },
  emptyText: { color: "#666" },
});
