import { request } from './api';
import { ChatHistoryResponse, ChatResponse, HITLDecision } from '../types/chat';

export const chatService = {
  async sendMessage(threadId: string, message: string): Promise<ChatResponse> {
    return request<ChatResponse>(`/chat/${threadId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  async sendDecision(threadId: string, decision: HITLDecision): Promise<ChatResponse> {
    return request<ChatResponse>(`/chat/${threadId}`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    });
  },

  async getChatHistory(threadId: string): Promise<ChatHistoryResponse> {
    return request<ChatHistoryResponse>(`/chat/${threadId}/history`, {
      method: 'GET',
    });
  },
};
