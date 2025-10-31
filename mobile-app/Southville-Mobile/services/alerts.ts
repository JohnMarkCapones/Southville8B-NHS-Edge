import { apiRequest } from "@/lib/api-client";
import { supabase } from "@/lib/supabase-client";
import type { AlertsResponse, AlertsParams } from "@/lib/types/alert";

export async function fetchAlerts(
  params: AlertsParams = {}
): Promise<AlertsResponse> {
  const {
    page = 1,
    limit = 50,
    includeExpired = false,
    type,
    sortBy,
    sortOrder,
  } = params;

  const searchParams = new URLSearchParams();

  searchParams.set("page", page.toString());
  searchParams.set("limit", limit.toString());

  // Only set includeExpired if it's true (default is false)
  if (includeExpired) {
    searchParams.set("includeExpired", "true");
  }

  // Optional parameters
  if (type) {
    searchParams.set("type", type);
  }

  if (sortBy) {
    searchParams.set("sortBy", sortBy);
  }

  if (sortOrder) {
    searchParams.set("sortOrder", sortOrder);
  }

  const queryString = searchParams.toString();
  const path = `/alerts${queryString ? `?${queryString}` : ""}`;

  return apiRequest<AlertsResponse>(path);
}

export async function markAlertAsRead(alertId: string): Promise<void> {
  return apiRequest(`/alerts/${alertId}/read`, {
    method: "POST",
    body: {}, // Empty body - DTO is optional
  });
}

/**
 * Fetch user's read alert IDs via backend API (respects auth via JWT)
 */
export async function fetchReadAlertIdsFromApi(): Promise<string[]> {
  try {
    const res = await apiRequest<{ data: string[] }>(`/alerts/read-ids`);
    const ids = Array.isArray(res?.data) ? res.data : [];
    console.log(
      `[alerts] ✅ Read alert IDs from API: ${ids.length}`,
      ids.length > 0 ? ids.slice(0, 3) : "none"
    );
    return ids;
  } catch (error) {
    console.warn("[alerts] Failed to fetch read alert IDs from API:", error);
    return [];
  }
}
