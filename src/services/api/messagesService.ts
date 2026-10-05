import { apiClient } from '@/lib/api';

export interface Message {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
}

export const messagesService = {
  getAll: async (): Promise<Message[]> => {
    const response = await apiClient.get('/messages');
    return response.data?.data || response.data;
  },
  
  getById: async (id: string): Promise<Message> => {
    const response = await apiClient.get(`/messages/${id}`);
    return response.data?.data || response.data;
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.patch(`/messages/${id}/read`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/messages/${id}`);
    return response.data;
  }
};
