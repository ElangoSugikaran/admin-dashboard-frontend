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

export interface DashboardAnalytics {
  status: 'connected' | 'not_configured' | 'unavailable';
  range: string;
  generatedAt: string;
  totals: { pageViews: number; activeUsers: number; sessions: number };
  daily: Array<{ date: string; pageViews: number; activeUsers: number; sessions: number }>;
  topPages: Array<{ page: string; pageViews: number; activeUsers: number }>;
  sources: Array<{ channel: string; sessions: number; activeUsers: number }>;
  events: Array<{ name: string; count: number }>;
}

export interface DashboardOverviewData {
  stats: DashboardStat[];
  recentActivity: RecentActivityItem[];
  metrics: {
    projects: { total: number; published: number; draft: number; featured: number };
    messages: { unread: number; total: number; newToday: number };
    profileViews: { total: number; trend: string; isTrackingActive: boolean };
    analytics: DashboardAnalytics;
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

let overviewRequest: Promise<DashboardOverviewData> | null = null;

export const dashboardService = {
  getOverview: (): Promise<DashboardOverviewData> => {
    if (!overviewRequest) {
      overviewRequest = apiClient
        .get<{ success: boolean; data: DashboardOverviewData }>('/dashboard')
        .then((response) => response.data?.data || (response.data as unknown as DashboardOverviewData))
        .finally(() => {
          overviewRequest = null;
        });
    }
    return overviewRequest;
  },
};
