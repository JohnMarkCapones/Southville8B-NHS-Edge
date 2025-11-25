import { apiRequest } from "@/lib/api-client";
import { Notification } from "@/lib/types/notification";

// Backend API response types (snake_case)
interface BackendNotification {
  id: string;
  user_id: string;
  type: "info" | "warning" | "success" | "error" | "system";
  title: string;
  message: string;
  category: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface NotificationsResponse {
  data: BackendNotification[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface MarkReadResponse {
  success: boolean;
  message?: string;
}

/**
 * Map backend notification type to mobile notification type
 */
function mapNotificationType(
  backendType: string,
  category: string | null
): Notification["type"] {
  // Map based on category first, then type
  if (category) {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("academic") || categoryLower.includes("grade")) {
      return "grade";
    }
    if (
      categoryLower.includes("event") ||
      categoryLower.includes("announcement")
    ) {
      if (categoryLower.includes("event")) {
        return "school_event";
      }
      return "announcement";
    }
  }

  // Map based on backend type
  switch (backendType.toLowerCase()) {
    case "info":
    case "system":
      // Check message content for hints
      return "announcement";
    case "warning":
      return "class_schedule";
    case "success":
      return "grade";
    default:
      return "announcement";
  }
}

/**
 * Convert backend notification to mobile notification format
 */
function mapBackendToMobile(backend: BackendNotification): Notification {
  return {
    id: backend.id,
    userId: backend.user_id,
    title: backend.title,
    message: backend.message,
    type: mapNotificationType(backend.type, backend.category),
    read: backend.is_read,
    createdAt: backend.created_at,
  };
}

export const notificationsService = {
  /**
   * Get notifications for the current user
   * @param params Query parameters (page, limit, type, is_read)
   */
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    is_read?: boolean;
  }): Promise<Notification[]> {
    const searchParams = new URLSearchParams();

    if (params?.page) {
      searchParams.set("page", params.page.toString());
    }
    if (params?.limit) {
      searchParams.set("limit", params.limit.toString());
    }
    if (params?.type) {
      searchParams.set("type", params.type);
    }
    if (params?.is_read !== undefined) {
      searchParams.set("is_read", params.is_read.toString());
    }

    // Default to page 1, limit 50 if not specified
    if (!params?.page) searchParams.set("page", "1");
    if (!params?.limit) searchParams.set("limit", "50");

    const queryString = searchParams.toString();
    const path = `/notifications/my${queryString ? `?${queryString}` : ""}`;

    const response = await apiRequest<NotificationsResponse>(path);
    return response.data.map(mapBackendToMobile);
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<void> {
    await apiRequest<MarkReadResponse>(`/notifications/${id}/read`, {
      method: "PATCH",
    });
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiRequest<MarkReadResponse>("/notifications/mark-all-read", {
      method: "POST",
    });
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    await apiRequest<{ success: boolean }>(`/notifications/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiRequest<{ count: number }>(
      "/notifications/unread-count"
    );
    return response.count;
  },
};
