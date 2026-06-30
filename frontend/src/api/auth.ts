import { apiClient } from './client';
import type { TokenResponse } from '../types';

export const login = (email: string, password: string): Promise<TokenResponse> =>
  apiClient.post<TokenResponse>('/api/auth/login', { email, password }).then((r) => r.data);

export const register = (data: {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
}): Promise<TokenResponse> =>
  apiClient.post<TokenResponse>('/api/auth/register', data).then((r) => r.data);
