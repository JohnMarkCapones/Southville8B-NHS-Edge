import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function PlaceholderExploreScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ThemedText type="subtitle">Screen inactive</ThemedText>
        <ThemedText>
          The Explore screen has been replaced by the new navigation structure. This file remains
          only as a placeholder and can be safely removed once no longer needed for reference.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    gap: 12,
  },
});
