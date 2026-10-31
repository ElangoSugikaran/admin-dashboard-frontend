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
    const response = await apiClient.get('/admin/messages');
    return response.data?.data || response.data;
  },
  
  getById: async (id: string): Promise<Message> => {
    const response = await apiClient.get(`/admin/messages/${id}`);
    return response.data?.data || response.data;
  },

  updateStatus: async (id: string, data: { isRead?: boolean; isArchived?: boolean }) => {
    const response = await apiClient.patch(`/admin/messages/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/admin/messages/${id}`);
    return response.data;
  }
};
