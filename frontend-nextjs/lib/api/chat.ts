/**
 * Chat Service API Client
 *
 * Provides functions to interact with the chat service backend.
 * Uses snake_case for all API request/response handling.
 *
 * @module lib/api/chat
 */

"use client";

import { ApiError, createErrorFromResponse, logError } from "./errors";
import type {
  ConversationsResponse,
  ConversationWithParticipants,
  MessagesResponse,
  Conversation,
  Message,
  CreateConversationRequest,
  SendMessageRequest,
  UnreadCountResponse,
} from "@/types/chat";

/**
 * Chat service base URL
 * Defaults to port 3001, but can be overridden via env var
 * Chat service uses /api/v1 prefix with global prefix /api and versioning /v1
 */
const CHAT_SERVICE_BASE_URL =
  process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || "http://localhost:3001";

/**
 * Request timeout in milliseconds (60 seconds)
 */
const CHAT_REQUEST_TIMEOUT = 60000;

/**
 * Build chat service URL
 * Chat service endpoints are at /api/v1/chat/* (with global prefix /api and version /v1)
 * Service runs on http://localhost:3001, so full URL is http://localhost:3001/api/v1/chat/...
 */
function buildChatUrl(endpoint: string): string {
  // Normalize base URL: remove trailing slashes
  const normalizedBaseUrl = CHAT_SERVICE_BASE_URL.replace(/\/+$/, '');
  
  // Clean endpoint: remove leading slashes
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  
  // Build URL ensuring no double slashes
  const url = `${normalizedBaseUrl}/api/v1/chat/${cleanEndpoint}`;

  if (process.env.NODE_ENV === "development") {
    console.log("[Chat API] Building URL:", {
      endpoint,
      url,
      baseUrl: CHAT_SERVICE_BASE_URL,
      normalizedBaseUrl,
    });
  }

  return url;
}

/**
 * Get authentication token from cookie (client-side only)
 */
function getTokenFromCookie(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  const match = document.cookie.match(/sb-access-token=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Make a fetch request with proper error handling
 */
async function chatFetch(url: string, options: RequestInit): Promise<Response> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      CHAT_REQUEST_TIMEOUT
    );

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    // Handle network errors (service not reachable)
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      logError(error, "Chat API");

      // Check if it's a CORS error (usually shows "Failed to fetch" with CORS)
      const isCorsError =
        error.message === "Failed to fetch" &&
        !error.stack?.includes("NetworkError");

      console.error("[Chat API] ⚠️ Network Error - Possible causes:");
      console.error("  1. Chat service not running on", CHAT_SERVICE_BASE_URL);
      console.error("  2. Wrong chat service URL/port");
      console.error("  3. CORS issue - check chat service CORS configuration");
      console.error("  4. Network connectivity problem");
      console.error("  Request URL:", url);

      const errorMessage = isCorsError
        ? `CORS error: Chat service at ${CHAT_SERVICE_BASE_URL} is not allowing requests from this origin. Please check CORS configuration.`
        : `Unable to connect to chat service. Please ensure the chat service is running on ${CHAT_SERVICE_BASE_URL}`;

      throw new ApiError(errorMessage, 0, {
        originalError: error,
        url,
        isNetworkError: true,
        isCorsError,
      });
    }

    // Handle timeout errors
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    ) {
      logError(error, "Chat API");
      console.error(
        "[Chat API] ⏱️ Request Timeout - Chat service took too long to respond"
      );
      throw new ApiError(
        "Chat service request timed out. Please try again.",
        408,
        { originalError: error, url, isTimeout: true }
      );
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Handle chat API response errors with specific error messages
 */
async function handleChatResponse<T>(
  response: Response,
  url: string
): Promise<T> {
  if (!response.ok) {
    const error = await createErrorFromResponse(response);
    logError(error, "Chat API");

    // Provide more specific error messages based on status code
    if (response.status === 401) {
      throw new ApiError("Authentication failed. Please log in again.", 401, {
        originalError: error,
        url,
        isAuthError: true,
      });
    } else if (response.status === 403) {
      throw new ApiError(
        "You don't have permission to access this resource.",
        403,
        { originalError: error, url, isPermissionError: true }
      );
    } else if (response.status === 404) {
      throw new ApiError(
        "Chat endpoint not found. Please check if the chat service is properly configured.",
        404,
        { originalError: error, url, isNotFoundError: true }
      );
    } else if (response.status >= 500) {
      throw new ApiError(
        "Chat service error. Please try again later.",
        response.status,
        { originalError: error, url, isServerError: true }
      );
    }

    throw error;
  }

  return response.json();
}

/**
 * Get user's conversations with pagination
 *
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20)
 * @returns Promise with conversations list
 */
export async function getConversations(
  page: number = 1,
  limit: number = 20
): Promise<ConversationsResponse> {
  const url = buildChatUrl("conversations");
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const token = getTokenFromCookie();

  if (process.env.NODE_ENV === "development") {
    console.log("[Chat API] Fetching conversations:", {
      url: `${url}?${params.toString()}`,
      hasToken: !!token,
    });
  }

  const response = await chatFetch(`${url}?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: "include",
  });

  return handleChatResponse<ConversationsResponse>(response, url);
}

/**
 * Get messages for a conversation
 *
 * @param conversationId - Conversation ID
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 50)
 * @returns Promise with messages list
 */
export async function getMessages(
  conversationId: string,
  page: number = 1,
  limit: number = 50
): Promise<MessagesResponse> {
  const url = buildChatUrl(`conversations/${conversationId}/messages`);
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const token = getTokenFromCookie();

  const response = await chatFetch(`${url}?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: "include",
  });

  return handleChatResponse<MessagesResponse>(response, url);
}

