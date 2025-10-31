import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform, AppState } from "react-native";
import Constants from "expo-constants";
import type { Alert } from "@/lib/types/alert";

/**
 * NOTE: This file uses LOCAL notifications only (triggered by Realtime subscriptions).
 *
 * The warning "Android Push notifications (remote notifications) functionality was removed from Expo Go"
 * is EXPECTED and SAFE TO IGNORE when using Expo Go. This happens because expo-notifications
 * automatically tries to register for remote push tokens on import, but:
 *
 * - We only use local notifications (scheduleNotificationAsync) which work perfectly in Expo Go
 * - Remote push tokens are only needed when app is completely closed (which requires a dev build)
 * - Our alerts are triggered via Supabase Realtime, so local notifications are sufficient
 *
 * According to Expo docs: https://docs.expo.dev/push-notifications/overview/
 * Remote push notifications require a development build, but local notifications work in Expo Go.
 */

// Suppress the warning in development (it's expected behavior)
if (__DEV__) {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || "";
    // Filter out the expected Expo Go push notification warning
    if (
      message.includes("Android Push notifications") &&
      message.includes("removed from Expo Go")
    ) {
      // Silently ignore - this is expected when using local notifications in Expo Go
      return;
    }
    originalWarn.apply(console, args);
  };
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const pushNotificationService = {
  async registerForPushNotifications(): Promise<string | null> {
    try {
      // Request permissions for local notifications (doesn't require remote push support)
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log(
          "[PushNotifications] Notification permissions not granted. Local notifications will not work."
        );
        return null;
      }

      console.log("[PushNotifications] Notification permissions granted");

      // Set up Android notification channels (required for Android 8.0+)
      if (Platform.OS === "android") {
        // Create default channel
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#1976D2",
        });

        // Create alert-specific channels
        await this.setupAlertChannels();
        console.log(
          "[PushNotifications] Android notification channels configured"
        );
      }

      // NOTE: We intentionally do NOT request Expo push tokens here because:
      // 1. We use LOCAL notifications triggered by Supabase Realtime (works in Expo Go)
      // 2. Remote push tokens require a development build (not available in Expo Go)
      // 3. Local notifications are sufficient for our alert system
      //
      // If you need remote push notifications (for when app is completely closed),
      // you must:
      // - Create a development build: https://docs.expo.dev/develop/development-builds/introduction/
      // - Then uncomment and use the code below to get push tokens
      //
      // const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      // if (projectId && Device.isDevice) {
      //   try {
      //     const token = await Notifications.getExpoPushTokenAsync({ projectId });
      //     await apiRequest('/users/push-token', { method: 'POST', body: { token: token.data } });
      //     return token.data;
      //   } catch (error) {
      //     console.log("[PushNotifications] Remote push token unavailable");
      //   }
      // }

      console.log(
        "[PushNotifications] Using local notifications only (works in Expo Go and dev builds)"
      );
      return null;
    } catch (error) {
      console.error(
        "[PushNotifications] Error registering for notifications:",
        error
      );
      return null;
    }
  },

  /**
   * Set up Android notification channels for different alert types
   */
  async setupAlertChannels(): Promise<void> {
    if (Platform.OS !== "android") return;

    // Weather Alerts Channel
    await Notifications.setNotificationChannelAsync("weather-alerts", {
      name: "Weather Alerts",
      description: "Notifications for weather-related alerts",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF6B35",
      sound: "default",
    });

    // Emergency Alerts Channel (Highest Priority)
    await Notifications.setNotificationChannelAsync("emergency-alerts", {
      name: "Emergency Alerts",
      description: "Critical emergency notifications",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500, 250, 500],
      lightColor: "#D32F2F",
      sound: "default",
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    });

    // Class Suspension Alerts Channel
    await Notifications.setNotificationChannelAsync("class-suspension-alerts", {
      name: "Class Suspension Alerts",
      description: "Notifications for class suspension announcements",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#9C27B0",
      sound: "default",
    });
  },

  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(callback);
  },

  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  async scheduleLocalNotification(
    title: string,
    body: string,
    seconds: number = 0
  ) {
    const trigger = seconds > 0 ? { seconds } : null;
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: trigger as any,
    });
  },

  async cancelAllScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  },

  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  },

  /**
   * Send a push notification for an alert
   * Maps alert types to appropriate notification channels
   */
  async sendAlertNotification(alert: Alert): Promise<void> {
    try {
      // Check if permissions are granted
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        console.log(
          "[PushNotifications] Permissions not granted, skipping notification"
        );
        return;
      }

      // Check if app is in background/closed - always show notification
      // If in foreground, the modal will show, but we can also show notification
      const appState = AppState.currentState;
      const isBackground = appState === "background" || appState === "inactive";

      // Map alert type to channel ID
      let channelId = "default";
      let priority = Notifications.AndroidNotificationPriority.DEFAULT;
      let sound = true;

      switch (alert.type) {
        case "warning":
          channelId = "weather-alerts";
          priority = Notifications.AndroidNotificationPriority.HIGH;
          break;
        case "error":
          channelId = "emergency-alerts";
          priority = Notifications.AndroidNotificationPriority.MAX;
          break;
        case "info":
          channelId = "class-suspension-alerts";
          priority = Notifications.AndroidNotificationPriority.DEFAULT;
          break;
        default:
          channelId = "default";
          priority = Notifications.AndroidNotificationPriority.DEFAULT;
      }

      // Ensure channels are set up for Android
      if (Platform.OS === "android") {
        await this.setupAlertChannels();
      }

      // Send notification
      const notificationContent: Notifications.NotificationContentInput = {
        title: alert.title,
        body:
          alert.message.length > 150
            ? alert.message.substring(0, 150) + "..."
            : alert.message,
        sound: sound,
        priority: priority,
        data: {
          alertId: alert.id,
          alertType: alert.type,
          isAlert: true, // Flag to identify this as an alert notification
        },
        categoryIdentifier: "ALERT", // For notification actions if needed later
      };

      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        // On Android, specify channel via trigger to avoid TS android-specific typing on content
        trigger: Platform.OS === "android" ? ({ channelId } as any) : null,
      });

      console.log(
        `[PushNotifications] Sent notification for alert ${alert.id} (${alert.type})`
      );
    } catch (error) {
      console.error(
        "[PushNotifications] Error sending alert notification:",
        error
      );
    }
  },

  /**
   * Get notification permission status
   */
  async getPermissionStatus(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.getPermissionsAsync();
  },

  /**
   * Request notification permissions with helpful message
   */
  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  },
};
