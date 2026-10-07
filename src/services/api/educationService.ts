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
    const data = response.data?.data || response.data;
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        ...item,
        degree: item.title || item.degree,
        startDate: item.startYear ? `${item.startYear}-01` : item.startDate,
        endDate: item.endYear ? `${item.endYear}-01` : item.endDate,
      }));
    }
    return data;
  },
  
  getById: async (id: string): Promise<Education> => {
    const response = await apiClient.get(`/education/${id}`);
    const item = response.data?.data || response.data;
    if (item) {
      item.degree = item.title || item.degree;
      item.startDate = item.startYear ? `${item.startYear}-01` : item.startDate;
      item.endDate = item.endYear ? `${item.endYear}-01` : item.endDate;
    }
    return item;
  },

  create: async (data: any) => {
    const payload = {
      title: data.degree || 'Degree',
      institution: data.institution,
      type: 'DEGREE',
      startYear: parseInt(data.startDate?.split('-')[0]) || new Date().getFullYear(),
      endYear: data.endDate ? parseInt(data.endDate.split('-')[0]) : null,
      description: data.description,
      icon: data.icon,
    };
    const response = await apiClient.post('/education', payload);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const payload = {
      title: data.degree,
      institution: data.institution,
      type: 'DEGREE',
      startYear: data.startDate ? parseInt(data.startDate?.split('-')[0]) : undefined,
      endYear: data.endDate ? parseInt(data.endDate.split('-')[0]) : null,
      description: data.description,
      icon: data.icon,
    };
    const response = await apiClient.put(`/education/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/education/${id}`);
    return response.data;
  }
};
