import { ConversationParticipant } from './participant.entity';
import { Message } from './message.entity';

export interface Conversation {
  id: string;
  type: 'direct' | 'group_section';
  title: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationWithParticipants extends Conversation {
  participants: ConversationParticipant[];
  last_message?: Message;
  unread_count?: number;
}

