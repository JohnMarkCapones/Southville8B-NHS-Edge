import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ScheduleScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const schedule = useMemo(
    () => [
      {
        day: 'Monday',
        sessions: [
          { time: '08:00 - 09:30', course: 'Biology 201', location: 'Room 4B', instructor: 'Dr. Santos' },
          { time: '10:00 - 11:30', course: 'Statistics 102', location: 'Lab 2A', instructor: 'Prof. Lee' },
        ],
      },
      {
        day: 'Tuesday',
        sessions: [
          { time: '09:00 - 10:30', course: 'Philippine History', location: 'Room 3C', instructor: 'Ms. Dela Cruz' },
          { time: '01:00 - 02:30', course: 'Technical Writing', location: 'Room 5A', instructor: 'Mr. Gomez' },
        ],
      },
      {
        day: 'Wednesday',
        sessions: [
          { time: '08:00 - 09:30', course: 'Biology 201 (Lab)', location: 'Science Lab', instructor: 'Dr. Santos' },
          { time: '02:45 - 04:00', course: 'Community Extension', location: 'Field Office', instructor: 'Ms. Torres' },
        ],
      },
    ],
    [],
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      {schedule.map(({ day, sessions }) => (
        <ThemedView key={day} style={styles.dayCard}>
          <ThemedText type="subtitle">{day}</ThemedText>
          {sessions.map(({ time, course, location, instructor }) => (
            <View key={`${day}-${time}`} style={[styles.sessionCard, { borderColor: colors.icon }]}>
              <ThemedText type="defaultSemiBold">{course}</ThemedText>
              <ThemedText type="default">{time}</ThemedText>
              <ThemedText type="default" style={styles.sessionDetail}>
                {location} • {instructor}
              </ThemedText>
            </View>
          ))}
        </ThemedView>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  dayCard: {
    gap: 16,
  },
  sessionCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  sessionDetail: {
    opacity: 0.8,
  },
});
