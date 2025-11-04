import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY_PREFIX = "dismissed_alerts";

/**
 * Get storage key for a specific user's dismissed alerts
 */
function getStorageKey(userId: string | null): string {
  return userId
    ? `${STORAGE_KEY_PREFIX}:${userId}`
    : `${STORAGE_KEY_PREFIX}:anonymous`;
}

/**
 * Save dismissed alert IDs for a user
 */
export async function saveDismissedAlerts(
  userId: string | null,
  alertIds: Set<string>
): Promise<void> {
  try {
    const key = getStorageKey(userId);
    const idsArray = Array.from(alertIds);
    await AsyncStorage.setItem(key, JSON.stringify(idsArray));
    console.log(
      `[alert-storage] Saved ${idsArray.length} dismissed alerts for user`
    );
  } catch (error) {
    console.error("[alert-storage] Error saving dismissed alerts:", error);
  }
}

/**
 * Load dismissed alert IDs for a user
 */
export async function loadDismissedAlerts(
  userId: string | null
): Promise<Set<string>> {
  try {
    const key = getStorageKey(userId);
    const data = await AsyncStorage.getItem(key);
    if (data) {
      const idsArray = JSON.parse(data) as string[];
      console.log(
        `[alert-storage] Loaded ${idsArray.length} dismissed alerts for user`
      );
      return new Set(idsArray);
    }
    return new Set<string>();
  } catch (error) {
    console.error("[alert-storage] Error loading dismissed alerts:", error);
    return new Set<string>();
  }
}

/**
 * Add a single alert ID to dismissed alerts
 */
export async function addDismissedAlert(
  userId: string | null,
  alertId: string
): Promise<void> {
  try {
    const existing = await loadDismissedAlerts(userId);
    existing.add(alertId);
    await saveDismissedAlerts(userId, existing);
    console.log(`[alert-storage] Added alert ${alertId} to dismissed alerts`);
  } catch (error) {
    console.error("[alert-storage] Error adding dismissed alert:", error);
  }
}

/**
 * Clear all dismissed alerts for a user (useful for logout or reset)
 */
export async function clearDismissedAlerts(
  userId: string | null
): Promise<void> {
  try {
    const key = getStorageKey(userId);
    await AsyncStorage.removeItem(key);
    console.log("[alert-storage] Cleared dismissed alerts for user");
  } catch (error) {
    console.error("[alert-storage] Error clearing dismissed alerts:", error);
  }
}
