/**
 * Chat Realtime Hook
 * 
 * Subscribes to Supabase realtime for instant message and conversation updates.
 * Handles subscriptions for messages, conversations, and participants.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseClient, isSupabaseAvailable } from "@/lib/supabase/client";
import type { Message, MessageWithSender, ConversationWithParticipants, ConversationParticipant } from "@/types/chat";

interface UseChatRealtimeOptions {
  conversationId?: string | null;
  onNewMessage?: (message: MessageWithSender) => void;
  onConversationUpdate?: (conversation: ConversationWithParticipants) => void;
  participants?: ConversationParticipant[];
  enabled?: boolean;
}

interface UseChatRealtimeReturn {
  isConnected: boolean;
  error: string | null;
}

/**
 * Hook for realtime chat subscriptions
 * 
 * @param options - Configuration options
 * @returns Connection status and error state
 */
export function useChatRealtime({
  conversationId,
  onNewMessage,
  onConversationUpdate,
  participants = [],
  enabled = true,
}: UseChatRealtimeOptions): UseChatRealtimeReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionsRef = useRef<Array<{ unsubscribe: () => void }>>([]);
  const participantsRef = useRef<ConversationParticipant[]>([]);

  // Update participants ref whenever participants prop changes
  useEffect(() => {
    console.log("[Chat Realtime] Participants ref updated:", {
      conversationId,
      participantsCount: participants.length,
      participants: participants.map(p => ({
        user_id: p.user_id,
        hasUser: !!p.user,
        userName: p.user?.full_name
      }))
    });
    participantsRef.current = participants;
  }, [participants, conversationId]);

  useEffect(() => {
    // Skip if Supabase is not available or disabled
    if (!enabled || !isSupabaseAvailable()) {
      setError("Supabase realtime is not available");
      console.log("[Chat Realtime] Disabled or Supabase not available");
      return;
    }

    // Skip if no conversation ID
    if (!conversationId) {
      setIsConnected(false);
      console.log("[Chat Realtime] No conversation ID, skipping subscription");
      return;
    }

    console.log("[Chat Realtime] Setting up subscription for conversation:", {
      conversationId,
      participantsCount: participantsRef.current.length,
      enabled
    });

    let isMounted = true;

    try {
      // Get Supabase client (this now sets auth token dynamically via realtime.setAuth())
      const supabase = getSupabaseClient();
      
      // Verify auth token is available (for debugging)
      if (typeof window !== "undefined") {
        const token = document.cookie.match(/sb-access-token=([^;]+)/)?.[1];
        if (!token) {
          console.warn("[Chat Realtime] No auth token found in cookies. Realtime subscriptions may fail due to RLS policies.");
        } else {
          console.log("[Chat Realtime] Auth token found, setting up subscriptions");
          // Log token preview for debugging (first/last 10 chars)
          const tokenPreview = token.length > 20 
            ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}`
            : token;
          console.log("[Chat Realtime] Token preview:", tokenPreview);
        }
      }
      
      const subscriptions: Array<{ unsubscribe: () => void }> = [];

      // Subscribe to new messages for this conversation
      const messagesChannel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            console.log("[Chat Realtime] 🎉 Raw payload received:", {
              eventType: payload.eventType,
              new: payload.new,
              old: payload.old,
              table: payload.table,
              schema: payload.schema
            });
            if (isMounted && onNewMessage) {
              // Map the payload to MessageWithSender format
              const newMessage: MessageWithSender = {
                id: payload.new.id,
                conversation_id: payload.new.conversation_id,
                sender_id: payload.new.sender_id,
                content: payload.new.content,
                message_type: payload.new.message_type || "text",
                attachment_url: payload.new.attachment_url,
                created_at: payload.new.created_at,
              };

              // Enrich message with sender information from participants
              // Use ref to always get the latest participants, even if they were loaded after subscription
              console.log("[Chat Realtime] New message received:", {
                messageId: payload.new.id,
                senderId: payload.new.sender_id,
                participantsCount: participantsRef.current.length,
                participants: participantsRef.current.map(p => ({
                  user_id: p.user_id,
                  hasUser: !!p.user,
                  userName: p.user?.full_name
                }))
              });
              
              const senderParticipant = participantsRef.current.find(
                (p) => p.user_id === payload.new.sender_id
              );
              
              console.log("[Chat Realtime] Sender lookup:", {
                senderId: payload.new.sender_id,
                found: !!senderParticipant,
                hasUser: !!senderParticipant?.user,
                senderName: senderParticipant?.user?.full_name
              });
              
              if (senderParticipant?.user) {
                newMessage.sender = senderParticipant.user;
                console.log("[Chat Realtime] Message enriched with sender:", newMessage.sender);
              } else {
                console.warn("[Chat Realtime] Sender not found in participants for sender_id:", payload.new.sender_id);
              }

              onNewMessage(newMessage);
            }
          }
        )
        .subscribe((status, err) => {
          console.log("[Chat Realtime] Subscription status:", {
            conversationId,
            status,
            participantsCount: participantsRef.current.length,
            error: err || null
          });
          if (isMounted) {
            setIsConnected(status === "SUBSCRIBED");
            if (status === "SUBSCRIBED") {
              setError(null);
              console.log("[Chat Realtime] ✅ Successfully subscribed to messages channel");
              console.log("[Chat Realtime] Listening for INSERT events on messages table");
              console.log("[Chat Realtime] Filter: conversation_id =", conversationId);
            } else if (status === "CHANNEL_ERROR") {
              const errorMsg = err?.message || "Failed to subscribe to messages channel";
              setError(errorMsg);
              console.error("[Chat Realtime] ❌ Channel error:", err);
            } else if (status === "CLOSED") {
              console.warn("[Chat Realtime] ⚠️ Channel closed. This may be normal if reconnecting.");
            } else if (status === "TIMED_OUT") {
              setError("Subscription timed out");
              console.error("[Chat Realtime] ❌ Subscription timed out");
            }
          }
        });

      subscriptions.push({ unsubscribe: () => messagesChannel.unsubscribe() });

      // Subscribe to conversation updates (for unread counts, etc.)
      if (onConversationUpdate) {
        const conversationsChannel = supabase
          .channel(`conversations:${conversationId}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "conversations",
              filter: `id=eq.${conversationId}`,
            },
            (payload) => {
              if (isMounted && onConversationUpdate) {
                // Map the payload to ConversationWithParticipants format
                const updatedConversation: ConversationWithParticipants = {
                  id: payload.new.id,
                  type: payload.new.type,
                  title: payload.new.title,
                  created_by: payload.new.created_by,
                  created_at: payload.new.created_at,
                  updated_at: payload.new.updated_at,
                };
                onConversationUpdate(updatedConversation);
              }
            }
          )
          .subscribe();

        subscriptions.push({ unsubscribe: () => conversationsChannel.unsubscribe() });
      }

      subscriptionsRef.current = subscriptions;

      return () => {
        isMounted = false;
        subscriptions.forEach((sub) => sub.unsubscribe());
        subscriptionsRef.current = [];
      };
    } catch (err) {
      if (isMounted) {
        const errorMessage = err instanceof Error ? err.message : "Failed to initialize realtime";
        setError(errorMessage);
        setIsConnected(false);
        console.error("[Chat Realtime] Error:", err);
      }
    }
  }, [conversationId, onNewMessage, onConversationUpdate, enabled]);

  return { isConnected, error };
}