/**
 * Send a message
 *
 * @param data - Message data
 * @returns Promise with created message
 */
export async function sendMessage(data: SendMessageRequest): Promise<Message> {
  const url = buildChatUrl("messages");

  const token = getTokenFromCookie();

  const response = await chatFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return handleChatResponse<Message>(response, url);
}

/**
 * Mark conversation as read
 *
 * @param conversationId - Conversation ID
 * @returns Promise with success status
 */
export async function markAsRead(
  conversationId: string
): Promise<{ success: boolean }> {
  const url = buildChatUrl(`conversations/${conversationId}/read`);

  const token = getTokenFromCookie();

  const response = await chatFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: "include",
    body: JSON.stringify({}),
  });

  return handleChatResponse<{ success: boolean }>(response, url);
}

/**
 * Get total unread message count
 *
 * @returns Promise with unread count
 */
export async function getUnreadCount(): Promise<number> {
  const url = buildChatUrl("unread-count");

  const token = getTokenFromCookie();

  const response = await chatFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: "include",
  });

  const data = await handleChatResponse<UnreadCountResponse>(response, url);
  return data.unread_count;
}

/**
 * Create or get section group chat
 * Creates a group chat for a section if it doesn't exist, or returns existing one
 *
 * @param sectionId - Section ID
 * @returns Promise with conversation
 */
export async function createSectionGroupChat(
  sectionId: string
): Promise<Conversation> {
  const url = buildChatUrl("conversations");

  const token = getTokenFromCookie();

  const requestData: CreateConversationRequest = {
    type: "group_section",
    sectionId: sectionId,
  };

  const response = await chatFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: "include",
    body: JSON.stringify(requestData),
  });

  return handleChatResponse<Conversation>(response, url);
}

/**
 * Delete a conversation
 *
 * @param conversationId - Conversation ID
 * @returns Promise with success status
 */
export async function deleteConversation(
  conversationId: string
): Promise<{ success: boolean }> {
  const url = buildChatUrl(`conversations/${conversationId}`);

  const token = getTokenFromCookie();

  const response = await chatFetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: "include",
  });

  return handleChatResponse<{ success: boolean }>(response, url);
}
