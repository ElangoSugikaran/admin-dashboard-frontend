import { apiClient } from '@/lib/api';

export interface ProjectPhase {
  id?: string;
  projectId?: string;
  name: string;
  tasks: string[];
  startDate?: string | null;
  endDate?: string | null;
  sortOrder?: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED';
  featured: boolean;
  sortOrder: number;
  githubUrl?: string;
  liveUrl?: string;
  methodology?: string;
  aim?: string;
  objectives: string[];
  features: string[];
  skillsDemonstrated: string[];
  startedAt?: string;
  completedAt?: string;
  categoryId?: string;
  thumbnailId?: string;
  
  // Relationships
  category?: any;
  thumbnail?: any;
  technologies?: any[];
  media?: any[];
  phases?: ProjectPhase[];
  
  createdAt?: string;
  updatedAt?: string;
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
