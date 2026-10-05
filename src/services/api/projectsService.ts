import { apiClient } from '@/lib/api';

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  technologies?: string[];
  createdAt?: string;
}

export const projectsService = {
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get('/projects');
    return response.data?.data || response.data;
  },
  
  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data?.data || response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  }
};
