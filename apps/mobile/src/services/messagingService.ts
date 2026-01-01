import {
  API_ENDPOINTS,
  Conversation,
  Message,
  CreateConversationDto,
  CreateMessageDto,
  defaultHttpClient,
  HttpClient,
} from "@repo/shared";

class MessagingService {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient = defaultHttpClient) {
    this.httpClient = httpClient;
  }

  async getConversations(): Promise<Conversation[]> {
    return this.httpClient.get<Conversation[]>(API_ENDPOINTS.CONVERSATIONS);
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    return this.httpClient.get<Conversation>(
      `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}`
    );
  }

  async createConversation(data: CreateConversationDto): Promise<Conversation> {
    return this.httpClient.post<Conversation>(
      API_ENDPOINTS.CONVERSATIONS,
      data
    );
  }

  async getConversationMessages(
    conversationId: string,
    skip = 0,
    take = 50
  ): Promise<Message[]> {
    return this.httpClient.get<Message[]>(
      `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}/messages`,
      { params: { skip, take } }
    );
  }

  async sendMessage(
    conversationId: string,
    data: CreateMessageDto
  ): Promise<Message> {
    return this.httpClient.post<Message>(
      `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}/messages`,
      data
    );
  }

  async deleteMessage(messageId: string): Promise<{ success: boolean }> {
    return this.httpClient.delete<{ success: boolean }>(
      `${API_ENDPOINTS.CONVERSATIONS}/messages/${messageId}`
    );
  }
}

export const messagingService = new MessagingService();
