import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';

export default function AccountSecurityScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { 
          backgroundColor: colors.background,
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
        }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.tint} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Account Security</Text>
          <View style={styles.placeholder} />
        </View>

      {/* Coming Soon Content */}
      <View style={styles.content}>
        <View style={[styles.comingSoonCard, { 
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
          borderWidth: isDark ? 1 : 0
        }]}>
          <View style={[styles.iconContainer, { 
            backgroundColor: isDark ? 'rgba(25, 118, 210, 0.2)' : '#E3F2FD'
          }]}>
            <Ionicons name="shield-checkmark-outline" size={64} color={colors.tint} />
          </View>
          <Text style={[styles.comingSoonTitle, { color: colors.text }]}>Coming Soon</Text>
          <Text style={[styles.comingSoonDescription, { color: colors.icon }]}>
            Account security features are currently under development. 
            You&apos;ll be able to manage your password, enable two-factor authentication, 
            and review your account activity here.
          </Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="key-outline" size={20} color={colors.tint} />
              <Text style={[styles.featureText, { color: colors.text }]}>Change Password</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-outline" size={20} color={colors.tint} />
              <Text style={[styles.featureText, { color: colors.text }]}>Two-Factor Authentication</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="time-outline" size={20} color={colors.tint} />
              <Text style={[styles.featureText, { color: colors.text }]}>Account Activity</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="notifications-outline" size={20} color={colors.tint} />
              <Text style={[styles.featureText, { color: colors.text }]}>Security Notifications</Text>
            </View>
          </View>
          {/* Actions */}
          <TouchableOpacity
            onPress={() => router.push('/account-security/change-password')}
            activeOpacity={0.85}
            style={{
              marginTop: 24,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'transparent',
              shadowColor: isDark ? 'transparent' : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0 : 0.1,
              shadowRadius: isDark ? 0 : 3,
              elevation: isDark ? 0 : 3,
            }}
          >
            <LinearGradient
              colors={isDark ? [colors.tint, '#1E3A8A'] : [colors.tint, '#1D4ED8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 9,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600', textAlign: 'center' }}>Change Password</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoonCard: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  comingSoonTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  comingSoonDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresList: {
    width: '100%',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
