import { apiClient } from '@/lib/api';

export interface Message {
  id: string;
  name: string;
  email: string;
  subject?: string;
  body: string;
  isRead: boolean;
  isArchived?: boolean;
  status?: string;
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

  updateStatus: async (id: string, data: { isRead?: boolean; isArchived?: boolean }) => {
    const response = await apiClient.patch(`/messages/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/messages/${id}`);
    return response.data;
  }
};
