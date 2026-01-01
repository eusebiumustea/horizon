import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  User,
  Conversation,
  ConversationParticipant,
  Message,
} from '../messages/entities';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, Conversation, ConversationParticipant, Message],
      synchronize: true, // Set to false in production
      logging: ['query', 'info', 'warn', 'error'],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
