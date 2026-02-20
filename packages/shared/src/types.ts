export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  participants: ConversationParticipant[];
  lastMessage?: Message;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  joinedAt: Date;
  role: "member" | "admin";
  user: User;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: "text" | "image" | "file";
  sentAt: Date;
  editedAt?: Date;
  isDeleted: boolean;
  sender: User;
}

export interface CreateMessageDto {
  conversationId: string;
  content: string;
  messageType?: "text" | "image" | "file";
}

export interface CreateConversationDto {
  type: "direct" | "group";
  participantIds: string[];
  name?: string;
}

export interface MessageEvent {
  type:
    | "message"
    | "message_deleted"
    | "message_edited"
    | "user_joined"
    | "user_left";
  conversationId: string;
  data: unknown;
  timestamp: Date;
}
