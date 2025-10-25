import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { useNavigationLoading } from '@/hooks/use-navigation-loading';

export default function NotificationSettingsScreen() {
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [eventEnabled, setEventEnabled] = useState(false);
  const { isLoading, navigateBackWithLoading } = useNavigationLoading();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateBackWithLoading()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.description}>
          Tell us the types of push notification you would like to get on this device. 
          You're free to change this at anytime
        </Text>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>In-app notifications</Text>
            <Text style={styles.settingSubtitle}>
              Tanging di ko din alam meaning neto basta notif to
            </Text>
          </View>
          <Switch 
            value={inAppEnabled} 
            onValueChange={setInAppEnabled}
            trackColor={{ false: '#E0E0E0', true: '#1976D2' }}
            thumbColor={inAppEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Schedule notifications</Text>
            <Text style={styles.settingSubtitle}>
              You will receive regularly an notification about your subject schedule
            </Text>
          </View>
          <Switch 
            value={scheduleEnabled} 
            onValueChange={setScheduleEnabled}
            trackColor={{ false: '#E0E0E0', true: '#1976D2' }}
            thumbColor={scheduleEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Event notifications</Text>
            <Text style={styles.settingSubtitle}>
              You will receive regularly an notification about Events subject schedule
            </Text>
          </View>
          <Switch 
            value={eventEnabled} 
            onValueChange={setEventEnabled}
            trackColor={{ false: '#E0E0E0', true: '#1976D2' }}
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: '#666666',
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
    borderBottomColor: '#F0F0F0',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});
