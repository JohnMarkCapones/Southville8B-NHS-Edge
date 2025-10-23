import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <ThemedView style={[styles.profileHeader, { borderColor: colors.icon }]}>
        <View style={styles.avatar}>
          <ThemedText type="title">A</ThemedText>
        </View>
        <View style={styles.profileInfo}>
          <ThemedText type="title">Alex Rivera</ThemedText>
          <ThemedText type="default">Student ID: 2025-1183</ThemedText>
          <ThemedText type="default">Community: Southville 8B</ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Contact details</ThemedText>
        <ThemedText type="default">Email: alex.rivera@southville8b.edu</ThemedText>
        <ThemedText type="default">Mobile: +63 912 345 6789</ThemedText>
        <ThemedText type="default">Address: Phase 2, Blk 15 Lot 12</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Settings</ThemedText>
        <ThemedText type="default">Notifications: Enabled</ThemedText>
        <ThemedText type="default">Language: English</ThemedText>
        <ThemedText type="default">Theme: {colorScheme === 'dark' ? 'Dark' : 'Light'} mode</ThemedText>
      </ThemedView>

      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: colors.icon }]}
        onPress={() => router.replace('/')}
        accessibilityRole="button">
        <ThemedText style={styles.logoutText}>Log out</ThemedText>
      </TouchableOpacity>
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
  profileHeader: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
  },
  profileInfo: {
    gap: 6,
  },
  section: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    gap: 8,
  },
  logoutButton: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
