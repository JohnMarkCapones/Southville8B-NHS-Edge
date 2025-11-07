/**
 * Conversation List Component
 * 
 * Displays a list of conversations with search/filter support.
 * 
 * @module components/chat/conversation-list
 */

'use client';

import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Search, MessageSquare } from 'lucide-react';
import type { ConversationWithParticipants } from '@/types/chat';

interface ConversationListProps {
  conversations: ConversationWithParticipants[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  searchQuery = '',
  onSearchChange,
  isLoading = false,
  className,
}: ConversationListProps) {
  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) => {
      const title = conv.title?.toLowerCase() || '';
      const lastMessageContent = conv.last_message?.content?.toLowerCase() || '';
      return title.includes(query) || lastMessageContent.includes(query);
    });
  }, [conversations, searchQuery]);

  const formatTimestamp = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getConversationDisplayName = (conv: ConversationWithParticipants) => {
    if (conv.title) return conv.title;
    if (conv.type === 'group_section') {
      return 'Section Chat';
    }
    return 'Direct Message';
  };

  const getConversationAvatar = (conv: ConversationWithParticipants) => {
    if (conv.type === 'group_section') {
      return null; // Group avatar or initials
    }
    // For direct messages, show other participant's avatar
    const otherParticipant = conv.participants?.find(p => p.user_id !== conv.created_by);
    return otherParticipant?.user;
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Search Bar */}
      {onSearchChange && (
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => {
              const isSelected = conversation.id === selectedConversationId;
              const displayName = getConversationDisplayName(conversation);
              const avatarUser = getConversationAvatar(conversation);
              const unreadCount = conversation.unread_count || 0;

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
                    'hover:bg-accent',
                    isSelected && 'bg-accent'
                  )}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {avatarUser
                        ? `${avatarUser.full_name.split(' ')[0]?.[0]}${avatarUser.full_name.split(' ')[1]?.[0] || ''}`.toUpperCase()
                        : conversation.type === 'group_section'
                        ? <MessageSquare className="h-5 w-5" />
                        : 'DM'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={cn(
                        'text-sm font-medium truncate',
                        unreadCount > 0 && 'font-semibold'
                      )}>
                        {displayName}
                      </p>
                      {conversation.last_message?.created_at && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(conversation.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn(
                        'text-xs text-muted-foreground truncate',
                        unreadCount > 0 && 'text-foreground font-medium'
                      )}>
                        {conversation.last_message?.content || 'No messages yet'}
                      </p>
                      {unreadCount > 0 && (
                        <Badge variant="default" className="h-5 min-w-5 px-1.5 text-xs">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

