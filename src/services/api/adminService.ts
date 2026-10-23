import { apiClient } from '@/lib/api';

export interface AdminProfile {
  id: string;
  email: string;
  name: string | null;
  profileImageId: string | null;
  profileImage: {
    id: string;
    url: string;
    alt: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  profileImageId?: string | null;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const adminService = {
  // Fetch current admin profile with profileImage
  getProfile: async (): Promise<AdminProfile> => {
    const res = await apiClient.get<{ success: boolean; admin: AdminProfile }>('/auth/me');
    return res.data.admin;
  },

  // Update name, email, or profileImageId
  updateProfile: async (data: UpdateProfileInput): Promise<AdminProfile> => {
    const res = await apiClient.put<{ success: boolean; admin: AdminProfile }>('/auth/profile', data);
    return res.data.admin;
  },

  // Update admin password
  updatePassword: async (data: UpdatePasswordInput): Promise<{ message: string }> => {
    const res = await apiClient.put<{ success: boolean; message: string }>('/auth/password', data);
    return res.data;
  },

  // Upload avatar to Cloudinary via existing media route
  uploadAvatar: async (file: File): Promise<{ id: string; url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<{ success: boolean; data: { id: string; url: string } }>(
      '/media/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data.data;
  },

  // Authentication endpoints
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
