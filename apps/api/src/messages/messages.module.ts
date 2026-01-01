import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { ChatGateway } from '../chat/chat.gateway';
import {
  User,
  Conversation,
  ConversationParticipant,
  Message,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Conversation,
      ConversationParticipant,
      Message,
    ]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, ChatGateway],
  exports: [MessagesService],
})
export class MessagesModule {}
