import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  getCachedChat,
  setCachedChat,
  updateCachedChatMessages,
} from "@/lib/chat-cache";

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type?: string | null;
  attachment_url?: string | null;
  created_at: string;
  // optional denormalized fields for UI
  sender_name?: string;
};

export interface UseSectionChatOptions {
  markAsReadOnMount?: boolean;
}

export interface UseSectionChatReturn {
  conversationId: string | null;
  messages: ChatMessage[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  participantsMap: Map<
    string,
    { full_name: string; email?: string; role?: string }
  >;
}

function calculateUnread(
  messages: ChatMessage[],
  lastReadIso?: string | null
): number {
  if (!messages.length) return 0;
  if (!lastReadIso) return messages.length;
  const lastRead = new Date(lastReadIso).getTime();
  return messages.filter((m) => new Date(m.created_at).getTime() > lastRead)
    .length;
}

function getDevelopmentHost(): string | null {
  const debuggerHost =
    Constants.expoGo?.debuggerHost ??
    Constants.expoGo?.hostUri ??
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ??
    (Constants as any).manifest2?.extra?.expoGo?.hostUri ??
    null;
  if (!debuggerHost) return null;
  const [host] = String(debuggerHost).split(":");
  if (!host || host === "localhost" || host === "127.0.0.1") return null;
  return host;
}

function resolveChatServiceBase(): string | undefined {
  // 1) Explicit env wins
  const envUrl = process.env.EXPO_PUBLIC_CHAT_SERVICE_URL;
  if (envUrl && envUrl.trim().length > 0) return envUrl.trim();

  // 2) Derive from Expo host in dev
  if (__DEV__) {
    const host = getDevelopmentHost();
    if (host) return `http://${host}:3001`;
    if (Platform.OS === "android") return "http://10.0.2.2:3001";
    if (Platform.OS === "ios") return "http://127.0.0.1:3001";
    return "http://localhost:3001";
  }

  // 3) Production requires explicit env
  return undefined;
}

async function getSupabaseAuthToken(
  tokens: { accessToken: string } | null
): Promise<string | null> {
  // First, try to use the stored token from auth session (same token used for API calls)
  if (tokens?.accessToken) {
    if (__DEV__) {
      console.log(
        "[useSectionChat] Using stored auth token:",
        `${tokens.accessToken.substring(0, 20)}...`
      );
    }
    return tokens.accessToken;
  }

  // Fallback: try to get Supabase session if available
  if (!supabase) {
    if (__DEV__)
      console.warn("[useSectionChat] Supabase not available for auth token");
    return null;
  }
  try {
    const { data: session, error } = await supabase.auth.getSession();
    if (error) {
      if (__DEV__)
        console.warn(
          "[useSectionChat] Failed to get Supabase session:",
          error.message
        );
      return null;
    }
    const token = session?.session?.access_token || null;
    if (__DEV__) {
      console.log(
        "[useSectionChat] Token from Supabase session:",
        token ? `${token.substring(0, 20)}...` : "null"
      );
    }
    return token;
  } catch (e) {
    if (__DEV__)
      console.warn("[useSectionChat] Error getting Supabase session:", e);
    return null;
  }
}

export function useSectionChat(
  options?: UseSectionChatOptions
): UseSectionChatReturn {
  const { user } = useCurrentUser();
  const { tokens } = useAuthSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastReadAt, setLastReadAt] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const hasMarkedReadRef = useRef<boolean>(false);
  const hasBootstrappedRef = useRef<boolean>(false);
  // Store participants map in ref so it's accessible in realtime callback
  const participantsMapRef = useRef<
    Map<string, { full_name: string; email?: string; role?: string }>
  >(new Map());

  const chatServiceBase = resolveChatServiceBase();
  if (__DEV__) {
    console.log("[useSectionChat] Resolved chatServiceBase:", chatServiceBase);
  }

