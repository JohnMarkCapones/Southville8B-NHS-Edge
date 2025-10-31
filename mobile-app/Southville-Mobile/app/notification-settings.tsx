import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { useNavigationLoading } from '@/hooks/use-navigation-loading';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

export default function NotificationSettingsScreen() {
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [eventEnabled, setEventEnabled] = useState(false);
  const { isLoading, navigateBackWithLoading } = useNavigationLoading();
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { 
        backgroundColor: colors.background,
        borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#F0F0F0'
      }]}>
        <TouchableOpacity onPress={() => navigateBackWithLoading()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notification Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={[styles.description, { color: colors.icon }]}>
          Tell us the types of push notification you would like to get on this device. 
          You're free to change this at anytime
        </Text>

        <View style={[styles.settingItem, { 
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#F0F0F0'
        }]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>In-app notifications</Text>
            <Text style={[styles.settingSubtitle, { color: colors.icon }]}>
              Tanging di ko din alam meaning neto basta notif to
            </Text>
          </View>
          <Switch 
            value={inAppEnabled} 
            onValueChange={setInAppEnabled}
            trackColor={{ false: isDark ? '#404040' : '#E0E0E0', true: colors.tint }}
            thumbColor={inAppEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <View style={[styles.settingItem, { 
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#F0F0F0'
        }]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Schedule notifications</Text>
            <Text style={[styles.settingSubtitle, { color: colors.icon }]}>
              You will receive regularly an notification about your subject schedule
            </Text>
          </View>
          <Switch 
            value={scheduleEnabled} 
            onValueChange={setScheduleEnabled}
            trackColor={{ false: isDark ? '#404040' : '#E0E0E0', true: colors.tint }}
            thumbColor={scheduleEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <View style={[styles.settingItem, { 
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#F0F0F0'
        }]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Event notifications</Text>
            <Text style={[styles.settingSubtitle, { color: colors.icon }]}>
              You will receive regularly an notification about Events subject schedule
            </Text>
          </View>
          <Switch 
            value={eventEnabled} 
            onValueChange={setEventEnabled}
            trackColor={{ false: isDark ? '#404040' : '#E0E0E0', true: colors.tint }}
            thumbColor={eventEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </ScrollView>
      
      {/* Loading Overlay */}
      <LoadingOverlay visible={isLoading} variant="settings" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 24,
    marginBottom: 32,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
