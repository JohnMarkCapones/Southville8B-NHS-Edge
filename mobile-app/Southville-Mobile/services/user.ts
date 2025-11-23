import { apiRequest } from "@/lib/api-client";
import type { UserProfile } from "@/lib/types/user";

export async function fetchCurrentUser(): Promise<UserProfile> {
  return apiRequest<UserProfile>("/users/me");
}

/**
 * Record a daily login for the current user
 * Safe to call multiple times per day (idempotent)
 * Errors are silently handled to not block login flow
 */
export async function recordLogin(): Promise<void> {
  try {
    await apiRequest<{ success: boolean }>("/users/me/record-login", {
      method: "POST",
    });
  } catch (error) {
    // Silently handle errors - this should not block login
    console.warn("[user] Failed to record login for streak:", error);
  }
}

/**
 * Fetch the current user's login streak count
 * @returns Number of consecutive login days (0 if no streak)
 */
export async function fetchLoginStreak(): Promise<number> {
  try {
    const response = await apiRequest<{ streak: number }>("/users/me/streak");
    return response.streak || 0;
  } catch (error) {
    console.warn("[user] Failed to fetch login streak:", error);
    return 0; // Default to 0 on error
  }
}