  // Resolve the actual conversation id from the chat service and load initial messages
  useEffect(() => {
    // Wait for user to be loaded
    if (!user) {
      if (__DEV__) console.log("[useSectionChat] Waiting for user data...");
      return;
    }

    // Authenticate Supabase client with stored token if available
    // This ensures RLS policies work correctly
    if (supabase && tokens?.accessToken) {
      supabase.auth
        .setSession({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken || "",
        })
        .catch((e) => {
          if (__DEV__)
            console.warn("[useSectionChat] Failed to set Supabase session:", e);
        });
    }

    // Reset bootstrap flag when user changes
    hasBootstrappedRef.current = false;

    let cancelled = false;
    async function bootstrap() {
      // Prevent double bootstrap for same user
      if (hasBootstrappedRef.current) {
        if (__DEV__)
          console.log("[useSectionChat] Bootstrap already ran, skipping");
        return;
      }
      hasBootstrappedRef.current = true;

      try {
        setLoading(true);
        setError(null);
        // Don't clear messages immediately - keep existing until new ones load

        const sectionId = user?.student?.section_id || null;
        if (__DEV__) {
          console.log(
            "[useSectionChat] bootstrap sectionId:",
            sectionId,
            "user:",
            user?.id,
            "student:",
            !!user?.student
          );
        }
        if (!sectionId) {
          if (__DEV__)
            console.warn("[useSectionChat] No section_id found for user");
          setConversationId(null);
          setLoading(false);
          return;
        }

        // Try to resolve conversation ID from chat service (if available)
        // Also extract participant user info for sender names
        let resolvedConvId: string | null = null;
        const participantsMap = new Map<
          string,
          { full_name: string; email?: string; role?: string }
        >();

        if (chatServiceBase) {
          const base = chatServiceBase.replace(/\/$/, "");
          // API only accepts page and limit, returns all user conversations
          const listUrl = `${base}/api/v1/chat/conversations?limit=50`;
          if (__DEV__) console.log("[useSectionChat] GET", listUrl);
          try {
            const authToken = await getSupabaseAuthToken(tokens);
            const headers: HeadersInit = { "Content-Type": "application/json" };
            if (authToken) {
              headers["Authorization"] = `Bearer ${authToken}`;
              if (__DEV__)
                console.log(
                  "[useSectionChat] Including auth token in GET request"
                );
            } else {
              if (__DEV__)
                console.warn(
                  "[useSectionChat] No auth token available for GET request"
                );
            }

            const convResp = await fetch(listUrl, { headers });
            if (convResp.ok) {
              const convData = await convResp.json().catch(() => undefined);
              if (__DEV__) {
                console.log(
                  "[useSectionChat] conversations resp status:",
                  convResp.status,
                  !!convData
                );
                console.log(
                  "[useSectionChat] conversations response:",
                  JSON.stringify(convData, null, 2).substring(0, 500)
                );
              }
              // API returns { conversations: [...], total, page, limit }
              const conversations = Array.isArray(convData?.conversations)
                ? convData.conversations
                : Array.isArray(convData?.data)
                ? convData.data
                : Array.isArray(convData)
                ? convData
                : [];

              if (__DEV__) {
                console.log(
                  "[useSectionChat] Parsed conversations count:",
                  conversations.length
                );
                console.log(
                  "[useSectionChat] Conversation types:",
                  conversations.map((c: any) => ({
                    id: c.id,
                    type: c.type,
                    title: c.title,
                  }))
                );
              }

              // Filter for group_section conversations
              const sectionConv = conversations.find(
                (c: any) => c.type === "group_section"
              );
              resolvedConvId = sectionConv?.id ?? null;

              // Extract participant user info for sender names and roles
              if (
                sectionConv?.participants &&
                Array.isArray(sectionConv.participants)
              ) {
                sectionConv.participants.forEach((p: any) => {
                  if (p.user && p.user.id) {
                    participantsMap.set(p.user.id, {
                      full_name: p.user.full_name || p.user.email || "Unknown",
                      email: p.user.email,
                      role: p.role, // Store role (admin, teacher, student)
                    });
                  }
                });
                // Store in ref for use in realtime callback
                participantsMapRef.current = new Map(participantsMap);
                if (__DEV__) {
                  console.log(
                    "[useSectionChat] Extracted participants map:",
                    Array.from(participantsMap.entries())
                  );
                }
              }

              if (resolvedConvId && __DEV__) {
                console.log(
                  "[useSectionChat] Found section conversation from API:",
                  resolvedConvId,
                  sectionConv.title
                );
              } else if (__DEV__) {
                console.warn(
                  "[useSectionChat] No group_section conversation found in API response"
                );
              }
            } else {
              const fallbackText = await convResp.text().catch(() => "");
              if (__DEV__)
                console.warn(
                  "[useSectionChat] conversations non-200:",
                  convResp.status,
                  fallbackText?.slice(0, 200)
                );
            }
          } catch (e) {
            if (__DEV__)
              console.warn(
                "[useSectionChat] Chat service lookup failed, using Supabase:",
                e
              );
          }
        }

        // Fallback: Find conversation_id by querying conversation_participants directly
        // This will work after RLS fix is applied, and finds conversations the user is actually in
        if (!resolvedConvId && supabase && user?.id) {
          if (__DEV__)
            console.log(
              "[useSectionChat] Looking up user's conversations via conversation_participants"
            );
          try {
            // Query conversation_participants to find conversations this user is in
            // Then filter for group_section type by joining with conversations
            const { data: participantsData, error: participantsError } = await (
              supabase as any
            )
              .from("conversation_participants")
              .select(
                `
								conversation_id,
								conversations(id, type, title)
							`
              )
              .eq("user_id", user.id)
              .limit(10);

            if (__DEV__) {
              console.log("[useSectionChat] Participants query result:", {
                hasData: !!participantsData,
                count: participantsData?.length || 0,
                error: participantsError,
                sample: participantsData?.[0],
              });
            }

            if (
              !participantsError &&
              participantsData &&
              participantsData.length > 0
            ) {
              // Filter for group_section conversations
              const sectionConvs = participantsData.filter(
                (p: any) =>
                  p.conversations && p.conversations.type === "group_section"
              );

              if (__DEV__) {
                console.log(
                  "[useSectionChat] Filtered section conversations:",
                  sectionConvs.length
                );
              }

              if (sectionConvs.length > 0) {
                // Use the first group_section conversation found
                resolvedConvId = sectionConvs[0].conversation_id;
                if (__DEV__)
                  console.log(
                    "[useSectionChat] Found conversation via participants:",
                    resolvedConvId
                  );
              } else if (__DEV__) {
                console.log(
                  "[useSectionChat] User has conversations but none are group_section type"
                );
                console.log(
                  "[useSectionChat] All conversation types:",
                  participantsData.map((p: any) => p.conversations?.type)
                );
              }
            } else if (participantsError && __DEV__) {
              console.warn(
                "[useSectionChat] Participants query error:",
                participantsError
              );
            }

            // If participants query didn't work or found nothing, try direct conversations query
            if (!resolvedConvId) {
              if (__DEV__)
                console.log(
                  "[useSectionChat] Trying direct conversations query for group_section"
                );
              const { data: convsData, error: convsError } = await (
                supabase as any
              )
                .from("conversations")
                .select("id, type, title")
                .eq("type", "group_section")
                .limit(10);

              if (!convsError && convsData && convsData.length > 0) {
                // Check which conversation has messages for this section
                for (const conv of convsData) {
                  const { data: msgCheck } = await (supabase as any)
                    .from("messages")
                    .select("id")
                    .eq("conversation_id", conv.id)
                    .limit(1);

                  if (msgCheck && msgCheck.length > 0) {
                    resolvedConvId = conv.id;
                    if (__DEV__)
                      console.log(
                        "[useSectionChat] Found section conversation with messages:",
                        resolvedConvId
                      );
                    break;
                  }
                }

                // If no messages found, use first group_section conversation
                if (!resolvedConvId && convsData.length > 0) {
                  resolvedConvId = convsData[0].id;
                  if (__DEV__)
                    console.log(
                      "[useSectionChat] Using first group_section conversation:",
                      resolvedConvId
                    );
                }
              }
            }
          } catch (e) {
            if (__DEV__)
              console.warn(
                "[useSectionChat] Supabase conversation lookup error:",
                e
              );
          }
        }

        // Last fallback: use section id directly (may not work if conversation_id != section_id)
        if (!resolvedConvId) {
          resolvedConvId = sectionId;
          if (__DEV__)
            console.warn(
              "[useSectionChat] Using section_id as conversation_id (may not match):",
              resolvedConvId
            );
        }

        if (!cancelled) {
          setConversationId(resolvedConvId);
        }

        // Try to load from cache first (if conversationId is available)
        if (resolvedConvId && !cancelled) {
          try {
            const cached = await getCachedChat(resolvedConvId);
            if (cached && !cancelled) {
              if (__DEV__)
                console.log(
                  "[useSectionChat] Loaded from cache:",
                  cached.messages.length,
                  "messages"
                );
              // Show cached messages immediately
              setMessages(cached.messages);
              // Restore participants map from cache
              if (cached.participantsMap) {
                participantsMapRef.current = new Map(
                  Object.entries(cached.participantsMap)
                );
                // Also update the local participantsMap for sender name resolution
                Object.entries(cached.participantsMap).forEach(([id, data]) => {
                  participantsMap.set(id, data);
                });
              }
              // Set loading to false so UI shows cached data immediately
              setLoading(false);
            }
          } catch (cacheError) {
            if (__DEV__)
              console.warn("[useSectionChat] Error loading cache:", cacheError);
            // Continue with API fetch if cache fails
          }
        }

        // Load messages directly from Supabase (background refresh)
        if (supabase && resolvedConvId && !cancelled) {
          if (__DEV__)
            console.log(
              "[useSectionChat] Fetching messages from Supabase for conv:",
              resolvedConvId
            );

          // Try with join first
          const { data: messagesData, error: messagesError } = await (
            supabase as any
          )
            .from("messages")
            .select(
              `
							id,
							conversation_id,
							sender_id,
							content,
							message_type,
							attachment_url,
							created_at,
							sender:users!messages_sender_id_fkey(full_name, email)
						`
            )
            .eq("conversation_id", resolvedConvId)
            .order("created_at", { ascending: true })
            .limit(100);

          if (messagesError) {
            if (__DEV__)
              console.warn(
                "[useSectionChat] Join failed, trying simple query:",
                messagesError.message,
                messagesError
              );
            // Fallback: fetch messages and users separately
            const { data: simpleData, error: simpleError } = await (
              supabase as any
            )
              .from("messages")
              .select("*")
              .eq("conversation_id", resolvedConvId)
              .order("created_at", { ascending: true })
              .limit(100);

            if (__DEV__) {
              console.log("[useSectionChat] Simple query result:", {
                hasData: !!simpleData,
                dataLength: simpleData?.length || 0,
                error: simpleError,
              });
            }

            if (!simpleError && simpleData && simpleData.length > 0) {
              // Fetch sender names separately
              const senderIds = [
                ...new Set(
                  simpleData.map((m: any) => m.sender_id).filter(Boolean)
                ),
              ];
              if (__DEV__)
                console.log(
                  "[useSectionChat] Fetching users for sender IDs:",
                  senderIds
                );

              const { data: usersData, error: usersError } = await (
                supabase as any
              )
                .from("users")
                .select("id, full_name, email")
                .in("id", senderIds);

              if (__DEV__)
                console.log("[useSectionChat] Users query result:", {
                  hasData: !!usersData,
                  usersCount: usersData?.length || 0,
                  error: usersError,
                });

              const usersMap = new Map(
                (usersData || []).map((u: any) => [u.id, u])
              );
              const normalized = simpleData.map((m: any) => ({
                id: m.id,
                conversation_id: m.conversation_id,
                sender_id: m.sender_id,
                content: m.content,
                message_type: m.message_type ?? null,
                attachment_url: m.attachment_url ?? null,
                created_at: m.created_at,
                sender_name: usersMap.get(m.sender_id)?.full_name ?? null,
              })) as ChatMessage[];

              if (!cancelled) {
                setMessages(normalized);
                if (__DEV__)
                  console.log(
                    "[useSectionChat] Loaded",
                    normalized.length,
                    "messages from Supabase",
                    normalized.slice(0, 2)
                  );
                // Save to cache after successful fetch
                try {
                  await setCachedChat(resolvedConvId, {
                    messages: normalized,
                    conversationId: resolvedConvId,
                    participantsMap: Object.fromEntries(participantsMap),
                  });
                } catch (cacheError) {
                  if (__DEV__)
                    console.warn(
                      "[useSectionChat] Error saving cache:",
                      cacheError
                    );
                }
              }
            } else if (simpleError) {
              console.error(
                "[useSectionChat] Simple query error:",
                simpleError
              );
            } else {
              if (__DEV__)
                console.warn(
                  "[useSectionChat] No messages found for conversation:",
                  resolvedConvId
                );
            }
          } else if (messagesData) {
            if (__DEV__)
              console.log(
                "[useSectionChat] Join query succeeded, messagesData:",
                messagesData.length,
                messagesData.slice(0, 2)
              );
            // Handle joined result
            let normalized = messagesData.map((m: any) => ({
              id: m.id,
              conversation_id: m.conversation_id,
              sender_id: m.sender_id,
              content: m.content,
              message_type: m.message_type ?? null,
              attachment_url: m.attachment_url ?? null,
              created_at: m.created_at,
              sender_name: m.sender?.full_name ?? null,
            })) as ChatMessage[];

            // If sender names are missing, try to get them from participants map first
            // (from API response), then fallback to Supabase query
            const missingSenderIds = normalized
              .filter((m) => !m.sender_name && m.sender_id)
              .map((m) => m.sender_id);

            if (missingSenderIds.length > 0) {
              // First, try using participants map from API response
              if (participantsMap.size > 0) {
                let foundFromMap = 0;
                normalized = normalized.map((m: any) => {
                  if (!m.sender_name && m.sender_id) {
                    const participant = participantsMap.get(m.sender_id);
                    if (participant) {
                      foundFromMap++;
                      return { ...m, sender_name: participant.full_name };
                    }
                  }
                  return m;
                }) as ChatMessage[];
                // Update ref with the participants map for realtime callback
                participantsMapRef.current = new Map(participantsMap);
                if (__DEV__) {
                  console.log(
                    "[useSectionChat] Found",
                    foundFromMap,
                    "sender names from participants map"
                  );
                }
              }

              // If still missing, try Supabase query (may fail due to RLS)
              const stillMissing = normalized
                .filter((m) => !m.sender_name && m.sender_id)
                .map((m) => m.sender_id);

              if (stillMissing.length > 0) {
                if (__DEV__)
                  console.log(
                    "[useSectionChat] Fetching remaining sender names from Supabase for IDs:",
                    stillMissing
                  );
                const { data: usersData, error: usersError } = await (
                  supabase as any
                )
                  .from("users")
                  .select("id, full_name, email")
                  .in("id", [...new Set(stillMissing)]);

                if (__DEV__) {
                  console.log("[useSectionChat] Users query result:", {
                    hasData: !!usersData,
                    count: usersData?.length || 0,
                    error: usersError,
                    sample: usersData?.[0],
                  });
                }

                if (!usersError && usersData && usersData.length > 0) {
                  const usersMap = new Map(
                    (usersData || []).map((u: any) => [u.id, u])
                  );
                  normalized = normalized.map((m: any) => ({
                    ...m,
                    sender_name:
                      m.sender_name ||
                      usersMap.get(m.sender_id)?.full_name ||
                      null,
                  })) as ChatMessage[];
                  if (__DEV__)
                    console.log(
                      "[useSectionChat] Fetched sender names for",
                      usersData.length,
                      "users from Supabase"
                    );
                } else if (usersError && __DEV__) {
                  console.warn(
                    "[useSectionChat] Users query error:",
                    usersError
                  );
                } else if (__DEV__) {
                  console.warn(
                    "[useSectionChat] Users query returned empty - RLS may be blocking"
                  );
                }
              }
            }

            if (!cancelled) {
              setMessages(normalized);
              if (__DEV__)
                console.log(
                  "[useSectionChat] Loaded",
                  normalized.length,
                  "messages from Supabase (with join)",
                  normalized.slice(0, 2)
                );
              // Save to cache after successful fetch
              try {
                await setCachedChat(resolvedConvId, {
                  messages: normalized,
                  conversationId: resolvedConvId,
                  participantsMap: Object.fromEntries(participantsMap),
                });
              } catch (cacheError) {
                if (__DEV__)
                  console.warn(
                    "[useSectionChat] Error saving cache:",
                    cacheError
                  );
              }
            }
          } else {
            if (__DEV__)
              console.warn(
                "[useSectionChat] No messagesData and no error - empty result for conv:",
                resolvedConvId
              );
          }
        }

        if (!cancelled) {
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : String(e);
          setError(message);
          console.error("[useSectionChat] bootstrap error:", message);
          // Still fallback to section id so realtime can work if configured this way
          const sectionId = user?.student?.section_id || null;
          setConversationId(sectionId);
          setLoading(false);
        }
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [user, user?.student?.section_id, chatServiceBase, tokens?.accessToken]);

  // Subscribe to realtime
  useEffect(() => {
    let active = true;
    if (!conversationId) {
      return;
    }
    if (!supabase) {
      console.warn(
        "[useSectionChat] Supabase not available - realtime disabled"
      );
      return;
    }

    if (__DEV__)
      console.log(
        "[useSectionChat] Subscribing realtime for conv:",
        conversationId
      );
    // don't alter existing messages; just append as realtime arrives
    const channel = supabase
      .channel(`messages:section:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload: any) => {
          if (!active) return;
          const msg: ChatMessage = {
            id: payload.new.id,
            conversation_id: payload.new.conversation_id,
            sender_id: payload.new.sender_id,
            content: payload.new.content,
            message_type: payload.new.message_type ?? null,
            attachment_url: payload.new.attachment_url ?? null,
            created_at: payload.new.created_at,
          };

          // Fetch sender name if available (try participants map first, then Supabase)
          if (msg.sender_id && !msg.sender_name) {
            // Try participants map first (from API response)
            const participant = participantsMapRef.current.get(msg.sender_id);
            if (participant) {
              msg.sender_name = participant.full_name;
              if (__DEV__)
                console.log(
                  "[useSectionChat] Using sender name from participants map:",
                  msg.sender_name
                );
            } else if (supabase) {
              // Fallback to Supabase query
              const { data: userData, error: userError } = await (
                supabase as any
              )
                .from("users")
                .select("full_name")
                .eq("id", msg.sender_id)
                .single();
              if (userData && !userError) {
                msg.sender_name = userData.full_name;
                if (__DEV__)
                  console.log(
                    "[useSectionChat] Fetched sender name for realtime message:",
                    msg.sender_name
                  );
              } else if (__DEV__) {
                console.warn(
                  "[useSectionChat] Failed to fetch sender name:",
                  userError
                );
              }
            }
          }

          if (__DEV__)
            console.log(
              "[useSectionChat] Realtime message:",
              msg.id,
              msg.sender_name
            );
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === msg.id)) return prev;
            const updated = [...prev, msg];
            // Update cache with new message
            if (conversationId) {
              updateCachedChatMessages(conversationId, [msg], "append").catch(
                (cacheError) => {
                  if (__DEV__)
                    console.warn(
                      "[useSectionChat] Error updating cache with realtime message:",
                      cacheError
                    );
                }
              );
            }
            return updated;
          });
        }
      )
      .subscribe((status: any) => {
        if (__DEV__) console.log("[useSectionChat] Realtime status:", status);
        if (status === "SUBSCRIBED") {
          // leave loading state as is; initial history loader controls it
        }
      });

    return () => {
      active = false;
      channel.unsubscribe();
    };
  }, [conversationId]);

  const unreadCount = useMemo(
    () => calculateUnread(messages, lastReadAt),
    [messages, lastReadAt]
  );

  const markAsRead = useCallback(async () => {
    if (hasMarkedReadRef.current) return;
    hasMarkedReadRef.current = true;
    setLastReadAt(new Date().toISOString());
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !conversationId) return;
      // Prefer chat service if configured/derived
      if (chatServiceBase) {
        const url = `${chatServiceBase.replace(
          /\/$/,
          ""
        )}/api/v1/chat/messages`;
        if (__DEV__)
          console.log("[useSectionChat] POST", url, { conversationId });

        const authToken = await getSupabaseAuthToken(tokens);
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`;
          if (__DEV__)
            console.log(
              "[useSectionChat] Including auth token in POST request"
            );
        } else {
          if (__DEV__)
            console.warn(
              "[useSectionChat] No auth token available for POST request"
            );
        }

        const resp = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({ conversationId, content }),
        });
        if (!resp.ok) {
          const text = await resp.text().catch(() => "");
          console.warn(
            "[useSectionChat] sendMessage failed:",
            resp.status,
            text?.slice(0, 200)
          );
          throw new Error(`Failed to send message: ${resp.status}`);
        }
        // Cache will be updated via realtime subscription when message arrives
        // But we can also refresh cache after a short delay to ensure it's up to date
        return;
      }
      // Fallback: insert directly (requires Supabase RLS/config)
      if (!supabase) throw new Error("Realtime not configured");
      const { error: insertError } = await (supabase as any)
        .from("messages")
        .insert({ conversation_id: conversationId, content });
      if (insertError) throw new Error(insertError.message);
      // Cache will be updated via realtime subscription when message arrives
    },
    [chatServiceBase, conversationId, tokens]
  );

  return {
    conversationId,
    messages,
    unreadCount,
    loading,
    error,
    sendMessage,
    markAsRead,
    participantsMap: participantsMapRef.current,
  };
}

export { calculateUnread };
