import { apiClient } from '@/lib/api';

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string; // Lucide icon or devicon name
  active: boolean;
}

export interface ResumeDocument {
  id: string;
  title: string;
  fileId: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: string;
  isPrimary: boolean;
  uploadedAt: string;
}

export interface AboutMeData {
  id?: string;
  fullName: string;
  title: string;
  tagline?: string;
  bio: string;
  location?: string;
  email: string;
  phone?: string;
  availableForWork: boolean;
  avatar?: {
    id: string;
    url: string;
    fileName?: string;
  } | null;
  introMedia?: {
    id: string;
    url: string;
    fileName?: string;
    type?: 'image' | 'video';
  } | null;
  socialLinks: SocialLink[];
  resumes: ResumeDocument[];
  updatedAt?: string;
}

export const defaultAboutMeData: AboutMeData = {
  fullName: 'John Doe',
  title: 'Full Stack Software Engineer & Cloud Architect',
  tagline: 'Crafting responsive, high-performance web applications and scalable cloud backends.',
  bio: `I am a passionate software developer with extensive experience building modern web applications, distributed systems, and user-centric interfaces. 

With expertise in React, TypeScript, Node.js, and cloud platforms, I specialize in transforming complex business requirements into sleek, robust digital solutions. When I am not coding, I enjoy contributing to open-source software, mentoring aspiring developers, and exploring modern UI design systems.`,
  location: 'Colombo, Sri Lanka',
  email: 'hello@example.com',
  phone: '+94 77 123 4567',
  availableForWork: true,
  avatar: null,
  introMedia: null,
  socialLinks: [
    {
      id: 'social-1',
      platform: 'GitHub',
      url: 'https://github.com',
      icon: 'Github',
      active: true,
    },
    {
      id: 'social-2',
      platform: 'LinkedIn',
      url: 'https://linkedin.com',
      icon: 'Linkedin',
      active: true,
    },
    {
      id: 'social-3',
      platform: 'Twitter / X',
      url: 'https://x.com',
      icon: 'Twitter',
      active: false,
    },
    {
      id: 'social-4',
      platform: 'Portfolio Website',
      url: 'https://example.com',
      icon: 'Globe',
      active: true,
    },
  ],
  resumes: [],
};

export const aboutService = {
  // Fetch About Me data directly from Fastify backend (/api/v1/about)
  getAboutMe: async (): Promise<AboutMeData> => {
    const response = await apiClient.get('/about');
    const data = response.data?.data || response.data;
    return data || defaultAboutMeData;
  },

  // Save or update About Me data via Fastify backend (PUT /api/v1/about)
  updateAboutMe: async (data: AboutMeData): Promise<AboutMeData> => {
    const response = await apiClient.put('/about', data);
    return response.data?.data || response.data;
  },
};
