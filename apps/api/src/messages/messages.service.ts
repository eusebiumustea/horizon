import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  User,
  Conversation,
  ConversationParticipant,
  Message,
} from './entities';
import {
  CreateMessageDto,
  CreateConversationDto,
  ApiError,
  ErrorCode,
} from '@repo/shared';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private participantRepository: Repository<ConversationParticipant>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createConversation(data: CreateConversationDto, creatorId: string) {
    // Create conversation
    const conversation = this.conversationRepository.create({
      type: data.type,
      name: data.name,
    });
    await this.conversationRepository.save(conversation);

    // Add participants
    const participants = [
      this.participantRepository.create({
        conversationId: conversation.id,
        userId: creatorId,
        role: 'admin',
      }),
      ...data.participantIds.map((userId) =>
        this.participantRepository.create({
          conversationId: conversation.id,
          userId,
          role: 'member',
        }),
      ),
    ];
    await this.participantRepository.save(participants);

    // Return conversation with participants
    return this.conversationRepository.findOne({
      where: { id: conversation.id },
      relations: ['participants', 'participants.user'],
    });
  }

  async getUserConversations(userId: string) {
    return this.conversationRepository.find({
      where: {
        participants: {
          userId,
        },
      },
      relations: ['participants', 'participants.user', 'messages'],
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async getConversationMessages(
    conversationId: string,
    userId: string,
    skip = 0,
    take = 50,
  ) {
    // Check if user is participant
    const participant = await this.participantRepository.findOne({
      where: {
        conversationId,
        userId,
      },
    });

    if (!participant) {
      throw new ApiError(
        ErrorCode.FORBIDDEN,
        'User is not authorized to access this conversation',
      );
    }

    return this.messageRepository.find({
      where: {
        conversationId,
        isDeleted: false,
      },
      relations: ['sender'],
      order: {
        sentAt: 'DESC',
      },
      skip,
      take,
    });
  }

  async createMessage(data: CreateMessageDto, senderId: string) {
    // Check if user is participant
    const participant = await this.participantRepository.findOne({
      where: {
        conversationId: data.conversationId,
        userId: senderId,
      },
    });

    if (!participant) {
      throw new ApiError(
        ErrorCode.FORBIDDEN,
        'User is not authorized to send messages in this conversation',
      );
    }

    const message = this.messageRepository.create({
      conversationId: data.conversationId,
      senderId,
      content: data.content,
      messageType: data.messageType || 'text',
    });
    await this.messageRepository.save(message);

    // Update conversation timestamp
    await this.conversationRepository.update(
      { id: data.conversationId },
      { updatedAt: new Date() },
    );

    return this.messageRepository.findOne({
      where: { id: message.id },
      relations: ['sender'],
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.messageRepository.findOne({
      where: {
        id: messageId,
        senderId: userId,
      },
    });

    if (!message) {
      throw new ApiError(
        ErrorCode.NOT_FOUND,
        'Message not found or user is not authorized to delete it',
      );
    }

    await this.messageRepository.update({ id: messageId }, { isDeleted: true });

    return { success: true };
  }

  async getConversationById(conversationId: string, userId: string) {
    const conversation = await this.conversationRepository.findOne({
      where: {
        id: conversationId,
        participants: {
          userId,
        },
      },
      relations: ['participants', 'participants.user'],
    });

    if (!conversation) {
      throw new ApiError(ErrorCode.NOT_FOUND, 'Conversation not found');
    }

    return conversation;
  }
}
