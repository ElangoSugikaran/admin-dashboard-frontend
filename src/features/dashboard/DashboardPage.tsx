import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FolderKanban, 
  MessageSquare, 
  Eye, 
  Award,
  Code2,
  Briefcase,
  RefreshCw,
  type LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { dashboardService, type DashboardOverviewData } from '@/services/api/dashboardService';

const ICON_MAP: Record<string, LucideIcon> = {
  FolderKanban,
  MessageSquare,
  Eye,
  Award,
  Code2,
  Briefcase,
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const overview = await dashboardService.getOverview();
      setData(overview);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const getActivityIcon = (type: string): LucideIcon => {
    switch (type) {
      case 'PROJECT':
        return FolderKanban;
      case 'MESSAGE':
        return MessageSquare;
      case 'CERTIFICATE':
        return Award;
      default:
        return Code2;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's a quick summary of your portfolio.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchDashboard} 
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchDashboard}>Retry</Button>
        </div>
      )}

      {/* 4 Top Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-4 w-4 bg-muted rounded-full" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-7 w-16 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </CardContent>
              </Card>
            ))
          : data?.stats.map((stat) => {
              const Icon = ICON_MAP[stat.icon] || FolderKanban;
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Recent changes across your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 animate-pulse">
                    <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !data?.recentActivity || data.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No recent activity recorded yet.
              </p>
            ) : (
              <div className="space-y-6">
                {data.recentActivity.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start">
                      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background mt-0.5">
                        <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <div className="ml-4 space-y-1 pr-4">
                        <p className="text-sm font-medium leading-none">{activity.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{activity.description}</p>
                      </div>
                      <div className="ml-auto font-medium text-xs text-muted-foreground whitespace-nowrap">
                        {activity.timeAgo}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to do</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button render={<Link to="/projects" />} className="w-full justify-start" variant="outline">
              <FolderKanban className="mr-2 h-4 w-4" />
              Add New Project
            </Button>
            <Button render={<Link to="/messages" />} className="w-full justify-start" variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Check Messages {data?.metrics?.messages?.unread ? `(${data.metrics.messages.unread})` : ''}
            </Button>
            <Button render={<Link to="/settings" />} className="w-full justify-start" variant="outline">
              <Award className="mr-2 h-4 w-4" />
              Update Resume / CV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
