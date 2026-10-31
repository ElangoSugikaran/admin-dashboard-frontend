import { apiClient } from '@/lib/api';

export interface DashboardStat {
  title: string;
  value: string;
  icon: 'FolderKanban' | 'MessageSquare' | 'Eye' | 'Award' | 'Code2' | 'Briefcase';
  description: string;
}

export interface RecentActivityItem {
  id: string;
  type: 'PROJECT' | 'MESSAGE' | 'CERTIFICATE' | 'SKILL';
  title: string;
  description: string;
  timeAgo: string;
  timestamp: string;
}

export interface DashboardOverviewData {
  stats: DashboardStat[];
  recentActivity: RecentActivityItem[];
  metrics: {
    projects: { total: number; published: number; draft: number; featured: number };
    messages: { unread: number; total: number; newToday: number };
    profileViews: { total: number; trend: string; isTrackingActive: boolean };
    certificates: { total: number; academic: number; digital: number; visible: number };
    skills: { total: number; showInSkills: number };
  };
  visibilities: {
    showExperience: boolean;
    showCertificates: boolean;
    totalVisibleProjects: number;
    totalVisibleSkills: number;
  };
}

export const dashboardService = {
  getOverview: async (): Promise<DashboardOverviewData> => {
    const response = await apiClient.get<{ success: boolean; data: DashboardOverviewData }>('/admin/dashboard');
    return response.data?.data || (response.data as unknown as DashboardOverviewData);
  },
};
