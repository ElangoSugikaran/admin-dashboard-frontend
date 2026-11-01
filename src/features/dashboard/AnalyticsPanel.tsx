import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardAnalytics } from '@/services/api/dashboardService';
import { Skeleton } from '@/components/ui/skeleton';
import { LoaderCircle } from 'lucide-react';

interface AnalyticsPanelProps {
  analytics: DashboardAnalytics | null;
  loading: boolean;
}

const numberFormat = new Intl.NumberFormat();

export function AnalyticsPanel({ analytics, loading }: AnalyticsPanelProps) {
  const connected = analytics?.status === 'connected';

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-base sm:text-lg">Visitor analytics</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Aggregate Google Analytics data for the last 30 days
          </CardDescription>
        </div>
        <Badge variant={connected ? 'default' : 'outline'}>
          {loading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-label="Preparing analytics" /> : connected ? 'Connected' : analytics?.status === 'unavailable' ? 'Unavailable' : 'Setup needed'}
        </Badge>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div role="status" aria-label="Preparing analytics" className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-16 rounded-lg" />)}</div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ) : !connected ? (
          <div className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
            {analytics?.status === 'unavailable'
              ? 'Visitor analytics are temporarily unavailable. Try again later.'
              : 'Add the GA4 property ID and service account credentials to the backend environment to show visitor reports.'}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                ['Page views', analytics.totals.pageViews],
                ['Active users', analytics.totals.activeUsers],
                ['Sessions', analytics.totals.sessions],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-xl font-semibold">{numberFormat.format(Number(value))}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <h3 className="mb-3 text-sm font-medium">Daily traffic</h3>
                {analytics.daily.length ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.daily} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5)} />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(value) => numberFormat.format(Number(value))} />
                        <Area type="monotone" dataKey="pageViews" name="Page views" stroke="#6366f1" fill="#6366f1" fillOpacity={0.16} />
                        <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#10b981" fill="#10b981" fillOpacity={0.08} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">No processed traffic data for this period yet.</p>
                )}
              </div>

              <div>
                <h3 className="mb-3 text-sm font-medium">Top pages</h3>
                <div className="space-y-2">
                  {analytics.topPages.length ? analytics.topPages.map((page) => (
                    <div key={page.page} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate text-muted-foreground" title={page.page}>{page.page}</span>
                      <span className="shrink-0 font-medium">{numberFormat.format(page.pageViews)}</span>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No page data yet.</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 border-t border-border/70 pt-5 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-medium">Traffic channels</h3>
                <div className="space-y-2">
                  {analytics.sources.length ? analytics.sources.map((source) => (
                    <div key={source.channel} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-muted-foreground">{source.channel}</span>
                      <span className="shrink-0 font-medium">{numberFormat.format(source.sessions)} sessions</span>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No channel data yet.</p>}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-medium">Tracked actions</h3>
                <div className="space-y-2">
                  {analytics.events.length ? analytics.events.map((event) => (
                    <div key={event.name} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-muted-foreground">{event.name.replaceAll('_', ' ')}</span>
                      <span className="shrink-0 font-medium">{numberFormat.format(event.count)}</span>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No contact or CV events recorded yet.</p>}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Reports are cached for five minutes and may be delayed by Google Analytics processing.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
