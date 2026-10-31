import { apiClient } from '@/lib/api';

export interface BrandLogo {
  id: string;
  url: string;
  fileName?: string;
}

export interface SiteSettings {
  id: number;
  experienceFallbackText?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  showExperience: boolean;
  showCertificates: boolean;
  brandLogo: BrandLogo | null;
}

export const settingsService = {
  getSettings: async (): Promise<SiteSettings> => {
    const response = await apiClient.get('/settings');
    return response.data?.data || response.data;
  },

  updateSettings: async (data: { brandLogoId: string | null }): Promise<SiteSettings> => {
    const response = await apiClient.put('/settings', data);
    return response.data?.data || response.data;
  },
};
