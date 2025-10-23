import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function GradesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const gradeSummary = useMemo(
    () => [
      { subject: 'Biology 201', midterm: 91, final: 94, teacher: 'Dr. Santos' },
      { subject: 'Statistics 102', midterm: 88, final: 90, teacher: 'Prof. Lee' },
      { subject: 'Philippine History', midterm: 93, final: 92, teacher: 'Ms. Dela Cruz' },
      { subject: 'Technical Writing', midterm: 87, final: 89, teacher: 'Mr. Gomez' },
    ],
    [],
  );

  const computeAverage = (midterm: number, final: number) => Math.round((midterm + final) / 2);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Grade overview</ThemedText>
        <ThemedText type="default">
          Review your midterm and final standing for each subject this semester.
        </ThemedText>
      </ThemedView>

      {gradeSummary.map(({ subject, midterm, final, teacher }) => (
        <View key={subject} style={[styles.card, { borderColor: colors.icon }]}>
          <ThemedText type="subtitle">{subject}</ThemedText>
          <ThemedText type="default" style={styles.teacher}>
            Instructor: {teacher}
          </ThemedText>
          <View style={styles.gradeRow}>
            <View style={styles.gradeColumn}>
              <ThemedText type="defaultSemiBold">Midterm</ThemedText>
              <ThemedText type="title">{midterm}</ThemedText>
            </View>
            <View style={styles.gradeColumn}>
              <ThemedText type="defaultSemiBold">Final</ThemedText>
              <ThemedText type="title">{final}</ThemedText>
            </View>
            <View style={styles.gradeColumn}>
              <ThemedText type="defaultSemiBold">Average</ThemedText>
              <ThemedText type="title">{computeAverage(midterm, final)}</ThemedText>
            </View>
          </View>
        </View>
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
    gap: 24,
  },
  header: {
    gap: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  teacher: {
    opacity: 0.7,
  },
  gradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  gradeColumn: {
    flex: 1,
    gap: 4,
    alignItems: 'center',
  },
});
