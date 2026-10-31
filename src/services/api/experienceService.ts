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
    const response = await apiClient.get('/admin/experience?all=true');
    const data = response.data?.data || response.data;
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        ...item,
        startDate: item.startDate ? item.startDate.split('T')[0].substring(0, 7) : item.startDate,
        endDate: item.endDate ? item.endDate.split('T')[0].substring(0, 7) : item.endDate,
      }));
    }
    return data;
  },
  
  getById: async (id: string): Promise<Experience> => {
    const response = await apiClient.get(`/admin/experience/${id}`);
    const item = response.data?.data || response.data;
    if (item) {
      item.startDate = item.startDate ? item.startDate.split('T')[0].substring(0, 7) : item.startDate;
      item.endDate = item.endDate ? item.endDate.split('T')[0].substring(0, 7) : item.endDate;
    }
    return item;
  },

  create: async (data: any) => {
    const payload = {
      company: data.company,
      role: data.role,
      startDate: data.startDate ? new Date(data.startDate + '-01').toISOString() : new Date().toISOString(),
      endDate: data.endDate ? new Date(data.endDate + '-01').toISOString() : null,
      description: data.description,
      icon: data.icon,
    };
    const response = await apiClient.post('/admin/experience', payload);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const payload = {
      company: data.company,
      role: data.role,
      startDate: data.startDate ? new Date(data.startDate + '-01').toISOString() : undefined,
      endDate: data.endDate ? new Date(data.endDate + '-01').toISOString() : null,
      description: data.description,
      icon: data.icon,
    };
    const response = await apiClient.put(`/admin/experience/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/admin/experience/${id}`);
    return response.data;
  }
};
