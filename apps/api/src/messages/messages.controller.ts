import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import {
  ApiError,
  ErrorCode,
  CreateMessageDto,
  CreateConversationDto,
  API_ENDPOINTS,
  createSuccessResponse,
  createErrorResponse,
} from '@repo/shared';

@Controller()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('users')
  async createUser(@Body() data: { username: string }) {
    try {
      const user = await this.messagesService.createUser(data.username);
      return createSuccessResponse(user, {
        message: 'User created successfully',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw createErrorResponse(error.code, error.message, error.details);
      }
      throw createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to create user',
      );
    }
  }

  @Get('users')
  async getUsers() {
    try {
      const users = await this.messagesService.getUsers();
      return createSuccessResponse(users, {
        message: 'Users retrieved successfully',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw createErrorResponse(error.code, error.message, error.details);
      }
      throw createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to get users',
      );
    }
  }

  @Post(API_ENDPOINTS.CONVERSATIONS)
  async createConversation(
    @Body() data: CreateConversationDto,
    @Headers('user-id') userId: string,
  ) {
    try {
      const conversation = await this.messagesService.createConversation(
        data,
        userId,
      );
      return createSuccessResponse(conversation, {
        message: 'Conversation created successfully',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw createErrorResponse(error.code, error.message, error.details);
      }

      // Fallback for unexpected errors
      throw createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        error instanceof Error
          ? error.message
          : 'Failed to create conversation',
      );
    }
  }

  @Get(`${API_ENDPOINTS.CONVERSATIONS}/:id`)
  async getConversation(
    @Param('id') conversationId: string,
    @Headers('user-id') userId: string,
  ) {
    try {
      const conversation = await this.messagesService.getConversationById(
        conversationId,
        userId,
      );
      return createSuccessResponse(conversation);
    } catch (error) {
      if (error instanceof ApiError) {
        throw createErrorResponse(error.code, error.message, error.details);
      }

      // Fallback for unexpected errors
      throw createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to fetch conversation',
      );
    }
  }

  @Get(API_ENDPOINTS.CONVERSATIONS)
  async getUserConversations(@Headers('user-id') userId: string) {
    try {
      const conversations =
        await this.messagesService.getParticipantConversations(userId);
      return createSuccessResponse(conversations);
    } catch (error) {
      if (error instanceof ApiError) {
        throw createErrorResponse(error.code, error.message, error.details);
      }

      // Fallback for unexpected errors
      throw createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        error instanceof Error
          ? error.message
          : 'Failed to fetch conversations',
      );
    }
  }

  @Get(`${API_ENDPOINTS.CONVERSATIONS}/:id/messages`)
  async getConversationMessages(
    @Param('id') conversationId: string,
    @Headers('user-id') userId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    try {
      const messages = await this.messagesService.getConversationMessages(
        conversationId,
        userId,
        parseInt(skip || '0'),
        parseInt(take || '50'),
      );
      return createSuccessResponse(messages);
    } catch (error) {
      if (error instanceof ApiError) {
        throw createErrorResponse(error.code, error.message, error.details);
      }

      // Fallback for unexpected errors
      throw createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to fetch messages',
      );
    }
  }

  @Post(`${API_ENDPOINTS.CONVERSATIONS}/:id/messages`)
  async createMessage(
    @Param('id') conversationId: string,
    @Body() data: CreateMessageDto,
    @Headers('user-id') userId: string,
  ) {
    try {
      const message = await this.messagesService.createMessage(
        { ...data, conversationId },
        userId,
      );
      return createSuccessResponse(message, {
        message: 'Message sent successfully',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw createErrorResponse(error.code, error.message, error.details);
      }

      // Fallback for unexpected errors
      throw createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to send message',
      );
    }
  }

  @Delete(':conversationId/messages/:messageId')
  async deleteMessage(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
  ) {
    try {
      // For now, using a hardcoded userId - replace with actual auth
      const userId = 'user-1';
      const result = await this.messagesService.deleteMessage(
        conversationId,
        messageId,
        userId,
      );
      return createSuccessResponse(result, {
        message: 'Message deleted successfully',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw createErrorResponse(error.code, error.message, error.details);
      }

      // Fallback for unexpected errors
      throw createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Failed to delete message',
      );
    }
  }
}
