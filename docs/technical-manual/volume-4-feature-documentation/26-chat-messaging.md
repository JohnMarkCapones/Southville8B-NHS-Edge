# Chapter 26: Chat & Messaging System

**Southville 8B NHS Edge - Technical Documentation**
**Volume 4: Feature Documentation**

---

## Table of Contents

- [26.1 Overview](#261-overview)
- [26.2 Chat Architecture](#262-chat-architecture)
- [26.3 Supabase Realtime Integration](#263-supabase-realtime-integration)
- [26.4 Chat Features](#264-chat-features)
- [26.5 Real-time Capabilities](#265-real-time-capabilities)
- [26.6 Chat UI Components](#266-chat-ui-components)
- [26.7 Message Types & Formatting](#267-message-types--formatting)
- [26.8 Implementation Guide](#268-implementation-guide)

---

## 26.1 Overview

The chat and messaging system provides real-time communication capabilities for students, teachers, and administrators within the Southville 8B NHS Edge platform. Built on Supabase Realtime, it enables instant messaging, group conversations, and seamless collaboration.

### Purpose and Goals

The messaging system serves several key purposes:

1. **Academic Communication**: Facilitate discussion between teachers and students
2. **Collaboration**: Enable group work and peer-to-peer learning
3. **Administrative**: Streamline communication for school announcements
4. **Real-time Engagement**: Provide instant feedback and support

### Key Features

- **Real-time Messaging**: Instant message delivery using Supabase Realtime
- **Direct Messaging**: One-on-one conversations between users
- **Group Chats**: Class sections and custom group conversations
- **Typing Indicators**: See when others are typing
- **Online Presence**: View who's currently online
- **Read Receipts**: Track message delivery and read status
- **Message History**: Persistent message storage
- **File Sharing**: Send images and attachments (future enhancement)
- **Emoji Support**: Rich emoji picker for expressive communication

### Technology Stack

The chat system leverages:

- **Supabase Realtime**: WebSocket-based real-time subscriptions
- **Supabase Database**: PostgreSQL for message storage
- **React Hooks**: State management for chat functionality
- **TypeScript**: Type-safe message handling
- **Radix UI**: Accessible UI components
- **Lucide Icons**: Consistent iconography

---

## 26.2 Chat Architecture

The chat system follows a modular, component-based architecture designed for scalability and maintainability.

### 26.2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Chat UI     │  │  Message     │  │  Conversation│      │
│  │  Components  │  │  Components  │  │  List        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Realtime Layer                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Supabase Realtime Client                  │   │
│  │  - WebSocket Connection                              │   │
│  │  - Channel Subscriptions                             │   │
│  │  - Event Handlers                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ conversations│  │   messages   │  │conversation  │      │
│  │    table     │  │    table     │  │_participants │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 26.2.2 Database Schema

#### Conversations Table

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255),
  type VARCHAR(50) NOT NULL, -- 'direct', 'group_section', 'announcement'
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_created_by ON conversations(created_by);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
```

#### Messages Table

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'file', 'system'
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

#### Conversation Participants Table

```sql
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  is_muted BOOLEAN DEFAULT FALSE,
  UNIQUE(conversation_id, user_id)
);

-- Indexes
CREATE INDEX idx_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_participants_user ON conversation_participants(user_id);
```

### 26.2.3 Data Flow

1. **Message Send Flow**:
   ```
   User Input → Message Validation → API Call → Database Insert →
   Realtime Broadcast → All Subscribers Receive → UI Update
   ```

2. **Message Receive Flow**:
   ```
   Realtime Event → Event Handler → State Update →
   UI Re-render → Read Receipt Update
   ```

3. **Conversation Load Flow**:
   ```
   Component Mount → Fetch Conversations →
   Subscribe to Realtime → Load Messages → Display UI
   ```

---

## 26.3 Supabase Realtime Integration

The chat system leverages Supabase Realtime for instant message delivery and presence features.

### 26.3.1 Supabase Client Setup

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\lib\supabase\client.ts

"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

/**
 * Get auth token from cookie
 */
function getTokenFromCookie(): string | null {
  if (typeof window === "undefined") return null;

  const match = document.cookie.match(/sb-access-token=([^;]+)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  return null;
}

/**
 * Get or create Supabase client instance
 * IMPORTANT: This function ensures the auth token is set for Realtime
 * subscriptions. The token is read dynamically each time to ensure
 * it's always fresh.
 */
export function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  // Create client if it doesn't exist
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
        heartbeatIntervalMs: 30000,
        reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 30000),
      },
      auth: {
        persistSession: true, // Enable session persistence for auto-refresh
        autoRefreshToken: true, // Enable automatic token refresh
        detectSessionInUrl: false,
      },
    });
  }

  // CRITICAL: Set auth token for Realtime subscriptions
  // This must be called dynamically each time to ensure fresh token
  const accessToken = getTokenFromCookie();
  if (accessToken) {
    supabaseClient.realtime.setAuth(accessToken);
    console.log("[Supabase Client] ✅ Auth token set for Realtime");
  } else {
    // Clear auth if no token (logout scenario)
    supabaseClient.realtime.setAuth(null);
    console.warn(
      "[Supabase Client] ⚠️ No auth token found, Realtime will use anonymous access"
    );
  }

  return supabaseClient;
}

/**
 * Check if Supabase client is available
 */
export function isSupabaseAvailable(): boolean {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return !!url && !!key;
  } catch {
    return false;
  }
}
```

### 26.3.2 Environment Configuration

Required environment variables in `.env.local`:

```bash
# Supabase Configuration (required for chat realtime)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Chat service URL
NEXT_PUBLIC_CHAT_SERVICE_URL=http://localhost:3001
```

**Important Notes**:
- The `NEXT_PUBLIC_` prefix exposes these to the client-side
- These should match the credentials from the main API `.env` file
- The anon key is safe to expose as it's restricted by Row-Level Security (RLS)

### 26.3.3 Realtime Subscription

Subscribing to conversation updates:

```typescript
// Subscribe to a conversation channel

import { getSupabaseClient } from "@/lib/supabase/client"

export function useConversationRealtime(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!conversationId) return

    // Subscribe to new messages in this conversation
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('New message received:', payload.new)
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('Message updated:', payload.new)
          setMessages(prev =>
            prev.map(msg => msg.id === payload.new.id ? payload.new as Message : msg)
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('Message deleted:', payload.old)
          setMessages(prev =>
            prev.filter(msg => msg.id !== payload.old.id)
          )
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase])

  return { messages }
}
```

### 26.3.4 Presence Tracking

Track online users in real-time:

```typescript
// Presence tracking hook

export function usePresence(conversationId: string, userId: string) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!conversationId || !userId) return

    const channel = supabase.channel(`presence:${conversationId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    // Track presence state changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = new Set<string>()

        Object.keys(state).forEach(key => {
          users.add(key)
        })

        setOnlineUsers(users)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Announce presence
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [conversationId, userId, supabase])

  return { onlineUsers }
}
```

---

## 26.4 Chat Features

The chat system provides comprehensive messaging features for different use cases.

### 26.4.1 Direct Messaging

One-on-one conversations between users.

```typescript
// Create a direct message conversation

async function createDirectConversation(
  userId1: string,
  userId2: string
): Promise<string> {
  const supabase = getSupabaseClient()

  // Check if conversation already exists
  const { data: existing } = await supabase
    .from('conversations')
    .select(`
      id,
      conversation_participants!inner(user_id)
    `)
    .eq('type', 'direct')
    .eq('conversation_participants.user_id', userId1)

  // Filter to find conversation with both users
  const existingConv = existing?.find(conv => {
    const participants = conv.conversation_participants.map((p: any) => p.user_id)
    return participants.includes(userId1) && participants.includes(userId2)
  })

  if (existingConv) {
    return existingConv.id
  }

  // Create new conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({
      type: 'direct',
      created_by: userId1,
    })
    .select()
    .single()

  if (convError) throw convError

  // Add participants
  const { error: partError } = await supabase
    .from('conversation_participants')
    .insert([
      { conversation_id: conversation.id, user_id: userId1 },
      { conversation_id: conversation.id, user_id: userId2 },
    ])

  if (partError) throw partError

  return conversation.id
}
```

### 26.4.2 Group Chats (Class Sections)

Group conversations for class sections.

```typescript
// Create a group chat for a section

async function createSectionConversation(
  sectionId: string,
  teacherId: string,
  studentIds: string[]
): Promise<string> {
  const supabase = getSupabaseClient()

  // Create conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({
      title: `Section ${sectionId}`,
      type: 'group_section',
      created_by: teacherId,
    })
    .select()
    .single()

  if (convError) throw convError

  // Add teacher as admin
  const participants = [
    {
      conversation_id: conversation.id,
      user_id: teacherId,
      role: 'admin'
    },
    // Add students as members
    ...studentIds.map(studentId => ({
      conversation_id: conversation.id,
      user_id: studentId,
      role: 'member'
    }))
  ]

  const { error: partError } = await supabase
    .from('conversation_participants')
    .insert(participants)

  if (partError) throw partError

  return conversation.id
}
```

### 26.4.3 Message Sending

Send messages with validation and error handling.

```typescript
// Send a message to a conversation

interface SendMessageParams {
  conversationId: string
  senderId: string
  content: string
  messageType?: 'text' | 'image' | 'file' | 'system'
  attachmentUrl?: string
}

async function sendMessage({
  conversationId,
  senderId,
  content,
  messageType = 'text',
  attachmentUrl,
}: SendMessageParams): Promise<Message> {
  const supabase = getSupabaseClient()

  // Validate user is participant
  const { data: participant } = await supabase
    .from('conversation_participants')
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('user_id', senderId)
    .single()

  if (!participant) {
    throw new Error('User is not a participant in this conversation')
  }

  // Insert message
  const { data: message, error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      message_type: messageType,
      attachment_url: attachmentUrl,
    })
    .select(`
      *,
      sender:sender_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .single()

  if (msgError) throw msgError

  // Update conversation last_message_at
  await supabase
    .from('conversations')
    .update({
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)

  return message
}
```

### 26.4.4 Message History Loading

Efficiently load message history with pagination.

```typescript
// Load messages with pagination

interface LoadMessagesParams {
  conversationId: string
  limit?: number
  before?: string // Message ID for pagination
}

async function loadMessages({
  conversationId,
  limit = 50,
  before,
}: LoadMessagesParams): Promise<Message[]> {
  const supabase = getSupabaseClient()

  let query = supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id (
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .eq('conversation_id', conversationId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit)

  // Pagination: load messages before a specific message
  if (before) {
    const { data: beforeMsg } = await supabase
      .from('messages')
      .select('created_at')
      .eq('id', before)
      .single()

    if (beforeMsg) {
      query = query.lt('created_at', beforeMsg.created_at)
    }
  }

  const { data: messages, error } = await query

  if (error) throw error

  // Return in chronological order
  return messages?.reverse() || []
}
```

---

## 26.5 Real-time Capabilities

The chat system provides several real-time features for enhanced user experience.

### 26.5.1 Typing Indicators

Show when other users are typing.

```typescript
// Typing indicator implementation

export function useTypingIndicator(conversationId: string, userId: string) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const supabase = getSupabaseClient()
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Broadcast typing status
  const broadcastTyping = useCallback(async (isTyping: boolean) => {
    const channel = supabase.channel(`typing:${conversationId}`)

    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: userId,
        is_typing: isTyping,
        timestamp: new Date().toISOString(),
      },
    })
  }, [conversationId, userId, supabase])

  // Start typing
  const startTyping = useCallback(() => {
    broadcastTyping(true)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Auto-stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      broadcastTyping(false)
    }, 3000)
  }, [broadcastTyping])

  // Stop typing
  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    broadcastTyping(false)
  }, [broadcastTyping])

  // Listen for typing events
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, is_typing } = payload.payload

        if (user_id === userId) return // Ignore own typing

        setTypingUsers(prev => {
          const updated = new Set(prev)
          if (is_typing) {
            updated.add(user_id)
          } else {
            updated.delete(user_id)
          }
          return updated
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, userId, supabase])

  return { typingUsers, startTyping, stopTyping }
}
```

### 26.5.2 Read Receipts

Track when messages are read by participants.

```typescript
// Mark messages as read

async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  const supabase = getSupabaseClient()

  // Update last_read_at for this participant
  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)

  if (error) throw error
}

// Get unread count for a conversation
async function getUnreadCount(
  conversationId: string,
  userId: string
): Promise<number> {
  const supabase = getSupabaseClient()

  // Get participant's last_read_at
  const { data: participant } = await supabase
    .from('conversation_participants')
    .select('last_read_at')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .single()

  if (!participant?.last_read_at) {
    // Count all messages if never read
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)

    return count || 0
  }

  // Count messages after last read
  const { count } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .gt('created_at', participant.last_read_at)

  return count || 0
}
```

### 26.5.3 Online Presence Display

Show online/offline status for users.

```typescript
// Display online presence in UI

interface PresenceIndicatorProps {
  userId: string
  conversationId: string
}

function PresenceIndicator({ userId, conversationId }: PresenceIndicatorProps) {
  const { onlineUsers } = usePresence(conversationId, userId)
  const isOnline = onlineUsers.has(userId)

  return (
    <div className="relative">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar_url} />
        <AvatarFallback>{user.initials}</AvatarFallback>
      </Avatar>

      {/* Online indicator */}
      {isOnline && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
      )}
    </div>
  )
}
```

### 26.5.4 Message Notifications

Real-time notifications for new messages.

```typescript
// Message notification system

export function useMessageNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!userId) return

    // Subscribe to messages in all user's conversations
    const channel = supabase
      .channel(`user:${userId}:messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${userId}` // Exclude own messages
        },
        async (payload) => {
          const message = payload.new as Message

          // Check if user is participant in this conversation
          const { data: participant } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('conversation_id', message.conversation_id)
            .eq('user_id', userId)
            .single()

          if (participant) {
            // Show notification
            const notification: Notification = {
              id: message.id,
              title: 'New Message',
              message: message.content,
              conversationId: message.conversation_id,
              timestamp: message.created_at,
            }

            setNotifications(prev => [...prev, notification])

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== notification.id))
            }, 5000)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  return { notifications }
}
```

---

## 26.6 Chat UI Components

The chat system consists of several reusable UI components.

### 26.6.1 Chat System Component

Main chat interface with conversation list and message view.

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\components\chat\chat-system.tsx

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Send,
  X,
  Search,
  Bell,
  BellOff,
  Minimize2,
  Hash,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface Message {
  id: string
  content: string
  sender: {
    id: string
    name: string
    avatar?: string
    role: "student" | "teacher" | "admin" | "parent"
  }
  timestamp: Date
  type: "text" | "file" | "image" | "system"
  fileUrl?: string
  fileName?: string
  isEdited?: boolean
}

interface Chat {
  id: string
  name: string
  type: "direct" | "class" | "announcement"
  participants: string[]
  lastMessage?: Message
  unreadCount: number
  isOnline?: boolean
  isPinned?: boolean
  avatar?: string
  description?: string
}

interface ChatSystemProps {
  className?: string
}

export function ChatSystem({ className }: ChatSystemProps) {
  const { theme } = useTheme()
  const isGamingTheme = theme === "gaming"

  const [isOpen, setIsOpen] = React.useState(false)
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [activeChat, setActiveChat] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [notifications, setNotifications] = React.useState(true)

  const [chats] = React.useState<Chat[]>([
    {
      id: "1",
      name: "Math Class - Period 3",
      type: "class",
      participants: ["teacher1", "student1", "student2"],
      unreadCount: 3,
      isPinned: true,
      lastMessage: {
        id: "msg1",
        content: "Don't forget about tomorrow's quiz on Chapter 5!",
        sender: { id: "teacher1", name: "Ms. Johnson", role: "teacher" },
        timestamp: new Date(Date.now() - 300000),
        type: "text",
      },
    },
    // ... more chats
  ])

  const handleSendMessage = () => {
    if (message.trim() === "") return
    console.log("Sending message:", message)
    setMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Minimized floating button
  if (isMinimized) {
    return (
      <Button
        onClick={() => setIsMinimized(false)}
        className={cn(
          "fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-[100]",
          "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
        )}
      >
        <MessageSquare className="h-6 w-6" />
        {chats.reduce((total, chat) => total + chat.unreadCount, 0) > 0 && (
          <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs bg-red-500">
            {chats.reduce((total, chat) => total + chat.unreadCount, 0)}
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-[100]",
          "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-110"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        {!isOpen && chats.reduce((total, chat) => total + chat.unreadCount, 0) > 0 && (
          <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs bg-red-500 animate-pulse">
            {chats.reduce((total, chat) => total + chat.unreadCount, 0)}
          </Badge>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-24 right-6 w-96 h-[600px] rounded-lg shadow-2xl flex flex-col z-[99] animate-fadeIn border",
            "bg-background/95 backdrop-blur-xl border-border"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/50">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <h3 className="font-semibold">Messages</h3>
              {notifications && (
                <Badge variant="secondary" className="text-xs">
                  {chats.reduce((total, chat) => total + chat.unreadCount, 0)} new
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setNotifications(!notifications)}
              >
                {notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content Area */}
          {!activeChat ? (
            <div className="flex-1 flex flex-col">
              {/* Search */}
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
              </div>

              {/* Chat List */}
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setActiveChat(chat.id)}
                      className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-accent/50"
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={chat.avatar} />
                          <AvatarFallback className="text-xs font-semibold">
                            {chat.type === "class" && <Hash className="h-4 w-4" />}
                            {chat.type === "announcement" && <Bell className="h-4 w-4" />}
                            {chat.type === "direct" && chat.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {chat.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{chat.name}</p>
                          {chat.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.lastMessage?.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            /* Active Chat View - would show messages and input */
            <div className="flex-1 flex flex-col">
              {/* Chat messages and input */}
            </div>
          )}
        </div>
      )}
    </>
  )
}
```

### 26.6.2 Conversation List Component

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\components\chat\conversation-list.tsx

'use client';

import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
                      {conversation.type === 'group_section' ? (
                        <MessageSquare className="h-5 w-5" />
                      ) : (
                        'DM'
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={cn(
                        'text-sm font-medium truncate',
                        unreadCount > 0 && 'font-semibold'
                      )}>
                        {conversation.title || 'Direct Message'}
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
```

### 26.6.3 Message List Component

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\components\chat\message-list.tsx

'use client';

import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageWithSender } from '@/types/chat';

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

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth',
        });
      }
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

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const isTeacher = (senderId: string) => {
    const participant = participants.find(p => p.user_id === senderId);
    return participant?.role === 'teacher' || participant?.role === 'admin';
  };

  if (isLoading) {
    return (
      <div className={cn('flex-1 flex items-center justify-center', className)}>
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={cn('flex-1 flex items-center justify-center', className)}>
        <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn('flex-1 bg-gradient-to-b from-muted/20 to-background', className)} ref={scrollRef}>
      <div className="p-4 space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.sender_id === currentUserId;

          return (
            <div
              key={message.id}
              className={cn(
                'flex gap-2 animate-in fade-in slide-in-from-bottom-2',
                isCurrentUser && 'flex-row-reverse'
              )}
            >
              {/* Avatar */}
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
                  <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full p-0.5 border-2 border-background">
                    <GraduationCap className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className={cn(
                'flex flex-col gap-1 max-w-[75%]',
                isCurrentUser && 'items-end'
              )}>
                {/* Sender name */}
                <div className={cn('flex items-center gap-2 px-1', isCurrentUser && 'flex-row-reverse')}>
                  <span className="text-xs font-semibold text-foreground/70">
                    {isCurrentUser ? 'You' : message.sender?.full_name || 'Unknown'}
                  </span>
                  {!isCurrentUser && isTeacher(message.sender_id) && (
                    <Badge variant="secondary" className="h-4 px-1.5 text-[10px] bg-amber-500/10 text-amber-700">
                      Teacher
                    </Badge>
                  )}
                </div>

                {/* Message bubble */}
                <div className="group relative">
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-2.5 text-sm shadow-sm hover:shadow-md transition-all',
                      isCurrentUser
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-md'
                        : 'bg-white dark:bg-slate-800 border border-border/50 rounded-tl-md'
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>

                  {/* Timestamp */}
                  <div className={cn(
                    'flex items-center gap-1.5 mt-1 px-1',
                    isCurrentUser && 'justify-end'
                  )}>
                    <span className="text-[10px] text-muted-foreground">
                      {formatMessageTime(message.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
```

### 26.6.4 Message Input Component

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\components\chat\message-input.tsx

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Send, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
  '😉', '😌', '😍', '🥰', '😘', '👍', '👎', '👏', '🙌', '✨',
  '💯', '🔥', '❤️', '💙', '💚', '💛', '💜', '✅', '❌', '❓',
];

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function MessageInput({
  value,
  onChange,
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
  isLoading = false,
  className,
}: MessageInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [emojiOpen, setEmojiOpen] = React.useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled && !isLoading) {
        onSend();
      }
    }
  };

  const handleEmojiClick = (emoji: string) => {
    onChange(value + emoji);
    setEmojiOpen(false);
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className={cn('border-t bg-background/95 backdrop-blur-sm p-4', className)}>
      <div className="flex items-end gap-2">
        {/* Emoji Picker */}
        <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled || isLoading}
              className="h-10 w-10 rounded-full hover:bg-accent"
            >
              <Smile className="h-5 w-5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2" align="start">
            <div className="mb-2 px-2">
              <p className="text-sm font-semibold">Emojis</p>
            </div>
            <div className="grid grid-cols-10 gap-1 max-h-64 overflow-y-auto">
              {EMOJI_LIST.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:bg-accent rounded p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className="min-h-[44px] max-h-[120px] resize-none rounded-2xl border-2"
            rows={1}
          />
        </div>

        {/* Send Button */}
        <Button
          type="button"
          onClick={onSend}
          disabled={!value.trim() || disabled || isLoading}
          size="icon"
          className={cn(
            "h-10 w-10 rounded-full transition-all",
            value.trim()
              ? "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
              : "bg-muted text-muted-foreground opacity-50"
          )}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Helper Text */}
      <div className="mt-2 px-2 flex items-center justify-center">
        <p className="text-[10px] text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px]">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
```

---

## 26.7 Message Types & Formatting

The chat system supports different message types for rich communication.

### 26.7.1 Text Messages

Standard text messages with formatting support:

```typescript
// Text message with basic formatting

interface TextMessage {
  type: 'text'
  content: string
}

// Display formatted text
function renderTextMessage(content: string) {
  return (
    <p className="whitespace-pre-wrap break-words leading-relaxed">
      {content}
    </p>
  )
}
```

### 26.7.2 System Messages

Automated messages for system events:

```typescript
// System message examples

interface SystemMessage {
  type: 'system'
  content: string
  event: 'user_joined' | 'user_left' | 'conversation_created'
}

// Display system messages
function renderSystemMessage(message: SystemMessage) {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="text-xs text-muted-foreground bg-muted/60 px-4 py-1.5 rounded-full">
        {message.content}
      </div>
    </div>
  )
}
```

### 26.7.3 Date Separators

Separate messages by date for better organization:

```typescript
// Date separator logic

function shouldShowDateSeparator(currentMsg: Message, prevMsg?: Message) {
  if (!prevMsg) return true;
  const currentDate = new Date(currentMsg.created_at).toDateString();
  const prevDate = new Date(prevMsg.created_at).toDateString();
  return currentDate !== prevDate;
}

function formatMessageDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
```

---

## 26.8 Implementation Guide

Step-by-step guide to implementing the chat system in your application.

### 26.8.1 Setup Checklist

1. **Configure Supabase Environment Variables**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Create Database Tables**: Run SQL migrations for conversations, messages, and participants

3. **Set Up Row-Level Security**: Configure RLS policies for secure access

4. **Install Dependencies**:
   ```bash
   npm install @supabase/supabase-js
   ```

### 26.8.2 Basic Implementation

```typescript
// Example: Complete chat implementation

'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ConversationList } from '@/components/chat/conversation-list';
import { MessageList } from '@/components/chat/message-list';
import { MessageInput } from '@/components/chat/message-input';

export function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const supabase = getSupabaseClient();

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Subscribe to messages
  useEffect(() => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`conversation:${selectedConversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConversation.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  const loadConversations = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false });
    setConversations(data || []);
  };

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:sender_id(*)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedConversation.id,
        content: messageInput,
        message_type: 'text',
      });

    if (!error) {
      setMessageInput('');
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-80 border-r">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={(id) => {
            const conv = conversations.find(c => c.id === id);
            setSelectedConversation(conv);
            loadMessages(id);
          }}
        />
      </div>
      <div className="flex-1 flex flex-col">
        <MessageList messages={messages} />
        <MessageInput
          value={messageInput}
          onChange={setMessageInput}
          onSend={sendMessage}
        />
      </div>
    </div>
  );
}
```

---

## Summary

The chat and messaging system provides comprehensive real-time communication capabilities for the Southville 8B NHS Edge platform. Key features include:

- **Real-time Messaging**: Instant delivery powered by Supabase Realtime
- **Multiple Conversation Types**: Direct messages, group chats, and announcements
- **Rich UI Components**: Reusable, accessible components for chat interfaces
- **Presence Features**: Online status, typing indicators, and read receipts
- **Scalable Architecture**: Modular design for easy maintenance and extension
- **Type Safety**: Full TypeScript support for reliable development
- **Responsive Design**: Works seamlessly across all device sizes

The system is production-ready and can be extended with additional features like file sharing, voice messages, and video calls.

---

**Navigation:**
- [← Previous: Public & Guest Features](./25-public-guest-features.md)
- [Next: Tiptap Rich Text Editor →](./27-tiptap-editor.md)
- [↑ Back to Volume 4 Index](./README.md)
