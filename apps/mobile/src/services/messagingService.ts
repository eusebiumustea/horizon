import {
  API_ENDPOINTS,
  Conversation,
  Message,
  CreateConversationDto,
  CreateMessageDto,
  defaultHttpClient,
  HttpClient,
  createHttpClient,
  User,
} from '@repo/shared';
import { Platform } from 'react-native';

class MessagingService {
  private httpClient: HttpClient;
  private currentUserId: string | null = null;

  constructor(httpClient?: HttpClient) {
    if (httpClient) {
      this.httpClient = httpClient;
    } else {
      // For mobile, use the correct baseURL
      const YOUR_MACHINE_IP = '192.168.1.106'; // Replace with your IP
      const baseURL =
        Platform.OS === 'android'
          ? `http://${YOUR_MACHINE_IP}:3000`
          : 'http://localhost:3000';
      this.httpClient = createHttpClient({ baseURL });
    }
  }

  setUserId(userId: string) {
    this.currentUserId = userId;
  }

  getUserId(): string | null {
    return this.currentUserId;
  }

  private getHeaders(): Record<string, string> {
    return this.currentUserId ? { 'user-id': this.currentUserId } : {};
  }

  async createUser(username: string) {
    const response = await this.httpClient.post<{ id: string }>(
      '/users',
      { username },
      { headers: {} },
    );
    this.currentUserId = response.id;
    return response;
  }

  async getUsers(): Promise<User[]> {
    return this.httpClient.get<User[]>(API_ENDPOINTS.USERS, {
      headers: this.getHeaders(),
    });
  }

  async getConversations(): Promise<Conversation[]> {
    return this.httpClient.get<Conversation[]>(API_ENDPOINTS.CONVERSATIONS, {
      headers: this.getHeaders(),
    });
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    return this.httpClient.get<Conversation>(
      `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}`,
      { headers: this.getHeaders() },
    );
  }

  async createConversation(data: CreateConversationDto): Promise<Conversation> {
    return this.httpClient.post<Conversation>(
      API_ENDPOINTS.CONVERSATIONS,
      data,
      { headers: this.getHeaders() },
    );
  }

  async getConversationMessages(
    conversationId: string,
    skip = 0,
    take = 50,
  ): Promise<Message[]> {
    return this.httpClient.get<Message[]>(
      `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}/messages`,
      { params: { skip, take }, headers: this.getHeaders() },
    );
  }

  async sendMessage(
    conversationId: string,
    data: CreateMessageDto,
  ): Promise<Message> {
    return this.httpClient.post<Message>(
      `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}/messages`,
      data,
      { headers: this.getHeaders() },
    );
  }

  async deleteMessage(messageId: string): Promise<{ success: boolean }> {
    return this.httpClient.delete<{ success: boolean }>(
      `${API_ENDPOINTS.CONVERSATIONS}/messages/${messageId}`,
    );
  }
}

export const messagingService = new MessagingService();
