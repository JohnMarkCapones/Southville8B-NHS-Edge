/**
 * Chat Service TypeScript Types
 * 
 * Types matching the backend chat service DTOs with snake_case properties.
 * Backend API returns JSON in snake_case format.
 * 
 * @module types/chat
 */

/**
 * Conversation types
 */
export type ConversationType = 'direct' | 'group_section';

/**
 * Message types
 */
export type MessageType = 'text' | 'image' | 'file';

/**
 * User role in conversation
 */
export type ConversationRole = 'admin' | 'teacher' | 'student';

/**
 * User information in conversation participant
 */
export interface ConversationUser {
  id: string;
  full_name: string;
  email: string;
}

/**
 * Conversation participant
 */
export interface ConversationParticipant {
  user_id: string;
  role: ConversationRole;
  last_read_at?: string;
  joined_at: string;
  user?: ConversationUser;
}

/**
 * Conversation entity
 */
export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Conversation with participants
 */
export interface ConversationWithParticipants extends Conversation {
  participants?: ConversationParticipant[];
  last_message?: MessageWithSender;
  unread_count?: number;
}

/**
 * Message entity
 */
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  attachment_url?: string;
  created_at: string;
}

/**
 * Message with sender information
 */
export interface MessageWithSender extends Message {
  sender?: ConversationUser;
}

/**
 * Paginated conversations response
 */
export interface ConversationsResponse {
  conversations: ConversationWithParticipants[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Paginated messages response
 */
export interface MessagesResponse {
  messages: MessageWithSender[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Create conversation request
 * Note: Backend DTO uses camelCase (sectionId, targetUserId), not snake_case
 */
export interface CreateConversationRequest {
  type: ConversationType;
  targetUserId?: string;
  sectionId?: string;
  title?: string;
}

/**
 * Send message request
 * Note: Backend DTO uses camelCase (conversationId, messageType, attachmentUrl), not snake_case
 */
export interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType?: MessageType;
  attachmentUrl?: string;
}

/**
 * Unread count response
 */
export interface UnreadCountResponse {
  unread_count: number;
}

