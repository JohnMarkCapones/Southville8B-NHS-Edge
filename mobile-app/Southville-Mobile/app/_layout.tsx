// Suppress Expo Go push warning before any notifications modules load
import "@/utils/suppress-expo-go-push-warning";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolateColor,
} from "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthSessionProvider, useAuthSession } from "@/hooks/use-auth-session";
import { ThemeProvider as CustomThemeProvider } from "@/contexts/theme-context";
import { ChatHeads } from "@/components/chat/ChatHeads";
import { supabase } from "@/lib/supabase-client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTheme } from "@/contexts/theme-context";
import { Colors } from "@/constants/theme";

export const unstable_settings = {
  anchor: "(tabs)",
};

function ChatHeadsGate() {
  const { status } = useAuthSession();
  const { user } = useCurrentUser();
  const pathname = usePathname();
  const isOnChatScreen = pathname?.startsWith("/chat");
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState(() =>
    user?.student ? false : true
  );

  useEffect(() => {
    let isMounted = true;

    async function checkMinorPolicyAcceptance() {
      if (!user?.student || !user?.id) {
        if (isMounted) setHasAcceptedPolicy(true);
        return;
      }

      const flagKey = `@minor_policy_accepted_${user.id}`;
      try {
        const flag = await AsyncStorage.getItem(flagKey);
        if (isMounted) setHasAcceptedPolicy(flag === "true");
      } catch (error) {
        console.warn("[ChatHeadsGate] Failed to read policy flag", error);
        if (isMounted) setHasAcceptedPolicy(false);
      }
    }

    checkMinorPolicyAcceptance();

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.student]);

  const isAuthed = status === "authenticated";
  const hasSection = !!user?.student?.section_id;
  const isRealtimeAvailable = !!supabase; // hide when missing env
  const policyGated = user?.student ? hasAcceptedPolicy : true;
  const visible =
    !isOnChatScreen &&
    isAuthed &&
    hasSection &&
    isRealtimeAvailable &&
    policyGated;
  return <ChatHeads visible={visible} unreadCount={0} />;
}

function AnimatedThemeContainer({ children }: { children: ReactNode }) {
  const { isDark } = useTheme();
  const transition = useSharedValue(isDark ? 1 : 0);
  const contentOpacity = useSharedValue(1);

  useEffect(() => {
    transition.value = withTiming(isDark ? 1 : 0, {
      duration: 400,
      easing: Easing.inOut(Easing.quad),
    });
    contentOpacity.value = 0.2;
    contentOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.quad),
    });
  }, [isDark, transition, contentOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    backgroundColor: interpolateColor(
      transition.value,
      [0, 1],
      [Colors.light.background, Colors.dark.background]
    ),
  }));

  const contentStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: contentOpacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Animated.View style={contentStyle}>{children}</Animated.View>
    </Animated.View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // Handle app state changes to prevent modal/overlay persistence issues
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && appStateRef.current === "background") {
        // App resumed from background - ensure clean state
        // Individual screens will handle their own modal resets
        console.log("[RootLayout] App resumed from background");
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

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
        <AnimatedThemeContainer>
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
                  name="minor-user-policy"
                  options={{ headerShown: false }}
                />
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
                <Stack.Screen name="chat" options={{ headerShown: false }} />
                <Stack.Screen
                  name="modal"
                  options={{ presentation: "modal", title: "Modal" }}
                />
              </Stack>
              <StatusBar style="auto" />
              {/* Floating chatheads overlay */}
              <ChatHeadsGate />
            </AuthSessionProvider>
          </ThemeProvider>
        </AnimatedThemeContainer>
      </CustomThemeProvider>
    </SafeAreaProvider>
  );
}
