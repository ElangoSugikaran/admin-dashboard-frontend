import { apiClient } from '@/lib/api';

// Define the basic types for the entity (adjust based on your backend schema)
export interface Skill {
  id: string;
  name: string;
  proficiency?: number;
  icon?: string;
  category?: 'FRONTEND' | 'BACKEND' | 'FRAMEWORK' | 'DATABASE' | 'CSS_FRAMEWORK' | 'DESIGN_TOOL' | 'SERVICE' | 'TOOL' | string;
  showInSkills?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const skillsService = {
  getAll: async (): Promise<Skill[]> => {
    const response = await apiClient.get('/skills?all=true');
    return response.data?.data || response.data; // Adjust based on backend response wrapper
  },
  
  getById: async (id: string): Promise<Skill> => {
    const response = await apiClient.get(`/skills/${id}`);
    return response.data?.data || response.data;
  },

  create: async (data: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiClient.post('/skills', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Skill>) => {
    const response = await apiClient.put(`/skills/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/skills/${id}`);
    return response.data;
  }
};
