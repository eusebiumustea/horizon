import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto, CreateConversationDto } from '@repo/shared';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async createConversation(data: CreateConversationDto, creatorId: string) {
    // Create conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        type: data.type,
        name: data.name,
        participants: {
          create: [
            // Add creator
            { userId: creatorId, role: 'admin' },
            // Add other participants
            ...data.participantIds.map((userId) => ({
              userId,
              role: 'member' as const,
            })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    return conversation;
  }

  async getUserConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            sentAt: 'desc',
          },
          include: {
            sender: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
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
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    if (!participant) {
      throw new Error('Unauthorized');
    }

    return this.prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      include: {
        sender: true,
      },
      orderBy: {
        sentAt: 'desc',
      },
      skip,
      take,
    });
  }

  async createMessage(data: CreateMessageDto, senderId: string) {
    // Check if user is participant
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId: data.conversationId,
        userId: senderId,
      },
    });

    if (!participant) {
      throw new Error('Unauthorized');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId,
        content: data.content,
        messageType: data.messageType || 'text',
      },
      include: {
        sender: true,
      },
    });

    // Update conversation timestamp
    await this.prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: userId,
      },
    });

    if (!message) {
      throw new Error('Message not found or unauthorized');
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });

    return { success: true };
  }

  async getConversationById(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation;
  }
}
