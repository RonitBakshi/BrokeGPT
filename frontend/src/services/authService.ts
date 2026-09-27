import { request } from './api';
import { AuthResponse, SignupResponse, User } from '../types/auth';

export const authService = {
  async signup(username: string, password: string): Promise<SignupResponse> {
    const params = new URLSearchParams({ username, password });
    return request<SignupResponse>(`/auth/signup?${params.toString()}`, {
      method: 'POST',
    });
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    const body = new URLSearchParams();
    body.append('username', username);
    body.append('password', password);

    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me', {
      method: 'GET',
    });
  },
};
