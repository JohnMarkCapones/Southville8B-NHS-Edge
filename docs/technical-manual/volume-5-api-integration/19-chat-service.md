# 19. Chat Service Integration

**Last Updated:** January 10, 2026
**Status:** ✅ Complete

---

## Table of Contents

- [19.1 Chat Service Architecture](#191-chat-service-architecture)
- [19.2 Channels & Messaging](#192-channels--messaging)
- [19.3 Frontend Integration](#193-frontend-integration)
- [19.4 Notifications](#194-notifications)

---

## 19.1 Chat Service Architecture

### 19.1.1 Service Overview

The Chat Service is a dedicated real-time messaging service built on **Supabase Realtime**.

```
┌─────────────────────────────────────────┐
│         Chat Service (Port 3001)        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   WebSocket Server              │   │
│  │   - Connection management       │   │
│  │   - Message routing             │   │
│  │   - Presence tracking           │   │
│  └─────────────┬───────────────────┘   │
│                │                        │
│  ┌─────────────▼───────────────────┐   │
│  │   Message Handlers              │   │
│  │   - Direct messages             │   │
│  │   - Channel messages            │   │
│  │   - Typing indicators           │   │
│  │   - Read receipts               │   │
│  └─────────────┬───────────────────┘   │
│                │                        │
└────────────────┼────────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │   Supabase     │
        │  - Realtime    │
        │  - Database    │
        │    (messages)  │
        └────────────────┘
```

---

### 19.1.2 WebSocket Connections

The chat service uses **Supabase Realtime** for WebSocket connections, eliminating the need for a custom WebSocket server.

#### Architecture Benefits

- **Automatic scaling** - Supabase handles connection scaling
- **No server management** - Serverless real-time
- **Built-in presence** - Track online users
- **Guaranteed delivery** - Message persistence
- **Low latency** - Typically <100ms

---

### 19.1.3 Message Flow

```
┌──────────┐                                    ┌──────────┐
│  User A  │                                    │  User B  │
└────┬─────┘                                    └────┬─────┘
     │                                                │
     │ 1. Send message                                │
     ├──────────────────────┐                         │
     │                      │                         │
     │                      ▼                         │
     │              ┌──────────────┐                  │
     │              │   Supabase   │                  │
     │              │   Realtime   │                  │
     │              │   Channel    │                  │
     │              └───────┬──────┘                  │
     │                      │                         │
     │ 2. Store in DB       │                         │
     │                      ▼                         │
     │              ┌──────────────┐                  │
     │              │  PostgreSQL  │                  │
     │              │   messages   │                  │
     │              └───────┬──────┘                  │
     │                      │                         │
     │ 3. Broadcast         │                         │
     │                      ├─────────────────────────┤
     │                      │                         │
     │ 4. Confirm delivery  │   5. Receive message    │
     │◄─────────────────────┤                         │
     │                      │                         ▼
     │                      │                   ┌──────────┐
     │                      │                   │  Update  │
     │                      │                   │    UI    │
     │                      │                   └──────────┘
```

---

### 19.1.4 Database Schema

```sql
-- Chat channels (groups or direct messages)
CREATE TABLE chat_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  type TEXT CHECK (type IN ('direct', 'group')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channel members
CREATE TABLE chat_channel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  UNIQUE(channel_id, user_id)
);

-- Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'file')),
  metadata JSONB,  -- For attachments, reactions, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- Soft delete
);

-- Indexes for performance
CREATE INDEX idx_messages_channel ON chat_messages(channel_id, created_at DESC);
CREATE INDEX idx_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_channel_members ON chat_channel_members(channel_id, user_id);

-- RLS Policies
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view channels they're members of
CREATE POLICY "view_own_channels"
ON chat_channels FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_channel_members
    WHERE channel_id = chat_channels.id
    AND user_id = auth.uid()
  )
);

-- Users can view messages in their channels
CREATE POLICY "view_channel_messages"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_channel_members
    WHERE channel_id = chat_messages.channel_id
    AND user_id = auth.uid()
  )
);

-- Users can send messages to their channels
CREATE POLICY "send_messages"
ON chat_messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM chat_channel_members
    WHERE channel_id = chat_messages.channel_id
    AND user_id = auth.uid()
  )
);
```

---

## 19.2 Channels & Messaging

### 19.2.1 Creating Channels

#### Direct Message Channel

```typescript
// Create or get existing direct message channel
async function createDirectMessageChannel(
  currentUserId: string,
  recipientUserId: string
): Promise<string> {
  const supabase = createClient()

  // Check if DM channel already exists
  const { data: existingChannel } = await supabase
    .from('chat_channels')
    .select(`
      id,
      chat_channel_members!inner(user_id)
    `)
    .eq('type', 'direct')
    .contains('chat_channel_members.user_id', [currentUserId, recipientUserId])
    .single()

  if (existingChannel) {
    return existingChannel.id
  }

  // Create new DM channel
  const { data: newChannel, error: channelError } = await supabase
    .from('chat_channels')
    .insert({
      type: 'direct',
      created_by: currentUserId,
    })
    .select()
    .single()

  if (channelError) throw channelError

  // Add both users as members
  const { error: membersError } = await supabase
    .from('chat_channel_members')
    .insert([
      { channel_id: newChannel.id, user_id: currentUserId, role: 'owner' },
      { channel_id: newChannel.id, user_id: recipientUserId, role: 'member' },
    ])

  if (membersError) throw membersError

  return newChannel.id
}
```

#### Group Channel

```typescript
async function createGroupChannel(
  name: string,
  creatorId: string,
  memberIds: string[]
): Promise<string> {
  const supabase = createClient()

  // Create channel
  const { data: channel, error: channelError } = await supabase
    .from('chat_channels')
    .insert({
      name,
      type: 'group',
      created_by: creatorId,
    })
    .select()
    .single()

  if (channelError) throw channelError

  // Add creator and members
  const members = [
    { channel_id: channel.id, user_id: creatorId, role: 'owner' },
    ...memberIds.map((userId) => ({
      channel_id: channel.id,
      user_id: userId,
      role: 'member',
    })),
  ]

  const { error: membersError } = await supabase
    .from('chat_channel_members')
    .insert(members)

  if (membersError) throw membersError

  return channel.id
}
```

---

### 19.2.2 Sending Messages

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

async function sendMessage(
  channelId: string,
  content: string,
  senderId: string
) {
  const supabase = createClient()

  const { data: message, error } = await supabase
    .from('chat_messages')
    .insert({
      channel_id: channelId,
      sender_id: senderId,
      content,
      type: 'text',
    })
    .select(`
      *,
      sender:sender_id (
        id,
        email,
        user_metadata
      )
    `)
    .single()

  if (error) {
    console.error('Error sending message:', error)
    throw error
  }

  return message
}

// Usage in component
export function ChatInput({ channelId, userId }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return

    setSending(true)
    try {
      await sendMessage(channelId, message.trim(), userId)
      setMessage('')  // Clear input
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSend} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={sending}
        className="flex-1 px-4 py-2 border rounded-lg"
      />
      <button
        type="submit"
        disabled={sending || !message.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
      >
        {sending ? 'Sending...' : 'Send'}
      </button>
    </form>
  )
}
```

---

### 19.2.3 Real-time Updates

#### Subscribe to Channel Messages

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  sender: {
    id: string
    email: string
    user_metadata: any
  }
}

export function ChatMessages({ channelId }: { channelId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Fetch existing messages
    async function fetchMessages() {
      const { data } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:sender_id (
            id,
            email,
            user_metadata
          )
        `)
        .eq('channel_id', channelId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(50)  // Last 50 messages

      setMessages(data || [])
    }

    fetchMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          // Fetch complete message with sender info
          const { data: newMessage } = await supabase
            .from('chat_messages')
            .select(`
              *,
              sender:sender_id (
                id,
                email,
                user_metadata
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (newMessage) {
            setMessages((current) => [...current, newMessage])

            // Scroll to bottom
            setTimeout(() => {
              const container = document.getElementById('messages-container')
              container?.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth',
              })
            }, 100)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          // Handle message updates (edits, deletions)
          setMessages((current) =>
            current.map((msg) =>
              msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelId, supabase])

  return (
    <div
      id="messages-container"
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  )
}
```

---

### 19.2.4 Typing Indicators

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function TypingIndicator({ channelId, currentUserId }: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel(`typing-${channelId}`)

    // Listen for typing events
    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, isTyping } = payload.payload

        if (userId !== currentUserId) {
          setTypingUsers((current) =>
            isTyping
              ? [...current, userId]
              : current.filter((id) => id !== userId)
          )

          // Auto-remove after 3 seconds
          if (isTyping) {
            setTimeout(() => {
              setTypingUsers((current) =>
                current.filter((id) => id !== userId)
              )
            }, 3000)
          }
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelId, currentUserId, supabase])

  if (typingUsers.length === 0) return null

  return (
    <div className="text-sm text-gray-500 italic px-4 py-2">
      {typingUsers.length === 1
        ? 'Someone is typing...'
        : `${typingUsers.length} people are typing...`}
    </div>
  )
}

// Broadcast typing status
export function useBroadcastTyping(channelId: string, userId: string) {
  const supabase = createClient()
  const [channel, setChannel] = useState<any>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const ch = supabase.channel(`typing-${channelId}`)
    ch.subscribe()
    setChannel(ch)

    return () => {
      supabase.removeChannel(ch)
    }
  }, [channelId, supabase])

  function broadcastTyping() {
    if (!channel) return

    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, isTyping: true },
    })

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, isTyping: false },
      })
    }, 1000)
  }

  return { broadcastTyping }
}
```

---

## 19.3 Frontend Integration

### 19.3.1 Chat Components

#### Chat Container

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { OnlineStatus } from './OnlineStatus'

export function ChatContainer({ channelId, userId }: ChatContainerProps) {
  const [channelInfo, setChannelInfo] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchChannelInfo() {
      const { data } = await supabase
        .from('chat_channels')
        .select(`
          *,
          chat_channel_members (
            user_id,
            user:user_id (
              id,
              email,
              user_metadata
            )
          )
        `)
        .eq('id', channelId)
        .single()

      setChannelInfo(data)
    }

    fetchChannelInfo()
  }, [channelId, supabase])

  if (!channelInfo) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">
            {channelInfo.type === 'group'
              ? channelInfo.name
              : 'Direct Message'}
          </h2>
          <OnlineStatus
            members={channelInfo.chat_channel_members}
            currentUserId={userId}
          />
        </div>
      </div>

      {/* Messages */}
      <ChatMessages channelId={channelId} />

      {/* Typing indicator */}
      <TypingIndicator channelId={channelId} currentUserId={userId} />

      {/* Input */}
      <div className="border-t p-4">
        <ChatInput channelId={channelId} userId={userId} />
      </div>
    </div>
  )
}
```

