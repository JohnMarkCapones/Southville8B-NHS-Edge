/**
 * Participants List Component
 * 
 * Displays conversation participants with their roles and avatars.
 * 
 * @module components/chat/participants-list
 */

'use client';

import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ConversationParticipant } from '@/types/chat';
import { User, GraduationCap, Shield } from 'lucide-react';

interface ParticipantsListProps {
  participants: ConversationParticipant[];
  currentUserId?: string;
  className?: string;
}

export function ParticipantsList({
  participants,
  currentUserId,
  className,
}: ParticipantsListProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'teacher':
        return <GraduationCap className="h-3 w-3" />;
      case 'admin':
        return <Shield className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' => {
    switch (role) {
      case 'teacher':
        return 'default';
      case 'admin':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (participants.length === 0) {
    return (
      <div className={cn('p-4 text-center text-sm text-muted-foreground', className)}>
        No participants
      </div>
    );
  }

  return (
    <ScrollArea className={cn('flex-1', className)}>
      <div className="p-4 space-y-2">
        {participants.map((participant) => {
          const isCurrentUser = participant.user_id === currentUserId;
          const user = participant.user;

          return (
            <div
              key={participant.user_id}
              className={cn(
                'flex items-center gap-3 p-2 rounded-lg',
                isCurrentUser && 'bg-accent'
              )}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {user?.full_name
                    ? `${user.full_name.split(' ')[0]?.[0]}${user.full_name.split(' ')[1]?.[0] || ''}`.toUpperCase()
                    : 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {user?.full_name || 'Unknown User'}
                    {isCurrentUser && ' (You)'}
                  </p>
                  <Badge variant={getRoleBadgeVariant(participant.role)} className="h-5 text-xs">
                    <span className="mr-1">{getRoleIcon(participant.role)}</span>
                    {participant.role}
                  </Badge>
                </div>
                {user?.email && (
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

