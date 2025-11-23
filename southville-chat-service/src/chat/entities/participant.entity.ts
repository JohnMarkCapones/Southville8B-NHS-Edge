export interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'teacher' | 'student';
  last_read_at: string | null;
  joined_at: string;
}

export interface ParticipantWithUser extends ConversationParticipant {
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
}

