/**
 * Teacher Chat Page
 *
 * Allows teachers to chat with all their students via group chat by section.
 *
 * @module app/teacher/chat/page
 */

"use client";

import * as React from "react";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { ParticipantsList } from "@/components/chat/participants-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  getMySections,
  type SectionWithStudents,
} from "@/lib/api/endpoints/sections";
import {
  getConversations,
  getMessages,
  sendMessage as sendChatMessage,
  createSectionGroupChat,
  markAsRead,
} from "@/lib/api/chat";
import type {
  ConversationWithParticipants,
  MessageWithSender,
} from "@/types/chat";
import { getCurrentUser } from "@/lib/api/endpoints/auth";
import { MessageSquare, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { UserProfileResponse } from "@/lib/api/types";
import { useChatRealtime } from "@/hooks/use-chat-realtime";
import { isSupabaseAvailable } from "@/lib/supabase/client";

export default function TeacherChatPage() {
  const [sections, setSections] = React.useState<SectionWithStudents[]>([]);
  const [conversations, setConversations] = React.useState<
    ConversationWithParticipants[]
  >([]);
  const [selectedConversationId, setSelectedConversationId] = React.useState<
    string | null
  >(null);
  const [selectedSectionId, setSelectedSectionId] = React.useState<
    string | null
  >(null);
  const [messages, setMessages] = React.useState<MessageWithSender[]>([]);
  const [messageText, setMessageText] = React.useState("");
  const [isLoadingSections, setIsLoadingSections] = React.useState(true);
  const [isLoadingConversations, setIsLoadingConversations] =
    React.useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(false);
  const [isSendingMessage, setIsSendingMessage] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<
    string | undefined
  >();
  const [selectedConversation, setSelectedConversation] =
    React.useState<ConversationWithParticipants | null>(null);
  const [currentUser, setCurrentUser] =
    React.useState<UserProfileResponse | null>(null);
  const [chatServiceAvailable, setChatServiceAvailable] =
    React.useState<boolean>(true);
  const [chatServiceError, setChatServiceError] = React.useState<string | null>(
    null
  );

  // Track if conversation has been marked as read
  const markedAsReadRef = React.useRef<string | null>(null);

  // Get current user
  React.useEffect(() => {
    async function loadCurrentUser() {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        setCurrentUserId(user.id);
      } catch (error) {
        console.error("Failed to load current user:", error);
        toast.error("Failed to load user information");
      }
    }
    loadCurrentUser();
  }, []);

  // Load teacher's sections
  React.useEffect(() => {
    async function loadSections() {
      try {
        setIsLoadingSections(true);
        const data = await getMySections();
        setSections(data);
      } catch (error) {
        console.error("Failed to load sections:", error);
        toast.error("Failed to load sections");
      } finally {
        setIsLoadingSections(false);
      }
    }
    loadSections();
  }, []);

  // Load conversations (initial load only, updates come from realtime)
  React.useEffect(() => {
    let isMounted = true;

    async function loadConversations() {
      try {
        setIsLoadingConversations(true);
        const response = await getConversations(1, 50);
        if (isMounted) {
          setConversations(response.conversations || []);
        }
      } catch (error: any) {
        console.error("Failed to load conversations:", error);
        if (isMounted) {
          // Check if it's a network error (service unavailable)
          if (error?.status === 0 || error?.isNetworkError) {
            setChatServiceAvailable(false);
            setChatServiceError(
              error?.message || "Chat service is unavailable"
            );
          } else {
            toast.error(error?.message || "Failed to load conversations");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoadingConversations(false);
        }
      }
    }

    loadConversations();
  }, []);

  // Load messages when conversation is selected (initial load only)
  React.useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      markedAsReadRef.current = null;
      return;
    }

    let isMounted = true;

    async function loadMessages() {
      try {
        if (!isMounted) return;
        setIsLoadingMessages(true);
        const response = await getMessages(selectedConversationId!, 1, 100);
        if (!isMounted) return;
        setMessages(response.messages || []);

        // Mark conversation as read only once when first loaded
        if (markedAsReadRef.current !== selectedConversationId) {
          try {
            await markAsRead(selectedConversationId!);
            markedAsReadRef.current = selectedConversationId;
            // Update conversation unread count
            if (isMounted) {
              setConversations((prev) =>
                prev.map((conv) =>
                  conv.id === selectedConversationId
                    ? { ...conv, unread_count: 0 }
                    : conv
                )
              );
            }
          } catch (error) {
            console.error("Failed to mark as read:", error);
          }
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        if (isMounted) {
          toast.error("Failed to load messages");
        }
      } finally {
        if (isMounted) {
          setIsLoadingMessages(false);
        }
      }
    }

    loadMessages();
  }, [selectedConversationId]);

  // Realtime subscription for new messages
  const handleNewMessage = React.useCallback((message: MessageWithSender) => {
    console.log("[Teacher Chat] handleNewMessage called:", {
      messageId: message.id,
      senderId: message.sender_id,
      hasSender: !!message.sender,
      senderName: message.sender?.full_name,
    });

    setMessages((prev) => {
      // Avoid duplicates
      if (prev.some((msg) => msg.id === message.id)) {
        console.log("[Teacher Chat] Message already exists, skipping");
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  // Realtime subscription for conversation updates
  const handleConversationUpdate = React.useCallback(
    (conversation: ConversationWithParticipants) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversation.id ? { ...conv, ...conversation } : conv
        )
      );
    },
    []
  );

  // Set up realtime subscriptions
  const { isConnected: isRealtimeConnected, error: realtimeError } =
    useChatRealtime({
      conversationId: selectedConversationId,
      onNewMessage: handleNewMessage,
      onConversationUpdate: handleConversationUpdate,
      participants: selectedConversation?.participants || [],
      enabled: chatServiceAvailable && isSupabaseAvailable(),
    });

  // Debug: Log participants when they change
  React.useEffect(() => {
    if (selectedConversationId && selectedConversation?.participants) {
      console.log("[Teacher Chat] Participants updated:", {
        conversationId: selectedConversationId,
        participantsCount: selectedConversation.participants.length,
        participants: selectedConversation.participants.map((p) => ({
          user_id: p.user_id,
          hasUser: !!p.user,
          userName: p.user?.full_name,
        })),
      });
    }
  }, [selectedConversation?.participants, selectedConversationId]);

  // Update selected conversation object
  React.useEffect(() => {
    const conv = conversations.find((c) => c.id === selectedConversationId);
    setSelectedConversation(conv || null);
  }, [conversations, selectedConversationId]);

  // Create or access section group chat
  const handleSelectSection = async (sectionId: string) => {
    try {
      // Check if conversation already exists for this section
      const existingConv = conversations.find(
        (conv) =>
          conv.type === "group_section" && conv.title?.includes(sectionId)
      );

      if (existingConv) {
        setSelectedConversationId(existingConv.id);
        setSelectedSectionId(sectionId);
      } else {
        // Create new group chat for section
        const conversation = await createSectionGroupChat(sectionId);
        setSelectedConversationId(conversation.id);
        setSelectedSectionId(sectionId);

        // Reload conversations to include the new one
        const response = await getConversations(1, 50);
        setConversations(response.conversations || []);
      }
    } catch (error: any) {
      console.error("Failed to create/access section chat:", error);
      if (error?.status === 0 || error?.isNetworkError) {
        setChatServiceAvailable(false);
        setChatServiceError(error?.message || "Chat service is unavailable");
      } else {
        toast.error(error?.message || "Failed to access section chat");
      }
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!selectedConversationId || !messageText.trim() || isSendingMessage)
      return;

    const content = messageText.trim();
    setMessageText("");

    // Optimistic update - defined outside try block for error handling
    const optimisticMessage: MessageWithSender = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConversationId,
      sender_id: currentUserId || "",
      content,
      message_type: "text",
      created_at: new Date().toISOString(),
      sender: {
        id: currentUserId || "",
        full_name: currentUser?.full_name || "You",
        email: currentUser?.email || "",
      },
    };

    try {
      setIsSendingMessage(true);

      console.log("[Teacher Chat] Sending message (optimistic):", {
        optimisticId: optimisticMessage.id,
        senderId: optimisticMessage.sender_id,
        senderName: optimisticMessage.sender?.full_name,
        conversationId: selectedConversationId,
      });

      setMessages((prev) => [...prev, optimisticMessage]);

      const message = await sendChatMessage({
        conversationId: selectedConversationId,
        content,
        messageType: "text",
      });

      // Enrich message with sender info from participants
      const enrichedMessage: MessageWithSender = message as MessageWithSender;
      const senderParticipant = selectedConversation?.participants?.find(
        (p) => p.user_id === enrichedMessage.sender_id
      );
      if (senderParticipant?.user) {
        enrichedMessage.sender = senderParticipant.user;
      } else if (
        currentUserId &&
        currentUserId === enrichedMessage.sender_id &&
        currentUser
      ) {
        // Fallback: if sender is current user, use current user info
        enrichedMessage.sender = {
          id: currentUserId,
          full_name: currentUser.full_name || "",
          email: currentUser.email || "",
        };
      }

      console.log("[Teacher Chat] Message sent successfully:", {
        messageId: enrichedMessage.id,
        senderId: enrichedMessage.sender_id,
        hasSender: !!enrichedMessage.sender,
        senderName: enrichedMessage.sender?.full_name,
        enriched: !!senderParticipant,
      });

      // Replace optimistic message with enriched real one
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id ? enrichedMessage : msg
        )
      );
    } catch (error: any) {
      console.error("Failed to send message:", error);
      if (error?.status === 0 || error?.isNetworkError) {
        setChatServiceAvailable(false);
        setChatServiceError(error?.message || "Chat service is unavailable");
      } else {
        toast.error(error?.message || "Failed to send message");
      }
      // Remove optimistic message on error
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== optimisticMessage.id)
      );
    } finally {
      setIsSendingMessage(false);
    }
  };


  return (
    <div className="container mx-auto p-4 h-[calc(100vh-8rem)]">
      {!chatServiceAvailable && chatServiceError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Chat Service Unavailable</AlertTitle>
          <AlertDescription>
            {chatServiceError}. Chat features are disabled. Please ensure the
            chat service is running.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex gap-4 h-full">
        {/* Left Sidebar - Sections */}
        <div className="w-80 flex flex-col border-r bg-gradient-to-b from-muted/30 to-background rounded-l-xl">
          <div className="p-4 border-b bg-background/50 backdrop-blur-sm">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              My Sections
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Select a section to chat</p>
          </div>
          <ScrollArea className="flex-1">
            {isLoadingSections ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : sections.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">No sections assigned</p>
              </div>
            ) : (
              <div className="p-2">
                {sections.map((section) => {
                  // Find conversation for this section
                  const sectionConversation = conversations.find(
                    (conv) =>
                      conv.type === "group_section" &&
                      (conv.title?.includes(section.id) ||
                        conv.title === section.name)
                  );

                  // Use participant count from conversation if available, otherwise use section students
                  const participantCount =
                    sectionConversation?.participants?.length ||
                    section.students?.length ||
                    0;

                  const hasUnread = sectionConversation?.unread_count && sectionConversation.unread_count > 0;

                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSelectSection(section.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl transition-all duration-200 group relative mb-1",
                        selectedSectionId === section.id
                          ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-2 border-blue-500/20 shadow-sm"
                          : "hover:bg-accent/50 border-2 border-transparent"
                      )}
                    >
                      {hasUnread && (
                        <div className="absolute top-2 right-2">
                          <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">
                              {sectionConversation.unread_count > 9 ? '9+' : sectionConversation.unread_count}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-1.5">
                        <p className={cn(
                          "font-semibold text-sm",
                          selectedSectionId === section.id && "text-primary"
                        )}>
                          {section.name}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {section.grade_level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {participantCount === 0
                            ? "No students yet"
                            : `${participantCount} ${participantCount === 1 ? "student" : "students"}`
                          }
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col border rounded-xl shadow-sm overflow-hidden bg-background">
          {selectedConversationId ? (
            <>
              {/* Header */}
              <div className="border-b p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">
                        {selectedConversation?.title || "Section Chat"}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>{selectedConversation?.participants?.length || 0} participants</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {isRealtimeConnected && isSupabaseAvailable() && (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-0">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                      Connected
                    </Badge>
                  )}
                </div>
              </div>

              {/* Messages */}
              <MessageList
                messages={messages}
                currentUserId={currentUserId}
                isLoading={isLoadingMessages}
                participants={selectedConversation?.participants || []}
              />

              {/* Input */}
              <MessageInput
                value={messageText}
                onChange={setMessageText}
                onSend={handleSendMessage}
                disabled={isSendingMessage || !chatServiceAvailable}
                isLoading={isSendingMessage}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-muted/20 via-background to-muted/10">
              <div className="text-center max-w-sm px-4">
                <div className="mb-6 relative">
                  <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                    <MessageSquare className="h-12 w-12 text-primary" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Welcome to Section Chat
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Select a section from the sidebar to start chatting with your students. Stay connected and engaged!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Participants */}
        {selectedConversationId && selectedConversation && (
          <div className="w-96 flex flex-col border-l bg-gradient-to-b from-muted/30 to-background rounded-r-xl">
            <div className="border-b p-4 bg-background/50 backdrop-blur-sm">
              <h3 className="font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Participants
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedConversation.participants?.length || 0} members
              </p>
            </div>
            <ParticipantsList
              participants={selectedConversation.participants || []}
              currentUserId={currentUserId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
