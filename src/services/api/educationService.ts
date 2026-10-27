import { apiClient } from '@/lib/api';

export interface Education {
  id: string;
  institution: string;
  title: string;
  degree?: string;
  type: 'DEGREE' | 'DIPLOMA' | 'CERTIFICATE' | 'TRAINING' | 'SCHOOL' | string;
  startDate: string;
  endDate?: string | null;
  grade?: string | null;
  description?: string | null;
  icon?: string | null;
  showOnHome?: boolean;
  isVisible?: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export const educationService = {
  getAll: async (): Promise<Education[]> => {
    const response = await apiClient.get('/education?all=true');
    const data = response.data?.data || response.data;
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        ...item,
        title: item.title || item.degree || '',
        degree: item.title || item.degree || '',
        sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : 0,
      }));
    }
    return data;
  },
  
  getById: async (id: string): Promise<Education> => {
    const response = await apiClient.get(`/education/${id}`);
    const item = response.data?.data || response.data;
    if (item) {
      item.title = item.title || item.degree || '';
      item.degree = item.title || item.degree || '';
      item.sortOrder = typeof item.sortOrder === 'number' ? item.sortOrder : 0;
    }
    return item;
  },

  create: async (data: any) => {
    const payload = {
      title: data.title || data.degree || 'Degree',
      institution: data.institution,
      type: data.type || 'DEGREE',
      startDate: data.startDate,
      endDate: data.endDate && data.endDate.trim() !== '' ? data.endDate : null,
      grade: data.grade && data.grade.trim() !== '' ? data.grade : null,
      description: data.description || null,
      icon: data.icon || null,
      sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
      showOnHome: Boolean(data.showOnHome),
      isVisible: data.isVisible !== undefined ? Boolean(data.isVisible) : true,
    };
    const response = await apiClient.post('/education', payload);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const payload = {
      title: data.title || data.degree,
      institution: data.institution,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate && data.endDate.trim() !== '' ? data.endDate : null,
      grade: data.grade && data.grade.trim() !== '' ? data.grade : null,
      description: data.description || null,
      icon: data.icon || null,
      sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
      showOnHome: data.showOnHome !== undefined ? Boolean(data.showOnHome) : undefined,
      isVisible: data.isVisible !== undefined ? Boolean(data.isVisible) : undefined,
    };
    const response = await apiClient.put(`/education/${id}`, payload);
    return response.data;
  },

  reorder: async (orders: { id: string; sortOrder: number }[]) => {
    const response = await apiClient.put('/education/reorder', { orders });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/education/${id}`);
    return response.data;
  }
};
