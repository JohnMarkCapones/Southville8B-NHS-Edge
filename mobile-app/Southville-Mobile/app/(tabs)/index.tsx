import { useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const quickLinks = useMemo<Array<{ label: string; route: Href }>>(
    () => [
      { label: 'Schedule', route: '/(tabs)/schedule' },
      { label: 'Announcements', route: '/(tabs)/announcements' },
      { label: 'Grades', route: '/(tabs)/grades' },
      { label: 'Profile', route: '/(tabs)/profile' },
    ],
    [],
  );

  const nextClasses = useMemo(
    () => [
      { time: '08:00 AM', title: 'Biology 201', room: 'Room 4B' },
      { time: '10:15 AM', title: 'Statistics 102', room: 'Lab 2A' },
    ],
    [],
  );

  const headlineAnnouncements = useMemo(
    () => [
      'Campus clean-up drive this Saturday at 7AM.',
      'Submission for science fair proposals closes on Friday.',
    ],
    [],
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
  <ThemedView style={[styles.greetingCard, { borderColor: colors.icon }]}>
        <ThemedText type="title">Good day, Alex!</ThemedText>
        <ThemedText type="default">Here is what is happening around campus today.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Quick links</ThemedText>
        <View style={styles.quickLinksRow}>
          {quickLinks.map(({ label, route }) => (
            <TouchableOpacity
              key={label}
              style={[styles.quickLinkCard, { borderColor: colors.icon }]}
              onPress={() => router.push(route)}>
              <ThemedText style={styles.quickLinkText}>{label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Upcoming classes</ThemedText>
        {nextClasses.map(({ time, title, room }) => (
          <View key={time} style={[styles.listCard, { borderColor: colors.icon }]}>
            <View style={styles.listCardHeader}>
              <ThemedText type="defaultSemiBold">{title}</ThemedText>
              <ThemedText type="default">{time}</ThemedText>
            </View>
            <ThemedText type="default" style={styles.listCardDetail}>
              Room: {room}
            </ThemedText>
          </View>
        ))}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Announcements</ThemedText>
        {headlineAnnouncements.map((announcement) => (
          <View key={announcement} style={[styles.listCard, { borderColor: colors.icon }]}>
            <ThemedText type="default">{announcement}</ThemedText>
          </View>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
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
  quickLinksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickLinkCard: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickLinkText: {
    fontWeight: '600',
    letterSpacing: 0.4,
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
  listCardDetail: {
    opacity: 0.8,
  },
});
