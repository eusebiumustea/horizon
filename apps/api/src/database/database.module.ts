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
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT, 10) || 5433,
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || '12345678',
      url: process.env.DATABASE_URL,
      database: process.env.DATABASE_NAME || 'postgres',
      entities: [User, Conversation, ConversationParticipant, Message],
      synchronize: true, // Set to false in production
      logging: ['query', 'info', 'warn', 'error'],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
