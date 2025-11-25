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

  // Helper to check if messages should be grouped
  const shouldGroupWithPrevious = (currentMsg: MessageWithSender, prevMsg?: MessageWithSender) => {
    if (!prevMsg) return false;
    // Group if same sender and within 2 minutes
    const timeDiff = new Date(currentMsg.created_at).getTime() - new Date(prevMsg.created_at).getTime();
    return currentMsg.sender_id === prevMsg.sender_id && timeDiff < 120000; // 2 minutes
  };

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
    <ScrollArea className={cn('flex-1 bg-gradient-to-b from-muted/20 to-background', className)} ref={scrollRef}>
      <div className="p-4 space-y-1">
        {uniqueMessages.map((message, index) => {
          const isCurrentUser = message.sender_id === currentUserId;
          const prevMessage = index > 0 ? uniqueMessages[index - 1] : undefined;
          const showDateSeparator = shouldShowDateSeparator(message, prevMessage);
          const groupWithPrevious = shouldGroupWithPrevious(message, prevMessage);

          return (
            <React.Fragment key={`${message.id}-${index}`}>
              {showDateSeparator && (
                <div className="flex items-center justify-center my-6">
                  <div className="text-xs font-medium text-muted-foreground bg-muted/60 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
                    {formatMessageDate(message.created_at)}
                  </div>
                </div>
              )}

              <div
                className={cn(
                  'flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300',
                  isCurrentUser && 'flex-row-reverse',
                  groupWithPrevious ? 'mt-0.5' : 'mt-4'
                )}
              >
                {/* Avatar - only show if not grouped or is first message */}
                {!groupWithPrevious && (
                  <div className="relative flex-shrink-0">
                    <Avatar className={cn(
                      'h-9 w-9 ring-2 ring-background shadow-sm',
                      isCurrentUser ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    )}>
                      <AvatarFallback className={cn(
                        'text-white text-xs font-bold',
                        isCurrentUser ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                      )}>
                        {getInitials(message.sender?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    {!isCurrentUser && isTeacher(message.sender_id) && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full p-0.5 border-2 border-background shadow-sm">
                        <GraduationCap className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                )}

                {/* Spacer when message is grouped */}
                {groupWithPrevious && <div className="w-9 flex-shrink-0" />}

                <div
                  className={cn(
                    'flex flex-col gap-1 max-w-[75%] min-w-[100px]',
                    isCurrentUser && 'items-end'
                  )}
                >
                  {/* Sender name - only show if not grouped */}
                  {!groupWithPrevious && (
                    <div className={cn('flex items-center gap-2 px-1', isCurrentUser && 'flex-row-reverse')}>
                      <span className="text-xs font-semibold text-foreground/70">
                        {isCurrentUser ? 'You' : message.sender?.full_name || 'Unknown'}
                      </span>
                      {!isCurrentUser && isTeacher(message.sender_id) && (
                        <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0">
                          Teacher
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div className="group relative">
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all duration-200',
                        isCurrentUser
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-md'
                          : 'bg-white dark:bg-slate-800 border border-border/50 rounded-tl-md',
                        'hover:shadow-md'
                      )}
                    >
                      {message.message_type === 'text' ? (
                        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
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

                    {/* Timestamp - show on hover or for last message in group */}
                    <div className={cn(
                      'flex items-center gap-1.5 mt-1 px-1 transition-opacity',
                      isCurrentUser && 'justify-end',
                      groupWithPrevious && index < uniqueMessages.length - 1 && uniqueMessages[index + 1].sender_id === message.sender_id
                        ? 'opacity-0 group-hover:opacity-100'
                        : 'opacity-100'
                    )}>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {formatMessageTime(message.created_at)}
                      </span>
                      {isCurrentUser && (
                        <div className="flex items-center">
                          <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                          </svg>
                          <svg className="w-3.5 h-3.5 text-blue-500 -ml-1.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                          </svg>
                        </div>
                      )}
                    </div>
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

