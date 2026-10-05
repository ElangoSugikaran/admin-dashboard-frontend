import { apiClient } from '@/lib/api';

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
  imageUrl?: string;
}

export const certificatesService = {
  getAll: async (): Promise<Certificate[]> => {
    const response = await apiClient.get('/certificates');
    return response.data?.data || response.data;
  },
  
  getById: async (id: string): Promise<Certificate> => {
    const response = await apiClient.get(`/certificates/${id}`);
    return response.data?.data || response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/certificates', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/certificates/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/certificates/${id}`);
    return response.data;
  }
};