---

#### Message Bubble

```typescript
interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const senderName = message.sender?.user_metadata?.display_name ||
                     message.sender?.email?.split('@')[0] ||
                     'Unknown'

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && (
          <div className="text-xs text-gray-600 mb-1 px-2">
            {senderName}
          </div>
        )}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwn
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}
        >
          <p className="text-sm">{message.content}</p>
          <div
            className={`text-xs mt-1 ${
              isOwn ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {formatTime(message.created_at)}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }
}
```

---

### 19.3.2 Message Handling

#### Send with Optimistic Updates

```typescript
export function ChatInput({ channelId, userId }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([])
  const supabase = createClient()

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return

    const tempId = `temp-${Date.now()}`
    const optimisticMessage: Message = {
      id: tempId,
      content: message.trim(),
      sender_id: userId,
      channel_id: channelId,
      created_at: new Date().toISOString(),
      type: 'text',
      sender: {
        id: userId,
        email: '',
        user_metadata: {},
      },
    }

    // Add to optimistic messages
    setOptimisticMessages((prev) => [...prev, optimisticMessage])
    setMessage('')

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          channel_id: channelId,
          sender_id: userId,
          content: optimisticMessage.content,
          type: 'text',
        })
        .select()
        .single()

      if (error) throw error

      // Remove optimistic message (real one will come via subscription)
      setOptimisticMessages((prev) =>
        prev.filter((msg) => msg.id !== tempId)
      )
    } catch (error) {
      // Remove failed optimistic message
      setOptimisticMessages((prev) =>
        prev.filter((msg) => msg.id !== tempId)
      )
      toast.error('Failed to send message')
    }
  }

  return (
    <form onSubmit={handleSend}>
      {/* Input UI */}
    </form>
  )
}
```

---

### 19.3.3 Presence Indicators

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function OnlineStatus({ members, currentUserId }: OnlineStatusProps) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect() => {
    const channel = supabase.channel('online-presence', {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const online = new Set(
          Object.keys(state).map((key) => state[key][0].user_id)
        )
        setOnlineUsers(online)
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setOnlineUsers((prev) => {
          const updated = new Set(prev)
          newPresences.forEach((presence: any) => {
            updated.add(presence.user_id)
          })
          return updated
        })
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setOnlineUsers((prev) => {
          const updated = new Set(prev)
          leftPresences.forEach((presence: any) => {
            updated.delete(presence.user_id)
          })
          return updated
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [currentUserId, supabase])

  const otherMembers = members.filter((m: any) => m.user_id !== currentUserId)
  const onlineCount = otherMembers.filter((m: any) =>
    onlineUsers.has(m.user_id)
  ).length

  return (
    <div className="text-sm text-gray-500">
      {onlineCount > 0 ? (
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          {onlineCount} online
        </span>
      ) : (
        <span>Offline</span>
      )}
    </div>
  )
}
```

