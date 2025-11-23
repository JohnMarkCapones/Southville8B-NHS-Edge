/**
 * Student Chat Page
 * 
 * Allows students to view and participate in their section's group chat.
 * 
 * @module app/student/chat/page
 */

'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageList } from '@/components/chat/message-list';
import { MessageInput } from '@/components/chat/message-input';
import { ParticipantsList } from '@/components/chat/participants-list';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  getConversations,
  getMessages,
  sendMessage as sendChatMessage,
  markAsRead,
  type ConversationWithParticipants,
  type MessageWithSender,
} from '@/lib/api/chat';
import { getCurrentUser } from '@/lib/api/endpoints/auth';
import { MessageSquare, Users, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { UserProfileResponse } from '@/lib/api/endpoints/auth';
import { useChatRealtime } from '@/hooks/use-chat-realtime';
import { isSupabaseAvailable } from '@/lib/supabase/client';

export default function StudentChatPage() {
  const [conversation, setConversation] = React.useState<ConversationWithParticipants | null>(null);
  const [messages, setMessages] = React.useState<MessageWithSender[]>([]);
  const [messageText, setMessageText] = React.useState('');
  const [isLoadingConversation, setIsLoadingConversation] = React.useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(false);
  const [isSendingMessage, setIsSendingMessage] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<UserProfileResponse | null>(null);
  const [currentUserId, setCurrentUserId] = React.useState<string | undefined>();
  const [chatServiceAvailable, setChatServiceAvailable] = React.useState<boolean>(true);
  const [chatServiceError, setChatServiceError] = React.useState<string | null>(null);
  
  // Track if conversation has been marked as read
  const markedAsReadRef = React.useRef<string | null>(null);

  // Load current user
  React.useEffect(() => {
    async function loadCurrentUser() {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        setCurrentUserId(user.id);
      } catch (error) {
        console.error('Failed to load current user:', error);
        toast.error('Failed to load user information');
      }
    }
    loadCurrentUser();
  }, []);

  // Load student's section group chat
  React.useEffect(() => {
    async function loadSectionChat() {
      try {
        setIsLoadingConversation(true);
        
        // Get all conversations and find the section group chat
        const response = await getConversations(1, 50);
        const sectionChat = response.conversations?.find(
          conv => conv.type === 'group_section'
        );

        if (sectionChat) {
          setConversation(sectionChat);
        } else {
          toast.info('No section chat available yet. Your teacher will create it.');
        }
      } catch (error: any) {
        console.error('Failed to load section chat:', error);
        if (error?.status === 0 || error?.isNetworkError) {
          setChatServiceAvailable(false);
          setChatServiceError(error?.message || 'Chat service is unavailable');
        } else {
          toast.error(error?.message || 'Failed to load section chat');
        }
      } finally {
        setIsLoadingConversation(false);
      }
    }

    if (currentUser) {
      loadSectionChat();
    }
  }, [currentUser]);

  // Load messages when conversation is loaded (initial load only)
  React.useEffect(() => {
    if (!conversation) {
      setMessages([]);
      markedAsReadRef.current = null;
      return;
    }

    async function loadMessages() {
      try {
        setIsLoadingMessages(true);
        const response = await getMessages(conversation.id, 1, 100);
        setMessages(response.messages || []);
        
        // Mark conversation as read only once when first loaded
        if (markedAsReadRef.current !== conversation.id) {
          try {
            await markAsRead(conversation.id);
            markedAsReadRef.current = conversation.id;
            setConversation(prev => prev ? { ...prev, unread_count: 0 } : null);
          } catch (error) {
            console.error('Failed to mark as read:', error);
          }
        }
      } catch (error: any) {
        console.error('Failed to load messages:', error);
        if (error?.status === 0 || error?.isNetworkError) {
          setChatServiceAvailable(false);
          setChatServiceError(error?.message || 'Chat service is unavailable');
        } else {
          toast.error(error?.message || 'Failed to load messages');
        }
      } finally {
        setIsLoadingMessages(false);
      }
    }

    loadMessages();
  }, [conversation]);

  // Realtime subscription for new messages
  const handleNewMessage = React.useCallback((message: MessageWithSender) => {
    setMessages(prev => {
      // Avoid duplicates
      if (prev.some(msg => msg.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  // Realtime subscription for conversation updates
  const handleConversationUpdate = React.useCallback((updatedConversation: ConversationWithParticipants) => {
    setConversation(prev => {
      if (!prev || prev.id !== updatedConversation.id) {
        return prev;
      }
      return { ...prev, ...updatedConversation };
    });
  }, []);

  // Set up realtime subscriptions
  const { isConnected: isRealtimeConnected, error: realtimeError } = useChatRealtime({
    conversationId: conversation?.id || null,
    onNewMessage: handleNewMessage,
    onConversationUpdate: handleConversationUpdate,
    participants: conversation?.participants || [],
    enabled: chatServiceAvailable && isSupabaseAvailable() && !!conversation,
  });

  // Send message
  const handleSendMessage = async () => {
    if (!conversation || !messageText.trim() || isSendingMessage) return;

    const content = messageText.trim();
    setMessageText('');

    try {
      setIsSendingMessage(true);
      
      // Optimistic update
      const optimisticMessage: MessageWithSender = {
        id: `temp-${Date.now()}`,
        conversation_id: conversation.id,
        sender_id: currentUserId || '',
        content,
        message_type: 'text',
        created_at: new Date().toISOString(),
        sender: {
          id: currentUserId || '',
          full_name: currentUser?.full_name || 'You',
          email: currentUser?.email || '',
        },
      };
      setMessages(prev => [...prev, optimisticMessage]);

      const message = await sendChatMessage({
        conversationId: conversation.id,
        content,
        messageType: 'text',
      });

      // Enrich message with sender info from participants
      const enrichedMessage: MessageWithSender = message as MessageWithSender;
      const senderParticipant = conversation?.participants?.find(
        (p) => p.user_id === enrichedMessage.sender_id
      );
      if (senderParticipant?.user) {
        enrichedMessage.sender = senderParticipant.user;
      } else if (currentUserId && currentUserId === enrichedMessage.sender_id && currentUser) {
        // Fallback: if sender is current user, use current user info
        enrichedMessage.sender = {
          id: currentUserId,
          full_name: currentUser.full_name || "",
          email: currentUser.email || "",
        };
      }

      // Replace optimistic message with enriched real one
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? enrichedMessage : msg
      ));
    } catch (error: any) {
      console.error('Failed to send message:', error);
      if (error?.status === 0 || error?.isNetworkError) {
        setChatServiceAvailable(false);
        setChatServiceError(error?.message || 'Chat service is unavailable');
      } else {
        toast.error(error?.message || 'Failed to send message');
      }
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (isLoadingConversation) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex gap-4 h-[calc(100vh-8rem)]">
          <div className="flex-1 flex flex-col border rounded-lg">
            <div className="border-b p-4">
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="flex-1 p-4 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">No Section Chat Available</h2>
              <p className="text-sm text-muted-foreground">
                Your teacher hasn't created a group chat for your section yet. 
                Please wait for your teacher to set it up.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-8rem)]">
      {!chatServiceAvailable && chatServiceError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Chat Service Unavailable</AlertTitle>
          <AlertDescription>
            {chatServiceError}. Chat features are disabled. Please ensure the chat service is running.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex gap-4 h-full">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col border rounded-lg">
          {/* Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold flex items-center gap-2">
                  {conversation.title || 'Section Chat'}
                  <Badge variant="secondary">Group</Badge>
                </h2>
                <p className="text-sm text-muted-foreground">
                  {conversation.participants?.length || 0} participants
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            isLoading={isLoadingMessages}
            participants={conversation?.participants || []}
          />

          {/* Input */}
          <MessageInput
            value={messageText}
            onChange={setMessageText}
            onSend={handleSendMessage}
            disabled={isSendingMessage || !chatServiceAvailable}
            isLoading={isSendingMessage}
          />
        </div>

        {/* Right Sidebar - Participants */}
        <div className="w-64 flex flex-col border-l rounded-lg">
          <div className="border-b p-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participants
            </h3>
          </div>
          <ParticipantsList
            participants={conversation.participants || []}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
}

