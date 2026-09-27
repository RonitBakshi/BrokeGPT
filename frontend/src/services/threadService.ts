import { request } from './api';
import { CreateThreadResponse, Thread } from '../types/thread';

export const threadService = {
  async getThreads(): Promise<Thread[]> {
    return request<Thread[]>('/threads/', {
      method: 'GET',
    });
  },

  async createThread(title: string = 'New conversation'): Promise<CreateThreadResponse> {
    const params = new URLSearchParams({ title });
    return request<CreateThreadResponse>(`/threads/?${params.toString()}`, {
      method: 'POST',
    });
  },

  async getThread(threadId: string): Promise<Thread> {
    return request<Thread>(`/threads/${threadId}`, {
      method: 'GET',
    });
  },

  async deleteThread(threadId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/threads/${threadId}`, {
      method: 'DELETE',
    });
  },
};
