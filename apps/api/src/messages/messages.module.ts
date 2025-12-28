import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { ChatGateway } from '../chat/chat.gateway';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, ChatGateway],
  exports: [MessagesService],
})
export class MessagesModule {}
