import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { MessagesService } from '../messages/messages.service';
import { CreateMessageDto, SOCKET_EVENTS } from '@repo/shared';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // Configure for production
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private messagesService: MessagesService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // In a real app, you'd authenticate the user here
    // For now, we'll use a simple userId from query params
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client.id);
      this.server.emit(SOCKET_EVENTS.USER_ONLINE, { userId });
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Find and remove the disconnected user
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        this.server.emit(SOCKET_EVENTS.USER_OFFLINE, { userId });
        break;
      }
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.JOIN_CONVERSATION)
  async handleJoinConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(conversationId);
    this.logger.log(`User joined conversation: ${conversationId}`);
  }

  @SubscribeMessage(SOCKET_EVENTS.LEAVE_CONVERSATION)
  async handleLeaveConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(conversationId);
    this.logger.log(`User left conversation: ${conversationId}`);
  }

  @SubscribeMessage(SOCKET_EVENTS.SEND_MESSAGE)
  async handleSendMessage(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // In a real app, get userId from authenticated session
      const userId = client.handshake.query.userId as string;

      if (!userId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      // Create message in database
      const message = await this.messagesService.createMessage(data, userId);

      // Emit to all participants in the conversation
      this.server
        .to(data.conversationId)
        .emit(SOCKET_EVENTS.MESSAGE_RECEIVED, message);

      this.logger.log(`Message sent in conversation: ${data.conversationId}`);
    } catch (error) {
      this.logger.error('Error sending message:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.TYPING_START)
  async handleTypingStart(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.to(data.conversationId).emit(SOCKET_EVENTS.USER_TYPING, {
        userId,
        conversationId: data.conversationId,
        isTyping: true,
      });
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.TYPING_STOP)
  async handleTypingStop(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.to(data.conversationId).emit(SOCKET_EVENTS.USER_TYPING, {
        userId,
        conversationId: data.conversationId,
        isTyping: false,
      });
    }
  }
}
