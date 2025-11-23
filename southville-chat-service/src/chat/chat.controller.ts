import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { GetConversationsDto } from './dto/get-conversations.dto';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getConversations(
    @Request() req,
    @Query() query: GetConversationsDto,
  ) {
    try {
      if (!req.user || !req.user.id) {
        throw new Error('User not found in request. Authentication may have failed.');
      }
      
      const userId = req.user.id;
      return await this.chatService.getConversations(
        userId,
        query.page || 1,
        query.limit || 20,
      );
    } catch (error) {
      console.error('Error in getConversations:', error);
      throw error;
    }
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async createConversation(
    @Request() req,
    @Body() dto: CreateConversationDto,
  ) {
    const userId = req.user.id;

    if (dto.type === 'direct') {
      if (!dto.targetUserId) {
        throw new Error('targetUserId is required for direct conversations');
      }
      return this.chatService.createDirectConversation(userId, dto.targetUserId);
    } else if (dto.type === 'group_section') {
      if (!dto.sectionId) {
        throw new Error('sectionId is required for group section conversations');
      }
      return this.chatService.getOrCreateSectionGroupChat(dto.sectionId, userId);
    }

    throw new Error('Invalid conversation type');
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(@Request() req, @Body() dto: SendMessageDto) {
    const userId = req.user.id;
    return this.chatService.sendMessage(dto.conversationId, userId, dto);
  }

  @Get('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getMessages(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user.id;
    return this.chatService.getMessages(
      conversationId,
      userId,
      page || 1,
      limit || 50,
    );
  }

  @Post('conversations/:conversationId/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  @ApiResponse({ status: 200, description: 'Conversation marked as read' })
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Request() req,
    @Param('conversationId') conversationId: string,
  ) {
    const userId = req.user.id;
    await this.chatService.markAsRead(conversationId, userId);
    return { success: true };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get total unread message count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@Request() req) {
    const userId = req.user.id;
    const count = await this.chatService.getUnreadCount(userId);
    return { unread_count: count };
  }

  @Delete('conversations/:conversationId')
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiResponse({ status: 200, description: 'Conversation deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not a participant' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @HttpCode(HttpStatus.OK)
  async deleteConversation(
    @Request() req,
    @Param('conversationId') conversationId: string,
  ) {
    const userId = req.user.id;
    await this.chatService.deleteConversation(conversationId, userId);
    return { success: true };
  }
}

