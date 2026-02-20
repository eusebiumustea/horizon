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

  async createUser(username: string) {
    // Check if user exists
    let user = await this.userRepository.findOne({ where: { name: username } });
    if (user) {
      return user;
    }

    // Create new user
    user = this.userRepository.create({
      email: `${username}@example.com`,
      name: username,
    });
    await this.userRepository.save(user);
    return user;
  }

  async getUsers() {
    return this.userRepository.find({
      select: ['id', 'name', 'email'],
    });
  }

  async createConversation(data: CreateConversationDto, creatorId: string) {
    // Ensure all users exist and get their UUIDs

    const allUserIds = (await this.userRepository.find({ select: ['id'] })).map(
      (user) => user.id,
    );

    // const allUserIds = [creatorId, ...data.participantIds];
    const uniqueUserIds = [...new Set(allUserIds)];
    const userMap = new Map<string, string>();

    for (const userId of uniqueUserIds) {
      let user = await this.userRepository.findOne({
        where: { email: `${userId}@example.com` },
      });
      if (!user) {
        user = this.userRepository.create({
          email: `${userId}@example.com`,
          name: userId,
        });
        await this.userRepository.save(user);
      }
      userMap.set(userId, user.id);
    }

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
        userId: userMap.get(creatorId)!,
        role: 'admin',
      }),
      ...data.participantIds.map((userId) =>
        this.participantRepository.create({
          conversationId: conversation.id,
          userId: userMap.get(userId)!,
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

  async getParticipantConversations(userId: string) {
    const participants = await this.participantRepository.find({
      where: { userId },
      relations: [
        'conversation',
        'conversation.participants',
        'conversation.participants.user',
      ],
    });

    return participants;
  }

  async getConversationMessages(
    conversationId: string,
    userId: string,
    skip = 0,
    take = 50,
  ) {
    // Find the user UUID
    const user = await this.userRepository.findOne({
      where: { email: `${userId}@example.com` },
    });
    if (!user) {
      throw new ApiError(ErrorCode.NOT_FOUND, 'User not found');
    }

    // Check if user is participant
    const participant = await this.participantRepository.findOne({
      where: {
        conversationId,
        userId: user.id,
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
    // Find the user UUID
    const user = await this.userRepository.findOne({
      where: { email: `${senderId}@example.com` },
    });
    if (!user) {
      throw new ApiError(ErrorCode.NOT_FOUND, 'User not found');
    }

    // Check if user is participant
    const participant = await this.participantRepository.findOne({
      where: {
        conversationId: data.conversationId,
        userId: user.id,
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
      senderId: user.id,
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

  async deleteMessage(
    conversationId: string,
    messageId: string,
    userId: string,
  ) {
    const message = await this.messageRepository.findOne({
      where: {
        id: messageId,
        conversationId,
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
