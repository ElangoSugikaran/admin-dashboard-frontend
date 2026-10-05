import { apiClient } from '@/lib/api';

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export const experienceService = {
  getAll: async (): Promise<Experience[]> => {
    const response = await apiClient.get('/experience');
    return response.data?.data || response.data;
  },
  
  getById: async (id: string): Promise<Experience> => {
    const response = await apiClient.get(`/experience/${id}`);
    return response.data?.data || response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/experience', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/experience/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/experience/${id}`);
    return response.data;
  }
};
