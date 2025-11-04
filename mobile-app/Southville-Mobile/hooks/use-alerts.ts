import { useState, useEffect, useCallback, useRef } from "react";
import { AppState } from "react-native";
import {
  fetchAlerts,
  markAlertAsRead,
  fetchReadAlertIdsFromApi,
} from "@/services/alerts";
import { supabase } from "@/lib/supabase-client";
import type { Alert, AlertsParams } from "@/lib/types/alert";
import { loadDismissedAlerts, addDismissedAlert } from "@/utils/alert-storage";

interface UseAlertsReturn {
  alerts: Alert[];
  activeAlert: Alert | null; // Latest unread, non-expired alert
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  refetch: () => Promise<void>;
  markAsRead: (alertId: string) => Promise<void>;
}

export function useAlerts(params: AlertsParams = {}): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);
  const dismissedAlertsRef = useRef<Set<string>>(new Set());
  const readAlertsRef = useRef<Set<string>>(new Set());
  // Retry control refs must be declared at the top level (not inside effects)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // Get active (unread, non-expired) alert
  const getActiveAlert = useCallback((alertList: Alert[]): Alert | null => {
    const now = new Date();
    const active = alertList
      .filter((alert) => {
        const isExpired = new Date(alert.expires_at) <= now;
        const isRead = alert.is_read;
        const isDismissed = dismissedAlertsRef.current.has(alert.id);
        const isReadInSupabase = readAlertsRef.current.has(alert.id);
        return !isExpired && !isRead && !isDismissed && !isReadInSupabase;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

    return active || null;
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Extract client-side filters (not sent to API)
      const { recipient_id, is_read, ...apiParams } = params;

      // Fetch from API with only API-accepted parameters
      const response = await fetchAlerts({
        ...apiParams,
        includeExpired: false, // Don't include expired alerts by default
      });

      // Apply client-side filters if specified
      let filteredAlerts = response.data;

      // Filter by recipient_id if specified
      if (recipient_id !== undefined) {
        if (recipient_id === null) {
          // Show only global alerts (recipient_id is null)
          filteredAlerts = filteredAlerts.filter(
            (alert) => alert.recipient_id === null
          );
        } else {
          // Show alerts for specific user or global alerts
          filteredAlerts = filteredAlerts.filter(
            (alert) =>
              alert.recipient_id === null || alert.recipient_id === recipient_id
          );
        }
      }

      // Filter by is_read if specified
      if (is_read !== undefined) {
        filteredAlerts = filteredAlerts.filter(
          (alert) => alert.is_read === is_read
        );
      }

      // Filter out alerts that are marked as read in Supabase alert_reads table
      // Always filter if recipient_id exists (even if readAlertsRef is empty, it won't filter anything which is fine)
      if (recipient_id) {
        filteredAlerts = filteredAlerts.filter(
          (alert) => !readAlertsRef.current.has(alert.id)
        );
        console.log(
          `[useAlerts] Filtered alerts using ${readAlertsRef.current.size} read alerts from Supabase`
        );
      }

      setAlerts(filteredAlerts);
      const active = getActiveAlert(filteredAlerts);
      setActiveAlert(active);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch alerts";
      setError(errorMessage);
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params), getActiveAlert]);

  const handleMarkAsRead = useCallback(
    async (alertId: string) => {
      try {
        const userId = params.recipient_id || null;

        // Add to local dismissed alerts immediately for instant UI feedback
        dismissedAlertsRef.current.add(alertId);
        setActiveAlert((prev) => (prev?.id === alertId ? null : prev));

        // Update local state
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId ? { ...alert, is_read: true } : alert
          )
        );

        // Persist to AsyncStorage
        await addDismissedAlert(userId, alertId);

        // Call backend endpoint to track read status
        try {
          await markAlertAsRead(alertId);
          // Add to read alerts ref to prevent showing again
          readAlertsRef.current.add(alertId);
          console.log(`[useAlerts] Alert ${alertId} marked as read on backend`);
        } catch (err) {
          // If backend call fails, still keep local persistence
          // This ensures alerts stay dismissed even if backend is unavailable
          console.warn(
            "[useAlerts] Backend mark as read failed, using local only:",
            err instanceof Error ? err.message : err
          );
        }

        console.log(
          `[useAlerts] Alert ${alertId} marked as read (local + backend)`
        );
      } catch (err) {
        console.error("[useAlerts] Error marking alert as read:", err);
      }
    },
    [params.recipient_id]
  );

  // Load persisted dismissed alerts and read alerts from API on mount
  useEffect(() => {
    const loadAllDismissedAndRead = async () => {
      const userId = params.recipient_id || null;

      // Load dismissed alerts from AsyncStorage (client-side persistence)
      const persisted = await loadDismissedAlerts(userId);
      dismissedAlertsRef.current = persisted;
      console.log(
        `[useAlerts] Loaded ${persisted.size} persisted dismissed alerts`
      );

      // Load read alerts from backend API (auth via JWT attached by api client)
      if (userId) {
        try {
          const readAlertIds = await fetchReadAlertIdsFromApi();
          readAlertsRef.current = new Set(readAlertIds);
          console.log(
            `[useAlerts] ✅ Loaded ${readAlertIds.length} read alerts from API`
          );
        } catch (err) {
          console.error(
            "[useAlerts] ❌ Error loading read alerts from API:",
            err
          );
          // Initialize as empty set even on error to ensure filtering still works
          readAlertsRef.current = new Set<string>();
        }
      } else {
        // If no userId, initialize empty set
        readAlertsRef.current = new Set<string>();
      }

      // After loading read alerts, fetch alerts data (so read alerts are available for filtering)
      console.log(
        `[useAlerts] 📥 Fetching alerts data with ${readAlertsRef.current.size} read alerts loaded`
      );
      await fetchData();

      // Mark initialization complete so UI can render modals safely
      setIsInitialized(true);
    };

    loadAllDismissedAndRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.recipient_id]);

  // Set up Supabase Realtime subscription with auto-retry
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    const MAX_RETRIES = 5;

    // Note: Initial data fetch happens in the first useEffect after read alerts are loaded
    // This effect only sets up the Realtime subscription

    // Set up Realtime subscription for new alerts
    const userId = params.recipient_id || null;

    // Log configuration
    console.log("[useAlerts] Setting up subscription", {
      hasSupabase: !!supabase,
      userId: userId ? userId.substring(0, 8) + "..." : "null (global only)",
    });

    // Only set up Realtime if Supabase client is available
    if (!supabase) {
      console.warn(
        "[useAlerts] Supabase client not available, using polling only"
      );
      // Fallback to polling
      pollInterval = setInterval(() => {
        fetchData();
      }, 30000); // Poll every 30 seconds
      return () => {
        if (pollInterval) {
          clearInterval(pollInterval);
        }
        if (retryTimeout) {
          clearTimeout(retryTimeout);
        }
      };
    }

    const setupSubscription = () => {
      // Clean up existing subscription before creating new one
      if (subscriptionRef.current) {
        console.log(
          "[useAlerts] Cleaning up existing subscription before retry"
        );
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }

      try {
        const channelName = userId
          ? `alerts-changes-${userId}`
          : `alerts-changes`;
        console.log(
          `[useAlerts] Creating subscription channel: ${channelName}`
        );

        const channel = supabase
          .channel(channelName)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "alerts",
            },
            async (payload) => {
              try {
                console.log("[useAlerts] New alert received via Realtime:", {
                  alertId: payload.new?.id,
                  title: payload.new?.title,
                  recipient_id: payload.new?.recipient_id,
                });
                const newAlert = payload.new as Alert;

                // Check if alert is for this user or whole school
                // Alert is for user if: recipient_id is NULL (whole school) OR matches current user ID
                const isForUser =
                  newAlert.recipient_id === null ||
                  (userId && newAlert.recipient_id === userId);

                if (isForUser) {
                  // Check if alert is not expired
                  const now = new Date();
                  const expiresAt = new Date(newAlert.expires_at);
                  const isExpired = expiresAt <= now;
                  const isDismissed = dismissedAlertsRef.current.has(
                    newAlert.id
                  );
                  const isReadInSupabase = readAlertsRef.current.has(
                    newAlert.id
                  );

                  if (
                    !isExpired &&
                    !newAlert.is_read &&
                    !isDismissed &&
                    !isReadInSupabase
                  ) {
                    console.log(
                      "[useAlerts] Alert is valid and active, adding to state"
                    );
                    // Add to alerts list and set as active
                    setAlerts((prev) => {
                      const updated = [newAlert, ...prev];
                      const active = getActiveAlert(updated);
                      setActiveAlert(active);
                      return updated;
                    });

                    // Send push notification
                    // Check if app is in background/closed
                    const appState = AppState.currentState;
                    const isBackground =
                      appState === "background" || appState === "inactive";

                    // Send notification if app is in background, or always (user preference)
                    // For now, we'll send notifications even in foreground (user can customize later)
                    try {
                      const { pushNotificationService } = await import(
                        "@/services/push-notifications"
                      );
                      await pushNotificationService.sendAlertNotification(
                        newAlert
                      );
                      console.log(
                        `[useAlerts] Push notification sent for alert ${newAlert.id}`
                      );
                    } catch (notificationError) {
                      console.warn(
                        "[useAlerts] Failed to send push notification:",
                        notificationError
                      );
                      // Don't block alert display if notification fails
                    }
                  } else {
                    console.log("[useAlerts] Alert filtered out:", {
                      expired: isExpired,
                      isRead: newAlert.is_read,
                      isDismissed: isDismissed,
                      isReadInSupabase: isReadInSupabase,
                    });
                  }
                } else {
                  console.log("[useAlerts] Alert not for this user, ignoring");
                }
              } catch (callbackError) {
                // Prevent errors in callback from closing the channel
                console.error(
                  "[useAlerts] Error processing Realtime payload:",
                  callbackError instanceof Error
                    ? callbackError.message
                    : callbackError
                );
              }
            }
          )
          .subscribe((status) => {
            console.log(`[useAlerts] Subscription status changed: ${status}`);

            if (status === "SUBSCRIBED") {
              console.log(
                "[useAlerts] ✅ Successfully subscribed to alerts changes"
              );
              retryCountRef.current = 0; // Reset retry count on successful subscription
              if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = null;
              }
            } else if (
              status === "CHANNEL_ERROR" ||
              status === "TIMED_OUT" ||
              status === "CLOSED"
            ) {
              console.warn(
                `[useAlerts] ⚠️ Channel status: ${status}. Retry count: ${retryCountRef.current}/${MAX_RETRIES}`
              );

              // Auto-retry with exponential backoff
              if (retryCountRef.current < MAX_RETRIES) {
                const delay = Math.min(
                  1000 * Math.pow(2, retryCountRef.current),
                  30000
                ); // Exponential backoff max 30s
                retryCountRef.current += 1;
                console.log(
                  `[useAlerts] Retrying subscription in ${delay}ms (attempt ${retryCountRef.current}/${MAX_RETRIES})`
                );

                if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = setTimeout(() => {
                  setupSubscription();
                }, delay);
              } else {
                // Max retries exceeded, fall back to polling
                console.error(
                  "[useAlerts] ❌ Max retries exceeded, falling back to polling"
                );
                pollInterval = setInterval(() => {
                  fetchData();
                }, 30000); // Poll every 30 seconds
              }
            }
          });

        subscriptionRef.current = channel;
      } catch (err) {
        console.error("[useAlerts] Error setting up subscription:", err);
        // Fallback to polling if subscription setup fails
        pollInterval = setInterval(() => {
          fetchData();
        }, 30000);
      }
    };

    // Initial subscription setup
    setupSubscription();

    return () => {
      console.log("[useAlerts] Cleaning up subscription and timers");
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.recipient_id, getActiveAlert]);

  return {
    alerts,
    activeAlert,
    loading,
    error,
    isInitialized,
    refetch: fetchData,
    markAsRead: handleMarkAsRead,
  };
}
