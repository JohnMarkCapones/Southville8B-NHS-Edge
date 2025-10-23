import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AnnouncementsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const announcements = useMemo(
    () => [
      {
        title: 'Medical mission volunteers needed',
        description: 'Sign up at the clinic office before October 28 to assist with patient intake and triage.',
        posted: 'Posted 2 hours ago',
      },
      {
        title: 'P.E. uniforms now available',
        description: 'Sizes S-XL ready for pickup at the gymnasium from 9 AM to 4 PM daily.',
        posted: 'Posted yesterday',
      },
      {
        title: 'Library extended hours',
        description: 'The library will stay open until 9 PM during exam week. Remember to bring your ID.',
        posted: 'Posted 3 days ago',
      },
    ],
    [],
  );

  const reminders = useMemo(
    () => [
      'Always bring your community ID when entering the campus.',
      'Grades for the midterm period will be released on Friday at 5 PM.',
      'Check your Southville email for scholarship renewal documents.',
    ],
    [],
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <ThemedView style={styles.section}>
        <ThemedText type="title">Latest announcements</ThemedText>
        {announcements.map(({ title, description, posted }) => (
          <View key={title} style={[styles.card, { borderColor: colors.icon }]}>
            <ThemedText type="subtitle">{title}</ThemedText>
            <ThemedText type="default" style={styles.description}>
              {description}
            </ThemedText>
            <ThemedText type="default" style={styles.meta}>{posted}</ThemedText>
          </View>
        ))}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="title">Reminders</ThemedText>
        {reminders.map((reminder) => (
          <View key={reminder} style={[styles.card, { borderColor: colors.icon }]}>
            <ThemedText type="default">{reminder}</ThemedText>
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
  section: {
    gap: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  description: {
    lineHeight: 22,
  },
  meta: {
    opacity: 0.6,
    fontSize: 13,
  },
});
