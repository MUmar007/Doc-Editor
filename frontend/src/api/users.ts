import { apiClient } from './client';
import type { User } from '../types';

export const getUsers = (): Promise<User[]> =>
  apiClient.get<User[]>('/api/users').then((r) => r.data);
