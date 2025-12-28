import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import {
  CreateMessageDto,
  CreateConversationDto,
  API_ENDPOINTS,
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
    // For now, using a hardcoded userId - replace with actual auth
    const userId = 'user-1';
    return this.messagesService.createConversation(data, userId);
  }

  @Get()
  async getUserConversations() // In a real app, get userId from authenticated user
  {
    // For now, using a hardcoded userId - replace with actual auth
    const userId = 'user-1';
    return this.messagesService.getUserConversations(userId);
  }

  @Get(':id')
  async getConversation(@Param('id') conversationId: string) {
    // For now, using a hardcoded userId - replace with actual auth
    const userId = 'user-1';
    return this.messagesService.getConversationById(conversationId, userId);
  }

  @Get(':id/messages')
  async getConversationMessages(
    @Param('id') conversationId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    // For now, using a hardcoded userId - replace with actual auth
    const userId = 'user-1';
    return this.messagesService.getConversationMessages(
      conversationId,
      userId,
      parseInt(skip || '0'),
      parseInt(take || '50'),
    );
  }

  @Post(':id/messages')
  async createMessage(
    @Param('id') conversationId: string,
    @Body() data: CreateMessageDto,
  ) {
    // For now, using a hardcoded userId - replace with actual auth
    const userId = 'user-1';
    return this.messagesService.createMessage(
      { ...data, conversationId },
      userId,
    );
  }
}
