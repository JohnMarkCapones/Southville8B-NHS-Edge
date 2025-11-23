"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";

// Backend notification type (snake_case)
interface BackendNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error" | "system";
  category:
    | "ACADEMIC"
    | "COMMUNICATION"
    | "EVENT_ANNOUNCEMENT"
    | "USER_ACCOUNT"
    | "SYSTEM"
    | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Backend response type
interface NotificationsResponse {
  data: BackendNotification[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Frontend notification type (camelCase)
export interface Notification {
  id: string;
  title: string;
  message: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "event"
    | "academic"
    | "social";
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: "low" | "medium" | "high";
}

/**
 * Map backend notification type to frontend display type
 */
function mapNotificationType(
  backendType: string,
  category: string | null
): Notification["type"] {
  // Map based on category first
  if (category) {
    const categoryUpper = category.toUpperCase();
    if (categoryUpper === "ACADEMIC") {
      return "academic";
    }
    if (categoryUpper === "EVENT_ANNOUNCEMENT") {
      return "event";
    }
    if (categoryUpper === "COMMUNICATION") {
      return "social";
    }
    if (categoryUpper === "USER_ACCOUNT" || categoryUpper === "SYSTEM") {
      return "info";
    }
  }

  // Fallback to backend type
  switch (backendType.toLowerCase()) {
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "error":
      return "error";
    default:
      return "info";
  }
}

/**
 * Calculate notification priority
 */
function getNotificationPriority(
  backendType: string,
  category: string | null
): "low" | "medium" | "high" {
  // High priority: errors, academic warnings
  if (
    backendType === "error" ||
    (category === "ACADEMIC" && backendType === "warning")
  ) {
    return "high";
  }

  // Medium priority: warnings, success, communication
  if (
    backendType === "warning" ||
    backendType === "success" ||
    category === "COMMUNICATION"
  ) {
    return "medium";
  }

  // Low priority: info, system
  return "low";
}

/**
 * Build action URL from related entity
 */
function buildActionUrl(
  relatedEntityType: string | null,
  relatedEntityId: string | null
): string | undefined {
  if (!relatedEntityType || !relatedEntityId) {
    return undefined;
  }

  const entityType = relatedEntityType.toLowerCase();
  switch (entityType) {
    case "quiz":
      return `/student/quiz/${relatedEntityId}`;
    case "schedule":
      return `/student/schedule`;
    case "club":
      return `/student/clubs/${relatedEntityId}`;
    case "news":
      return `/student/news/${relatedEntityId}`;
    default:
      return undefined;
  }
}

/**
 * Convert backend notification to frontend format
 */
function mapBackendToFrontend(backend: BackendNotification): Notification {
  return {
    id: backend.id,
    title: backend.title,
    message: backend.message,
    type: mapNotificationType(backend.type, backend.category),
    timestamp: new Date(backend.created_at),
    read: backend.is_read,
    actionUrl: buildActionUrl(
      backend.related_entity_type,
      backend.related_entity_id
    ),
    priority: getNotificationPriority(backend.type, backend.category),
  };
}

/**
 * Hook for managing notifications
 * Uses apiClient directly (no separate API wrapper files)
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<NotificationsResponse>(
        "/notifications/my",
        {
          params: {
            page: 1,
            limit: 50,
          },
        }
      );

      if (response?.data) {
        const mappedNotifications = response.data.map(mapBackendToFrontend);
        setNotifications(mappedNotifications);
        setUnreadCount(mappedNotifications.filter((n) => !n.read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to fetch notifications";
      setError(errorMessage);
      console.error("[useNotifications] Error fetching notifications:", err);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Fetch unread count separately
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.get<{ count: number }>(
        "/notifications/unread-count"
      );
      if (response?.count !== undefined) {
        setUnreadCount(response.count);
      }
    } catch (err: any) {
      console.error("[useNotifications] Error fetching unread count:", err);
      // Don't show toast for unread count errors
    }
  }, []);

  /**
   * Mark a notification as read
   */
  const markAsRead = useCallback(
    async (id: string) => {
      try {
        console.log("[useNotifications] Marking as read:", id);

        await apiClient.patch<{ success: boolean }>(
          `/notifications/${id}/read`,
          {} // Empty body - endpoint doesn't require payload
        );

        console.log("[useNotifications] API call successful, updating state");

        // Optimistically update local state
        setNotifications((prev) => {
          const updated = prev.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          console.log("[useNotifications] State updated:", {
            before: prev.find((n) => n.id === id)?.read,
            after: updated.find((n) => n.id === id)?.read,
          });
          return updated;
        });
        setUnreadCount((prev) => Math.max(0, prev - 1));

        // Refresh unread count from server
        await fetchUnreadCount();
      } catch (err: any) {
        console.error("[useNotifications] Error marking as read:", err);

        toast({
          title: "Error",
          description: "Failed to mark notification as read",
          variant: "destructive",
        });

        // Revert optimistic update on error
        await fetchNotifications();
      }
    },
    [fetchNotifications, fetchUnreadCount, toast]
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.post<{ success: boolean; count: number }>(
        "/notifications/mark-all-read",
        {}
      );

      // Optimistically update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);

      toast({
        title: "Success",
        description: "All notifications marked as read",
        variant: "default",
      });

      // Refresh from server
      await fetchNotifications();
    } catch (err: any) {
      console.error("[useNotifications] Error marking all as read:", err);

      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });

      // Revert optimistic update on error
      await fetchNotifications();
    }
  }, [fetchNotifications, toast]);

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        const notification = notifications.find((n) => n.id === id);
        const wasUnread = notification && !notification.read;

        await apiClient.delete(`/notifications/${id}`);

        // Optimistically update local state
        setNotifications((prev) => prev.filter((n) => n.id !== id));

        // Update unread count if deleted notification was unread
        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        toast({
          title: "Success",
          description: "Notification deleted",
          variant: "default",
        });

        // Refresh unread count from server
        await fetchUnreadCount();
      } catch (err: any) {
        console.error("[useNotifications] Error deleting notification:", err);

        toast({
          title: "Error",
          description: "Failed to delete notification",
          variant: "destructive",
        });

        // Revert optimistic update on error
        await fetchNotifications();
      }
    },
    [notifications, fetchNotifications, fetchUnreadCount, toast]
  );

  /**
   * Refresh notifications
   */
  const refresh = useCallback(() => {
    return fetchNotifications();
  }, [fetchNotifications]);

  // Initial fetch on mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Optional: Auto-refresh unread count every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Check unread count every 30 seconds

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    fetchNotifications,
    fetchUnreadCount,
  };
}
