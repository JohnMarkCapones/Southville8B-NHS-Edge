export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  attachment_url: string | null;
  created_at: string;
}

export interface MessageWithSender extends Message {
  sender: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
}

