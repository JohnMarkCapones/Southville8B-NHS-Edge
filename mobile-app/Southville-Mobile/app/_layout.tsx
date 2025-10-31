import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { useEffect, useRef } from 'react';
// import * as Notifications from 'expo-notifications';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthSessionProvider } from '@/hooks/use-auth-session';
import { ThemeProvider as CustomThemeProvider } from '@/contexts/theme-context';
// import { pushNotificationService } from '@/services/push-notifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // const notificationListener = useRef<any>();
  // const responseListener = useRef<any>();

  // useEffect(() => {
  //   // Register for push notifications
  //   pushNotificationService.registerForPushNotifications();

  //   // Listen for notifications received while app is foregrounded
  //   notificationListener.current = pushNotificationService.addNotificationReceivedListener(
  //     (notification) => {
  //       console.log('Notification received:', notification);
  //       // Optionally refresh notifications list
  //     }
  //   );

  //   // Listen for user tapping on notifications
  //   responseListener.current = pushNotificationService.addNotificationResponseReceivedListener(
  //     (response) => {
  //       console.log('Notification tapped:', response);
  //       // Navigate to notifications screen
  //       router.push('/notifications');
  //     }
  //   );

  //   return () => {
  //     if (notificationListener.current) {
  //       Notifications.removeNotificationSubscription(notificationListener.current);
  //     }
  //     if (responseListener.current) {
  //       Notifications.removeNotificationSubscription(responseListener.current);
  //     }
  //   };
  // }, []);

  return (
    <SafeAreaProvider>
      <CustomThemeProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthSessionProvider>
            <Stack initialRouteName="index">
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="terms-of-service" options={{ headerShown: false }} />
              <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
              <Stack.Screen name="help-center" options={{ headerShown: false }} />
              <Stack.Screen name="notifications" options={{ headerShown: false }} />
              <Stack.Screen name="notification-settings" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </AuthSessionProvider>
        </ThemeProvider>
      </CustomThemeProvider>
    </SafeAreaProvider>
  );
}

