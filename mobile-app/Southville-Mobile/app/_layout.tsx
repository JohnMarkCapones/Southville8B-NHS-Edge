// Suppress Expo Go push warning before any notifications modules load
import "@/utils/suppress-expo-go-push-warning";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthSessionProvider } from "@/hooks/use-auth-session";
import { ThemeProvider as CustomThemeProvider } from "@/contexts/theme-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { pushNotificationService } = await import(
        "@/services/push-notifications"
      );

      // Register for push notifications (local notifications only in Expo Go)
      pushNotificationService.registerForPushNotifications().catch((error) => {
        console.warn(
          "[RootLayout] Failed to register for push notifications:",
          error
        );
      });

      if (!mounted) return;

      // Listen for notifications received while app is foregrounded
      notificationListener.current =
        pushNotificationService.addNotificationReceivedListener(
          (notification) => {
            console.log(
              "[RootLayout] Notification received while app is open:",
              {
                title: notification.request.content.title,
                data: notification.request.content.data,
              }
            );
            // The alert modal will show automatically via useAlerts hook
          }
        );

      // Listen for user tapping on notifications
      responseListener.current =
        pushNotificationService.addNotificationResponseReceivedListener(
          (response) => {
            const notification = response.notification;
            const data = notification.request.content.data;

            console.log("[RootLayout] Notification tapped:", {
              title: notification.request.content.title,
              data: data,
            });

            if (data?.isAlert && data?.alertId) {
              router.push("/(tabs)/");
              console.log(
                `[RootLayout] Navigated to home screen for alert ${data.alertId}`
              );
            } else {
              router.push("/notifications");
            }
          }
        );
    })();

    // Handle initial notification (when app is opened from a notification)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data;
        if (data?.isAlert && data?.alertId) {
          // Navigate to home screen
          setTimeout(() => {
            router.push("/(tabs)/");
          }, 500); // Small delay to ensure app is fully loaded
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);

  return (
    <SafeAreaProvider>
      <CustomThemeProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <AuthSessionProvider>
            <Stack initialRouteName="index">
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="onboarding"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen
                name="terms-of-service"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="privacy-policy"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="help-center"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="notifications"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="notification-settings"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Modal" }}
              />
            </Stack>
            <StatusBar style="auto" />
          </AuthSessionProvider>
        </ThemeProvider>
      </CustomThemeProvider>
    </SafeAreaProvider>
  );
}