/**
 * Hook for realtime conversation list updates (teacher view)
 * Subscribes to all conversations the user is part of
 */
interface UseConversationsRealtimeOptions {
  onConversationUpdate?: (conversationId: string, updates: Partial<ConversationWithParticipants>) => void;
  onNewConversation?: (conversation: ConversationWithParticipants) => void;
  enabled?: boolean;
}

export function useConversationsRealtime({
  onConversationUpdate,
  onNewConversation,
  enabled = true,
}: UseConversationsRealtimeOptions): UseChatRealtimeReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionsRef = useRef<Array<{ unsubscribe: () => void }>>([]);

  useEffect(() => {
    if (!enabled || !isSupabaseAvailable()) {
      setError("Supabase realtime is not available");
      return;
    }

    let isMounted = true;

    try {
      const supabase = getSupabaseClient();
      const subscriptions: Array<{ unsubscribe: () => void }> = [];

      // Subscribe to conversation updates
      if (onConversationUpdate) {
        const conversationsChannel = supabase
          .channel("conversations:updates")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "conversations",
            },
            (payload) => {
              if (isMounted && onConversationUpdate) {
                const updates: Partial<ConversationWithParticipants> = {
                  id: payload.new.id,
                  type: payload.new.type,
                  title: payload.new.title,
                  updated_at: payload.new.updated_at,
                };
                onConversationUpdate(payload.new.id, updates);
              }
            }
          )
          .subscribe((status) => {
            if (isMounted) {
              setIsConnected(status === "SUBSCRIBED");
              if (status === "SUBSCRIBED") {
                setError(null);
              }
            }
          });

        subscriptions.push({ unsubscribe: () => conversationsChannel.unsubscribe() });
      }

      // Subscribe to new conversations (via conversation_participants)
      if (onNewConversation) {
        const participantsChannel = supabase
          .channel("conversations:new")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "conversation_participants",
            },
            async (payload) => {
              // Note: This only notifies when a participant is added
              // We'd need to fetch the full conversation separately
              // For now, this is just a notification mechanism
              if (isMounted && onNewConversation) {
                // We'd need to fetch the conversation details from the API
                // This is a simplified version
                console.log("[Chat Realtime] New participant added to conversation:", payload.new.conversation_id);
              }
            }
          )
          .subscribe();

        subscriptions.push({ unsubscribe: () => participantsChannel.unsubscribe() });
      }

      subscriptionsRef.current = subscriptions;

      return () => {
        isMounted = false;
        subscriptions.forEach((sub) => sub.unsubscribe());
        subscriptionsRef.current = [];
      };
    } catch (err) {
      if (isMounted) {
        const errorMessage = err instanceof Error ? err.message : "Failed to initialize realtime";
        setError(errorMessage);
        setIsConnected(false);
        console.error("[Chat Realtime] Error:", err);
      }
    }
  }, [onConversationUpdate, onNewConversation, enabled]);

  return { isConnected, error };
}

