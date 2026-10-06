import { apiClient } from '@/lib/api';

export const mediaService = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  deleteFile: async (id: string) => {
    const response = await apiClient.delete(`/media/${id}`);
    return response.data;
  }
};