---

## 19.4 Notifications

### 19.4.1 Unread Count

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUnreadCount(channelId: string, userId: string) {
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUnreadCount() {
      // Get last read timestamp
      const { data: member } = await supabase
        .from('chat_channel_members')
        .select('last_read_at')
        .eq('channel_id', channelId)
        .eq('user_id', userId)
        .single()

      if (!member) return

      // Count messages after last read
      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('channel_id', channelId)
        .gt('created_at', member.last_read_at || '1970-01-01')
        .neq('sender_id', userId)  // Don't count own messages

      setUnreadCount(count || 0)
    }

    fetchUnreadCount()

    // Subscribe to new messages
    const channel = supabase
      .channel(`unread-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          if (payload.new.sender_id !== userId) {
            setUnreadCount((prev) => prev + 1)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelId, userId, supabase])

  async function markAsRead() {
    await supabase
      .from('chat_channel_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('channel_id', channelId)
      .eq('user_id', userId)

    setUnreadCount(0)
  }

  return { unreadCount, markAsRead }
}

// Usage in component
export function ChatChannelItem({ channel, userId }: ChatChannelItemProps) {
  const { unreadCount, markAsRead } = useUnreadCount(channel.id, userId)

  return (
    <div onClick={markAsRead} className="relative">
      <div>{channel.name}</div>
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2 py-1">
          {unreadCount}
        </span>
      )}
    </div>
  )
}
```

---

### 19.4.2 Message Alerts

```typescript
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function useMessageNotifications(userId: string) {
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to all channels user is a member of
    const channel = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        async (payload) => {
          const message = payload.new

          // Don't notify for own messages
          if (message.sender_id === userId) return

          // Check if user is member of this channel
          const { data: isMember } = await supabase
            .from('chat_channel_members')
            .select('id')
            .eq('channel_id', message.channel_id)
            .eq('user_id', userId)
            .single()

          if (!isMember) return

          // Fetch sender info
          const { data: sender } = await supabase
            .from('auth.users')
            .select('email, user_metadata')
            .eq('id', message.sender_id)
            .single()

          const senderName =
            sender?.user_metadata?.display_name ||
            sender?.email?.split('@')[0] ||
            'Someone'

          // Show notification
          toast.info(`${senderName}: ${message.content.substring(0, 50)}...`, {
            duration: 3000,
          })

          // Browser notification (if permission granted)
          if (Notification.permission === 'granted') {
            new Notification(`New message from ${senderName}`, {
              body: message.content.substring(0, 100),
              icon: '/icon.png',
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])
}

// Request notification permission
export function useRequestNotificationPermission() {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])
}
```

---

## Chat Service Best Practices Summary

### ✅ Do

- **Use Supabase Realtime** - No custom WebSocket server needed
- **Implement optimistic updates** - Better UX
- **Mark messages as read** - Track unread counts
- **Show typing indicators** - Better real-time feel
- **Display online status** - Presence tracking
- **Paginate message history** - Don't load all messages
- **Handle reconnection** - Graceful error recovery
- **Show delivery status** - Confirm message sent
- **Implement read receipts** - Track message reads
- **Cache messages locally** - Faster initial load

### ❌ Don't

- **Don't poll for new messages** - Use realtime subscriptions
- **Don't load all messages** - Use pagination
- **Don't forget to unsubscribe** - Memory leaks
- **Don't skip error handling** - Network issues happen
- **Don't ignore offline state** - Handle gracefully
- **Don't spam typing indicators** - Throttle broadcasts
- **Don't store sensitive data in messages** - Encrypt if needed
- **Don't forget RLS policies** - Security is critical
- **Don't skip message validation** - Prevent XSS
- **Don't ignore rate limits** - Prevent abuse

---

## Quick Reference

```typescript
// Create channel
const { data: channel } = await supabase
  .from('chat_channels')
  .insert({ type: 'direct', created_by: userId })
  .select()
  .single()

// Send message
const { data: message } = await supabase
  .from('chat_messages')
  .insert({
    channel_id: channelId,
    sender_id: userId,
    content: 'Hello!'
  })
  .select()
  .single()

// Subscribe to messages
const channel = supabase
  .channel(`chat-${channelId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    table: 'chat_messages',
    filter: `channel_id=eq.${channelId}`
  }, callback)
  .subscribe()

// Track presence
await channel.track({ user_id: userId, online_at: new Date() })

// Broadcast typing
channel.send({
  type: 'broadcast',
  event: 'typing',
  payload: { userId, isTyping: true }
})
```

---

## Navigation

- [← Previous: NestJS Backend API](./18-nestjs-backend.md)
- [Next: API Reference & Endpoints →](./20-api-reference.md)
- [↑ Back to Volume 5 Index](./README.md)
- [↑↑ Back to Manual Index](../README.md)
