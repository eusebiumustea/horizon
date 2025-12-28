import {
  API_ENDPOINTS,
  Conversation,
  Message,
  CreateConversationDto,
  CreateMessageDto,
} from "@repo/shared";

const API_BASE_URL = "http://localhost:3000";

class MessagingService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getConversations(): Promise<Conversation[]> {
    return this.request<Conversation[]>(API_ENDPOINTS.CONVERSATIONS);
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    return this.request<Conversation>(
      `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}`
    );
  }

  async createConversation(data: CreateConversationDto): Promise<Conversation> {
    return this.request<Conversation>(API_ENDPOINTS.CONVERSATIONS, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getConversationMessages(
    conversationId: string,
    skip = 0,
    take = 50
  ): Promise<Message[]> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      take: take.toString(),
    });
    return this.request<Message[]>(
      `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}/messages?${params}`
    );
  }

  async sendMessage(
    conversationId: string,
    data: CreateMessageDto
  ): Promise<Message> {
    return this.request<Message>(
      `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }
}

export const messagingService = new MessagingService();
