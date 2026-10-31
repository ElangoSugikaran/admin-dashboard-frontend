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
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  type LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { dashboardService, type DashboardOverviewData } from '@/services/api/dashboardService';
import { AnalyticsPanel } from '@/features/dashboard/AnalyticsPanel';

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

  const getMetricAccent = (index: number) => {
    const accents = [
      'from-blue-500/10 to-indigo-500/5 text-blue-500 border-blue-500/20',
      'from-emerald-500/10 to-teal-500/5 text-emerald-500 border-emerald-500/20',
      'from-amber-500/10 to-orange-500/5 text-amber-500 border-amber-500/20',
      'from-purple-500/10 to-pink-500/5 text-purple-500 border-purple-500/20',
    ];
    return accents[index % accents.length];
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard Overview</h2>
            <Badge variant="outline" className="hidden sm:inline-flex gap-1 text-xs border-primary/30 text-primary">
              <Sparkles className="w-3 h-3" /> Live
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time analytics and management for your portfolio website.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDashboard} 
            disabled={loading}
            className="gap-2 shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchDashboard} className="shrink-0 border-destructive/30">
            Retry
          </Button>
        </div>
      )}

      {/* 4 Top Metric Cards (Fully responsive: 1 col mobile, 2 col tablet, 4 col desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse border-border/80">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-6 w-6 bg-muted rounded-full" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-8 w-16 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </CardContent>
              </Card>
            ))
          : data?.stats.map((stat, idx) => {
              const Icon = ICON_MAP[stat.icon] || FolderKanban;
              const accent = getMetricAccent(idx);
              return (
                <Card 
                  key={stat.title} 
                  className="relative overflow-hidden border-border/80 transition-all duration-200 hover:shadow-md hover:border-border"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${accent} rounded-bl-full pointer-events-none opacity-40 dark:opacity-20`} />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 text-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <AnalyticsPanel analytics={data?.metrics.analytics ?? null} loading={loading} />

      {/* Main Grid: Responsive 1 col on mobile/tablet, 12 cols on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activity Card */}
        <Card className="lg:col-span-7 xl:col-span-8 border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg">Recent Portfolio Activity</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Latest updates, submissions, and content modifications
                </CardDescription>
              </div>
              <Clock className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 animate-pulse py-2">
                    <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !data?.recentActivity || data.recentActivity.length === 0 ? (
              <div className="py-12 text-center">
                <Layers className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium text-foreground">No recent activity</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Actions you take across projects, skills, and messages will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {data.recentActivity.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <div 
                      key={activity.id} 
                      className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0 transition-colors hover:bg-muted/30 px-2 rounded-lg"
                    >
                      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background mt-0.5 shadow-xs">
                        <ActivityIcon className="h-4 w-4 text-primary" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold truncate text-foreground">{activity.title}</p>
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                            {activity.timeAgo}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Overview Stats */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Quick Actions Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Shortcuts to manage your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5">
              <Button 
                render={<Link to="/projects" />} 
                className="w-full justify-between h-10 border-border/80 hover:bg-accent/60" 
                variant="outline"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <FolderKanban className="h-4 w-4 text-primary" />
                  Manage Projects
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>

              <Button 
                render={<Link to="/messages" />} 
                className="w-full justify-between h-10 border-border/80 hover:bg-accent/60" 
                variant="outline"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Check Messages
                </span>
                {data?.metrics?.messages?.unread ? (
                  <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                    {data.metrics.messages.unread} new
                  </Badge>
                ) : (
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </Button>

              <Button 
                render={<Link to="/skills" />} 
                className="w-full justify-between h-10 border-border/80 hover:bg-accent/60" 
                variant="outline"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Code2 className="h-4 w-4 text-primary" />
                  Update Skills & Tech
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>

              <Button 
                render={<Link to="/settings" />} 
                className="w-full justify-between h-10 border-border/80 hover:bg-accent/60" 
                variant="outline"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Award className="h-4 w-4 text-primary" />
                  Hero & Site Settings
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>

          {/* Portfolio Health / Visibility Breakdown */}
          {data?.metrics && (
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-base sm:text-lg">Content Status</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Publishing & visibility status
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Published Projects
                  </span>
                  <span className="font-semibold text-foreground">
                    {data.metrics.projects.published} / {data.metrics.projects.total}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Featured Projects
                  </span>
                  <span className="font-semibold text-foreground">
                    {data.metrics.projects.featured}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-500" />
                    Certifications Active
                  </span>
                  <span className="font-semibold text-foreground">
                    {data.metrics.certificates.total}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-sky-500" />
                    Technical Skills Listed
                  </span>
                  <span className="font-semibold text-foreground">
                    {data.metrics.skills.total}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
