import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import {
  CreateMessageDto,
  CreateConversationDto,
  API_ENDPOINTS,
  createSuccessResponse,
  createErrorResponse,
  ErrorCode,
  getHttpStatusForErrorCode,
  ApiError,
} from '@repo/shared';

@Controller(API_ENDPOINTS.CONVERSATIONS)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async createConversation(
    @Body() data: CreateConversationDto,
    // In a real app, get userId from authenticated user
    // @Req() req: Request
  ) {
    try {
      // For now, using a hardcoded userId - replace with actual auth
      const userId = 'user-1';
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

  @Get()
  async getUserConversations() {
    // In a real app, get userId from authenticated user
    try {
      // For now, using a hardcoded userId - replace with actual auth
      const userId = 'user-1';
      const conversations =
        await this.messagesService.getUserConversations(userId);
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

  @Get(':id')
  async getConversation(@Param('id') conversationId: string) {
    try {
      // For now, using a hardcoded userId - replace with actual auth
      const userId = 'user-1';
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

  @Get(':id/messages')
  async getConversationMessages(
    @Param('id') conversationId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    try {
      // For now, using a hardcoded userId - replace with actual auth
      const userId = 'user-1';
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

  @Post(':id/messages')
  async createMessage(
    @Param('id') conversationId: string,
    @Body() data: CreateMessageDto,
  ) {
    try {
      // For now, using a hardcoded userId - replace with actual auth
      const userId = 'user-1';
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

  @Delete('messages/:messageId')
  async deleteMessage(@Param('messageId') messageId: string) {
    try {
      // For now, using a hardcoded userId - replace with actual auth
      const userId = 'user-1';
      const result = await this.messagesService.deleteMessage(
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
