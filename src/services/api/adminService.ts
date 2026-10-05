import { apiClient } from '@/lib/api';

export const adminService = {
  updateProfile: async (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) => {
    let responseData = null;
    
    // Update password if provided
    if (data.currentPassword && data.newPassword) {
      await apiClient.put('/auth/password', { 
        currentPassword: data.currentPassword, 
        newPassword: data.newPassword 
      });
    }
    
    // Update profile info
    if (data.name || data.email) {
      const response = await apiClient.put('/auth/profile', {
        name: data.name,
        email: data.email
      });
      responseData = response.data;
    }
    
    return responseData;
  },

  login: async (credentials: any) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};
