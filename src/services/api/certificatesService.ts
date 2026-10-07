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
    const data = response.data?.data || response.data;
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        ...item,
        date: item.issuedAt ? item.issuedAt.split('T')[0].substring(0, 7) : item.date,
      }));
    }
    return data;
  },
  
  getById: async (id: string): Promise<Certificate> => {
    const response = await apiClient.get(`/certificates/${id}`);
    const item = response.data?.data || response.data;
    if (item) {
      item.date = item.issuedAt ? item.issuedAt.split('T')[0].substring(0, 7) : item.date;
    }
    return item;
  },

  create: async (data: any) => {
    const payload = {
      title: data.title,
      issuer: data.issuingBody,
      category: data.category,
      issuedAt: data.date ? new Date(data.date + '-01').toISOString() : null,
      credentialUrl: data.credentialUrl,
      imageId: data.file?.id,
    };
    const response = await apiClient.post('/certificates', payload);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const payload = {
      title: data.title,
      issuer: data.issuingBody,
      category: data.category,
      issuedAt: data.date ? new Date(data.date + '-01').toISOString() : undefined,
      credentialUrl: data.credentialUrl,
      imageId: data.file?.id,
    };
    const response = await apiClient.put(`/certificates/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/certificates/${id}`);
    return response.data;
  }
};
