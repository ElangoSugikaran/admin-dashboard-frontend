import { apiClient } from '@/lib/api';

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export const educationService = {
  getAll: async (): Promise<Education[]> => {
    const response = await apiClient.get('/education');
    return response.data?.data || response.data;
  },
  
  getById: async (id: string): Promise<Education> => {
    const response = await apiClient.get(`/education/${id}`);
    return response.data?.data || response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/education', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/education/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/education/${id}`);
    return response.data;
  }
};
