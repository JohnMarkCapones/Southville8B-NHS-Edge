import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { retryWithBackoff } from '../common/utils/retry.util';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import {
  Conversation,
  ConversationWithParticipants,
} from './entities/conversation.entity';
import { Message, MessageWithSender } from './entities/message.entity';
import { ConversationParticipant } from './entities/participant.entity';

interface RoleCacheEntry {
  role: string;
  timestamp: number;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly roleCache = new Map<string, RoleCacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get user role from database with caching and retry logic
   */
  private async getUserRole(userId: string): Promise<string | null> {
    // Check cache first
    const cached = this.roleCache.get(userId);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < this.CACHE_TTL) {
        this.logger.debug(`Role cache hit for user ${userId}: ${cached.role}`);
        return cached.role;
      }
      // Cache expired, remove it
      this.roleCache.delete(userId);
    }

    try {
      // Use retry logic with exponential backoff
      const role = await retryWithBackoff(
        async () => {
          const supabase = this.supabaseService.getServiceClient();

          const { data, error } = await supabase
            .from('users')
            .select('roles!inner(name)')
            .eq('id', userId)
            .single();

          if (error) {
            this.logger.debug(
              `Supabase error getting role for user ${userId}: ${error.message} (code: ${error.code})`,
            );
            throw new Error(
              `Failed to get role for user ${userId}: ${error.message || 'Database error'}`,
            );
          }

          if (!data) {
            throw new Error(`User ${userId} not found in database`);
          }

          const roleName = (data as any)?.roles?.name || null;
          if (!roleName) {
            throw new Error(
              `User ${userId} exists but has no role assigned. Data: ${JSON.stringify(data)}`,
            );
          }

          return roleName;
        },
        {
          maxRetries: 3,
          initialDelay: 100,
          maxDelay: 2000,
          backoffMultiplier: 2,
          timeout: 10000, // 10 seconds
        },
      );

      // Cache the result
      if (role) {
        this.roleCache.set(userId, {
          role,
          timestamp: Date.now(),
        });
        this.logger.debug(`Role fetched and cached for user ${userId}: ${role}`);
      }

      return role;
    } catch (error: any) {
      // Log error with context
      this.logger.error(
        `Failed to get role for user ${userId} after retries: ${error.message}`,
      );

      // Clear cache entry if it exists to allow fresh retry
      this.roleCache.delete(userId);

      // Return null gracefully instead of throwing
      return null;
    }
  }

  /**
   * Check if user can chat with target user (Desktop rules)
   * Admin↔Admin, Teacher↔Admin, Teacher↔Teacher
   */
  async canChat(userId: string, targetUserId: string): Promise<boolean> {
    const userRole = await this.getUserRole(userId);
    const targetRole = await this.getUserRole(targetUserId);

    if (!userRole || !targetRole) {
      return false;
    }

    // Admin can chat with Admin or Teacher
    if (userRole === 'Admin' && (targetRole === 'Admin' || targetRole === 'Teacher')) {
      return true;
    }

    // Teacher can chat with Admin or Teacher
    if (userRole === 'Teacher' && (targetRole === 'Admin' || targetRole === 'Teacher')) {
      return true;
    }

    return false;
  }

  /**
   * Get conversations for a user (filtered by role)
   */
  async getConversations(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    conversations: ConversationWithParticipants[];
    total: number;
    page: number;
    limit: number;
  }> {
    const supabase = this.supabaseService.getServiceClient();
    
    // getUserRole already has retry logic built in, but provide better error message
    const userRole = await this.getUserRole(userId);

    if (!userRole) {
      this.logger.error(
        `Cannot load conversations: User role not found for user ${userId} after retries`,
      );
      throw new NotFoundException(
        'User role not found. Please try again or contact support if the issue persists.',
      );
    }

    // Get all conversations where user is a participant
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: participants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (participantsError) {
      this.logger.error('Failed to get conversations:', participantsError);
      throw new BadRequestException('Failed to fetch conversations');
    }

    if (!participants || participants.length === 0) {
      return {
        conversations: [],
        total: 0,
        page,
        limit,
      };
    }

    const conversationIds = participants.map((p) => p.conversation_id);

    // Get conversations with participants and last message
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select(
        `
        *,
        participants:conversation_participants(
          user_id,
          role,
          last_read_at,
          joined_at,
          user:users(id, full_name, email)
        )
      `,
      )
      .in('id', conversationIds)
      .order('updated_at', { ascending: false })
      .range(from, to);

    if (conversationsError) {
      this.logger.error('Failed to get conversations:', conversationsError);
      throw new BadRequestException('Failed to fetch conversations');
    }

    // Get total count
    const { count } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .in('id', conversationIds);

    // Get last message and unread count for each conversation
    const conversationsWithDetails = await Promise.all(
      (conversations || []).map(async (conv) => {
        // Get last message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select(
            `
            *,
            sender:users(id, full_name, email)
          `,
          )
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get unread count for this user
        const participant = (conv.participants || []).find(
          (p: any) => p.user_id === userId,
        );
        const lastReadAt = participant?.last_read_at;

        let unreadCount = 0;
        if (lastReadAt) {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .gt('created_at', lastReadAt);
          unreadCount = count || 0;
        } else {
          // If never read, count all messages
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id);
          unreadCount = count || 0;
        }

        return {
          ...conv,
          last_message: lastMessage || undefined,
          unread_count: unreadCount,
        };
      }),
    );

    // Filter by role rules (Desktop: Admin↔Admin, Teacher↔Admin, Teacher↔Teacher)
    // Note: canChat is async, so we need to use Promise.all for filtering
    const filterResults = await Promise.all(
      conversationsWithDetails.map(async (conv) => {
        if (userRole === 'Student') {
          // Students are read-only, but they can see conversations they're in
          return { conv, include: true };
        }

        // For Admin/Teacher, only show direct conversations with allowed roles
        if (conv.type === 'direct') {
          const otherParticipants = (conv.participants || []).filter(
            (p: any) => p.user_id !== userId,
          );
          if (otherParticipants.length === 0) {
            return { conv, include: false };
          }

          const otherUserId = otherParticipants[0].user_id;
          try {
            const canChat = await this.canChat(userId, otherUserId);
            return { conv, include: canChat };
          } catch (error) {
            this.logger.warn(
              `Failed to check if user ${userId} can chat with ${otherUserId}: ${error instanceof Error ? error.message : String(error)}`,
            );
            // On error, exclude the conversation to be safe
            return { conv, include: false };
          }
        }

        // Group conversations are always visible if user is participant
        return { conv, include: true };
      }),
    );

    const filteredConversations = filterResults
      .filter((result) => result.include)
      .map((result) => result.conv);

    return {
      conversations: filteredConversations as ConversationWithParticipants[],
      total: count || 0,
      page,
      limit,
    };
  }

  /**
   * Create direct conversation (Admin↔Admin, Teacher↔Admin, Teacher↔Teacher)
   */
  async createDirectConversation(
    userId: string,
    targetUserId: string,
  ): Promise<Conversation> {
    // Check if users can chat
    const canChat = await this.canChat(userId, targetUserId);
    if (!canChat) {
      throw new ForbiddenException(
        'You cannot create a conversation with this user',
      );
    }

    const supabase = this.supabaseService.getServiceClient();

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (existing) {
      for (const participant of existing) {
        const { data: otherParticipant } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('conversation_id', participant.conversation_id)
          .eq('user_id', targetUserId)
          .single();

        if (otherParticipant) {
          // Conversation exists, return it
          const { data: conversation } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', participant.conversation_id)
            .single();

          if (conversation) {
            return conversation as Conversation;
          }
        }
      }
    }

    // Get user roles for participant records
    const userRole = await this.getUserRole(userId);
    const targetRole = await this.getUserRole(targetUserId);

    if (!userRole || !targetRole) {
      throw new NotFoundException('User roles not found');
    }

    // Create new conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        type: 'direct',
        title: null,
        created_by: userId,
      })
      .select()
      .single();

    if (convError || !conversation) {
      this.logger.error('Failed to create conversation:', convError);
      throw new BadRequestException('Failed to create conversation');
    }

    // Add participants
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert([
        {
          conversation_id: conversation.id,
          user_id: userId,
          role: userRole.toLowerCase() as 'admin' | 'teacher' | 'student',
        },
        {
          conversation_id: conversation.id,
          user_id: targetUserId,
          role: targetRole.toLowerCase() as 'admin' | 'teacher' | 'student',
        },
      ]);

    if (participantsError) {
      this.logger.error('Failed to add participants:', participantsError);
      throw new BadRequestException('Failed to add participants');
    }

    return conversation as Conversation;
  }

  /**
   * Get or create group chat for section (Web: Teacher group chat per section)
   */
  async getOrCreateSectionGroupChat(
    sectionId: string,
    teacherId: string,
  ): Promise<Conversation> {
    const supabase = this.supabaseService.getServiceClient();

    // Get section info
    const { data: section, error: sectionError } = await supabase
      .from('sections')
      .select('id, name, teacher_id')
      .eq('id', sectionId)
      .single();

    if (sectionError || !section) {
      throw new NotFoundException('Section not found');
    }

    // Verify teacher is assigned to this section
    if (section.teacher_id !== teacherId) {
      throw new ForbiddenException(
        'You are not assigned to this section',
      );
    }

    // Check if group chat already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('type', 'group_section')
      .eq('title', section.name)
      .single();

    if (existing) {
      return existing as Conversation;
    }

    // Get all students in section
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('user_id')
      .eq('section_id', sectionId);

    if (studentsError) {
      this.logger.error('Failed to get students:', studentsError);
      throw new BadRequestException('Failed to get students');
    }

    // Get teacher role
    const teacherRole = await this.getUserRole(teacherId);
    if (!teacherRole || teacherRole !== 'Teacher') {
      throw new ForbiddenException('Only teachers can create section group chats');
    }

    // Create group conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        type: 'group_section',
        title: section.name,
        created_by: teacherId,
      })
      .select()
      .single();

    if (convError || !conversation) {
      this.logger.error('Failed to create group conversation:', convError);
      throw new BadRequestException('Failed to create group conversation');
    }

    // Prepare participants
    const participants: Array<{
      conversation_id: string;
      user_id: string;
      role: 'admin' | 'teacher' | 'student';
    }> = [
      {
        conversation_id: conversation.id,
        user_id: teacherId,
        role: 'teacher',
      },
    ];

    // Add all students as participants
    for (const student of students || []) {
      if (student.user_id) {
        participants.push({
          conversation_id: conversation.id,
          user_id: student.user_id,
          role: 'student',
        });
      }
    }

    // Insert participants
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participants);

    if (participantsError) {
      this.logger.error('Failed to add participants:', participantsError);
      throw new BadRequestException('Failed to add participants');
    }

    return conversation as Conversation;
  }

  /**
   * Send message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    dto: SendMessageDto,
  ): Promise<Message> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify sender is participant
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('role')
      .eq('conversation_id', conversationId)
      .eq('user_id', senderId)
      .single();

    if (participantError || !participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Allow all participants (including students) to send messages
    // Students can now participate in section group chats

    // Insert message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: dto.content,
        message_type: dto.messageType || 'text',
        attachment_url: dto.attachmentUrl || null,
      })
      .select()
      .single();

    if (messageError || !message) {
      this.logger.error('Failed to send message:', messageError);
      throw new BadRequestException('Failed to send message');
    }

    // Update conversation updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Notify other participants about new message
    try {
      // Get all participants except the sender
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .neq('user_id', senderId);

      if (participants && participants.length > 0) {
        const recipientIds = participants.map((p) => p.user_id);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Create notifications for each recipient
        const notificationInserts = recipientIds.map((recipientId) => ({
          type: 'info',
          title: 'New Message',
          message: `You have a new message in your conversation.`,
          recipient_id: recipientId,
          created_by: senderId,
          expires_at: expiresAt.toISOString(),
          is_read: false,
        }));

        await supabase.from('alerts').insert(notificationInserts);
      }
    } catch (error) {
      // Don't fail message sending if notification fails
      this.logger.warn('Failed to create notifications for new message:', error);
    }

    return message as Message;
  }

  /**
   * Get messages for a conversation (paginated)
   */
  async getMessages(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    messages: MessageWithSender[];
    total: number;
    page: number;
    limit: number;
  }> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify user is participant
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get messages with sender info
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(
        `
        *,
        sender:users(id, full_name, email)
      `,
      )
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (messagesError) {
      this.logger.error('Failed to get messages:', messagesError);
      throw new BadRequestException('Failed to fetch messages');
    }

    // Get total count
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId);

    // Get role for each sender (resilient - one failure doesn't break all)
    const messagesList = messages || [];
    const messagesWithRole = await Promise.allSettled(
      messagesList.map(async (msg: any) => {
        const role = await this.getUserRole(msg.sender_id);
        return {
          ...msg,
          sender: {
            ...msg.sender,
            role: role || 'Unknown',
          },
        };
      }),
    );

    // Process results - handle both fulfilled and rejected promises
    const processedMessages = messagesWithRole.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        // If role fetch failed, use message with 'Unknown' role
        const msg = messagesList[index];
        this.logger.warn(
          `Failed to get role for sender ${msg?.sender_id || 'unknown'}, using 'Unknown': ${result.reason?.message || 'Unknown error'}`,
        );
        return {
          ...msg,
          sender: {
            ...msg.sender,
            role: 'Unknown',
          },
        };
      }
    });

    return {
      messages: processedMessages.reverse() as MessageWithSender[], // Reverse to show oldest first
      total: count || 0,
      page,
      limit,
    };
  }

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    const { error } = await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) {
      this.logger.error('Failed to mark as read:', error);
      throw new BadRequestException('Failed to mark conversation as read');
    }
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const supabase = this.supabaseService.getServiceClient();

    // Get all conversations user is in
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', userId);

    if (!participants || participants.length === 0) {
      return 0;
    }

    let totalUnread = 0;

    for (const participant of participants) {
      const lastReadAt = participant.last_read_at;

      let unreadCount = 0;
      if (lastReadAt) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', participant.conversation_id)
          .gt('created_at', lastReadAt);
        unreadCount = count || 0;
      } else {
        // If never read, count all messages
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', participant.conversation_id);
        unreadCount = count || 0;
      }

      totalUnread += unreadCount;
    }

    return totalUnread;
  }

  /**
   * Delete a conversation
   * Only participants can delete their conversation
   */
  async deleteConversation(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify user is a participant
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (participantError || !participant) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }

    // Verify conversation exists
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .single();

    if (conversationError || !conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Delete all participants (cascade will handle messages)
    const { error: deleteParticipantsError } = await supabase
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversationId);

    if (deleteParticipantsError) {
      this.logger.error('Failed to delete participants:', deleteParticipantsError);
      throw new BadRequestException('Failed to delete conversation participants');
    }

    // Delete the conversation
    const { error: deleteConversationError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (deleteConversationError) {
      this.logger.error('Failed to delete conversation:', deleteConversationError);
      throw new BadRequestException('Failed to delete conversation');
    }
  }
}

