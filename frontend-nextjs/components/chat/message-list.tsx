/**
 * Message List Component
 * 
 * Displays messages in a conversation with virtual scrolling support.
 * 
 * @module components/chat/message-list
 */

'use client';

import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageWithSender, ConversationParticipant } from '@/types/chat';

interface MessageListProps {
  messages: MessageWithSender[];
  currentUserId?: string;
  isLoading?: boolean;
  className?: string;
  participants?: ConversationParticipant[];
}

export function MessageList({
  messages,
  currentUserId,
  isLoading = false,
  className,
  participants = [],
}: MessageListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = React.useState(true);
  const prevMessagesLengthRef = React.useRef(0);
  const isUserScrollingRef = React.useRef(false);
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Check if user is near bottom of scroll area
  const isNearBottom = React.useCallback(() => {
    const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollElement) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const threshold = 100; // pixels from bottom
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  // Handle scroll events to detect manual scrolling
  const handleScroll = React.useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    isUserScrollingRef.current = true;
    setShouldAutoScroll(isNearBottom());
    
    // Reset scrolling flag after user stops scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 150);
  }, [isNearBottom]);

  // Attach scroll listener
  React.useEffect(() => {
    const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => {
        scrollElement.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [handleScroll]);

  // Initial scroll to bottom on mount (only within message area)
  React.useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (scrollElement) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: 'auto', // Instant scroll on initial load
          });
        });
      }
    }
  }, [isLoading]); // Only run when loading state changes

  // Auto-scroll to bottom only when:
  // 1. New messages arrive (length increased)
  // 2. User is near bottom OR it's the first load
  React.useEffect(() => {
    const messagesLength = messages.length;
    const prevLength = prevMessagesLengthRef.current;
    const hasNewMessages = messagesLength > prevLength;
    
    // Update ref for next comparison
    prevMessagesLengthRef.current = messagesLength;

    // Only auto-scroll if:
    // - New messages arrived AND (user is near bottom OR first load)
    // - OR it's initial load (prevLength was 0)
    if (hasNewMessages && (shouldAutoScroll || prevLength === 0)) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        // Use ScrollArea's internal viewport instead of scrollIntoView
        // This prevents scrolling the entire page
        const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
        if (scrollElement && messagesEndRef.current) {
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 100);
    }
  }, [messages, shouldAutoScroll]);

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const shouldShowDateSeparator = (currentMsg: MessageWithSender, prevMsg?: MessageWithSender) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.created_at).toDateString();
    const prevDate = new Date(prevMsg.created_at).toDateString();
    return currentDate !== prevDate;
  };

  // Always show avatar for every message
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Deduplicate messages by ID (keep the last occurrence of each ID)
  // Must be called before early returns to follow Rules of Hooks
  const uniqueMessages = React.useMemo(() => {
    const seen = new Map<string, MessageWithSender>();
    for (const message of messages) {
      seen.set(message.id, message);
    }
    return Array.from(seen.values());
  }, [messages]);

  // Helper to check if sender is a teacher
  const isTeacher = React.useCallback((senderId: string) => {
    const participant = participants.find(p => p.user_id === senderId);
    return participant?.role === 'teacher' || participant?.role === 'admin';
  }, [participants]);

  if (isLoading) {
    return (
      <div className={cn('flex-1 flex items-center justify-center', className)}>
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (uniqueMessages.length === 0) {
    return (
      <div className={cn('flex-1 flex items-center justify-center', className)}>
        <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn('flex-1', className)} ref={scrollRef}>
      <div className="p-4 space-y-4">
        {uniqueMessages.map((message, index) => {
          const isCurrentUser = message.sender_id === currentUserId;
          const prevMessage = index > 0 ? uniqueMessages[index - 1] : undefined;
          const showDateSeparator = shouldShowDateSeparator(message, prevMessage);

          return (
            <React.Fragment key={`${message.id}-${index}`}>
              {showDateSeparator && (
                <div className="flex items-center justify-center my-4">
                  <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {formatMessageDate(message.created_at)}
                  </div>
                </div>
              )}

              <div
                className={cn(
                  'flex gap-3',
                  isCurrentUser && 'flex-row-reverse'
                )}
              >
                <div className="relative">
                  <Avatar className={cn(
                    'h-8 w-8 flex-shrink-0',
                    isCurrentUser ? 'bg-emerald-500' : 'bg-blue-500'
                  )}>
                    <AvatarFallback className={cn(
                      'text-white text-xs font-semibold',
                      isCurrentUser ? 'bg-emerald-500' : 'bg-blue-500'
                    )}>
                      {getInitials(message.sender?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  {!isCurrentUser && isTeacher(message.sender_id) && (
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-0.5 border-2 border-background">
                      <GraduationCap className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>

                <div
                  className={cn(
                    'flex flex-col gap-1 max-w-[70%]',
                    isCurrentUser && 'items-end'
                  )}
                >
                  <div className={cn('flex items-center gap-2 mb-1', isCurrentUser && 'flex-row-reverse')}>
                    <span className="text-xs font-medium text-muted-foreground">
                      {message.sender?.full_name || 'Unknown'}
                    </span>
                  </div>

                  <div
                    className={cn(
                      'rounded-lg px-4 py-2 text-sm',
                      isCurrentUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.message_type === 'text' ? (
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    ) : message.message_type === 'image' ? (
                      <div className="space-y-2">
                        <img
                          src={message.attachment_url}
                          alt="Message attachment"
                          className="max-w-full rounded-lg"
                        />
                        {message.content && (
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <a
                          href={message.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          📎 {message.attachment_url?.split('/').pop() || 'File'}
                        </a>
                        {message.content && (
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className={cn('flex items-center mt-1', isCurrentUser && 'justify-end')}>
                    <span className="text-xs text-muted-foreground">
                      {formatMessageTime(message.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}

