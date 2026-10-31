import { apiClient } from '@/lib/api';

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  category: 'ACADEMIC' | 'DIGITAL';
  issuedAt?: string | null;
  date?: string;
  credentialUrl?: string | null;
  imageId: string;
  image?: {
    id: string;
    url: string;
    thumbnailUrl?: string;
    fileName?: string;
  };
  isVisible?: boolean;
  sortOrder?: number;
  name?: string;
  issuingBody?: string;
  file?: any;
}

export const certificatesService = {
  getAll: async (): Promise<Certificate[]> => {
    const response = await apiClient.get('/certificates?all=true');
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
      title: data.title?.trim(),
      issuer: data.issuingBody?.trim() || '',
      category: data.category || 'ACADEMIC',
      issuedAt: data.date && data.date.trim() !== '' ? new Date(data.date + '-01').toISOString() : null,
      credentialUrl: data.credentialUrl && data.credentialUrl.trim() !== '' ? data.credentialUrl.trim() : null,
      imageId: data.file?.id || (typeof data.file === 'string' ? data.file : undefined),
    };
    const response = await apiClient.post('/certificates', payload);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const payload = {
      title: data.title?.trim(),
      issuer: data.issuingBody?.trim() || '',
      category: data.category || 'ACADEMIC',
      issuedAt: data.date && data.date.trim() !== '' ? new Date(data.date + '-01').toISOString() : null,
      credentialUrl: data.credentialUrl && data.credentialUrl.trim() !== '' ? data.credentialUrl.trim() : null,
      imageId: data.file?.id || (typeof data.file === 'string' ? data.file : undefined),
    };
    const response = await apiClient.put(`/certificates/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/certificates/${id}`);
    return response.data;
  }
};

